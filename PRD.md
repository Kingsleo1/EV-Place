# EV Place Limited — Product Requirements Document

Version 0.1 · Initial product baseline · October 2026

## 1. Product vision
EV Place Limited is a consolidated electric-mobility marketplace and service hub connecting customers with electric vehicles, EV spare parts, portable and home battery storage, guided diagnostic assistance, and technician services. The experience should feel premium, trustworthy, modern and easy to use on mobile and desktop.

## 2. Brand and UX requirements
- Dark mode is the default, with a user-accessible light-mode toggle.
- Near-black/forest surfaces, electric emerald accents, restrained cyan highlights, strong typography and generous spacing.
- Responsive layouts, keyboard-visible focus, labelled controls, useful empty states and clear actions.
- Use approved EV Place logo assets when binary assets are uploaded to the repository.
- Clearly label sample inventory, prices, specifications, battery-health claims and compatibility until verified.

## 3. User groups
1. New EV shoppers.
2. Fairly used / certified pre-owned EV shoppers.
3. EV owners and repairers sourcing parts.
4. Households and businesses evaluating backup battery systems.
5. Drivers seeking diagnostic guidance or technician support.
6. Sales, inventory, operations, service and administrator staff.

## 4. Customer-facing requirements

### 4.1 Discovery and navigation
- Persistent responsive navigation to Showroom, Spare Parts, Backup Batteries, EV Doctor and Technicians.
- Search, category shortcuts, My Garage, enquiry list and theme switch.
- Clear mobile navigation and accessible interactive controls.

### 4.2 Vehicle showroom
- Show make, model, model year, price, condition, images and specifications.
- Filters for condition and make, plus text search.
- Specification fields: battery capacity in kWh, estimated range in km, acceleration (0–100 km/h), DC charging power in kW, connector, drivetrain and warranty.
- Used listings can show battery State of Health (SoH), mileage, inspection date/evidence and remaining warranty when verified.
- Save/favourite, comparison, enquiry and reservation journeys.
- Clearly identify indicative pricing and verify actual local availability, import costs and delivery terms.

### 4.3 EV parts marketplace
- Categories: high-voltage and charging, thermal management, drivetrain and motors, suspension and brakes, electronics and 12V systems.
- Fields: title, manufacturer, OEM reference, SKU, price, stock, photos, condition, warranty, shipping and compatible make/model/year/trim.
- Search, category filtering, fitment enquiry and enquiry-list actions.
- VIN-assisted fitment is a future integration. Never represent compatibility as confirmed without validated data or human review.
- High-voltage components require appropriate handling and safety guidance.

### 4.4 Backup batteries and portable power
- Filter by energy capacity in kWh (e.g. 3, 5, 10, 15 and 20+ kWh).
- Display chemistry (LFP/NMC), continuous and peak output in kW, nominal/usable capacity, weight, dimensions, warranty, connectors and price.
- Explain range estimates and assumptions. Do not conflate kWh (energy) and kW (power).
- Suitability for home backup, portable use and vehicle charging must follow manufacturer guidance.

### 4.5 EV Doctor
- Collect symptoms, warning lights/codes, vehicle details and relevant context.
- Ask clarifying questions and return a preliminary summary, possible causes, urgency category and next steps.
- Recommend parts only when fitment is sufficiently established.
- Allow users to review a summary before sharing it with a technician.
- Safety: never instruct unqualified users to open or repair high-voltage systems. For smoke, fire, suspected battery damage, isolation faults or severe overheating, advise stopping use, moving away when safe and contacting qualified/emergency help.
- The current UI is a demonstration triage flow, not live AI, OBD scanning or a definitive diagnosis. Production AI needs a secured server-side endpoint, evaluation, rate limiting and safety review.

### 4.6 Technician requests
- Capture name, phone, location, vehicle make/model/year, service type and issue description.
- Service types include inspection, on-site repair, towing/battery assistance, charging support and maintenance.
- Carry over a user-reviewed diagnostic summary when available.
- Generate a formatted WhatsApp message to the configured business number; the customer must explicitly send it.
- Production workflow should persist requests, assign a reference, notify authorized staff, track status, record consent and maintain an audit trail.

### 4.7 Enquiry list
- Collect vehicle, parts and battery enquiries together.
- Show items, indicative total, remove actions and a WhatsApp enquiry.
- A WhatsApp enquiry is not a completed order or payment.
- Future checkout needs inventory reservation, order confirmation, delivery/collection, payment state and cancellation/refund rules.

## 5. Administration and operations
The production admin suite should provide:
- Overview metrics for leads, orders, stock, service requests and sales.
- Vehicle, parts and battery CRUD with image uploads, pricing, stock, status and validation.
- Customer profiles, garages and enquiry history.
- Order pipeline: new enquiry, awaiting confirmation, reserved, payment pending, confirmed, fulfilled or cancelled.
- Technician dispatch and service-status workflow.
- Content management for hero banners, categories, featured inventory, promotions and contact details.
- Staff roles and least-privilege access.
- Audit logs for price, inventory, access, order and dispatch changes.
- CSV import/export with validation and duplicate handling.
- Search, filters, pagination, loading, empty, error and success states.

## 6. Proposed roles
- Customer: manage own profile, garage, favourites, enquiries and service requests.
- Sales: manage assigned leads, enquiries, quotes and follow-up.
- Inventory manager: manage catalogue, stock and fitment metadata.
- Technician/dispatcher: view assigned service requests and update progress.
- Content editor: manage public copy, banners and merchandising.
- Administrator: manage configuration and authorized roles, with sensitive actions audited.
Authorization must be enforced server-side, not only by hiding UI controls.

## 7. Proposed data model
- profiles: identity, contact details, status and role.
- garages: user ID, make, model, year, trim and optional protected VIN.
- vehicles: make/model/year, condition, price, specifications, photos, status, inspection and SoH evidence.
- parts: SKU, OEM reference, category, price, stock and fitment relations.
- part_fitments: part ID, make/model/year/trim, source and verification status.
- energy_products: capacity, chemistry, output, connectors, warranty and price.
- favourites: user and product reference.
- enquiries: customer, line items, status, source and communications.
- orders: order number, customer, item snapshot, amount, payment and fulfilment status.
- service_requests: customer, vehicle, location, issue, priority, assignment and status.
- diagnostic_reports: consented symptom summary, recommendations, disclaimer and creation date.
- content_sections: configurable homepage and merchandising content.
- audit_logs: actor, action, affected record, timestamp and safe metadata.

Apply row-level security or equivalent controls. Minimize storage of VIN/location data, define retention rules and never expose secrets in browser code.

## 8. Technical architecture
### Current prototype
- React 18, Vite and JavaScript.
- Lucide React icons.
- Responsive CSS and local component state.
- Demonstration inventory and WhatsApp deep links.
- No backend dependency yet.

### Recommended production direction
- React frontend with maintained build tooling.
- Supabase/PostgreSQL or equivalent managed database and authentication.
- Server-side authorization, secure secret management and object storage.
- Server-side AI endpoint with safety controls and rate limits.
- Payment integration only after business requirements and provider are agreed.
- Monitoring, error reporting, backups and environment separation.

## 9. Security, privacy and trust
- Validate inputs on the server and enforce role permissions.
- Audit sensitive administrative actions.
- Protect contact, location and VIN data.
- Never put API keys or service-role credentials in browser code.
- Obtain consent before sharing personal data with WhatsApp or other third parties.
- Distinguish sample content from verified inventory.
- Publish privacy, terms, returns, warranty and safety information before launch.
- Use secure transport, dependency scanning, backups and incident-handling procedures.

## 10. Accessibility and performance
- Semantic landmarks, labelled controls, keyboard navigation and visible focus.
- Adequate contrast in both themes and mobile-sized touch targets.
- Responsive typography and optimized, rights-cleared images.
- Loading, empty, error and success states for data-driven screens.
- Avoid layout shifts and do not disable mobile zoom.
- Test performance on representative mobile devices.

## 11. Success metrics
Track privacy-conscious aggregate measures: product views, search-to-enquiry conversion, enquiry completion, response time, fitment-enquiry rate, service response time, inventory accuracy, mobile performance, accessibility defects and application errors.

## 12. Acceptance criteria
1. Visitors can browse vehicles, parts and energy products on mobile and desktop.
2. Vehicle condition, make, search and category filters update results.
3. Users can add and remove items from an enquiry list.
4. Theme switching does not break the layout.
5. Technician requests validate required fields and generate a readable WhatsApp message.
6. Diagnostic output is labelled preliminary and gives safety guidance for high-risk symptoms.
7. Energy capacity is expressed in kWh and output power in kW.
8. Used-car battery health appears only when supplied and verified.
9. Part fitment is not falsely described as a confirmed VIN lookup.
10. Production admin routes and data are protected by server-enforced permissions.
11. Production inventory and service requests persist to a database with audit history.
12. Build, accessibility, responsive, security and end-to-end checks pass before launch.

## 13. Delivery phases
- Phase 1 — Prototype: storefront, themes, sample catalogue, garage, enquiry list, preliminary diagnostic UI and WhatsApp hand-off.
- Phase 2 — Platform foundation: database, authentication, profiles, role model and admin shell.
- Phase 3 — Operations: catalogue CRUD, inventory, enquiries, orders and service dispatch.
- Phase 4 — Trust and intelligence: verified fitment, inspection evidence, production diagnostic service and analytics.
- Phase 5 — Launch readiness: security, accessibility, performance, backup/restore, policies and user acceptance testing.

## 14. Decisions needed before production
- Confirm business contact number and service coverage.
- Confirm currency, pricing rules, delivery/import assumptions and tax treatment.
- Confirm inventory sources, inventory owners and fitment-data providers.
- Confirm online payment versus sales-assisted payment.
- Confirm authentication methods and staff roles.
- Confirm hosting/database account, privacy policy and retention requirements.
- Approve official logo assets and product-photography rights.
