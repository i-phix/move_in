# Move-In System — Gap Analysis & Fix Log

_Date: 2026-03-26_

---

## System Overview

The Move-In platform is a rental marketplace that connects **tenants** (move_in frontend), **landlords** (landlord_main portal), and **admins** (core_main portal).

| Component | Path |
|---|---|
| Tenant frontend | `Main2/move_in/` |
| Admin portal | `Main2/core_main/src/components/core/move_in/` |
| Landlord portal | `Main2/landlord_main/src/components/portal/move_in/` |
| Backend controllers | `Main2/payserve_backend/src/controllers/move_in/` (tenant) |
| | `Main2/payserve_backend/src/controllers/core/move_in/` (admin) |
| | `Main2/payserve_backend/src/controllers/landlord/move_in/` (landlord) |
| DB models (source) | `Main2/payserve_db/src/models/` |
| DB models (installed) | `Main2/payserve_backend/node_modules/payservedb/src/models/` |

---

## Bugs Found & Fixed

### 1. Missing `movein_unit.js` model in payservedb ✅ FIXED

**Problem:** `payserve_backend/node_modules/payservedb/src/models/movein_unit.js` did not exist. Every controller that touched `db.moveIn.MoveInUnit` would throw a `Cannot read properties of undefined` error at runtime, breaking:
- All landlord listing routes (`GET /api/landlord/move_in/units`, `POST /api/landlord/move_in/list_unit`, etc.)
- Admin listing approve/reject/toggle/override routes
- Admin listing GET route
- All tenant listing browse routes

**Fix:** Created `/payserve_backend/node_modules/payservedb/src/models/movein_unit.js` with the same schema as `payserve_db/src/models/moveinunit.js`.

---

### 2. Missing `moveIn` namespace in payservedb index ✅ FIXED

**Problem:** `payserve_backend/node_modules/payservedb/index.js` only exported move-in models as flat properties (`db.MoveinUser`, `db.MoveinApplication`, etc.) — but every single controller uses the namespaced form `db.moveIn.MoveInUser`, `db.moveIn.MoveInApplication`, etc. `db.moveIn` was `undefined`, causing runtime errors across all controllers.

**Fix:** Added a `moveInModels` block and exported it as `moveIn` in payservedb's `module.exports`:
```js
const moveInModels = {
  MoveInUser: require("./src/models/movein_user"),
  MoveInUnit: require("./src/models/movein_unit"),
  MoveInLandlord: require("./src/models/movein_landlord"),
  MoveInApplication: require("./src/models/movein_application"),
  CustomerPreference: require("./src/models/customer_preference"),
};
module.exports = { ...models, moveIn: moveInModels, ... };
```

---

### 3. Route method/param mismatches in core.js ✅ FIXED

**Problem:** Three admin routes were registered with the wrong HTTP method (`POST` instead of `PUT`) and missing `:id` path params, while their controllers expected `request.params.*`:

| Route (before) | Controller expects | Frontend calls |
|---|---|---|
| `POST /applications/assign` | `request.params.applicationId` | `PUT .../assign/:id` |
| `POST /customers/suspend` | `request.params.customerId` | `PUT .../suspend/:id` |
| `POST /customers/activate` | `request.params.customerId` | `PUT .../activate/:id` |

**Fix:** Updated `payserve_backend/src/routes/core.js` to:
```js
fastify.put(moveInBaseRoute + '/applications/assign/:applicationId', jwt, assign_move_in_application);
fastify.put(moveInBaseRoute + '/customers/suspend/:customerId',      jwt, suspend_move_in_customer);
fastify.put(moveInBaseRoute + '/customers/activate/:customerId',     jwt, activate_move_in_customer);
```

---

## DB Sync Status

| Model | payserve_db | payservedb (node_modules) |
|---|---|---|
| MoveInUser | ✅ `moveinuser.js` | ✅ `movein_user.js` |
| MoveInUnit | ✅ `moveinunit.js` | ✅ `movein_unit.js` (added) |
| MoveInLandlord | ✅ `moveinlandlord.js` | ✅ `movein_landlord.js` |
| MoveInApplication | ✅ `moveinapplication.js` | ✅ `movein_application.js` |
| CustomerPreference | ✅ `customerpreference.js` | ✅ `customer_preference.js` |
| `moveIn` namespace | ✅ | ✅ (added) |

---

## What Already Existed (No Changes Needed)

### Admin portal (core_main) — fully built
- `dashboard.js` — stats + recent activity feed
- `listings.js` — approve, reject, toggle, override price
- `applications.js` — list + assign to landlord
- `customers.js` — list + suspend / activate
- `landlords.js` — assign / revoke module access
- `preferences.js` — aggregated analytics view
- `routes.js` — React Router routes for all 6 pages
- `core_main/src/utils/urls.js` — all URL constants defined

### Admin backend controllers — fully built
All 15 controllers under `payserve_backend/src/controllers/core/move_in/` existed and were correctly implemented. They just couldn't run due to issues #1 and #2 above.

### Landlord portal (landlord_main) — fully built
- `my_listings.js` — view + edit listings
- `list_unit.js` — full dialog for creating/editing a listing with image uploads
- `bookings.js` — view tenant applications/bookings
- `performance.js` — revenue and listing performance metrics
- `landlord_main/src/utils/urls.js` — all URL constants defined

### Landlord backend controllers — fully built
All 6 controllers under `payserve_backend/src/controllers/landlord/move_in/` existed and were correctly implemented.

### Tenant backend controllers — built
Auth (register, login), listings (get all, get one, locations), applications (submit, get my), preferences (save, sync).

### Routes registered
- `payserve_backend/src/routes/move_in.js` — tenant routes
- `payserve_backend/src/routes/core.js` — admin routes (after fix #3)
- `payserve_backend/src/routes/landlord.js` — landlord routes

---

## Still Missing (Not In Scope / Future Work)

The following features from the architecture document are not yet built. They are noted here for future reference.

### Tenant frontend (move_in/) — pages not built yet
- My Applications page
- Saved listings
- Viewing/booking scheduler
- Reservation flow
- Payment flow
- Messaging
- Notifications
- Profile / settings

### Backend — features not implemented
- Viewing scheduler (create slots, book viewing, cancel, my viewings)
- Reservations (create, confirm, cancel)
- Payments (initiate, confirm, history)
- Messaging / conversations
- Push notifications
- Audit logs
- Tenant auth: forgot password, OTP verify, reset password

### Admin portal — pages not built yet
- Viewing management
- Reservation management
- Payment oversight
- Messaging monitor
- Audit logs

---

## Summary

**3 bugs fixed** that made the entire Move-In system non-functional at runtime:
1. Missing DB model file
2. Missing DB namespace
3. Wrong route methods/params

After these fixes, all existing admin, landlord, and tenant backend endpoints are functional. All existing admin and landlord frontend pages are wired up correctly.
