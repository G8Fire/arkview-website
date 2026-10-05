// Receives booking requests from book.html and saves them to Airtable.
//
// Airtable layout (see docs/AIRTABLE_SETUP.md):
//   Customers: First Name, Last Name, Email, Phone, Company, Bookings (link)
//   Bookings:  Package, Customer (link), Location, Preferred Timeframe,
//              Contact Method, Notes, Status
//
// Required environment variables (set in Netlify, never in code):
//   AIRTABLE_TOKEN    personal access token with data.records:read/write
//   AIRTABLE_BASE_ID  the base id, starts with "app"

const API = "https://api.airtable.com/v0";
const CUSTOMERS = "Customers";
const BOOKINGS = "Bookings";

const json = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const clean = (value, max = 1000) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

async function airtable(path, options = {}) {
  const res = await fetch(`${API}/${process.env.AIRTABLE_BASE_ID}/${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
      "Content-Type": "application/json",
    },
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(`Airtable ${res.status}: ${JSON.stringify(body.error || body)}`);
  }
  return body;
}

// Reuse the existing customer record when the email matches, so repeat
// customers keep all their bookings under one record.
async function findOrCreateCustomer(customer) {
  const email = customer.Email.toLowerCase().replace(/[\\']/g, "");
  const formula = encodeURIComponent(`LOWER({Email}) = '${email}'`);
  const found = await airtable(
    `${encodeURIComponent(CUSTOMERS)}?maxRecords=1&filterByFormula=${formula}`
  );

  if (found.records.length) {
    const existing = found.records[0];
    // Keep contact info current with the latest request.
    await airtable(`${encodeURIComponent(CUSTOMERS)}/${existing.id}`, {
      method: "PATCH",
      body: JSON.stringify({ fields: customer, typecast: true }),
    });
    return existing.id;
  }

  const created = await airtable(encodeURIComponent(CUSTOMERS), {
    method: "POST",
    body: JSON.stringify({ fields: customer, typecast: true }),
  });
  return created.id;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed." });
  }
  if (!process.env.AIRTABLE_TOKEN || !process.env.AIRTABLE_BASE_ID) {
    console.error("Missing AIRTABLE_TOKEN or AIRTABLE_BASE_ID");
    return json(500, { error: "Booking system is not configured yet." });
  }

  let data;
  try {
    data = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "Invalid request." });
  }

  // Honeypot: real visitors never see or fill this field.
  if (clean(data.website)) {
    return json(200, { ok: true });
  }

  const form = {
    package: clean(data.package, 200),
    firstName: clean(data.firstName, 100),
    lastName: clean(data.lastName, 100),
    email: clean(data.email, 200),
    phone: clean(data.phone, 50),
    company: clean(data.company, 200),
    location: clean(data.location, 300),
    timeframe: clean(data.timeframe, 100),
    contactMethod: clean(data.contactMethod, 50),
    notes: clean(data.notes, 5000),
  };

  const required = ["package", "firstName", "lastName", "email", "phone", "location"];
  if (required.some((key) => !form[key])) {
    return json(400, { error: "Please fill out all required fields." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    return json(400, { error: "Please enter a valid email address." });
  }

  try {
    const customerFields = {
      "First Name": form.firstName,
      "Last Name": form.lastName,
      Email: form.email,
      Phone: form.phone,
    };
    if (form.company) customerFields.Company = form.company;

    const customerId = await findOrCreateCustomer(customerFields);

    await airtable(encodeURIComponent(BOOKINGS), {
      method: "POST",
      body: JSON.stringify({
        typecast: true,
        fields: {
          Package: form.package,
          Customer: [customerId],
          Location: form.location,
          "Preferred Timeframe": form.timeframe || "No preference",
          "Contact Method": form.contactMethod,
          Notes: form.notes,
          Status: "New Request",
        },
      }),
    });

    return json(200, { ok: true });
  } catch (err) {
    console.error(err);
    return json(502, { error: "We couldn't save your request right now." });
  }
};
