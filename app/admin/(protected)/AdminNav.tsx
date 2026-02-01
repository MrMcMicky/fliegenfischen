import Link from "next/link";

export type AdminNavItem = { href: string; label: string };
export type AdminNavGroup = { label: string; items: AdminNavItem[] };

export default function AdminNav({ groups }: { groups: AdminNavGroup[] }) {
  return (
    <nav className="grid gap-4 text-sm sm:grid-cols-2 xl:grid-cols-3">
      {groups.map((group) => (
        <div key={group.label} className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/60">
            {group.label}
          </p>
          <div className="flex flex-wrap gap-3">
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-white/20 px-4 py-2 text-white/80 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}
