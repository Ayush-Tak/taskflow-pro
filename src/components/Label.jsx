import React from 'react'

const Label = ({ label, showRemove = false, onRemove, size = "default" }) => {
  if (!label) {
    return <span style={{background: "red", color: "white", padding: "4px"}}>NO LABEL</span>;
  }

  const { color, text, name } = label;
  const displayText = text || name || "Unnamed Label";

  // Enhanced color mapping with more colors - fallbacks only
  const colorMap = {
    red: "#ef4444",
    green: "#22c55e",
    blue: "#3b82f6",
    yellow: "#f59e0b",
    purple: "#8b5cf6",
    pink: "#ec4899",
    orange: "#f97316",
    gray: "#6b7280",
    teal: "#14b8a6",
    indigo: "#6366f1",
    lime: "#84cc16",
    cyan: "#06b6d4"
  };

  // Use CSS variables with fallback to colorMap
  const backgroundColor = `var(--label-${color}, ${colorMap[color] || "#6b7280"})`;

  // Improved text color logic - better contrast for light colors
  const isLightColor = ["yellow", "lime", "cyan", "pink", "orange"].includes(color);
  const textColor = isLightColor ? "#000000" : "#ffffff";

  // Dynamic remove button background based on text color
  const removeButtonBg = isLightColor ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.2)";
  const removeButtonHoverBg = isLightColor ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.35)";

  const sizeStyles = {
    sm: { padding: "2px 6px", fontSize: "10px" },
    default: { padding: "4px 8px", fontSize: "11px" },
    lg: { padding: "6px 10px", fontSize: "12px" }
  };

  const currentSize = sizeStyles[size] || sizeStyles.default;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        backgroundColor: backgroundColor,
        color: textColor,
        padding: currentSize.padding,
        borderRadius: "12px",
        fontSize: currentSize.fontSize,
        fontWeight: "500",
        margin: "2px",
        gap: "4px"
      }}
    >
      <span>{displayText}</span>
      {showRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          style={{
            background: removeButtonBg,
            border: "none",
            borderRadius: "50%",
            width: "16px",
            height: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: textColor,
            cursor: "pointer",
            fontSize: "12px",
            lineHeight: "1",
            transition: "background-color 0.2s ease"
          }}
          onMouseOver={(e) => e.target.style.background = removeButtonHoverBg}
          onMouseOut={(e) => e.target.style.background = removeButtonBg}
          title="Remove label"
        >
          ×
        </button>
      )}
    </span>
  );
};

export default Label;