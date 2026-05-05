import { redirect } from "next/navigation";
import { AccountBar } from "@/components/account-bar";
import { requireUser } from "@/lib/session";
import { SocialClient } from "./social-client";

export default async function SocialPage() {
  const user = await requireUser();
  if (!user) redirect("/login");
  if (!user.username || !user.tag) redirect("/onboarding");

  return (
    <>
      <AccountBar user={user} />
      <SocialClient handle={`${user.username}#${user.tag}`} accountId={user.id} />
    </>
  );
}
