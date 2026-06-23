import React, { useState } from "react";

const pillInp = {
  width: "100%",
  padding: "10px 16px",
  border: "1.5px solid var(--mi-line)",
  borderRadius: 16,
  fontSize: 13,
  outline: "none",
  color: "var(--mi-ink)",
  background: "#fff",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
  fontFamily: "inherit",
  resize: "vertical",
  minHeight: 80,
};

const labelStyle = {
  display: "block",
  fontSize: 11,
  fontWeight: 600,
  color: "var(--mi-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

function AIDescriptionField({
  value,
  onChange,
  context = {},
  label = "Description",
  placeholder = "Describe the unit, or click Generate with AI above…",
  systemPrompt,
}) {
  const [generating, setGenerating] = useState(false);

  const buildContext = () =>
    Object.entries(context)
      .filter(([, v]) => v !== "" && v != null)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: REACT_APP_GROQ_API_KEY,
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            max_tokens: 1000,
            messages: [
              {
                role: "system",
                content:
                  systemPrompt ||
                  "You are a professional digital rental agent writing property descriptions for a Kenyan real estate platform. Your job is to compel prospective tenants to take action. Write in clear, confident prose. No bullet points, no numbered lists, no em dashes, no filler phrases. Every sentence must earn its place. Focus on what makes the unit genuinely attractive: location, space, light, amenities, and lifestyle. Make the reader picture themselves living there.",
              },
              {
                role: "user",
                content: `Write a compelling rental listing description for this property using all the details below:\n\n${buildContext()}\n\nUse every relevant detail provided. Do not invent anything that is not listed.`,
              },
            ],
          }),
        },
      );

      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content || "";
      if (text) onChange(text);
    } catch (err) {
      console.error("AI description generation failed:", err);
    }
    setGenerating(false);
  };

  const focusStyle = (e) => (e.target.style.borderColor = "var(--mi-brand)");
  const blurStyle = (e) => (e.target.style.borderColor = "var(--mi-line)");

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <label style={labelStyle}>{label}</label>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "4px 12px",
            borderRadius: 999,
            border: "1.5px solid var(--mi-line)",
            background: generating ? "var(--mi-line)" : "#fff",
            color: generating ? "var(--mi-muted)" : "var(--mi-brand)",
            fontSize: 11,
            fontWeight: 600,
            cursor: generating ? "not-allowed" : "pointer",
            letterSpacing: "0.03em",
            fontFamily: "inherit",
            transition: "all 0.15s",
          }}
        >
          {generating ? (
            <>
              <span
                style={{
                  width: 10,
                  height: 10,
                  border: "2px solid var(--mi-muted)",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "spin 0.7s linear infinite",
                }}
              />
              Generating…
            </>
          ) : (
            <>✦ Generate with AI</>
          )}
        </button>
      </div>
      <textarea
        style={pillInp}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={focusStyle}
        onBlur={blurStyle}
      />
    </div>
  );
}

export default AIDescriptionField;
