/**
 * SAP system matrix.
 * Structure: zone → system → systemId
 *
 * Zone  System  ID
 * EURO  DEV     D5A
 * EURO  RTE     E7B
 * EURO  PPD     E8A
 * EURO  PROD    E9A
 * AMS   DEV     D5A
 * AMS   RTE     A7A
 * AMS   PPD     A8A
 * AMS   PROD    A9A
 * AOA   DEV     D5A
 * AOA   RTE     HD0
 * AOA   PPD     O8A
 * AOA   PROD    A9A
 * PLM   DEV     C5D
 * PLM   RTE     (none)
 * PLM   PPD     C4D
 * PLM   PROD    CBD
 */

export const ZONES = ["EURO", "AMS", "AOA", "PLM"];

/** Systems available per zone (in display order) */
export const SYSTEMS = ["DEV", "RTE", "PPD", "PROD"];

/**
 * Lookup: SAP_IDS[zone][system] → system ID string (or "" if not available)
 */
export const SAP_IDS = {
  EURO: { DEV: "D5A", RTE: "E7B", PPD: "E8A",  PROD: "E9A" },
  AMS:  { DEV: "D5A", RTE: "A7A", PPD: "A8A",  PROD: "A9A" },
  AOA:  { DEV: "D5A", RTE: "HD0", PPD: "O8A",  PROD: "A9A" },
  PLM:  { DEV: "C5D", RTE: "HB9", PPD: "C4D",   PROD: "CBD" },
};

// ─── Legacy shape kept for backward-compat (not used by new selector) ─────────
export const LANDSCAPES = [
  { key: "DEV",  systems: ["D5A", "C5D"] },
  { key: "RTE",  systems: ["E7B", "A7A", "HD0"] },
  { key: "PPD",  systems: ["E8A", "A8A", "O8A", "C4D"] },
  { key: "PROD", systems: ["E9A", "A9A", "CBD"] },
];
