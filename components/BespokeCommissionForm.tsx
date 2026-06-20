"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import type { CustomerSummary } from "@/lib/customer-auth/types";

export default function BespokeCommissionForm() {
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerSummary | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        if (!response.ok) return;

        const data = (await response.json()) as { customer: CustomerSummary | null };
        if (!cancelled) {
          setCustomer(data.customer);
        }
      } finally {
        if (!cancelled) {
          setSessionLoaded(true);
        }
      }
    }

    loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const metal = formData.get("metal");

    try {
      const response = await fetch("/api/account/bespoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          cut: formData.get("cut"),
          carats: formData.get("carats"),
          metal: typeof metal === "string" ? metal : "",
          notes: formData.get("notes"),
        }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Your enquiry could not be submitted.");
        return;
      }

      router.push("/account#bespoke");
      router.refresh();
    } catch {
      setError("Your enquiry could not be submitted.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!sessionLoaded) {
    return (
      <div className="border border-neptura-ice/5 bg-neptura-neptune/20 p-8 text-center text-[0.78rem] font-light text-neptura-silver/60">
        Loading…
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-5 border border-neptura-ice/5 bg-neptura-neptune/20 p-8 text-center">
        <p className="text-[0.82rem] font-light leading-relaxed text-neptura-silver/70">
          Sign in to submit a bespoke commission. Your enquiries will be saved to your account.
        </p>
        <Link
          href="/login?returnTo=/bespoke"
          className="inline-block btn-dark-primary px-8 py-3 text-center"
        >
          Sign in to continue
        </Link>
      </div>
    );
  }

  const defaultName = [customer.firstName, customer.lastName].filter(Boolean).join(" ");

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 border border-neptura-ice/5 bg-neptura-neptune/20 p-8 md:p-10 backdrop-blur-sm select-none"
    >
      {error && (
        <p className="text-center text-[0.75rem] font-light leading-relaxed text-neptura-aurora">
          {error}
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-[0.62rem] uppercase tracking-[0.2em] text-neptura-aurora">
            Your Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            defaultValue={defaultName}
            className="w-full bg-neptura-void/50 border border-neptura-ice/20 px-4 py-3 text-xs text-neptura-crystal tracking-wide focus:border-neptura-aurora outline-none transition duration-300"
            placeholder="E.g., Devendra Singh"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-[0.62rem] uppercase tracking-[0.2em] text-neptura-aurora">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            defaultValue={customer.email ?? ""}
            className="w-full bg-neptura-void/50 border border-neptura-ice/20 px-4 py-3 text-xs text-neptura-crystal tracking-wide focus:border-neptura-aurora outline-none transition duration-300"
            placeholder="name@domain.in"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="cut" className="block text-[0.62rem] uppercase tracking-[0.2em] text-neptura-aurora">
            Desired Diamond Cut
          </label>
          <select
            id="cut"
            name="cut"
            defaultValue="emerald"
            className="w-full bg-neptura-void/90 border border-neptura-ice/20 px-4 py-3 text-xs text-neptura-crystal tracking-wide focus:border-neptura-aurora outline-none transition duration-300 appearance-none cursor-pointer"
          >
            <option value="emerald">Emerald Cut (Recommended)</option>
            <option value="round">Round Brilliant</option>
            <option value="oval">Oval Cut</option>
            <option value="cushion">Cushion Cut</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="carats" className="block text-[0.62rem] uppercase tracking-[0.2em] text-neptura-aurora">
            Desired Carat Weight
          </label>
          <select
            id="carats"
            name="carats"
            defaultValue="1-2"
            className="w-full bg-neptura-void/90 border border-neptura-ice/20 px-4 py-3 text-xs text-neptura-crystal tracking-wide focus:border-neptura-aurora outline-none transition duration-300 appearance-none cursor-pointer"
          >
            <option value="1-2">1.00 – 1.99 Carats</option>
            <option value="2-3">2.00 – 2.99 Carats</option>
            <option value="3+">3.00+ Carats</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <span className="block text-[0.62rem] uppercase tracking-[0.2em] text-neptura-aurora">
          Preferred Jewelry Material
        </span>
        <div className="grid grid-cols-3 gap-3">
          {["Gold", "White Gold", "Rose Gold"].map((metal, index) => (
            <label
              key={metal}
              className="flex items-center justify-center py-3 border border-neptura-ice/20 text-[0.7rem] uppercase tracking-wider text-neptura-crystal cursor-pointer transition hover:bg-neptura-neptune/30 hover:border-neptura-aurora/50 has-[:checked]:border-neptura-aurora has-[:checked]:text-neptura-aurora"
            >
              <input
                type="radio"
                name="metal"
                value={metal.toLowerCase()}
                defaultChecked={index === 0}
                className="sr-only"
              />
              <span>{metal}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className="block text-[0.62rem] uppercase tracking-[0.2em] text-neptura-aurora">
          Commission Details & Design Inspiration
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          className="w-full bg-neptura-void/50 border border-neptura-ice/20 px-4 py-3 text-xs text-neptura-crystal tracking-wide focus:border-neptura-aurora outline-none transition duration-300 resize-none"
          placeholder="Describe your vision, alignment, or ring size details..."
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-dark-primary text-center transition duration-300 hover:opacity-90 active:opacity-100 disabled:opacity-60"
        >
          {isSubmitting ? "Submitting…" : "Submit Commission request"}
        </button>
      </div>
    </form>
  );
}
