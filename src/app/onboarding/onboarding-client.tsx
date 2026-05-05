"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function OnboardingClient({ defaultName }: { defaultName: string }) {
  const router = useRouter();
  const [username, setUsername] = useState(defaultName.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 18) || "Planner");
  const [tag, setTag] = useState("123");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const response = await fetch("/api/profile/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, tag }),
    });
    const payload = await response.json();
    setSaving(false);
    if (!response.ok) {
      setError(payload.error ?? "Could not save profile.");
      return;
    }
    window.sessionStorage.setItem("level-up-show-intro", "1");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#111827] px-5 py-10 text-white">
      <form onSubmit={submit} className="w-full max-w-lg rounded-lg border border-white/10 bg-white/10 p-7 shadow-2xl">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-300">First login setup</p>
        <h1 className="mt-2 text-3xl font-black">Create your public planner handle</h1>
        <p className="mt-3 text-sm leading-6 text-white/70">Friends will find you by this exact name and tag combo, like Inspector#123. The app checks uniqueness before saving.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_110px]">
          <label>
            <span className="text-xs font-black uppercase text-white/60">Username</span>
            <input value={username} onChange={(event) => setUsername(event.target.value)} className="mt-1 h-12 w-full rounded-md border border-white/15 bg-white px-3 font-black text-slate-950 outline-none" maxLength={24} />
          </label>
          <label>
            <span className="text-xs font-black uppercase text-white/60">#Tag</span>
            <input value={tag} onChange={(event) => setTag(event.target.value)} className="mt-1 h-12 w-full rounded-md border border-white/15 bg-white px-3 font-black text-slate-950 outline-none" maxLength={6} />
          </label>
        </div>
        <p className="mt-3 rounded-md bg-white/10 p-3 text-center font-black">{username || "Name"}#{tag || "000"}</p>
        {error ? <p className="mt-4 rounded-md bg-red-500/20 p-3 text-sm font-bold text-red-100">{error}</p> : null}
        <button disabled={saving} className="mt-6 h-12 w-full rounded-md bg-emerald-400 px-4 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 disabled:opacity-60">
          {saving ? "Checking..." : "Save and enter planner"}
        </button>
      </form>
    </main>
  );
}
