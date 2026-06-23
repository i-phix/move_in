import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Bed, Bath, ArrowRight, Home } from "lucide-react";

const formatUnitLocation = (unit = {}) => {
  const loc = unit.location || {};
  const facility = unit.facilityId || {};
  const primary = [loc.area, loc.city || facility.location, loc.county]
    .filter(Boolean)
    .join(", ");
  const secondary = loc.address || facility.name || "";
  return [primary, secondary].filter(Boolean).join(" · ");
};
function ListingCard({ unit, basePath = "/listings" }) {
  const rawImg = unit.moveInImages?.[0] || unit.images?.[0];
  const img = rawImg
    ? typeof rawImg === "object"
      ? rawImg.url
      : rawImg
    : null;

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
              alt={`${unit.name}${formatUnitLocation(unit) ? ` in ${formatUnitLocation(unit)}` : ""} — ${unit.listingType === "sale" ? "for sale" : "for rent"} in Nairobi, Kenya`}
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

export default function ListingCardView({
  listings = [],
  basePath = "/listings",
}) {
  return (
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
  );
}
