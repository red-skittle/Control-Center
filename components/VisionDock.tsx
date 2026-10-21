"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CheckSquare, Timer, Dumbbell, User } from "lucide-react";

const NAV_ITEMS = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Focus", href: "/focus", icon: Timer },
  { name: "Fitness", href: "/fitness", icon: Dumbbell },
  { name: "Profile", href: "/profile", icon: User },
];

export function VisionDock() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-3 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none pb-safe">
      <div className="pointer-events-auto h-14 max-w-sm w-full visionos-dock rounded-full px-3 flex items-center justify-between">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const IconComponent = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors apple-spring-press ${
                isActive
                  ? "text-apple-blue"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <IconComponent className="w-5 h-5" />
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
