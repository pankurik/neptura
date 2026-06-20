import { redirect } from "next/navigation";
import AccountDashboardLayout from "@/components/account/AccountDashboardLayout";
import { isProfileComplete } from "@/lib/customer-auth/customer";
import { fetchCustomerOrders } from "@/lib/customer-auth/orders";
import { sanitizeReturnTo } from "@/lib/customer-auth/return-to";
import { readCustomerAccessToken } from "@/lib/customer-auth/session";
import { getCustomerSession } from "@/lib/customer-auth/require-session";
import { getProductsByHandles } from "@/lib/queries";
import { WISHLIST_PREVIEW_LIMIT } from "@/components/account/AccountWishlistGrid";

export const metadata = {
  title: "Your account | Neptura",
  description: "Manage your Neptura account.",
};

type AccountPageProps = {
  searchParams: { returnTo?: string };
};

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const customer = await getCustomerSession();

  if (!customer) {
    redirect("/api/auth/logout?returnTo=/login&error=session_expired");
  }

  const accessToken = readCustomerAccessToken();
  const orders = accessToken ? await fetchCustomerOrders(accessToken) : [];

  const profileComplete = isProfileComplete(customer);
  const pendingReturnTo = sanitizeReturnTo(searchParams.returnTo);
  const profileRedirectTo =
    !profileComplete && pendingReturnTo !== "/" ? pendingReturnTo : undefined;

  const wishlistProducts = customer.wishlistHandles.length
    ? await getProductsByHandles(
        customer.wishlistHandles.slice(0, WISHLIST_PREVIEW_LIMIT)
      )
    : [];

  return (
    <AccountDashboardLayout
      customer={customer}
      orders={orders}
      profileComplete={profileComplete}
      profileRedirectTo={profileRedirectTo}
      wishlistProducts={wishlistProducts}
    />
  );
}
