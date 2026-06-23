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

export default function ListingListRow({ unit, basePath = "/listings" }) {
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
          display: "flex",
          gap: 0,
          background: "var(--mi-surface)",
          border: "1px solid var(--mi-line)",
          borderRadius: 14,
          overflow: "hidden",
          boxShadow: "0 2px 10px rgba(15,23,42,0.04)",
          transition: "box-shadow 0.2s, transform 0.2s",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "0 8px 28px rgba(15,23,42,0.10)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "0 2px 10px rgba(15,23,42,0.04)";
          e.currentTarget.style.transform = "none";
        }}
      >
        {/* Image */}
        <div
          style={{
            width: 200,
            flexShrink: 0,
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
            <Home size={36} color="var(--mi-line)" strokeWidth={1.5} />
          )}
          <div
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              background:
                unit.listingType === "sale" ? "#059669" : "var(--mi-brand)",
              color: "#fff",
              fontSize: "0.68rem",
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 20,
              letterSpacing: "0.04em",
            }}
          >
            {unit.listingType === "sale" ? "FOR SALE" : "FOR RENT"}
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            padding: "1rem 1.2rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minWidth: 0,
          }}
        >
          <div>
            <h3
              style={{
                fontWeight: 700,
                fontSize: "0.97rem",
                color: "var(--mi-ink)",
                margin: "0 0 4px",
                lineHeight: 1.3,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
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
                <MapPin size={12} color="var(--mi-muted)" strokeWidth={2} />
                <span
                  style={{
                    fontSize: "0.80rem",
                    color: "var(--mi-muted)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {formatUnitLocation(unit)}
                </span>
              </div>
            )}

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
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
                    <Bed size={13} color="var(--mi-brand)" strokeWidth={2} />
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
                  <Bath size={13} color="var(--mi-brand)" strokeWidth={2} />
                  {unit.moveInBathrooms} bath
                </div>
              )}
              {unit.grossArea && (
                <div style={{ fontSize: "0.82rem", color: "var(--mi-muted)" }}>
                  {unit.grossArea} m²
                </div>
              )}
            </div>
          </div>

          {unit.moveInAmenities?.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 5,
                marginTop: 10,
              }}
            >
              {unit.moveInAmenities.slice(0, 5).map((a) => (
                <span
                  key={a}
                  style={{
                    fontSize: "0.70rem",
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
              {unit.moveInAmenities.length > 5 && (
                <span style={{ fontSize: "0.70rem", color: "var(--mi-muted)" }}>
                  +{unit.moveInAmenities.length - 5} more
                </span>
              )}
            </div>
          )}
        </div>

        <div
          style={{
            flexShrink: 0,
            padding: "1rem 1.2rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            justifyContent: "space-between",
            borderLeft: "1px solid var(--mi-line)",
            minWidth: 140,
          }}
        >
          <div style={{ textAlign: "right" }}>
            {unit.moveInPrice ? (
              <>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: "1.05rem",
                    color: "var(--mi-brand)",
                    lineHeight: 1.2,
                  }}
                >
                  KES {Number(unit.moveInPrice).toLocaleString()}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--mi-muted)",
                    marginTop: 2,
                  }}
                >
                  {unit.listingType === "sale" ? "asking price" : "per month"}
                </div>
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
              marginTop: 12,
            }}
          >
            View <ArrowRight size={13} />
          </span>
        </div>
      </div>
    </Link>
  );
}
