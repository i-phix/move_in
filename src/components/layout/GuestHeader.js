import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home, ArrowRight, Menu, X, ChevronRight } from "lucide-react";
import { clearStorage } from "../../utils/localStorage";

const T = {
  ink: "var(--mi-ink)",
  muted: "var(--mi-muted)",
  line: "var(--mi-line)",
  brand: "var(--mi-brand)",
  button: "var(--mi-button)",
};

const guestHeaderCss = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  .mi-mobile-nav { display: none !important; }
  .mi-footer-top { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr; }
  @media (max-width: 1080px) {
    .mi-footer-top { grid-template-columns: 1fr 1fr !important; }
  }
  @media (max-width: 680px) {
    .mi-desktop-nav { display: none !important; }
    .mi-mobile-nav  { display: flex !important; }
    .mi-footer-top  { grid-template-columns: 1fr 1fr !important; }
  }
`;

// transparent: true = overlay mode (used on landing page hero)
// activeLink: 'listings' | null — highlights the active nav link
function GuestHeader({ activeLink, transparent }) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // For transparent mode turn solid when the hero is ~80% scrolled past
    const threshold = transparent ? window.innerHeight * 0.8 : 12;
    const fn = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, [transparent]);

  const handleLogin = async () => {
    await clearStorage();
    navigate("/login");
  };
  const handleRegister = async () => {
    await clearStorage();
    navigate("/preferences");
  };
  const handleListings = () => navigate("/listings");
  const handleHome = () => navigate("/");

  const onLanding = window.location.pathname === "/";
  const links = [
    {
      label: "Rent a Home",
      href: onLanding ? "#search" : "/",
      action: onLanding ? null : handleHome,
    },
    {
      label: "How It Works",
      href: onLanding ? "#how-it-works" : "/",
      action: onLanding ? null : handleHome,
    },
    {
      label: "Portals",
      href: onLanding ? "#portals" : "/",
      action: onLanding ? null : handleHome,
    },
    { label: "Listings", href: null, action: handleListings },
  ];

  // When transparent AND not scrolled: glass/overlay mode
  const glass = transparent && !scrolled;

  const bg = glass ? "transparent" : "rgba(255,255,255,0.97)";
  const border = glass
    ? "1px solid rgba(255,255,255,0.14)"
    : `1px solid ${T.line}`;
  const shadow = glass
    ? "none"
    : scrolled
      ? "0 4px 24px rgba(17,24,39,0.08)"
      : "none";
  const logoColor = glass ? "#fff" : T.ink;
  const subColor = glass ? "rgba(255,255,255,0.55)" : T.brand;
  const iconShadow = glass ? "none" : "0 6px 16px rgba(245,166,35,0.3)";

  return (
    <>
      <style>{guestHeaderCss}</style>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: bg,
          borderBottom: border,
          backdropFilter: glass ? "none" : "blur(12px)",
          boxShadow: shadow,
          transition:
            "background 0.35s ease, border-color 0.35s ease, box-shadow 0.2s ease",
        }}
      >
        <div
          style={{ width: "min(1160px,calc(100% - 48px))", margin: "0 auto" }}
        >
          <nav
            style={{
              height: 72,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            {/* Brand */}
            <button
              onClick={handleHome}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                color: logoColor,
                fontWeight: 800,
                fontSize: "1.45rem",
                letterSpacing: "-0.03em",
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "color 0.35s ease",
              }}
            >
              <span
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "var(--mi-brand)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: iconShadow,
                  flexShrink: 0,
                  transition: "box-shadow 0.35s ease",
                }}
              >
                <Home size={20} color="#fff" strokeWidth={2.5} />
              </span>
              Move-In
              <span
                style={{
                  color: subColor,
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  alignSelf: "flex-end",
                  marginBottom: 3,
                  opacity: 0.85,
                  transition: "color 0.35s ease",
                }}
              >
                by PayServe
              </span>
            </button>

            {/* Desktop links */}
            <div
              className="mi-desktop-nav"
              style={{ display: "flex", gap: 28, fontSize: "0.92rem" }}
            >
              {links.map((l) => {
                const isActive =
                  activeLink && l.label.toLowerCase().includes(activeLink);
                const color = glass
                  ? isActive
                    ? "#fff"
                    : "rgba(255,255,255,0.88)"
                  : isActive
                    ? T.brand
                    : "#384152";
                return l.action ? (
                  <button
                    key={l.label}
                    onClick={l.action}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      color,
                      fontWeight: isActive ? 700 : 500,
                      cursor: "pointer",
                      fontSize: "0.92rem",
                      fontFamily: "inherit",
                      transition: "color 0.35s ease",
                    }}
                  >
                    {l.label}
                  </button>
                ) : (
                  <a
                    key={l.href}
                    href={l.href}
                    style={{
                      textDecoration: "none",
                      color,
                      fontWeight: 500,
                      transition: "color 0.35s ease",
                    }}
                  >
                    {l.label}
                  </a>
                );
              })}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                onClick={handleLogin}
                className="mi-desktop-nav"
                style={{
                  height: 40,
                  padding: "0 18px",
                  borderRadius: 10,
                  border: glass
                    ? "1px solid rgba(255,255,255,0.4)"
                    : `1px solid ${T.line}`,
                  background: glass ? "rgba(255,255,255,0.08)" : "#fff",
                  color: glass ? "#fff" : T.ink,
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  transition: "all 0.35s ease",
                }}
              >
                Sign In
              </button>
              <button
                onClick={handleRegister}
                style={{
                  height: 40,
                  padding: "0 18px",
                  borderRadius: 10,
                  border: "none",
                  background: T.brand,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  boxShadow: "0 5px 14px rgba(17,27,69,0.18)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                Get Started <ArrowRight size={15} />
              </button>
              <button
                onClick={() => setOpen((o) => !o)}
                className="mi-mobile-nav"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  border: glass
                    ? "1px solid rgba(255,255,255,0.4)"
                    : `1px solid ${T.line}`,
                  background: glass ? "rgba(255,255,255,0.08)" : "#fff",
                  display: "none",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                {open ? (
                  <X size={18} color={glass ? "#fff" : T.ink} />
                ) : (
                  <Menu size={18} color={glass ? "#fff" : T.ink} />
                )}
              </button>
            </div>
          </nav>

          {/* Mobile menu */}
          {open && (
            <div
              className="mi-mobile-nav"
              style={{
                borderTop: glass
                  ? "1px solid rgba(255,255,255,0.14)"
                  : `1px solid ${T.line}`,
                background: glass ? "rgba(10,15,35,0.92)" : "#fff",
                padding: "16px 0 20px",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              {links.map((l) => {
                const c = glass ? "rgba(255,255,255,0.9)" : T.ink;
                return l.action ? (
                  <button
                    key={l.label}
                    onClick={() => {
                      l.action();
                      setOpen(false);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      padding: "10px 0",
                      color: c,
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottom: glass
                        ? "1px solid rgba(255,255,255,0.1)"
                        : `1px solid ${T.line}`,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {l.label}{" "}
                    <ChevronRight
                      size={16}
                      color={glass ? "rgba(255,255,255,0.5)" : T.muted}
                    />
                  </button>
                ) : (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    style={{
                      padding: "10px 0",
                      textDecoration: "none",
                      color: c,
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottom: glass
                        ? "1px solid rgba(255,255,255,0.1)"
                        : `1px solid ${T.line}`,
                    }}
                  >
                    {l.label}{" "}
                    <ChevronRight
                      size={16}
                      color={glass ? "rgba(255,255,255,0.5)" : T.muted}
                    />
                  </a>
                );
              })}
              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <button
                  onClick={handleLogin}
                  style={{
                    flex: 1,
                    height: 44,
                    borderRadius: 10,
                    border: glass
                      ? "1px solid rgba(255,255,255,0.4)"
                      : `1px solid ${T.line}`,
                    background: glass ? "rgba(255,255,255,0.08)" : "#fff",
                    color: glass ? "#fff" : T.ink,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Sign In
                </button>
                <button
                  onClick={handleRegister}
                  style={{
                    flex: 1,
                    height: 44,
                    borderRadius: 10,
                    border: "none",
                    background: T.brand,
                    color: "#fff",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}

export default GuestHeader;
