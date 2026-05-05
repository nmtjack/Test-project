import { redirect } from "next/navigation";
import { AccountBar } from "@/components/account-bar";
import { requireUser } from "@/lib/session";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const user = await requireUser();
  if (!user) redirect("/login");
  return (
    <>
      <AccountBar user={user} />
      <SettingsClient user={user} />
    </>
  );
}
