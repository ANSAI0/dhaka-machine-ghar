import { factorySteps, stepIndex, type StepKey } from "@/lib/tracking";
import { Badge } from "./ui";

export function StepBadge({ step }: { step: StepKey }) {
  const i = stepIndex(step);
  return <Badge tone={step === "handover" ? "green" : i === 0 ? "red" : "blue"}>{i + 1}/6 · {factorySteps[i].en.split(" ")[0]}</Badge>;
}
