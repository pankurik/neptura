import { notFound, redirect } from "next/navigation";
import AccountOrderDetailPanel from "@/components/account/AccountOrderDetailPanel";
import AccountOrderProgressTracker from "@/components/account/AccountOrderProgressTracker";
import AccountSubpageHero from "@/components/account/AccountSubpageHero";
import AccountSubpageNav from "@/components/account/AccountSubpageNav";
import SiteFooter from "@/components/SiteFooter";
import {
  fetchCustomerOrder,
  formatOrderHeroSubtitle,
  formatOrderStatusBadge,
} from "@/lib/customer-auth/orders";
import { readCustomerAccessToken } from "@/lib/customer-auth/session";

type OrderPageProps = {
  params: { orderId: string };
};

export async function generateMetadata({ params }: OrderPageProps) {
  return {
    title: `Order ${params.orderId} | Neptura`,
    description: "View your Neptura order details and tracking.",
  };
}

export default async function AccountOrderPage({ params }: OrderPageProps) {
  const accessToken = readCustomerAccessToken();

  if (!accessToken) {
    redirect(`/login?returnTo=/account/orders/${params.orderId}`);
  }

  const order = await fetchCustomerOrder(accessToken, params.orderId);

  if (!order) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-neptura-light-bg">
      <AccountSubpageHero
        label="Your collection"
        title={order.name.startsWith("#") ? `Order ${order.name}` : `Order #${order.name}`}
        subtitle={formatOrderHeroSubtitle(order)}
        compact
        gradient
        statusBadge={formatOrderStatusBadge(order)}
        footer={<AccountOrderProgressTracker steps={order.progressSteps} />}
      />

      <div className="mx-auto w-full max-w-4xl flex-1 px-6 pb-16 pt-8 md:px-10 md:pt-10 lg:px-12">
        <AccountOrderDetailPanel order={order} />
        <AccountSubpageNav
          backHref="/account/orders"
          backLabel="Back to all orders"
          className="account-order-detail-enter__nav mt-8"
        />
      </div>

      <SiteFooter />
    </div>
  );
}
