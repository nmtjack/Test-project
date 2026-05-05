import { redirect } from "next/navigation";
import { AccountBar } from "@/components/account-bar";
import PlannerApp from "@/components/planner-app";
import { requireUser } from "@/lib/session";

export default async function DashboardPage() {
  const user = await requireUser();
  if (!user) redirect("/login");
  if (!user.username || !user.tag) redirect("/onboarding");

  return (
    <>
      <AccountBar user={user} />
      <PlannerApp accountId={user.id} />
    </>
  );
}
