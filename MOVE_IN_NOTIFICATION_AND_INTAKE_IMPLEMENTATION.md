# Move-In Notifications, Reminders, and Intake Implementation

## Scope

This document captures the requested Move-In updates for SMS, email, in-app notifications, richer admin oversight, landlord workflow filtering, guest intake, and preference matching.

The implementation must preserve the existing portal boundaries:

- Public and landlord Move-In traffic uses `/api/move_in`.
- Move-In admin inside the Move-In frontend uses PayServe core-authenticated routes under `/api/core/move_in`.
- Unit listing approval remains admin-controlled.
- Applications, viewing bookings, and reservation requests go directly to landlords.
- Reservations, including confirmed reservations, must not block viewing requests. Only rented or suspended units should block new public actions.
- Shared request helpers such as `makeRequest.js` must not be changed.
- Any Move-In model changes must be kept in sync between `payserve_backend/node_modules/payservedb` and `payserve_db`.

## Findings

### Communication Services

- PayServe already has backend utilities for email and SMS:
  - `payserve_backend/src/utils/send_new_email.js`
  - `payserve_backend/src/utils/send_new_sms.js`
- Move-In should use these services through a Move-In wrapper so call-center content, fallback handling, and audit records are consistent.
- Every reminder must include the call center number: `+254733902550`.
- WhatsApp is a requested reminder channel, but there is no Move-In-specific WhatsApp sender wired into the current Move-In flow. The implementation should store the channel intent and use SMS/email immediately, while keeping the reminder model ready for WhatsApp provider wiring.

### Admin Oversight

- Admin application, reservation, and viewing pages currently show shallow lists and do not expose enough context.
- Each admin row should support a details action that exposes:
  - tenant/prospect details,
  - landlord details,
  - unit and facility details,
  - location and timing,
  - message/notes,
  - reminder history.
- Admin should be able to send a reminder from each row to tenant, landlord, or both through email and SMS/WhatsApp.
- Admin should be able to view reminder history.
- Filters should support:
  - status,
  - search,
  - day of week,
  - date,
  - upcoming-first ordering.

### Landlord Workflow

- Landlords need the same practical filtering for applications, reservations, and viewing bookings.
- Landlords need full row context to act without opening unrelated pages.
- Landlord viewing slots are a supply-side scheduling tool: they define available calendar windows. A guest can also request a preferred date/time without selecting a slot; that remains a pending booking request for landlord response.

### Guest Intake

- The public unit detail page should not always show name, email, and phone fields.
- Applying for a unit should open a modal with:
  - name,
  - phone,
  - email,
  - occupation,
  - date of birth,
  - gender,
  - desired move-in date,
  - required terms checkbox.
- Guest application submission should auto-create a Move-In tenant account if one does not exist and email the generated password.
- Landlord and admin should see all application intake details.
- Reservation and viewing actions should use lighter forms:
  - reservation: name, phone, email, desired move-in date, optional message,
  - viewing: name, phone, email, preferred date/time, optional message.

### Preference Wizard

- The existing preference wizard should be treated as the matching intake.
- Guest preferences should be saved locally and synced after login/register.
- Matching should compare preferences to unit fields used during listing creation: location, area/estate, county, price, bedrooms, bathrooms, type, amenities, landmarks, nearby services, and move-in timing.
- Results should expose a percentage match and reasons.

## Implementation Todo

1. Add a Move-In reminder model in both database packages.
2. Add backend reminder helper functions that use existing PayServe email/SMS services and record reminder outcomes.
3. Add core admin reminder routes:
   - `POST /api/core/move_in/reminders/send`
   - `GET /api/core/move_in/reminders`
4. Enrich admin application/reservation/viewing list responses with tenant, landlord, unit, facility, location, and reminder summaries.
5. Add status/search/day/date/upcoming filters to admin and landlord list APIs.
6. Extend application schema for guest intake fields: occupation, date of birth, gender, terms acceptance, and generated account linkage.
7. Update guest application submission to auto-create a tenant account when needed and email generated credentials.
8. Update public unit detail UI so apply/reserve/viewing each opens the correct modal.
9. Add admin UI controls for details and reminders, including reminder history.
10. Add landlord UI filters and richer details for applications, reservations, and viewings.
11. Run backend tests and a frontend build or focused syntax checks.

## Notes For Future Work

- Automatic reminders should be scheduled through a backend cron/worker. This pass creates the reminder records and manual-send endpoint; a scheduler can query upcoming pending bookings/reservations and create system reminders.
- WhatsApp delivery should use a configured provider before being treated as a sent channel. Until then, reminder history should not falsely mark WhatsApp as delivered.
- Preference matching can later be strengthened with weighted scoring per tenant segment.
