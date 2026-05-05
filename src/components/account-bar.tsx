"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { readPlannerTheme } from "@/lib/planner-theme";

type AccountBarUser = {
  id: string;
  name: string | null;
  username: string | null;
  tag: string | null;
  email: string | null;
  image: string | null;
  avatarUrl: string | null;
  accessLevel: string;
};

export function AccountBar({ user }: { user: AccountBarUser }) {
  const avatar = user.avatarUrl ?? user.image;
  const handle = user.username && user.tag ? `${user.username}#${user.tag}` : user.name ?? user.email;
  const pathname = usePathname();
  const theme = readPlannerTheme(user.id);
  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/social", label: "Social" },
    { href: "/premium", label: "Premium" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <div className="border-b px-4 py-3 shadow-sm" style={{ background: theme.inverse, borderColor: theme.line, color: theme.panel }}>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-11 overflow-hidden rounded-lg" style={{ background: theme.panel }}>
            {avatar ? <Image src={avatar} alt="" fill className="object-cover" /> : null}
          </div>
          <div>
            <p className="text-sm font-black">{handle}</p>
            <p className="text-xs font-bold uppercase text-white/60">{user.accessLevel.toLowerCase()} access</p>
          </div>
        </div>
        <nav className="flex flex-wrap gap-2 text-sm font-black">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                className="rounded-md px-3 py-2 transition hover:-translate-y-0.5"
                style={{ background: active ? theme.accent : "rgba(255,255,255,0.1)", color: active ? theme.panel : "rgba(255,255,255,0.82)" }}
                href={link.href}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
