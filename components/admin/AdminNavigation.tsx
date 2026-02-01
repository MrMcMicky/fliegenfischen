"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import LogoutButton from "@/app/admin/(protected)/LogoutButton";
import { adminNavItems } from "@/config/adminNavigation";
import styles from "./AdminNavigation.module.css";

type AdminNavigationProps = {
  adminName: string;
  isSuperAdmin: boolean;
};

const isPathActive = (pathname: string, href: string, exact = false) => {
  if (exact) {
    return pathname === href;
  }
  return pathname.startsWith(href);
};

export default function AdminNavigation({
  adminName,
  isSuperAdmin,
}: AdminNavigationProps) {
  const pathname = usePathname();
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

  return (
    <header className={styles.headerContainer}>
      <nav className={styles.topNav}>
        <div className={styles.brand}>
          <span className={styles.brandKicker}>Admin</span>
          <span className={styles.brandName}>Fliegenfischerschule</span>
        </div>
        <ul className={styles.topLinks}>
          {filteredItems.map((item) => {
            const isActive = isTopActive(item.href, item.children);
            return (
              <li key={item.href} className={isActive ? styles.activeTop : ""}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            );
          })}
        </ul>
        <div className={styles.userProfile}>
          <span className={styles.userName}>{adminName}</span>
          <LogoutButton />
        </div>
      </nav>

      {activeTop?.children && activeTop.children.length > 0 ? (
        <nav className={styles.subNav}>
          <ul className={styles.subLinks}>
            {activeTop.children.map((subItem) => {
              const isSubActive = isPathActive(pathname, subItem.href);
              return (
                <li key={subItem.href}>
                  <Link
                    href={subItem.href}
                    className={isSubActive ? styles.activeSub : undefined}
                  >
                    {subItem.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
