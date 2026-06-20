import { NextRequest, NextResponse } from "next/server";
import { clearCustomerAvatar, uploadCustomerAvatar } from "@/lib/customer-auth/avatar";
import { fetchCustomerProfile } from "@/lib/customer-auth/customer";
import { getCustomerAccessToken } from "@/lib/customer-auth/session";

export async function POST(request: NextRequest) {
  const accessToken = await getCustomerAccessToken();

  if (!accessToken) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const customer = await fetchCustomerProfile(accessToken);

  if (!customer) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
  }

  const { avatarUrl, errors } = await uploadCustomerAvatar(customer.id, file);

  if (errors.length || !avatarUrl) {
    return NextResponse.json(
      { error: errors[0] ?? "Avatar could not be uploaded." },
      { status: 422 }
    );
  }

  return NextResponse.json({ avatarUrl });
}

export async function DELETE() {
  const accessToken = await getCustomerAccessToken();

  if (!accessToken) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const customer = await fetchCustomerProfile(accessToken);

  if (!customer) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { errors } = await clearCustomerAvatar(customer.id);

  if (errors.length) {
    return NextResponse.json({ error: errors[0] ?? "Avatar could not be removed." }, { status: 422 });
  }

  return NextResponse.json({ avatarUrl: null });
}
