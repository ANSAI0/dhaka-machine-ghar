import { CircuitBoard, Cog, Factory, HardHat, Wrench, type LucideProps } from "lucide-react";

const icons = { Factory, Cog, Wrench, HardHat, CircuitBoard };

export function CategoryIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = icons[name as keyof typeof icons] ?? Cog;
  return <Icon {...props} />;
}
