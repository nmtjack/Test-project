"use client";

import Link from "next/link";
import { useState } from "react";
import { readPlannerTheme } from "@/lib/planner-theme";

export function PremiumClient({ accessLevel, isPaid, accountId }: { accessLevel: string; isPaid: boolean; accountId: string }) {
  const [theme] = useState(() => readPlannerTheme(accountId));

  return (
    <main className="min-h-screen px-6 py-10" style={{ background: theme.bg, color: theme.text }}>
      <div className="mx-auto max-w-3xl rounded-lg border p-8 shadow-sm" style={{ borderColor: theme.line, background: theme.panel }}>
        <p className="text-sm font-black uppercase" style={{ color: theme.accent }}>Premium access</p>
        <h1 className="mt-2 text-3xl font-black">{isPaid ? "Premium unlocked" : "Free plan active"}</h1>
        <p className="mt-3" style={{ color: theme.muted }}>
          Your current access level is <b>{accessLevel.toLowerCase()}</b>. Premium checks are server-side, so users cannot unlock paid features by editing frontend state.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {["Advanced capacity", "Team co-op tools", "Premium tracking"].map((item) => (
            <div key={item} className="rounded-lg border p-4 text-sm font-black" style={{ borderColor: theme.line, background: theme.soft }}>
              {item}
            </div>
          ))}
        </div>
        <Link href="/dashboard" className="mt-6 inline-flex rounded-md px-4 py-2 text-sm font-black text-white" style={{ background: theme.inverse }}>
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
