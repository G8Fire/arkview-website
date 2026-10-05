# ArkView Website

Website for ArkView: real estate photography, drone photo and video, event
coverage, and other drone services. Customers pick a package and send a
booking request; requests are saved to Airtable as a customer database, and
ArkView follows up to schedule the date and time.

## Structure

```
index.html        Home
services.html     Services & packages (each package links to the booking form)
portfolio.html    Filterable gallery
about.html        About
book.html         Booking request form
css/styles.css    All styles (brand colors are variables at the top)
js/main.js        Mobile menu, portfolio filters
js/booking.js     Booking form submission
netlify/functions/booking.js   Saves requests to Airtable (keeps the API key private)
docs/AIRTABLE_SETUP.md         How to set up the Airtable base
```

## Running locally

Static pages: open `index.html` or run `python3 -m http.server`.

To test the booking form end-to-end, use the Netlify CLI so the function runs
too:

```
npm install -g netlify-cli
cp .env.example .env   # fill in your Airtable values
netlify dev
```

## Deploying

1. Push to GitHub and import the repo in [Netlify](https://app.netlify.com)
   (free tier). No build command is needed.
2. Follow `docs/AIRTABLE_SETUP.md` and set `AIRTABLE_TOKEN` and
   `AIRTABLE_BASE_ID` in Netlify's environment variables.

## To-do before launch

- Real package prices (currently `$XXX` in `services.html`)
- Contact email/phone in the footer of each page
- Photos: `images/hero.jpg`, `images/about.jpg`, and portfolio images
  (see comments in `portfolio.html`)
