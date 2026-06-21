"use client";

import { accountFieldClassName } from "@/lib/account-form-styles";
import { PHONE_COUNTRIES } from "@/lib/phone/country-codes";
import { cn } from "@/lib/utils";

type PhoneCountryInputProps = {
  id: string;
  countryCode: string;
  nationalNumber: string;
  onCountryCodeChange: (countryCode: string) => void;
  onNationalNumberChange: (nationalNumber: string) => void;
  required?: boolean;
  placeholder?: string;
};

export default function PhoneCountryInput({
  id,
  countryCode,
  nationalNumber,
  onCountryCodeChange,
  onNationalNumberChange,
  required = false,
  placeholder = "Phone number",
}: PhoneCountryInputProps) {
  return (
    <div className="flex">
      <select
        id={`${id}-country`}
        aria-label="Country code"
        value={countryCode}
        onChange={(event) => onCountryCodeChange(event.target.value)}
        className={cn(
          accountFieldClassName,
          "w-[7.5rem] shrink-0 border-r-0 pr-2 text-[0.78rem]",
        )}
      >
        {PHONE_COUNTRIES.map((country) => (
          <option key={`${country.iso}-${country.dialCode}`} value={country.dialCode}>
            +{country.dialCode} {country.iso}
          </option>
        ))}
      </select>
      <input
        id={id}
        required={required}
        value={nationalNumber}
        onChange={(event) => onNationalNumberChange(event.target.value)}
        autoComplete="tel-national"
        inputMode="tel"
        placeholder={placeholder}
        className={cn(accountFieldClassName, "min-w-0 flex-1 border-l-0")}
      />
    </div>
  );
}
