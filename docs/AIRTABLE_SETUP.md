# Airtable Setup (Customer Database)

Booking requests from the website are saved into Airtable automatically. Each
request creates a **Booking** and links it to a **Customer**. If the same email
books again, the new booking is added to the existing customer instead of
creating a duplicate.

## 1. Create an account and base

1. Sign up for free at <https://airtable.com>.
2. Create a new base from scratch and name it **ArkView**.

## 2. Create the `Customers` table

Rename the default table to exactly `Customers` and set up these fields
(names must match exactly, including capitalization):

| Field name   | Field type        |
|--------------|-------------------|
| First Name   | Single line text  |
| Last Name    | Single line text  |
| Email        | Email             |
| Phone        | Phone number      |
| Company      | Single line text  |

Tip: you can change the primary (first) field into a formula such as
`{First Name} & " " & {Last Name}` so customers show by full name.

## 3. Create the `Bookings` table

Add a second table named exactly `Bookings`:

| Field name          | Field type                                   |
|---------------------|----------------------------------------------|
| Package             | Single line text (or Single select)          |
| Customer            | Link to another record → `Customers`         |
| Location            | Single line text                             |
| Preferred Timeframe | Single line text (or Single select)          |
| Contact Method      | Single select (Phone call, Text, Email)      |
| Notes               | Long text                                    |
| Status              | Single select (see below)                    |
| Scheduled Date      | Date (with time) — you fill this in          |
| Price               | Currency — you fill this in                  |
| Requested At        | Created time                                 |

Suggested **Status** options: `New Request`, `Contacted`, `Scheduled`,
`Completed`, `Delivered`, `Cancelled`. New website requests arrive as
`New Request`.

Creating the `Customer` link also adds a `Bookings` field to `Customers`, so
you can see each customer's full booking history.

## 4. Create an access token

1. Go to <https://airtable.com/create/tokens> → **Create token**.
2. Name it `ArkView Website`.
3. Scopes: `data.records:read` and `data.records:write`.
4. Access: choose the **ArkView** base only.
5. Copy the token (starts with `pat`). You only see it once.

## 5. Find your base ID

Open the base in your browser. The URL looks like
`https://airtable.com/appXXXXXXXXXXXXXX/...`. The part starting with `app` is
your base ID.

## 6. Add them to Netlify

In Netlify: **Site configuration → Environment variables** and add:

- `AIRTABLE_TOKEN` = your token
- `AIRTABLE_BASE_ID` = your base ID

Redeploy the site. Never put the token in the website's code; it stays on
Netlify's server so visitors can't see it.

## Getting notified of new requests

In Airtable, open **Automations** → trigger **When a record is created** in
`Bookings` → action **Send email** (or a mobile push via the Airtable app) so
you're alerted as soon as a request comes in.
