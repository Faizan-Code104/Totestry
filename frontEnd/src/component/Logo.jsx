import React from "react";

import storeInfo from "../storeInfo";

const SIZES = {
  sm: { brand: "text-[15px]", mark: "text-xl", tagline: "text-[9px]" },
  md: { brand: "text-[19px]", mark: "text-2xl", tagline: "text-[10px]" },
  lg: { brand: "text-2xl", mark: "text-3xl", tagline: "text-xs" },
  xl: { brand: "text-3xl", mark: "text-4xl", tagline: "text-sm" },
};

/**
 * Totestry text logo. The name and tagline come from storeInfo.js.
 * tone="light" is for dark backgrounds.
 */
const Logo = ({
  size = "md",
  showTagline = false,
  tone = "dark",
  className = "",
}) => {
  const current = SIZES[size] || SIZES.md;
  const light = tone === "light";

  return (
    <span
      className={`group/logo inline-flex max-w-full select-none flex-col leading-none ${className}`}
      aria-label={
        showTagline
          ? `${storeInfo.businessName} — ${storeInfo.tagline}`
          : storeInfo.businessName
      }
    >
      <span
        className={`inline-flex items-center gap-1.5 whitespace-nowrap font-sans font-bold tracking-[0.13em] ${
          current.brand
        } ${light ? "text-white" : "text-ink"}`}
      >
        <span
          aria-hidden="true"
          className={`${current.mark} leading-none tracking-normal transition-transform duration-700 group-hover/logo:rotate-[60deg] ${
            light ? "text-lilac" : "text-mauve"
          }`}
        >
          ✳
        </span>
        {storeInfo.businessName.toUpperCase()}
        <span aria-hidden="true" className="-ml-1.5 text-blush">
          .
        </span>
      </span>

      {showTagline && (
        <span
          className={`mt-2 whitespace-nowrap font-semibold uppercase tracking-[0.2em] ${
            current.tagline
          } ${light ? "text-white/60" : "text-ink/50"}`}
        >
          {storeInfo.tagline}
        </span>
      )}
    </span>
  );
};

export default Logo;