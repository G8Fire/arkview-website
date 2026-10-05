// Booking request form: preselects the package from ?package=... and
// submits to the serverless function, which writes to Airtable.
const ENDPOINT = "/.netlify/functions/booking";

const form = document.getElementById("booking-form");
const statusEl = document.getElementById("form-status");
const packageSelect = document.getElementById("package");

const requested = new URLSearchParams(window.location.search).get("package");
if (requested && [...packageSelect.options].some((o) => o.value === requested)) {
  packageSelect.value = requested;
}

function showStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = `form__status is-${type}`;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const button = form.querySelector('button[type="submit"]');
  const data = Object.fromEntries(new FormData(form));

  button.disabled = true;
  button.textContent = "Sending…";

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || "Something went wrong.");

    form.reset();
    showStatus(
      "Thanks! Your booking request was received. We'll reach out shortly to schedule a date and time.",
      "success"
    );
  } catch (err) {
    showStatus(
      `${err.message} Please try again, or contact us directly by phone or email.`,
      "error"
    );
  } finally {
    button.disabled = false;
    button.textContent = "Send Booking Request";
  }
});
