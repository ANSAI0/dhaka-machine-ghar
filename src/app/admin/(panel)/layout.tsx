import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "./admin-nav";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin" }, robots: { index: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const s = await requireAdmin();
  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      <AdminNav name={s.name} role={s.role} />
      <div className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
    </div>
  );
}
