"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Beaker,
  CheckCircle2,
  CircleDashed,
  Clock3,
  FlaskConical,
  Lightbulb,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import {
  getExperimentHistory,
  upsertExperimentHistory,
  type ExperimentHistoryRecord,
} from "@/lib/experiment-history";

type ExperimentRecord = ExperimentHistoryRecord & {
  prePublishAnalysis?: string;
  postAnalysis?: string;
  postUrl?: string;
  goal?: string;
};

type FilterType = "all" | "in-progress" | "completed";

function readSessionValue<T,>(keys: string[]): T | null {
  if (typeof window === "undefined") return null;
  for (const key of keys) {
    const value = window.sessionStorage.getItem(key);
    if (!value) continue;
    try {
      return JSON.parse(value) as T;
    } catch {
      // Ignore malformed session data and try the next known key.
    }
  }
  return null;
}

function formatDate(value?: string) {
  if (!value) return "Date not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date not recorded";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isCompletedExperiment(experiment: ExperimentRecord) {
  return (
    experiment.status === "completed" ||
    Boolean(experiment.postAnalysis) ||
    Boolean(experiment.analyzedAt)
  );
}

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<ExperimentRecord[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    try {
      // Read persistent history first.
      let history = getExperimentHistory() as ExperimentRecord[];

      // One-time safety migration: if an older session-only experiment exists,
      // merge it into history without replacing an existing record with the same ID.
      const current = readSessionValue<Record<string, unknown>>([
        "evolex_publish_ready",
        "evolex_experiment_status",
      ]);
      const legacyPost = readSessionValue<Record<string, unknown>>([
        "evolex_post_analysis",
      ]);

      if (current && typeof current === "object") {
        const now = new Date().toISOString();
        const legacyId =
          typeof current.experimentId === "string"
            ? current.experimentId
            : `legacy-${String(current.createdAt ?? now)}`;
        const postAnalysis =
          typeof current.postAnalysis === "string"
            ? current.postAnalysis
            : typeof legacyPost?.analysis === "string"
              ? legacyPost.analysis
              : undefined;

        const migrated: ExperimentRecord = {
          ...(current as Partial<ExperimentRecord>),
          experimentId: legacyId,
          concept:
            typeof current.concept === "string"
              ? current.concept
              : typeof current.opportunity === "string"
                ? current.opportunity
                : "Your content experiment",
          status: postAnalysis ? "completed" : "in_progress",
          postAnalysis,
          createdAt:
            typeof current.createdAt === "string" ? current.createdAt : now,
          updatedAt: now,
        } as ExperimentRecord;

        upsertExperimentHistory(migrated);
        history = getExperimentHistory() as ExperimentRecord[];
      }

      // Support the case where a post-publish record exists but its current
      // experiment was not present in the legacy session key.
      if (legacyPost && typeof legacyPost === "object") {
        const legacyExperiment = legacyPost.experiment;
        if (legacyExperiment && typeof legacyExperiment === "object") {
          const postRecord = legacyExperiment as Record<string, unknown>;
          if (typeof postRecord.experimentId === "string") {
            upsertExperimentHistory({
              ...(postRecord as Partial<ExperimentRecord>),
              experimentId: postRecord.experimentId,
              concept:
                typeof postRecord.concept === "string"
                  ? postRecord.concept
                  : "Post-publish content review",
              postAnalysis:
                typeof legacyPost.analysis === "string"
                  ? legacyPost.analysis
                  : typeof postRecord.postAnalysis === "string"
                    ? postRecord.postAnalysis
                    : undefined,
              status: "completed",
              createdAt:
                typeof postRecord.createdAt === "string"
                  ? postRecord.createdAt
                  : new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            } as ExperimentRecord);
            history = getExperimentHistory() as ExperimentRecord[];
          }
        }
      }

      setExperiments(
        [...history].sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt).getTime() -
            new Date(a.updatedAt || a.createdAt).getTime(),
        ),
      );
    } catch (error) {
      console.error("Unable to load experiment history:", error);
      setExperiments([]);
    }
  }, []);

  const visibleExperiments = useMemo(
    () =>
      experiments.filter((experiment) => {
        if (filter === "all") return true;
        return filter === "completed"
          ? isCompletedExperiment(experiment)
          : !isCompletedExperiment(experiment);
      }),
    [experiments, filter],
  );

  const plannedCount = experiments.length;
  const completedCount = experiments.filter(isCompletedExperiment).length;
  const inProgressCount = plannedCount - completedCount;

  return (
    <div className="flex min-h-screen bg-[#f8f9ff] text-slate-800">
      <Sidebar />

      <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white px-3 py-1.5 text-xs font-semibold text-violet-700 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-violet-500" />
                YOUR CREATOR JOURNEY
              </p>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                My Experiments
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Turn every post into a learning loop. Track your hypothesis,
                measure what happened, and use the signal to decide what to test next.
              </p>
            </div>

            <Link
              href="/pre-publish-lab"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-violet-700"
            >
              <Plus className="h-4 w-4" />
              New experiment
            </Link>
          </header>

          <section className="relative mb-6 overflow-hidden rounded-[28px] border border-violet-100 bg-gradient-to-br from-white via-[#f7f3ff] to-[#edf5ff] p-6 shadow-sm sm:p-8">
            <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-violet-300/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 right-1/3 h-52 w-52 rounded-full bg-sky-200/30 blur-3xl" />
            <div className="relative grid gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:items-center">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-violet-700">
                  <Sparkles className="h-4 w-4" />
                  LEARN · MEASURE · EVOLVE
                </div>
                <h2 className="mt-4 max-w-xl text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-3xl">
                  Better content comes from{" "}
                  <span className="text-violet-700">better experiments.</span>
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                  Start with one hypothesis, publish with intention, then compare
                  your prediction with real performance. Every result helps shape
                  your next move.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/pre-publish-lab"
                    className="inline-flex items-center gap-2 rounded-full bg-violet-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-800"
                  >
                    Plan an experiment <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/post-publish-lab"
                    className="inline-flex items-center gap-2 rounded-full border border-white bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-white"
                  >
                    Review performance <BarChart3 className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <StatCard icon={<Target className="h-5 w-5" />} value={plannedCount} label="Planned" tone="violet" />
                <StatCard icon={<Clock3 className="h-5 w-5" />} value={inProgressCount} label="In progress" tone="blue" />
                <StatCard icon={<CheckCircle2 className="h-5 w-5" />} value={completedCount} label="Reviewed" tone="emerald" />
              </div>
            </div>
          </section>

          <section className="mb-8 grid gap-4 md:grid-cols-3">
            <StepCard
              number="01"
              icon={<Lightbulb className="h-5 w-5" />}
              title="Set a hypothesis"
              description="Choose one thing to test, such as a hook, format, or content angle."
              tint="violet"
            />
            <StepCard
              number="02"
              icon={<TrendingUp className="h-5 w-5" />}
              title="Measure the outcome"
              description="Review your post after publishing and record the evidence available."
              tint="blue"
            />
            <StepCard
              number="03"
              icon={<FlaskConical className="h-5 w-5" />}
              title="Learn and iterate"
              description="Keep what works, change one variable, and make your next test smarter."
              tint="emerald"
            />
          </section>

          <section className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Experiment history</h2>
                <p className="mt-1 text-base text-slate-500">
                  All saved experiments appear here, from planning through post-publish review.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {([
                  ["all", "All"],
                  ["in-progress", "In progress"],
                  ["completed", "Reviewed"],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFilter(value)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      filter === value
                        ? "bg-violet-700 text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:text-violet-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {visibleExperiments.length ? (
                visibleExperiments.map((experiment) => {
                  const completed = isCompletedExperiment(experiment);
                  const title =
                    experiment.concept?.trim() ||
                    experiment.opportunity?.trim() ||
                    "Your next content experiment";
                  const hypothesis =
                    experiment.hypothesis ||
                    "No hypothesis recorded yet. Use the pre-publish analysis to define what you want to learn.";
                  const metrics = experiment.metrics;
                  const views =
                    typeof metrics?.views === "number"
                      ? metrics.views.toLocaleString("en-IN")
                      : "—";

                  return (
                    <article
                      key={experiment.experimentId}
                      className="rounded-2xl border border-violet-100 bg-gradient-to-r from-white to-violet-50/60 p-5 sm:p-6"
                    >
                      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                        <div className="flex min-w-0 gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                            <FlaskConical className="h-6 w-6" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-bold text-violet-700">
                                {experiment.platform || "Platform not specified"}
                              </span>
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  completed
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-amber-50 text-amber-700"
                                }`}
                              >
                                {completed ? (
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                ) : (
                                  <CircleDashed className="h-3.5 w-3.5" />
                                )}
                                {completed ? "Post-publish reviewed" : "In progress"}
                              </span>
                              <span className="text-sm text-slate-400">
                                Created {formatDate(experiment.createdAt)}
                              </span>
                            </div>
                            <h3 className="mt-3 break-words text-xl font-bold text-slate-900">{title}</h3>
                            <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600">{hypothesis}</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                              {experiment.format && <MetaChip label="Format" value={experiment.format} />}
                              {experiment.audience && <MetaChip label="Audience" value={experiment.audience} />}
                              {experiment.goal && <MetaChip label="Goal" value={experiment.goal} />}
                              {experiment.angle && <MetaChip label="Angle" value={experiment.angle} />}
                            </div>
                          </div>
                        </div>
                        <Link
                          href={completed ? "/post-publish-lab" : "/pre-publish-lab"}
                          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-2.5 text-base font-semibold text-violet-700 transition hover:bg-violet-700 hover:text-white"
                        >
                          {completed ? "View review" : "Continue"}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>

                      {completed && (
                        <div className="mt-5 grid gap-3 border-t border-violet-100 pt-5 sm:grid-cols-3">
                          <MiniMetric label="Views recorded" value={views} />
                          <MiniMetric
                            label="Engagement rate"
                            value={experiment.engagementRate !== undefined ? `${experiment.engagementRate}%` : "Not recorded"}
                          />
                          <MiniMetric
                            label="Post-publish analysis"
                            value={experiment.postAnalysis ? "Saved" : "Not available"}
                          />
                        </div>
                      )}
                    </article>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-violet-200 bg-gradient-to-br from-[#faf8ff] via-white to-[#f3f8ff] px-5 py-10 text-center sm:px-10">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-violet-700 shadow-sm ring-1 ring-violet-100">
                    <Beaker className="h-7 w-7" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-slate-900">
                    {experiments.length ? "No experiments in this filter" : "Your first experiment starts here"}
                  </h3>
                  <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                    {experiments.length
                      ? "Try another filter to see your saved experiments."
                      : "Create an experiment in Pre-Publish Lab. It will be saved here and remain available after you refresh the page."}
                  </p>
                  {!experiments.length && (
                    <Link
                      href="/pre-publish-lab"
                      className="mt-5 inline-flex items-center gap-2 rounded-full bg-violet-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-800"
                    >
                      Create your first experiment <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              )}
            </div>
          </section>

          <footer className="py-10 text-center">
            <p className="text-xs font-medium tracking-[0.12em] text-slate-400">
              CREATE WITH INTENTION. EVOLVE WITH INTELLIGENCE.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  tone,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  tone: "violet" | "blue" | "emerald";
}) {
  const tones = {
    violet: "bg-violet-100 text-violet-700",
    blue: "bg-sky-100 text-sky-700",
    emerald: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="rounded-2xl border border-white/90 bg-white/80 p-3 text-center shadow-sm backdrop-blur sm:p-4">
      <div className={`mx-auto flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>
        {icon}
      </div>
      <p className="mt-3 text-xl font-bold text-slate-900">{value.toString().padStart(2, "0")}</p>
      <p className="mt-1 text-[11px] font-medium leading-4 text-slate-500 sm:text-xs">{label}</p>
    </div>
  );
}

function StepCard({
  number,
  icon,
  title,
  description,
  tint,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  tint: "violet" | "blue" | "emerald";
}) {
  const tones = {
    violet: "bg-violet-100 text-violet-700 border-violet-100",
    blue: "bg-blue-100 text-blue-700 border-blue-100",
    emerald: "bg-emerald-100 text-emerald-700 border-emerald-100",
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tones[tint]}`}>
          {icon}
        </div>
        <span className="text-xs font-bold tracking-[0.14em] text-slate-300">{number}</span>
      </div>
      <h3 className="mt-4 font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600">
      <span className="font-semibold text-slate-400">{label}:</span> {value}
    </span>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white bg-white/80 p-3">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
