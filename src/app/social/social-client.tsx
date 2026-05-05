"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Check, Search, UserPlus, X } from "lucide-react";
import { readPlannerTheme } from "@/lib/planner-theme";

type SearchUser = {
  id: string;
  name: string | null;
  username: string | null;
  tag: string | null;
  image: string | null;
  avatarUrl: string | null;
  accessLevel: string;
};

type FriendRequest = {
  id: string;
  user: SearchUser;
};

export function SocialClient({ handle, accountId }: { handle: string; accountId: string }) {
  const [theme] = useState(() => readPlannerTheme(accountId));
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchUser[]>([]);
  const [friends, setFriends] = useState<SearchUser[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [status, setStatus] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadFriends() {
      try {
        const response = await fetch("/api/friends");
        const payload = await response.json();
        if (!cancelled) {
          setFriends(payload.friends ?? []);
          setIncomingRequests(payload.incomingRequests ?? []);
          setOutgoingRequests(payload.outgoingRequests ?? []);
        }
      } catch {
        if (!cancelled) {
          setFriends([]);
          setIncomingRequests([]);
          setOutgoingRequests([]);
        }
      }
    }
    void loadFriends();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/friends/search?q=${encodeURIComponent(trimmed)}`);
        const payload = await response.json();
        if (!cancelled) setResults(payload.users ?? []);
      } catch {
        if (!cancelled) setStatus("Search is unavailable right now.");
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    }, 180);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  function updateQuery(value: string) {
    setQuery(value);
    setStatus("");
    if (value.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
    } else {
      setIsSearching(true);
    }
  }

  async function addFriend(targetUserId: string) {
    const response = await fetch("/api/friends/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId }),
    });
    const payload = await response.json();
    setStatus(response.ok ? payload.status === "ACCEPTED" ? "You are already friends." : "Friend request sent. Waiting for acceptance." : payload.error);
    if (response.ok) {
      const friend = results.find((item) => item.id === targetUserId);
      if (friend && payload.status !== "ACCEPTED" && !outgoingRequests.some((item) => item.user.id === friend.id)) {
        setOutgoingRequests((current) => [{ id: payload.friendship.id, user: friend }, ...current]);
      }
    }
  }

  async function respondToRequest(friendshipId: string, action: "accept" | "decline") {
    const response = await fetch("/api/friends/request", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friendshipId, action }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setStatus(payload.error ?? "Could not update request.");
      return;
    }
    const request = incomingRequests.find((item) => item.id === friendshipId);
    setIncomingRequests((current) => current.filter((item) => item.id !== friendshipId));
    if (action === "accept" && request && !friends.some((item) => item.id === request.user.id)) {
      setFriends((current) => [request.user, ...current]);
    }
    setStatus(action === "accept" ? "Friend request accepted." : "Friend request declined.");
  }

  return (
    <main className="min-h-screen px-5 py-8" style={{ background: theme.bg, color: theme.text }}>
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-lg border p-6 shadow-sm" style={{ borderColor: theme.line, background: theme.panel }}>
          <p className="text-sm font-black uppercase tracking-[0.16em]" style={{ color: theme.accent }}>Social</p>
          <h1 className="mt-2 text-3xl font-black">Find friends by Name#Tag</h1>
          <p className="mt-2 text-sm font-bold" style={{ color: theme.muted }}>Your handle: {handle}</p>
        </header>

        <section className="rounded-lg border p-5 shadow-sm" style={{ borderColor: theme.line, background: theme.panel }}>
          <label className="block">
            <span className="text-xs font-black uppercase" style={{ color: theme.muted }}>Search profiles</span>
            <div className="mt-2 flex items-center rounded-md border px-3" style={{ borderColor: theme.line, background: theme.soft }}>
              <Search className="h-5 w-5" style={{ color: theme.muted }} />
              <input
                value={query}
                onChange={(event) => updateQuery(event.target.value)}
                placeholder="Enter Name#Tag"
                className="h-12 min-w-0 flex-1 bg-transparent px-3 font-bold outline-none"
              />
            </div>
          </label>

          <div className="mt-5 space-y-3">
            {results.map((user) => {
              const avatar = user.avatarUrl ?? user.image;
              return (
                <article key={user.id} className="flex items-center justify-between gap-4 rounded-lg border p-4" style={{ borderColor: theme.line, background: theme.soft }}>
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg" style={{ background: theme.panel }}>
                      {avatar ? <Image src={avatar} alt="" fill className="object-cover" /> : null}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-black">{user.username}#{user.tag}</p>
                      <p className="truncate text-sm font-bold" style={{ color: theme.muted }}>{user.name ?? "Level-Up Planner user"}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => addFriend(user.id)}
                    disabled={friends.some((item) => item.id === user.id) || outgoingRequests.some((item) => item.user.id === user.id)}
                    className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md px-3 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-55"
                    style={{ background: theme.inverse }}
                  >
                    <UserPlus className="h-4 w-4" />
                    {friends.some((item) => item.id === user.id) ? "Friends" : outgoingRequests.some((item) => item.user.id === user.id) ? "Pending" : "Request"}
                  </button>
                </article>
              );
            })}
            {query.trim().length >= 2 && !isSearching && results.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-sm font-bold" style={{ borderColor: theme.line, color: theme.muted }}>
                No matching profiles yet. Keep typing the full Name#Tag if you know it.
              </div>
            ) : null}
            {isSearching ? <p className="text-sm font-bold" style={{ color: theme.muted }}>Searching...</p> : null}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border p-5 shadow-sm" style={{ borderColor: theme.line, background: theme.panel }}>
            <p className="text-sm font-black uppercase tracking-[0.16em]" style={{ color: theme.accent }}>Friend requests</p>
            <h2 className="mt-1 text-2xl font-black">Needs your response</h2>
            <div className="mt-4 space-y-3">
              {incomingRequests.map((request) => {
                const avatar = request.user.avatarUrl ?? request.user.image;
                return (
                  <article key={request.id} className="flex items-center justify-between gap-3 rounded-lg border p-3" style={{ borderColor: theme.line, background: theme.soft }}>
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg" style={{ background: theme.panel }}>{avatar ? <Image src={avatar} alt="" fill className="object-cover" /> : null}</div>
                      <div className="min-w-0">
                        <p className="truncate font-black">{request.user.username}#{request.user.tag}</p>
                        <p className="truncate text-xs font-bold" style={{ color: theme.muted }}>{request.user.name ?? "Planner user"}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => respondToRequest(request.id, "accept")} className="grid h-9 w-9 place-items-center rounded-md text-white" style={{ background: theme.accent2 }} title="Accept"><Check className="h-4 w-4" /></button>
                      <button type="button" onClick={() => respondToRequest(request.id, "decline")} className="grid h-9 w-9 place-items-center rounded-md text-white" style={{ background: theme.inverse }} title="Decline"><X className="h-4 w-4" /></button>
                    </div>
                  </article>
                );
              })}
              {incomingRequests.length === 0 ? <p className="rounded-lg border border-dashed p-5 text-sm font-bold" style={{ borderColor: theme.line, color: theme.muted }}>No pending requests.</p> : null}
            </div>
          </div>

          <div className="rounded-lg border p-5 shadow-sm" style={{ borderColor: theme.line, background: theme.panel }}>
            <p className="text-sm font-black uppercase tracking-[0.16em]" style={{ color: theme.accent }}>Sent requests</p>
            <h2 className="mt-1 text-2xl font-black">Waiting for acceptance</h2>
            <div className="mt-4 space-y-3">
              {outgoingRequests.map((request) => {
                const avatar = request.user.avatarUrl ?? request.user.image;
                return (
                  <article key={request.id} className="flex items-center gap-3 rounded-lg border p-3" style={{ borderColor: theme.line, background: theme.soft }}>
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg" style={{ background: theme.panel }}>{avatar ? <Image src={avatar} alt="" fill className="object-cover" /> : null}</div>
                    <div className="min-w-0">
                      <p className="truncate font-black">{request.user.username}#{request.user.tag}</p>
                      <p className="text-xs font-bold" style={{ color: theme.muted }}>Pending</p>
                    </div>
                  </article>
                );
              })}
              {outgoingRequests.length === 0 ? <p className="rounded-lg border border-dashed p-5 text-sm font-bold" style={{ borderColor: theme.line, color: theme.muted }}>No sent requests waiting.</p> : null}
            </div>
          </div>
        </section>

        <section className="rounded-lg border p-5 shadow-sm" style={{ borderColor: theme.line, background: theme.panel }}>
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.16em]" style={{ color: theme.accent }}>Online friends</p>
              <h2 className="mt-1 text-2xl font-black">Friend list</h2>
              <p className="mt-1 text-sm font-bold" style={{ color: theme.muted }}>Ten are visible at once; scroll to see everyone.</p>
            </div>
            <span className="rounded-md px-3 py-1 text-xs font-black" style={{ background: theme.soft }}>{friends.length} total</span>
          </div>
          <div className="mt-4 max-h-[640px] space-y-3 overflow-y-auto pr-2">
            {friends.map((friend) => {
              const avatar = friend.avatarUrl ?? friend.image;
              return (
                <article key={friend.id} className="flex items-center gap-3 rounded-lg border p-3" style={{ borderColor: theme.line, background: theme.soft }}>
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg" style={{ background: theme.panel }}>
                    {avatar ? <Image src={avatar} alt="" fill className="object-cover" /> : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-black">{friend.username}#{friend.tag}</p>
                    <p className="text-xs font-bold" style={{ color: theme.accent2 }}>Online</p>
                  </div>
                </article>
              );
            })}
            {friends.length === 0 ? <p className="rounded-lg border border-dashed p-6 text-sm font-bold" style={{ borderColor: theme.line, color: theme.muted }}>No friends yet. Search by Name#Tag to add someone.</p> : null}
          </div>
        </section>

        {status ? <p className="rounded-md p-3 text-sm font-black text-white" style={{ background: theme.inverse }}>{status}</p> : null}
      </div>
    </main>
  );
}
