import { redirect } from "next/navigation";
import { AccountBar } from "@/components/account-bar";
import { isPaidAccess } from "@/lib/auth";
import { requireUser } from "@/lib/session";
import { PremiumClient } from "./premium-client";

export default async function PremiumPage() {
  const user = await requireUser();
  if (!user) redirect("/login");

  return (
    <>
      <AccountBar user={user} />
      <PremiumClient accessLevel={user.accessLevel} isPaid={isPaidAccess(user.accessLevel)} accountId={user.id} />
    </>
  );
}
