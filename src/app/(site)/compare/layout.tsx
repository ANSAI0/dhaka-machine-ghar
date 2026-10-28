import type { Metadata } from "next";

export const metadata: Metadata = { title: "Compare Machines" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
