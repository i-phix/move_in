export const backend_url = "http://localhost:3050";
// export const backend_url = "https://api.payserve.co.ke";


export const checkEmailAndPasswordURL = '/api/auth/check_email_and_password';
export const loginURL = '/api/auth/login';
export const forgotPasswordURL = '/api/auth/forgot_password';
export const resetPasswordURL = '/api/auth/reset_password';
export const codeVerificationURL = '/api/auth/otp';
export const verifyOTPURL = '/api/auth/verify_otp';
export const resendCodeURL = '/api/auth/resend_code';
export const checkTokenExpirationURL = '/api/auth/check_jwt_expiration';

export const moveInLoginURL       = '/api/move_in/auth/login';
export const registerCustomerURL  = '/api/move_in/auth/register';
export const verifyMoveInEmailURL = '/api/move_in/auth/verify_email';

// Preferences
export const savePreferencesURL      = '/api/move_in/preferences/save';
export const syncPreferencesURL      = '/api/move_in/preferences/sync';

// Listings
export const getListingsURL          = '/api/move_in/listings';
export const getListingURL           = '/api/move_in/listings';  // + /:id
export const getListingLocationsURL  = '/api/move_in/listings/locations';

// Applications
export const submitApplicationURL    = '/api/move_in/applications/submit';
export const submitGuestApplicationURL = '/api/move_in/applications/submit_guest';
export const getMyApplicationsURL    = '/api/move_in/applications/my';

// Auth — move_in specific
export const moveInForgotPasswordURL    = '/api/move_in/auth/forgot_password';
export const moveInVerifyResetOtpURL    = '/api/move_in/auth/verify_reset_otp';
export const moveInResetPasswordURL     = '/api/move_in/auth/reset_password';

// Tenant records and move-in lifecycle
export const getMoveInTenantsURL        = '/api/move_in/tenants';
export const getMoveInChecklistsURL     = '/api/move_in/checklists';
export const getMoveInHandoversURL      = '/api/move_in/handovers';

// Dashboard
export const getMoveInDashboardURL      = '/api/move_in/dashboard';

// Profile
export const getMoveInProfileURL        = '/api/move_in/profile';
export const updateMoveInProfileURL     = '/api/move_in/profile';

// Viewing slots & bookings
export const getMoveInSlotsURL          = '/api/move_in/viewing/slots';
export const getAvailableSlotsURL       = '/api/move_in/viewing/available';
export const bookMoveInSlotURL          = '/api/move_in/viewing/book';
export const bookGuestMoveInSlotURL     = '/api/move_in/viewing/book_guest';
export const cancelMoveInBookingURL     = '/api/move_in/viewing/bookings/cancel';
export const getMyMoveInBookingsURL     = '/api/move_in/viewing/bookings';

// Reservations
export const createMoveInReservationURL = '/api/move_in/reservations';
export const createGuestMoveInReservationURL = '/api/move_in/reservations/guest';
export const getMyMoveInReservationsURL = '/api/move_in/reservations';
export const cancelMoveInReservationURL = '/api/move_in/reservations/cancel';

// Notifications
export const getMoveInNotificationsURL  = '/api/move_in/notifications';
export const markMoveInNotifReadURL     = '/api/move_in/notifications/read';
export const markAllMoveInNotifsReadURL = '/api/move_in/notifications/read_all';

// Payments
export const getMoveInPaymentsURL       = '/api/move_in/payments';

// Messaging
export const getMoveInConversationsURL  = '/api/move_in/messaging/conversations';
export const startMoveInConversationURL = '/api/move_in/messaging/conversations';
export const getMoveInMessagesURL       = '/api/move_in/messaging/conversations';
export const sendMoveInMessageURL       = '/api/move_in/messaging/conversations';

// ── Landlord auth ─────────────────────────────────────────────────────────────
export const landlordRegisterURL        = '/api/move_in/landlord/auth/register';
export const landlordLoginURL           = '/api/move_in/landlord/auth/login';
export const landlordVerifyHandoffURL   = '/api/move_in/landlord/auth/verify-handoff';

// ── Landlord features ─────────────────────────────────────────────────────────
export const getLandlordDashboardURL    = '/api/move_in/landlord/dashboard';
export const getLandlordUnitsURL        = '/api/move_in/landlord/units';
export const createLandlordUnitURL      = '/api/move_in/landlord/units';
export const updateLandlordUnitURL      = '/api/move_in/landlord/units';       // + /:unitId
export const getLandlordApplicationsURL = '/api/move_in/landlord/applications';
export const respondApplicationURL      = '/api/move_in/landlord/applications'; // + /:id
export const getLandlordSlotsURL        = '/api/move_in/landlord/viewings/slots';
export const createLandlordSlotURL      = '/api/move_in/landlord/viewings/slots';
export const cancelLandlordSlotURL      = '/api/move_in/landlord/viewings/slots'; // + /:slotId  DELETE
export const getLandlordBookingsURL     = '/api/move_in/landlord/viewings/bookings';
export const respondLandlordBookingURL  = '/api/move_in/landlord/viewings/bookings'; // + /:bookingId
export const getLandlordReservationsURL = '/api/move_in/landlord/reservations';
export const respondLandlordReservationURL = '/api/move_in/landlord/reservations'; // + /:reservationId
export const getLandlordConversationsURL = '/api/move_in/landlord/messaging/conversations';
export const getLandlordMessagesURL     = '/api/move_in/landlord/messaging/conversations'; // + /:id/messages
export const sendLandlordMessageURL     = '/api/move_in/landlord/messaging/conversations'; // + /:id/messages

//Suggestions
export const getPlaceSuggestionsURL = '/api/move_in/places/suggestions';

// Image upload
export const uploadUnitImagesURL        = '/api/move_in/landlord/units';   // + /:unitId/images

// ── landlord_main handoff (used by landlord_main, not move_in) ────────────────
export const landlordHandoffURL         = '/api/move_in/landlord/auth/handoff';

// Core-authenticated Move-In admin
export const getAdminMoveInDashboardURL = '/api/core/move_in/dashboard';
export const getMoveInListingsURL = '/api/core/move_in/listings';
export const approveMoveInListingURL = '/api/core/move_in/listings/approve';
export const rejectMoveInListingURL = '/api/core/move_in/listings/reject';
export const toggleMoveInListingURL = '/api/core/move_in/listings/toggle';
export const overrideMoveInListingPriceURL = '/api/core/move_in/listings/override_price';
export const getMoveInApplicationsURL = '/api/core/move_in/applications';
export const assignMoveInApplicationURL = '/api/core/move_in/applications/assign';
export const getMoveInCustomersURL = '/api/core/move_in/customers';
export const updateMoveInCustomerURL = '/api/core/move_in/customers';
export const resetMoveInCustomerPasswordURL = '/api/core/move_in/customers/reset_password';
export const suspendMoveInCustomerURL = '/api/core/move_in/customers/suspend';
export const activateMoveInCustomerURL = '/api/core/move_in/customers/activate';
export const getMoveInPreferencesURL = '/api/core/move_in/preferences';
export const getMoveInLandlordsURL = '/api/core/move_in/landlords';
export const updateMoveInLandlordURL = '/api/core/move_in/landlords';
export const resetMoveInLandlordPasswordURL = '/api/core/move_in/landlords/reset_password';
export const assignMoveInModuleURL = '/api/core/move_in/landlords/assign';
export const revokeMoveInModuleURL = '/api/core/move_in/landlords/revoke';
export const getMoveInAuditLogsURL = '/api/core/move_in/audit_logs';
export const getMoveInViewingsURL = '/api/core/move_in/viewings';
export const getMoveInReservationsURL = '/api/core/move_in/reservations';
export const updateMoveInReservationURL = '/api/core/move_in/reservations';
export const getMoveInDealsURL = '/api/move_in/admin/deals';
export const convertMoveInDealURL = '/api/move_in/admin/deals'; // + /:dealId/convert
export const getMoveInCommissionsURL = '/api/move_in/admin/commissions';
export const updateMoveInCommissionURL = '/api/move_in/admin/commissions'; // + /:commissionId
