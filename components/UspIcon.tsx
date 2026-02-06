import type { ComponentType, SVGProps } from "react";

import { Award, MapPin, Users, Wrench } from "lucide-react";

const iconMap: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  "Kleine Gruppen": Users,
  "Zertifizierte Ausbildung": Award,
  "Ausrüstung vorhanden": Wrench,
  "Region Limmat": MapPin,
};

export function UspIcon({ title }: { title: string }) {
  const Icon = iconMap[title] ?? Users;
  return (
    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-ember)]/10 text-[var(--color-ember)]">
      <Icon className="h-5 w-5" strokeWidth={1.5} />
    </div>
  );
}
