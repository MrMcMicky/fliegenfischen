import type { ComponentType, SVGProps } from "react";

import { Award, MapPin, Users, Wrench } from "lucide-react";

const iconMap: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  "Kleine Gruppen": Users,
  "Zertifizierte Ausbildung": Award,
  "Ausrüstung vorhanden": Wrench,
  "Region Limmat": MapPin,
};

const variantStyles = {
  ember: "bg-[var(--color-ember)]/12 text-[var(--color-ember)]",
  forest: "bg-[var(--color-forest)]/10 text-[var(--color-forest)]",
  river: "bg-[var(--color-river)]/12 text-[var(--color-river)]",
};

export function UspIcon({
  title,
  variant = "ember",
}: {
  title: string;
  variant?: "ember" | "forest" | "river";
}) {
  const Icon = iconMap[title] ?? Users;
  return (
    <div
      className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full ${variantStyles[variant]}`}
    >
      <Icon className="h-5 w-5" strokeWidth={1.5} />
    </div>
  );
}
