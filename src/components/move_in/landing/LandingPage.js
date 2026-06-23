import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  Search,
  MapPin,
  Building2,
  User,
  Wrench,
  Play,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  BadgeCheck,
  BedDouble,
  Bath,
  Maximize2,
  LayoutDashboard,
  Heart,
  Eye,
  KeyRound,
  Calendar,
  FileText,
  CheckCircle,
  CreditCard,
} from "lucide-react";
import GuestHeader from "../../layout/GuestHeader";
import Footer from "../../layout/footer";
import { makeRequest } from "../../../utils/makeRequest";
import { getListingsURL, getListingLocationsURL } from "../../../utils/urls";

const T = {
  ink: "var(--mi-ink)",
  muted: "var(--mi-muted)",
  line: "var(--mi-line)",
  bg: "var(--mi-bg)",
  surface: "var(--mi-surface)",
  brand: "var(--mi-brand)",
  button: "var(--mi-button)",
  accent: "var(--mi-accent)",
};

const HERO_SLIDES = [
  {
    img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1800&q=80",
    title: "Search and Find\nYour Next Home",
    desc: "Move-In digitises the full rental journey — from discovery and viewings to application, approval, payment, and handover. Built for Kenya.",
  },
  {
    img: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1800&q=80",
    title: "The Right Place\nfor House Finding",
    desc: "Browse verified listings across Nairobi. Every unit is quality-checked, priced transparently, and ready for you to visit.",
  },
  {
    img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1800&q=80",
    title: "Modern Living,\nSimplified",
    desc: "From application to handover checklist — secure your next home entirely online with full digital support.",
  },
];

/* ─── Static data ─── */
const FOCUS_CARDS = [
  {
    icon: Home,
    title: "Find a Home",
    desc: "Browse verified listings across Nairobi by location, budget, and move-in date. Every unit is quality-checked.",
  },
  {
    icon: Calendar,
    title: "Book a Viewing",
    desc: "Schedule your visit online in a few taps. Caretakers are notified automatically — no chasing required.",
  },
  {
    icon: KeyRound,
    title: "Move In Smoothly",
    desc: "Digital application, secure payment, and a full handover checklist — your new home ready without the hassle.",
  },
];

/* Fallback images keyed by location name (used when API location has no image) */
const LOCATION_IMGS = {
  Westlands:
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=700&q=80",
  Kilimani:
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=700&q=80",
  Karen:
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=700&q=80",
  default:
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=700&q=80",
};

const PORTALS = [
  {
    icon: User,
    label: "Tenant Portal",
    sub: "Search · Apply · Move In",
    color: "#fff7e6",
    text: "#c27a0a",
  },
  {
    icon: Building2,
    label: "Landlord Portal",
    sub: "List · Verify · Approve",
    color: "#dcfce7",
    text: "#166534",
  },
  {
    icon: Wrench,
    label: "Caretaker Portal",
    sub: "Coordinate · Upload · Handover",
    color: "#fef9c3",
    text: "#854d0e",
  },
  {
    icon: LayoutDashboard,
    label: "Admin Console",
    sub: "Moderate · Audit · Manage",
    color: "#f3e8ff",
    text: "#6b21a8",
  },
];

const STEPS = [
  {
    icon: Search,
    label: "Search",
    title: "Search & Discover",
    desc: "Browse verified listings across Nairobi by location, budget, and move-in date.",
  },
  {
    icon: Calendar,
    label: "View",
    title: "Book a Viewing",
    desc: "Schedule your visit online. Caretakers coordinate — no chasing required.",
  },
  {
    icon: FileText,
    label: "Apply",
    title: "Apply Online",
    desc: "Submit your rental application digitally. No paperwork queues.",
  },
  {
    icon: CheckCircle,
    label: "Approve",
    title: "Get Approved",
    desc: "Landlords review and approve through the platform — transparent and fast.",
  },
  {
    icon: CreditCard,
    label: "Pay",
    title: "Reserve & Pay",
    desc: "Secure your unit with a deposit and first rent via M-Pesa, card, or bank.",
  },
  {
    icon: KeyRound,
    label: "Move In",
    title: "Move In",
    desc: "Handover coordinated, checklist completed — your new home is ready.",
  },
];

const TESTIMONIALS = [
  {
    name: "Amina Wanjiku",
    role: "Tenant",
    initials: "AW",
    color: "#fff7e6",
    text: "#c27a0a",
    quote:
      "Found my apartment in Kilimani in two days. The viewing was booked online and the caretaker was already expecting me. Incredibly smooth process.",
  },
  {
    name: "Brian Otieno",
    role: "Tenant",
    initials: "BO",
    color: "#dcfce7",
    text: "#166534",
    quote:
      "Move-In made the whole rental process transparent. I could see exactly what I was paying and when. No hidden charges, no surprises at handover.",
  },
  {
    name: "Cynthia Mwangi",
    role: "Tenant",
    initials: "CM",
    color: "#f3e8ff",
    text: "#6b21a8",
    quote:
      "The digital application saved me so much time. I submitted everything from my phone and got approval within 48 hours. Highly recommend.",
  },
];

/* ─── Shared section label — Quarter style ─── */
function SectionLabel({ children }) {
  return (
    <div
      style={{
        color: T.brand,
        fontWeight: 700,
        fontSize: "0.78rem",
        textTransform: "uppercase",
        letterSpacing: "0.14em",
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Hero (with embedded search bar) ─── */
function Hero({ onBrowseListings, onSearch }) {
  const [slide, setSlide] = useState(0);
  const [location, setLocation] = useState("");
  const [area, setArea] = useState("");
  const [purpose, setPurpose] = useState("");
  const [type, setType] = useState("");

  useEffect(() => {
    const t = setInterval(
      () => setSlide((s) => (s + 1) % HERO_SLIDES.length),
      5000,
    );
    return () => clearInterval(t);
  }, []);

  const prev = () =>
    setSlide((s) => (s - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  const next = () => setSlide((s) => (s + 1) % HERO_SLIDES.length);

  const Dropdown = ({ value, onChange, opts, placeholder }) => (
    <div
      className="mi-search-field"
      style={{
        position: "relative",
        flex: 1,
        borderRight: `1px solid ${T.line}`,
      }}
    >
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          height: 54,
          padding: "0 32px 0 16px",
          border: 0,
          background: "#fff",
          color: value ? T.ink : "#9ca3af",
          fontSize: "0.92rem",
          cursor: "pointer",
          appearance: "none",
          fontFamily: "inherit",
          outline: "none",
        }}
      >
        <option value="">{placeholder}</option>
        {opts.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronRight
        size={13}
        color="#9ca3af"
        style={{
          position: "absolute",
          right: 10,
          top: "50%",
          transform: "translateY(-50%) rotate(90deg)",
          pointerEvents: "none",
        }}
      />
    </div>
  );

  return (
    <section
      id="top"
      style={{
        position: "relative",
        marginTop: -72,
        height: "100vh",
        minHeight: 560,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      {/* Backgrounds sit in their own overflow-hidden box so they don't clip the search bar */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        {HERO_SLIDES.map((s, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${s.img})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: i === slide ? 1 : 0,
              transition: "opacity 1s ease",
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(10,15,35,0.65)",
          }}
        />
      </div>

      {/* Prev / Next arrows */}
      {[
        { Icon: ChevronLeft, side: "left", fn: prev },
        { Icon: ChevronRight, side: "right", fn: next },
      ].map(({ Icon, side, fn }) => (
        <button
          key={side}
          onClick={fn}
          style={{
            position: "absolute",
            top: "50%",
            [side]: 24,
            transform: "translateY(-50%)",
            zIndex: 3,
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            backdropFilter: "blur(4px)",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.22)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.12)")
          }
        >
          <Icon size={22} color="#fff" strokeWidth={2} />
        </button>
      ))}

      {/* Main content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "min(1160px,calc(100% - 48px))",
          margin: "0 auto",
          padding: "72px 0 0",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          className="mi-hero-content"
          style={{ maxWidth: 560, color: "#fff", marginBottom: 40 }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(245,166,35,0.18)",
              border: "1px solid rgba(245,166,35,0.5)",
              borderRadius: 4,
              padding: "4px 12px",
              fontSize: "0.76rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 20,
              color: "#fcd975",
            }}
          >
            Real Estate Platform · Kenya
          </div>
          <h1
            style={{
              fontSize: "clamp(2.4rem,4.5vw,3.6rem)",
              lineHeight: 1.08,
              letterSpacing: "-0.04em",
              margin: "0 0 18px",
              fontWeight: 800,
              whiteSpace: "pre-line",
            }}
          >
            {HERO_SLIDES.map((s, i) => (
              <span
                key={i}
                aria-hidden={i !== slide}
                style={{ display: i === slide ? "block" : "none" }}
              >
                {s.title}
              </span>
            ))}
          </h1>
          <p
            style={{
              margin: "0 0 32px",
              color: "rgba(255,255,255,0.72)",
              fontSize: "1.04rem",
              lineHeight: 1.7,
              maxWidth: 480,
            }}
          >
            {HERO_SLIDES[slide].desc}
          </p>
          <button
            onClick={() => onBrowseListings()}
            style={{
              height: 48,
              padding: "0 32px",
              borderRadius: 6,
              border: "none",
              background: T.brand,
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.95rem",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 8px 24px rgba(245,166,35,0.4)",
              fontFamily: "inherit",
            }}
          >
            Browse Listings <ArrowRight size={16} />
          </button>
        </div>

        {/* Slide dots */}
        <div
          className="mi-hero-dots"
          style={{ display: "flex", gap: 8, marginBottom: 0 }}
        >
          {HERO_SLIDES.map((_, i) => (
            <div
              key={i}
              onClick={() => setSlide(i)}
              style={{
                height: 4,
                borderRadius: 2,
                width: i === slide ? 28 : 12,
                background: i === slide ? T.brand : "rgba(255,255,255,0.35)",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      </div>

      {/* Search bar — absolutely anchored to hero bottom, fully in view */}
      <div
        className="mi-hero-search"
        style={{
          position: "absolute",
          bottom: 40,
          left: 0,
          right: 0,
          zIndex: 10,
          width: "min(1160px,calc(100% - 48px))",
          margin: "0 auto",
        }}
      >
        <div
          className="mi-search-bar"
          style={{
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 16px 56px rgba(10,15,35,0.22)",
            border: `1px solid ${T.line}`,
          }}
        >
          {/* Location */}
          <div
            className="mi-search-field"
            style={{
              flex: 1.2,
              position: "relative",
              borderRight: `1px solid ${T.line}`,
            }}
          >
            <MapPin
              size={15}
              color="#9ca3af"
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            />
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{
                width: "100%",
                height: 54,
                border: 0,
                outline: 0,
                padding: "0 14px 0 38px",
                fontSize: "0.92rem",
                color: T.ink,
                background: "transparent",
                fontFamily: "inherit",
              }}
            />
          </div>
          {/* Area */}
          <div
            className="mi-search-field"
            style={{
              flex: 1.2,
              position: "relative",
              borderRight: `1px solid ${T.line}`,
            }}
          >
            <input
              type="text"
              placeholder="Choose Area"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              style={{
                width: "100%",
                height: 54,
                border: 0,
                outline: 0,
                padding: "0 16px",
                fontSize: "0.92rem",
                color: T.ink,
                background: "transparent",
                fontFamily: "inherit",
              }}
            />
          </div>
          {/* Property Status */}
          <Dropdown
            value={purpose}
            onChange={setPurpose}
            opts={["Rent", "Buy"]}
            placeholder="Property Status"
          />
          {/* Property Type */}
          <Dropdown
            value={type}
            onChange={setType}
            opts={["Apartment", "House", "Studio", "Bedsitter", "Commercial"]}
            placeholder="Property Type"
          />
          {/* Search button */}
          <button
            className="mi-search-btn"
            onClick={() => onSearch(location || area, purpose, type)}
            style={{
              padding: "0 36px",
              background: T.brand,
              color: "#fff",
              border: "none",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: "pointer",
              letterSpacing: "0.07em",
              fontFamily: "inherit",
              flexShrink: 0,
              transition: "background 0.2s",
              display: "flex",
              alignItems: "center",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = T.accent)}
            onMouseLeave={(e) => (e.currentTarget.style.background = T.brand)}
          >
            SEARCH
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─── Our Main Focus ─── */
function OurMainFocus({ onRegister }) {
  return (
    <section style={{ padding: "72px 0 72px", background: "#fff" }}>
      <div style={{ width: "min(1160px,calc(100% - 48px))", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <SectionLabel>Our Solution</SectionLabel>
          <h2
            style={{
              margin: "0 0 12px",
              fontSize: "clamp(1.9rem,3vw,2.5rem)",
              letterSpacing: "-0.04em",
              color: T.ink,
              fontWeight: 800,
            }}
          >
            Our Main Focus
          </h2>
          <p
            style={{
              margin: "0 auto",
              maxWidth: 540,
              color: T.muted,
              lineHeight: 1.65,
            }}
          >
            From verified listings and scheduling to applications, payments, and
            smooth handovers — all in one platform built for Kenya.
          </p>
        </div>

        <div
          className="mi-focus-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 24,
          }}
        >
          {FOCUS_CARDS.map(({ icon: Icon, title, desc }) => (
            <article
              key={title}
              style={{
                border: `1px solid ${T.line}`,
                borderRadius: 8,
                padding: "36px 28px",
                textAlign: "center",
                background: "#fff",
                transition: "box-shadow 0.2s, transform 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 12px 40px rgba(10,15,35,0.1)";
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "none";
              }}
            >
              <div
                style={{
                  width: 68,
                  height: 68,
                  margin: "0 auto 22px",
                  borderRadius: "50%",
                  background: "#fff7e6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={30} color={T.brand} strokeWidth={1.6} />
              </div>
              <h3
                style={{
                  margin: "0 0 12px",
                  fontSize: "1.15rem",
                  fontWeight: 800,
                  color: T.ink,
                  letterSpacing: "-0.02em",
                }}
              >
                {title}
              </h3>
              <p
                style={{
                  margin: "0 0 20px",
                  color: T.muted,
                  fontSize: "0.9rem",
                  lineHeight: 1.65,
                }}
              >
                {desc}
              </p>
              <button
                onClick={onRegister}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: T.brand,
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontFamily: "inherit",
                }}
              >
                Find it here <ChevronRight size={14} />
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Properties By Location ─── */
function PropertiesByLocation() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    makeRequest(getListingLocationsURL, "GET").then((res) => {
      if (res.success) setLocations(res.data?.data || []);
      setLoading(false);
    });
  }, []);

  if (!loading && !locations.length) return null;

  return (
    <section style={{ padding: "72px 0", background: "#f8f9fb" }}>
      <div style={{ width: "min(1160px,calc(100% - 48px))", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <SectionLabel>Our Properties</SectionLabel>
          <h2
            style={{
              margin: "0 0 12px",
              fontSize: "clamp(1.9rem,3vw,2.5rem)",
              letterSpacing: "-0.04em",
              color: T.ink,
              fontWeight: 800,
            }}
          >
            Properties By Location
          </h2>
          <p
            style={{
              margin: "0 auto",
              maxWidth: 480,
              color: T.muted,
              lineHeight: 1.65,
            }}
          >
            Explore verified rentals across Nairobi's most sought-after
            neighbourhoods.
          </p>
        </div>
        <div
          className="mi-loc-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 22,
          }}
        >
          {(loading ? [{}, {}, {}] : locations).map((loc, idx) => {
            if (loading)
              return (
                <div
                  key={idx}
                  style={{
                    height: 260,
                    borderRadius: 8,
                    background: "var(--mi-line)",
                  }}
                />
              );
            const name =
              loc.name || loc.location || loc.city || loc.facility || "Nairobi";
            const count = loc.count ?? loc.total ?? 0;
            const image = loc.image;
            const img = image || LOCATION_IMGS[name] || LOCATION_IMGS.default;
            return (
              <a
                key={name}
                href={`/listings?location=${encodeURIComponent(name)}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/listings?location=${encodeURIComponent(name)}`);
                }}
                style={{
                  display: "block",
                  position: "relative",
                  borderRadius: 8,
                  overflow: "hidden",
                  cursor: "pointer",
                  height: 260,
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  const img = e.currentTarget.querySelector("img");
                  console.log("img element:", img);
                  if (img) img.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  const img = e.currentTarget.querySelector("img");
                  if (img) img.style.transform = "scale(1)";
                }}
              >
                <img
                  src={img}
                  alt={`Rental properties in ${name}, Nairobi — verified homes for rent`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.4s ease",
                    display: "block",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(10,15,35,0.45)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 14,
                    left: 14,
                    background: "#fff",
                    color: T.ink,
                    fontSize: "0.76rem",
                    fontWeight: 700,
                    borderRadius: 4,
                    padding: "4px 10px",
                  }}
                >
                  {count ?? 0} Properties
                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: "20px 18px",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: "1.15rem",
                      color: "#fff",
                      marginBottom: 6,
                    }}
                  >
                    {name}, Nairobi
                  </div>
                  <button
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      color: "rgba(255,255,255,0.8)",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      fontFamily: "inherit",
                    }}
                  >
                    View Properties <ChevronRight size={13} />
                  </button>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Featured Listings ─── */
function FeaturedListingCard({ unit, onClick }) {
  const rawImg = unit.moveInImages?.[0] || unit.images?.[0];
  const img = rawImg
    ? typeof rawImg === "object"
      ? rawImg.url
      : rawImg
    : null;
  const loc = unit.facilityId?.location || "";
  const type = unit.listingType || "rent";
  return (
    <article
      style={{
        background: "#fff",
        border: `1px solid ${T.line}`,
        borderRadius: 8,
        overflow: "hidden",
        transition: "box-shadow 0.2s, transform 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 16px 48px rgba(10,15,35,0.12)";
        e.currentTarget.style.transform = "translateY(-4px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "none";
      }}
    >
      <div
        style={{
          position: "relative",
          height: 200,
          overflow: "hidden",
          cursor: "pointer",
          background: "var(--mi-line)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={onClick}
      >
        {img ? (
          <img
            src={img}
            alt={`${unit.name}${loc ? ` in ${loc}` : ""} — ${type === "sale" ? "for sale" : "for rent"} in Nairobi, Kenya`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.35s",
            }}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.04)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          />
        ) : (
          <Home size={40} color="var(--mi-line)" strokeWidth={1.5} />
        )}
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            background: type === "sale" ? "#059669" : T.brand,
            color: "#fff",
            fontSize: "0.7rem",
            fontWeight: 800,
            padding: "3px 10px",
            borderRadius: 3,
            letterSpacing: "0.06em",
          }}
        >
          {type === "sale" ? "FOR SALE" : "FOR RENT"}
        </div>
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "#fff",
            color: "#166534",
            fontSize: "0.72rem",
            fontWeight: 700,
            padding: "3px 8px",
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <BadgeCheck size={11} color="#16a34a" /> Verified
        </div>
      </div>

      <div style={{ padding: "16px 18px 0" }}>
        <div
          style={{
            fontWeight: 800,
            fontSize: "1.05rem",
            color: T.brand,
            marginBottom: 4,
          }}
        >
          {unit.moveInPrice ? (
            <>
              KES {Number(unit.moveInPrice).toLocaleString()}
              <span
                style={{ fontWeight: 500, color: T.muted, fontSize: "0.82rem" }}
              >
                {type !== "sale" ? "/mo" : ""}
              </span>
            </>
          ) : (
            <span style={{ fontSize: "0.85rem", color: T.muted }}>
              Price on request
            </span>
          )}
        </div>
        <h3
          style={{
            margin: "0 0 5px",
            fontSize: "1rem",
            fontWeight: 700,
            color: T.ink,
            letterSpacing: "-0.01em",
          }}
        >
          <a
            href={unit._id ? `/listings/${unit._id}` : "/listings"}
            onClick={(e) => {
              e.preventDefault();
              onClick();
            }}
            style={{ color: "inherit", textDecoration: "none" }}
          >
            {unit.name}
          </a>
        </h3>
        {loc && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: "0.85rem",
              color: T.muted,
              marginBottom: 14,
            }}
          >
            <MapPin size={12} strokeWidth={2} /> {loc}
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: 18,
            fontSize: "0.85rem",
            color: T.muted,
            padding: "12px 0",
            borderTop: `1px solid ${T.line}`,
            borderBottom: `1px solid ${T.line}`,
          }}
        >
          {unit.moveInBedrooms != null && (
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <BedDouble size={13} color={T.ink} strokeWidth={2} />{" "}
              {unit.moveInBedrooms === 0
                ? "Studio"
                : `${unit.moveInBedrooms} Beds`}
            </span>
          )}
          {unit.moveInBathrooms != null && (
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Bath size={13} color={T.ink} strokeWidth={2} />{" "}
              {unit.moveInBathrooms} Baths
            </span>
          )}
          {unit.grossArea && (
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Maximize2 size={13} color={T.ink} strokeWidth={2} />{" "}
              {unit.grossArea} m²
            </span>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            padding: "12px 0",
          }}
        >
          {[Heart, Eye].map((Icon, i) => (
            <div
              key={i}
              style={{
                width: 30,
                height: 30,
                borderRadius: 4,
                border: `1px solid ${T.line}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                background: "#fff",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = T.brand)
              }
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = T.line)}
            >
              <Icon size={13} color={T.muted} strokeWidth={2} />
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function FeaturedListings({ onViewListings }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    makeRequest(`${getListingsURL}?limit=3`, "GET").then((res) => {
      if (res.success) setListings(res.data?.data || []);
      setLoading(false);
    });
  }, []);

  if (!loading && !listings.length) return null;

  return (
    <section
      id="featured-listings"
      aria-label="Featured rental listings in Nairobi"
      style={{ padding: "72px 0", background: "#fff" }}
    >
      <div style={{ width: "min(1160px,calc(100% - 48px))", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 44,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <SectionLabel>Properties</SectionLabel>
            <h2
              style={{
                margin: "0 0 8px",
                fontSize: "clamp(1.9rem,3vw,2.5rem)",
                letterSpacing: "-0.04em",
                color: T.ink,
                fontWeight: 800,
              }}
            >
              Featured Listings
            </h2>
            <p style={{ margin: 0, color: T.muted }}>
              Verified homes available across Nairobi — browse full listings to
              find your match.
            </p>
          </div>
          <button
            onClick={() => onViewListings()}
            style={{
              height: 42,
              padding: "0 22px",
              borderRadius: 6,
              border: `1.5px solid ${T.brand}`,
              background: "#fff",
              color: T.brand,
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 7,
              fontFamily: "inherit",
              flexShrink: 0,
            }}
          >
            View All <ArrowRight size={15} />
          </button>
        </div>

        <div
          className="mi-listings"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 24,
          }}
        >
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: 360,
                    borderRadius: 8,
                    background: "var(--mi-line)",
                  }}
                />
              ))
            : listings.map((u) => (
                <FeaturedListingCard
                  key={u._id || u.name}
                  unit={u}
                  onClick={
                    u._id ? () => onViewListings(u._id) : () => onViewListings()
                  }
                />
              ))}
        </div>
        {!loading && listings.length > 0 && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "ItemList",
                name: "Featured Rental Listings in Nairobi",
                url: "https://movein.ke/listings",
                itemListElement: listings.map((u, i) => ({
                  "@type": "ListItem",
                  position: i + 1,
                  item: {
                    "@type": "RealEstateListing",
                    name: u.name,
                    url: `https://movein.ke/listings/${u._id}`,
                    description: `${u.name} for ${u.listingType || "rent"} in ${u.facilityId?.location || "Nairobi"}, Kenya`,
                    offers: {
                      "@type": "Offer",
                      price: u.moveInPrice || 0,
                      priceCurrency: "KES",
                      availability: "https://schema.org/InStock",
                    },
                    address: {
                      "@type": "PostalAddress",
                      addressLocality: u.facilityId?.location || "Nairobi",
                      addressCountry: "KE",
                    },
                  },
                })),
              }),
            }}
          />
        )}
      </div>
    </section>
  );
}

/* ─── Video section ─── */
function VideoSection() {
  return (
    <section style={{ position: "relative", height: 440, overflow: "hidden" }}>
      <img
        src="https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1800&q=80"
        alt="Modern rental apartment interior in Nairobi — Move-In Kenya verified homes"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(10,15,35,0.45)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.95)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,0.35)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.3)";
          }}
        >
          <Play
            size={26}
            color={T.button}
            fill={T.button}
            style={{ marginLeft: 3 }}
          />
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works ─── */
function HowItWorks() {
  return (
    <section
      id="how-it-works"
      style={{ padding: "72px 0", background: "#f8f9fb" }}
    >
      <div style={{ width: "min(1160px,calc(100% - 48px))", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <SectionLabel>The Process</SectionLabel>
          <h2
            style={{
              margin: "0 0 12px",
              fontSize: "clamp(1.9rem,3vw,2.5rem)",
              letterSpacing: "-0.04em",
              color: T.ink,
              fontWeight: 800,
            }}
          >
            How It Works
          </h2>
          <p
            style={{
              margin: "0 auto",
              maxWidth: 520,
              color: T.muted,
              lineHeight: 1.65,
            }}
          >
            Six clear steps from search to move-in — all on one trusted
            platform.
          </p>
        </div>
        <div
          className="mi-steps"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 20,
          }}
        >
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                style={{
                  background: "#fff",
                  border: `1px solid ${T.line}`,
                  borderRadius: 8,
                  padding: "26px 22px",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 18,
                    right: 18,
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    color: T.brand,
                    background: "#fff7e6",
                    borderRadius: 4,
                    padding: "2px 8px",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 8,
                    background: "#fff7e6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <Icon size={22} color={T.brand} strokeWidth={1.8} />
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "0.7rem",
                    color: T.accent,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: 5,
                  }}
                >
                  {s.label}
                </div>
                <h3
                  style={{
                    margin: "0 0 8px",
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: T.ink,
                  }}
                >
                  {s.title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.87rem",
                    color: T.muted,
                    lineHeight: 1.6,
                  }}
                >
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Portals ─── */
function Portals({ onLogin }) {
  return (
    <section id="portals" style={{ padding: "72px 0", background: "#fff" }}>
      <div style={{ width: "min(1160px,calc(100% - 48px))", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <SectionLabel>Who It's For</SectionLabel>
          <h2
            style={{
              margin: "0 0 12px",
              fontSize: "clamp(1.9rem,3vw,2.5rem)",
              letterSpacing: "-0.04em",
              color: T.ink,
              fontWeight: 800,
            }}
          >
            One Platform, Four Portals
          </h2>
          <p
            style={{
              margin: "0 auto",
              maxWidth: 520,
              color: T.muted,
              lineHeight: 1.65,
            }}
          >
            Every participant in the rental journey has a dedicated,
            role-specific experience.
          </p>
        </div>
        <div
          className="mi-portals"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 18,
          }}
        >
          {PORTALS.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.label}
                onClick={onLogin}
                style={{
                  background: p.color,
                  border: `1px solid ${T.line}`,
                  borderRadius: 8,
                  padding: "30px 20px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "transform 0.18s, box-shadow 0.18s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 12px 32px rgba(10,15,35,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    margin: "0 auto 14px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={24} color={p.text} strokeWidth={1.8} />
                </div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: "0.97rem",
                    color: p.text,
                    marginBottom: 5,
                  }}
                >
                  {p.label}
                </div>
                <div style={{ fontSize: "0.8rem", color: T.muted }}>
                  {p.sub}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ─── */
function Testimonials() {
  return (
    <section
      id="testimonials"
      aria-label="Tenant testimonials"
      style={{ padding: "72px 0", background: "#f8f9fb" }}
    >
      <div style={{ width: "min(1160px,calc(100% - 48px))", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <SectionLabel>Our Testimonial</SectionLabel>
          <h2
            style={{
              margin: "0 0 12px",
              fontSize: "clamp(1.9rem,3vw,2.5rem)",
              letterSpacing: "-0.04em",
              color: T.ink,
              fontWeight: 800,
            }}
          >
            Clients Feedback
          </h2>
          <p
            style={{
              margin: "0 auto",
              maxWidth: 480,
              color: T.muted,
              lineHeight: 1.65,
            }}
          >
            Hear from tenants who found their home through Move-In.
          </p>
        </div>
        <div
          className="mi-testi-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 22,
          }}
        >
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.name}
              className={i === 1 ? "mi-testi-mid" : ""}
              style={{
                background: "#fff",
                border: `1px solid ${T.line}`,
                borderRadius: 8,
                padding: "32px 26px",
                textAlign: "center",
                transform: i === 1 ? "translateY(-10px)" : "none",
                boxShadow: i === 1 ? "0 16px 48px rgba(10,15,35,0.1)" : "none",
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  margin: "0 auto 20px",
                  background: t.color,
                  color: t.text,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "1rem",
                }}
              >
                {t.initials}
              </div>
              <p
                style={{
                  margin: "0 0 20px",
                  color: T.muted,
                  fontSize: "0.9rem",
                  lineHeight: 1.7,
                  fontStyle: "italic",
                }}
              >
                "{t.quote}"
              </p>
              <div
                style={{ fontWeight: 800, fontSize: "0.97rem", color: T.ink }}
              >
                {t.name}
              </div>
              <div
                style={{ fontSize: "0.82rem", color: T.muted, marginTop: 3 }}
              >
                {t.role}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA Banner ─── */
function CTABanner({ onViewListings }) {
  return (
    <section
      id="cta"
      aria-label="Browse listings call to action"
      style={{ background: T.button, padding: "52px 0" }}
    >
      <div
        style={{
          width: "min(1160px,calc(100% - 48px))",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2
            style={{
              margin: "0 0 8px",
              fontSize: "clamp(1.5rem,2.5vw,2rem)",
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "-0.03em",
            }}
          >
            Looking for your next home?
          </h2>
          <p
            style={{
              margin: 0,
              color: "rgba(255,255,255,0.65)",
              fontSize: "0.95rem",
            }}
          >
            Browse verified listings across Nairobi — from Westlands to Karen.
          </p>
        </div>
        <button
          onClick={() => onViewListings()}
          style={{
            height: 48,
            padding: "0 32px",
            borderRadius: 6,
            border: "2px solid rgba(255,255,255,0.3)",
            background: "rgba(255,255,255,0.1)",
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.95rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            backdropFilter: "blur(4px)",
            fontFamily: "inherit",
            flexShrink: 0,
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.18)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
          }
        >
          Explore Properties <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}
const css = `

  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { margin: 0; }
  .mi-mobile-nav  { display: none !important; }

  /* Search bar: horizontal flex row by default */
  .mi-search-bar { display: flex; align-items: stretch; overflow: hidden; }
  .mi-search-bar .mi-search-field { border-bottom: none !important; }

  /* ── Tablet (≤ 1080px) ── */
  @media (max-width: 1080px) {
    .mi-focus-grid  { grid-template-columns: 1fr 1fr !important; }
    .mi-loc-grid    { grid-template-columns: 1fr 1fr !important; }
    .mi-listings    { grid-template-columns: 1fr 1fr !important; }
    .mi-portals     { grid-template-columns: 1fr 1fr !important; }
    .mi-steps       { grid-template-columns: 1fr 1fr !important; }
    .mi-testi-grid  { grid-template-columns: 1fr 1fr !important; }
    .mi-footer-top  { grid-template-columns: 1fr 1fr !important; }
  }

  /* ── Mobile (≤ 680px) ── */
  @media (max-width: 680px) {
    .mi-desktop-nav { display: none !important; }
    .mi-mobile-nav  { display: flex !important; }
    .mi-focus-grid  { grid-template-columns: 1fr !important; }
    .mi-loc-grid    { grid-template-columns: 1fr !important; }
    .mi-listings    { grid-template-columns: 1fr !important; }
    .mi-portals     { grid-template-columns: 1fr 1fr !important; }
    .mi-steps       { grid-template-columns: 1fr !important; }
    .mi-testi-grid  { grid-template-columns: 1fr !important; }
    .mi-footer-top  { grid-template-columns: 1fr 1fr !important; }

    /* Stack search bar fields vertically on mobile */
    .mi-search-bar {
      flex-direction: column !important;
      border-radius: 8px !important;
    }
    .mi-search-bar .mi-search-field {
      border-right: none !important;
      border-bottom: 1px solid var(--mi-line) !important;
      flex: none !important;
    }
    .mi-search-bar .mi-search-field:last-child {
      border-bottom: none !important;
    }
    .mi-search-btn {
      border-radius: 0 !important;
      padding: 14px 0 !important;
      justify-content: center !important;
    }

    /* Hero absolute search bar — switch to relative on mobile */
    .mi-hero-search {
      position: relative !important;
      bottom: auto !important;
      left: auto !important;
      right: auto !important;
      margin-top: auto !important;
      padding: 0 16px 24px !important;
    }

    /* Hero center text on mobile */
    .mi-hero-content { text-align: center !important; }
    .mi-hero-content button { margin: 0 auto !important; }
    .mi-hero-dots { justify-content: center !important; }

    /* Testimonial: remove middle card lift */
    .mi-testi-mid { transform: none !important; box-shadow: none !important; }
  }
`;

/* ─── Page ─── */
export default function LandingPage() {
  const navigate = useNavigate();
  const handleLogin = () => navigate("/login");
  const handleRegister = () => navigate("/preferences");
  const handleViewListings = (id) =>
    navigate(id ? `/listings/${id}` : "/listings");

  const handleSearch = (location, purpose, type) => {
    const p = new URLSearchParams();
    if (location) p.set("location", location);
    if (purpose) p.set("purpose", purpose.toLowerCase());
    if (type) p.set("type", type.toLowerCase());
    navigate(`/listings${p.toString() ? "?" + p.toString() : ""}`);
  };

  return (
    <>
      <style>{css}</style>
      <div
        style={{
          fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
          color: T.ink,
          background: T.bg,
          lineHeight: 1.5,
        }}
      >
        <GuestHeader transparent />
        <main>
          <Hero onBrowseListings={handleViewListings} onSearch={handleSearch} />
          <OurMainFocus onRegister={handleRegister} />
          <PropertiesByLocation />
          <FeaturedListings onViewListings={handleViewListings} />
          <VideoSection />
          <HowItWorks />
          <Portals onLogin={handleLogin} />
          <Testimonials />
          <CTABanner onViewListings={handleViewListings} />
        </main>
        <Footer variant="marketing" />
      </div>
    </>
  );
}
