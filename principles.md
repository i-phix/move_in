Move_In Application Development Principles

  1. Centralized Color System: All colors (buttons, text, backgrounds, borders)
  must use Bootstrap 5 utility classes and custom CSS variables defined in
  src/styles/ or equivalent CSS files. No arbitrary inline color values.
  Do not use fading colors, color mixing, or gradients anywhere in the UI —
  no linear-gradient, radial-gradient, or any CSS gradient function. Stick to
  solid colors from the defined palette only.

  2. Consistent Icon Library: Use only lucide-react throughout the application
  with consistent sizing and semantic meaning — no mixing libraries, no raw
  SVG icons, no emoji as UI elements.

  3. Responsive Design First: Mobile-first approach using Bootstrap 5 breakpoints
  (sm, md, lg, xl, xxl) — all layouts must work seamlessly from mobile to desktop.

  4. Consistent CSS Library: Use Bootstrap 5 as the primary CSS framework.
  Minimize raw/custom CSS as much as possible. Use Bootstrap utility classes
  for spacing, typography, and layout.

  5. Form Validation Standards: Phone numbers (E.164 format with country code),
  names (letters/spaces/hyphens only, 2–50 chars), email (RFC 5322), passwords
  (min 8 chars with complexity requirements, use eye icon to let users view
  their password as they type).

  6. HTTP Requests — Always use makeRequest.js: All API calls must go through
  the helpers in src/utils/makeRequest.js. Never bypass or modify this file.
     - makeRequest  → unauthenticated requests
     - makeRequest2 → authenticated requests (reads Bearer token from AGENTUSER localStorage key)
     - makeRequest3 → authenticated + FormData (file uploads)
  API base URLs must be defined in src/utils/urls.js — no hardcoded URLs elsewhere.

  7. Comprehensive Audit Trails and Activity Logging: Log all critical actions
  (account creation, status changes, pricing modifications) with user, timestamp,
  old/new values — visible in the admin portal (core_main). Track who did what
  and when across all portals.

  8. Toast Notifications and Friendly Error State Handling: Use toast notifications
  for user feedback (success/error/info/warning) — absolutely no DOM alerts or
  confirm dialogs. Show friendly error messages with actionable guidance, fallback
  UI for failed data loads, and proper HTTP status codes.

  9. Pagination for All Lists: Pagination must appear at the bottom of every list.
  Users can change items-per-page (default 10 for large lists, 5 for smaller
  sections) on the left side. Page number navigation goes on the right. Search
  and pagination must call the API — do not filter large datasets client-side.

  10. No Hardcoded or Static Data: Never hardcode data that should come from the
  database. Always fetch from or submit to the backend API. If you are unsure
  about the data structure for a page, ask before proceeding.

  11. Breadcrumbs on All Components: Every authenticated page/component must
  display breadcrumbs clearly at the top. Follow the breadcrumb style used
  across the other portals (core_main, customer_obsession, landlord_main).

  12. WYSIWYG for Description Fields: Any description or rich-text field must use
  a React-compatible WYSIWYG editor (check package.json for the installed editor
  dependency and use it consistently). Never use a plain <textarea> for
  description fields.

  13. Image Handling: Use a dedicated utility/service for fetching, uploading,
  and displaying images. Do not write inline image upload logic scattered across
  components — centralize it.

  14. Database Schema Updates — Update Both Locations: Whenever you modify the
  MongoDB/Mongoose schema, you MUST update it in TWO places:
     a. /home/seint/Dev/Payserve/Main2/payserve_backend/node_modules/payservedb/src/models/
     b. /home/seint/Dev/Payserve/Main2/payserve_db/src/models/
  Both must stay in sync at all times.

  15. Backend Routes: Move-In backend controllers live in:
     Main2/payserve_backend/src/controllers/move_in/
  Routes are registered in:
     Main2/payserve_backend/src/routes/move_in.js
  Follow the same controller/route pattern used by core, landlord, and
  customer_obsession routes in the same backend.

  16. Portal Boundaries:
     - Admin functionality → Main2/core_main (src/components/core/move_in/)
     - Landlord functionality → Main2/landlord_main
     - Customer/Tenant functionality → Main2/move_in
  Never cross portal boundaries — a customer-facing component belongs in
  move_in, not core_main or landlord_main.

---

This last principle goes to you: ask where you do not understand. I will be
happy to explain. But before asking, make sure you have researched thoroughly
and are confident in your question.
