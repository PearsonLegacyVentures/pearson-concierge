# Pearson Concierge

A lightweight, mobile-first concierge enquiry website for The Bahamas.

## Run

The site is plain HTML/CSS/JavaScript with no runtime packages. Open `index.html` locally or serve it from a static HTTP server. Run `npm run check` to test the inquiry handler and generate `dist/`.

## Deploy — Cloudflare Pages

1. Connect GitHub repository `PearsonLegacyVentures/pearson-concierge` to Cloudflare Pages.
2. Set **Build command** to `npm run build` and **Output directory** to `dist`.
3. Configure the Pages project environment variables/secrets below. The `functions/api/inquiry.js` Cloudflare Pages Function is deployed from the root `functions/` directory.
4. Verify the Resend sender domain before enabling the form. Submit a **real test enquiry** to verify delivery; check spam folder and reply flow.
5. Connect the business's chosen domain, confirm ownership, then update Open Graph URL metadata and consider adding a sitemap with that verified domain.

### Required environment variables for enquiries

| Variable | Meaning |
|---|---|
| `RESEND_API_KEY` | Resend API credential, stored as a secret |
| `LEAD_TO_EMAIL` | Actual monitored team inbox |
| `LEAD_FROM_EMAIL` | Sender address on a verified sending domain, e.g. `Pearson Concierge <requests@your-verified-domain.example>` |

Without these values, the form **does not claim success** and provides a copy-request fallback. **No email addresses or phone numbers have been invented or hardcoded.**

## Scope

Five enquiry categories: yachts/island experiences, wellness, private dining, transfers, and villa preparations. Every service is **on request**, with supplier confirmation and pricing before bookings. There is no payment processing, direct booking, account system, analytics tracking, or fabricated social proof.

## Before accepting public enquiries

- Connect the email provider and complete an end-to-end send/reply test.
- Confirm business contact details, terms, privacy retention, supplier vetting and commission arrangements.
- Implement edge rate limiting and (if traffic warrants) Cloudflare Turnstile.
- Replace editorial licensed stock/Unsplash photographs with approved owned project imagery where available. They are illustrative, not proof of suppliers or completed bookings.
- Test network image loading on the public deployment; remote third-party photos require live connectivity.

## Tests

`npm test` covers input validation, honeypot, origin restrictions, missing provider configuration, expected mail payload, provider success, and unsupported requests. `npm run build` assembles the deployable static output.