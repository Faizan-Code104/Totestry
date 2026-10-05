// =====================================================================
// TOTESTRY — STORE INFO (single source of truth)
// ---------------------------------------------------------------------
// Brand name, email, phone, address and support hours live ONLY here.
// Every page imports from this file, so a detail is changed in one place
// and the whole website updates.
//
// To change a detail: edit the value below, save, and redeploy.
// No .env / hosting environment variables are needed.
// Anything left empty ("") is simply hidden on the site.
// =====================================================================

const storeInfo = {
  // ---------- Brand ----------
  businessName: "Totestry",
  legalName: "Totestry", // e.g. "Totestry LLC"
  domain: "totestry.com",
  website: "https://www.totestry.com",
  tagline: "Carry your own story",
  description:
    "Handbags designed with everyday use, practical details, and contemporary style in mind.",

  // ---------- Contact — FILL THESE IN ----------
  email: "", // e.g. "info@totestry.com"
  phoneDisplay: "", // shown on the site, e.g. "+1 (000) 000-0000"
  phoneHref: "", // used for the call link, digits only, e.g. "+10000000000"

  addressLine1: "", // street
  addressLine2: "", // city, state ZIP
  country: "United States",

  // ---------- Support hours ----------
  businessDays: "Monday – Friday",
  supportHours: "9:00 AM – 5:00 PM",
  timeZone: "Central Time (CT)",

  // ---------- Browser storage keys (cart / login) ----------
  storageKeys: {
    cart: "totestry-cart",
    token: "totestry-token",
    user: "totestry-user",
  },
};

// "Street, City ST ZIP, Country" on one line
export const getFullAddress = () =>
  [storeInfo.addressLine1, storeInfo.addressLine2, storeInfo.country]
    .filter(Boolean)
    .join(", ");

// Same address as separate lines (for footers and contact cards)
export const getAddressLines = () =>
  [storeInfo.addressLine1, storeInfo.addressLine2, storeInfo.country].filter(
    Boolean
  );

// "Monday – Friday, 9:00 AM – 5:00 PM Central Time (CT)"
export const getSupportHours = () => {
  const hours = [storeInfo.supportHours, storeInfo.timeZone]
    .filter(Boolean)
    .join(" ");

  return [storeInfo.businessDays, hours].filter(Boolean).join(", ");
};

// Ready-made links; empty string when the detail is not set
export const getEmailLink = () =>
  storeInfo.email ? `mailto:${storeInfo.email}` : "";

// Uses phoneHref, or builds it from phoneDisplay if phoneHref is empty
export const getPhoneLink = () => {
  const number =
    storeInfo.phoneHref || storeInfo.phoneDisplay.replace(/[^\d+]/g, "");

  return number ? `tel:${number}` : "";
};

export const BUSINESS_INFO = storeInfo;
export default storeInfo;