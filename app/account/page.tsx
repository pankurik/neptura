import { redirect } from "next/navigation";
import AccountDashboardLayout from "@/components/account/AccountDashboardLayout";
import { isProfileComplete } from "@/lib/customer-auth/customer";
import { fetchCustomerOrders } from "@/lib/customer-auth/orders";
import { readCustomerAccessToken } from "@/lib/customer-auth/session";
import { getCustomerSession } from "@/lib/customer-auth/require-session";
import { getProductsByHandles } from "@/lib/queries";

export const metadata = {
  title: "Your account | Neptura",
  description: "Manage your Neptura account.",
};

export default async function AccountPage() {
  const customer = await getCustomerSession();

  if (!customer) {
    redirect("/api/auth/logout?returnTo=/login&error=session_expired");
  }

  const accessToken = readCustomerAccessToken();
  const orders = accessToken ? await fetchCustomerOrders(accessToken) : [];

  const profileComplete = isProfileComplete(customer);
  const wishlistProducts = customer.wishlistHandles.length
    ? await getProductsByHandles(customer.wishlistHandles)
    : [];

  return (
    <AccountDashboardLayout
      customer={customer}
      orders={orders}
      profileComplete={profileComplete}
      wishlistProducts={wishlistProducts}
    />
  );
}
