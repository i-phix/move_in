import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import PriceRangeSlider from "../../common/PriceRangeSlider";
import {
  Home,
  Building2,
  GraduationCap,
  Users,
  PawPrint,
  Sofa,
  Car,
  Dumbbell,
  Waves,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Check,
  SlidersHorizontal,
  Phone,
  Mail,
} from "lucide-react";
import { makeRequest } from "../../../utils/makeRequest";
import { savePreferencesURL } from "../../../utils/urls";
import {
  saveLocalPreferences,
  getLocalPreferences,
  getOrCreateGuestId,
} from "../../../utils/preferences";
import { notifyError } from "../../../utils/toast";
import LocationSuggestions from "../../common/LocationSuggestions";

const TOTAL_STEPS = 5;

const PURPOSE_OPTIONS = [
  {
    value: "rent",
    label: "Rent",
    sub: "I want to rent a property",
    icon: Home,
  },
  {
    value: "buy",
    label: "Buy",
    sub: "I want to purchase a property",
    icon: Building2,
  },
];

const ROOM_TYPES = [
  { value: "bedsitter", label: "Bedsitter" },
  { value: "studio", label: "Studio" },
  { value: "1_bedroom", label: "1 Bedroom" },
  { value: "2_bedroom", label: "2 Bedroom" },
  { value: "3_bedroom", label: "3 Bedroom" },
  { value: "4_bedroom_plus", label: "4+ Bedrooms" },
];

const LIFESTYLE_OPTIONS = [
  { value: "family_friendly", label: "Family-friendly", icon: Users },
  { value: "student", label: "Student", icon: GraduationCap },
  { value: "pet_friendly", label: "Pet-friendly", icon: PawPrint },
  { value: "furnished", label: "Furnished", icon: Sofa },
  { value: "parking", label: "Parking", icon: Car },
  { value: "gated", label: "Gated", icon: ShieldCheck },
  { value: "gym", label: "Gym", icon: Dumbbell },
  { value: "pool", label: "Swimming Pool", icon: Waves },
];

const selCard = (selected) => ({
  border: `1.5px solid ${selected ? "var(--mi-brand)" : "var(--mi-line)"}`,
  borderRadius: 16,
  background: selected ? "#eff6ff" : "var(--mi-surface)",
  cursor: "pointer",
  transition: "border-color 0.15s, background 0.15s, box-shadow 0.15s",
  boxShadow: selected ? "0 0 0 3px rgba(29,78,216,0.08)" : "none",
  padding: "1.4rem 1rem",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 10,
  textAlign: "center",
  userSelect: "none",
});

const chipStyle = (selected) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "0.55rem 1rem",
  borderRadius: 30,
  border: `1.5px solid ${selected ? "var(--mi-brand)" : "var(--mi-line)"}`,
  background: selected ? "#eff6ff" : "var(--mi-surface)",
  color: selected ? "var(--mi-brand)" : "var(--mi-ink)",
  fontWeight: selected ? 700 : 500,
  fontSize: "0.9rem",
  cursor: "pointer",
  transition: "all 0.15s",
  userSelect: "none",
});

function buildListingsSearch(prefs) {
  const params = new URLSearchParams();

  if (prefs.purpose) params.set("purpose", prefs.purpose);
  if (prefs.location?.trim()) params.set("location", prefs.location.trim());
  if (prefs.roomTypes?.length)
    params.set("roomTypes", prefs.roomTypes.join(","));
  if (prefs.lifestyle?.length)
    params.set("lifestyle", prefs.lifestyle.join(","));
  if (prefs.budgetMin) params.set("budgetMin", prefs.budgetMin);
  if (prefs.budgetMax) params.set("budgetMax", prefs.budgetMax);

  return params.toString();
}

// ── Step components ──────────────────────────────────────────────────────────

function PurposeStep({ value, onChange }) {
  return (
    <div className="row g-3">
      {PURPOSE_OPTIONS.map(({ value: v, label, sub, icon: Icon }) => (
        <div className="col-6" key={v}>
          <div style={selCard(value === v)} onClick={() => onChange(v)}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: value === v ? "var(--mi-brand)" : "#f1f5fd",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.15s",
              }}
            >
              <Icon
                size={26}
                color={value === v ? "#fff" : "var(--mi-brand)"}
                strokeWidth={2}
              />
            </div>
            <div>
              <div
                style={{
                  fontWeight: 700,
                  color: "var(--mi-ink)",
                  fontSize: "1.05rem",
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "var(--mi-muted)",
                  marginTop: 4,
                }}
              >
                {sub}
              </div>
            </div>
            {value === v && (
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "var(--mi-brand)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Check size={13} color="#fff" strokeWidth={3} />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function LocationStep({ value, onChange }) {
  return (
    <div>
      <LocationSuggestions
        value={value}
        placeholder="e.g. Nairobi, Westlands, Kilimani…"
        onChange={(loc) => onChange(loc ? loc.name : "")}
      />
      <p
        style={{ fontSize: "0.85rem", color: "var(--mi-muted)", marginTop: 14 }}
      >
        Leave blank to see all available properties.
      </p>
    </div>
  );
}
function RoomTypeStep({ value, onChange }) {
  const toggle = (v) =>
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  return (
    <div className="row g-2">
      {ROOM_TYPES.map(({ value: v, label }) => (
        <div className="col-6 col-md-4" key={v}>
          <div style={selCard(value.includes(v))} onClick={() => toggle(v)}>
            <span
              style={{
                fontWeight: 700,
                fontSize: "1rem",
                color: "var(--mi-ink)",
              }}
            >
              {label}
            </span>
            {value.includes(v) && (
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "var(--mi-brand)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Check size={12} color="#fff" strokeWidth={3} />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function LifestyleStep({ value, onChange }) {
  const toggle = (v) =>
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
      {LIFESTYLE_OPTIONS.map(({ value: v, label, icon: Icon }) => (
        <div
          key={v}
          style={chipStyle(value.includes(v))}
          onClick={() => toggle(v)}
        >
          <Icon size={15} strokeWidth={2} /> {label}
        </div>
      ))}
    </div>
  );
}

function BudgetStep({ budgetMin, budgetMax, onChange }) {
  return (
    <div>
      <PriceRangeSlider
        min={0}
        max={500000}
        step={1000}
        value={{
          min: Math.min(Number(budgetMin) || 0, 500000),
          max: Math.min(Number(budgetMax) || 500000, 500000),
        }}
        onChange={({ min, max }) => {
          onChange("budgetMin", min);
          onChange("budgetMax", max);
        }}
      />
      <p
        style={{ fontSize: "0.85rem", color: "var(--mi-muted)", marginTop: 12 }}
      >
        Leave both blank to see all price ranges.
      </p>
    </div>
  );
}
// Main Wizard
export default function PreferenceWizard() {
  const navigate = useNavigate();
  const saved = getLocalPreferences() || {};
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState({
    purpose: saved.purpose || "",
    location: saved.location || "",
    roomTypes: saved.roomTypes || [],
    lifestyle: saved.lifestyle || [],
    budgetMin: saved.budgetMin || "",
    budgetMax: saved.budgetMax || "",
  });

  const update = (field) => (val) => setPrefs((p) => ({ ...p, [field]: val }));
  const updateBudget = (field, val) =>
    setPrefs((p) => ({ ...p, [field]: val }));

  const canProceed = () => step !== 1 || !!prefs.purpose;

  const handleNext = async () => {
    saveLocalPreferences({ ...prefs });
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      return;
    }
    await handleFinish();
  };

  const handleFinish = async () => {
    setSaving(true);
    const guestId = getOrCreateGuestId();
    const res = await makeRequest(savePreferencesURL, "POST", {
      guestId,
      purpose: prefs.purpose || "any",
      location: prefs.location || null,
      roomTypes: prefs.roomTypes,
      lifestyle: prefs.lifestyle,
      budgetMin: prefs.budgetMin ? Number(prefs.budgetMin) : null,
      budgetMax: prefs.budgetMax ? Number(prefs.budgetMax) : null,
    });
    setSaving(false);
    if (!res.success)
      notifyError(
        "Could not save preferences. Your choices are saved locally.",
      );
    saveLocalPreferences({ ...prefs, completedAt: new Date().toISOString() });
    const query = buildListingsSearch(prefs);
    navigate(query ? `/listings?${query}` : "/listings");
  };

  const stepContent = () => {
    switch (step) {
      case 1:
        return (
          <PurposeStep value={prefs.purpose} onChange={update("purpose")} />
        );
      case 2:
        return (
          <LocationStep value={prefs.location} onChange={update("location")} />
        );

      case 3:
        return (
          <RoomTypeStep
            value={prefs.roomTypes}
            onChange={update("roomTypes")}
          />
        );
      case 4:
        return (
          <LifestyleStep
            value={prefs.lifestyle}
            onChange={update("lifestyle")}
          />
        );
      case 5:
        return (
          <BudgetStep
            budgetMin={prefs.budgetMin}
            budgetMax={prefs.budgetMax}
            onChange={updateBudget}
          />
        );
      default:
        return null;
    }
  };

  const stepLabels = ["Purpose", "Location", "Space", "Lifestyle", "Budget"];
  const stepTitles = [
    {
      title: "What are you looking for?",
      sub: "Tell us whether you want to rent or buy.",
    },
    {
      title: "Where do you want to live?",
      sub: "Enter a city, area, or neighbourhood.",
    },
    {
      title: "What type of space?",
      sub: "Pick one or more room types. You can select multiple.",
    },
    {
      title: "Your lifestyle preferences",
      sub: "Select all that apply. These help us find the right match.",
    },
    {
      title: "What's your budget?",
      sub: "Set a monthly range. All prices are in KES.",
    },
  ];

  const current = stepTitles[step - 1];
  const progress = (step / TOTAL_STEPS) * 100;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--mi-bg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(255,255,255,0.97)",
          borderBottom: "1px solid var(--mi-line)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          style={{
            maxWidth: 1160,
            margin: "0 auto",
            padding: "0 24px",
            height: 68,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
              color: "var(--mi-ink)",
              fontWeight: 800,
              fontSize: "1.35rem",
              letterSpacing: "-0.03em",
            }}
          >
            <span
              style={{
                width: 38,
                height: 38,
                borderRadius: 11,
                flexShrink: 0,
                background: "var(--mi-brand)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 5px 14px rgba(29,78,216,0.22)",
              }}
            >
              <Home size={19} color="#fff" strokeWidth={2.5} />
            </span>
            Move-In
            <span
              style={{
                color: "var(--mi-brand)",
                fontSize: "0.65rem",
                fontWeight: 700,
                letterSpacing: "0.06em",
                alignSelf: "flex-end",
                marginBottom: 3,
                opacity: 0.7,
              }}
            >
              by PayServe
            </span>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link
              to="/login"
              style={{
                height: 38,
                paddingInline: 16,
                borderRadius: 10,
                border: "none",
                background: "var(--mi-button)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.87rem",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                textDecoration: "none",
              }}
            >
              Sign In <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Wizard content ───────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          padding: "3rem 1.5rem 4rem",
        }}
      >
        <div style={{ width: "100%", maxWidth: 760 }}>
          {/* Page heading */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                margin: "0 auto 16px",
                background: "var(--mi-brand)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 20px rgba(29,78,216,0.25)",
              }}
            >
              <SlidersHorizontal size={26} color="#fff" strokeWidth={2.5} />
            </div>
            <h1
              style={{
                fontSize: "1.75rem",
                fontWeight: 800,
                color: "var(--mi-ink)",
                margin: "0 0 6px",
                letterSpacing: "-0.03em",
              }}
            >
              Find your perfect space
            </h1>
            <p
              style={{
                color: "var(--mi-muted)",
                fontSize: "0.95rem",
                margin: 0,
              }}
            >
              Answer a few quick questions — we&apos;ll show you the best
              matches.
            </p>
          </div>

          {/* Step indicators */}
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              {stepLabels.map((label, i) => {
                const idx = i + 1;
                const done = idx < step;
                const active = idx === step;
                return (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        background: done
                          ? "var(--mi-brand)"
                          : active
                            ? "#eff6ff"
                            : "var(--mi-line)",
                        border: `2px solid ${active || done ? "var(--mi-brand)" : "transparent"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s",
                      }}
                    >
                      {done ? (
                        <Check size={15} color="#fff" strokeWidth={3} />
                      ) : (
                        <span
                          style={{
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            color: active
                              ? "var(--mi-brand)"
                              : "var(--mi-muted)",
                          }}
                        >
                          {idx}
                        </span>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: active ? 700 : 500,
                        color: active
                          ? "var(--mi-brand)"
                          : done
                            ? "var(--mi-ink)"
                            : "var(--mi-muted)",
                        textAlign: "center",
                      }}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
            <div
              style={{
                height: 5,
                borderRadius: 5,
                background: "var(--mi-line)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  background: "var(--mi-brand)",
                  borderRadius: 5,
                  transition: "width 0.35s ease",
                }}
              />
            </div>
          </div>

          {/* Step card */}
          <div
            style={{
              background: "var(--mi-surface)",
              border: "1px solid var(--mi-line)",
              borderRadius: 22,
              padding: "2.25rem 2.5rem",
              boxShadow: "0 16px 40px rgba(15,23,42,0.07)",
              marginBottom: 20,
            }}
          >
            <h2
              style={{
                fontWeight: 800,
                fontSize: "1.35rem",
                color: "var(--mi-ink)",
                margin: "0 0 8px",
                letterSpacing: "-0.02em",
              }}
            >
              {current.title}
            </h2>
            <p
              style={{
                color: "var(--mi-muted)",
                fontSize: "0.92rem",
                marginBottom: 24,
                lineHeight: 1.55,
              }}
            >
              {current.sub}
            </p>
            {stepContent()}
          </div>

          {/* Navigation */}
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                style={{
                  height: 50,
                  paddingInline: 22,
                  border: "1.5px solid var(--mi-line)",
                  borderRadius: 12,
                  background: "var(--mi-surface)",
                  color: "var(--mi-ink)",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: "inherit",
                  fontSize: "0.95rem",
                }}
              >
                <ArrowLeft size={15} /> Back
              </button>
            )}
            <button
              type="button"
              className="auth-btn"
              style={{ flex: 1 }}
              disabled={!canProceed() || saving}
              onClick={handleNext}
            >
              {saving ? (
                "Saving…"
              ) : step === TOTAL_STEPS ? (
                <>
                  <span>See Recommendations</span>
                  <ArrowRight size={16} />
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>

          {step !== 1 && (
            <p
              style={{
                textAlign: "center",
                marginTop: 14,
                fontSize: "0.85rem",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  if (step === TOTAL_STEPS) {
                    handleFinish();
                  } else {
                    saveLocalPreferences({ ...prefs });
                    setStep((s) => s + 1);
                  }
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--mi-muted)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: "inherit",
                  textDecoration: "underline",
                  padding: 0,
                }}
              >
                Skip this step
              </button>
            </p>
          )}
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer
        style={{
          background: "#0f172a",
          color: "rgba(255,255,255,0.6)",
          padding: "28px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1160,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            fontSize: "0.84rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: "var(--mi-brand)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Home size={15} color="#fff" strokeWidth={2.5} />
            </span>
            <span
              style={{ fontWeight: 700, color: "#fff", fontSize: "0.95rem" }}
            >
              Move-In
            </span>
            <span style={{ color: "rgba(255,255,255,0.35)", marginLeft: 6 }}>
              © 2026 PayServe. All rights reserved.
            </span>
          </div>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Phone size={12} /> +254 700 000 000
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Mail size={12} /> hello@movein.co.ke
            </span>
            <Link
              to="/login"
              style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}
            >
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
