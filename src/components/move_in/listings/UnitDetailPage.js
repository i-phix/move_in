import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin,
  Bed,
  Bath,
  Home,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Maximize2,
  CheckCircle2,
  Send,
  CalendarDays,
  Clock,
  Landmark,
  Wifi,
} from "lucide-react";
import { makeRequest, makeRequest2 } from "../../../utils/makeRequest";
import {
  bookGuestMoveInSlotURL,
  bookMoveInSlotURL,
  createGuestMoveInReservationURL,
  createMoveInReservationURL,
  getAvailableSlotsURL,
  getListingURL,
  submitApplicationURL,
  submitGuestApplicationURL,
} from "../../../utils/urls";
import { getItem } from "../../../utils/localStorage";
import { notifyError, notifySuccess } from "../../../utils/toast";
import GuestHeader from "../../layout/GuestHeader";
import Footer from "../../layout/footer";

// Resolve image src from either { url } object or plain string
function imgSrc(img) {
  if (!img) return null;
  return typeof img === "object" ? img.url : img;
}

function ImageGallery({ images }) {
  const [active, setActive] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div
        style={{
          height: 460,
          background: "#e8eef7",
          borderRadius: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Home size={56} color="#c5d0e4" strokeWidth={1.5} />
      </div>
    );
  }

  const prev = () => setActive((a) => (a - 1 + images.length) % images.length);
  const next = () => setActive((a) => (a + 1) % images.length);

  return (
    <div>
      {/* Main image */}
      <div
        style={{
          position: "relative",
          borderRadius: 18,
          overflow: "hidden",
          height: 460,
          background: "#e8eef7",
        }}
      >
        <img
          src={imgSrc(images[active])}
          alt={`Unit ${active + 1}`}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />

        {images.length > 1 && (
          <>
            <button onClick={prev} style={arrowBtn("left")}>
              <ChevronLeft size={20} color="#fff" strokeWidth={2.5} />
            </button>
            <button onClick={next} style={arrowBtn("right")}>
              <ChevronRight size={20} color="#fff" strokeWidth={2.5} />
            </button>
            <div
              style={{
                position: "absolute",
                bottom: 12,
                right: 14,
                background: "rgba(0,0,0,0.5)",
                color: "#fff",
                fontSize: "0.78rem",
                fontWeight: 600,
                padding: "3px 10px",
                borderRadius: 20,
              }}
            >
              {active + 1} / {images.length}
            </div>
          </>
        )}

        {/* Category label */}
        {images[active]?.category && images[active].category !== "Other" && (
          <div
            style={{
              position: "absolute",
              bottom: 12,
              left: 14,
              background: "rgba(0,0,0,0.45)",
              color: "#fff",
              fontSize: "0.75rem",
              fontWeight: 600,
              padding: "3px 10px",
              borderRadius: 20,
            }}
          >
            {images[active].category}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 10,
            overflowX: "auto",
            paddingBottom: 4,
          }}
        >
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                flexShrink: 0,
                width: 90,
                height: 66,
                borderRadius: 10,
                overflow: "hidden",
                border: `2.5px solid ${i === active ? "var(--mi-brand)" : "transparent"}`,
                padding: 0,
                cursor: "pointer",
                background: "#e8eef7",
                transition: "border-color 0.15s",
              }}
            >
              <img
                src={imgSrc(img)}
                alt={`Thumb ${i + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function arrowBtn(side) {
  return {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    [side]: 12,
    width: 38,
    height: 38,
    borderRadius: "50%",
    background: "rgba(0,0,0,0.4)",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.15s",
  };
}

function GuestContactFields({ contact, setContact, showLabel = true }) {
  const update = (field) => (event) => {
    setContact((current) => ({ ...current, [field]: event.target.value }));
  };

  return (
    <>
      {showLabel && <label style={formLabel}>Your Details</label>}
      <input
        className="auth-input"
        style={{ height: 40, fontSize: "0.88rem" }}
        placeholder="Full name"
        value={contact.fullName}
        onChange={update("fullName")}
      />
      <input
        className="auth-input"
        style={{ height: 40, fontSize: "0.88rem" }}
        type="email"
        placeholder="Email address"
        value={contact.email}
        onChange={update("email")}
      />
      <input
        className="auth-input"
        style={{ height: 40, fontSize: "0.88rem" }}
        type="tel"
        placeholder="Phone number"
        value={contact.phoneNumber}
        onChange={update("phoneNumber")}
      />
    </>
  );
}

function ViewingSlots({ slots, loading, bookingSlotId, onBook }) {
  if (loading) {
    return <div style={slotPanelStyle}>Loading viewing slots...</div>;
  }

  if (!slots.length) {
    return (
      <div style={slotPanelStyle}>
        No viewing slots are currently open for this unit.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {slots.map((slot) => {
        const isBooking = bookingSlotId === slot._id;
        const dateStr = new Date(slot.date).toLocaleDateString("en-KE", {
          weekday: "short",
          day: "numeric",
          month: "short",
        });

        return (
          <div
            key={slot._id}
            style={{
              border: "1px solid var(--mi-line)",
              borderRadius: 10,
              padding: "10px 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "0.84rem",
                  color: "var(--mi-ink)",
                }}
              >
                {dateStr}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  color: "var(--mi-muted)",
                  fontSize: "0.78rem",
                  marginTop: 2,
                }}
              >
                <Clock size={12} /> {slot.time}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onBook(slot._id)}
              disabled={isBooking}
              style={{
                height: 34,
                borderRadius: 8,
                border: "none",
                background: "var(--mi-button)",
                color: "#fff",
                fontSize: "0.78rem",
                fontWeight: 700,
                padding: "0 12px",
                cursor: isBooking ? "not-allowed" : "pointer",
                opacity: isBooking ? 0.7 : 1,
              }}
            >
              {isBooking ? "Booking..." : "Book"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default function UnitDetailPage({ embedded = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const backPath = embedded ? "/move-in/listings" : "/listings";

  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);

  // Application form state
  const [applyOpen, setApplyOpen] = useState(false);
  const [desiredDate, setDesiredDate] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [bookingSlotId, setBookingSlotId] = useState(null);
  const [applied, setApplied] = useState(false);
  const [user, setUser] = useState(null);
  const [contact, setContact] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
  });
  const [viewingOpen, setViewingOpen] = useState(false);
  const [viewingSlots, setViewingSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [viewingDate, setViewingDate] = useState("");
  const [viewingTime, setViewingTime] = useState("");

  useEffect(() => {
    (async () => {
      setUser(await getItem("AGENTUSER"));
      setLoading(true);
      const res = await makeRequest(`${getListingURL}/${id}`, "GET");
      setLoading(false);
      if (res.success && res.data?.data) {
        setUnit(res.data.data);
      } else {
        notifyError("Listing not found.");
        navigate("/listings");
      }
    })();
  }, [id, navigate]);

  const isGuest = !user?.authToken;
  const contactPayload = {
    fullName: contact.fullName.trim(),
    email: contact.email.trim(),
    phoneNumber: contact.phoneNumber.trim(),
  };

  const validateGuestContact = () => {
    if (!isGuest) return true;
    if (
      !contactPayload.fullName ||
      !contactPayload.email ||
      !contactPayload.phoneNumber
    ) {
      notifyError(
        "Please share your name, email and phone number so our team can contact you.",
      );
      return false;
    }
    return true;
  };

  const loadViewingSlots = async () => {
    setViewingOpen((open) => !open);
    if (viewingSlots.length > 0 || slotsLoading) return;

    setSlotsLoading(true);
    const res = await makeRequest(
      `${getAvailableSlotsURL}?unitId=${encodeURIComponent(id)}`,
      "GET",
    );
    setSlotsLoading(false);

    if (res.success) {
      const groups = res.data?.data || res.data || [];
      const slots = Array.isArray(groups)
        ? groups.flatMap((group) => group.slots || [])
        : [];
      setViewingSlots(slots);
    } else {
      notifyError(res.error || "Failed to load viewing slots.");
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();

    if (!validateGuestContact()) {
      return;
    }

    setSubmitting(true);
    const payload = {
      unitId: unit._id,
      facilityId: unit.facilityId?._id || unit.facilityId || null,
      desiredMoveInDate: desiredDate || null,
      message: message || null,
      ...(isGuest ? contactPayload : {}),
    };
    const res = isGuest
      ? await makeRequest(submitGuestApplicationURL, "POST", payload)
      : await makeRequest2(submitApplicationURL, "POST", payload);
    setSubmitting(false);

    if (res.success) {
      notifySuccess(
        isGuest
          ? "Application request submitted. Our team will contact you shortly."
          : "Application submitted successfully!",
      );
      setApplied(true);
      setApplyOpen(false);
    } else {
      notifyError(
        res.error || "Failed to submit application. Please try again.",
      );
    }
  };

  const handleReserve = async () => {
    if (!validateGuestContact()) {
      return;
    }

    setReserving(true);
    const payload = {
      unitId: unit._id,
      unitName: unit.title || unit.name,
      facilityId: unit.facilityId?._id || unit.facilityId || null,
      landlordId:
        unit.landlordId?._id ||
        unit.landlordId ||
        unit.landlord?._id ||
        unit.landlord ||
        null,
      desiredMoveInDate: desiredDate || null,
      monthsToStay: null,
      ...(isGuest ? contactPayload : {}),
    };
    const res = isGuest
      ? await makeRequest(createGuestMoveInReservationURL, "POST", payload)
      : await makeRequest2(createMoveInReservationURL, "POST", payload);
    setReserving(false);

    if (res.success) {
      notifySuccess(
        isGuest
          ? "Reservation request submitted. Our team will contact you shortly."
          : "Reservation submitted. A pending reservation fee has been added to your payments.",
      );
      if (!isGuest) navigate("/move-in/reservations");
    } else {
      notifyError(
        res.error || "Failed to reserve this unit. Please try again.",
      );
    }
  };

  const handleBookViewing = async (slotId = null) => {
    if (!validateGuestContact()) {
      return;
    }
    if (!slotId && (!viewingDate || !viewingTime)) {
      notifyError("Choose your preferred viewing date and time.");
      return;
    }

    setBookingSlotId(slotId || "custom");
    const payload = {
      ...(slotId
        ? { slotId }
        : {
            unitId: unit._id,
            unitName: unit.title || unit.name,
            facilityId: unit.facilityId?._id || unit.facilityId || null,
            landlordId:
              unit.landlordId?._id ||
              unit.landlordId ||
              unit.landlord?._id ||
              unit.landlord ||
              null,
            scheduledDate: viewingDate,
            scheduledTime: viewingTime,
          }),
      tenantNote: message || null,
      ...(isGuest ? contactPayload : {}),
    };
    const res = isGuest
      ? await makeRequest(bookGuestMoveInSlotURL, "POST", payload)
      : await makeRequest2(bookMoveInSlotURL, "POST", payload);
    setBookingSlotId(null);

    if (res.success) {
      notifySuccess(
        isGuest
          ? "Viewing request submitted. Our team will contact you shortly."
          : "Viewing booked.",
      );
      setViewingSlots((slots) =>
        slots.filter((slot) => String(slot._id) !== String(slotId)),
      );
      setViewingOpen(false);
      setViewingDate("");
      setViewingTime("");
    } else {
      notifyError(res.error || "Failed to book viewing.");
    }
  };

  if (loading) {
    return (
      <div
        style={{
          background: "var(--mi-bg)",
          fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        }}
      >
        {!embedded && <GuestHeader />}
        <div
          style={{ maxWidth: 900, margin: "0 auto", padding: "2.5rem 1.5rem" }}
        >
          <div
            style={{
              height: 380,
              borderRadius: 18,
              background: "var(--mi-line)",
              marginBottom: 24,
            }}
          />
          <div
            style={{
              height: 28,
              width: "60%",
              borderRadius: 8,
              background: "var(--mi-line)",
              marginBottom: 12,
            }}
          />
          <div
            style={{
              height: 20,
              width: "40%",
              borderRadius: 8,
              background: "var(--mi-line)",
            }}
          />
        </div>
      </div>
    );
  }

  if (!unit) return null;

  const facility = unit.facilityId || {};
  const location = unit.location || {};
  const locationStr = [
    [location.area, location.city || facility.location, location.county]
      .filter(Boolean)
      .join(", "),
    location.address || facility.name,
  ]
    .filter(Boolean)
    .join(" · ");
  const amenities = unit.moveInAmenities || unit.amenities || [];
  const landmarks = Array.isArray(location.landmarks) ? location.landmarks : [];
  const services = Array.isArray(unit.nearbyServices)
    ? unit.nearbyServices
    : [];
  const images = unit.moveInImages || unit.images || [];

  const unitTitle = unit.title || unit.name;
  const unitLocation =
    [location.area, location.city || facility.location, location.county]
      .filter(Boolean)
      .join(", ") || "Nairobi";

  const pageTitle = `${unitTitle} in ${unitLocation} | Move-In Kenya`;
  const pageDesc = [
    unit.moveInBedrooms != null
      ? unit.moveInBedrooms === 0
        ? "Studio"
        : `${unit.moveInBedrooms}-bedroom`
      : null,
    unit.listingType === "sale" ? "property for sale" : "rental property",
    `in ${unitLocation}, Kenya.`,
    unit.moveInPrice
      ? `KES ${Number(unit.moveInPrice).toLocaleString()} ${unit.listingType !== "sale" ? "per month." : ""}`
      : null,
    "Book a viewing online — Move-In Kenya.",
  ]
    .filter(Boolean)
    .join(" ");

  const canonicalUrl = `https://movein.ke/listings/${id}`;
  const firstImage =
    imgSrc(images[0]) ||
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80";

  const listingSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: unitTitle,
    url: canonicalUrl,
    description: pageDesc,
    image: firstImage,
    offers: {
      "@type": "Offer",
      price: unit.moveInPrice || 0,
      priceCurrency: "KES",
      availability: "https://schema.org/InStock",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: facility.name || location.address || "",
      addressLocality: unitLocation,
      addressCountry: "KE",
    },
    numberOfRooms: unit.moveInBedrooms ?? undefined,
    floorSize: unit.grossArea
      ? { "@type": "QuantitativeValue", value: unit.grossArea, unitCode: "MTK" }
      : undefined,
    amenityFeature: amenities.map((a) => ({
      "@type": "LocationFeatureSpecification",
      name: a.replace(/_/g, " "),
      value: true,
    })),
    publisher: {
      "@type": "Organization",
      name: "PayServe",
      url: "https://payserve.co.ke",
      brand: { "@type": "Brand", name: "Move-In Kenya" },
    },
  };

  return (
    <div
      style={{
        background: "var(--mi-bg)",
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
      }}
    >
      {!embedded && (
        <Helmet>
          <title>{pageTitle}</title>
          <meta name="description" content={pageDesc} />
          <meta
            name="keywords"
            content={`${unitTitle}, ${unitLocation} rental, houses for rent ${unitLocation}, apartments ${unitLocation} Nairobi, Move-In Kenya`}
          />
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href={canonicalUrl} />

          {/* Open Graph */}
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="Move-In by PayServe" />
          <meta property="og:title" content={pageTitle} />
          <meta property="og:description" content={pageDesc} />
          <meta property="og:url" content={canonicalUrl} />
          <meta property="og:image" content={firstImage} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:locale" content="en_KE" />

          {/* Twitter */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={pageTitle} />
          <meta name="twitter:description" content={pageDesc} />
          <meta name="twitter:image" content={firstImage} />

          {/* JSON-LD */}
          <script type="application/ld+json">
            {JSON.stringify(listingSchema)}
          </script>
        </Helmet>
      )}

      {!embedded && <GuestHeader activeLink="listings" />}

      <div
        style={{
          maxWidth: 1220,
          margin: "0 auto",
          padding: "2rem 1.5rem 4rem",
        }}
      >
        {/* Back */}
        <a
          href={backPath}
          onClick={(e) => {
            e.preventDefault();
            navigate(backPath);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "var(--mi-muted)",
            fontSize: "0.88rem",
            fontWeight: 600,
            marginBottom: 20,
            padding: 0,
            fontFamily: "inherit",
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={16} strokeWidth={2.5} /> Back to listings
        </a>

        <div
          className="mi-listing-detail-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 340px",
            gap: 32,
            alignItems: "flex-start",
          }}
        >
          {/* ── Left ── */}
          <div>
            <ImageGallery images={images} />

            {/* Title + location */}
            <div style={{ marginTop: 24 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <h1
                  style={{
                    fontWeight: 800,
                    fontSize: "1.5rem",
                    color: "var(--mi-ink)",
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  {unit.title || unit.name}
                </h1>
                <span
                  style={{
                    background: "var(--mi-brand)",
                    color: "#fff",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "4px 12px",
                    borderRadius: 20,
                    letterSpacing: "0.04em",
                    flexShrink: 0,
                    alignSelf: "flex-start",
                    marginTop: 4,
                  }}
                >
                  {unit.listingType === "sale" ? "FOR SALE" : "FOR RENT"}
                </span>
              </div>

              {locationStr && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    marginTop: 8,
                  }}
                >
                  <MapPin size={14} color="var(--mi-muted)" strokeWidth={2} />
                  <span
                    style={{ fontSize: "0.88rem", color: "var(--mi-muted)" }}
                  >
                    {locationStr}
                  </span>
                </div>
              )}
            </div>

            {/* Specs row */}
            <div
              style={{
                display: "flex",
                gap: 20,
                flexWrap: "wrap",
                margin: "20px 0",
                padding: "16px 20px",
                background: "var(--mi-surface)",
                border: "1px solid var(--mi-line)",
                borderRadius: 14,
              }}
            >
              {unit.moveInBedrooms != null && (
                <div style={specItem}>
                  <Bed size={18} color="var(--mi-brand)" strokeWidth={2} />
                  <div>
                    <div style={specLabel}>Bedrooms</div>
                    <div style={specValue}>
                      {unit.moveInBedrooms === 0
                        ? "Studio"
                        : unit.moveInBedrooms}
                    </div>
                  </div>
                </div>
              )}
              {unit.moveInBathrooms != null && (
                <div style={specItem}>
                  <Bath size={18} color="var(--mi-brand)" strokeWidth={2} />
                  <div>
                    <div style={specLabel}>Bathrooms</div>
                    <div style={specValue}>{unit.moveInBathrooms}</div>
                  </div>
                </div>
              )}
              {unit.grossArea && (
                <div style={specItem}>
                  <Maximize2
                    size={18}
                    color="var(--mi-brand)"
                    strokeWidth={2}
                  />
                  <div>
                    <div style={specLabel}>Floor Area</div>
                    <div style={specValue}>{unit.grossArea} m²</div>
                  </div>
                </div>
              )}
              {unit.listingType && (
                <div style={specItem}>
                  <Home size={18} color="var(--mi-brand)" strokeWidth={2} />
                  <div>
                    <div style={specLabel}>Type</div>
                    <div style={specValue}>{unit.listingType}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {(unit.moveInDescription || unit.description) && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={sectionTitle}>About this property</h3>
                <p
                  style={{
                    color: "var(--mi-ink)",
                    lineHeight: 1.75,
                    fontSize: "0.93rem",
                    margin: 0,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {unit.moveInDescription || unit.description}
                </p>
              </div>
            )}

            {/* Amenities */}
            {amenities.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={sectionTitle}>Amenities & Features</h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(180px, 1fr))",
                    gap: 10,
                  }}
                >
                  {amenities.map((a) => (
                    <div
                      key={a}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: "0.88rem",
                        color: "var(--mi-ink)",
                      }}
                    >
                      <CheckCircle2
                        size={15}
                        color="var(--mi-brand)"
                        strokeWidth={2.5}
                        style={{ flexShrink: 0 }}
                      />
                      <span style={{ textTransform: "capitalize" }}>
                        {a.replace(/_/g, " ")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(landmarks.length > 0 || services.length > 0) && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 18,
                  marginBottom: 24,
                }}
              >
                {landmarks.length > 0 && (
                  <div>
                    <h3 style={sectionTitle}>Nearby Landmarks</h3>
                    <div style={{ display: "grid", gap: 10 }}>
                      {landmarks.map((item) => (
                        <div
                          key={item}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            fontSize: "0.88rem",
                            color: "var(--mi-ink)",
                          }}
                        >
                          <Landmark
                            size={15}
                            color="var(--mi-brand)"
                            strokeWidth={2.5}
                          />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {services.length > 0 && (
                  <div>
                    <h3 style={sectionTitle}>Nearby Services</h3>
                    <div style={{ display: "grid", gap: 10 }}>
                      {services.map((item) => (
                        <div
                          key={item}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            fontSize: "0.88rem",
                            color: "var(--mi-ink)",
                          }}
                        >
                          <Wifi
                            size={15}
                            color="var(--mi-brand)"
                            strokeWidth={2.5}
                          />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Right sidebar ── */}
          <div
            className="mi-listing-detail-actions"
            style={{ position: "sticky", top: 84 }}
          >
            <div
              style={{
                background: "var(--mi-surface)",
                border: "1px solid var(--mi-line)",
                borderRadius: 20,
                padding: "1.35rem",
                boxShadow: "0 8px 32px rgba(15,23,42,0.07)",
              }}
            >
              {/* Price */}
              <div style={{ marginBottom: 18 }}>
                {unit.moveInPrice ? (
                  <>
                    <span
                      style={{
                        fontWeight: 800,
                        fontSize: "1.7rem",
                        color: "var(--mi-brand)",
                      }}
                    >
                      KES {Number(unit.moveInPrice).toLocaleString()}
                    </span>
                    {unit.listingType !== "sale" && (
                      <span
                        style={{
                          fontSize: "0.85rem",
                          color: "var(--mi-muted)",
                          marginLeft: 4,
                        }}
                      >
                        /month
                      </span>
                    )}
                  </>
                ) : (
                  <span
                    style={{ fontSize: "0.9rem", color: "var(--mi-muted)" }}
                  >
                    Price on request
                  </span>
                )}
              </div>

              {applied ? (
                <div
                  style={{
                    background: "#dcfce7",
                    color: "#166534",
                    borderRadius: 12,
                    padding: "14px 16px",
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <CheckCircle2 size={16} /> Application submitted!
                </div>
              ) : applyOpen ? (
                <form
                  onSubmit={handleApply}
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  <div style={panelHeading}>Apply for this unit</div>
                  {isGuest && (
                    <GuestContactFields
                      contact={contact}
                      setContact={setContact}
                    />
                  )}
                  <label style={formLabel}>Desired Move-In Date</label>
                  <input
                    type="date"
                    className="auth-input"
                    style={{ height: 40, fontSize: "0.88rem" }}
                    value={desiredDate}
                    onChange={(e) => setDesiredDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                  <label style={formLabel}>Message (optional)</label>
                  <textarea
                    className="auth-input"
                    style={{
                      height: 90,
                      fontSize: "0.88rem",
                      resize: "vertical",
                      padding: "8px 12px",
                    }}
                    placeholder="Introduce yourself or ask a question…"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => setApplyOpen(false)}
                      style={{
                        flex: 1,
                        height: 42,
                        borderRadius: 10,
                        border: "1.5px solid var(--mi-line)",
                        background: "var(--mi-surface)",
                        color: "var(--mi-ink)",
                        fontWeight: 600,
                        fontSize: "0.88rem",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        flex: 2,
                        height: 42,
                        borderRadius: 10,
                        border: "none",
                        background: "var(--mi-button)",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "0.88rem",
                        cursor: submitting ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        fontFamily: "inherit",
                        opacity: submitting ? 0.7 : 1,
                      }}
                    >
                      {submitting ? (
                        "Submitting…"
                      ) : (
                        <>
                          <Send size={14} /> Submit
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {isGuest && (
                    <div style={contactCardStyle}>
                      <div style={panelHeading}>Your details</div>
                      <GuestContactFields
                        contact={contact}
                        setContact={setContact}
                        showLabel={false}
                      />
                    </div>
                  )}
                  <button
                    onClick={() => setApplyOpen(true)}
                    style={{
                      width: "100%",
                      height: 48,
                      borderRadius: 12,
                      border: "none",
                      background: "var(--mi-button)",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "0.97rem",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Apply for this unit
                  </button>
                  <button
                    onClick={handleReserve}
                    disabled={reserving}
                    style={{
                      width: "100%",
                      height: 44,
                      borderRadius: 12,
                      border: "1.5px solid var(--mi-brand)",
                      background: "var(--mi-surface)",
                      color: "var(--mi-brand)",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      cursor: reserving ? "not-allowed" : "pointer",
                      fontFamily: "inherit",
                      opacity: reserving ? 0.7 : 1,
                    }}
                  >
                    {reserving ? "Reserving..." : "Reserve this unit"}
                  </button>
                  <button
                    onClick={loadViewingSlots}
                    style={{
                      width: "100%",
                      height: 44,
                      borderRadius: 12,
                      border: "1.5px solid var(--mi-line)",
                      background: "var(--mi-surface)",
                      color: "var(--mi-ink)",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <CalendarDays size={15} /> Book a viewing
                  </button>
                  {viewingOpen && (
                    <div style={viewingPanelStyle}>
                      <div style={panelHeading}>Preferred viewing time</div>
                      <div className="mi-form-grid-2">
                        <div>
                          <label style={compactLabel}>Date</label>
                          <input
                            type="date"
                            className="auth-input"
                            style={{ height: 40, fontSize: "0.86rem" }}
                            value={viewingDate}
                            onChange={(e) => setViewingDate(e.target.value)}
                            min={new Date().toISOString().split("T")[0]}
                          />
                        </div>
                        <div>
                          <label style={compactLabel}>Time</label>
                          <input
                            type="time"
                            className="auth-input"
                            style={{ height: 40, fontSize: "0.86rem" }}
                            value={viewingTime}
                            onChange={(e) => setViewingTime(e.target.value)}
                          />
                        </div>
                      </div>
                      <label style={compactLabel}>Message (optional)</label>
                      <textarea
                        className="auth-input"
                        style={{
                          height: 74,
                          fontSize: "0.86rem",
                          resize: "vertical",
                          padding: "8px 12px",
                        }}
                        placeholder="Anything the landlord should know?"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => handleBookViewing()}
                        disabled={bookingSlotId === "custom"}
                        style={{
                          width: "100%",
                          height: 42,
                          border: "none",
                          borderRadius: 10,
                          background: "var(--mi-button)",
                          color: "#fff",
                          fontWeight: 800,
                          cursor:
                            bookingSlotId === "custom"
                              ? "not-allowed"
                              : "pointer",
                          opacity: bookingSlotId === "custom" ? 0.7 : 1,
                        }}
                      >
                        {bookingSlotId === "custom"
                          ? "Sending..."
                          : "Send viewing request"}
                      </button>
                      <ViewingSlots
                        slots={viewingSlots}
                        loading={slotsLoading}
                        bookingSlotId={bookingSlotId}
                        onBook={handleBookViewing}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Facility tag */}
              {facility.name && (
                <div
                  style={{
                    marginTop: 16,
                    paddingTop: 16,
                    borderTop: "1px solid var(--mi-line)",
                    fontSize: "0.82rem",
                    color: "var(--mi-muted)",
                  }}
                >
                  Listed under{" "}
                  <strong style={{ color: "var(--mi-ink)" }}>
                    {facility.name}
                  </strong>
                  {facility.location && ` · ${facility.location}`}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {!embedded && <Footer />}
    </div>
  );
}

const specItem = { display: "flex", alignItems: "center", gap: 10 };
const specLabel = {
  fontSize: "0.72rem",
  color: "var(--mi-muted)",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};
const specValue = {
  fontSize: "0.97rem",
  fontWeight: 700,
  color: "var(--mi-ink)",
  marginTop: 1,
};
const sectionTitle = {
  fontWeight: 700,
  fontSize: "1rem",
  color: "var(--mi-ink)",
  marginBottom: 14,
  marginTop: 0,
};
const formLabel = {
  fontSize: "0.82rem",
  fontWeight: 600,
  color: "var(--mi-ink)",
  marginBottom: 2,
};
const compactLabel = {
  ...formLabel,
  fontSize: "0.76rem",
  color: "var(--mi-muted)",
};
const panelHeading = {
  fontSize: "0.82rem",
  fontWeight: 800,
  color: "var(--mi-ink)",
  marginBottom: 2,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};
const contactCardStyle = {
  background: "#f8fafc",
  border: "1px solid var(--mi-line)",
  borderRadius: 14,
  display: "flex",
  flexDirection: "column",
  gap: 10,
  padding: 12,
};
const viewingPanelStyle = {
  background: "#f8fafc",
  border: "1px solid var(--mi-line)",
  borderRadius: 14,
  display: "flex",
  flexDirection: "column",
  gap: 10,
  padding: 12,
};
const slotPanelStyle = {
  border: "1px solid var(--mi-line)",
  borderRadius: 10,
  padding: "12px",
  color: "var(--mi-muted)",
  fontSize: "0.82rem",
  textAlign: "center",
};
