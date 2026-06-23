# move_in
# Move-In by PayServe

A full-stack rental marketplace that digitizes the entire rental lifecycle — from discovery and viewing to application, reservation, payment, and move-in.

## Overview

Move-In connects tenants, landlords, and administrators on a single platform with structured, transparent rental workflows. Landlords list and manage units, tenants browse and apply, and admins oversee listings and commissions.

## Tech Stack

- **Frontend:** React.js, Redux, Bootstrap 5, Lucide React
- **Backend:** Node.js, Fastify, MongoDB (Mongoose)
- **Auth:** JWT-based authentication with role-based access control
- **Notifications:** Email and SMS via PayServe backend utilities
- **Media:** Centralized image upload and storage service

## Platform Actors

- **Tenants** — browse listings, apply for units, reserve homes, book viewings, track their rental journey
- **Landlords** — list units, manage applications, reservations, and viewings, track commissions
- **Admins** — approve/reject listings, oversee deals, manage users, reconcile commissions

## Core Features

### Listings
- Landlords submit units with full details: location, landmarks, amenities, photos, pricing
- Admin approval required before a unit goes public
- Units re-enter review if a landlord edits key listing details after approval

### Applications
- Guests can apply without an account (name, phone, email)
- Registered tenants apply from their dashboard
- Landlords approve or reject; system updates deal lifecycle accordingly

### Reservations
- Tenants/guests can reserve a unit with a preferred move-in date
- Reservations expire after 48 hours if not confirmed
- Landlords can accept, reschedule, message, or cancel

### Viewing Bookings
- Landlords can create available viewing slots
- Tenants/guests can book a slot or request a custom date/time
- Landlords confirm, reschedule, or cancel from their dashboard

### Deal Lifecycle
Every application, reservation, and viewing is tied to a central `MoveInDeal` record that tracks the full journey from `applied` → `viewing_confirmed` → `offer_sent` → `rented`.

### Commissions
- Generated automatically when a deal is marked as rented
- Default rule: 10% of rent, paid by landlord
- Admin tracks commission status: `due` → `invoiced` → `paid` / `waived` / `disputed`

### Notifications
- In-app notification bell with unread count and pagination
- Email notifications for all key lifecycle events (registration, application, reservation, viewing, approval, commission)

## Project Structure

```
src/
├── components/
│   ├── authentication/       # Login, register, password reset, email verify
│   ├── common/               # Shared UI components
│   ├── layout/               # Header, footer, nav
│   └── move_in/
│       ├── admin/            # Admin dashboard, listings, applications, landlords, landmarks
│       ├── landlord/         # Landlord dashboard, units, applications, reservations, viewings
│       ├── listings/         # Public listing browse and unit detail
│       ├── payments/         # Payment modals and invoice pages
│       ├── messaging/        # Tenant-landlord messaging
│       ├── notifications/    # Notification center
│       ├── preferences/      # Preference wizard and matching
│       └── dashboard/        # Tenant dashboard
├── features/                 # Redux slices
├── router/                   # React Router routes
└── utils/                    # makeRequest, urls, toast, formatting helpers
```

## Development Principles

- All API calls go through `makeRequest.js` — never bypass or modify it
- All API base URLs are defined in `src/utils/urls.js` — no hardcoded URLs
- Bootstrap 5 for layout and styling — no gradients, no inline colors
- Lucide React for all icons — no mixing icon libraries
- All lists use server-side pagination — no client-side filtering of large datasets
- All description fields use a WYSIWYG editor — no plain textareas
- Every authenticated page shows breadcrumbs
- Toast notifications only — no DOM alerts or confirm dialogs

## Current Limitations

The following are planned but not yet implemented:

- Real payment gateway (M-Pesa STK push, card, callbacks, receipts)
- Automated reservation expiry
- Guest-to-tenant account conversion
- Full handover and checklist workflow
- PayServe resident/lease/invoice sync on rental conversion
- Tenant document upload and landlord screening notes
- Anti-spam and rate limiting on guest flows

## Related Repositories

This is the tenant-facing frontend (`move_in`). The full platform also includes:

- `backend_main` — Fastify API backend
- `landlord_main` — Landlord portal
- `core_main` — Admin portal
- `app_main` — Property manager portal

---

Built with React · Node.js · MongoDB · Fastify
