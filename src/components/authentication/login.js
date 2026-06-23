import React, { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  inputLoginEmail,
  inputLoginPassword,
  updateSpinner,
} from "../../features/authentication/authenticationReducer";
import { makeRequest } from "../../utils/makeRequest";
import { setItem } from "../../utils/localStorage";
import { moveInLoginURL } from "../../utils/urls";
import GuestHeader from "../layout/GuestHeader";
import GuestFooter from "../layout/guestFooter";
import { Helmet } from "react-helmet-async";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loginEmail = useSelector((s) => s.authenticationReducer.loginEmail);
  const loginPassword = useSelector(
    (s) => s.authenticationReducer.loginPassword,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    dispatch(inputLoginEmail(""));
    dispatch(inputLoginPassword(""));
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    if (!loginEmail && !loginPassword) {
      setFormError("Email and password required");
      setFieldErrors({ email: true, password: true });
      return;
    }

    if (!loginEmail) {
      setFormError("Email is required.");
      setFieldErrors({ email: true });
      return;
    }
    if (!loginPassword) {
      setFormError("Password is required");
      setFieldErrors({ password: true });
      return;
    }

    dispatch(updateSpinner(true));
    const response = await makeRequest(moveInLoginURL, "POST", {
      email: loginEmail,
      password: loginPassword,
    });
    dispatch(updateSpinner(false));

    if (response.success) {
      const { user, authToken, refreshToken } = response.data;
      await setItem("AGENTUSER", { ...user, authToken, refreshToken });
      navigate("/move-in/dashboard", { replace: true });
    } else {
      setFormError("Invalid email or password. Please try again.");
      setFieldErrors({ email: true, password: true });
    }
  };

  return (
    <div className="auth-page">
      <Helmet>
        <title>Sign In | Move-In Kenya</title>
        <meta
          name="description"
          content="Sign in to your Move-In account to browse verified rental homes, track applications and manage your move in Nairobi."
        />
        <link rel="canonical" href="https://movein.ke/login" />
        <meta name="robots" content="noindex, follow" />
        <meta property="og:title" content="Sign In | Move-In Kenya" />
        <meta
          property="og:image"
          content="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:description"
          content="Access your Move-In tenant dashboard — browse listings, track applications and coordinate your move."
        />
        <meta property="og:url" content="https://movein.ke/login" />
        <meta property="og:type" content="website" />
      </Helmet>

      <GuestHeader />
      <div className="auth-shell">
        {/* ── Left panel ── */}
        <div className="auth-panel">
          <div className="auth-panel-brand">
            <div className="auth-panel-logo">
              <i className="fa-solid fa-house" />
            </div>
            Move-In
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
              by PayServe
            </span>
          </div>

          <div className="auth-panel-copy">
            <h1>Welcome back to Move-In</h1>
            <p>
              Your rental journey continues here — browse listings, track
              applications, and manage your move from one dashboard.
            </p>
            <ul className="auth-panel-list">
              {[
                "Browse verified properties",
                "Track your application status",
                "Coordinate your move-in",
                "Communicate with your landlord",
              ].map((item) => (
                <li key={item}>
                  <span className="dot" /> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="auth-panel-footer">
            <i className="fa-solid fa-shield-halved" />
            Secure &amp; encrypted access
          </div>
        </div>

        {/* ── Right form ── */}
        <div className="auth-form-side">
          <div className="auth-card">
            <h2 className="auth-card-title">Tenant Login</h2>
            <p className="auth-card-sub">
              Don&apos;t have one?{" "}
              <Link
                to="/register"
                className="primary"
                style={{ color: "var(--mi-brand)", fontWeight: 600 }}
              >
                Create a free account
              </Link>
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <div className="auth-field">
                <label className="auth-label" htmlFor="login-email">
                  Email Address
                </label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  className={`auth-input ${fieldErrors.email ? "auth-input--error" : ""}`}
                  placeholder="you@example.com"
                  value={loginEmail}
                  onChange={(e) => dispatch(inputLoginEmail(e.target.value))}
                  autoComplete="email"
                  required
                />
              </div>
              <div className="auth-field">
                <label className="auth-label" htmlFor="login-password">
                  Password
                </label>
                <div className="auth-input-wrap ">
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className={`auth-input ${fieldErrors.password ? "auth-input--error" : ""}`}
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) =>
                      dispatch(inputLoginPassword(e.target.value))
                    }
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label="Toggle password visibility"
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

              {formError && (
                <div className="auth-error-banner">
                  <i className="fa-solid fa-circle-exclamation" />
                  {formError}
                </div>
              )}
              <button type="submit" className="auth-btn">
                Sign In <i className="fa-solid fa-arrow-right" />
              </button>
            </form>

            <div className="auth-footer-links">
              <Link to="/forgot-password">Forgot password?</Link>
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

export default Login;
