import { NextResponse } from "next/server";
import { db, withUniqueId } from "@/lib/db";
import { makeId } from "@/lib/ids";
import { isValidBDPhone, normalizePhone } from "@/lib/orders";
import { normalizeSerial, serviceIssues, warrantyStatus } from "@/lib/tracking";

type ServiceInput = { serial: string; name: string; phone: string; issue: string; details: string; visit: "onsite" | "workshop" };

export async function POST(req: Request) {
  let b: Partial<ServiceInput>;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const errors: Partial<Record<keyof ServiceInput, string>> = {};
  const serial = normalizeSerial(b.serial ?? "");
  const w = serial ? await db.warranty.findUnique({ where: { serial } }) : null;
  if (!w) errors.serial = "এই সিরিয়াল নম্বর আমাদের রেকর্ডে নেই";
  if (!b.name || b.name.trim().length < 2) errors.name = "আপনার নাম লিখুন";
  if (!b.phone || !isValidBDPhone(b.phone)) errors.phone = "সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)";
  if (!b.issue || !serviceIssues.includes(b.issue)) errors.issue = "সমস্যার ধরন নির্বাচন করুন";
  if (!b.details || b.details.trim().length < 10) errors.details = "সমস্যাটি সংক্ষেপে লিখুন (অন্তত ১০ অক্ষর)";
  if (b.visit !== "onsite" && b.visit !== "workshop") errors.visit = "সার্ভিসের ধরন নির্বাচন করুন";
  if (Object.keys(errors).length || !w) return NextResponse.json({ errors }, { status: 422 });

  const underWarranty = warrantyStatus(w).active;
  const request = await withUniqueId(
    () => makeId("SRV"),
    (id) =>
      db.serviceRequest.create({
        data: { id, serial: w.serial, underWarranty, name: b.name!.trim(), phone: normalizePhone(b.phone!), issue: b.issue!, details: b.details!.trim(), visit: b.visit! },
      }),
  );
  return NextResponse.json({ id: request.id, underWarranty }, { status: 201 });
}
