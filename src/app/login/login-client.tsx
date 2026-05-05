"use client";

import { signIn } from "next-auth/react";
import { Mail, ShieldCheck, UserPlus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

type Mode = "login" | "register";

export function LoginClient({ googleConfigured }: { googleConfigured: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const error = params.get("error");
  const [mode, setMode] = useState<Mode>("login");
  const [handle, setHandle] = useState(() => (typeof window === "undefined" ? "" : window.localStorage.getItem("level-up-login-handle") ?? ""));
  const [username, setUsername] = useState("");
  const [tag, setTag] = useState("123");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const result = await signIn("credentials", {
      handle,
      password,
      redirect: false,
      callbackUrl: "/dashboard",
    });
    setBusy(false);

    if (result?.error) {
      setMessage("Login failed. Check your Username#Tag and password.");
      return;
    }

    if (rememberMe) {
      window.localStorage.setItem("level-up-login-handle", handle);
    } else {
      window.localStorage.removeItem("level-up-login-handle");
    }
    window.sessionStorage.setItem("level-up-show-intro", "1");
    router.push("/dashboard");
    router.refresh();
  }

  async function submitRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setBusy(true);
    let payload: { error?: string } = {};
    let response: Response;
    try {
      response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, tag, displayName, password }),
      });
      payload = await response.json().catch(() => ({ error: "Server returned an unreadable response." }));
    } catch {
      setBusy(false);
      setMessage("Could not reach the account server. Check that the dev server and database are running.");
      return;
    }

    if (!response.ok) {
      setBusy(false);
      setMessage(payload.error ?? "Could not create account.");
      return;
    }

    const result = await signIn("credentials", {
      handle: `${username}#${tag}`,
      password,
      redirect: false,
      callbackUrl: "/dashboard",
    });
    setBusy(false);

    if (result?.error) {
      setMode("login");
      setHandle(`${username}#${tag}`);
      setMessage("Account created. Please sign in.");
      return;
    }

    window.sessionStorage.setItem("level-up-show-intro", "1");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f7fb] px-5 py-10 text-slate-950">
      <section className="w-full max-w-md overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
        <div className="bg-slate-950 p-7 text-white">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-300">Level-Up Planner</p>
          <h1 className="mt-3 text-3xl font-black leading-tight">Turn your daily routine into a personal growth game.</h1>
        </div>
        <div className="p-7">
          <div className="grid grid-cols-2 rounded-md bg-slate-100 p-1">
            {(["login", "register"] as Mode[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setMode(item);
                  setMessage("");
                }}
                className="h-10 rounded px-3 text-sm font-black capitalize"
                style={{ background: mode === item ? "#0f172a" : "transparent", color: mode === item ? "white" : "#0f172a" }}
              >
                {item === "login" ? "Login" : "Create"}
              </button>
            ))}
          </div>

          {error ? (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">
              Login failed. Please try again.
            </div>
          ) : null}

          {mode === "login" ? (
            <form onSubmit={submitLogin} className="mt-5 space-y-3">
              <label className="block">
                <span className="text-xs font-black uppercase text-slate-500">Username#Tag</span>
                <input
                  value={handle}
                  onChange={(event) => setHandle(event.target.value)}
                  placeholder="Enter Name#Tag"
                  className="mt-1 h-12 w-full rounded-md border border-slate-200 px-3 font-bold outline-none focus:border-slate-950"
                  autoComplete="username"
                />
              </label>
              <label className="block">
                <span className="text-xs font-black uppercase text-slate-500">Password</span>
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  placeholder="Password"
                  className="mt-1 h-12 w-full rounded-md border border-slate-200 px-3 font-bold outline-none focus:border-slate-950"
                  autoComplete="current-password"
                />
              </label>
              <label className="flex items-start gap-3 rounded-md bg-slate-50 p-3 text-sm font-bold text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="mt-1 h-4 w-4 accent-slate-950"
                />
                <span>
                  Remember this device
                  <small className="block pt-1 font-semibold text-slate-500">Keeps your session and handle. The app never stores your raw password.</small>
                </span>
              </label>
              <button disabled={busy} className="flex h-12 w-full items-center justify-center gap-3 rounded-md bg-slate-950 px-4 text-sm font-black text-white transition hover:-translate-y-0.5 disabled:opacity-60">
                <ShieldCheck className="h-5 w-5" />
                {busy ? "Signing in..." : "Login"}
              </button>
            </form>
          ) : (
            <form onSubmit={submitRegister} className="mt-5 space-y-3">
              <label className="block">
                <span className="text-xs font-black uppercase text-slate-500">Display name</span>
                <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Enter display name" className="mt-1 h-12 w-full rounded-md border border-slate-200 px-3 font-bold outline-none focus:border-slate-950" />
              </label>
              <div className="grid gap-3 sm:grid-cols-[1fr_100px]">
                <label className="block">
                  <span className="text-xs font-black uppercase text-slate-500">Username</span>
                  <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Enter name" className="mt-1 h-12 w-full rounded-md border border-slate-200 px-3 font-bold outline-none focus:border-slate-950" autoComplete="username" />
                </label>
                <label className="block">
                  <span className="text-xs font-black uppercase text-slate-500">#Tag</span>
                  <input value={tag} onChange={(event) => setTag(event.target.value)} placeholder="Tag" className="mt-1 h-12 w-full rounded-md border border-slate-200 px-3 font-bold outline-none focus:border-slate-950" />
                </label>
              </div>
              <label className="block">
                <span className="text-xs font-black uppercase text-slate-500">Password</span>
                <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Password" className="mt-1 h-12 w-full rounded-md border border-slate-200 px-3 font-bold outline-none focus:border-slate-950" autoComplete="new-password" />
              </label>
              <label className="block">
                <span className="text-xs font-black uppercase text-slate-500">Confirm password</span>
                <input value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} type="password" placeholder="Password" className="mt-1 h-12 w-full rounded-md border border-slate-200 px-3 font-bold outline-none focus:border-slate-950" autoComplete="new-password" />
              </label>
              <p className="rounded-md bg-slate-100 p-3 text-center text-sm font-black">{username || "Username"}#{tag || "000"}</p>
              <button disabled={busy} className="flex h-12 w-full items-center justify-center gap-3 rounded-md bg-emerald-500 px-4 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 disabled:opacity-60">
                <UserPlus className="h-5 w-5" />
                {busy ? "Creating..." : "Create account"}
              </button>
            </form>
          )}

          {message ? <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm font-bold text-amber-800">{message}</p> : null}

          {googleConfigured ? (
            <button
              type="button"
              onClick={() => {
                window.sessionStorage.setItem("level-up-show-intro", "1");
                signIn("google", { callbackUrl: "/dashboard" });
              }}
              className="mt-4 flex h-11 w-full items-center justify-center gap-3 rounded-md border border-slate-200 bg-white px-4 text-sm font-black text-slate-950 transition hover:-translate-y-0.5"
            >
              <Mail className="h-5 w-5" />
              Continue with Google
            </button>
          ) : null}

          <p className="mt-4 flex items-start gap-2 text-sm font-bold text-slate-500">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            Passwords are stored as salted bcrypt hashes, not plain text.
          </p>
        </div>
      </section>
    </main>
  );
}
