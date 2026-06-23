# Move-In Email Scenario Previews

Recipient used for scenario testing: `mesandyelaine@gmail.com`

These are the actual scenario-specific email subjects and bodies prepared for Move-In notification testing. They are not generic placeholder messages.

## 1. Email Verification

Subject: Verify your Move-In email

Hello Sandy Tenant,

Welcome to Move-In by PayServe. Please verify your email address so we can secure your account and keep you updated on applications, viewings, reservations, and move-in payments.

Verify your email: http://localhost:3000/verify-email/mock-verification-token

If you did not create this account, you can ignore this email.

## 2. Forgot Password

Subject: Reset your Move-In password

Hello Sandy Tenant,

We received a request to reset your Move-In password.

Reset your password: http://localhost:3000/reset-password/mock-reset-token

This link is time-limited. If you did not request a password reset, no action is required.

## 3. Tenant Registration Welcome

Subject: Welcome to Move-In by PayServe

Hello Sandy Tenant,

Your Move-In account has been created successfully. You can now browse homes, apply for units, reserve units, book viewings, and track your rental journey from your dashboard.

Dashboard: http://localhost:3000/move-in/dashboard

## 4. New Landlord Registered

Subject: New Move-In landlord registered

Hello Move-In Admin,

A new landlord has registered on Move-In.

Landlord: James Kariuki
Email: james.kariuki@example.com
Phone: +254700222333

Review landlord access from the admin workspace:
http://localhost:3000/move-in/admin/landlords

## 5. Unit Submitted For Admin Approval

Subject: New Move-In unit pending approval

Hello Move-In Admin,

A landlord has submitted a unit for listing approval.

Unit: 4BR Ruaka
Landlord: James Kariuki
Location: Nairobi, Ruaka
Price: KES 450,000 per month

Review the unit:
http://localhost:3000/move-in/admin/listings

## 6. Approved Unit Edited And Returned To Review

Subject: Move-In unit changes pending review

Hello Move-In Admin,

An approved Move-In unit was edited by the landlord and now requires review before the public listing is updated.

Unit: 4BR Ruaka
Landlord: James Kariuki
Changed details: price, bedrooms, description, nearby landmarks

Review changes:
http://localhost:3000/move-in/admin/listings

## 7. Unit Approved

Subject: Your unit has been approved — Modern 2BR Apartment — Westlands

Hello James Kariuki,

Your unit has been approved and is now visible on Move-In public listings.

Unit: Modern 2BR Apartment — Westlands
Location: Nairobi, Westlands
Price: KES 65,000 per month

View your units:
http://localhost:3000/move-in/landlord/units

## 8. Unit Rejected Or Needs Updates

Subject: Your unit listing requires updates — Modern 2BR Apartment — Westlands

Hello James Kariuki,

Your unit listing requires updates before it can be published.

Unit: Modern 2BR Apartment — Westlands
Reason: Please add complete location details, at least one clear photo, nearby services, and landlord contact details.

Update your unit:
http://localhost:3000/move-in/landlord/units

## 9. Tenant Application Submitted

Subject: Application received for Modern 2BR Apartment — Westlands

Hello Sandy Tenant,

We have received your application.

Unit: Modern 2BR Apartment — Westlands
Applicant: Sandy Tenant
Email: mesandyelaine@gmail.com
Phone: +254700111222

The landlord will review your application and contact you with the next steps.

## 10. Landlord New Application Alert

Subject: New application for Modern 2BR Apartment — Westlands

Hello James Kariuki,

A tenant has applied for one of your units.

Unit: Modern 2BR Apartment — Westlands
Applicant: Sandy Tenant
Email: mesandyelaine@gmail.com
Phone: +254700111222
Move-in preference: 2026-06-01

Review applications:
http://localhost:3000/move-in/landlord/applications

## 11. Application Approved

Subject: Move-In Application Approved

Hello Sandy Tenant,

Your application for Modern 2BR Apartment — Westlands has been approved.

The landlord may contact you to finalize viewing, reservation, rent confirmation, or payment steps.

Open your dashboard:
http://localhost:3000/move-in/dashboard

## 12. Application Rejected

Subject: Move-In Application Rejected

Hello Sandy Tenant,

Your application for Modern 2BR Apartment — Westlands was not approved.

You can continue browsing other available homes on Move-In.

Browse listings:
http://localhost:3000/listings

## 13. Application Converted To Rental

Subject: Move-In Rental Confirmed

Hello Sandy Tenant,

Your rental for Modern 2BR Apartment — Westlands has been confirmed.

Next steps may include lease preparation, handover, payment coordination, and commission tracking where applicable.

## 14. Tenant Reservation Submitted

Subject: Reservation received for Modern 2BR Apartment — Westlands

Hello Sandy Tenant,

We have received your reservation request.

Unit: Modern 2BR Apartment — Westlands
Requested move-in date: 2026-06-01
Message: I would like to reserve this unit while I complete my documents.

The landlord will review and respond.

## 15. Landlord New Reservation Alert

Subject: New reservation for Modern 2BR Apartment — Westlands

Hello James Kariuki,

A tenant has reserved one of your units.

Unit: Modern 2BR Apartment — Westlands
Tenant: Sandy Tenant
Email: mesandyelaine@gmail.com
Phone: +254700111222
Requested move-in date: 2026-06-01

Review reservations:
http://localhost:3000/move-in/landlord/reservations

## 16. Reservation Accepted

Subject: Reservation confirmed for Modern 2BR Apartment — Westlands

Hello Sandy Tenant,

Your reservation for Modern 2BR Apartment — Westlands has been confirmed.

Confirmed move-in date: 2026-06-01

Please wait for the landlord to share final move-in and payment instructions.

## 17. Reservation Rescheduled

Subject: Reservation date proposed for Modern 2BR Apartment — Westlands

Hello Sandy Tenant,

The landlord has proposed a different date for your reservation.

Unit: Modern 2BR Apartment — Westlands
Proposed move-in date: 2026-06-05
Landlord note: The unit will be ready after repainting is completed.

Please reply or contact the landlord if this date does not work for you.

## 18. Reservation Custom Email

Subject: Message about your reservation for Modern 2BR Apartment — Westlands

Hello Sandy Tenant,

The landlord has sent you a message about your reservation.

Unit: Modern 2BR Apartment — Westlands
Message: Please send your national ID copy and preferred lease start date so we can prepare the next steps.

## 19. Reservation Cancelled

Subject: Reservation cancelled for Modern 2BR Apartment — Westlands

Hello Sandy Tenant,

Your reservation for Modern 2BR Apartment — Westlands has been cancelled.

Reason: The tenant requested cancellation before confirmation.

Browse other homes:
http://localhost:3000/listings

## 20. Reservation Converted To Rental

Subject: Rental confirmed for Modern 2BR Apartment — Westlands

Hello Sandy Tenant,

Your reservation has been converted into a confirmed rental.

Unit: Modern 2BR Apartment — Westlands
Move-in date: 2026-06-01

The landlord and Move-In admin team can now coordinate handover and commission tracking where applicable.

## 21. Tenant Viewing Booked

Subject: Viewing request sent for 4BR Ruaka

Hello Sandy Tenant,

Your viewing request has been sent to the landlord.

Unit: 4BR Ruaka
Requested date: 2026-05-23
Requested time: 12:09

The landlord will confirm, reschedule, or contact you with more details.

## 22. Landlord New Viewing Alert

Subject: Viewing requested for 4BR Ruaka

Hello James Kariuki,

A tenant has requested a viewing.

Unit: 4BR Ruaka
Tenant: Sandy Tenant
Email: mesandyelaine@gmail.com
Phone: +254700111222
Requested date: 2026-05-23
Requested time: 12:09

Manage viewing requests:
http://localhost:3000/move-in/landlord/viewings

## 23. Viewing Accepted

Subject: Viewing confirmed for 4BR Ruaka

Hello Sandy Tenant,

Your viewing for 4BR Ruaka has been confirmed.

Date: 2026-05-23
Time: 12:09
Location: Nairobi, Ruaka

Please arrive on time or contact the landlord if anything changes.

## 24. Viewing Rescheduled

Subject: Viewing rescheduled for 4BR Ruaka

Hello Sandy Tenant,

The landlord has proposed a new viewing time.

Unit: 4BR Ruaka
New date: 2026-05-24
New time: 10:30
Landlord note: The caretaker is available in the morning.

Please confirm with the landlord if this works for you.

## 25. Viewing Custom Email

Subject: Message about your viewing for 4BR Ruaka

Hello Sandy Tenant,

The landlord has sent you a message about your viewing.

Unit: 4BR Ruaka
Message: Please carry your ID at the gate and call when you arrive.

## 26. Viewing Cancelled

Subject: Viewing cancelled for 4BR Ruaka

Hello Sandy Tenant,

Your viewing for 4BR Ruaka has been cancelled.

Reason: The landlord is unavailable at the selected time.

You can book a different viewing time from the listing page.

## 27. Move-In / Handover Confirmed

Subject: Move-In confirmed — Modern 2BR Apartment — Westlands

Hello Sandy Tenant,

Your move-in has been confirmed.

Unit: Modern 2BR Apartment — Westlands
Move-in date: 2026-06-01
Landlord: James Kariuki

Please coordinate key handover and final documentation with the landlord.

## 28. Commission Due To Admin

Subject: Move-In commission due

Hello James Kariuki,

A Move-In commission is now due for a confirmed rental.

Unit: Modern 2BR Apartment — Westlands
Tenant: Sandy Tenant
Commission amount: KES 10,000
Due date: 2026-06-03

Review commission status:
http://localhost:3000/move-in/landlord/payments

## 29. Commission Paid

Subject: Move-In commission paid

Hello James Kariuki,

The commission for Modern 2BR Apartment — Westlands has been marked as paid.

Amount: KES 10,000
Payment reference: MPESA-MOCK-12345

Thank you for keeping your Move-In account up to date.

## 30. Tenant Message Notification

Subject: New Message from Landlord

Hello Sandy Tenant,

You have a new message from James Kariuki.

Message: Hello Sandy, your viewing is confirmed. Please call me when you get to the gate.

Open messages:
http://localhost:3000/move-in/messages

## 31. Landlord Message Notification

Subject: New Message about Modern 2BR Apartment — Westlands

Hello James Kariuki,

You have received a new message from Sandy Tenant.

Unit: Modern 2BR Apartment — Westlands
Message: Hi, I am interested in this unit and would like to know if parking is included.

Open messages:
http://localhost:3000/move-in/landlord/messages
