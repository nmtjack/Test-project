import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { OnboardingClient } from "./onboarding-client";

export default async function OnboardingPage() {
  const user = await requireUser();
  if (!user) redirect("/login");
  if (user.username && user.tag) redirect("/dashboard");

  return <OnboardingClient defaultName={user.name ?? user.email?.split("@")[0] ?? "Planner"} />;
}
