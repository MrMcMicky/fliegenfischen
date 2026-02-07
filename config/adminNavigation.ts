export type AdminNavChild = {
  label: string;
  href: string;
  requiresSuperAdmin?: boolean;
};

export type AdminNavItem = {
  label: string;
  href: string;
  children?: AdminNavChild[];
  requiresSuperAdmin?: boolean;
};

export const adminNavItems: AdminNavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    children: [],
  },
  {
    label: "Kurse & Buchungen",
    href: "/admin/kurse",
    children: [
      { label: "Kurs-Typen", href: "/admin/kurse" },
      { label: "Termine", href: "/admin/termine" },
      { label: "Angebote", href: "/admin/angebote" },
      { label: "Buchungen", href: "/admin/buchungen" },
      { label: "Zahlungen", href: "/admin/zahlungen" },
    ],
  },
  {
    label: "Anfragen",
    href: "/admin/anfragen",
    children: [],
  },
  {
    label: "Inhalte",
    href: "/admin/inhalte/wysiwyg",
    children: [
      { label: "Webpage", href: "/admin/inhalte/wysiwyg" },
      { label: "Berichte", href: "/admin/berichte" },
      { label: "Gutscheine", href: "/admin/gutscheine" },
    ],
  },
  {
    label: "System",
    href: "/admin/settings",
    requiresSuperAdmin: true,
    children: [
      { label: "Backups", href: "/admin/settings" },
      { label: "Benutzer", href: "/admin/users" },
    ],
  },
];
