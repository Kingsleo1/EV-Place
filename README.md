# EV Place Limited

Premium electric-mobility marketplace and service hub built with React and Vite.

## Run locally

Requirements: Node.js 18 or newer.

1. Run `npm install`.
2. Run `npm run dev`.
3. Run `npm run build` to create a production bundle.

## Prototype features

- Dark-first theme with a light-mode toggle
- Responsive EV showroom with new/used and make filters
- Vehicle cards with sample specifications and enquiry actions
- EV spare-parts catalogue and compatibility enquiry
- Battery storage products filtered by kWh capacity
- Preliminary EV Doctor symptom triage
- Technician request form with WhatsApp message generation
- My Garage vehicle profile and VIN field
- Enquiry list/cart

## Important limitations

This is a frontend prototype. Product data, prices, specifications and remote image URLs are demonstration content and must be validated before launch. Authentication, database persistence, payments, live stock, VIN decoding, live AI/OBD diagnostics and the protected admin dashboard are not yet implemented. EV Doctor is informational only and not a substitute for professional diagnosis. WhatsApp links open a prefilled message for the customer to send; they do not silently send messages.

The supplied PNG brand artwork should be uploaded as `public/logo.png` and `public/favicon.png` when binary file upload is available. The current header uses a vector bolt mark and the favicon is a lightweight SVG.
