import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  MapPin,
  Bed,
  Bath,
  SlidersHorizontal,
  Search,
  ArrowRight,
  Home,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { makeRequest } from "../../../utils/makeRequest";
import { getListingsURL } from "../../../utils/urls";
import GuestHeader from "../../layout/GuestHeader";
import Footer from "../../layout/footer";
import { resolveImageUrl } from "../../../utils/imageUrl";

const DEFAULT_LIMIT = 9;

const formatUnitLocation = (unit = {}) => {
  const loc = unit.location || {};
  const facility = unit.facilityId || {};
  const primary = [loc.area, loc.city || facility.location, loc.county]
    .filter(Boolean)
    .join(", ");
  const secondary = loc.address || facility.name || "";
  return [primary, secondary].filter(Boolean).join(" · ");
};

const ROOM_TYPES = [
  { value: "bedsitter", label: "Bedsitter" },
  { value: "studio", label: "Studio" },
  { value: "1_bedroom", label: "1 Bedroom" },
  { value: "2_bedroom", label: "2 Bedroom" },
  { value: "3_bedroom", label: "3 Bedroom" },
  { value: "4_bedroom_plus", label: "4+ Bedrooms" },
];

const LIFESTYLE_OPTIONS = [
  { value: "family_friendly", label: "Family-friendly" },
  { value: "student", label: "Student" },
  { value: "pet_friendly", label: "Pet-friendly" },
  { value: "furnished", label: "Furnished" },
  { value: "parking", label: "Parking" },
  { value: "gated", label: "Gated" },
  { value: "gym", label: "Gym" },
  { value: "pool", label: "Swimming Pool" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildQuery(f, p = 1) {
  const params = new URLSearchParams();
  if (f.purpose && f.purpose !== "any") params.set("purpose", f.purpose);
  if (f.location?.trim()) params.set("location", f.location.trim());
  if (f.roomTypes?.length) params.set("roomTypes", f.roomTypes.join(","));
  if (f.lifestyle?.length) params.set("lifestyle", f.lifestyle.join(","));
  if (f.budgetMin) params.set("budgetMin", f.budgetMin);
  if (f.budgetMax) params.set("budgetMax", f.budgetMax);
  params.set("page", p);
  params.set("limit", DEFAULT_LIMIT);
  return params.toString();
}

function splitParam(value) {
  return (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeRoomType(value) {
  const normalized = String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");
  if (normalized.includes("bedsitter")) return "bedsitter";
  if (normalized.includes("studio")) return "studio";
  if (normalized.includes("1_bed") || normalized.includes("one_bed"))
    return "1_bedroom";
  if (normalized.includes("2_bed") || normalized.includes("two_bed"))
    return "2_bedroom";
  if (normalized.includes("3_bed") || normalized.includes("three_bed"))
    return "3_bedroom";
  if (normalized.includes("4_bed") || normalized.includes("four_bed"))
    return "4_bedroom_plus";
  return "";
}

function filtersFromUrl(search) {
  const query = new URLSearchParams(search || "");
  const roomTypes = splitParam(query.get("roomTypes"));
  const typeRoom = normalizeRoomType(query.get("type"));

  return {
    location: query.get("location") || "",
    purpose: query.get("purpose") || "any",
    budgetMin: query.get("budgetMin") || "",
    budgetMax: query.get("budgetMax") || "",
    roomTypes: roomTypes.length ? roomTypes : typeRoom ? [typeRoom] : [],
    lifestyle: splitParam(query.get("lifestyle")),
  };
}

function countActiveFilters(f) {
  let n = 0;
  if (f.location?.trim()) n++;
  if (f.purpose && f.purpose !== "any") n++;
  if (f.budgetMin || f.budgetMax) n++;
  if (f.roomTypes?.length) n += f.roomTypes.length;
  if (f.lifestyle?.length) n += f.lifestyle.length;
  return n;
}

// ── ListingCard ───────────────────────────────────────────────────────────────

function ListingCard({ unit, basePath = "/listings" }) {
  const imgs = unit.moveInImages || unit.images || [];
  const rawImg = imgs[imgs.length - 1];
  const img = resolveImageUrl(rawImg);

  return (
    <Link
      to={`${basePath}/${unit._id}`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div
        style={{
          background: "var(--mi-surface)",
          border: "1px solid var(--mi-line)",
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
          transition: "box-shadow 0.2s, transform 0.2s",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "0 16px 40px rgba(15,23,42,0.12)";
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(15,23,42,0.05)";
          e.currentTarget.style.transform = "none";
        }}
      >
        {/* Image */}
        <div
          style={{
            height: 180,
            background: "#e8eef7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {img ? (
            <img
              src={img}
              alt={unit.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <Home size={40} color="var(--mi-line)" strokeWidth={1.5} />
          )}
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              background:
                unit.listingType === "sale" ? "#059669" : "var(--mi-brand)",
              color: "#fff",
              fontSize: "0.72rem",
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius: 20,
              letterSpacing: "0.04em",
            }}
          >
            {unit.listingType === "sale" ? "FOR SALE" : "FOR RENT"}
          </div>
          {unit.featuredUntil && new Date(unit.featuredUntil) > new Date() && (
            <div
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                background: "#DB2777",
                color: "#fff",
                fontSize: "0.68rem",
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: 20,
                letterSpacing: "0.04em",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              ★ Featured
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: "1rem 1.1rem 1.2rem" }}>
          <h3
            style={{
              fontWeight: 700,
              fontSize: "0.97rem",
              color: "var(--mi-ink)",
              margin: "0 0 4px",
              lineHeight: 1.3,
            }}
          >
            {unit.name}
          </h3>

          {formatUnitLocation(unit) && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                marginBottom: 10,
              }}
            >
              <MapPin size={13} color="var(--mi-muted)" strokeWidth={2} />
              <span style={{ fontSize: "0.82rem", color: "var(--mi-muted)" }}>
                {formatUnitLocation(unit)}
              </span>
            </div>
          )}

          <div style={{ display: "flex", gap: 14, marginBottom: 12 }}>
            {unit.moveInBedrooms !== null &&
              unit.moveInBedrooms !== undefined && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: "0.82rem",
                    color: "var(--mi-ink)",
                  }}
                >
                  <Bed size={14} color="var(--mi-brand)" strokeWidth={2} />
                  {unit.moveInBedrooms === 0
                    ? "Studio"
                    : `${unit.moveInBedrooms} bed`}
                </div>
              )}
            {unit.moveInBathrooms != null && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: "0.82rem",
                  color: "var(--mi-ink)",
                }}
              >
                <Bath size={14} color="var(--mi-brand)" strokeWidth={2} />
                {unit.moveInBathrooms} bath
              </div>
            )}
            {unit.grossArea && (
              <div style={{ fontSize: "0.82rem", color: "var(--mi-muted)" }}>
                {unit.grossArea} m²
              </div>
            )}
          </div>

          {unit.moveInAmenities?.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 5,
                marginBottom: 12,
              }}
            >
              {unit.moveInAmenities.slice(0, 4).map((a) => (
                <span
                  key={a}
                  style={{
                    fontSize: "0.72rem",
                    padding: "2px 8px",
                    borderRadius: 12,
                    background: "#f1f5fd",
                    color: "var(--mi-brand)",
                    fontWeight: 600,
                    textTransform: "capitalize",
                  }}
                >
                  {a.replace(/_/g, " ")}
                </span>
              ))}
              {unit.moveInAmenities.length > 4 && (
                <span style={{ fontSize: "0.72rem", color: "var(--mi-muted)" }}>
                  +{unit.moveInAmenities.length - 4} more
                </span>
              )}
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              {unit.moveInPrice ? (
                <>
                  <span
                    style={{
                      fontWeight: 800,
                      fontSize: "1.05rem",
                      color: "var(--mi-brand)",
                    }}
                  >
                    KES {Number(unit.moveInPrice).toLocaleString()}
                  </span>
                  <span
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--mi-muted)",
                      marginLeft: 3,
                    }}
                  >
                    {unit.listingType === "sale" ? "" : "/mo"}
                  </span>
                </>
              ) : (
                <span style={{ fontSize: "0.82rem", color: "var(--mi-muted)" }}>
                  Price on request
                </span>
              )}
            </div>
            <span
              style={{
                background: "var(--mi-button)",
                color: "#fff",
                borderRadius: 10,
                padding: "7px 14px",
                fontSize: "0.82rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              View <ArrowRight size={13} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── FilterSidebar ─────────────────────────────────────────────────────────────

function FilterSidebar({ filters, onChange, onApply, onClear }) {
  const toggle = (field, value) => {
    const current = filters[field] || [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, [field]: next });
  };

  const purposeBtn = (value, label) => {
    const active = filters.purpose === value;
    return (
      <button
        key={value}
        onClick={() => onChange({ ...filters, purpose: value })}
        style={{
          flex: 1,
          height: 34,
          border: `1.5px solid ${active ? "var(--mi-brand)" : "var(--mi-line)"}`,
          borderRadius: 8,
          background: active ? "var(--mi-brand)" : "var(--mi-surface)",
          color: active ? "#fff" : "var(--mi-ink)",
          fontWeight: active ? 700 : 500,
          fontSize: "0.83rem",
          cursor: "pointer",
          fontFamily: "inherit",
          transition: "all 0.15s",
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <aside
      className="mi-listing-filters"
      style={{
        width: 240,
        flexShrink: 0,
        background: "var(--mi-surface)",
        borderRight: "1px solid var(--mi-line)",
        padding: "1.2rem 1rem",
        alignSelf: "flex-start",
        position: "sticky",
        top: 0,
        maxHeight: "100vh",
        overflowY: "auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            fontWeight: 700,
            fontSize: "0.97rem",
            color: "var(--mi-ink)",
          }}
        >
          <SlidersHorizontal
            size={16}
            color="var(--mi-brand)"
            strokeWidth={2.5}
          />
          Filters
          {countActiveFilters(filters) > 0 && (
            <span
              style={{
                background: "var(--mi-brand)",
                color: "#fff",
                fontSize: "0.7rem",
                fontWeight: 700,
                borderRadius: 20,
                padding: "1px 7px",
              }}
            >
              {countActiveFilters(filters)}
            </span>
          )}
        </div>
        {countActiveFilters(filters) > 0 && (
          <button
            onClick={onClear}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: "0.78rem",
              color: "var(--mi-muted)",
              fontFamily: "inherit",
            }}
          >
            <X size={13} /> Clear all
          </button>
        )}
      </div>

      {/* Location */}
      <div style={{ marginBottom: 20 }}>
        <label
          style={{
            fontSize: "0.82rem",
            fontWeight: 700,
            color: "var(--mi-ink)",
            display: "block",
            marginBottom: 7,
          }}
        >
          Location
        </label>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onApply();
          }}
          style={{ display: "flex", gap: 6 }}
        >
          <div style={{ position: "relative", flex: 1 }}>
            <MapPin
              size={13}
              color="var(--mi-muted)"
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            />
            <input
              type="text"
              className="auth-input"
              style={{ paddingLeft: 30, height: 36, fontSize: "0.85rem" }}
              placeholder="e.g. Nairobi"
              value={filters.location}
              onChange={(e) =>
                onChange({ ...filters, location: e.target.value })
              }
            />
          </div>
          <button
            type="submit"
            className="auth-btn"
            style={{
              height: 36,
              width: 36,
              padding: 0,
              borderRadius: 8,
              flexShrink: 0,
            }}
          >
            <Search size={14} />
          </button>
        </form>
      </div>

      <div
        style={{ borderTop: "1px solid var(--mi-line)", margin: "0 0 18px" }}
      />

      {/* Purpose */}
      <div style={{ marginBottom: 20 }}>
        <label
          style={{
            fontSize: "0.82rem",
            fontWeight: 700,
            color: "var(--mi-ink)",
            display: "block",
            marginBottom: 8,
          }}
        >
          Purpose
        </label>
        <div style={{ display: "flex", gap: 6 }}>
          {purposeBtn("any", "Any")}
          {purposeBtn("rent", "Rent")}
          {purposeBtn("buy", "Buy")}
        </div>
      </div>

      <div
        style={{ borderTop: "1px solid var(--mi-line)", margin: "0 0 18px" }}
      />

      {/* Budget */}
      <div style={{ marginBottom: 20 }}>
        <label
          style={{
            fontSize: "0.82rem",
            fontWeight: 700,
            color: "var(--mi-ink)",
            display: "block",
            marginBottom: 8,
          }}
        >
          Budget (KES/mo)
        </label>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="number"
            className="auth-input"
            style={{ height: 36, fontSize: "0.83rem", flex: 1, minWidth: 0 }}
            placeholder="Min"
            value={filters.budgetMin}
            onChange={(e) =>
              onChange({ ...filters, budgetMin: e.target.value })
            }
          />
          <span
            style={{
              fontSize: "0.78rem",
              color: "var(--mi-muted)",
              flexShrink: 0,
            }}
          >
            –
          </span>
          <input
            type="number"
            className="auth-input"
            style={{ height: 36, fontSize: "0.83rem", flex: 1, minWidth: 0 }}
            placeholder="Max"
            value={filters.budgetMax}
            onChange={(e) =>
              onChange({ ...filters, budgetMax: e.target.value })
            }
          />
        </div>
      </div>

      <div
        style={{ borderTop: "1px solid var(--mi-line)", margin: "0 0 18px" }}
      />

      {/* Room Types */}
      <div style={{ marginBottom: 20 }}>
        <label
          style={{
            fontSize: "0.82rem",
            fontWeight: 700,
            color: "var(--mi-ink)",
            display: "block",
            marginBottom: 10,
          }}
        >
          Room Type
        </label>
        {ROOM_TYPES.map(({ value, label }) => {
          const checked = (filters.roomTypes || []).includes(value);
          return (
            <label
              key={value}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                marginBottom: 9,
                cursor: "pointer",
                fontSize: "0.88rem",
                color: "var(--mi-ink)",
                userSelect: "none",
              }}
            >
              <div
                onClick={() => toggle("roomTypes", value)}
                style={{
                  width: 17,
                  height: 17,
                  borderRadius: 5,
                  border: `1.5px solid ${checked ? "var(--mi-brand)" : "var(--mi-line)"}`,
                  background: checked ? "var(--mi-brand)" : "var(--mi-surface)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {checked && (
                  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                    <path
                      d="M1 3.5L3.5 6L8 1"
                      stroke="#fff"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <span onClick={() => toggle("roomTypes", value)}>{label}</span>
            </label>
          );
        })}
      </div>

      <div
        style={{ borderTop: "1px solid var(--mi-line)", margin: "0 0 18px" }}
      />

      {/* Lifestyle */}
      <div style={{ marginBottom: 24 }}>
        <label
          style={{
            fontSize: "0.82rem",
            fontWeight: 700,
            color: "var(--mi-ink)",
            display: "block",
            marginBottom: 10,
          }}
        >
          Lifestyle & Amenities
        </label>
        {LIFESTYLE_OPTIONS.map(({ value, label }) => {
          const checked = (filters.lifestyle || []).includes(value);
          return (
            <label
              key={value}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                marginBottom: 9,
                cursor: "pointer",
                fontSize: "0.88rem",
                color: "var(--mi-ink)",
                userSelect: "none",
              }}
            >
              <div
                onClick={() => toggle("lifestyle", value)}
                style={{
                  width: 17,
                  height: 17,
                  borderRadius: 5,
                  border: `1.5px solid ${checked ? "var(--mi-brand)" : "var(--mi-line)"}`,
                  background: checked ? "var(--mi-brand)" : "var(--mi-surface)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {checked && (
                  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                    <path
                      d="M1 3.5L3.5 6L8 1"
                      stroke="#fff"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <span onClick={() => toggle("lifestyle", value)}>{label}</span>
            </label>
          );
        })}
      </div>

      {/* Apply button */}
      <button
        onClick={onApply}
        style={{
          width: "100%",
          height: 42,
          background: "var(--mi-button)",
          color: "#fff",
          border: "none",
          borderRadius: 10,
          fontWeight: 700,
          fontSize: "0.92rem",
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        Apply Filters
      </button>
    </aside>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ListingsPage({ embedded = false }) {
  const basePath = embedded ? "/move-in/listings" : "/listings";
  const location = useLocation();

  const [filters, setFilters] = useState(() => filtersFromUrl(location.search));

  const [listings, setListings] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadError, setLoadError] = useState("");

  const fetchListings = useCallback(async (f, p = 1) => {
    setLoading(true);
    const res = await makeRequest(
      `${getListingsURL}?${buildQuery(f, p)}`,
      "GET",
    );
    setLoading(false);
    if (res.success) {
      setListings(Array.isArray(res.data?.data) ? res.data.data : []);
      setPagination(res.data?.pagination || { total: 0, page: 1, pages: 1 });
      setLoadError("");
    } else {
      setListings([]);
      setPagination({ total: 0, page: 1, pages: 1 });
      setLoadError(
        res.message ||
          res.error ||
          "Could not load listings. Please try again.",
      );
    }
  }, []);

  // Keep the list in sync with URL searches from the landing page.
  useEffect(() => {
    const nextFilters = filtersFromUrl(location.search);
    setFilters(nextFilters);
    setPage(1);
    fetchListings(nextFilters, 1);
  }, [location.search, fetchListings]);

  const handleApply = () => {
    setPage(1);
    fetchListings(filters, 1);
  };

  const handleClear = () => {
    const empty = {
      location: "",
      purpose: "any",
      budgetMin: "",
      budgetMax: "",
      roomTypes: [],
      lifestyle: [],
    };
    setFilters(empty);
    setPage(1);
    fetchListings(empty, 1);
  };

  const goPage = (p) => {
    setPage(p);
    fetchListings(filters, p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      style={{
        minHeight: embedded ? "auto" : "100vh",
        display: embedded ? "block" : "flex",
        flexDirection: "column",
        background: "var(--mi-bg)",
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
      }}
    >
      {!embedded && <GuestHeader activeLink="listings" />}

      {/* Page body */}
      <div
        className="mi-listings-page-body"
        style={{
          display: "flex",
          alignItems: "flex-start",
          flex: embedded ? "initial" : 1,
        }}
      >
        {/* ── Left sidebar ── */}
        <FilterSidebar
          filters={filters}
          onChange={setFilters}
          onApply={handleApply}
          onClear={handleClear}
        />

        {/* ── Right content ── */}
        <div
          className="mi-listings-content"
          style={{ flex: 1, minWidth: 0, padding: "1.8rem 2rem" }}
        >
          {/* Result count row — hidden when we couldn't load; "0 found" alongside
              an error message reads as a contradiction. */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <h2
              style={{
                fontWeight: 800,
                fontSize: "1.1rem",
                color: "var(--mi-ink)",
                margin: 0,
              }}
            >
              {loading
                ? "Loading…"
                : loadError
                  ? "Listings"
                  : `${pagination.total} ${pagination.total === 1 ? "property" : "properties"} found`}
            </h2>
          </div>

          {/* Grid */}
          {loading ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(270px,1fr))",
                gap: 20,
              }}
            >
              {Array.from({ length: DEFAULT_LIMIT }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: 340,
                    borderRadius: 18,
                    background: "var(--mi-line)",
                  }}
                />
              ))}
            </div>
          ) : loadError ? (
            // Distinct UI when the API itself failed — separate from the empty-results state
            // so users don't see raw backend error text alongside "No properties found".
            <div
              style={{
                textAlign: "center",
                padding: "4rem 1rem",
                background: "var(--mi-surface)",
                borderRadius: 20,
                border: "1px solid var(--mi-line)",
              }}
            >
              <Home size={48} color="var(--mi-line)" strokeWidth={1.5} />
              <h3
                style={{
                  fontWeight: 700,
                  color: "var(--mi-ink)",
                  marginTop: 16,
                }}
              >
                We couldn’t load listings
              </h3>
              <p
                style={{
                  color: "var(--mi-muted)",
                  maxWidth: 360,
                  margin: "8px auto 20px",
                }}
              >
                Something went wrong on our side. Please try again in a moment.
              </p>
              <button
                className="auth-btn"
                style={{ width: "auto", paddingInline: 24 }}
                onClick={() => fetchListings(filters, page)}
              >
                Retry
              </button>
            </div>
          ) : listings.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "4rem 1rem",
                background: "var(--mi-surface)",
                borderRadius: 20,
                border: "1px solid var(--mi-line)",
              }}
            >
              <Home size={48} color="var(--mi-line)" strokeWidth={1.5} />
              <h3
                style={{
                  fontWeight: 700,
                  color: "var(--mi-ink)",
                  marginTop: 16,
                }}
              >
                No properties found
              </h3>
              <p
                style={{
                  color: "var(--mi-muted)",
                  maxWidth: 360,
                  margin: "8px auto 20px",
                }}
              >
                Try adjusting your filters or searching in a different location.
              </p>
              <button
                className="auth-btn"
                style={{ width: "auto", paddingInline: 24 }}
                onClick={handleClear}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(270px,1fr))",
                gap: 20,
              }}
            >
              {listings.map((unit) => (
                <ListingCard key={unit._id} unit={unit} basePath={basePath} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && pagination.pages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 32,
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <span style={{ fontSize: "0.85rem", color: "var(--mi-muted)" }}>
                Page {pagination.page} of {pagination.pages} ({pagination.total}{" "}
                total)
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  disabled={page <= 1}
                  onClick={() => goPage(page - 1)}
                  style={{
                    width: 36,
                    height: 36,
                    border: "1.5px solid var(--mi-line)",
                    borderRadius: 8,
                    background: "var(--mi-surface)",
                    cursor: page <= 1 ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: page <= 1 ? 0.5 : 1,
                  }}
                >
                  <ChevronLeft size={16} />
                </button>

                {(() => {
                  const total = pagination.pages;
                  const half = 2;
                  let start = Math.max(1, page - half);
                  let end = Math.min(total, page + half);
                  if (end - start < half * 2) {
                    if (start === 1) end = Math.min(total, start + half * 2);
                    else start = Math.max(1, end - half * 2);
                  }
                  const pages = [];
                  if (start > 1) {
                    pages.push(1);
                    if (start > 2) pages.push("…");
                  }
                  for (let p = start; p <= end; p++) pages.push(p);
                  if (end < total) {
                    if (end < total - 1) pages.push("…");
                    pages.push(total);
                  }
                  return pages.map((p, i) =>
                    p === "…" ? (
                      <span
                        key={`ellipsis-${i}`}
                        style={{
                          width: 36,
                          height: 36,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--mi-muted)",
                          fontSize: "0.87rem",
                        }}
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => goPage(p)}
                        style={{
                          width: 36,
                          height: 36,
                          border: `1.5px solid ${page === p ? "var(--mi-brand)" : "var(--mi-line)"}`,
                          borderRadius: 8,
                          background:
                            page === p
                              ? "var(--mi-brand)"
                              : "var(--mi-surface)",
                          color: page === p ? "#fff" : "var(--mi-ink)",
                          fontWeight: page === p ? 700 : 400,
                          cursor: "pointer",
                          fontSize: "0.87rem",
                          fontFamily: "inherit",
                        }}
                      >
                        {p}
                      </button>
                    ),
                  );
                })()}

                <button
                  disabled={page >= pagination.pages}
                  onClick={() => goPage(page + 1)}
                  style={{
                    width: 36,
                    height: 36,
                    border: "1.5px solid var(--mi-line)",
                    borderRadius: 8,
                    background: "var(--mi-surface)",
                    cursor:
                      page >= pagination.pages ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: page >= pagination.pages ? 0.5 : 1,
                  }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {!embedded && <Footer />}
    </div>
  );
}
