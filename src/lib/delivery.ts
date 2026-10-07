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

  // 1. Outside India (Worldwide / International - Flat 2499, delivery outside India can NEVER be free)
  if (!isDomestic) {
    return {
      zone: "INTERNATIONAL",
      rate: 2499,
      currency: "INR",
      isDomestic: false,
      courierName: "DHL Express / Aramex Worldwide",
      estimatedDays: 6,
      zoneLabel: "Worldwide International Express",
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

/**
 * Computes estimated delivery arrival range by adding:
 * 1) 24–48 hours (1–2 business days) for fulfillment & packaging, barring Sat/Sun & holidays.
 * 2) Estimated carrier transit days to the destination location.
 */
export function calculateDeliveryDateRange(transitDays: number): {
  minDateFormatted: string;
  maxDateFormatted: string;
  fullDateRange: string;
  processingDays: string;
} {
  const addBusinessDays = (startDate: Date, daysToAdd: number): Date => {
    const current = new Date(startDate);
    let added = 0;
    while (added < daysToAdd) {
      current.setDate(current.getDate() + 1);
      const day = current.getDay();
      // Skip Saturday (6) and Sunday (0)
      if (day !== 0 && day !== 6) {
        added++;
      }
    }
    return current;
  };

  const now = new Date();
  const minDeliveryDate = addBusinessDays(now, 1 + transitDays);
  const maxDeliveryDate = addBusinessDays(now, 2 + transitDays);

  const formatShort = (d: Date) =>
    d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });

  return {
    minDateFormatted: formatShort(minDeliveryDate),
    maxDateFormatted: formatShort(maxDeliveryDate),
    fullDateRange: `${formatShort(minDeliveryDate)} – ${formatShort(maxDeliveryDate)}`,
    processingDays: "1–2 business days (24–48 hrs)",
  };
}

/**
 * Validates postal code format based on selected destination country.
 * Returns { isValid: true } or { isValid: false, error: string }.
 */
export function validatePostalCode(
  postalCode: string,
  country = "India"
): { isValid: boolean; error?: string } {
  const code = (postalCode || "").trim();
  if (!code) {
    return { isValid: false, error: "Please enter a postal or PIN code." };
  }

  const c = country.trim().toLowerCase();

  // 1. India (Strictly 6 numeric digits, starting 1-9)
  if (c === "india" || c === "in" || c === "bharat") {
    if (!/^[1-9]\d{5}$/.test(code)) {
      return {
        isValid: false,
        error: "Please enter a valid 6-digit Indian PIN code (e.g. 560038).",
      };
    }
    return { isValid: true };
  }

  // 2. United States (5 numeric digits, optionally with +4 suffix)
  if (c === "united states" || c === "us" || c === "usa") {
    if (!/^\d{5}(-\d{4})?$/.test(code)) {
      return {
        isValid: false,
        error: "Please enter a valid 5-digit US ZIP code (e.g. 90210).",
      };
    }
    return { isValid: true };
  }

  // 3. United Kingdom (UK alphanumeric postcode, e.g. SW1A 1AA, EC1A 1BB, W1A 0AX)
  if (c === "united kingdom" || c === "gb" || c === "uk") {
    if (!/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(code)) {
      return {
        isValid: false,
        error: "Please enter a valid UK postcode (e.g. SW1A 1AA).",
      };
    }
    return { isValid: true };
  }

  // 4. Canada (A1A 1A1 format)
  if (c === "canada" || c === "ca") {
    if (!/^[A-CEGHJ-NPR-TV-Z]\d[A-CEGHJ-NPR-TV-Z]\s*\d[A-CEGHJ-NPR-TV-Z]\d$/i.test(code)) {
      return {
        isValid: false,
        error: "Please enter a valid Canadian postal code (e.g. M5V 2T6).",
      };
    }
    return { isValid: true };
  }

  // 5. Australia (4 digits)
  if (c === "australia" || c === "au") {
    if (!/^\d{4}$/.test(code)) {
      return {
        isValid: false,
        error: "Please enter a valid 4-digit Australian postcode (e.g. 2000).",
      };
    }
    return { isValid: true };
  }

  // 6. Germany (5 digits)
  if (c === "germany" || c === "de") {
    if (!/^\d{5}$/.test(code)) {
      return {
        isValid: false,
        error: "Please enter a valid 5-digit German postal code (e.g. 10115).",
      };
    }
    return { isValid: true };
  }

  // 7. France (5 digits)
  if (c === "france" || c === "fr") {
    if (!/^\d{5}$/.test(code)) {
      return {
        isValid: false,
        error: "Please enter a valid 5-digit French postal code (e.g. 75001).",
      };
    }
    return { isValid: true };
  }

  // 8. Singapore (6 digits)
  if (c === "singapore" || c === "sg") {
    if (!/^\d{6}$/.test(code)) {
      return {
        isValid: false,
        error: "Please enter a valid 6-digit Singapore postal code (e.g. 018956).",
      };
    }
    return { isValid: true };
  }

  // 9. United Arab Emirates (3 to 6 digits, 00000, or N/A)
  if (c === "united arab emirates" || c === "ae" || c === "uae") {
    if (!/^(\d{3,6}|00000|N\/?A)$/i.test(code)) {
      return {
        isValid: false,
        error: "Please enter a valid UAE postal code or P.O. Box (e.g. 00000).",
      };
    }
    return { isValid: true };
  }

  // 10. Other Country (General 3-10 characters alphanumeric)
  if (!/^[A-Z0-9\s-]{3,10}$/i.test(code)) {
    return {
      isValid: false,
      error: "Please enter a valid postal or ZIP code.",
    };
  }

  return { isValid: true };
}

