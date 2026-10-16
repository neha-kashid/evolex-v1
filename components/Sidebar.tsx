"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Home", href: "/", icon: "🏠" },
  { name: "Opportunity Map", href: "/opportunity-map", icon: "🧭" },
  { name: "Pre-Publish Lab", href: "/pre-publish-lab", icon: "✨" },
  { name: "Post-Publish Lab", href: "/post-publish-lab", icon: "📊" },
  { name: "My Experiments", href: "/experiments", icon: "🧪" },
  { name: "Profile", href: "/profile", icon: "👤" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col border-r border-violet-100 bg-[#FAF9FF] px-5 py-7 lg:w-72 lg:px-6">
      <Link
        href="/"
        className="mb-12 px-2 text-2xl font-extrabold tracking-tight text-[#171C46]"
      >
        EVOLEX<span className="text-violet-600">.</span>
      </Link>

      <p className="mb-4 px-3 text-xs font-semibold tracking-widest text-slate-400">
        WORKSPACE
      </p>

      <nav className="space-y-2">
        {navigation.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-base font-semibold transition ${
                active
                  ? "bg-violet-100 text-violet-800"
                  : "text-slate-600 hover:bg-violet-50"
              }`}
            >
              <span
                className="inline-flex w-7 shrink-0 justify-center text-xl"
                aria-hidden="true"
              >
                {item.icon}
              </span>

              <span
                className={
                  item.name === "Home"
                    ? "text-lg font-semibold"
                    : "text-base font-semibold"
                }
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}