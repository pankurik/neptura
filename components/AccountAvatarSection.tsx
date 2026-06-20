"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import CustomerAvatar from "@/components/CustomerAvatar";
import { ALLOWED_AVATAR_MIME_TYPES, getCustomerAvatarUrl } from "@/lib/customer-auth/avatar";
import type { CustomerSummary } from "@/lib/customer-auth/types";

type AccountAvatarSectionProps = {
  customer: CustomerSummary;
  embedded?: boolean;
};

export default function AccountAvatarSection({
  customer,
  embedded = false,
}: AccountAvatarSectionProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const avatarUrl = getCustomerAvatarUrl(customer);
  const hasCustomAvatar = Boolean(customer.avatarUrl);
  const wrapperClass = embedded
    ? "border border-neptura-light bg-neptura-light-bg p-6 sm:p-8"
    : "mt-10 border border-neptura-light bg-neptura-light-bg p-6 sm:p-8";

  async function handleUpload(file: File) {
    setError(null);
    setSuccess(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/account/avatar", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Photo could not be uploaded.");
        return;
      }

      setSuccess("Profile photo updated.");
      router.refresh();
    } catch {
      setError("Photo could not be uploaded.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  async function handleRemove() {
    setError(null);
    setSuccess(null);
    setIsRemoving(true);

    try {
      const response = await fetch("/api/account/avatar", {
        method: "DELETE",
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Photo could not be removed.");
        return;
      }

      setSuccess("Profile photo removed.");
      router.refresh();
    } catch {
      setError("Photo could not be removed.");
    } finally {
      setIsRemoving(false);
    }
  }

  const isBusy = isUploading || isRemoving;

  return (
    <div className={wrapperClass}>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <CustomerAvatar customer={customer} size="lg" shape="circle" />
          <div>
            <p className="text-[0.68rem] font-normal uppercase tracking-[0.16em] text-neptura-aurora">
              Profile photo
            </p>
            <p className="mt-2 max-w-sm text-[0.8rem] font-light leading-relaxed text-neptura-light-muted">
              Optional — shown in navigation only. JPG, PNG, or WebP · up to 5 MB.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED_AVATAR_MIME_TYPES.join(",")}
            className="sr-only"
            disabled={isBusy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void handleUpload(file);
              }
            }}
          />
          <button
            type="button"
            disabled={isBusy}
            onClick={() => inputRef.current?.click()}
            className="btn-light-secondary disabled:opacity-60"
          >
            {isUploading ? "Uploading…" : avatarUrl ? "Change photo" : "Upload photo"}
          </button>
          {hasCustomAvatar && (
            <button
              type="button"
              disabled={isBusy}
              onClick={() => void handleRemove()}
              className="text-[0.68rem] font-light uppercase tracking-[0.14em] text-neptura-light-muted transition-colors hover:text-neptura-aurora disabled:opacity-60"
            >
              {isRemoving ? "Removing…" : "Remove"}
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-4 text-[0.75rem] leading-relaxed text-neptura-aurora">{error}</p>
      )}
      {success && (
        <p className="mt-4 text-[0.75rem] leading-relaxed text-neptura-light-muted">{success}</p>
      )}
    </div>
  );
}
