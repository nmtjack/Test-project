import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountBar } from "@/components/account-bar";
import { requireUser } from "@/lib/session";

export default async function HabitsPage() {
  const user = await requireUser();
  if (!user) redirect("/login");

  return (
    <>
    <AccountBar user={user} />
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl rounded-lg border border-white/10 bg-white/10 p-8">
        <p className="text-sm font-black uppercase text-emerald-300">Protected route</p>
        <h1 className="mt-2 text-3xl font-black">Habits</h1>
        <p className="mt-3 text-white/70">Habit loops can be added here after the planner data moves from localStorage into Postgres.</p>
        <Link href="/dashboard" className="mt-6 inline-flex rounded-md bg-emerald-500 px-4 py-2 text-sm font-black text-slate-950">Back to dashboard</Link>
      </div>
    </main>
    </>
  );
}
