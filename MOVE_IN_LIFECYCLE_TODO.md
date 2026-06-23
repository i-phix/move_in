# Move-In Lifecycle TODO

## Phase 1: Standalone Move-In consistency

- [x] Keep Move-In admin inside `move_in`, not `core_main`.
- [x] Require admin approval only for public unit listings.
- [x] Ensure guest users can apply, reserve, and request viewing without login.
- [x] Add complete listing details: location, landmarks, services, amenities, images.
- [ ] Use one deal lifecycle record for every application/reservation/viewing that can become a rented unit.
- [ ] Use one commission lifecycle record for every successful rental conversion.
- [ ] Lock or mark a unit as `under_offer` / `reserved` / `rented` when the tenant and landlord commit.
- [ ] Auto-expire reservations and stale offers.
- [ ] Add admin override tools for disputes, cancelled deals, commission waivers, and refunds.
- [ ] Add tenant confirmation before a landlord can complete a rental conversion.
- [ ] Add real payment initiation, callback verification, receipts, and reconciliation.
- [ ] Add tenant document collection and landlord screening notes.
- [ ] Add landlord and admin conversion dashboards.

## Phase 2: Safety and data quality

- [ ] Resolve `unitId`, `landlordId`, `facilityId`, and listing status on the backend for all actions.
- [ ] Stop trusting client-submitted landlord or facility ownership fields.
- [ ] Add duplicate lead detection by email/phone/unit.
- [ ] Make viewing slot booking atomic to prevent overbooking.
- [ ] Add audit logs for all status-changing actions.
- [ ] Add email and in-app notifications for every user-facing transition.
- [ ] Add idempotency keys for payment and conversion operations.
- [ ] Add rate limiting / anti-spam controls for guest flows.

## Phase 3: Commission and revenue

- [ ] Define commission rules: fixed amount, percentage of rent, first-month percentage, or custom override.
- [ ] Generate commission when a deal becomes `rented`.
- [ ] Support commission payer: landlord, tenant, or property owner.
- [ ] Track commission status: `not_due`, `due`, `invoiced`, `paid`, `waived`, `refunded`, `disputed`.
- [ ] Reconcile commission payments against verified gateway callbacks.
- [ ] Export commission reports for admin.

## Phase 4: PayServe integration, last and isolated

- [ ] Surface existing PayServe units for linked landlords without forcing re-entry.
- [ ] Store Move-In-only listing metadata separately from PayServe source unit data.
- [ ] Convert a rented Move-In deal into the correct PayServe resident/lease/invoice records only after explicit admin action.
- [ ] Keep PayServe DB writes behind source checks and idempotency guards.
- [ ] Never modify existing PayServe resident/unit/lease behavior unless the deal explicitly targets a PayServe source unit.
