"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  CreditCard,
  PenLine,
  Gift,
  Mail,
  Newspaper,
  Settings,
  Tag,
  Users,
} from "lucide-react";

import LogoutButton from "@/app/admin/(protected)/LogoutButton";
import { adminNavItems } from "@/config/adminNavigation";
import styles from "./AdminNavigation.module.css";

type AdminNavigationProps = {
  adminName: string;
  isSuperAdmin: boolean;
  badges?: Record<string, number>;
  children: React.ReactNode;
};

const isPathActive = (pathname: string, href: string, exact = false) => {
  if (exact) {
    return pathname === href;
  }
  return pathname.startsWith(href);
};

const sideNavIcons: Record<string, LucideIcon> = {
  "/admin/kurse": BookOpen,
  "/admin/termine": CalendarDays,
  "/admin/angebote": Tag,
  "/admin/buchungen": ClipboardList,
  "/admin/zahlungen": CreditCard,
  "/admin/inhalte/wysiwyg": PenLine,
  "/admin/berichte": Newspaper,
  "/admin/gutscheine": Gift,
  "/admin/anfragen": Mail,
  "/admin/users": Users,
  "/admin/settings": Settings,
};

export default function AdminNavigation({
  adminName,
  isSuperAdmin,
  badges,
  children,
}: AdminNavigationProps) {
  const pathname = usePathname();
  const roleLabel = isSuperAdmin ? "Super Admin" : "Admin";
  const filteredItems = adminNavItems
    .filter((item) => !item.requiresSuperAdmin || isSuperAdmin)
    .map((item) => ({
      ...item,
      children: (item.children || []).filter(
        (child) => !child.requiresSuperAdmin || isSuperAdmin
      ),
    }));

  const isTopActive = (href: string, children?: { href: string }[]) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    if (isPathActive(pathname, href)) return true;
    return (children || []).some((child) => isPathActive(pathname, child.href));
  };

  const activeTop =
    filteredItems.find((item) => isTopActive(item.href, item.children)) ||
    filteredItems[0];
  const hasSideNav = Boolean(activeTop?.children?.length);

  return (
    <div className={styles.headerContainer}>
      <header>
        <nav className={styles.topNav}>
          <div className={styles.brand}>
            <span className={styles.brandKicker}>Admin</span>
            <span className={styles.brandName}>Fliegenfischerschule</span>
          </div>
          <ul className={styles.topLinks}>
            {filteredItems.map((item) => {
              const isActive = isTopActive(item.href, item.children);
              const badgeValue = badges?.[item.href] ?? 0;
              return (
                <li key={item.href} className={isActive ? styles.activeTop : ""}>
                  <Link href={item.href}>
                    <span className={styles.linkLabel}>{item.label}</span>
                    {badgeValue > 0 ? (
                      <span className={styles.navBadge} aria-label={`${badgeValue}`}>
                        {badgeValue}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className={styles.userProfile}>
            <span className={styles.userRole}>{roleLabel}</span>
            <span className={styles.userName}>{adminName}</span>
            <LogoutButton />
          </div>
        </nav>
      </header>

      <div className={`${styles.shell} ${!hasSideNav ? styles.shellNoNav : ""}`}>
        {hasSideNav ? (
          <aside className={styles.sideNav}>
            <p className={styles.sideTitle}>{activeTop.label}</p>
            <ul className={styles.sideLinks}>
              {activeTop.children.map((subItem) => {
                const isSubActive = isPathActive(pathname, subItem.href);
                const Icon = sideNavIcons[subItem.href];
                return (
                  <li key={subItem.href}>
                    <Link
                      href={subItem.href}
                      className={isSubActive ? styles.activeSub : undefined}
                    >
                      {Icon ? <Icon className={styles.sideIcon} aria-hidden="true" /> : null}
                      <span>{subItem.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </aside>
        ) : null}
        <main
          className={`${styles.mainContent} ${!hasSideNav ? styles.mainFull : ""}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
