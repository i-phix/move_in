# Move-In And PayServe Landlord Integration

## Purpose

Move-In should act as the public rental marketplace and rental-intake workflow for PayServe, while PayServe remains the operational property-management system for PayServe landlords and property managers.

The integration must support two landlord types:

- **Non-PayServe landlords**: landlords who exist only inside Move-In.
- **PayServe landlords**: landlords who already exist in PayServe and interact with Move-In through `move_in`, `landlord_main`, and `app_main`.

## Systems Involved

- `Main2/move_in`: public tenant portal, standalone Move-In landlord portal, Move-In admin portal.
- `Main2/landlord_main`: PayServe landlord portal for landlords who already own or manage PayServe units.
- `Main2/app_main`: PayServe property-management portal for property managers and facility operators.
- `Main2/payserve_backend`: shared backend API layer.
- `Main2/payserve_db` and `Main2/payserve_backend/node_modules/payservedb`: shared data models that must stay in sync.

## Landlord Types

### Non-PayServe Landlords

Non-PayServe landlords live only in Move-In.

Move-In owns their full workflow:

1. Landlord registers in Move-In.
2. Landlord creates units in Move-In.
3. Move-In admin approves listings.
4. Public tenants apply, reserve, book viewings, and message.
5. Landlord responds from Move-In.
6. Move-In creates deal and commission records.
7. Move-In handles tenant-facing handover progress.

### PayServe Landlords

PayServe landlords already exist in PayServe.

They may access Move-In functionality from:

1. `landlord_main`
2. `app_main`
3. `move_in`

PayServe remains the source of truth for:

- facilities
- units
- landlord ownership
- tenants/customers
- leases
- invoices
- payments
- operational handovers

Move-In owns:

- public marketplace listing
- listing approval state
- tenant/guest applications
- viewing bookings
- reservation requests
- messages
- Move-In deal tracking
- Move-In commission tracking
- tenant-facing rental journey visibility

## Core Integration Principles

1. PayServe units should not be duplicated as independent Move-In units.
2. Move-In records should reference PayServe records using `facilityId`, `unitId`, and landlord identifiers.
3. PayServe facility-specific data access must always use the correct tenant/facility database model through the existing multi-tenant patterns.
4. Only unit listing publication should require Move-In admin approval.
5. Applications, reservations, bookings, and messages should go directly to the landlord or property manager.
6. Once a tenant decides to rent, PayServe should own the operational conversion into customer, lease, billing, and handover records.
7. Move-In commission should be created from the confirmed rental event and later integrated with PayServe payment/billing.

## Required Data Mapping

PayServe landlords need a stable identity bridge into Move-In.

Each PayServe landlord mapping should track:

- PayServe user/customer ID
- Move-In landlord ID
- landlord email and phone
- source: `payserve`
- enabled/suspended status
- accessible facilities
- owned or managed units
- created/updated timestamps

Each PayServe-backed Move-In listing should track:

- source: `payserve`
- facility ID
- unit ID
- PayServe landlord ID
- Move-In landlord ID
- public listing status
- admin approval status
- listing metadata snapshot
- last synced timestamp

## End-To-End Flow

### 1. Landlord Identity

When a PayServe landlord enters Move-In from `landlord_main`, the backend should:

1. Validate the PayServe JWT.
2. Confirm the user is a landlord.
3. Find or create the matching Move-In landlord account.
4. Link the PayServe user/customer ID to the Move-In landlord ID.
5. Issue a Move-In handoff token.
6. Redirect or open the Move-In landlord workspace.

### 2. Unit Eligibility

Before a PayServe unit can be listed on Move-In, the backend should confirm:

- unit exists in the correct facility database
- unit has a landlord/home owner
- unit is active or available
- unit has no active tenant
- unit has required listing data
- unit has at least one image
- unit has rent/price information
- unit has usable location data

### 3. Listing Submission

PayServe landlord or property manager can submit an eligible unit to Move-In from:

- `landlord_main`
- `app_main`

The submission creates or updates a Move-In listing reference, not a duplicate PayServe unit.

The listing becomes:

- `draft` if incomplete
- `pending_review` when submitted
- `approved` after Move-In admin approval
- `rejected` if admin requires changes
- `suspended` if admin disables it
- `rented` once converted to an active rental

### 4. Admin Approval

Move-In admin reviews listing submissions.

Admin can:

- approve
- reject with reason
- suspend
- unlist
- override public price where permitted
- request missing data

Admin approval publishes the listing to the public Move-In marketplace.

### 5. Tenant Discovery

Tenants and guests browse public Move-In listings.

They can:

- filter by location, price, bedrooms, amenities, landmarks, and nearby services
- view images and details
- apply for a unit
- reserve a unit
- book a viewing
- send a message

Login should not be required for initial application, reservation, or viewing request.

### 6. Landlord Response

For PayServe-backed listings, applications, reservations, viewings, and messages should appear in:

- `move_in` landlord workspace
- `landlord_main` Move-In section
- `app_main` where property managers manage the facility

The landlord or property manager can:

- accept
- reject
- cancel
- reschedule
- send custom email/message
- convert to rental

Each action should create:

- status update
- audit entry
- in-app notification
- email notification

### 7. Convert To Rental

When the tenant decides to rent:

1. Move-In confirms the deal.
2. Backend checks whether the tenant already exists in PayServe.
3. If missing, PayServe customer is created from Move-In tenant/guest details.
4. PayServe lease creation is started or completed.
5. PayServe unit is assigned to the tenant.
6. Unit occupancy/status is updated in PayServe.
7. Initial rent/deposit invoice flow is triggered where configured.
8. Move-In commission is created.
9. Handover/checklist workflow is started in PayServe.
10. Tenant-facing Move-In progress is updated.

This conversion must be guarded carefully because it touches multiple operational systems.

### 8. Commission

Move-In commission should be created when a rental is confirmed.

Commission status should support:

- pending
- invoiced
- paid
- failed
- waived
- disputed

PayServe payment integration should be added last so existing PayServe billing and payment flows are not disturbed.

### 9. Handover

For PayServe-backed rentals, operational handover belongs in PayServe.

Move-In should display tenant-facing progress:

- lease pending
- payment pending
- handover scheduled
- handover completed
- moved in

## Backend Implementation Order

1. Finalize PayServe landlord mapping model.
2. Add reusable PayServe landlord/facility/unit resolver.
3. Add PayServe-backed listing reference model or extend existing listing records safely.
4. Add listing submission endpoints for `landlord_main` and `app_main`.
5. Add listing approval and sync behavior in Move-In admin.
6. Route applications, reservations, viewings, and messages to mapped PayServe landlords/property managers.
7. Add rental conversion endpoint for PayServe-backed units.
8. Link conversion to PayServe customer, lease, unit occupancy, and handover flows.
9. Create Move-In commission records.
10. Add PayServe payment integration for commission as the final stage.

## Frontend Implementation Order

1. Add Move-In entry points to `landlord_main`.
2. Add Move-In listing controls to `app_main` unit management.
3. Add Move-In status visibility in both PayServe portals.
4. Add missing listing metadata forms for photos, landmarks, services, amenities, and public descriptions.
5. Add landlord/property-manager screens for applications, reservations, bookings, and messages.
6. Add rental conversion UI.
7. Add handover and payment status visibility.
8. Keep Move-In admin as the oversight and approval workspace.

## Consistency Requirements

- Do not modify portal `makeRequest` utilities.
- Use each portal's `utils/urls.js` for route constants.
- Follow the existing backend route grouping per portal.
- Use multi-tenant facility models correctly.
- Keep `payserve_db` and backend `node_modules/payservedb` model changes in sync.
- Avoid breaking existing PayServe unit, lease, invoice, and handover behavior.

## Frontend Findings

### `move_in`

The Move-In frontend already contains the public tenant/guest marketplace, tenant portal, landlord portal, and admin portal.

Current relevant areas:

- public listings and listing details
- guest application, reservation, and viewing request flows
- tenant dashboard, applications, reservations, viewings, messages, notifications
- landlord dashboard, units, applications, viewings, reservations, messages
- admin overview, listings, applications, customers, landlords, reservations, analytics, commissions

The Move-In frontend should remain the public rental experience and the dedicated Move-In workspace.

### `landlord_main`

The PayServe landlord portal already has an early Move-In module:

- `src/components/portal/move_in/my_listings.js`
- `src/components/portal/move_in/list_unit.js`
- `src/components/portal/move_in/bookings.js`
- `src/components/portal/move_in/performance.js`
- `src/components/portal/move_in/messages.js`
- `src/components/portal/move_in/viewing_slots.js`

It also already has Move-In URLs in `src/utils/urls.js`, including:

- Move-In handoff
- Move-In units
- available units
- list/update unit
- bookings
- performance
- viewing slots
- messaging

This means `landlord_main` is the closest PayServe portal to being integration-ready.

### `app_main`

The property-management portal currently has strong facility operations, but no dedicated Move-In section yet.

Relevant existing areas:

- unit management
- customer/tenant management
- lease management
- lease invoices
- handover management
- property-management units
- booking management

Move-In integration for `app_main` should be added around facility unit management and lease conversion, not as a disconnected standalone page only.

## Required UI Changes By Repo

### `move_in` UI Changes

Move-In should show PayServe-backed units cleanly without exposing confusing backend source details to tenants.

Required changes:

1. Public listing cards must support both standalone Move-In units and PayServe-backed units.
2. Listing details must show complete location, landmarks, nearby services, amenities, house rules, and landlord/property-manager contact pathway.
3. Application, reservation, and viewing forms must work for guests and logged-in tenants.
4. For PayServe-backed listings, tenant actions must route to the mapped PayServe landlord/property manager.
5. Tenant dashboard should show source-neutral progress:
   - applied
   - viewing requested
   - reservation pending
   - approved
   - lease pending
   - payment pending
   - handover scheduled
   - moved in
6. Landlord workspace should clearly distinguish:
   - Move-In-only units
   - PayServe-backed units
7. Admin listing table should expose source, facility, landlord, unit, approval status, public status, and data completeness.
8. Admin should have oversight actions:
   - approve
   - reject
   - suspend
   - unlist
   - edit public metadata
   - view linked PayServe references
9. Admin commissions UI should show whether a commission came from a standalone Move-In rental or a PayServe-backed rental.

### `landlord_main` UI Changes

`landlord_main` should become the PayServe landlord's main Move-In operating surface.

Required changes:

1. Add a clear Move-In navigation group in the landlord sidebar/dashboard.
2. Replace generic "List a Unit" behavior with a PayServe-unit-first flow:
   - select existing owned PayServe unit
   - check eligibility
   - fill missing public listing data
   - upload photos
   - submit for Move-In approval
3. `My Move-In Listings` should show:
   - unit name
   - facility
   - location
   - source
   - approval status
   - public listing status
   - completeness score
   - latest tenant activity
4. Add action buttons with icon-first behavior:
   - edit listing
   - manage photos
   - submit for approval
   - unlist
   - open in Move-In
5. Applications page should support:
   - accept
   - reject
   - message
   - convert to rental
6. Reservations page should support:
   - confirm
   - cancel
   - reschedule
   - message
   - convert to rental
7. Viewings page should support:
   - create slot
   - cancel slot
   - accept booking
   - reschedule booking
   - message tenant
8. Messages should use the same conversation model as Move-In so tenant/landlord communication stays synchronized.
9. Performance page should show listing views, applications, bookings, reservations, conversion rate, and commission status.
10. Handoff to the Move-In portal should remain available, but the landlord should not need to leave `landlord_main` for routine work.

### `app_main` UI Changes

`app_main` should support property managers listing facility units and converting successful Move-In tenants into operational PayServe records.

Required changes:

1. Add Move-In columns/actions to facility unit management:
   - Move-In status
   - approval status
   - public listing status
   - listing completeness
   - latest activity
2. Add unit action:
   - "List on Move-In"
   - "Edit Move-In listing"
   - "Submit for approval"
   - "Unlist from Move-In"
   - "View public listing"
3. Add a Move-In listing setup drawer/dialog for facility units:
   - public title
   - rent/price
   - bedrooms
   - bathrooms
   - floor area
   - city/area
   - address
   - landmarks
   - nearby services
   - amenities
   - rules
   - description
   - photos
4. Add a facility-level Move-In dashboard:
   - listed units
   - pending approvals
   - tenant enquiries
   - viewings
   - reservations
   - conversions
   - commissions
5. Add Move-In tenant intake queue:
   - applications
   - reservations
   - viewing requests
   - messages
6. Add conversion UI:
   - review tenant/guest details
   - create or link PayServe customer
   - create lease
   - assign unit
   - create deposit/rent invoice where configured
   - start move-in handover
7. Lease creation should be able to receive prefilled data from a Move-In deal:
   - tenant name/email/phone
   - facility
   - unit
   - rent
   - deposit
   - move-in date
   - landlord
8. Handover management should display when a handover originated from Move-In.
9. Customer records should show if the customer came through Move-In.
10. Reporting should allow filtering by Move-In-sourced rentals.

## Cross-Repo UI Consistency Rules

1. Use each portal's existing layout, table, dialog, toast, and route patterns.
2. Do not import components across portals directly unless a shared package already exists.
3. Use each portal's own `makeRequest` utility.
4. Add all backend route constants to each portal's `src/utils/urls.js`.
5. Keep wording consistent:
   - "List on Move-In"
   - "Submit for approval"
   - "Awaiting approval"
   - "Public listing"
   - "Convert to rental"
   - "Move-In commission"
6. Status badges should use the same meanings across all portals:
   - Draft: missing required listing details
   - Pending review: submitted to Move-In admin
   - Approved: admin approved the listing
   - Listed: visible publicly
   - Unlisted: not publicly visible
   - Suspended: disabled by admin
   - Rented: converted to an active rental
7. For PayServe-backed units, all UI should show facility and unit names clearly.
8. Tenants should not need to understand whether a unit is PayServe-backed or Move-In-only.
9. Admins and property managers should be able to see the source and linked records.
10. Responsive behavior should match the recent Move-In portal standard:
    - tables collapse or scroll cleanly
    - action buttons stay icon-first with hover labels/tooltips
    - dialogs fit mobile screens
    - listing forms are split into manageable sections

## Suggested Frontend Build Sequence

1. `landlord_main`: harden existing Move-In module and replace manual listing with PayServe-unit selection.
2. `app_main`: add unit-management Move-In status/actions and listing setup dialog.
3. `move_in`: improve admin source visibility and tenant progress for PayServe-backed listings.
4. `app_main`: add conversion flow into customer, lease, invoice, and handover.
5. `landlord_main`: add performance and commission visibility.
6. `move_in`: add admin commission/payment oversight refinements.
7. All portals: verify responsive behavior and notification/profile dropdown consistency.
