"use client";

import {
  Activity,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Cpu,
  Gauge,
  Layers3,
  Lightbulb,
  LineChart,
  ShieldAlert,
  Target,
  TrendingUp,
} from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type IconComponent = typeof Activity;

const yearly = [
  { year: "2020", rnd: 998.29, revenue: 4494919.7, dcRevenue: 2817522.07, grossProfit: 2679931.81, patents: 10597, partnerships: 15611, cuda: 627.23, customers: 57904, shipments: 258543, risk: 50.06, margin: 59.28 },
  { year: "2021", rnd: 978.31, revenue: 4384630.68, dcRevenue: 2700049.55, grossProfit: 2570824.69, patents: 11148, partnerships: 14656, cuda: 612.9, customers: 53952, shipments: 256839, risk: 49.28, margin: 58.69 },
  { year: "2022", rnd: 977.62, revenue: 4523133.12, dcRevenue: 2794032.02, grossProfit: 2668732.71, patents: 11077, partnerships: 15858, cuda: 632.49, customers: 55514, shipments: 248308, risk: 50.05, margin: 59.03 },
  { year: "2023 Q1", rnd: 236.14, revenue: 1108874.38, dcRevenue: 670578.14, grossProfit: 635488.34, patents: 2740, partnerships: 3992, cuda: 632.49, customers: 14850, shipments: 63010, risk: 56.02, margin: 57.32 },
];

const regions = [
  { name: "North America", revenue: 3830351.36, rnd: 818.09, patents: 9201, customers: 44514, shipments: 209135, risk: 50.98, margin: 58.63 },
  { name: "Europe", revenue: 3764856.26, rnd: 811.43, patents: 9294, customers: 45716, shipments: 215751, risk: 48.72, margin: 58.6 },
  { name: "Asia", revenue: 3531187.25, rnd: 773.19, patents: 8604, customers: 49102, shipments: 203747, risk: 52.67, margin: 58.91 },
  { name: "Global", revenue: 3385163.01, rnd: 787.65, patents: 8463, customers: 42888, shipments: 198067, risk: 48.67, margin: 59.39 },
];

const products = [
  { name: "Grace Hopper", revenue: 3105863.12, dcRevenue: 1919640.87, rnd: 660.7, customers: 39135, shipments: 174661, risk: 50.8, margin: 58.77 },
  { name: "H100", revenue: 3000168.72, dcRevenue: 1889427.58, rnd: 674.85, customers: 37523, shipments: 167479, risk: 53.12, margin: 58.83 },
  { name: "A100", revenue: 2895094.92, dcRevenue: 1751992.89, rnd: 641.66, customers: 37862, shipments: 177617, risk: 48.21, margin: 59.94 },
  { name: "RTX", revenue: 2870788.87, dcRevenue: 1792035.31, rnd: 635.66, customers: 34675, shipments: 166603, risk: 50.38, margin: 58.81 },
  { name: "DGX Systems", revenue: 2639642.25, dcRevenue: 1629085.13, rnd: 577.51, customers: 33025, shipments: 140340, risk: 48.58, margin: 57.88 },
];

const totals = {
  records: 1185,
  dateRange: "Jan 2020 - Mar 2023",
  rnd: 3190.4,
  revenue: 14511557.9,
  dcRevenue: 8982181.8,
  gamingRevenue: 5529376.1,
  grossProfit: 8554977.5,
  patents: 35562,
  partnerships: 50117,
  avgMargin: 58.9,
  avgRisk: 50.3,
};

const slides = [
  { id: 0, title: "Strategy Map", icon: Target },
  { id: 1, title: "Innovation Inputs", icon: Lightbulb },
  { id: 2, title: "Capability Growth", icon: BrainCircuit },
  { id: 3, title: "Adoption & ROI", icon: TrendingUp },
  { id: 4, title: "Risk Decisions", icon: ShieldAlert },
];

const leadershipMoves = [
  { decision: "Protect accelerated computing supply", trigger: "Risk index > 52 with high H100 / Grace Hopper revenue exposure", owner: "COO + GPU Ops", timing: "Next 90 days" },
  { decision: "Scale enterprise AI adoption pods", trigger: "CUDA developer base stable while training customers expand", owner: "CRO + Developer Relations", timing: "2 quarters" },
  { decision: "Rebalance R&D toward data center pull", trigger: "Data center mix at 61.9% of dataset revenue", owner: "CTO + CFO", timing: "FY planning" },
  { decision: "Use partnerships as early-demand radar", trigger: "50.1K startup partnerships tied to model training demand", owner: "Strategy + Corp Dev", timing: "Monthly" },
];

const valueChain: { label: string; text: string; icon: IconComponent }[] = [
  { label: "Inputs", text: "R&D, patents, partnerships", icon: Lightbulb },
  { label: "Capability", text: "CUDA, training customers, GPU scale", icon: Cpu },
  { label: "Adoption", text: "Data center revenue mix", icon: Layers3 },
  { label: "ROI", text: "Revenue and gross profit leverage", icon: TrendingUp },
  { label: "Decisions", text: "Risk, focus, capital allocation", icon: Gauge },
];


function money(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}T`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}B`;
  return `$${value.toFixed(0)}M`;
}

function compact(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return `${value.toFixed(0)}`;
}

function pct(value: number, digits = 1) {
  return `${value.toFixed(digits)}%`;
}

function maxOf<T>(items: T[], key: keyof T) {
  return Math.max(...items.map((item) => Number(item[key])));
}

function KpiCard({
  label,
  value,
  context,
  icon: Icon,
}: {
  label: string;
  value: string;
  context: string;
  icon: typeof Activity;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className="grid h-10 w-10 place-items-center rounded-md bg-emerald-50 text-emerald-700">
          <Icon size={20} />
        </span>
      </div>
      <p className="text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{context}</p>
    </article>
  );
}

function BarList({
  items,
  valueKey,
  labelKey = "name",
  formatter = compact,
}: {
  items: Record<string, number | string>[];
  valueKey: string;
  labelKey?: string;
  formatter?: (value: number) => string;
}) {
  const max = Math.max(...items.map((item) => Number(item[valueKey])));
  return (
    <div className="space-y-4">
      {items.map((item) => {
        const value = Number(item[valueKey]);
        return (
          <div key={String(item[labelKey])}>
            <div className="mb-1 flex items-center justify-between gap-4 text-sm">
              <span className="font-medium text-slate-700">{item[labelKey]}</span>
              <span className="tabular-nums text-slate-500">{formatter(value)}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${Math.max(8, (value / max) * 100)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TrendChart({
  data,
  keys,
}: {
  data: typeof yearly;
  keys: { key: keyof (typeof yearly)[number]; label: string; color: string }[];
}) {
  const width = 720;
  const height = 240;
  const pad = 34;
  const allValues = keys.flatMap(({ key }) => data.map((item) => Number(item[key])));
  const min = Math.min(...allValues) * 0.94;
  const max = Math.max(...allValues) * 1.04;
  const x = (index: number) => pad + (index * (width - pad * 2)) / (data.length - 1);
  const y = (value: number) => height - pad - ((value - min) / (max - min)) * (height - pad * 2);

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-64 w-full overflow-visible">
        {[0, 1, 2, 3].map((line) => (
          <line
            key={line}
            x1={pad}
            x2={width - pad}
            y1={pad + line * ((height - pad * 2) / 3)}
            y2={pad + line * ((height - pad * 2) / 3)}
            stroke="#e2e8f0"
            strokeWidth="1"
          />
        ))}
        {keys.map(({ key, color }) => {
          const points = data.map((item, index) => `${x(index)},${y(Number(item[key]))}`).join(" ");
          return (
            <polyline
              key={String(key)}
              points={points}
              fill="none"
              stroke={color}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="4"
            />
          );
        })}
        {data.map((item, index) => (
          <text key={item.year} x={x(index)} y={height - 5} textAnchor="middle" className="fill-slate-500 text-xs">
            {item.year}
          </text>
        ))}
      </svg>
      <div className="flex flex-wrap gap-4">
        {keys.map((item) => (
          <span key={String(item.key)} className="inline-flex items-center gap-2 text-sm text-slate-600">
            <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: item.color }} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function Donut({ dcShare }: { dcShare: number }) {
  const circumference = 2 * Math.PI * 44;
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 120 120" className="h-36 w-36">
        <circle cx="60" cy="60" r="44" fill="none" stroke="#e2e8f0" strokeWidth="16" />
        <circle
          cx="60"
          cy="60"
          r="44"
          fill="none"
          stroke="#10b981"
          strokeDasharray={`${circumference * dcShare} ${circumference}`}
          strokeLinecap="round"
          strokeWidth="16"
          transform="rotate(-90 60 60)"
        />
        <text x="60" y="57" textAnchor="middle" className="fill-slate-950 text-xl font-semibold">
          {pct(dcShare * 100)}
        </text>
        <text x="60" y="75" textAnchor="middle" className="fill-slate-500 text-xs">
          Data center
        </text>
      </svg>
      <div className="space-y-3 text-sm">
        <p className="flex items-center gap-2 text-slate-700">
          <span className="h-3 w-3 rounded-sm bg-emerald-500" /> Data center revenue
        </p>
        <p className="flex items-center gap-2 text-slate-700">
          <span className="h-3 w-3 rounded-sm bg-slate-200" /> Gaming revenue
        </p>
      </div>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  narrative,
}: {
  eyebrow: string;
  title: string;
  narrative: string;
}) {
  return (
    <div className="mb-8 max-w-5xl">
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">{eyebrow}</p>
      <h1 className="text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">{title}</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">{narrative}</p>
    </div>
  );
}

function SlideShell({ children }: { children: React.ReactNode }) {
  return <section className="min-h-[calc(100vh-148px)] px-5 py-8 md:px-10 lg:px-14">{children}</section>;
}

function StrategyMap() {
  const dcShare = totals.dcRevenue / totals.revenue;
  return (
    <SlideShell>
      <SectionHeader
        eyebrow="Page 1 / Executive thesis"
        title="Innovation is converting into data-center-led economic leverage."
        narrative="The management story is not a chart pack: R&D and ecosystem inputs build AI capabilities, capabilities create adoption pressure, adoption produces revenue and gross profit, and risk determines which leadership moves preserve the flywheel."
      />

      <div className="grid gap-4 lg:grid-cols-4">
        <KpiCard label="Dataset revenue" value={money(totals.revenue)} context={`${totals.records} records across ${totals.dateRange}`} icon={BarChart3} />
        <KpiCard label="R&D input" value={money(totals.rnd)} context="Semiconductor R&D spend in the source model" icon={Lightbulb} />
        <KpiCard label="Gross profit" value={money(totals.grossProfit)} context={`${pct(totals.avgMargin)} average gross margin`} icon={TrendingUp} />
        <KpiCard label="Risk index" value={totals.avgRisk.toFixed(1)} context="Portfolio supply-chain risk baseline" icon={ShieldAlert} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Innovation Value Chain</h2>
              <p className="mt-1 text-sm text-slate-500">Inputs to capability to adoption to ROI</p>
            </div>
            <LineChart className="text-emerald-700" />
          </div>
          <div className="grid gap-3 md:grid-cols-5">
            {valueChain.map(({ label, text, icon: TypedIcon }, index) => {
              return (
                <div key={label} className="relative rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <TypedIcon className="mb-5 text-emerald-700" size={24} />
                  <p className="font-semibold text-slate-950">{label}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                  {index < 4 ? <ArrowRight className="absolute -right-5 top-1/2 hidden -translate-y-1/2 text-slate-300 md:block" size={24} /> : null}
                </div>
              );
            })}
          </div>
          <div className="mt-8">
            <TrendChart
              data={yearly}
              keys={[
                { key: "rnd", label: "R&D input", color: "#0f766e" },
                { key: "grossProfit", label: "Gross profit", color: "#2563eb" },
              ]}
            />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Revenue Mix</h2>
          <p className="mt-1 text-sm text-slate-500">Adoption signal from the dataset</p>
          <div className="mt-7">
            <Donut dcShare={dcShare} />
          </div>
          <div className="mt-8 space-y-4 border-t border-slate-200 pt-6">
            <p className="text-sm leading-6 text-slate-600">
              Data center is the leadership battleground. The dataset shows {pct(dcShare * 100)} of revenue tied to data center demand, making AI infrastructure the primary strategic lens.
            </p>
            <p className="text-sm font-medium text-slate-950">2023 is partial-year through March 31, so the dashboard treats it as Q1 context.</p>
          </div>
        </div>
      </div>
    </SlideShell>
  );
}

function InnovationInputs() {
  return (
    <SlideShell>
      <SectionHeader
        eyebrow="Page 2 / Innovation inputs"
        title="R&D spend is only one input; ecosystem density is the multiplier."
        narrative="The source data combines capital intensity with patents and startup partnerships. The executive question is whether the input system is broad enough to keep AI platform leadership ahead of demand."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <KpiCard label="Patent filings" value={compact(totals.patents)} context="Cumulative filings across records" icon={Lightbulb} />
        <KpiCard label="Startup partnerships" value={compact(totals.partnerships)} context="External innovation surface area" icon={Layers3} />
        <KpiCard label="R&D to revenue" value={`${(totals.rnd / totals.revenue * 100).toFixed(3)}%`} context="Dataset investment intensity" icon={Gauge} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Input Momentum by Year</h2>
          <p className="mt-1 text-sm text-slate-500">R&D, patents, and partnership engine</p>
          <div className="mt-6">
            <TrendChart
              data={yearly}
              keys={[
                { key: "rnd", label: "R&D", color: "#0f766e" },
                { key: "patents", label: "Patents", color: "#7c3aed" },
                { key: "partnerships", label: "Partnerships", color: "#ea580c" },
              ]}
            />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Regional Input Balance</h2>
          <p className="mt-1 text-sm text-slate-500">R&D allocation by operating theater</p>
          <div className="mt-6">
            <BarList items={regions} valueKey="rnd" formatter={money} />
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {regions.map((region) => (
              <div key={region.name} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold text-slate-950">{region.name}</p>
                <p className="mt-2 text-sm text-slate-600">{compact(region.patents)} patents / {compact(region.customers)} training customers</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SlideShell>
  );
}

function CapabilityGrowth() {
  const maxShipments = maxOf(products, "shipments");
  return (
    <SlideShell>
      <SectionHeader
        eyebrow="Page 3 / Capability growth"
        title="The capability layer is the bridge between invention and adoption."
        narrative="AI model training customers, CUDA developers, and GPU shipment scale show whether innovation is becoming operational capacity. Leadership should watch this layer before revenue shifts appear."
      />

      <div className="grid gap-4 lg:grid-cols-4">
        <KpiCard label="CUDA developer base" value={`${yearly[2].cuda.toFixed(0)}K`} context="2022 average, with 2023 Q1 holding steady" icon={BrainCircuit} />
        <KpiCard label="Training customers" value={compact(yearly.slice(0, 3).reduce((sum, item) => sum + item.customers, 0))} context="Full-year 2020-2022 customer base" icon={Target} />
        <KpiCard label="GPU shipments" value={compact(yearly.slice(0, 3).reduce((sum, item) => sum + item.shipments, 0))} context="Full-year 2020-2022 shipment scale" icon={Cpu} />
        <KpiCard label="Capability risk" value={pct(yearly[3].risk - yearly[2].risk)} context="Q1 2023 risk increase vs 2022 baseline" icon={ShieldAlert} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Capability Signals</h2>
          <p className="mt-1 text-sm text-slate-500">Developer ecosystem, customers, and shipments</p>
          <div className="mt-6">
            <TrendChart
              data={yearly}
              keys={[
                { key: "cuda", label: "CUDA developers", color: "#0f766e" },
                { key: "customers", label: "AI training customers", color: "#2563eb" },
                { key: "shipments", label: "GPU shipments", color: "#f97316" },
              ]}
            />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Product Capability Portfolio</h2>
          <p className="mt-1 text-sm text-slate-500">Shipments and customer density by product line</p>
          <div className="mt-6 space-y-5">
            {products.map((product) => (
              <div key={product.name} className="grid grid-cols-[112px_1fr_72px] items-center gap-4">
                <span className="text-sm font-medium text-slate-700">{product.name}</span>
                <div className="h-10 rounded-md bg-slate-100">
                  <div className="h-10 rounded-md bg-emerald-500/80" style={{ width: `${Math.max(12, (product.shipments / maxShipments) * 100)}%` }} />
                </div>
                <span className="text-right text-sm tabular-nums text-slate-500">{compact(product.shipments)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SlideShell>
  );
}

function AdoptionRoi() {
  const [investment, setInvestment] = useState(12);
  const [adoption, setAdoption] = useState(8);
  const [risk, setRisk] = useState(5);
  const levers: {
    label: string;
    value: number;
    setter: Dispatch<SetStateAction<number>>;
    min: number;
    max: number;
    suffix: string;
  }[] = [
    { label: "R&D capacity uplift", value: investment, setter: setInvestment, min: 0, max: 30, suffix: "%" },
    { label: "Adoption conversion uplift", value: adoption, setter: setAdoption, min: 0, max: 24, suffix: "%" },
    { label: "Risk mitigation effect", value: risk, setter: setRisk, min: 0, max: 18, suffix: "%" },
  ];

  const model = useMemo(() => {
    const baselineRevenue = totals.revenue;
    const baselineRng = totals.rnd;
    const baselineGross = totals.grossProfit;
    const revenueLift = baselineRevenue * (adoption / 100) * (1 + investment / 240);
    const incrementalRnd = baselineRng * (investment / 100);
    const riskDragAvoided = baselineGross * (risk / 100) * 0.22;
    const incrementalGross = revenueLift * (totals.avgMargin / 100) + riskDragAvoided;
    const roi = incrementalGross / Math.max(incrementalRnd, 1);
    return { revenueLift, incrementalRnd, riskDragAvoided, incrementalGross, roi };
  }, [investment, adoption, risk]);

  return (
    <SlideShell>
      <SectionHeader
        eyebrow="Page 4 / Market adoption and ROI"
        title="The executive calculator translates innovation levers into financial choices."
        narrative="This page turns the story into a decision model: more R&D capacity, stronger adoption conversion, and risk mitigation can be compared through incremental revenue, gross profit, and ROI."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Digital Innovation Calculator</h2>
          <p className="mt-1 text-sm text-slate-500">Scenario levers for executive trade-offs</p>
          <div className="mt-7 space-y-7">
            {levers.map(({ label, value, setter, min, max, suffix }) => (
              <label key={label} className="block">
                <span className="mb-2 flex items-center justify-between gap-4 text-sm font-medium text-slate-700">
                  {label}
                  <span className="rounded-md bg-slate-100 px-2 py-1 tabular-nums text-slate-950">{value}{suffix}</span>
                </span>
                <input
                  type="range"
                  min={Number(min)}
                  max={Number(max)}
                  value={Number(value)}
                  onChange={(event) => setter(Number(event.target.value))}
                  className="w-full accent-emerald-600"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <KpiCard label="Incremental revenue" value={money(model.revenueLift)} context="Adoption conversion applied to dataset revenue" icon={BarChart3} />
          <KpiCard label="Incremental R&D" value={money(model.incrementalRnd)} context="Additional spend under scenario" icon={Lightbulb} />
          <KpiCard label="Incremental gross profit" value={money(model.incrementalGross)} context={`${money(model.riskDragAvoided)} risk drag avoided`} icon={TrendingUp} />
          <KpiCard label="Scenario ROI" value={`${model.roi.toFixed(1)}x`} context="Incremental gross profit over incremental R&D" icon={Gauge} />
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Adoption Portfolio</h2>
          <p className="mt-1 text-sm text-slate-500">Dataset revenue by product line</p>
          <div className="mt-6">
            <BarList items={products} valueKey="revenue" formatter={money} />
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">ROI Bridge</h2>
          <p className="mt-1 text-sm text-slate-500">From input to profit pool</p>
          <div className="mt-8 grid grid-cols-4 items-end gap-3">
            {[
              ["R&D", totals.rnd, "#0f766e"],
              ["Revenue", totals.revenue, "#2563eb"],
              ["Gross Profit", totals.grossProfit, "#16a34a"],
              ["Scenario GP", model.incrementalGross, "#f97316"],
            ].map(([label, value, color]) => {
              const height = 42 + (Number(value) / totals.revenue) * 170;
              return (
                <div key={String(label)} className="flex flex-col items-center justify-end gap-3">
                  <div className="w-full rounded-t-md" style={{ height, backgroundColor: String(color) }} />
                  <span className="text-center text-xs font-medium text-slate-600">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </SlideShell>
  );
}

function RiskDecisions() {
  const riskMax = maxOf(products, "risk");
  const riskMin = Math.min(...products.map((p) => p.risk));
  return (
    <SlideShell>
      <SectionHeader
        eyebrow="Page 5 / Risk and leadership decisions"
        title="The leadership agenda is to scale the flywheel without letting risk tax the ROI."
        narrative="Risk is not a footnote: supply-chain exposure, production cost pressure, and product concentration determine how much innovation value reaches financial outcomes."
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Risk Heatmap by Product</h2>
          <p className="mt-1 text-sm text-slate-500">Darker cells indicate higher supply-chain risk</p>
          <div className="mt-6 grid grid-cols-[130px_repeat(3,minmax(0,1fr))] overflow-hidden rounded-lg border border-slate-200 text-sm">
            <div className="bg-slate-100 p-3 font-semibold text-slate-600">Product</div>
            <div className="bg-slate-100 p-3 font-semibold text-slate-600">Risk</div>
            <div className="bg-slate-100 p-3 font-semibold text-slate-600">Revenue</div>
            <div className="bg-slate-100 p-3 font-semibold text-slate-600">Margin</div>
            {products.map((product) => {
              const intensity = (product.risk - riskMin) / (riskMax - riskMin);
              return (
                <div key={product.name} className="contents">
                  <div className="border-t border-slate-200 p-3 font-medium text-slate-800">{product.name}</div>
                  <div
                    className="border-t border-slate-200 p-3 font-semibold text-slate-950"
                    style={{ backgroundColor: `rgba(249, 115, 22, ${0.14 + intensity * 0.42})` }}
                  >
                    {product.risk.toFixed(1)}
                  </div>
                  <div className="border-t border-slate-200 p-3 tabular-nums text-slate-600">{money(product.revenue)}</div>
                  <div className="border-t border-slate-200 p-3 tabular-nums text-slate-600">{pct(product.margin)}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Leadership Decision Backlog</h2>
          <p className="mt-1 text-sm text-slate-500">Actions linked to measurable triggers</p>
          <div className="mt-6 space-y-4">
            {leadershipMoves.map((move, index) => (
              <div key={move.decision} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-md bg-emerald-600 text-sm font-semibold text-white">{index + 1}</span>
                  <p className="font-semibold text-slate-950">{move.decision}</p>
                </div>
                <p className="text-sm leading-6 text-slate-600">{move.trigger}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-slate-600">
                  <span className="rounded-md bg-white px-2 py-1 ring-1 ring-slate-200">{move.owner}</span>
                  <span className="rounded-md bg-white px-2 py-1 ring-1 ring-slate-200">{move.timing}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SlideShell>
  );
}

export default function Home() {
  const [active, setActive] = useState(0);
  const ActiveIcon = slides[active].icon;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur md:px-10 lg:px-14">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-md bg-emerald-600 text-white">
              <ActiveIcon size={22} />
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">NVIDIA AI Semiconductor</p>
              <h2 className="text-xl font-semibold tracking-tight text-slate-950">Digital Innovation Performance Calculator</h2>
            </div>
          </div>
          <nav className="grid grid-cols-2 gap-2 md:grid-cols-5">
            {slides.map((slide) => {
              const Icon = slide.icon;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setActive(slide.id)}
                  className={cn(
                    "flex h-11 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition",
                    active === slide.id
                      ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-slate-950",
                  )}
                >
                  <Icon size={16} />
                  <span>{slide.title}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {active === 0 ? <StrategyMap /> : null}
      {active === 1 ? <InnovationInputs /> : null}
      {active === 2 ? <CapabilityGrowth /> : null}
      {active === 3 ? <AdoptionRoi /> : null}
      {active === 4 ? <RiskDecisions /> : null}
    </main>
  );
}
