export const JEWELRY_METAL_OPTIONS = [
  { id: "white-gold", label: "White gold" },
  { id: "yellow-gold", label: "Yellow gold" },
  { id: "rose-gold", label: "Rose gold" },
  { id: "platinum", label: "Platinum" },
] as const;

export const JEWELRY_STONE_OPTIONS = [
  { id: "lab-grown", label: "Lab-grown diamond" },
  { id: "natural-diamond", label: "Natural diamond" },
  { id: "colored-gemstones", label: "Colored gemstones" },
  { id: "moissanite", label: "Moissanite" },
] as const;

export const JEWELRY_PREFERENCE_OPTIONS = [
  ...JEWELRY_METAL_OPTIONS,
  ...JEWELRY_STONE_OPTIONS,
] as const;

export type JewelryPreferenceId = (typeof JEWELRY_PREFERENCE_OPTIONS)[number]["id"];

const VALID_PREFERENCE_IDS = new Set<string>(
  JEWELRY_PREFERENCE_OPTIONS.map((option) => option.id)
);

export function sanitizeJewelryPreferences(values: string[]): JewelryPreferenceId[] {
  return values.filter((value): value is JewelryPreferenceId => VALID_PREFERENCE_IDS.has(value));
}
