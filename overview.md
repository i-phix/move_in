Move-In Overview

  Move-In is now split into four sides:

  1. Guest/public side
     Users browse listings without logging in.
  2. Tenant side
     Registered Move-In users track applications, reservations, viewings, payments, messages, notifications, profile, and handover/checklists.
  3. Landlord side
     Landlords create/list units, upload photos, manage applications, viewings, reservations, messages, and rental conversion.
  4. Admin side
     Admin approves listings, oversees activity, manages users/landlords, views deals/commissions, and can reconcile commission status.

  1. Landlord Posts A Unit

  A landlord logs into Move-In landlord portal.

  They go to:

  /move-in/landlord/units

  They can add a unit with:

  - title
  - type
  - bedrooms
  - bathrooms
  - price
  - floor area
  - city / county / area / address
  - landmarks
  - map link
  - amenities
  - nearby services
  - description
  - photos

  When created, the backend saves the unit as:

  moveInApproval: "pending"
  isListed: false
  moveInStatus: "pending_approval"

  So the unit exists, but it is not public yet.

  2. Admin Approves Or Rejects Listing

  Admin reviews listings from:

  /move-in/admin/listings

  Only listing approval depends on admin.

  If admin approves:

  moveInApproval: "approved"
  isListed: true
  moveInStatus: "listed"

  The unit appears publicly.

  If admin rejects:

  moveInApproval: "rejected"
  isListed: false
  moveInStatus: "draft"

  If the landlord edits important listing details after approval, the system moves it back to:

  moveInApproval: "pending"
  isListed: false
  moveInStatus: "pending_approval"

  That prevents changed listings from staying public without review.

  3. Public User Browses Listings

  Users browse:

  /listings

  Public listing APIs only show units where:

  isListed: true
  moveInApproval: "approved"
  moveInStatus not in ["reserved", "rented", "suspended"]

  So draft, pending, rejected, reserved, rented, and suspended units should not appear publicly.

  Users can open a unit detail page and choose:

  - apply for the unit
  - reserve the unit
  - book/request a viewing

  They can do this logged in or as a guest.

  4. Guest Scenario

  A guest does not need an account.

  They enter:

  - name
  - email
  - phone
  - optional message/date depending on action

  The backend stores the request with:

  isGuest: true
  tenantId: null
  tenantName
  tenantEmail
  tenantPhone

  The landlord gets the lead details and can contact/respond.

  Guest flows currently create records, but guest-to-registered-tenant conversion is still a future TODO.

  5. Registered Tenant Scenario

  A registered tenant logs in and uses:

  /move-in/dashboard

  They can:

  - browse homes
  - apply
  - reserve
  - book viewings
  - see notifications
  - see applications
  - see reservations
  - see payments
  - message landlord
  - manage profile

  Their actions are linked to their MoveInUser record.

  6. Applying For A Unit

  When a tenant/guest applies:

  Backend verifies the unit is actually approved/listed.

  Then it creates:

  MoveInApplication

  With status:

  status: "pending"

  It also creates or updates a central:

  MoveInDeal

  With status:

  status: "applied"

  For standalone Move-In units, the unit is marked:

  moveInStatus: "under_offer"
  activeDealId: dealId

  This means the system knows there is active interest tied to a possible rental conversion.

  7. Reserving A Unit

  When a tenant/guest reserves:

  Backend verifies the unit is available.

  It creates:

  MoveInReservation

  With status:

  status: "pending"
  expiresAt: now + 48 hours

  It also creates or updates:

  MoveInDeal

  With status:

  status: "reserved"

  For standalone units:

  moveInStatus: "reserved"
  activeDealId: dealId

  If the user is logged in and the unit has a price, the system also creates a pending reservation-fee payment:

  type: "reservation_fee"
  status: "pending"
  amount: 10% of rent

  Actual payment collection is not yet implemented; this is currently a payment record scaffold.

  8. Booking Or Requesting A Viewing

  There are two viewing scenarios.

  If landlord created viewing slots:

  - tenant books a slot
  - booking is immediately confirmed if capacity exists

  The system creates:

  MoveInBooking

  With status:

  status: "confirmed"

  And creates/updates deal:

  status: "viewing_confirmed"

  If no slots are available:

  - tenant/guest can request custom date/time
  - landlord must accept/reschedule/cancel

  The booking starts as:

  status: "pending"

  Deal status:

  status: "viewing_requested"

  9. Landlord Handles Applications

  Landlord goes to:

  /move-in/landlord/applications

  They can approve/reject applications.

  If approved:

  MoveInApplication.status = "approved"
  MoveInDeal.status = "application_approved"
  MoveInUnit.moveInStatus = "under_offer"

  Tenant receives notification/email.

  If rejected:

  MoveInApplication.status = "rejected"
  MoveInDeal.status = "lost"

  For standalone units, the unit can return to:

  moveInStatus: "listed"

  10. Landlord Handles Reservations

  Landlord goes to:

  /move-in/landlord/reservations

  They can:

  - accept
  - reschedule
  - send email/message
  - cancel
  - mark as rented

  If accepted:

  MoveInReservation.status = "confirmed"
  MoveInDeal.status = "offer_sent"
  MoveInUnit.moveInStatus = "reserved"

  If rescheduled:

  MoveInReservation.status = "pending"
  MoveInDeal.status = "reserved"

  If cancelled:

  MoveInReservation.status = "cancelled"
  MoveInDeal.status = "cancelled"
  MoveInUnit.moveInStatus = "listed"

  11. Landlord Handles Viewing Bookings

  Landlord goes to:

  /move-in/landlord/viewings

  They can:

  - accept
  - reschedule
  - send email
  - cancel

  Accepting a viewing:

  MoveInBooking.status = "confirmed"
  MoveInDeal.status = "viewing_confirmed"

  Rescheduling:

  MoveInBooking.status = "pending"
  MoveInDeal.status = "viewing_requested"

  Cancelling:

  MoveInBooking.status = "cancelled"
  MoveInDeal.status = "cancelled"

  12. When Tenant Actually Rents The Unit

  This is now represented through the deal lifecycle.

  Landlord can mark an approved application or confirmed reservation as rented.

  When that happens:

  MoveInDeal.status = "rented"
  MoveInDeal.commissionStatus = "due"
  MoveInUnit.moveInStatus = "rented"
  MoveInUnit.isListed = false

  Then the system creates:

  MoveInCommission

  Default rule:

  ruleType: "percentage_of_rent"
  ruleValue: 10
  payerType: "landlord"
  status: "due"

  It also creates a pending commission payment record:

  MoveInPayment.type = "commission"
  MoveInPayment.status = "pending"

  This is the admin commission tracking scaffold.

  13. Admin Commission Oversight

  Admin now has backend endpoints for:

  GET /api/move_in/admin/deals
  GET /api/move_in/admin/commissions
  PUT /api/move_in/admin/commissions/:commissionId

  Admin can move commission status through:

  due
  invoiced
  paid
  waived
  refunded
  disputed
  cancelled

  When commission is marked paid:

  MoveInCommission.status = "paid"
  MoveInDeal.commissionStatus = "paid"
  MoveInPayment.status = "paid"

  Actual payment gateway collection is still not implemented.

  14. Notifications

  Notifications exist for key actions:

  - new reservation
  - viewing request
  - application update
  - listing approval/rejection
  - tenant updates

  Header notification bell:

  - shows unread count
  - opens dropdown
  - paginates 5 per page
  - closes on outside click/navigation
  - clicking notification marks it read
  - clicking notification routes to source page where possible

  15. Email Flow

  Email is triggered for:

  - registration verification
  - forgot password/reset
  - application approval/rejection
  - reservation accept/reschedule/cancel
  - viewing accept/reschedule/cancel
  - listing approval/rejection

  Emails use the existing backend email utility. The shared makeRequest files were not changed.

  16. Handover And Checklist

  Tenant handover/checklist pages currently derive data from reservations/applications.

  They are not yet full workflow models.

  Current logic:

  - confirmed reservation/application can appear as scheduled/in progress
  - cancelled/expired remain pending/cancelled-like
  - no dedicated handover assignment, checklist completion, key release, inspection, or document signoff yet

  This is still a future enhancement.

  17. Payments

  Current payment records exist for:

  - reservation fee
  - deposit
  - first month rent
  - commission
  - other

  But actual payment initiation is not built yet.

  Missing:

  - M-Pesa STK push
  - card payment
  - callback verification
  - receipts
  - reconciliation
  - refunds
  - idempotency
  - payment retry

  So payment history can show records, but it is not yet a complete payment gateway flow.

  18. PayServe Landlord Scenario

  There are landlords from the main PayServe system.

  They can be linked into Move-In through landlord handoff/login.

  The intended future flow is:

  1. PayServe landlord enters Move-In from app_main or landlord portal.
  2. Move-In creates/uses a MoveInLandlordUser.
  3. Their existing PayServe units can be surfaced.
  4. Move-In stores listing metadata separately.
  5. Only after a deal is actually rented should PayServe integration create/update:
      - resident
      - lease
      - invoice
      - occupancy
      - commission record

  Right now PayServe integration is intentionally isolated.

  There is a safe adapter:

  payserve_integration.js

  It prepares sync but does not automatically write into PayServe property records. This prevents breaking existing PayServe behavior.

  19. Main Data Models

  Core models:

  MoveInUnit
  MoveInApplication
  MoveInReservation
  MoveInBooking
  MoveInViewingSlot
  MoveInDeal
  MoveInCommission
  MoveInPayment
  MoveInNotification
  MoveInUser
  MoveInLandlordUser

  Most important new model:

  MoveInDeal

  It ties the whole lifecycle together:

  - unit
  - tenant/guest
  - application
  - reservation
  - viewing
  - landlord
  - status
  - commission status
  - PayServe sync status

  20. Important Current Limitations

  Still not complete:

  - real payment gateway flow
  - tenant confirmation before landlord marks rented
  - automated reservation expiry
  - atomic viewing slot booking
  - PayServe resident/lease/invoice sync
  - admin UI pages for deals/commissions
  - full handover/checklist workflow
  - guest-to-tenant conversion
  - anti-spam/rate limiting
  - tenant document upload
  - commission rule configuration UI

  End-To-End Happy Path

  1. Landlord creates unit.
  2. Unit becomes pending approval.
  3. Admin approves listing.
  4. Unit appears publicly.
  5. User applies/reserves/books viewing.
  6. System creates application/reservation/booking.
  7. System creates or updates central deal.
  8. Landlord accepts/responds.
  9. User decides to rent.
  10. Landlord marks application/reservation as rented.
  11. Unit is removed from public listings.
  12. Deal becomes rented.
  13. Commission becomes due.
  14. Admin reconciles commission.
  15. Later PayServe sync can create resident/lease/invoice, once implemented.