# Move-In PayServe Integration TODO

## Current Execution Plan

This is the active checklist for the current implementation pass.

### Pass A: App Main Listing Workflow

- [x] Add backend app routes for property-manager Move-In unit listing.
- [x] Add controller to list facility units with Move-In readiness/status.
- [x] Add controller to create/update a Move-In listing from a PayServe facility unit.
- [x] Add controller to submit/re-submit a facility unit listing for Move-In approval.
- [x] Ensure app-created listings use the linked PayServe landlord where possible.
- [x] Ensure facility unit Move-In fields sync when listing metadata changes.
- [x] Add app_main route constants.
- [x] Add app_main listing setup dialog from Unit Management.
- [x] Add app_main unit table actions for list/edit/submit/open public listing.
- [x] Build app_main.

### Pass B: Landlord Main Actions

- [x] Add applications page actions: approve, reject, message, convert to rental.
- [x] Add reservations page/actions to landlord_main.
- [x] Add viewing booking actions: accept, reschedule, email/message, cancel.
- [ ] Add commission visibility.
- [ ] Build landlord_main.

### Pass C: Move-In Admin Oversight

- [ ] Improve PayServe-backed listing columns in admin listings.
- [ ] Add suspend/unlist/override notification behavior.
- [ ] Add linked PayServe references in admin detail/action modals.
- [ ] Add commission source and sync status display.
- [ ] Build move_in.

### Pass D: Rental Conversion

- [ ] Add conversion endpoint for Move-In deal/application/reservation to PayServe rental.
- [ ] Create/link PayServe customer.
- [ ] Create/link PayServe lease draft.
- [ ] Assign PayServe unit tenant fields.
- [ ] Create commission record if not already present.
- [ ] Create handover starter record or handover task.
- [ ] Add notifications and email events.

### Pass E: Payment Integration

- [ ] Keep payment integration last.
- [ ] Add commission invoice/payment initiation.
- [ ] Add payment status callback handling.
- [ ] Add reconciliation view/status in admin and landlord portals.

## Phase 1: Foundations

- [x] Add/confirm a stable PayServe-to-Move-In landlord mapping.
- [x] Add/confirm source fields for Move-In records: `standalone` or `payserve`.
- [x] Ensure PayServe-backed listings always carry `facilityId`, `unitId`, and landlord identifiers.
- [x] Create reusable backend resolver for PayServe landlord, facility, and unit ownership.
- [x] Keep `payserve_db` and `payserve_backend/node_modules/payservedb` model changes in sync.

## Phase 2: `landlord_main` Integration

- [x] Keep Move-In routes in `landlord_main/src/utils/urls.js`.
- [x] Add missing URLs for applications, reservations, commissions, and rental conversion.
- [x] Replace manual listing flow with PayServe-unit-first selection.
- [x] Show listing source, facility, location, approval status, public status, and completeness.
- [ ] Add actions for edit, photos, submit for approval, unlist, and open public listing.
- [x] Add application response actions.
- [x] Add reservation response actions.
- [x] Add viewing booking response actions.
- [ ] Add commission/performance visibility.

## Phase 3: `app_main` Integration

- [x] Add Move-In route constants in `app_main/src/utils/urls.js`.
- [x] Add Move-In status columns/actions to facility unit management.
- [x] Add "List on Move-In" and "Edit Move-In listing" actions.
- [x] Add listing setup dialog/drawer for facility units.
- [ ] Add facility-level Move-In dashboard.
- [ ] Add Move-In tenant intake queue.
- [ ] Add rental conversion UI.
- [ ] Prefill PayServe lease creation from confirmed Move-In deal.
- [ ] Start PayServe handover from Move-In rental conversion.

## Phase 4: `move_in` Portal Updates

- [ ] Ensure public listings handle standalone and PayServe-backed units consistently.
- [ ] Ensure tenant/guest actions route to mapped landlord/property manager.
- [ ] Show tenant progress through listing, application, reservation, viewing, lease, payment, handover, and move-in.
- [ ] Show source and linked PayServe references to admins only.
- [ ] Add admin listing actions for approve, reject, suspend, unlist, and metadata edit.
- [ ] Add commission source and PayServe link visibility.

## Phase 5: Rental Conversion

- [ ] Add backend endpoint to convert Move-In application/reservation to PayServe rental.
- [ ] Create/link PayServe customer.
- [ ] Create/link PayServe lease.
- [ ] Assign PayServe unit to tenant.
- [ ] Update PayServe unit occupancy.
- [ ] Create Move-In deal.
- [ ] Create Move-In commission.
- [ ] Trigger handover setup.
- [ ] Notify tenant, landlord, property manager, and admin.

## Phase 6: Payments And Commission

- [ ] Keep PayServe payment integration as the final integration phase.
- [ ] Add commission invoice/payment initiation.
- [ ] Add payment callback/status sync.
- [ ] Add payment success/failure notifications.
- [ ] Add admin reconciliation controls.

## Phase 7: Verification

- [ ] Test non-PayServe landlord flow end to end.
- [ ] Test PayServe landlord from `landlord_main`.
- [ ] Test PayServe property manager from `app_main`.
- [ ] Test public tenant/guest application.
- [ ] Test public tenant/guest reservation.
- [ ] Test public tenant/guest viewing booking.
- [ ] Test rental conversion.
- [ ] Test commission creation.
- [ ] Test responsive UI in all three portals.
- [ ] Test notification and email scenarios.
