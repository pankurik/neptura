#!/usr/bin/env node
/**
 * Verifies Customer Account API discovery + env vars.
 * Run: node scripts/verify-customer-auth-setup.mjs
 * Loads .env.local via Node --env-file if available, else manual parse.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;

  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvLocal();

const storeDomain = process.env.SHOPIFY_STORE_DOMAIN?.replace(/^https?:\/\//, "").replace(
  /\/$/,
  ""
);

function ok(msg) {
  console.log(`  ✓ ${msg}`);
}

function warn(msg) {
  console.log(`  ⚠ ${msg}`);
}

function fail(msg) {
  console.log(`  ✗ ${msg}`);
}

async function main() {
  console.log("\nNeptura — Customer Account API setup check\n");

  if (!storeDomain) {
    fail("SHOPIFY_STORE_DOMAIN is not set in .env.local");
    process.exit(1);
  }
  ok(`Store domain: ${storeDomain}`);

  let openId;
  try {
    const res = await fetch(
      `https://${storeDomain}/.well-known/openid-configuration`,
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    openId = await res.json();
    ok("Customer accounts enabled (OpenID discovery OK)");
    ok(`Authorization: ${openId.authorization_endpoint}`);
  } catch (e) {
    fail(`OpenID discovery failed — enable customer accounts in Shopify Admin → Settings → Customer accounts`);
    console.error(`    ${e.message}`);
    process.exit(1);
  }

  let customerApi;
  try {
    const res = await fetch(
      `https://${storeDomain}/.well-known/customer-account-api`,
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    customerApi = await res.json();
    ok(`GraphQL API: ${customerApi.graphql_api}`);
  } catch (e) {
    fail(`Customer Account API discovery failed: ${e.message}`);
    process.exit(1);
  }

  const discoveredShopId =
    customerApi.graphql_api.match(/shopify\.com\/(\d+)\/account\//)?.[1] ?? null;

  if (discoveredShopId) {
    ok(`Discovered shop ID: ${discoveredShopId}`);
    const envShopId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_SHOP_ID?.trim();
    if (!envShopId) {
      warn(`Add to .env.local: SHOPIFY_CUSTOMER_ACCOUNT_SHOP_ID=${discoveredShopId}`);
    } else if (envShopId !== discoveredShopId) {
      warn(`SHOPIFY_CUSTOMER_ACCOUNT_SHOP_ID (${envShopId}) does not match discovered (${discoveredShopId})`);
    } else {
      ok("SHOPIFY_CUSTOMER_ACCOUNT_SHOP_ID matches discovery");
    }
  }

  const clientId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID?.trim();
  const clientSecret = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET?.trim();

  if (clientId && clientSecret) {
    ok("Customer Account API OAuth credentials present");
  } else {
    warn("Missing SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID / SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET");
    console.log("\n  Next step in Shopify Admin:");
    console.log("  1. Sales channels → Headless → your storefront");
    console.log("  2. Customer Account API settings → Confidential client");
    console.log("  3. Callback URL: https://<your-ngrok-host>/api/auth/callback");
    console.log("  4. Copy Client ID + Client secret into .env.local\n");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (!appUrl) {
    warn("Missing NEXT_PUBLIC_APP_URL (e.g. https://abc123.ngrok-free.app for local dev)");
  } else if (appUrl.startsWith("http://") || appUrl.includes("localhost")) {
    warn(
      `NEXT_PUBLIC_APP_URL is ${appUrl} — Shopify requires HTTPS callbacks. Use ngrok for local dev.`
    );
  } else {
    ok(`App URL: ${appUrl}`);
    ok(`Callback URL to register: ${appUrl}/api/auth/callback`);
    ok(`Logout URI to register: ${appUrl}/login`);
  }

  console.log("\nStorefront scopes (catalog/cart):");
  console.log("  unauthenticated_write_checkouts, unauthenticated_read_product_inventory,");
  console.log("  unauthenticated_read_product_listings");

  const storefrontClientId = process.env.SHOPIFY_CLIENT_ID?.trim();
  const storefrontClientSecret = process.env.SHOPIFY_CLIENT_SECRET?.trim();

  if (storefrontClientId && storefrontClientSecret && storeDomain.endsWith(".myshopify.com")) {
    try {
      const res = await fetch(`https://${storeDomain}/admin/oauth/access_token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: storefrontClientId,
          client_secret: storefrontClientSecret,
        }),
      });
      const json = await res.json();
      const scopes = json.scope?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];

      if (scopes.includes("write_customers")) {
        ok("Admin API write_customers scope present (contact phone updates)");
      } else {
        warn("Missing Admin API write_customers scope — contact phone needs a saved address as fallback");
        console.log("  Fix: Dev Dashboard → your app → Versions → Access → add read_customers + write_customers");
        console.log("       → Release → reinstall app on store → restart dev server\n");
      }
    } catch {
      warn("Could not verify Admin API scopes for phone updates");
    }
  } else {
    warn("Set SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET to verify Admin API scopes for phone");
  }

  console.log("");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
