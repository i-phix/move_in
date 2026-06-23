# Move-In TODO Checklist

## Build and Routing
- [x] Verify `npm run build` passes.
- [x] Remove build warnings and debug logs.
- [ ] Add full smoke tests for auth, listings, applications, viewings, reservations, payments, messaging, and landlord flows.
- [x] Add baseline tests for the wired checklist page, Move-In controllers, and Move-In DB model syntax.

## Tenant Frontend
- [x] Replace the placeholder Units page with real listings data.
- [x] Fix tenant intake so it uses a real endpoint or remove it from active routing.
- [x] Route and wire Checklists.
- [x] Route and wire Handovers.
- [x] Wire reservation creation from listing detail pages.
- [x] Ensure reservations create/expect payment records.
- [x] Replace raw browser confirms with modal/toast flows.
- [x] Remove debug console logging.
- [x] Replace FontAwesome sidebar icons with lucide-react.
- [ ] Replace plain description textareas with a consistent rich-text/WYSIWYG strategy.
- [ ] Add pagination controls to large list pages.

## Backend
- [x] Add tenant checklist endpoint.
- [x] Add tenant handover endpoint.
- [x] Add tenant list/intake endpoint or remove the dead UI.
- [ ] Add payment initiation/confirmation/callback endpoints.
- [x] Add audit logging for critical move-in actions.
- [x] Validate reservation creation creates pending payment obligations.

## Database
- [x] Confirm Move-In model files are synced between `payserve_db` and installed `payservedb`.
- [ ] Add any new schema files to both DB locations if new persisted models are introduced.

## Production Readiness
- [ ] Keep Move-In `.env` minimal and environment-specific.
- [ ] Ensure `node_modules` is not tracked/deployed as source.
- [ ] Document seed/run commands for Move-In.
