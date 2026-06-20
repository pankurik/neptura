import { NextRequest, NextResponse } from "next/server";
import { clearCustomerAvatar, uploadCustomerAvatar } from "@/lib/customer-auth/avatar";
import {
  accountSessionUnauthorizedResponse,
  requireCustomerSession,
} from "@/lib/customer-auth/require-session";

export async function POST(request: NextRequest) {
  const session = await requireCustomerSession();

  if (!session) {
    return accountSessionUnauthorizedResponse();
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

  const { avatarUrl, errors } = await uploadCustomerAvatar(session.customer.id, file);

  if (errors.length || !avatarUrl) {
    return NextResponse.json(
      { error: errors[0] ?? "Avatar could not be uploaded." },
      { status: 422 }
    );
  }

  return NextResponse.json({ avatarUrl });
}

export async function DELETE() {
  const session = await requireCustomerSession();

  if (!session) {
    return accountSessionUnauthorizedResponse();
  }

  const { errors } = await clearCustomerAvatar(session.customer.id);

  if (errors.length) {
    return NextResponse.json({ error: errors[0] ?? "Avatar could not be removed." }, { status: 422 });
  }

  return NextResponse.json({ avatarUrl: null });
}
