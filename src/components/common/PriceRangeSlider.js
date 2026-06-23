import React from "react";

function PriceRangeSlider({ min, max, step, value, onChange }) {
  const minVal = value.min;
  const maxVal = value.max;

  return (
    <div style={{ padding: "8px 0" }}>
      {/* Current range labels */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontSize: "0.8rem",
            color: "var(--mi-brand)",
            fontWeight: 700,
          }}
        >
          KES {minVal.toLocaleString()}
        </span>
        <span
          style={{
            fontSize: "0.8rem",
            color: "var(--mi-brand)",
            fontWeight: 700,
          }}
        >
          KES {maxVal.toLocaleString()}
        </span>
      </div>
      {/* Manual inputs */}
      <div
        style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12 }}
      >
        <input
          type="number"
          className="auth-input"
          placeholder="Min"
          value={minVal === 0 ? "" : minVal}
          onChange={(e) => {
            const val = Math.min(Number(e.target.value) || 0, maxVal - step);
            onChange({ min: val, max: maxVal });
          }}
          style={{ height: 36, fontSize: "0.72rem", flex: 1, minWidth: 0 }}
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
          value={maxVal === max ? "" : maxVal}
          onChange={(e) => {
            const val = Math.max(Number(e.target.value) || max, minVal + step);
            onChange({ min: minVal, max: val });
          }}
          style={{ height: 36, fontSize: "0.72rem", flex: 1, minWidth: 0 }}
        />
      </div>

      {/* Slider track */}
      <div style={{ position: "relative", height: 20, overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            top: "50%",
            transform: "translateY(-50%)",
            left: 0,
            right: 0,
            height: 4,
            background: "var(--mi-line)",
            borderRadius: 4,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            transform: "translateY(-50%)",
            left: `${((minVal - min) / (max - min)) * 100}%`,
            right: `${100 - ((maxVal - min) / (max - min)) * 100}%`,
            height: 4,
            background: "var(--mi-brand)",
            borderRadius: 4,
          }}
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minVal}
          onChange={(e) => {
            const val = Math.min(Number(e.target.value), maxVal - step);
            onChange({ min: val, max: maxVal });
          }}
          style={{
            position: "absolute",
            width: "100%",
            pointerEvents: "none",
            appearance: "none",
            background: "transparent",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: minVal > max - 100 ? 5 : 3,
          }}
          className="price-range-input"
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxVal}
          onChange={(e) => {
            const val = Math.max(Number(e.target.value), minVal + step);
            onChange({ min: minVal, max: val });
          }}
          style={{
            position: "absolute",
            width: "100%",
            pointerEvents: "none",
            appearance: "none",
            background: "transparent",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 4,
          }}
          className="price-range-input"
        />
      </div>

      {/* Min/Max hints */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 6,
        }}
      >
        <span style={{ fontSize: "0.72rem", color: "var(--mi-muted)" }}>
          KES 0
        </span>
        <span style={{ fontSize: "0.72rem", color: "var(--mi-muted)" }}>
          KES 500,000
        </span>
      </div>
    </div>
  );
}

export default PriceRangeSlider;
