import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { makeRequest } from "../../utils/makeRequest";
import { setItem } from "../../utils/localStorage";
import { loginURL } from "../../utils/urls";
import { notifyError } from "../../utils/toast";
import GuestHeader from "../layout/GuestHeader";
import GuestFooter from "../layout/guestFooter";

function AdminLogin() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userName) {
      notifyError("Username is required.");
      return;
    }
    if (!password) {
      notifyError("Password is required.");
      return;
    }

    setLoading(true);
    const res = await makeRequest(loginURL, "POST", { userName, password });
    setLoading(false);

    if (!res.success) {
      notifyError(res.error || "Invalid admin credentials.");
      return;
    }

    const { user, authToken, refreshToken } = res.data;
    if (user?.type === "MoveInUser" || user?.type === "MoveInLandlordUser") {
      notifyError("Use tenant or landlord login for this account.");
      return;
    }

    await setItem("AGENTUSER", {
      ...user,
      role: "admin",
      authToken,
      refreshToken,
    });
    navigate("/move-in/admin/dashboard", { replace: true });
  };

  return (
    <div className="auth-page">
      <GuestHeader />
      <div className="auth-shell">
        <div className="auth-panel">
          <div className="auth-panel-brand">
            <div className="auth-panel-logo">
              <i className="fa-solid fa-user-shield" />
            </div>
            Admin Portal
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
            <h1>Manage Move-In</h1>
            <p>
              Review listings, applications, viewings, reservations, landlords,
              and tenant activity from the Move-In workspace.
            </p>
          </div>
          <div className="auth-panel-footer">
            <i className="fa-solid fa-shield-halved" /> Core admin access
          </div>
        </div>

        <div className="auth-form-side">
          <div className="auth-card">
            <h2 className="auth-card-title">Admin sign in</h2>
            <p className="auth-card-sub">
              Use your PayServe Core admin account.
            </p>
            <form onSubmit={handleSubmit} noValidate>
              <div className="auth-field">
                <label className="auth-label">Email or Phone</label>
                <input
                  className="auth-input"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
              <div className="auth-field">
                <label className="auth-label">Password</label>
                <div className="auth-input-wrap">
                  <input
                    className="auth-input"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <i className="fa-solid fa-eye-slash" />
                    ) : (
                      <i className="fa-solid fa-eye" />
                    )}
                  </button>
                </div>
              </div>
              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}{" "}
                <i className="fa-solid fa-arrow-right" />
              </button>
            </form>
            <div className="auth-footer-links">
              <Link to="/login">Tenant login</Link>
              <span style={{ color: "var(--mi-muted)" }}>•</span>
              <Link to="/landlord-login">Landlord login</Link>
            </div>
          </div>
        </div>
      </div>
      <GuestFooter />
    </div>
  );
}

export default AdminLogin;
