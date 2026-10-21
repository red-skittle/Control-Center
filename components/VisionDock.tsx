"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  name: string;
  href: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: "Overview", href: "/", icon: "dashboard" },
  { name: "Tasks", href: "/tasks", icon: "task_alt" },
  { name: "Focus", href: "/focus", icon: "timer" },
  { name: "Fitness", href: "/fitness", icon: "bolt" },
  { name: "Profile", href: "/profile", icon: "person" },
];

export function VisionDock() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-3 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none pb-safe">
      <div className="pointer-events-auto h-14 max-w-sm w-full visionos-dock rounded-full px-3 flex items-center justify-between">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors apple-spring-press ${
                isActive
                  ? "text-apple-blue"
                  : "text-apple-labelSecondary hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {item.icon}
              </span>
              <span
                className={`text-[9px] tracking-tight mt-0.5 ${
                  isActive ? "font-semibold" : "font-medium"
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
