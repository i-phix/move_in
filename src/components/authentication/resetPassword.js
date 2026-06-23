import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { makeRequest } from "../../utils/makeRequest";
import {
  moveInVerifyResetOtpURL,
  moveInResetPasswordURL,
} from "../../utils/urls";
import { notifySuccess } from "../../utils/toast";
import GuestHeader from "../layout/GuestHeader";
import GuestFooter from "../layout/guestFooter";
import PasswordInput, {
  getPasswordStrength,
  passwordStrengthMessage,
} from "../common/PasswordInput";

function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search || "");

  const [email, setEmail] = useState(
    location.state?.email || query.get("email") || "",
  );
  const [otp, setOtp] = useState(query.get("otp") || "");
  const [otpVerified, setOtpVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resetting, setResetting] = useState(false);

  // OTP form errors
  const [otpFormError, setOtpFormError] = useState(null);
  const [otpFieldErrors, setOtpFieldErrors] = useState({});

  // Reset password form errors
  const [resetFormError, setResetFormError] = useState(null);
  const [resetFieldErrors, setResetFieldErrors] = useState({});

  const confirmPasswordError =
    confirmPassword && password !== confirmPassword
      ? "Passwords do not match."
      : "";

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setOtpFormError(null);
    setOtpFieldErrors({});

    const errors = {};
    if (!email) errors.email = "Email address is required.";
    if (!otp) errors.otp = "Reset code is required.";

    if (Object.keys(errors).length > 0) {
      setOtpFieldErrors(errors);
      setOtpFormError(Object.values(errors)[0]);
      return;
    }

    setVerifying(true);
    const res = await makeRequest(moveInVerifyResetOtpURL, "POST", {
      email,
      otp,
    });
    setVerifying(false);

    if (res.success && res.data?.success) {
      setOtpVerified(true);
    } else {
      const errMsg = res.error || res.data?.error || "Invalid or expired code.";
      // Map to specific field if possible
      if (
        errMsg.toLowerCase().includes("otp") ||
        errMsg.toLowerCase().includes("code") ||
        errMsg.toLowerCase().includes("expired")
      ) {
        setOtpFieldErrors({ otp: errMsg });
      } else if (errMsg.toLowerCase().includes("email")) {
        setOtpFieldErrors({ email: errMsg });
      }
      setOtpFormError(errMsg);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setResetFormError(null);
    setResetFieldErrors({});

    const errors = {};
    if (!getPasswordStrength(password).isStrong) {
      errors.password = passwordStrengthMessage;
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(errors).length > 0) {
      setResetFieldErrors(errors);
      setResetFormError(Object.values(errors)[0]);
      return;
    }

    setResetting(true);
    const res = await makeRequest(moveInResetPasswordURL, "POST", {
      email,
      otp,
      newPassword: password,
    });
    setResetting(false);

    if (res.success && res.data?.success) {
      notifySuccess("Password reset successfully. You can now log in.");
      navigate("/login", { replace: true });
    } else {
      const errMsg =
        res.error || res.data?.error || "Failed to reset password.";
      setResetFormError(errMsg);
    }
  };

  return (
    <div>
      <GuestHeader />
      <div className="auth-shell">
        <div className="auth-panel">
          <div className="auth-panel-brand">
            <div className="auth-panel-logo">
              <i className="fa-solid fa-key" />
            </div>
            Reset Password
            <span
              style={{
                fontSize: "0.65rem",
                fontWeight: 700,
                color: "rgba(255,255,255,0.5)",
                letterSpacing: "0.06em",
                alignSelf: "flex-end",
                marginBottom: 3,
              }}
            >
              Move-In
            </span>
          </div>
          <div className="auth-panel-copy">
            <h1>Set a new password</h1>
            <p>
              {otpVerified
                ? "Enter and confirm your new password."
                : "Enter the code sent to your email."}
            </p>
          </div>
          <div className="auth-panel-footer">
            <i className="fa-solid fa-shield-halved" />
            Security verified
          </div>
        </div>

        <div className="auth-form-side">
          <div className="auth-card">
            <h2 className="auth-card-title">Reset Password</h2>

            {/* ── Step 1: Verify OTP ── */}
            {!otpVerified ? (
              <form onSubmit={handleVerifyOtp} noValidate>
                <div className="auth-field">
                  <label className="auth-label">Email Address</label>
                  <input
                    className={`auth-input${otpFieldErrors.email ? " is-invalid" : ""}`}
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setOtpFieldErrors((p) => ({ ...p, email: "" }));
                      setOtpFormError(null);
                    }}
                    required
                  />
                  {otpFieldErrors.email && (
                    <div className="auth-field-error">
                      {otpFieldErrors.email}
                    </div>
                  )}
                </div>

                <div className="auth-field">
                  <label className="auth-label">Reset Code</label>
                  <input
                    className={`auth-input${otpFieldErrors.otp ? " is-invalid" : ""}`}
                    type="text"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value);
                      setOtpFieldErrors((p) => ({ ...p, otp: "" }));
                      setOtpFormError(null);
                    }}
                    placeholder="6-digit code"
                    maxLength={6}
                    required
                  />
                  {otpFieldErrors.otp && (
                    <div className="auth-field-error">{otpFieldErrors.otp}</div>
                  )}
                </div>

                {otpFormError && (
                  <div className="auth-error-banner">
                    <i className="fa-solid fa-circle-exclamation" />
                    {otpFormError}
                  </div>
                )}

                <button className="auth-btn" type="submit" disabled={verifying}>
                  {verifying ? "Verifying…" : "Verify Code"}
                </button>
              </form>
            ) : (
              /* ── Step 2: Reset Password ── */
              <form onSubmit={handleResetPassword} noValidate>
                <div className="auth-field">
                  <label className="auth-label">New Password</label>
                  <PasswordInput
                    id="reset-password"
                    name="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setResetFieldErrors((p) => ({ ...p, password: "" }));
                      setResetFormError(null);
                    }}
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    required
                    showStrength
                    error={resetFieldErrors.password || ""}
                  />
                </div>

                <div className="auth-field">
                  <label className="auth-label">Confirm Password</label>
                  <PasswordInput
                    id="reset-confirm-password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setResetFieldErrors((p) => ({
                        ...p,
                        confirmPassword: "",
                      }));
                      setResetFormError(null);
                    }}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    required
                    error={
                      resetFieldErrors.confirmPassword || confirmPasswordError
                    }
                  />
                </div>

                {resetFormError && (
                  <div className="auth-error-banner">
                    <i className="fa-solid fa-circle-exclamation" />
                    {resetFormError}
                  </div>
                )}

                <button className="auth-btn" type="submit" disabled={resetting}>
                  {resetting ? "Updating…" : "Update Password"}
                </button>
              </form>
            )}

            <div className="auth-footer-links">
              <Link to="/login">Back to login</Link>
            </div>
          </div>
        </div>
      </div>
      <GuestFooter />
    </div>
  );
}

export default ResetPassword;
