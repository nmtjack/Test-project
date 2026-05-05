"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import {
  BatteryCharging,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Coins,
  Flame,
  Flag,
  Goal,
  Layers3,
  ListChecks,
  MapPin,
  Plus,
  RefreshCcw,
  Settings,
  Shield,
  Sparkles,
  Swords,
  Target,
  Trash2,
  Trophy,
  Undo2,
  Users,
  Zap,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { plannerStorageKey } from "@/lib/planner-theme";

type Area = "Career" | "Fitness" | "Learning" | "Money" | "Business" | "Relationships" | "Health" | "Creativity";
type QuestType = "Easy admin" | "Normal task" | "Deep work" | "Emotional task" | "Hard creative work";
type QuestStatus = "active" | "done" | "rescheduled" | "archived";
type Priority = "Low" | "Medium" | "High" | "Critical";
type Tab = "dashboard" | "planner" | "coop" | "tracking";
type ThemePreset = "fantasy" | "edgy" | "anime" | "cute" | "professional";

type Quest = {
  id: string | number;
  title: string;
  project: string;
  goal: string;
  area: Area;
  type: QuestType;
  energy: number;
  hours: number;
  dueDate: string;
  priority: Priority;
  status: QuestStatus;
  bossDamage: number;
  createdAt: string;
  scheduledBlock: string;
  notes?: string;
  hardFirst?: boolean;
  focus?: boolean;
  top3?: boolean;
  isCoop?: boolean;
  coopQuestId?: string;
  coopCreatorHandle?: string;
  coopParticipantStatus?: string;
  address?: string;
  googleMapsUrl?: string;
  inviteHandles?: string;
};

type PlannerState = {
  quests: Quest[];
  xp: number;
  coins: number;
  streak: number;
  shields: number;
  bossName: string;
  bossHp: number;
  dailyEnergy: number;
  availableHours: number;
  theme: ThemePreset;
  skillLabels: Record<Area, string>;
  challengeDone: boolean;
};

type DraftQuest = {
  title: string;
  project: string;
  goal: string;
  area: Area;
  type: QuestType;
  hours: string;
  dueDate: string;
  priority: Priority;
  scheduledBlock: string;
  bossDamage: string;
  notes: string;
  isCoop: boolean;
  address: string;
  googleMapsUrl: string;
  inviteHandles: string;
};

type FriendProfile = {
  id: string;
  name: string | null;
  username: string | null;
  tag: string | null;
  image: string | null;
  avatarUrl: string | null;
};

type ApiCoopQuest = {
  id: string;
  title: string;
  description: string;
  activityDate: string;
  address: string;
  googleMapsUrl: string;
  status: string;
  currentUserParticipantStatus?: string | null;
  creator: { username: string | null; tag: string | null; name: string | null };
  participants: Array<{
    status: string;
    user: { username: string | null; tag: string | null; name: string | null };
  }>;
};

const areas: Area[] = ["Career", "Fitness", "Learning", "Money", "Business", "Relationships", "Health", "Creativity"];
const priorities: Priority[] = ["Low", "Medium", "High", "Critical"];
const questTypes: QuestType[] = ["Easy admin", "Normal task", "Deep work", "Emotional task", "Hard creative work"];

const levelTitles = [
  "Drifter",
  "Starter",
  "Builder",
  "Operator",
  "Executor",
  "Strategist",
  "Machine",
  "Founder Mode",
  "Master Planner",
  "Life Architect",
];

const typeEnergy: Record<QuestType, number> = {
  "Easy admin": 1,
  "Normal task": 2,
  "Deep work": 3,
  "Emotional task": 4,
  "Hard creative work": 5,
};

const priorityWeight: Record<Priority, number> = {
  Low: 1,
  Medium: 2,
  High: 3,
  Critical: 4,
};

const areaAccent: Record<Area, string> = {
  Career: "#38bdf8",
  Fitness: "#34d399",
  Learning: "#f59e0b",
  Money: "#84cc16",
  Business: "#fb923c",
  Relationships: "#fb7185",
  Health: "#14b8a6",
  Creativity: "#d946ef",
};

const themes: Record<ThemePreset, { label: string; vibe: string; bg: string; panel: string; text: string; muted: string; line: string; accent: string; accent2: string; inverse: string; soft: string }> = {
  fantasy: {
    label: "Fantasy",
    vibe: "Arcane parchment, heroic progress, golden quest energy.",
    bg: "#f4ecd8",
    panel: "#fffaf0",
    text: "#28190b",
    muted: "#7c674a",
    line: "#d8c49a",
    accent: "#b7791f",
    accent2: "#2f855a",
    inverse: "#241506",
    soft: "#eadbb6",
  },
  edgy: {
    label: "Edgy",
    vibe: "Black glass, neon pressure, sharp execution.",
    bg: "#111113",
    panel: "#1c1c20",
    text: "#f7f7fb",
    muted: "#a3a3ad",
    line: "#33333a",
    accent: "#ef4444",
    accent2: "#a855f7",
    inverse: "#f7f7fb",
    soft: "#27272f",
  },
  anime: {
    label: "Anime",
    vibe: "Electric color, bright cards, dramatic level-ups.",
    bg: "#edf2ff",
    panel: "#ffffff",
    text: "#172554",
    muted: "#64748b",
    line: "#c7d2fe",
    accent: "#7c3aed",
    accent2: "#06b6d4",
    inverse: "#172554",
    soft: "#e0e7ff",
  },
  cute: {
    label: "Cute",
    vibe: "Soft candy focus, friendly pressure, cozy wins.",
    bg: "#fff1f8",
    panel: "#ffffff",
    text: "#4a1932",
    muted: "#9f5679",
    line: "#f9cfe2",
    accent: "#ec4899",
    accent2: "#f59e0b",
    inverse: "#831843",
    soft: "#ffe4f0",
  },
  professional: {
    label: "Professional",
    vibe: "Clean planning, executive clarity, calm momentum.",
    bg: "#f5f7f8",
    panel: "#ffffff",
    text: "#111827",
    muted: "#64748b",
    line: "#d8dee6",
    accent: "#2563eb",
    accent2: "#059669",
    inverse: "#111827",
    soft: "#e9eef5",
  },
};

const defaultSkillLabels: Record<Area, string> = {
  Career: "Career",
  Fitness: "Fitness",
  Learning: "Learning",
  Money: "Money",
  Business: "Business",
  Relationships: "Relationships",
  Health: "Health",
  Creativity: "Creativity",
};

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function todayKey() {
  return toDateKey(new Date());
}

function getMonday(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  return copy;
}

function isWithinWeek(dateKey: string, today: string) {
  const date = parseDateKey(dateKey);
  const monday = getMonday(parseDateKey(today));
  const sunday = addDays(monday, 6);
  return date >= monday && date <= sunday;
}

function isPast(dateKey: string, today: string) {
  return dateKey < today;
}

function formatShortDate(dateKey: string) {
  return parseDateKey(dateKey).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function monthMatrix(date: Date) {
  const start = startOfMonth(date);
  const gridStart = addDays(start, -start.getDay());
  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
}

function levelFromXp(xp: number) {
  return Math.min(10, Math.floor(xp / 160) + 1);
}

function xpForQuest(quest: Quest) {
  let xp = 10;
  if (quest.focus) xp += 25;
  if (quest.hardFirst) xp += 20;
  if (quest.priority === "Critical") xp += 15;
  return xp;
}

function coinForQuest(quest: Quest) {
  return Math.max(10, quest.energy * 12 + Math.round(quest.hours * 8));
}

function looksLikeUrl(value: string) {
  return /^https?:\/\//i.test(value.trim());
}

function mapSearchQuery(quest: Quest) {
  if (quest.address && !looksLikeUrl(quest.address)) return quest.address;
  if (quest.googleMapsUrl && !looksLikeUrl(quest.googleMapsUrl)) return quest.googleMapsUrl;
  return `${quest.title} ${quest.project}`.trim();
}

function googleMapEmbedUrl(quest?: Quest) {
  if (!quest) return "";
  const query = mapSearchQuery(quest);
  return query ? `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed` : "";
}

function googleBusinessProfileUrl(quest: Quest) {
  if (quest.googleMapsUrl && looksLikeUrl(quest.googleMapsUrl)) return quest.googleMapsUrl;
  if (quest.address && looksLikeUrl(quest.address)) return quest.address;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapSearchQuery(quest))}`;
}

function activityDateFromQuest(quest: Pick<Quest, "dueDate" | "scheduledBlock">) {
  const time = quest.scheduledBlock || "09:00";
  return new Date(`${quest.dueDate}T${time}:00`).toISOString();
}

function coopQuestToPlannerQuest(quest: ApiCoopQuest): Quest {
  const date = new Date(quest.activityDate);
  const dueDate = toDateKey(date);
  const scheduledBlock = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  const creatorHandle = quest.creator.username && quest.creator.tag ? `${quest.creator.username}#${quest.creator.tag}` : quest.creator.name ?? "Co-op creator";
  const inviteHandles = quest.participants
    .map((participant) => participant.user.username && participant.user.tag ? `${participant.user.username}#${participant.user.tag}` : participant.user.name)
    .filter(Boolean)
    .join(", ");

  return {
    id: `coop-${quest.id}`,
    coopQuestId: quest.id,
    title: quest.title,
    project: "COOP Quest",
    goal: "Show up together",
    area: "Relationships",
    type: "Normal task",
    energy: 2,
    hours: 1,
    dueDate,
    priority: "High",
    status: quest.status === "COMPLETED" ? "done" : "active",
    bossDamage: 10,
    createdAt: quest.activityDate,
    scheduledBlock,
    notes: quest.description,
    isCoop: true,
    coopCreatorHandle: creatorHandle,
    coopParticipantStatus: quest.currentUserParticipantStatus ?? undefined,
    address: quest.address,
    googleMapsUrl: quest.googleMapsUrl,
    inviteHandles,
  };
}

function makeSeedState(): PlannerState {
  return {
    quests: [],
    xp: 0,
    coins: 0,
    streak: 0,
    shields: 2,
    bossName: "Weekly Boss",
    bossHp: 100,
    dailyEnergy: 10,
    availableHours: 5,
    theme: "fantasy",
    skillLabels: defaultSkillLabels,
    challengeDone: false,
  };
}

function prioritySort(quests: Quest[], today: string, dailyEnergy: number) {
  return [...quests].sort((a, b) => {
    const aToday = a.dueDate === today ? 1 : 0;
    const bToday = b.dueDate === today ? 1 : 0;
    if (aToday !== bToday) return bToday - aToday;
    const aWeek = isWithinWeek(a.dueDate, today) ? 1 : 0;
    const bWeek = isWithinWeek(b.dueDate, today) ? 1 : 0;
    if (aWeek !== bWeek) return bWeek - aWeek;
    if (priorityWeight[a.priority] !== priorityWeight[b.priority]) return priorityWeight[b.priority] - priorityWeight[a.priority];
    const aFit = a.energy <= dailyEnergy ? 1 : 0;
    const bFit = b.energy <= dailyEnergy ? 1 : 0;
    if (aFit !== bFit) return bFit - aFit;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

function ProgressBar({ value, color }: { value: number; color?: string }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-black/10">
      <motion.div
        className="h-full rounded-full"
        style={{ background: color ?? "var(--accent)" }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      />
    </div>
  );
}

function Section({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn("rounded-lg border p-5 shadow-sm", className)} style={{ background: "var(--panel)", borderColor: "var(--line)" }}>{children}</section>;
}

function SkillTreeGraph({
  skills,
  labels,
}: {
  skills: Array<{ area: Area; xp: number; level: number; progress: number }>;
  labels: Record<Area, string>;
}) {
  const center = 150;
  const maxRadius = 104;
  const points = skills.map((skill, index) => {
    const angle = -Math.PI / 2 + (index / skills.length) * Math.PI * 2;
    const radius = Math.min(maxRadius, 22 + Math.min(1, skill.xp / 400) * 82);
    return {
      ...skill,
      angle,
      x: center + Math.cos(angle) * radius,
      y: center + Math.sin(angle) * radius,
      labelX: center + Math.cos(angle) * 130,
      labelY: center + Math.sin(angle) * 130,
      axisX: center + Math.cos(angle) * maxRadius,
      axisY: center + Math.sin(angle) * maxRadius,
    };
  });
  const polygon = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <div className="rounded-lg border p-4" style={{ borderColor: "var(--line)", background: "var(--soft)" }}>
      <svg viewBox="0 0 300 300" className="mx-auto aspect-square w-full max-w-[430px] overflow-visible">
        {[0.25, 0.5, 0.75, 1].map((ring) => (
          <polygon
            key={ring}
            points={skills
              .map((_, index) => {
                const angle = -Math.PI / 2 + (index / skills.length) * Math.PI * 2;
                return `${center + Math.cos(angle) * maxRadius * ring},${center + Math.sin(angle) * maxRadius * ring}`;
              })
              .join(" ")}
            fill="none"
            stroke="var(--line)"
            strokeWidth="1.4"
          />
        ))}
        {points.map((point) => (
          <line key={point.area} x1={center} y1={center} x2={point.axisX} y2={point.axisY} stroke="var(--line)" strokeWidth="1" />
        ))}
        <motion.polygon
          points={polygon}
          fill="var(--accent)"
          fillOpacity="0.28"
          stroke="var(--accent)"
          strokeWidth="3"
          initial={{ opacity: 0, scale: 0.9, transformOrigin: "150px 150px" }}
          animate={{ opacity: 1, scale: 1 }}
        />
        {points.map((point) => (
          <g key={point.area}>
            <circle cx={point.x} cy={point.y} r="6" fill={areaAccent[point.area]} stroke="var(--panel)" strokeWidth="3" />
            <text x={point.labelX} y={point.labelY} textAnchor="middle" dominantBaseline="middle" fill="var(--text)" fontSize="10" fontWeight="800">
              {labels[point.area]}
            </text>
            <text x={point.labelX} y={point.labelY + 12} textAnchor="middle" dominantBaseline="middle" fill="var(--muted)" fontSize="9" fontWeight="800">
              Lv {point.level}
            </text>
          </g>
        ))}
      </svg>
      <p className="mt-2 text-center text-sm font-bold" style={{ color: "var(--muted)" }}>
        Skill-web adeptness graph. Complete quests to push each vertex outward.
      </p>
    </div>
  );
}

function QuestCard({
  quest,
  today,
  top3Count,
  onComplete,
  onRemove,
  onReschedule,
  onToggleTop3,
  onEdit,
}: {
  quest: Quest;
  today: string;
  top3Count: number;
  onComplete: (quest: Quest) => void;
  onRemove: (quest: Quest) => void;
  onReschedule: (quest: Quest) => void;
  onToggleTop3: (quest: Quest) => void;
  onEdit: (quest: Quest) => void;
}) {
  const isOld = isPast(quest.dueDate, today);
  const canTop3 = quest.dueDate === today && (quest.top3 || top3Count < 3);
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      whileHover={{ y: -3 }}
      className="rounded-lg border p-4"
      style={{ background: "var(--soft)", borderColor: "var(--line)" }}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: areaAccent[quest.area] }} />
            <span className="text-xs font-black uppercase" style={{ color: "var(--muted)" }}>{quest.area}</span>
            <span className="rounded-md px-2 py-1 text-xs font-bold" style={{ background: "var(--panel)", color: "var(--text)" }}>{quest.type}</span>
            <span className="rounded-md px-2 py-1 text-xs font-black text-white" style={{ background: quest.priority === "Critical" ? "#dc2626" : "var(--accent)" }}>{quest.priority}</span>
            {quest.top3 ? <span className="rounded-md px-2 py-1 text-xs font-black" style={{ background: "var(--accent2)", color: "white" }}>Top 3</span> : null}
            {isOld ? <span className="rounded-md bg-black/10 px-2 py-1 text-xs font-black">Calendar only</span> : null}
          </div>
          <h3 className="mt-2 text-lg font-black">{quest.title}</h3>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>{quest.project} {"->"} {quest.goal}</p>
          {quest.notes ? <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>{quest.notes}</p> : null}
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
            <span className="inline-flex items-center gap-1 rounded-md border px-2 py-1" style={{ background: "var(--panel)", borderColor: "var(--line)" }}><BatteryCharging className="h-3.5 w-3.5" />{quest.energy} energy</span>
            <span className="inline-flex items-center gap-1 rounded-md border px-2 py-1" style={{ background: "var(--panel)", borderColor: "var(--line)" }}><Clock3 className="h-3.5 w-3.5" />{quest.hours}h</span>
            <span className="inline-flex items-center gap-1 rounded-md border px-2 py-1" style={{ background: "var(--panel)", borderColor: "var(--line)" }}><CalendarDays className="h-3.5 w-3.5" />{formatShortDate(quest.dueDate)}</span>
            <span className="inline-flex items-center gap-1 rounded-md border px-2 py-1" style={{ background: "var(--panel)", borderColor: "var(--line)" }}><Swords className="h-3.5 w-3.5" />{quest.bossDamage} damage</span>
            {quest.scheduledBlock ? <span className="inline-flex items-center gap-1 rounded-md border px-2 py-1" style={{ background: "var(--panel)", borderColor: "var(--line)" }}><Target className="h-3.5 w-3.5" />{quest.scheduledBlock}</span> : null}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onToggleTop3(quest)}
            disabled={!canTop3}
            className="h-10 rounded-md border px-3 text-xs font-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
            style={{ borderColor: "var(--line)", background: quest.top3 ? "var(--accent2)" : "var(--panel)", color: quest.top3 ? "white" : "var(--text)" }}
          >
            Top 3
          </button>
          <button type="button" onClick={() => onReschedule(quest)} className="grid h-10 w-10 place-items-center rounded-md border transition hover:-translate-y-0.5" style={{ borderColor: "var(--line)", background: "var(--panel)" }} title="Move to tomorrow">
            <RefreshCcw className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => onEdit(quest)} className="h-10 rounded-md border px-3 text-xs font-black transition hover:-translate-y-0.5" style={{ borderColor: "var(--line)", background: "var(--panel)" }}>
            Edit
          </button>
          <button type="button" onClick={() => onRemove(quest)} className="grid h-10 w-10 place-items-center rounded-md border transition hover:-translate-y-0.5" style={{ borderColor: "var(--line)", background: "var(--panel)" }} title="Remove quest">
            <Trash2 className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => onComplete(quest)} className="inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-black text-white transition hover:-translate-y-0.5" style={{ background: "var(--inverse)" }}>
            <Check className="h-4 w-4" />
            Complete
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export default function Home({ accountId }: { accountId: string }) {
  const storageKey = useMemo(() => plannerStorageKey(accountId), [accountId]);
  const [today, setToday] = useState(todayKey());
  const [state, setState] = useState<PlannerState>(() => makeSeedState());
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [selectedArea, setSelectedArea] = useState<Area | "All">("All");
  const [calendarMonth, setCalendarMonth] = useState(() => startOfMonth(new Date()));
  const [toast, setToast] = useState("Momentum chain active");
  const [removedQuest, setRemovedQuest] = useState<Quest | null>(null);
  const [showIntro, setShowIntro] = useState(() => (typeof window === "undefined" ? false : window.sessionStorage.getItem("level-up-show-intro") === "1"));
  const [hasLoaded, setHasLoaded] = useState(false);
  const [editingQuestId, setEditingQuestId] = useState<Quest["id"] | null>(null);
  const [showInvitePicker, setShowInvitePicker] = useState(false);
  const [friendSearch, setFriendSearch] = useState("");
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [selectedCoopQuestId, setSelectedCoopQuestId] = useState<Quest["id"] | null>(null);
  const [draft, setDraft] = useState<DraftQuest>(() => ({
    title: "",
    project: "Website homepage",
    goal: "Launch a polished personal site",
    area: "Business",
    type: "Normal task",
    hours: "1",
    dueDate: todayKey(),
    priority: "Medium",
    scheduledBlock: "09:00",
    bossDamage: "10",
    notes: "",
    isCoop: false,
    address: "",
    googleMapsUrl: "",
    inviteHandles: "",
  }));

  useEffect(() => {
    let cancelled = false;
    async function loadPlannerState() {
      const currentToday = todayKey();
      setToday(currentToday);
      setDraft((current) => ({ ...current, dueDate: current.dueDate || currentToday }));
      try {
        const response = await fetch("/api/planner-state");
        const payload = await response.json();
        const saved = payload.state ?? null;
        const localSaved = window.localStorage.getItem(storageKey) ?? window.localStorage.getItem("lifequest-planner-v3");
        if (cancelled) return;
        if (saved || localSaved) {
          const parsed = (saved ?? JSON.parse(localSaved ?? "{}")) as Partial<PlannerState>;
          const fallback = makeSeedState();
          setState({
            ...fallback,
            ...parsed,
            skillLabels: { ...fallback.skillLabels, ...parsed.skillLabels },
          });
        }
      } catch {
        const localSaved = window.localStorage.getItem(storageKey);
        if (localSaved) {
          try {
            const parsed = JSON.parse(localSaved) as Partial<PlannerState>;
            const fallback = makeSeedState();
            setState({ ...fallback, ...parsed, skillLabels: { ...fallback.skillLabels, ...parsed.skillLabels } });
          } catch {
            setToast("Planner data could not load, so a fresh planner is active.");
          }
        } else {
          setToast("Planner data could not load, so a fresh planner is active.");
        }
      } finally {
        if (!cancelled) setHasLoaded(true);
      }
    }
    void loadPlannerState();
    return () => {
      cancelled = true;
    };
  }, [storageKey]);

  useEffect(() => {
    let cancelled = false;
    async function loadFriends() {
      try {
        const response = await fetch("/api/friends");
        const payload = await response.json();
        if (!cancelled) setFriends(payload.friends ?? []);
      } catch {
        if (!cancelled) setFriends([]);
      }
    }
    void loadFriends();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;
    let cancelled = false;
    async function loadSharedCoopQuests() {
      try {
        const response = await fetch("/api/coop-quests");
        const payload = await response.json();
        if (!response.ok || cancelled) return;
        const sharedQuests = ((payload.quests ?? []) as ApiCoopQuest[]).map(coopQuestToPlannerQuest);
        const sharedIds = new Set(sharedQuests.map((quest) => quest.coopQuestId));
        setState((current) => ({
          ...current,
          quests: [
            ...current.quests.filter((quest) => !quest.coopQuestId || !sharedIds.has(quest.coopQuestId)),
            ...sharedQuests,
          ],
        }));
      } catch {
        if (!cancelled) setToast("Shared co-op quests could not sync yet.");
      }
    }
    void loadSharedCoopQuests();
    return () => {
      cancelled = true;
    };
  }, [hasLoaded]);

  useEffect(() => {
    if (!hasLoaded) return;
    window.localStorage.setItem(storageKey, JSON.stringify(state));
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void fetch("/api/planner-state", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
        signal: controller.signal,
      }).catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setToast("Planner changes are saved locally, but cloud sync failed.");
      });
    }, 350);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [hasLoaded, state, storageKey]);

  const theme = themes[state.theme];
  const level = levelFromXp(state.xp);
  const nextLevelXp = level * 160;
  const previousLevelXp = (level - 1) * 160;
  const levelProgress = level === 10 ? 100 : ((state.xp - previousLevelXp) / (nextLevelXp - previousLevelXp)) * 100;
  const activeQuests = state.quests.filter((quest) => quest.status === "active");
  const currentQuests = activeQuests.filter((quest) => !isPast(quest.dueDate, today));
  const todayQuests = currentQuests.filter((quest) => quest.dueDate === today);
  const weekQuests = currentQuests.filter((quest) => quest.dueDate !== today && isWithinWeek(quest.dueDate, today));
  const plannerQuests = prioritySort(currentQuests, today, state.dailyEnergy).filter((quest) => selectedArea === "All" || quest.area === selectedArea);
  const doneQuests = state.quests.filter((quest) => quest.status === "done");
  const top3Count = todayQuests.filter((quest) => quest.top3).length;
  const plannedEnergy = todayQuests.reduce((sum, quest) => sum + quest.energy, 0);
  const plannedHours = todayQuests.reduce((sum, quest) => sum + quest.hours, 0);
  const bossProgress = 100 - state.bossHp;

  const projects = useMemo(() => {
    const projectMap = new Map<string, { name: string; goal: string; area: Area; progress: number; deadline: string; total: number; done: number }>();
    state.quests.forEach((quest) => {
      const existing = projectMap.get(quest.project) ?? {
        name: quest.project,
        goal: quest.goal,
        area: quest.area,
        deadline: quest.dueDate,
        progress: 0,
        total: 0,
        done: 0,
      };
      existing.total += 1;
      if (quest.status === "done") existing.done += 1;
      if (quest.dueDate > existing.deadline) existing.deadline = quest.dueDate;
      existing.progress = Math.round((existing.done / existing.total) * 100);
      projectMap.set(quest.project, existing);
    });
    return Array.from(projectMap.values());
  }, [state.quests]);

  const skillXp = useMemo(() => {
    return areas.map((area) => {
      const total = state.quests
        .filter((quest) => quest.area === area && quest.status === "done")
        .reduce((sum, quest) => sum + xpForQuest(quest), 0);
      return { area, xp: total, level: Math.floor(total / 80) + 1, progress: total % 80 };
    });
  }, [state.quests]);

  const calendarDays = monthMatrix(calendarMonth);
  const calendarYear = calendarMonth.getFullYear();
  const calendarMonthLabel = calendarMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const coopQuests = useMemo(() => {
    return state.quests
      .filter((quest) => quest.isCoop && quest.status === "active" && !isPast(quest.dueDate, today))
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.scheduledBlock.localeCompare(b.scheduledBlock) || a.createdAt.localeCompare(b.createdAt));
  }, [state.quests, today]);
  const selectedCoopQuest = coopQuests.find((quest) => quest.id === selectedCoopQuestId) ?? coopQuests[0];
  const mapPreviewUrl = googleMapEmbedUrl(selectedCoopQuest);
  const selectedInviteHandles = draft.inviteHandles.split(",").map((item) => item.trim()).filter(Boolean);
  const filteredFriends = friends.filter((friend) => {
    const handle = `${friend.username ?? ""}#${friend.tag ?? ""}`.toLowerCase();
    const name = (friend.name ?? "").toLowerCase();
    const query = friendSearch.toLowerCase();
    return !query || handle.includes(query) || name.includes(query);
  });

  function patchState(patch: Partial<PlannerState>) {
    setState((current) => ({ ...current, ...patch }));
  }

  function updateQuest(id: Quest["id"], patch: Partial<Quest>) {
    patchState({ quests: state.quests.map((quest) => (quest.id === id ? { ...quest, ...patch } : quest)) });
  }

  function completeQuest(quest: Quest) {
    const gainedXp = xpForQuest(quest);
    const gainedCoins = coinForQuest(quest);
    patchState({
      quests: state.quests.map((item) => (item.id === quest.id ? { ...item, status: "done", top3: false } : item)),
      xp: state.xp + gainedXp,
      coins: state.coins + gainedCoins,
      bossHp: Math.max(0, state.bossHp - quest.bossDamage),
      streak: doneQuests.length === 0 ? state.streak + 1 : state.streak,
    });
    setRemovedQuest(null);
    setToast(`+${gainedXp} XP, +${gainedCoins} coins. ${quest.title} is complete.`);
  }

  function moveToTomorrow(quest: Quest) {
    updateQuest(quest.id, { dueDate: toDateKey(addDays(parseDateKey(today), 1)), status: "active" });
    patchState({ xp: state.xp + 5 });
    setRemovedQuest(null);
    setToast("+5 XP for rescheduling instead of abandoning.");
  }

  function toggleTop3(quest: Quest) {
    if (quest.dueDate !== today) {
      setRemovedQuest(null);
      setToast("Top 3 is only for quests due today.");
      return;
    }
    if (!quest.top3 && top3Count >= 3) {
      setRemovedQuest(null);
      setToast("Top 3 is full. Remove one before adding another.");
      return;
    }
    updateQuest(quest.id, { top3: !quest.top3 });
    setRemovedQuest(null);
    setToast(quest.top3 ? "Removed from Top 3." : "Locked into today's Top 3.");
  }

  async function syncCoopQuest(quest: Quest) {
    if (!quest.isCoop) return quest;
    const handles = (quest.inviteHandles ?? "").split(",").map((item) => item.trim()).filter(Boolean);
    const response = await fetch("/api/coop-quests", {
      method: quest.coopQuestId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: quest.coopQuestId,
        title: quest.title,
        description: quest.notes ?? "",
        activityDate: activityDateFromQuest(quest),
        address: quest.address ?? "",
        googleMapsUrl: quest.googleMapsUrl ?? "",
        handles,
      }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setToast(payload.error ?? "Co-op invite sync failed.");
      return quest;
    }
    return { ...quest, coopQuestId: payload.quest.id };
  }

  async function refreshSharedCoopQuests() {
    const response = await fetch("/api/coop-quests");
    const payload = await response.json();
    if (!response.ok) return;
    const sharedQuests = ((payload.quests ?? []) as ApiCoopQuest[]).map(coopQuestToPlannerQuest);
    const sharedIds = new Set(sharedQuests.map((quest) => quest.coopQuestId));
    setState((current) => ({
      ...current,
      quests: [
        ...current.quests.filter((quest) => !quest.coopQuestId || !sharedIds.has(quest.coopQuestId)),
        ...sharedQuests,
      ],
    }));
  }

  async function addQuest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.title.trim()) return;
    const type = draft.type;
    const questPatch: Omit<Quest, "id" | "createdAt"> = {
      title: draft.title.trim(),
      project: draft.project.trim() || "Personal sprint",
      goal: draft.goal.trim() || "Build momentum",
      area: draft.area,
      type,
      energy: typeEnergy[type],
      hours: Number(draft.hours) || 1,
      dueDate: draft.dueDate || today,
      priority: draft.priority,
      status: "active",
      bossDamage: Number(draft.bossDamage) || 10,
      scheduledBlock: draft.scheduledBlock,
      notes: draft.notes.trim(),
      focus: type === "Deep work" || type === "Hard creative work",
      hardFirst: type === "Hard creative work",
      isCoop: draft.isCoop,
      address: draft.isCoop ? draft.address.trim() : "",
      googleMapsUrl: draft.isCoop ? draft.googleMapsUrl.trim() : "",
      inviteHandles: draft.isCoop ? draft.inviteHandles.trim() : "",
    };
    const existingQuest = editingQuestId ? state.quests.find((quest) => quest.id === editingQuestId) : null;
    const nextQuest: Quest = existingQuest
      ? { ...existingQuest, ...questPatch }
      : { id: `local-${Date.now()}`, createdAt: new Date().toISOString(), ...questPatch };
    const syncedQuest = await syncCoopQuest(nextQuest);
    patchState({ quests: editingQuestId ? state.quests.map((quest) => (quest.id === editingQuestId ? syncedQuest : quest)) : [syncedQuest, ...state.quests] });
    if (syncedQuest.isCoop) void refreshSharedCoopQuests();
    setDraft((current) => ({ ...current, title: "", notes: "", address: "", googleMapsUrl: "", inviteHandles: "" }));
    setEditingQuestId(null);
    setRemovedQuest(null);
    setToast(editingQuestId ? "Quest updated." : syncedQuest.isCoop ? "Co-op invite sent. Friends will see it in COOP after accepting/refreshing." : isPast(syncedQuest.dueDate, today) ? "Quest added to Calendar history." : "Quest added to the planner.");
  }

  function editQuest(quest: Quest) {
    if (quest.coopParticipantStatus) {
      setActiveTab("coop");
      setToast("Only the co-op creator can edit invites or location.");
      return;
    }
    setActiveTab("planner");
    setEditingQuestId(quest.id);
    setDraft({
      title: quest.title,
      project: quest.project,
      goal: quest.goal,
      area: quest.area,
      type: quest.type,
      hours: String(quest.hours),
      dueDate: quest.dueDate,
      priority: quest.priority,
      scheduledBlock: quest.scheduledBlock,
      bossDamage: String(quest.bossDamage),
      notes: quest.notes ?? "",
      isCoop: Boolean(quest.isCoop),
      address: quest.address ?? "",
      googleMapsUrl: quest.googleMapsUrl ?? "",
      inviteHandles: quest.inviteHandles ?? "",
    });
    setToast(`Editing "${quest.title}".`);
  }

  function cancelEdit() {
    setEditingQuestId(null);
    setDraft((current) => ({ ...current, title: "", notes: "", address: "", googleMapsUrl: "", inviteHandles: "", isCoop: false }));
    setToast("Edit cancelled.");
  }

  function addInviteHandle(handle: string) {
    const handles = draft.inviteHandles.split(",").map((item) => item.trim()).filter(Boolean);
    if (handles.includes(handle)) return;
    setDraft({ ...draft, inviteHandles: [...handles, handle].join(", ") });
  }

  function removeInviteHandle(handle: string) {
    const handles = draft.inviteHandles.split(",").map((item) => item.trim()).filter(Boolean).filter((item) => item !== handle);
    setDraft({ ...draft, inviteHandles: handles.join(", ") });
  }

  function removeQuest(quest: Quest) {
    patchState({ quests: state.quests.filter((item) => item.id !== quest.id) });
    setRemovedQuest(quest);
    setToast(`Removed "${quest.title}".`);
  }

  async function respondToCoopInvite(quest: Quest, action: "accept" | "decline") {
    if (!quest.coopQuestId) return;
    const response = await fetch("/api/coop-quests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: quest.coopQuestId, action }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setToast(payload.error ?? "Could not update co-op invite.");
      return;
    }
    if (action === "decline") {
      patchState({ quests: state.quests.filter((item) => item.id !== quest.id) });
      setToast("Co-op invite declined.");
      return;
    }
    updateQuest(quest.id, { coopParticipantStatus: "ACCEPTED" });
    setToast("Co-op invite accepted.");
  }

  function undoRemoveQuest() {
    if (!removedQuest) return;
    patchState({ quests: [removedQuest, ...state.quests] });
    setToast(`Restored "${removedQuest.title}".`);
    setRemovedQuest(null);
  }

  function finishIntro() {
    window.sessionStorage.removeItem("level-up-show-intro");
    setActiveTab("dashboard");
    setShowIntro(false);
  }

  const tabs: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
    { id: "dashboard", label: "Dashboard", icon: <Zap className="h-4 w-4" /> },
    { id: "planner", label: "Planner", icon: <ListChecks className="h-4 w-4" /> },
    { id: "coop", label: "COOP", icon: <Users className="h-4 w-4" /> },
    { id: "tracking", label: "Tracking", icon: <Layers3 className="h-4 w-4" /> },
  ];

  const appStyle = {
    "--bg": theme.bg,
    "--panel": theme.panel,
    "--text": theme.text,
    "--muted": theme.muted,
    "--line": theme.line,
    "--accent": theme.accent,
    "--accent2": theme.accent2,
    "--inverse": theme.inverse,
    "--soft": theme.soft,
  } as React.CSSProperties;

  return (
    <main className="min-h-screen" style={{ ...appStyle, background: "var(--bg)", color: "var(--text)" }}>
      <AnimatePresence>
        {showIntro ? (
          <motion.section
            className="fixed inset-0 z-[80] bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, times: [0, 0.12, 0.82, 1] }}
            onAnimationComplete={finishIntro}
          >
            <motion.div
              className="relative h-screen w-screen overflow-hidden bg-[#1f130d]"
              initial={{ scale: 1.04 }}
              animate={{ scale: 1 }}
              exit={{ scale: 1.02 }}
            >
              <div className="absolute inset-0 opacity-35 blur-sm scale-105">
                <Image src="/quest-time-intro.png" alt="" fill priority className="object-cover" sizes="100vw" />
              </div>
              <div className="relative h-full w-full">
                <Image src="/quest-time-intro.png" alt="Quest Time pixel-art intro scene" fill priority className="object-contain" sizes="100vw" />
              </div>
              <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 bg-gradient-to-t from-black/80 via-black/45 to-transparent p-5 sm:p-8">
                <div className="text-white">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-200">LifeQuest boot sequence</p>
                  <h2 className="mt-1 text-2xl font-black sm:text-5xl">Quest time</h2>
                  <div className="mt-4 h-3 w-56 overflow-hidden rounded-full border-2 border-[#1f130d] bg-white/80 shadow-[3px_3px_0_#1f130d]">
                    <motion.div className="h-full bg-yellow-300" initial={{ width: "8%" }} animate={{ width: "100%" }} transition={{ duration: 1.65, ease: "easeInOut" }} />
                  </div>
                </div>
                <div className="rounded-md border-2 border-[#1f130d] bg-yellow-300 px-4 py-2 text-sm font-black text-[#1f130d] shadow-[4px_4px_0_#1f130d]">
                  Loading planner...
                </div>
              </div>
            </motion.div>
          </motion.section>
        ) : null}
      </AnimatePresence>
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <header className="overflow-hidden rounded-lg border shadow-xl" style={{ background: "var(--inverse)", borderColor: "var(--line)", color: "var(--panel)" }}>
          <div className="grid gap-6 p-5 lg:grid-cols-[1.15fr_0.85fr] lg:p-8">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-md px-3 py-1 text-xs font-black uppercase" style={{ background: "var(--panel)", color: "var(--text)" }}>
                  <Sparkles className="h-3.5 w-3.5" />
                  LifeQuest
                </span>
                <span className="rounded-md border border-white/25 px-3 py-1 text-xs font-bold text-white/80">{theme.label} mode</span>
              </div>
              <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">Plan the week. Protect the chain.</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/75">
                Your dashboard shows what matters now. Build the real plan in one intuitive Planner view with a queue and full-year calendar side by side.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={() => setActiveTab("planner")} className="inline-flex h-11 items-center gap-2 rounded-md px-4 text-sm font-black text-white transition hover:-translate-y-0.5" style={{ background: "var(--accent)" }}>
                  <Target className="h-4 w-4" />
                  Plan quests
                </button>
                <button onClick={() => setActiveTab("planner")} className="inline-flex h-11 items-center gap-2 rounded-md border border-white/30 px-4 text-sm font-bold text-white transition hover:-translate-y-0.5">
                  <CalendarDays className="h-4 w-4" />
                  Planner calendar
                </button>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-[0.78fr_1fr] lg:grid-cols-1 xl:grid-cols-[0.78fr_1fr]">
              <div className="rounded-lg border border-white/15 bg-white/10 p-5">
                <p className="text-sm font-bold uppercase text-white/70">Tracking focus</p>
                <p className="mt-1 text-3xl font-black">{doneQuests.length}</p>
                <p className="mt-1 text-sm text-white/70">completed quests logged</p>
                <div className="mt-5 space-y-3">
                  {skillXp
                    .slice()
                    .sort((a, b) => b.xp - a.xp)
                    .slice(0, 3)
                    .map((skill) => (
                      <div key={skill.area}>
                        <div className="mb-1 flex items-center justify-between text-xs font-black text-white/75">
                          <span>{state.skillLabels[skill.area]}</span>
                          <span>Lv {skill.level}</span>
                        </div>
                        <ProgressBar value={(skill.progress / 80) * 100} color={areaAccent[skill.area]} />
                      </div>
                    ))}
                </div>
              </div>
              <div className="rounded-lg border border-white/15 bg-white/10 p-5">
                <p className="text-sm font-bold uppercase text-white/70">Current identity</p>
                <p className="mt-1 text-3xl font-black">{levelTitles[level - 1]}</p>
                <p className="mt-1 text-sm text-white/70">Level {level} / 10</p>
                <div className="mt-5">
                  <div className="mb-2 flex justify-between text-sm text-white/70">
                    <span>{state.xp} XP</span>
                    <span>{level === 10 ? "Max level" : `${nextLevelXp - state.xp} XP to next`}</span>
                  </div>
                  <ProgressBar value={levelProgress} color="var(--accent2)" />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-md bg-white/10 p-3"><Flame className="h-4 w-4" /><p className="mt-2 text-xl font-black">{state.streak}</p><p className="text-xs text-white/60">chain</p></div>
                  <div className="rounded-md bg-white/10 p-3"><Shield className="h-4 w-4" /><p className="mt-2 text-xl font-black">{state.shields}</p><p className="text-xs text-white/60">shields</p></div>
                  <div className="rounded-md bg-white/10 p-3"><Coins className="h-4 w-4" /><p className="mt-2 text-xl font-black">{state.coins}</p><p className="text-xs text-white/60">coins</p></div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <nav className="sticky top-2 z-40 flex gap-2 overflow-x-auto rounded-lg border p-2 shadow-sm backdrop-blur" style={{ background: "color-mix(in srgb, var(--panel) 88%, transparent)", borderColor: "var(--line)" }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-black transition hover:-translate-y-0.5"
              style={{ background: activeTab === tab.id ? "var(--inverse)" : "transparent", color: activeTab === tab.id ? "var(--panel)" : "var(--text)" }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        <AnimatePresence mode="wait">
          <motion.div
            key={toast}
            className="fixed bottom-5 left-1/2 z-50 w-[min(92vw,560px)] -translate-x-1/2 rounded-lg border px-4 py-3 text-sm font-bold shadow-2xl"
            style={{ background: "var(--panel)", borderColor: "var(--inverse)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <span>{toast}</span>
            {removedQuest ? (
              <button
                type="button"
                onClick={undoRemoveQuest}
                className="ml-3 inline-flex h-8 items-center gap-2 rounded-md px-3 text-xs font-black text-white"
                style={{ background: "var(--inverse)" }}
              >
                <Undo2 className="h-3.5 w-3.5" />
                Undo
              </button>
            ) : null}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {showInvitePicker ? (
            <motion.div className="fixed inset-0 z-[70] grid place-items-center bg-black/55 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.section className="w-full max-w-2xl rounded-lg border p-5 shadow-2xl" style={{ background: "var(--panel)", borderColor: "var(--line)" }} initial={{ y: 16, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 16, scale: 0.98 }}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase" style={{ color: "var(--muted)" }}>Invite friends</p>
                    <h2 className="mt-1 text-2xl font-black">Co-op quest team</h2>
                  </div>
                  <button type="button" onClick={() => setShowInvitePicker(false)} className="h-10 rounded-md border px-3 text-sm font-black" style={{ borderColor: "var(--line)" }}>Done</button>
                </div>
                <input value={friendSearch} onChange={(event) => setFriendSearch(event.target.value)} placeholder="Search friends" className="mt-5 h-11 w-full rounded-md border px-3 font-bold outline-none" style={{ borderColor: "var(--line)", background: "var(--soft)" }} />
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedInviteHandles.map((handle) => (
                    <button key={handle} type="button" onClick={() => removeInviteHandle(handle)} className="rounded-md px-3 py-1 text-xs font-black text-white" style={{ background: "var(--accent)" }}>{handle} x</button>
                  ))}
                  {selectedInviteHandles.length === 0 ? <p className="text-sm font-bold" style={{ color: "var(--muted)" }}>No one invited yet.</p> : null}
                </div>
                <div className="mt-4 max-h-80 space-y-2 overflow-y-auto pr-2">
                  {filteredFriends.slice(0, 50).map((friend) => {
                    const handle = `${friend.username}#${friend.tag}`;
                    const selected = selectedInviteHandles.includes(handle);
                    return (
                      <div key={friend.id} className="flex items-center justify-between gap-3 rounded-md border p-3" style={{ borderColor: "var(--line)", background: "var(--soft)" }}>
                        <div className="min-w-0">
                          <p className="truncate font-black">{handle}</p>
                          <p className="truncate text-sm" style={{ color: "var(--muted)" }}>{friend.name ?? "Friend"}</p>
                        </div>
                        <button type="button" onClick={() => selected ? removeInviteHandle(handle) : addInviteHandle(handle)} className="h-9 rounded-md px-3 text-xs font-black text-white" style={{ background: selected ? "var(--accent2)" : "var(--inverse)" }}>{selected ? "Invited" : "Invite"}</button>
                      </div>
                    );
                  })}
                  {friends.length === 0 ? <p className="rounded-md border border-dashed p-5 text-sm font-bold" style={{ borderColor: "var(--line)", color: "var(--muted)" }}>No friends yet. Add friends from the Social page first.</p> : null}
                </div>
              </motion.section>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {activeTab === "dashboard" ? (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">
              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Section><Zap className="h-5 w-5" /><p className="mt-4 text-xs font-bold uppercase" style={{ color: "var(--muted)" }}>XP earned</p><p className="mt-1 text-2xl font-black">{state.xp}</p><p className="text-sm" style={{ color: "var(--muted)" }}>{levelTitles[level - 1]} identity</p></Section>
                <Section><BatteryCharging className="h-5 w-5" /><p className="mt-4 text-xs font-bold uppercase" style={{ color: "var(--muted)" }}>Today energy</p><p className="mt-1 text-2xl font-black">{plannedEnergy}/{state.dailyEnergy}</p><p className="text-sm" style={{ color: "var(--muted)" }}>{plannedEnergy > state.dailyEnergy ? "Too much. Move quests." : "Realistic day."}</p></Section>
                <Section><Clock3 className="h-5 w-5" /><p className="mt-4 text-xs font-bold uppercase" style={{ color: "var(--muted)" }}>Today time</p><p className="mt-1 text-2xl font-black">{plannedHours}/{state.availableHours}h</p><p className="text-sm" style={{ color: "var(--muted)" }}>{plannedHours > state.availableHours ? "Overcommitted." : "Room to execute."}</p></Section>
                <Section><Trophy className="h-5 w-5" /><p className="mt-4 text-xs font-bold uppercase" style={{ color: "var(--muted)" }}>Top 3</p><p className="mt-1 text-2xl font-black">{top3Count}/3</p><p className="text-sm" style={{ color: "var(--muted)" }}>{top3Count === 3 ? "Locked for today." : "Choose your essentials."}</p></Section>
              </section>

              <section className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
                <Section>
                  <div className="flex items-center justify-between gap-3">
                    <div><p className="text-xs font-black uppercase" style={{ color: "var(--muted)" }}>Dashboard</p><h2 className="mt-1 text-2xl font-black">Urgent quests today</h2></div>
                    <Flag className="h-6 w-6" style={{ color: "var(--accent)" }} />
                  </div>
                  <div className="mt-5 space-y-3">
                    <AnimatePresence initial={false}>
                      {prioritySort(todayQuests, today, state.dailyEnergy).map((quest) => (
                        <QuestCard key={quest.id} quest={quest} today={today} top3Count={top3Count} onComplete={completeQuest} onRemove={removeQuest} onReschedule={moveToTomorrow} onToggleTop3={toggleTop3} onEdit={editQuest} />
                      ))}
                    </AnimatePresence>
                    {todayQuests.length === 0 ? <div className="rounded-lg border border-dashed p-6 text-sm font-bold" style={{ borderColor: "var(--line)", color: "var(--muted)" }}>No urgent quests for today. Add one in Planner when you are ready to execute.</div> : null}
                  </div>
                </Section>

                <div className="space-y-6">
                  <Section>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-black uppercase" style={{ color: "var(--muted)" }}>Weekly boss fight</p>
                        <input value={state.bossName} onChange={(event) => patchState({ bossName: event.target.value })} className="mt-1 w-full bg-transparent text-2xl font-black outline-none" />
                      </div>
                      <Swords className="h-6 w-6" style={{ color: "var(--accent)" }} />
                    </div>
                    <div className="mt-5 rounded-lg p-4" style={{ background: "var(--soft)" }}>
                      <div className="mb-2 flex justify-between text-sm font-black"><span>{bossProgress}% defeated</span><span>{state.bossHp} HP left</span></div>
                      <ProgressBar value={bossProgress} color="var(--accent)" />
                    </div>
                  </Section>

                  <Section>
                    <p className="text-xs font-black uppercase" style={{ color: "var(--muted)" }}>Due this week</p>
                    <h2 className="mt-1 text-xl font-black">Monday-Sunday quests</h2>
                    <div className="mt-4 space-y-3">
                      {prioritySort(weekQuests, today, state.dailyEnergy).map((quest) => (
                        <div key={quest.id} className="rounded-md border p-3" style={{ borderColor: "var(--line)", background: "var(--soft)" }}>
                          <div className="flex items-center justify-between gap-3"><p className="font-black">{quest.title}</p><span className="text-xs font-bold">{formatShortDate(quest.dueDate)}</span></div>
                          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>{quest.priority} priority / {quest.energy} energy</p>
                        </div>
                      ))}
                      {weekQuests.length === 0 ? <p className="text-sm font-bold" style={{ color: "var(--muted)" }}>No more current-week quests.</p> : null}
                    </div>
                  </Section>
                </div>
              </section>
            </motion.div>
          ) : null}

          {activeTab === "planner" ? (
            <motion.div key="planner" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">
              <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
                <Section>
                <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-black uppercase" style={{ color: "var(--muted)" }}>{editingQuestId ? "Edit quest" : "Create quest"}</p><h2 className="mt-1 text-2xl font-black">{editingQuestId ? "Update plan and invites" : "Plan and prioritize"}</h2></div>{editingQuestId ? <button type="button" onClick={cancelEdit} className="h-10 rounded-md border px-3 text-xs font-black" style={{ borderColor: "var(--line)" }}>Cancel</button> : <Plus className="h-6 w-6" />}</div>
                <form onSubmit={addQuest} className="mt-5 grid gap-3 sm:grid-cols-2">
                  <label className="sm:col-span-2"><span className="text-xs font-black uppercase" style={{ color: "var(--muted)" }}>Quest name</span><input className="mt-1 h-11 w-full rounded-md border px-3 outline-none" style={{ borderColor: "var(--line)", background: "var(--panel)" }} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Open new opportunity" /></label>
                  <label><span className="text-xs font-black uppercase" style={{ color: "var(--muted)" }}>Project</span><input className="mt-1 h-11 w-full rounded-md border px-3 outline-none" style={{ borderColor: "var(--line)", background: "var(--panel)" }} value={draft.project} onChange={(event) => setDraft({ ...draft, project: event.target.value })} /></label>
                  <label><span className="text-xs font-black uppercase" style={{ color: "var(--muted)" }}>Goal</span><input className="mt-1 h-11 w-full rounded-md border px-3 outline-none" style={{ borderColor: "var(--line)", background: "var(--panel)" }} value={draft.goal} onChange={(event) => setDraft({ ...draft, goal: event.target.value })} /></label>
                  <label><span className="text-xs font-black uppercase" style={{ color: "var(--muted)" }}>Due date</span><input className="mt-1 h-11 w-full rounded-md border px-3 outline-none" style={{ borderColor: "var(--line)", background: "var(--panel)" }} value={draft.dueDate} onChange={(event) => setDraft({ ...draft, dueDate: event.target.value })} type="date" /></label>
                  <label><span className="text-xs font-black uppercase" style={{ color: "var(--muted)" }}>Scheduled block</span><input className="mt-1 h-11 w-full rounded-md border px-3 outline-none" style={{ borderColor: "var(--line)", background: "var(--panel)" }} value={draft.scheduledBlock} onChange={(event) => setDraft({ ...draft, scheduledBlock: event.target.value })} type="time" /></label>
                  <label><span className="text-xs font-black uppercase" style={{ color: "var(--muted)" }}>Skill area</span><select className="mt-1 h-11 w-full rounded-md border px-3 outline-none" style={{ borderColor: "var(--line)", background: "var(--panel)" }} value={draft.area} onChange={(event) => setDraft({ ...draft, area: event.target.value as Area })}>{areas.map((area) => <option key={area}>{area}</option>)}</select></label>
                  <label><span className="text-xs font-black uppercase" style={{ color: "var(--muted)" }}>Energy type</span><select className="mt-1 h-11 w-full rounded-md border px-3 outline-none" style={{ borderColor: "var(--line)", background: "var(--panel)" }} value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value as QuestType })}>{questTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
                  <label><span className="text-xs font-black uppercase" style={{ color: "var(--muted)" }}>Priority</span><select className="mt-1 h-11 w-full rounded-md border px-3 outline-none" style={{ borderColor: "var(--line)", background: "var(--panel)" }} value={draft.priority} onChange={(event) => setDraft({ ...draft, priority: event.target.value as Priority })}>{priorities.map((priority) => <option key={priority}>{priority}</option>)}</select></label>
                  <label><span className="text-xs font-black uppercase" style={{ color: "var(--muted)" }}>Hours</span><input className="mt-1 h-11 w-full rounded-md border px-3 outline-none" style={{ borderColor: "var(--line)", background: "var(--panel)" }} value={draft.hours} onChange={(event) => setDraft({ ...draft, hours: event.target.value })} type="number" min="0.25" step="0.25" /></label>
                  <label><span className="text-xs font-black uppercase" style={{ color: "var(--muted)" }}>Boss damage</span><input className="mt-1 h-11 w-full rounded-md border px-3 outline-none" style={{ borderColor: "var(--line)", background: "var(--panel)" }} value={draft.bossDamage} onChange={(event) => setDraft({ ...draft, bossDamage: event.target.value })} type="number" min="0" /></label>
                  <label className="flex items-start gap-3 rounded-md border p-3 sm:col-span-2" style={{ borderColor: "var(--line)", background: "var(--soft)" }}>
                    <input
                      type="checkbox"
                      checked={draft.isCoop}
                      onChange={(event) => setDraft({ ...draft, isCoop: event.target.checked })}
                      className="mt-1 h-4 w-4"
                      style={{ accentColor: "var(--accent)" }}
                    />
                    <span>
                      <span className="block text-sm font-black">Make this a co-op quest</span>
                      <span className="block text-xs font-bold" style={{ color: "var(--muted)" }}>Adds reservation details and a map preview to the planner calendar.</span>
                    </span>
                  </label>
                  {draft.isCoop ? (
                    <>
                      <label className="sm:col-span-2"><span className="text-xs font-black uppercase" style={{ color: "var(--muted)" }}>Reservation address</span><input className="mt-1 h-11 w-full rounded-md border px-3 outline-none" style={{ borderColor: "var(--line)", background: "var(--panel)" }} value={draft.address} onChange={(event) => setDraft({ ...draft, address: event.target.value })} placeholder="Enter the place or reservation address" /></label>
                      <label className="sm:col-span-2"><span className="text-xs font-black uppercase" style={{ color: "var(--muted)" }}>Google Maps link</span><input className="mt-1 h-11 w-full rounded-md border px-3 outline-none" style={{ borderColor: "var(--line)", background: "var(--panel)" }} value={draft.googleMapsUrl} onChange={(event) => setDraft({ ...draft, googleMapsUrl: event.target.value })} placeholder="Paste Google Maps link" /></label>
                      <div className="sm:col-span-2">
                        <span className="text-xs font-black uppercase" style={{ color: "var(--muted)" }}>Invite friends</span>
                        <button type="button" onClick={() => setShowInvitePicker(true)} className="mt-1 flex h-11 w-full items-center justify-between rounded-md border px-3 text-left font-bold" style={{ borderColor: "var(--line)", background: "var(--panel)" }}>
                          <span className="truncate">{draft.inviteHandles || "Open friend picker"}</span>
                          <Users className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  ) : null}
                  <label className="sm:col-span-2"><span className="text-xs font-black uppercase" style={{ color: "var(--muted)" }}>Notes</span><textarea className="mt-1 min-h-20 w-full rounded-md border px-3 py-2 outline-none" style={{ borderColor: "var(--line)", background: "var(--panel)" }} value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} /></label>
                  <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-black text-white sm:col-span-2" style={{ background: "var(--inverse)" }}><Plus className="h-4 w-4" />{editingQuestId ? "Save quest changes" : "Add quest"}</button>
                </form>
                </Section>

                <Section>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div><p className="text-xs font-black uppercase" style={{ color: "var(--muted)" }}>Planner queue</p><h2 className="mt-1 text-2xl font-black">Priority sorted, past dates hidden</h2></div>
                  <div className="flex flex-wrap gap-2">
                    {(["All", ...areas] as Array<Area | "All">).map((area) => (
                      <button key={area} onClick={() => setSelectedArea(area)} className="h-9 rounded-md border px-3 text-xs font-black" style={{ borderColor: "var(--line)", background: selectedArea === area ? "var(--inverse)" : "var(--panel)", color: selectedArea === area ? "var(--panel)" : "var(--text)" }}>{area}</button>
                    ))}
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  <AnimatePresence initial={false}>
                    {plannerQuests.map((quest) => <QuestCard key={quest.id} quest={quest} today={today} top3Count={top3Count} onComplete={completeQuest} onRemove={removeQuest} onReschedule={moveToTomorrow} onToggleTop3={toggleTop3} onEdit={editQuest} />)}
                  </AnimatePresence>
                  {plannerQuests.length === 0 ? <div className="rounded-lg border border-dashed p-6 text-sm font-bold" style={{ borderColor: "var(--line)", color: "var(--muted)" }}>No current or future planner quests in this filter.</div> : null}
                </div>
                </Section>
              </div>
              <Section>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div><p className="text-xs font-black uppercase" style={{ color: "var(--muted)" }}>Planner calendar</p><h2 className="mt-1 text-2xl font-black">{calendarMonthLabel}</h2><p className="text-sm" style={{ color: "var(--muted)" }}>Calendar and planner live together. Past quests stay here, but never appear on the dashboard or active planner queue.</p></div>
                  <div className="flex gap-2">
                    <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))} className="grid h-10 w-10 place-items-center rounded-md border" style={{ borderColor: "var(--line)" }}><ChevronLeft className="h-4 w-4" /></button>
                    <button onClick={() => setCalendarMonth(startOfMonth(new Date()))} className="h-10 rounded-md border px-3 text-sm font-black" style={{ borderColor: "var(--line)" }}>Today</button>
                    <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))} className="grid h-10 w-10 place-items-center rounded-md border" style={{ borderColor: "var(--line)" }}><ChevronRight className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-7 gap-2 text-center text-xs font-black uppercase" style={{ color: "var(--muted)" }}>{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <div key={day}>{day}</div>)}</div>
                <div className="mt-2 grid grid-cols-7 gap-2">
                  {calendarDays.map((date) => {
                    const key = toDateKey(date);
                    const dayQuests = state.quests.filter((quest) => quest.dueDate === key);
                    const inMonth = date.getMonth() === calendarMonth.getMonth();
                    return (
                      <div key={key} className="min-h-28 rounded-md border p-2 text-left" style={{ borderColor: key === today ? "var(--accent)" : "var(--line)", background: inMonth ? "var(--panel)" : "var(--soft)", opacity: inMonth ? 1 : 0.55 }}>
                        <div className="flex justify-between text-xs font-black"><span>{date.getDate()}</span>{key < today ? <span>past</span> : null}</div>
                        <div className="mt-2 space-y-1">
                          {dayQuests.slice(0, 3).map((quest) => (
                            <div key={quest.id} className="group flex items-center gap-1 rounded px-1.5 py-1 text-[11px] font-bold text-white" style={{ background: quest.status === "done" ? "var(--accent2)" : areaAccent[quest.area] }}>
                              {quest.isCoop ? <Users className="h-3 w-3 shrink-0" /> : null}
                              <span className="min-w-0 flex-1 truncate">{quest.title}</span>
                              <button
                                type="button"
                                onClick={() => removeQuest(quest)}
                                className="grid h-4 w-4 shrink-0 place-items-center rounded bg-black/25 opacity-80 transition hover:opacity-100"
                                title="Remove quest"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => editQuest(quest)}
                                className="grid h-4 w-7 shrink-0 place-items-center rounded bg-black/25 text-[9px] opacity-80 transition hover:opacity-100"
                                title="Edit quest"
                              >
                                Edit
                              </button>
                            </div>
                          ))}
                          {dayQuests.length > 3 ? <p className="text-[11px] font-bold" style={{ color: "var(--muted)" }}>+{dayQuests.length - 3} more</p> : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {Array.from({ length: 12 }, (_, index) => new Date(calendarYear, index, 1)).map((date) => (
                    <button key={date.toISOString()} onClick={() => setCalendarMonth(date)} className="rounded-md border p-3 text-left text-sm font-black transition hover:-translate-y-0.5" style={{ borderColor: "var(--line)", background: date.getMonth() === calendarMonth.getMonth() ? "var(--inverse)" : "var(--soft)", color: date.getMonth() === calendarMonth.getMonth() ? "var(--panel)" : "var(--text)" }}>
                      {date.toLocaleDateString(undefined, { month: "long" })}
                    </button>
                  ))}
                </div>
              </Section>
            </motion.div>
          ) : null}

          {activeTab === "coop" ? (
            <motion.div key="coop" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">
              <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
                <Section>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase" style={{ color: "var(--muted)" }}>COOP reservations</p>
                      <h2 className="mt-1 text-2xl font-black">Upcoming team quests</h2>
                    </div>
                    <Users className="h-6 w-6" style={{ color: "var(--accent)" }} />
                  </div>
                  <div className="mt-5 space-y-3">
                    {coopQuests.map((quest) => {
                      const selected = selectedCoopQuest?.id === quest.id;
                      return (
                        <article
                          key={quest.id}
                          onClick={() => setSelectedCoopQuestId(quest.id)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") setSelectedCoopQuestId(quest.id);
                          }}
                          role="button"
                          tabIndex={0}
                          className="w-full rounded-lg border p-4 text-left transition hover:-translate-y-0.5"
                          style={{ borderColor: selected ? "var(--accent)" : "var(--line)", background: selected ? "var(--soft)" : "var(--panel)" }}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-lg font-black">{quest.title}</p>
                            <span className="rounded-md px-2 py-1 text-xs font-black text-white" style={{ background: "var(--accent)" }}>{formatShortDate(quest.dueDate)}</span>
                          </div>
                          <p className="mt-1 text-sm font-bold" style={{ color: "var(--muted)" }}>{quest.scheduledBlock || "No time block"} / {quest.project}</p>
                          {quest.address ? <p className="mt-3 text-sm font-bold">{quest.address}</p> : null}
                          {quest.coopCreatorHandle ? <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>Created by: {quest.coopCreatorHandle}</p> : null}
                          {quest.inviteHandles ? <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>Invited: {quest.inviteHandles}</p> : <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>No friends invited yet.</p>}
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="rounded-md border px-2 py-1 text-xs font-black" style={{ borderColor: "var(--line)" }}>{quest.energy} energy</span>
                            <span className="rounded-md border px-2 py-1 text-xs font-black" style={{ borderColor: "var(--line)" }}>{quest.priority}</span>
                            {quest.coopParticipantStatus ? <span className="rounded-md border px-2 py-1 text-xs font-black" style={{ borderColor: "var(--line)" }}>{quest.coopParticipantStatus.toLowerCase()}</span> : null}
                            {quest.coopParticipantStatus === "INVITED" ? (
                              <>
                                <button type="button" onClick={(event) => { event.stopPropagation(); respondToCoopInvite(quest, "accept"); }} className="rounded-md px-2 py-1 text-xs font-black text-white" style={{ background: "var(--accent2)" }}>Accept</button>
                                <button type="button" onClick={(event) => { event.stopPropagation(); respondToCoopInvite(quest, "decline"); }} className="rounded-md px-2 py-1 text-xs font-black text-white" style={{ background: "var(--inverse)" }}>Decline</button>
                              </>
                            ) : null}
                            {!quest.coopParticipantStatus ? <button type="button" onClick={(event) => { event.stopPropagation(); editQuest(quest); }} className="rounded-md px-2 py-1 text-xs font-black text-white" style={{ background: "var(--inverse)" }}>Edit invites</button> : null}
                          </div>
                        </article>
                      );
                    })}
                    {coopQuests.length === 0 ? (
                      <div className="rounded-lg border border-dashed p-6 text-sm font-bold" style={{ borderColor: "var(--line)", color: "var(--muted)" }}>
                        No upcoming co-op quests. Create one from Planner by turning on the co-op quest option.
                      </div>
                    ) : null}
                  </div>
                </Section>

                <Section>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase" style={{ color: "var(--muted)" }}>Map and Google profile</p>
                      <h2 className="mt-1 text-2xl font-black">{selectedCoopQuest?.title ?? "Select a co-op quest"}</h2>
                    </div>
                    <MapPin className="h-6 w-6" style={{ color: "var(--accent)" }} />
                  </div>
                  {selectedCoopQuest ? (
                    <div className="mt-5 space-y-4">
                      <div className="rounded-lg border p-4" style={{ borderColor: "var(--line)", background: "var(--soft)" }}>
                        <p className="text-sm font-black">{formatShortDate(selectedCoopQuest.dueDate)} {selectedCoopQuest.scheduledBlock ? `at ${selectedCoopQuest.scheduledBlock}` : ""}</p>
                        <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
                          The embedded map searches the entered place/address. The Google Business Profile opens from your pasted Maps link when one is available.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <a
                            href={googleBusinessProfileUrl(selectedCoopQuest)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-black text-white"
                            style={{ background: "var(--accent)" }}
                          >
                            <MapPin className="h-4 w-4" />
                            Open Google Business Profile
                          </a>
                          <button type="button" onClick={() => editQuest(selectedCoopQuest)} className="h-10 rounded-md border px-3 text-sm font-black" style={{ borderColor: "var(--line)" }}>Edit location</button>
                        </div>
                      </div>
                      {mapPreviewUrl ? (
                        <iframe title="Co-op quest map" src={mapPreviewUrl} className="h-[420px] w-full rounded-lg border-0 shadow-sm" loading="lazy" />
                      ) : (
                        <div className="grid h-[420px] place-items-center rounded-lg border border-dashed text-sm font-bold" style={{ borderColor: "var(--line)", color: "var(--muted)" }}>
                          Add a place name or address to show the map.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-5 grid h-[420px] place-items-center rounded-lg border border-dashed text-sm font-bold" style={{ borderColor: "var(--line)", color: "var(--muted)" }}>
                      Your next co-op quest map will appear here.
                    </div>
                  )}
                </Section>
              </section>
            </motion.div>
          ) : null}

          {activeTab === "tracking" ? (
            <motion.div key="tracking" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">
              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Section><Zap className="h-5 w-5" /><p className="mt-4 text-xs font-bold uppercase" style={{ color: "var(--muted)" }}>Total XP</p><p className="mt-1 text-2xl font-black">{state.xp}</p><p className="text-sm" style={{ color: "var(--muted)" }}>{levelTitles[level - 1]} / Level {level}</p></Section>
                <Section><Check className="h-5 w-5" /><p className="mt-4 text-xs font-bold uppercase" style={{ color: "var(--muted)" }}>Completed</p><p className="mt-1 text-2xl font-black">{doneQuests.length}</p><p className="text-sm" style={{ color: "var(--muted)" }}>quests closed</p></Section>
                <Section><Flame className="h-5 w-5" /><p className="mt-4 text-xs font-bold uppercase" style={{ color: "var(--muted)" }}>Momentum</p><p className="mt-1 text-2xl font-black">{state.streak}</p><p className="text-sm" style={{ color: "var(--muted)" }}>{state.shields} recovery shields</p></Section>
                <Section><Coins className="h-5 w-5" /><p className="mt-4 text-xs font-bold uppercase" style={{ color: "var(--muted)" }}>Coins</p><p className="mt-1 text-2xl font-black">{state.coins}</p><p className="text-sm" style={{ color: "var(--muted)" }}>earned by execution</p></Section>
              </section>

              <Section>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div><p className="text-xs font-black uppercase" style={{ color: "var(--muted)" }}>Skill tracking</p><h2 className="mt-1 text-2xl font-black">Adeptness graph</h2></div><Layers3 className="h-6 w-6" />
                </div>
                <div className="mt-5 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                  <SkillTreeGraph skills={skillXp} labels={state.skillLabels} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    {skillXp.map((skill) => (
                      <motion.div
                        key={skill.area}
                        whileHover={{ y: -2 }}
                        className="rounded-lg border p-4"
                        style={{ borderColor: "var(--line)", background: "var(--soft)" }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full" style={{ background: areaAccent[skill.area] }} />
                            <p className="font-black">{state.skillLabels[skill.area]}</p>
                          </div>
                          <span className="rounded-md px-2 py-1 text-xs font-black text-white" style={{ background: areaAccent[skill.area] }}>Lv {skill.level}</span>
                        </div>
                        <div className="mt-4">
                          <div className="mb-2 flex justify-between text-xs font-bold" style={{ color: "var(--muted)" }}>
                            <span>{skill.xp} XP</span>
                            <span>{80 - skill.progress} XP to next</span>
                          </div>
                          <ProgressBar value={(skill.progress / 80) * 100} color={areaAccent[skill.area]} />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Section>

              <Section>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div><p className="text-xs font-black uppercase" style={{ color: "var(--muted)" }}>Customize graph</p><h2 className="mt-1 text-2xl font-black">Rename skill areas</h2></div><Settings className="h-6 w-6" />
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {areas.map((area) => (
                    <label key={area}>
                      <span className="text-xs font-black uppercase" style={{ color: "var(--muted)" }}>{area}</span>
                      <input
                        className="mt-1 h-11 w-full rounded-md border px-3 font-bold outline-none"
                        style={{ borderColor: "var(--line)", background: "var(--panel)" }}
                        value={state.skillLabels[area]}
                        onChange={(event) => patchState({ skillLabels: { ...state.skillLabels, [area]: event.target.value } })}
                      />
                    </label>
                  ))}
                </div>
              </Section>
            </motion.div>
          ) : null}

        </AnimatePresence>

        <section>
          <Section>
            <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-black uppercase" style={{ color: "var(--muted)" }}>Goals and projects</p><h2 className="mt-1 text-2xl font-black">Bigger goal progress</h2></div><Goal className="h-6 w-6" /></div>
            <div className="mt-5 space-y-3">
              {projects.map((project) => <div key={project.name} className="rounded-lg border p-4" style={{ borderColor: "var(--line)", background: "var(--soft)" }}><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-lg font-black">{project.name}</p><p className="text-sm" style={{ color: "var(--muted)" }}>{project.goal}</p></div><span className="rounded-md px-3 py-1 text-xs font-black" style={{ background: "var(--panel)" }}>{formatShortDate(project.deadline)}</span></div><div className="mt-3"><div className="mb-2 flex justify-between text-xs font-bold" style={{ color: "var(--muted)" }}><span>{project.area}</span><span>{project.progress}% complete</span></div><ProgressBar value={project.progress} color="var(--accent2)" /></div></div>)}
              {projects.length === 0 ? <div className="rounded-lg border border-dashed p-6 text-sm font-bold" style={{ borderColor: "var(--line)", color: "var(--muted)" }}>No projects yet. Add your first quest in Planner and this area will become your goal progress map.</div> : null}
            </div>
          </Section>
        </section>
      </div>
    </main>
  );
}
