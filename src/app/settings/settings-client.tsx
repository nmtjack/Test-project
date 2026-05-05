"use client";

import Image from "next/image";
import { signOut } from "next-auth/react";
import { FormEvent, useEffect, useState } from "react";
import { LogOut, RotateCcw, Upload } from "lucide-react";
import { plannerStorageKey } from "@/lib/planner-theme";

type ProfileUser = {
  id: string;
  email: string | null;
  name: string | null;
  username: string | null;
  tag: string | null;
  image: string | null;
  avatarUrl: string | null;
  accessLevel: string;
};

type PlannerPrefs = {
  theme: "fantasy" | "edgy" | "anime" | "cute" | "professional";
  dailyEnergy: number;
  availableHours: number;
};

const themeOptions: Array<{ key: PlannerPrefs["theme"]; label: string; accent: string }> = [
  { key: "fantasy", label: "Fantasy", accent: "#b7791f" },
  { key: "edgy", label: "Edgy", accent: "#ef4444" },
  { key: "anime", label: "Anime", accent: "#7c3aed" },
  { key: "cute", label: "Cute", accent: "#ec4899" },
  { key: "professional", label: "Professional", accent: "#2563eb" },
];

export function SettingsClient({ user }: { user: ProfileUser }) {
  const storageKey = plannerStorageKey(user.id);
  const [username, setUsername] = useState(user.username ?? "");
  const [tag, setTag] = useState(user.tag ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? user.image ?? "");
  const [message, setMessage] = useState("");
  const [plannerPrefs, setPlannerPrefs] = useState<PlannerPrefs>(() => {
    const fallback: PlannerPrefs = { theme: "fantasy", dailyEnergy: 10, availableHours: 5 };
    if (typeof window === "undefined") return fallback;
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return fallback;
    try {
      const parsed = JSON.parse(saved) as Partial<PlannerPrefs>;
      return { ...fallback, ...parsed };
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    let cancelled = false;
    async function loadPlannerPrefs() {
      try {
        const response = await fetch("/api/planner-state");
        const payload = await response.json();
        if (!cancelled && payload.state) {
          setPlannerPrefs((current) => ({ ...current, ...payload.state }));
          window.localStorage.setItem(storageKey, JSON.stringify(payload.state));
        }
      } catch {
        // Keep the local fallback if cloud preferences are unavailable.
      }
    }
    void loadPlannerPrefs();
    return () => {
      cancelled = true;
    };
  }, [storageKey]);

  function savePlannerPrefs(next: PlannerPrefs) {
    setPlannerPrefs(next);
    const saved = window.localStorage.getItem(storageKey);
    let parsed: Record<string, unknown> = {};
    try {
      parsed = saved ? JSON.parse(saved) as Record<string, unknown> : {};
    } catch {
      parsed = {};
    }
    window.localStorage.setItem(storageKey, JSON.stringify({ ...parsed, ...next }));
    void fetch("/api/planner-state", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    }).catch(() => setMessage("Saved locally, but cloud sync failed."));
  }

  function clearPlannerData() {
    window.localStorage.removeItem(storageKey);
    setPlannerPrefs({ theme: "fantasy", dailyEnergy: 10, availableHours: 5 });
    void fetch("/api/planner-state", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quests: [], xp: 0, coins: 0, streak: 0, shields: 2, bossName: "Weekly Boss", bossHp: 100, dailyEnergy: 10, availableHours: 5, theme: "fantasy", skillLabels: {}, challengeDone: false }),
    }).catch(() => setMessage("Planner data cleared locally, but cloud sync failed."));
    setMessage("Planner data cleared. Dashboard will start fresh.");
  }

  async function saveHandle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/profile/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, tag }),
    });
    const payload = await response.json();
    setMessage(response.ok ? `Saved ${payload.user.username}#${payload.user.tag}.` : payload.error);
  }

  async function uploadAvatar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/profile/avatar", { method: "POST", body: form });
    const payload = await response.json();
    if (response.ok) setAvatarUrl(payload.avatarUrl);
    setMessage(response.ok ? "Profile picture updated." : payload.error);
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-5 py-8 text-slate-950">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-slate-100">
              {avatarUrl ? <Image src={avatarUrl} alt="" fill className="object-cover" /> : null}
            </div>
            <div>
              <p className="text-sm font-black uppercase text-slate-500">Signed in as</p>
              <h1 className="mt-1 text-2xl font-black">{user.username && user.tag ? `${user.username}#${user.tag}` : user.name}</h1>
              <p className="text-sm font-bold text-slate-500">{user.email}</p>
              <p className="mt-2 rounded-md bg-slate-100 px-2 py-1 text-xs font-black uppercase">{user.accessLevel.toLowerCase()}</p>
            </div>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-black text-white">
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </section>

        <section className="space-y-6">
          <form onSubmit={saveHandle} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-black uppercase text-slate-500">Profile handle</p>
            <h2 className="mt-1 text-2xl font-black">Change username and #Tag</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_120px]">
              <input value={username} onChange={(event) => setUsername(event.target.value)} className="h-11 rounded-md border border-slate-200 px-3 font-bold outline-none" />
              <input value={tag} onChange={(event) => setTag(event.target.value)} className="h-11 rounded-md border border-slate-200 px-3 font-bold outline-none" />
            </div>
            <button className="mt-4 h-11 rounded-md bg-emerald-500 px-4 text-sm font-black text-slate-950">Save handle</button>
          </form>

          <form onSubmit={uploadAvatar} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-black uppercase text-slate-500">Profile picture</p>
            <h2 className="mt-1 text-2xl font-black">Upload avatar</h2>
            <input name="avatar" type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="mt-5 w-full rounded-md border border-dashed border-slate-300 p-4 text-sm font-bold" />
            <button className="mt-4 inline-flex h-11 items-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-black text-white">
              <Upload className="h-4 w-4" />
              Upload picture
            </button>
          </form>

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-black uppercase text-slate-500">Planner settings</p>
            <h2 className="mt-1 text-2xl font-black">Theme and capacity</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {themeOptions.map((theme) => (
                <button
                  key={theme.key}
                  type="button"
                  onClick={() => savePlannerPrefs({ ...plannerPrefs, theme: theme.key })}
                  className="rounded-lg border p-4 text-left transition hover:-translate-y-0.5"
                  style={{ borderColor: plannerPrefs.theme === theme.key ? theme.accent : "#e2e8f0", background: plannerPrefs.theme === theme.key ? "#f8fafc" : "#fff" }}
                >
                  <div className="flex items-center gap-2"><span className="h-4 w-4 rounded" style={{ background: theme.accent }} /><p className="font-black">{theme.label}</p></div>
                </button>
              ))}
            </div>
            <label className="mt-5 block"><span className="flex justify-between text-sm font-bold">Daily energy <b>{plannerPrefs.dailyEnergy}</b></span><input className="mt-2 w-full accent-[#b7791f]" type="range" min="4" max="16" value={plannerPrefs.dailyEnergy} onChange={(event) => savePlannerPrefs({ ...plannerPrefs, dailyEnergy: Number(event.target.value) })} /></label>
            <label className="mt-5 block"><span className="flex justify-between text-sm font-bold">Available time <b>{plannerPrefs.availableHours}h</b></span><input className="mt-2 w-full accent-[#b7791f]" type="range" min="1" max="12" step="0.5" value={plannerPrefs.availableHours} onChange={(event) => savePlannerPrefs({ ...plannerPrefs, availableHours: Number(event.target.value) })} /></label>
            <button type="button" onClick={clearPlannerData} className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-black text-white transition hover:-translate-y-0.5"><RotateCcw className="h-4 w-4" />Clear planner data</button>
          </section>
          {message ? <p className="rounded-md bg-slate-950 p-3 text-sm font-bold text-white">{message}</p> : null}
        </section>
      </div>
    </main>
  );
}
