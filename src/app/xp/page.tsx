import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountBar } from "@/components/account-bar";
import { requireUser } from "@/lib/session";

export default async function XpPage() {
  const user = await requireUser();
  if (!user) redirect("/login");

  return (
    <>
    <AccountBar user={user} />
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl rounded-lg border border-white/10 bg-white/10 p-8">
        <p className="text-sm font-black uppercase text-yellow-300">Protected route</p>
        <h1 className="mt-2 text-3xl font-black">XP Progression</h1>
        <p className="mt-3 text-white/70">This route is session-protected and ready for server-side XP history.</p>
        <Link href="/dashboard" className="mt-6 inline-flex rounded-md bg-yellow-300 px-4 py-2 text-sm font-black text-slate-950">Back to dashboard</Link>
      </div>
    </main>
    </>
  );
}
