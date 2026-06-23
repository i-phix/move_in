# Move-In Notification TODO

## Foundation
- [x] Expand Move-In notification model to support tenant, landlord, admin, and guest/email-only recipients.
- [x] Add notification types for account, listing, commission, handover, and system events.
- [x] Add reusable backend notification helper so email and in-app behavior stays consistent.
- [x] Allow admin notification fetching in the shared Move-In header.

## Account Events
- [x] Tenant registration sends verification email.
- [x] Landlord registration sends welcome email and alerts configured admins.
- [x] Forgot/reset password sends email.
- [ ] Add resend verification email endpoint.
- [ ] Send email when profile email is changed and require re-verification.
- [ ] Send email when admin resets a user password.

## Listing Events
- [x] Landlord creates a unit: alert configured admins by email.
- [x] Approved listing is edited materially: alert configured admins by email.
- [x] Admin approves/rejects listing: landlord receives email and in-app notification.
- [ ] Admin price override, suspend, and unlist actions should notify landlord.

## Prospect Events
- [x] Tenant/guest application submission notifies landlord by email/in-app and confirms to tenant/guest by email/in-app.
- [x] Tenant/guest reservation submission notifies landlord by email/in-app and confirms to tenant/guest by email/in-app.
- [x] Tenant/guest viewing request/booking notifies landlord by email/in-app and confirms to tenant/guest by email/in-app.
- [x] Landlord application response sends email and in-app notification.
- [x] Landlord viewing response sends email and in-app notification.
- [x] Landlord reservation response sends email and in-app notification.

## Lifecycle And Payments
- [x] Rental confirmation from application/reservation creates commission and notifies tenant.
- [x] Commission status updates notify landlord by email/in-app when a landlord exists.
- [ ] Reservation fee payment creation/payment/failure should notify tenant.
- [ ] PayServe payment integration should emit Move-In payment notifications after integration is activated.
- [ ] Handover/checklist events should notify tenant and landlord when those workflows become actionable.

## Operational Notes
- Guest users do not receive in-app notifications until they create an account; they receive email only.
- Admin emails are configured with `MOVE_IN_ADMIN_EMAILS` as a comma-separated list.
- For PayServe-backed units where landlord ownership is unresolved, landlord notifications are skipped until ownership mapping is available.
