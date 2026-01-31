import Link from "next/link";

export type AdminNavItem = { href: string; label: string };

export default function AdminNav({ items }: { items: AdminNavItem[] }) {
  return (
    <nav className="flex flex-wrap gap-3 text-sm">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="rounded-full border border-white/20 px-4 py-2 text-white/80 hover:text-white"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
