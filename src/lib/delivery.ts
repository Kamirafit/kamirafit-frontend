export type DeliveryZoneType = "KOLKATA" | "WEST_BENGAL" | "REST_OF_INDIA" | "INTERNATIONAL";

export interface DeliveryCalculationResult {
  zone: DeliveryZoneType;
  rate: number;
  currency: string;
  isDomestic: boolean;
  courierName: string;
  estimatedDays: number;
  zoneLabel: string;
}

/**
 * Checks if a destination country corresponds to India
 */
export function isIndiaDestination(country?: string): boolean {
  if (!country) return true;
  const c = country.trim().toLowerCase();
  return c === "india" || c === "in" || c === "bharat";
}

/**
 * Determines whether a 6-digit Indian PIN code belongs to Kolkata (starts with 700)
 */
export function isKolkataPincode(cleanPin: string): boolean {
  return /^\d{6}$/.test(cleanPin) && cleanPin.startsWith("700");
}

/**
 * Determines whether a 6-digit Indian PIN code belongs to West Bengal (outside Kolkata)
 * West Bengal PIN codes start with 70, 71, 72, 73, 74 up to 743xxx.
 * Excludes 700xxx (Kolkata), 737xxx (Sikkim), and 744xxx (Andaman & Nicobar Islands).
 */
export function isWestBengalPincode(cleanPin: string): boolean {
  if (!/^\d{6}$/.test(cleanPin)) return false;
  if (cleanPin.startsWith("700")) return false; // Kolkata
  if (cleanPin.startsWith("737")) return false; // Sikkim
  if (cleanPin.startsWith("744")) return false; // Andaman & Nicobar

  const prefix2 = cleanPin.substring(0, 2);
  const pinNum = parseInt(cleanPin, 10);

  if (["70", "71", "72", "73", "74"].includes(prefix2)) {
    return pinNum <= 743999;
  }

  return false;
}

/**
 * Client-side delivery charge & zone calculation
 */
export function calculateDeliveryCharge(
  postalCode?: string,
  country?: string
): DeliveryCalculationResult {
  const isDomestic = isIndiaDestination(country);

  // 1. Outside India (Worldwide / International)
  if (!isDomestic) {
    return {
      zone: "INTERNATIONAL",
      rate: 1499,
      currency: "INR",
      isDomestic: false,
      courierName: "DHL Express / Aramex Worldwide",
      estimatedDays: 6,
      zoneLabel: "International Express",
    };
  }

  const cleanPin = (postalCode || "").trim().replace(/\D/g, "");

  // 2. Kolkata
  if (isKolkataPincode(cleanPin)) {
    return {
      zone: "KOLKATA",
      rate: 99,
      currency: "INR",
      isDomestic: true,
      courierName: "Shadowfax Local / Kolkata Express",
      estimatedDays: 2,
      zoneLabel: "Kolkata Express",
    };
  }

  // 3. West Bengal (Outside Kolkata)
  if (isWestBengalPincode(cleanPin)) {
    return {
      zone: "WEST_BENGAL",
      rate: 199,
      currency: "INR",
      isDomestic: true,
      courierName: "Shadowfax Surface / WB Express",
      estimatedDays: 3,
      zoneLabel: "West Bengal Express",
    };
  }

  // 4. Rest of India (Domestic Inter-state)
  return {
    zone: "REST_OF_INDIA",
    rate: 299,
    currency: "INR",
    isDomestic: true,
    courierName: "Shadowfax / Delhivery Surface",
    estimatedDays: 5,
    zoneLabel: "Domestic Express",
  };
}
