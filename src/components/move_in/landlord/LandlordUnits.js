import React, { useEffect, useRef, useState } from "react";
import {
  Plus,
  Edit2,
  X,
  Check,
  Building2,
  MapPin,
  DollarSign,
  Image,
  Upload,
  Ruler,
  Landmark,
  Wifi,
} from "lucide-react";
import { makeRequest2, makeRequest3 } from "../../../utils/makeRequest";
import {
  getLandlordUnitsURL,
  createLandlordUnitURL,
  updateLandlordUnitURL,
  uploadUnitImagesURL,
} from "../../../utils/urls";
import { notifySuccess, notifyError } from "../../../utils/toast";
import Breadcrumb from "../../common/Breadcrumb";
import LocationSuggestions from "../../common/LocationSuggestions";
import AIDescriptionField from "../../common/AIDescriptionField";

const BLANK = {
  title: "",
  description: "",
  listingType: "",
  bedrooms: "",
  bathrooms: "",
  grossArea: "",
  price: "",
  area: "",
  city: "",
  county: "",
  address: "",
  googleMapsUrl: "",
  landmarksText: "",
  amenitiesText: "",
  servicesText: "",
};

const TYPES = [
  "Apartment",
  "Studio",
  "Bedsitter",
  "Bungalow",
  "Maisonette",
  "Townhouse",
  "Villa",
  "Office",
];

const AMENITY_CHIPS = [
  "Parking",
  "Gym",
  "Security",
  "Swimming Pool",
  "Elevator",
  "Generator",
  "CCTV",
  "Borehole",
  "Garden",
  "Rooftop",
  "Furnished",
  "Unfurnished",
  "WiFi",
  "Air Conditioning",
  "Balcony",
  "DSQ",
  "Walk-in Closet",
  "Storage",
  "Alarm",
  "Fresh Paint",
];
const SERVICE_CHIPS = [
  "Hospital",
  "School",
  "Supermarket",
  "Bank",
  "Pharmacy",
  "Restaurant",
  "Petrol Station",
  "Mall",
  "Bus Stop",
];

const imageUrl = (image) => {
  if (!image) return null;
  if (typeof image === "string") return image;
  return image.url || image.path || null;
};

const splitCsv = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const joinList = (value) => (Array.isArray(value) ? value.join(", ") : "");

const displayLocation = (location = {}) =>
  [location.area, location.city, location.county, location.address]
    .filter(Boolean)
    .join(", ");

const reviewStatus = (unit) => {
  if (unit.moveInApproval === "approved")
    return { label: "approved", bg: "#dcfce7", color: "#15803d" };
  if (unit.moveInApproval === "pending")
    return { label: "pending approval", bg: "#fff7e6", color: "#d97706" };
  if (unit.moveInApproval === "rejected")
    return { label: "rejected", bg: "#fee2e2", color: "#b91c1c" };
  return { label: "draft", bg: "var(--mi-line)", color: "var(--mi-muted)" };
};

/* ── Chip toggle helper ── */
function ChipGroup({ label, chips, value, onChange }) {
  const selected = splitCsv(value);

  const toggle = (chip) => {
    const next = selected.includes(chip)
      ? selected.filter((c) => c !== chip)
      : [...selected, chip];
    onChange(next.join(", "));
  };

  return (
    <div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "var(--mi-muted)",
          marginBottom: 8,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {chips.map((chip) => {
          const active = selected.includes(chip);
          return (
            <button
              key={chip}
              type="button"
              onClick={() => toggle(chip)}
              style={{
                padding: "6px 14px",
                borderRadius: 999,
                border: active
                  ? "1.5px solid var(--mi-button)"
                  : "1.5px solid var(--mi-line)",
                background: active ? "var(--mi-button)" : "#fff",
                color: active ? "#fff" : "var(--mi-ink)",
                fontSize: 12,
                fontWeight: active ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.15s ease",
                fontFamily: "inherit",
              }}
            >
              {chip}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Pill input ── */
const pillInp = {
  width: "100%",
  padding: "10px 16px",
  border: "1.5px solid var(--mi-line)",
  borderRadius: 999,
  fontSize: 13,
  outline: "none",
  color: "var(--mi-ink)",
  background: "#fff",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
  fontFamily: "inherit",
};

const pillSelect = {
  ...pillInp,
  appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 14px center",
  paddingRight: 36,
  cursor: "pointer",
};

const label = {
  display: "block",
  fontSize: 11,
  fontWeight: 600,
  color: "var(--mi-muted)",
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const sectionHeader = {
  fontSize: 13,
  fontWeight: 700,
  color: "var(--mi-ink)",
  marginTop: 8,
  marginBottom: 4,
  paddingBottom: 8,
  borderBottom: "1px solid var(--mi-line)",
};

/* ── UnitForm ── */

function UnitForm({ initial, onSave, onCancel, saving, title }) {
  const [form, setForm] = useState(initial);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleChip = (field) => (val) =>
    setForm((p) => ({ ...p, [field]: val }));

  const focusStyle = (e) => {
    e.target.style.borderColor = "var(--mi-brand)";
  };
  const blurStyle = (e) => {
    e.target.style.borderColor = "var(--mi-line)";
  };

  return (
    <div
      style={{
        border: "1px solid var(--mi-line)",
        borderRadius: 16,
        padding: 24,
        background: "#fafbfc",
        marginBottom: 16,
      }}
    >
      <div
        style={{
          fontWeight: 700,
          fontSize: 15,
          color: "var(--mi-ink)",
          marginBottom: 20,
        }}
      >
        {title}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {/* ── Basic details ── */}
        <div>
          <div style={sectionHeader}>Basic details</div>
          <label style={label}>Facility Name</label>
          <input
            style={pillInp}
            name="facilityName"
            value={form.facilityName}
            onChange={handleChange}
            placeholder="e.g. Westlands Heights"
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>

        <div>
          <label style={label}>Title *</label>
          <input
            style={pillInp}
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. 2BR Apartment in Westlands"
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>

        <div className="mi-form-grid-3">
          <div>
            <label style={label}>Type</label>
            <select
              style={pillSelect}
              name="listingType"
              value={form.listingType}
              onChange={handleChange}
              onFocus={focusStyle}
              onBlur={blurStyle}
            >
              <option value="">— select —</option>
              {TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={label}>Bedrooms</label>
            <select
              style={pillSelect}
              name="bedrooms"
              value={form.bedrooms}
              onChange={handleChange}
              onFocus={focusStyle}
              onBlur={blurStyle}
            >
              <option value="">— select —</option>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>
                  {n === 0 ? "Studio" : n}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={label}>Bathrooms</label>
            <select
              style={pillSelect}
              name="bathrooms"
              value={form.bathrooms}
              onChange={handleChange}
              onFocus={focusStyle}
              onBlur={blurStyle}
            >
              <option value="">— select —</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mi-form-grid-2">
          <div>
            <label style={label}>Price (KES/mo) *</label>
            <input
              style={pillInp}
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>
          <div>
            <label style={label}>Floor Area (m²)</label>
            <input
              style={pillInp}
              type="number"
              name="grossArea"
              value={form.grossArea}
              onChange={handleChange}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>
        </div>

        {/* ── Location ── */}
        <div style={sectionHeader}>Location</div>

        <div className="mi-form-grid-3">
          <div>
            <LocationSuggestions
              label="Area / Estate *"
              value={form.area}
              onChange={(loc) =>
                setForm((p) => ({
                  ...p,
                  area: loc?.name || "",
                  city: loc?.city || "",
                  county: loc?.county || "",
                  landmarksText: loc?.nearbyServices?.join(", ") || "",
                  servicesText: loc?.nearbyCategories?.join(", ") || "",
                  googleMapsUrl:
                    loc?.location?.coordinates?.length === 2
                      ? `https://www.google.com/maps?q=${loc.location.coordinates[1]},${loc.location.coordinates[0]}`
                      : p.googleMapsUrl,
                }))
              }
              placeholder="e.g. Kilimani"
            />
          </div>
          <div>
            <label style={label}>City</label>
            <input
              style={pillInp}
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="e.g. Nairobi"
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>
          <div>
            <label style={label}>County</label>
            <input
              style={pillInp}
              name="county"
              value={form.county}
              onChange={handleChange}
              placeholder="e.g. Nairobi"
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>
        </div>

        <div>
          <label style={label}>Address</label>
          <input
            style={pillInp}
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Street or area"
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>

        <div className="mi-form-grid-2">
          <div>
            <label style={label}>Landmarks</label>
            <input
              style={pillInp}
              name="landmarksText"
              value={form.landmarksText}
              onChange={handleChange}
              placeholder="e.g. Two Rivers, Quickmart"
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
            {/* ── Landmarks ── */}
            <div>
              <div style={sectionHeader}>Nearby Landmarks</div>
              {form.landmarksText ? (
                <ChipGroup
                  label="Landmarks"
                  chips={form.landmarksText
                    .split(",")
                    .map((l) => l.trim())
                    .filter(Boolean)}
                  value={form.landmarksText}
                  onChange={handleChip("landmarksText")}
                />
              ) : (
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--mi-muted)",
                    fontStyle: "italic",
                  }}
                >
                  Select an area above to auto-populate nearby landmarks.
                </div>
              )}
            </div>
          </div>
          <div>
            <label style={label}>Map Link</label>
            <input
              style={pillInp}
              name="googleMapsUrl"
              value={form.googleMapsUrl}
              onChange={handleChange}
              placeholder="Google Maps URL"
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>
        </div>

        {/* ── Features ── */}
        <div style={sectionHeader}>Features and services</div>

        <ChipGroup
          label="Amenities"
          chips={AMENITY_CHIPS}
          value={form.amenitiesText}
          onChange={handleChip("amenitiesText")}
        />
        <ChipGroup
          label="Nearby Services"
          chips={SERVICE_CHIPS}
          value={form.servicesText}
          onChange={handleChip("servicesText")}
        />

        <AIDescriptionField
          value={form.description}
          onChange={(val) => setForm((p) => ({ ...p, description: val }))}
          context={{
            Title: form.title,
            Type: form.listingType,
            Bedrooms: form.bedrooms,
            Bathrooms: form.bathrooms,
            "Floor area (m²)": form.grossArea,
            "Price (KES/mo)": form.price,
            Area: form.area,
            City: form.city,
            County: form.county,
            Address: form.address,
            "Nearby landmarks": form.landmarksText,
            Amenities: form.amenitiesText,
            "Nearby services": form.servicesText,
          }}
        />

        {/* ── Actions ── */}
        <div className="mi-actions-row">
          <button
            onClick={() => onSave(form)}
            disabled={saving}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 22px",
              borderRadius: 999,
              border: "none",
              background: "var(--mi-button)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
              fontFamily: "inherit",
            }}
          >
            <Check size={14} /> {saving ? "Saving…" : "Save Unit"}
          </button>
          <button
            onClick={onCancel}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 22px",
              borderRadius: 999,
              border: "1.5px solid var(--mi-line)",
              background: "#fff",
              color: "var(--mi-muted)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <X size={14} /> Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
function ImagePanel({ unit, onUpdated }) {
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);
  const images = unit.images || [];

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const fd = new FormData();
    files.forEach((f) => fd.append("images", f));
    const res = await makeRequest3(
      `${uploadUnitImagesURL}/${unit._id}/images`,
      "POST",
      fd,
    );
    setUploading(false);
    if (res.success) {
      notifySuccess(`${files.length} photo(s) uploaded.`);
      onUpdated(unit._id, res.data?.data?.images || res.data?.images || []);
    } else {
      notifyError(res.error || "Upload failed.");
    }
    e.target.value = "";
  };

  return (
    <div
      style={{
        padding: "12px 20px 16px",
        borderTop: "1px solid var(--mi-line)",
        background: "#fafbfc",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--mi-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          Photos ({images.length})
        </span>
        <button
          onClick={() => fileRef.current.click()}
          disabled={uploading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "5px 14px",
            borderRadius: 999,
            border: "1.5px solid var(--mi-line)",
            background: "#fff",
            color: "var(--mi-ink)",
            fontSize: 12,
            fontWeight: 500,
            cursor: uploading ? "not-allowed" : "pointer",
            opacity: uploading ? 0.6 : 1,
            fontFamily: "inherit",
          }}
        >
          <Upload size={13} /> {uploading ? "Uploading…" : "Upload"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={handleUpload}
        />
      </div>
      {images.length === 0 ? (
        <div
          style={{
            fontSize: 12,
            color: "var(--mi-muted)",
            fontStyle: "italic",
          }}
        >
          No photos yet. Click Upload to add some.
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {images.map((img, i) => (
            <img
              key={i}
              src={img.url}
              alt={img.label || "photo"}
              style={{
                width: 72,
                height: 72,
                objectFit: "cover",
                borderRadius: 10,
                border: "1px solid var(--mi-line)",
              }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── LandlordUnits — unchanged logic ── */
function LandlordUnits() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState(null);
  const [photoId, setPhotoId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchUnits = async () => {
    setLoading(true);
    const res = await makeRequest2(getLandlordUnitsURL, "GET");
    if (res.success) setUnits(res.data?.data || res.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const handleCreate = async (form) => {
    if (!form.title) {
      notifyError("Title is required.");
      return;
    }

    if (!form.price) {
      notifyError("Price is required.");
      return;
    }
    if (!form.listingType) {
      notifyError("Please select a property type.");
      return;
    }
    setSaving(true);
    const res = await makeRequest2(createLandlordUnitURL, "POST", {
      facilityName: form.facilityName,
      title: form.title,
      description: form.description,
      listingType: form.listingType,
      bedrooms: form.bedrooms !== "" ? Number(form.bedrooms) : undefined,
      bathrooms: form.bathrooms !== "" ? Number(form.bathrooms) : undefined,
      grossArea: form.grossArea !== "" ? Number(form.grossArea) : undefined,
      price: Number(form.price),
      location: {
        // ← nested object
        area: form.area || null,
        city: form.city || null,
        county: form.county || null,
        address: form.address || null,
        googleMapsUrl: form.googleMapsUrl || null,
      },
      landmarks: splitCsv(form.landmarksText),
      amenities: splitCsv(form.amenitiesText),
      nearbyServices: splitCsv(form.servicesText),
    });
    setSaving(false);
    if (res.success) {
      notifySuccess("Unit created. It will be listed once approved.");
      setShowCreate(false);
      fetchUnits();
    } else {
      notifyError(res.error || "Failed to create unit.");
    }
  };

  const handleUpdate = async (unitId, form) => {
    console.log("FORM location fields:", {
      area: form.area,
      city: form.city,
      county: form.county,
      address: form.address,
      googleMapsUrl: form.googleMapsUrl,
    });
    setSaving(true);
    const res = await makeRequest2(
      `${updateLandlordUnitURL}/${unitId}`,
      "PUT",
      {
        facilityName: form.facilityName,
        title: form.title,
        description: form.description,
        listingType: form.listingType || undefined,
        bedrooms: form.bedrooms !== "" ? Number(form.bedrooms) : undefined,
        bathrooms: form.bathrooms !== "" ? Number(form.bathrooms) : undefined,
        grossArea: form.grossArea !== "" ? Number(form.grossArea) : undefined,
        price: Number(form.price),
        location: {
          area: form.area || null,
          city: form.city || null,
          county: form.county || null,
          address: form.address || null,
          googleMapsUrl: form.googleMapsUrl || null,
        },
        landmarks: splitCsv(form.landmarksText),
        amenities: splitCsv(form.amenitiesText),
        nearbyServices: splitCsv(form.servicesText),
      },
    );
    setSaving(false);
    if (res.success) {
      notifySuccess("Unit updated.");
      setEditId(null);
      fetchUnits();
    } else {
      notifyError(res.error || "Failed to update unit.");
    }
  };

  const handleImagesUpdated = (unitId, newImages) => {
    setUnits((prev) =>
      prev.map((u) => (u._id === unitId ? { ...u, images: newImages } : u)),
    );
  };

  const unitToForm = (u) => ({
    title: u.title || "",
    description: u.description || "",
    listingType: u.listingType || "",
    bedrooms: u.bedrooms ?? "",
    bathrooms: u.bathrooms ?? "",
    grossArea: u.grossArea ?? "",
    price: u.price ?? "",
    area: u.location?.area || "",
    city: u.location?.city || "",
    county: u.location?.county || "",
    address: u.location?.address || "",
    googleMapsUrl: u.location?.googleMapsUrl || "",
    landmarksText: joinList(u.location?.landmarks),
    amenitiesText: joinList(u.amenities),
    servicesText: joinList(u.nearbyServices),
  });

  return (
    <div>
      <Breadcrumb items={[{ label: "My Units" }]} />

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "var(--mi-ink)",
              marginBottom: 4,
            }}
          >
            My Units
          </h2>
          <p style={{ color: "var(--mi-muted)", margin: 0, fontSize: 14 }}>
            List and manage your rental properties
          </p>
        </div>
        <button
          onClick={() => {
            setShowCreate((v) => !v);
            setEditId(null);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "9px 20px",
            borderRadius: 999,
            border: "none",
            background: showCreate ? "var(--mi-line)" : "var(--mi-button)",
            color: showCreate ? "var(--mi-ink)" : "#fff",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {showCreate ? (
            <>
              <X size={15} /> Cancel
            </>
          ) : (
            <>
              <Plus size={15} /> Add Unit
            </>
          )}
        </button>
      </div>

      {showCreate && (
        <UnitForm
          initial={BLANK}
          title="New Unit"
          saving={saving}
          onSave={handleCreate}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              style={{
                height: 72,
                borderRadius: 14,
                background: "var(--mi-line)",
              }}
            />
          ))}
        </div>
      ) : units.length === 0 ? (
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: "1px solid var(--mi-line)",
            padding: "64px 20px",
            textAlign: "center",
          }}
        >
          <Building2
            size={40}
            style={{ color: "var(--mi-line)", marginBottom: 12 }}
          />
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "var(--mi-ink)",
              marginBottom: 6,
            }}
          >
            No units yet
          </div>
          <div style={{ fontSize: 13, color: "var(--mi-muted)" }}>
            Click "Add Unit" to list your first property.
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {units.map((u) => {
            const approval = reviewStatus(u);
            const firstImage = imageUrl((u.images || [])[0]);
            const isEditing = editId === u._id;
            const locationText = displayLocation(u.location);
            return (
              <div
                key={u._id}
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  border: "1px solid var(--mi-line)",
                  overflow: "hidden",
                  boxShadow: "0 1px 6px rgba(17,24,39,0.04)",
                }}
              >
                {isEditing ? (
                  <div style={{ padding: 16 }}>
                    <UnitForm
                      initial={unitToForm(u)}
                      title={`Edit: ${u.title}`}
                      saving={saving}
                      onSave={(form) => handleUpdate(u._id, form)}
                      onCancel={() => setEditId(null)}
                    />
                  </div>
                ) : (
                  <>
                    <div
                      style={{
                        padding: "16px 20px",
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        flexWrap: "wrap",
                      }}
                    >
                      {firstImage ? (
                        <img
                          src={firstImage}
                          alt={u.title || "Unit photo"}
                          style={{
                            width: 56,
                            height: 56,
                            borderRadius: 12,
                            objectFit: "cover",
                            border: "1px solid var(--mi-line)",
                            flexShrink: 0,
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 56,
                            height: 56,
                            borderRadius: 12,
                            background: "#f0f4ff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Building2 size={20} style={{ color: "#2563eb" }} />
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: "var(--mi-ink)",
                            marginBottom: 3,
                          }}
                        >
                          {u.title}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 8,
                            alignItems: "center",
                          }}
                        >
                          {u.listingType && (
                            <span
                              style={{ fontSize: 11, color: "var(--mi-muted)" }}
                            >
                              {u.listingType}
                            </span>
                          )}
                          {u.bedrooms != null && (
                            <span
                              style={{ fontSize: 11, color: "var(--mi-muted)" }}
                            >
                              {u.bedrooms} bed
                            </span>
                          )}
                          {u.bathrooms != null && (
                            <span
                              style={{ fontSize: 11, color: "var(--mi-muted)" }}
                            >
                              {u.bathrooms} bath
                            </span>
                          )}
                          {locationText && (
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 3,
                                fontSize: 11,
                                color: "var(--mi-muted)",
                              }}
                            >
                              <MapPin size={10} /> {locationText}
                            </span>
                          )}
                          {u.grossArea && (
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 3,
                                fontSize: 11,
                                color: "var(--mi-muted)",
                              }}
                            >
                              <Ruler size={10} /> {u.grossArea} m²
                            </span>
                          )}
                          {u.price && (
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                fontSize: 11,
                                color: "var(--mi-muted)",
                              }}
                            >
                              <DollarSign size={10} /> KES{" "}
                              {u.price.toLocaleString()}/mo
                            </span>
                          )}
                          {Array.isArray(u.location?.landmarks) &&
                            u.location.landmarks.length > 0 && (
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 3,
                                  fontSize: 11,
                                  color: "var(--mi-muted)",
                                }}
                              >
                                <Landmark size={10} />{" "}
                                {u.location.landmarks.slice(0, 2).join(", ")}
                              </span>
                            )}
                          {Array.isArray(u.nearbyServices) &&
                            u.nearbyServices.length > 0 && (
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 3,
                                  fontSize: 11,
                                  color: "var(--mi-muted)",
                                }}
                              >
                                <Wifi size={10} />{" "}
                                {u.nearbyServices.slice(0, 2).join(", ")}
                              </span>
                            )}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          flexShrink: 0,
                        }}
                      >
                        {u.isListed && u.moveInApproval === "approved" && (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              padding: "3px 10px",
                              borderRadius: 20,
                              background: "#dcfce7",
                              color: "#15803d",
                            }}
                          >
                            Listed
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "3px 10px",
                            borderRadius: 20,
                            background: approval.bg,
                            color: approval.color,
                          }}
                        >
                          {approval.label}
                        </span>
                        <button
                          onClick={() => {
                            setPhotoId(photoId === u._id ? null : u._id);
                            setEditId(null);
                          }}
                          className="mi-icon-action"
                          style={{
                            background:
                              photoId === u._id
                                ? "var(--mi-brand-light)"
                                : "#fff",
                          }}
                          title="Photos"
                        >
                          <Image size={14} />{" "}
                          <span>
                            Photos
                            {u.images?.length ? ` (${u.images.length})` : ""}
                          </span>
                        </button>
                        <button
                          onClick={() => {
                            setEditId(u._id);
                            setShowCreate(false);
                            setPhotoId(null);
                          }}
                          className="mi-icon-action"
                          title="Edit"
                        >
                          <Edit2 size={14} /> <span>Edit</span>
                        </button>
                      </div>
                    </div>
                    {photoId === u._id && (
                      <ImagePanel unit={u} onUpdated={handleImagesUpdated} />
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default LandlordUnits;
