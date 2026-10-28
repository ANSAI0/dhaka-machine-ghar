import { NextResponse } from "next/server";
import { getCustomer } from "@/lib/customer-auth";

// The signed-in customer's own details (for header + checkout prefill). Never cached.
export async function GET() {
  const c = await getCustomer();
  const body = c ? { name: c.name, phone: c.phone, email: c.email, address: c.address, district: c.district, verified: c.phoneVerified } : null;
  return NextResponse.json(body, { headers: { "Cache-Control": "private, no-store" } });
}
