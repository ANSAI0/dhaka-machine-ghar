import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { db } from "@/lib/db";
import { formatBDT } from "@/lib/site";
import { amountDue, onlinePaymentEnabled } from "@/lib/sslcommerz";
import { PayOnlineButton } from "@/components/pay-online-button";

export const metadata: Metadata = { title: "Payment", robots: { index: false } };
export const dynamic = "force-dynamic";

// Where SSLCommerz sends the customer back. The result shown comes from the database
// (written after server-side validation), not from the URL.
export default async function PaymentResultPage({ searchParams }: { searchParams: Promise<{ order?: string; status?: string }> }) {
  const { order: id, status } = await searchParams;
  const order = id ? await db.order.findUnique({ where: { id } }) : null;
  const paid = order?.paymentStatus === "paid";
  const due = order ? amountDue(order) : 0;

  return (
    <div className="container mx-auto px-3 py-10 sm:px-4">
      <div className={`mx-auto max-w-md rounded-3xl border-2 bg-white p-7 text-center shadow-sm ${paid ? "border-brand-600" : "border-gray-200"}`}>
        {paid ? <CheckCircle2 className="mx-auto h-14 w-14 text-brand-600" /> : <XCircle className="mx-auto h-14 w-14 text-accent-600" />}
        <h1 className="mt-3 text-xl font-bold text-gray-900">
          {paid ? "পেমেন্ট সফল হয়েছে" : status === "cancelled" ? "পেমেন্ট বাতিল করা হয়েছে" : "পেমেন্ট সম্পন্ন হয়নি"}
        </h1>
        {order ? (
          <>
            <p className="mt-1 text-sm text-gray-500">ইনভয়েস নম্বর</p>
            <p className="text-2xl font-bold tracking-wider text-accent-600">{order.id}</p>
            <div className="mt-4 space-y-1 rounded-xl bg-gray-50 p-4 text-sm">
              <p className="flex justify-between"><span className="text-gray-500">মোট মূল্য</span><strong>{formatBDT(order.total)}</strong></p>
              <p className="flex justify-between"><span className="text-gray-500">পরিশোধিত</span><strong className="text-brand-700">{formatBDT(order.paidAmount)}</strong></p>
              {order.payMethod && <p className="flex justify-between"><span className="text-gray-500">মাধ্যম</span><strong>{order.payMethod}</strong></p>}
            </div>
            {!paid && due > 0 && onlinePaymentEnabled() && (
              <div className="mt-4">
                <PayOnlineButton orderId={order.id} amount={due} />
              </div>
            )}
            <Link href={`/track?q=${order.id}`} className="mt-4 inline-block rounded-xl border border-brand-600 px-5 py-2.5 text-sm font-bold text-brand-700 hover:bg-brand-600 hover:text-white">
              অর্ডার ট্র্যাক করুন
            </Link>
          </>
        ) : (
          <Link href="/" className="mt-4 inline-block text-sm font-bold text-brand-700 underline">হোম পেজে ফিরে যান</Link>
        )}
      </div>
    </div>
  );
}
