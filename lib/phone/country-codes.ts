export type PhoneCountry = {
  dialCode: string;
  label: string;
  iso: string;
};

/** Common markets for Neptura — India first as default. */
export const PHONE_COUNTRIES: PhoneCountry[] = [
  { iso: "IN", dialCode: "91", label: "India" },
  { iso: "US", dialCode: "1", label: "United States" },
  { iso: "GB", dialCode: "44", label: "United Kingdom" },
  { iso: "AE", dialCode: "971", label: "United Arab Emirates" },
  { iso: "SG", dialCode: "65", label: "Singapore" },
  { iso: "AU", dialCode: "61", label: "Australia" },
  { iso: "CA", dialCode: "1", label: "Canada" },
  { iso: "DE", dialCode: "49", label: "Germany" },
  { iso: "FR", dialCode: "33", label: "France" },
  { iso: "CH", dialCode: "41", label: "Switzerland" },
  { iso: "HK", dialCode: "852", label: "Hong Kong" },
  { iso: "JP", dialCode: "81", label: "Japan" },
  { iso: "KR", dialCode: "82", label: "South Korea" },
  { iso: "CN", dialCode: "86", label: "China" },
  { iso: "SA", dialCode: "966", label: "Saudi Arabia" },
  { iso: "QA", dialCode: "974", label: "Qatar" },
  { iso: "KW", dialCode: "965", label: "Kuwait" },
  { iso: "NZ", dialCode: "64", label: "New Zealand" },
  { iso: "IT", dialCode: "39", label: "Italy" },
  { iso: "ES", dialCode: "34", label: "Spain" },
  { iso: "NL", dialCode: "31", label: "Netherlands" },
  { iso: "BE", dialCode: "32", label: "Belgium" },
  { iso: "SE", dialCode: "46", label: "Sweden" },
  { iso: "NO", dialCode: "47", label: "Norway" },
  { iso: "DK", dialCode: "45", label: "Denmark" },
  { iso: "IE", dialCode: "353", label: "Ireland" },
  { iso: "TH", dialCode: "66", label: "Thailand" },
  { iso: "MY", dialCode: "60", label: "Malaysia" },
  { iso: "ZA", dialCode: "27", label: "South Africa" },
];

export const DEFAULT_PHONE_COUNTRY_CODE = "91";

export function getPhoneCountryByDialCode(dialCode: string): PhoneCountry | undefined {
  return PHONE_COUNTRIES.find((country) => country.dialCode === dialCode);
}
