import { TrackingScripts } from "@/components/tracking-scripts";

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <TrackingScripts />
    </>
  );
}
