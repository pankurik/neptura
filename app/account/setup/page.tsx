import { redirect } from "next/navigation";
import { sanitizeReturnTo } from "@/lib/customer-auth/return-to";
import { getCustomerSession } from "@/lib/customer-auth/require-session";

/** @deprecated New accounts go straight to /account — kept for old links */
export default async function AccountSetupPage({
  searchParams,
}: {
  searchParams: { returnTo?: string };
}) {
  const customer = await getCustomerSession();
  const returnTo = sanitizeReturnTo(searchParams.returnTo);

  if (!customer) {
    redirect("/login?returnTo=%2Faccount");
  }

  const params = new URLSearchParams();
  if (returnTo !== "/" && returnTo !== "/account/setup") {
    params.set("returnTo", returnTo);
  }

  const query = params.toString();
  redirect(query ? `/account?${query}` : "/account");
}
