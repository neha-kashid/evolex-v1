"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  UserRound,
  Pencil,
  Sparkles,
  Target,
  FlaskConical,
  TrendingUp,
  ChartNoAxesCombined,
  Users,
  BookOpen,
  Lightbulb,
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  Save,
  X,
  BrainCircuit,
  Activity,
  Trophy,
  GitCompareArrows,
  CalendarCheck,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";

type Data = Record<string, unknown>;

function readSavedData(keys: string[]): Data | null {
  for (const key of keys) {
    try {
      const value = sessionStorage.getItem(key);
      if (!value) continue;
      const parsed: unknown = JSON.parse(value);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Data;
      }
    } catch {
      // Try the next available saved key.
    }
  }
  return null;
}

function getText(data: Data | null, keys: string[]): string {
  if (!data) return "";
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function getList(data: Data | null, keys: string[]): string[] {
  if (!data) return [];
  for (const key of keys) {
    const value = data[key];
    if (Array.isArray(value)) {
      return value.filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0
      );
    }
    if (typeof value === "string" && value.trim()) {
      return value.split(/[,;|]/).map((item) => item.trim()).filter(Boolean);
    }
  }
  return [];
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 ${className}`}
    >
      {children}
    </section>
  );
}

function SectionTitle({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
        {icon}
      </div>
      <div>
        <h2 className="font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm leading-5 text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

function EmptyState({
  message,
  href,
  linkText,
}: {
  message: string;
  href?: string;
  linkText?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-violet-200 bg-gradient-to-br from-[#faf8ff] via-white to-[#f3f8ff] px-4 py-7 text-center">
      <Sparkles className="mx-auto h-6 w-6 text-violet-500" />
      <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
        {message}
      </p>
      {href && linkText && (
        <Link
          href={href}
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-900"
        >
          {linkText} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const [creator, setCreator] = useState<Data | null>(null);
  const [experiment, setExperiment] = useState<Data | null>(null);
  const [preAnalysis, setPreAnalysis] = useState<Data | null>(null);
  const [postAnalysis, setPostAnalysis] = useState<Data | null>(null);
  const [experimentHistory, setExperimentHistory] = useState<Data[]>([]);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [niche, setNiche] = useState("");

  useEffect(() => {
    const profile = readSavedData([
      "evolex_creator_profile",
      "evolex_profile",
      "evolex_new_creator_answers",
      "evolex_creator_answers",
    ]);

    const currentExperiment = readSavedData([
      "evolex_publish_ready",
      "evolex_experiment_status",
      "evolex_pre_publish",
    ]);

    const before = readSavedData(["evolex_pre_publish_analysis"]);
    const after = readSavedData(["evolex_post_analysis"]);

    setCreator(profile);
    setExperiment(currentExperiment);
    setPreAnalysis(before);
    setPostAnalysis(after);

    // Optional history written by experiment workflows. The page still works
    // when older workflows have only saved the current experiment.
    try {
      const rawHistory = localStorage.getItem("evolex_experiment_history");
      if (rawHistory) {
        const parsed: unknown = JSON.parse(rawHistory);
        if (Array.isArray(parsed)) {
          setExperimentHistory(
            parsed.filter(
              (item): item is Data =>
                Boolean(item) && typeof item === "object" && !Array.isArray(item)
            )
          );
        }
      }
    } catch {
      setExperimentHistory([]);
    }

    setName(getText(profile, ["name", "creatorName", "fullName"]));
    setBio(getText(profile, ["bio", "description"]));
    setNiche(
      getText(profile, ["niche", "creatorNiche", "primaryInterest"]) ||
        getList(profile, ["interests", "topics"]).join(", ")
    );
  }, []);

  const savedProfile = creator ?? {};
  const interests = getList(savedProfile, [
    "interests",
    "topics",
    "selectedInterests",
  ]);
  const strengths = getList(savedProfile, [
    "strengths",
    "selectedStrengths",
    "skills",
  ]);
  const audience = getText(savedProfile, [
    "audience",
    "targetAudience",
    "intendedAudience",
  ]);
  const goals = getList(savedProfile, ["goals", "creatorGoals", "motivations"]);
  const formats = getList(savedProfile, [
    "formats",
    "contentFormats",
    "preferredFormats",
  ]);

  const concept = getText(experiment, ["concept", "idea", "title"]);
  const hypothesis = getText(experiment, ["hypothesis"]);
  const platform = getText(experiment, ["platform"]);
  const contentFormat = getText(experiment, ["format"]);

  const preScores = useMemo(() => {
    const source = preAnalysis;
    const result: { label: string; score: number }[] = [];
    if (!source) return result;

    const scoreFields: [string, string][] = [
      ["overallScore", "Overall score"],
      ["hookScore", "Hook"],
      ["clarityScore", "Clarity"],
      ["audienceFitScore", "Audience fit"],
      ["structureScore", "Structure"],
    ];

    for (const [key, label] of scoreFields) {
      const value = source[key];
      if (typeof value === "number" && Number.isFinite(value)) {
        result.push({ label, score: Math.max(0, Math.min(10, value)) });
      }
    }

    return result;
  }, [preAnalysis]);

  const postMetrics = useMemo(() => {
    const metrics = postAnalysis?.metrics;
    if (!metrics || typeof metrics !== "object") return null;
    return metrics as Record<string, unknown>;
  }, [postAnalysis]);

  const totalInterests = interests.length;
  const totalStrengths = strengths.length;
  const hasResults = Boolean(postMetrics);
  const views =
    typeof postMetrics?.views === "number" ? postMetrics.views : null;
  const engagementRate = postAnalysis?.engagementRate;
  const postSummary = getText(postAnalysis, ["summary", "insights", "analysis"]);
  const profileReady = Boolean(
    name || bio || niche || interests.length || strengths.length || audience
  );

  function saveProfile() {
    const updated = {
      ...(creator ?? {}),
      name: name.trim(),
      bio: bio.trim(),
      niche: niche.trim(),
    };

    sessionStorage.setItem("evolex_creator_profile", JSON.stringify(updated));
    setCreator(updated);
    setEditing(false);
  }

  return (
    <div className="flex min-h-screen bg-[#f8f9ff] text-slate-800">
      <Sidebar />

      <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white px-3 py-1.5 text-xs font-semibold text-violet-700 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-violet-500" />
                YOUR CREATOR IDENTITY
              </p>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                My Profile
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Understand your strengths, explore your creative identity, and
                see what your experiments are teaching you.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setEditing(!editing)}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-violet-700"
            >
              {editing ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
              {editing ? "Cancel editing" : "Edit profile"}
            </button>
          </header>

          <section className="relative mb-6 overflow-hidden rounded-[28px] border border-violet-100 bg-gradient-to-br from-white via-[#f7f3ff] to-[#edf5ff] p-6 shadow-sm sm:p-8">
            <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-violet-300/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 right-1/3 h-52 w-52 rounded-full bg-sky-200/30 blur-3xl" />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[26px] border border-white bg-white text-violet-700 shadow-sm">
                <UserRound className="h-10 w-10" />
              </div>

              <div className="min-w-0 flex-1">
                {editing ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-xs font-semibold text-slate-600">
                      Creator name
                      <input
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Your name"
                        className="mt-1.5 w-full rounded-xl border border-violet-100 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                      />
                    </label>
                    <label className="text-xs font-semibold text-slate-600">
                      Creator niche
                      <input
                        value={niche}
                        onChange={(event) => setNiche(event.target.value)}
                        placeholder="e.g. Education, food, travel"
                        className="mt-1.5 w-full rounded-xl border border-violet-100 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                      />
                    </label>
                    <label className="text-xs font-semibold text-slate-600 sm:col-span-2">
                      Bio
                      <textarea
                        value={bio}
                        onChange={(event) => setBio(event.target.value)}
                        rows={2}
                        placeholder="What do you want to create and share?"
                        className="mt-1.5 w-full resize-y rounded-xl border border-violet-100 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                      />
                    </label>
                    <div className="sm:col-span-2">
                      <button
                        onClick={saveProfile}
                        className="inline-flex items-center gap-2 rounded-full bg-violet-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-800"
                      >
                        <Save className="h-4 w-4" /> Save profile
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="break-words text-2xl font-bold tracking-tight text-slate-900">
                      {name || "Your creator identity"}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                      {bio ||
                        "Build a profile around what you love, what you're good at, and the audience you want to reach."}
                    </p>
                    {niche && (
                      <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white/80 px-3 py-1.5 text-xs font-semibold text-violet-700">
                        <Target className="h-3.5 w-3.5" /> {niche}
                      </div>
                    )}
                  </>
                )}
              </div>

              {!editing && (
                <div className="rounded-2xl border border-white/90 bg-white/80 p-4 shadow-sm backdrop-blur sm:min-w-44">
                  <p className="text-xs font-medium text-slate-500">
                    Profile setup
                  </p>
                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {profileReady ? "In progress" : "Getting started"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {profileReady
                      ? "Your creator details are available."
                      : "Start by defining your creator identity."}
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={<Target className="h-5 w-5" />}
              label="Interests selected"
              value={totalInterests ? String(totalInterests) : "—"}
              note={totalInterests ? "From your saved answers" : "Not available yet"}
              tint="violet"
            />
            <StatCard
              icon={<Lightbulb className="h-5 w-5" />}
              label="Strengths identified"
              value={totalStrengths ? String(totalStrengths) : "—"}
              note={totalStrengths ? "From your saved answers" : "Not available yet"}
              tint="blue"
            />
            <StatCard
              icon={<FlaskConical className="h-5 w-5" />}
              label="Current experiment"
              value={experiment ? "1" : "0"}
              note={experiment ? "Saved experiment found" : "No saved experiment found"}
              tint="emerald"
            />
            <StatCard
              icon={<ChartNoAxesCombined className="h-5 w-5" />}
              label="Results recorded"
              value={hasResults ? "Yes" : "—"}
              note={hasResults ? "Post-publish data found" : "Awaiting post-publish data"}
              tint="amber"
            />
          </section>

          <div className="mb-6 grid gap-6 lg:grid-cols-2">
            <Card>
              <SectionTitle
                icon={<Target className="h-5 w-5" />}
                title="Your creator strengths"
                subtitle="A snapshot of the strengths you selected in your questionnaire."
              />

              {strengths.length ? (
                <div className="space-y-4">
                  {strengths.map((strength, index) => {
                    const width = Math.max(30, 100 - index * 12);
                    return (
                      <div key={strength}>
                        <div className="mb-1.5 flex items-center justify-between gap-3">
                          <span className="text-sm font-medium text-slate-700">
                            {strength}
                          </span>
                          <span className="text-xs text-slate-400">
                            Selected
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-violet-50">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-sky-400"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <p className="pt-1 text-xs leading-5 text-slate-400">
                    Bars are a visual listing of selected strengths, not measured
                    ability scores.
                  </p>
                </div>
              ) : (
                <EmptyState
                  message="Your selected strengths will appear here once the questionnaire answers are saved to your profile."
                  href="/new-creator"
                  linkText="Complete questionnaire"
                />
              )}
            </Card>

            <Card>
              <SectionTitle
                icon={<BookOpen className="h-5 w-5" />}
                title="Your interests"
                subtitle="Topics that can help EVOLEX personalize content opportunities."
              />

              {interests.length ? (
                <>
                  <div className="flex flex-wrap gap-2">
                    {interests.map((interest) => (
                      <span
                        key={interest}
                        className="rounded-full border border-violet-100 bg-violet-50 px-3 py-2 text-sm font-medium text-violet-800"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                  {audience && (
                    <div className="mt-6 rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 to-white p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                        <Users className="h-4 w-4 text-sky-700" />
                        Intended audience
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{audience}</p>
                    </div>
                  )}
                </>
              ) : (
                <EmptyState
                  message="Your chosen topics will appear here. They'll help shape more relevant opportunity suggestions."
                  href="/new-creator"
                  linkText="Choose your interests"
                />
              )}
            </Card>
          </div>

          <div className="mb-6 grid gap-6 lg:grid-cols-2">
            <Card>
              <SectionTitle
                icon={<TrendingUp className="h-5 w-5" />}
                title="Pre-publish analysis"
                subtitle="See the scores returned by your most recently saved AI analysis."
              />

              {preScores.length ? (
                <div className="space-y-4">
                  {preScores.map((item) => (
                    <div key={item.label}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">
                          {item.label}
                        </span>
                        <span className="text-sm font-bold text-violet-700">
                          {item.score.toFixed(1)}/10
                        </span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-600 to-sky-400"
                          style={{ width: `${item.score * 10}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  <Link
                    href="/pre-publish-lab"
                    className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-900"
                  >
                    Open Pre-Publish Lab <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <EmptyState
                  message="When your pre-publish analysis is saved, its actual scores will appear here."
                  href="/pre-publish-lab"
                  linkText="Analyze content"
                />
              )}
            </Card>

            <Card>
              <SectionTitle
                icon={<ChartNoAxesCombined className="h-5 w-5" />}
                title="Post-publish insights"
                subtitle="Performance information from your saved post-publish analysis."
              />

              {postMetrics ? (
                <div className="grid grid-cols-2 gap-3">
                  <MetricTile
                    label="Views"
                    value={views !== null ? views.toLocaleString("en-IN") : "—"}
                  />
                  <MetricTile
                    label="Engagement rate"
                    value={
                      engagementRate !== undefined
                        ? `${String(engagementRate)}%`
                        : "—"
                    }
                  />
                  <MetricTile
                    label="Likes"
                    value={formatMetric(postMetrics.likes)}
                  />
                  <MetricTile
                    label="Saves"
                    value={formatMetric(postMetrics.saves)}
                  />
                  {postSummary && (
                    <div className="col-span-2 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                      <p className="text-sm font-semibold text-emerald-900">
                        Saved analysis
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {postSummary}
                      </p>
                    </div>
                  )}
                  <Link
                    href="/post-publish-lab"
                    className="col-span-2 mt-1 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-900"
                  >
                    Open Post-Publish Lab <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <EmptyState
                  message="After you record post performance, your real views, engagement metrics, and insights will appear here."
                  href="/post-publish-lab"
                  linkText="Review post performance"
                />
              )}
            </Card>
          </div>

          <div className="mb-6 grid gap-6 lg:grid-cols-2">
            <Card>
              <SectionTitle
                icon={<FlaskConical className="h-5 w-5" />}
                title="Current experiment"
                subtitle="The experiment currently saved in your workspace."
              />

              {experiment ? (
                <>
                  <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-white to-violet-50/60 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700">
                        {platform || "Platform not specified"}
                      </span>
                      {contentFormat && (
                        <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700">
                          {contentFormat}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                        {hasResults ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <CircleDashed className="h-3.5 w-3.5" />
                        )}
                        {hasResults ? "Results available" : "Awaiting results"}
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-bold text-slate-900">
                      {concept || "Your content experiment"}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {hypothesis ||
                        "Add a hypothesis to make your next content experiment measurable."}
                    </p>
                  </div>
                  <Link
                    href="/experiments"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-900"
                  >
                    View My Experiments <ArrowRight className="h-4 w-4" />
                  </Link>
                </>
              ) : (
                <EmptyState
                  message="Your current experiment will appear here once you save one in EVOLEX."
                  href="/experiments"
                  linkText="Explore My Experiments"
                />
              )}
            </Card>

            <Card>
              <SectionTitle
                icon={<Sparkles className="h-5 w-5" />}
                title="Your creator goals"
                subtitle="The outcomes that motivate your creator journey."
              />

              {goals.length || formats.length ? (
                <div className="space-y-5">
                  {goals.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Goals
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {goals.map((goal) => (
                          <span
                            key={goal}
                            className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800"
                          >
                            {goal}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {formats.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Preferred content formats
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {formats.map((format) => (
                          <span
                            key={format}
                            className="rounded-full border border-sky-100 bg-sky-50 px-3 py-2 text-sm font-medium text-sky-800"
                          >
                            {format}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <EmptyState
                  message="Your goals and preferred formats will appear here when they are available in your saved creator answers."
                  href="/new-creator"
                  linkText="Review creator questionnaire"
                />
              )}
            </Card>
          </div>

          {/* ADDED INSIGHTS — existing profile styling and sections remain unchanged */}
          <section className="mb-6">
            <SectionTitle
              icon={<BrainCircuit className="h-5 w-5" />}
              title="Your Creator DNA"
              subtitle="An evolving picture of your creative identity, based on the information you have actually saved."
            />
            <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              <Card className="bg-gradient-to-br from-white via-[#faf8ff] to-[#f0f7ff]">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-violet-600">Current signals</p>
                <h3 className="mt-3 text-xl font-bold text-slate-900">
                  {strengths.length || interests.length
                    ? `${strengths[0] || interests[0]}${interests[0] && interests[0] !== strengths[0] ? ` + ${interests[0]}` : ""}`
                    : "Your creative identity is taking shape"}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {strengths.length || interests.length
                    ? `Your saved profile highlights ${strengths.length ? strengths.slice(0, 3).join(", ").toLowerCase() : "your selected interests"}. As you complete more experiments, EVOLEX can compare these starting preferences with your content scores and real results.`
                    : "Complete your creator questionnaire and run content experiments. EVOLEX will use those signals to build a more personalized picture over time."}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {strengths.slice(0, 4).map((item) => <ProfileChip key={item} label={item} />)}
                  {interests.slice(0, 4).map((item) => <ProfileChip key={item} label={item} blue />)}
                </div>
              </Card>
              <Card>
                <SectionTitle icon={<Lightbulb className="h-5 w-5" />} title="Your next best experiment" subtitle="A practical next step based on available evidence." />
                {preScores.length ? (
                  <>
                    <p className="text-sm leading-6 text-slate-600">Your lowest recorded pre-publish score is <strong>{[...preScores].sort((a, b) => a.score - b.score)[0].label.toLowerCase()}</strong>. Try improving that one element while keeping the topic and audience consistent.</p>
                    <p className="mt-3 rounded-xl bg-violet-50 p-3 text-sm font-medium text-violet-800">Suggested test: change one variable, then compare the next result with this experiment.</p>
                  </>
                ) : (
                  <EmptyState message="Run a pre-publish analysis to get a next-experiment suggestion grounded in your actual content scores." href="/pre-publish-lab" linkText="Analyze content" />
                )}
              </Card>
            </div>
          </section>

          <section className="mb-6 grid gap-6 lg:grid-cols-2">
            <Card>
              <SectionTitle icon={<Activity className="h-5 w-5" />} title="Content quality trend" subtitle="Track whether your pre-publish scores improve across experiments." />
              {experimentHistory.length >= 2 ? (
                <HistoryScoreChart history={experimentHistory} />
              ) : preScores.length ? (
                <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/40 p-5">
                  <p className="text-sm font-semibold text-slate-800">Latest recorded quality scores</p>
                  <div className="mt-4 space-y-3">
                    {preScores.map((item) => <ScoreBar key={item.label} label={item.label} score={item.score} />)}
                  </div>
                  <p className="mt-4 text-xs leading-5 text-slate-500">A trend needs at least two saved experiment analyses. These bars show your current analysis, not a historical trend.</p>
                </div>
              ) : <EmptyState message="Your quality trend will appear after you save pre-publish scores. Two or more analyzed experiments are needed to show change over time." href="/pre-publish-lab" linkText="Start pre-publish analysis" />}
            </Card>

            <Card>
              <SectionTitle icon={<GitCompareArrows className="h-5 w-5" />} title="Prediction accuracy" subtitle="Compare what you expected with what actually happened." />
              {getNumeric(experiment, ["predictedViews", "expectedViews", "predicted_views"]) !== null && views !== null ? (
                <PredictionComparison predicted={getNumeric(experiment, ["predictedViews", "expectedViews", "predicted_views"]) as number} actual={views} />
              ) : (
                <EmptyState message="Prediction accuracy is not available yet. Save a numeric performance prediction with an experiment and record its actual views to compare them here." href="/experiments" linkText="Review experiments" />
              )}
              <p className="mt-4 text-xs leading-5 text-slate-400">EVOLEX will only calculate accuracy when both a prediction and its matching actual result are saved.</p>
            </Card>
          </section>

          <section className="mb-6 grid gap-6 lg:grid-cols-3">
            <Card>
              <SectionTitle icon={<Trophy className="h-5 w-5" />} title="Content patterns" subtitle="Find formats or topics that repeatedly perform well." />
              {experimentHistory.length >= 2 ? (
                <div className="space-y-3">
                  {getPatternSummary(experimentHistory).map((pattern) => <div key={pattern.label} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3"><p className="text-sm font-semibold text-slate-800">{pattern.label}</p><p className="mt-1 text-xs text-slate-500">{pattern.detail}</p></div>)}
                </div>
              ) : <EmptyState message="Complete at least two experiments with recorded outcomes to start comparing content patterns." href="/experiments" linkText="View experiments" />}
            </Card>

            <Card>
              <SectionTitle icon={<CalendarCheck className="h-5 w-5" />} title="Consistency & learning" subtitle="Measure progress through experiments, not just views." />
              <div className="grid grid-cols-2 gap-3">
                <MetricTile label="Experiments saved" value={String(Math.max(experimentHistory.length, experiment ? 1 : 0))} />
                <MetricTile label="Results recorded" value={String(experimentHistory.filter((item) => item.postAnalysis || item.metrics || item.results).length + (postMetrics && !experimentHistory.length ? 1 : 0))} />
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">Each completed review gives you another learning signal. Keep the hypothesis, change one variable at a time, and record the outcome.</p>
            </Card>

            <Card>
              <SectionTitle icon={<ChartNoAxesCombined className="h-5 w-5" />} title="Content mix" subtitle="Understand how your experiments are distributed by format." />
              {experimentHistory.length ? <ContentMix history={experimentHistory} currentFormat={contentFormat} /> : contentFormat ? <div className="rounded-2xl bg-gradient-to-r from-violet-50 to-sky-50 p-4"><p className="text-sm font-semibold text-slate-800">Current format</p><p className="mt-2 text-sm text-violet-800">{contentFormat}</p><p className="mt-2 text-xs text-slate-500">Save more experiments to build a content-mix comparison.</p></div> : <EmptyState message="Your content mix will appear after you save experiments with their formats." href="/experiments" linkText="Explore experiments" />}
            </Card>
          </section>

          <footer className="py-8 text-center">
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
  label,
  value,
  note,
  tint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  note: string;
  tint: "violet" | "blue" | "emerald" | "amber";
}) {
  const tones = {
    violet: "bg-violet-100 text-violet-700",
    blue: "bg-sky-100 text-sky-700",
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tint]}`}>
          {icon}
        </div>
        <span className="text-xs font-semibold text-slate-400">PROFILE</span>
      </div>
      <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
      <p className="mt-1 text-xs leading-5 text-slate-400">{note}</p>
    </div>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-violet-50/40 p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function formatMetric(value: unknown): string {
  return typeof value === "number" ? value.toLocaleString("en-IN") : "—";
}


function ProfileChip({ label, blue = false }: { label: string; blue?: boolean }) {
  return <span className={`rounded-full border px-3 py-1.5 text-xs font-medium ${blue ? "border-sky-100 bg-sky-50 text-sky-800" : "border-violet-100 bg-violet-50 text-violet-800"}`}>{label}</span>;
}

function getNumeric(data: Data | null, keys: string[]): number | null {
  if (!data) return null;
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  }
  return null;
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  return <div><div className="mb-1 flex justify-between gap-3 text-xs"><span className="font-medium text-slate-600">{label}</span><span className="font-bold text-violet-700">{score.toFixed(1)}/10</span></div><div className="h-2 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-sky-400" style={{ width: `${score * 10}%` }} /></div></div>;
}

function HistoryScoreChart({ history }: { history: Data[] }) {
  const points = history.map((item, index) => {
    const analysis = item.prePublishAnalysis && typeof item.prePublishAnalysis === "object" ? item.prePublishAnalysis as Data : item;
    const score = getNumeric(analysis, ["overallScore", "score", "contentScore"]);
    return { label: getText(item, ["concept", "title", "name"]) || `Experiment ${index + 1}`, score };
  }).filter((item): item is { label: string; score: number } => item.score !== null).slice(-8);
  if (points.length < 2) return <EmptyState message="History was found, but at least two entries need a saved overall score to draw a trend." />;
  return <div className="space-y-4">{points.map((point, index) => <div key={`${point.label}-${index}`}><div className="mb-1 flex justify-between gap-3 text-xs"><span className="truncate text-slate-600">{point.label}</span><strong className="text-violet-700">{point.score.toFixed(1)}/10</strong></div><div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-sky-400" style={{ width: `${Math.max(0, Math.min(10, point.score)) * 10}%` }} /></div></div>)}</div>;
}

function PredictionComparison({ predicted, actual }: { predicted: number; actual: number }) {
  const max = Math.max(predicted, actual, 1);
  const difference = actual - predicted;
  return <div className="space-y-4"><div><div className="mb-1 flex justify-between text-sm"><span className="text-slate-600">Predicted views</span><strong>{predicted.toLocaleString("en-IN")}</strong></div><div className="h-3 rounded-full bg-slate-100"><div className="h-3 rounded-full bg-violet-400" style={{ width: `${predicted / max * 100}%` }} /></div></div><div><div className="mb-1 flex justify-between text-sm"><span className="text-slate-600">Actual views</span><strong>{actual.toLocaleString("en-IN")}</strong></div><div className="h-3 rounded-full bg-slate-100"><div className="h-3 rounded-full bg-sky-500" style={{ width: `${actual / max * 100}%` }} /></div></div><p className={`rounded-xl p-3 text-sm font-semibold ${difference >= 0 ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>{difference >= 0 ? "Above prediction" : "Below prediction"} by {Math.abs(difference).toLocaleString("en-IN")} views</p></div>;
}

function getPatternSummary(history: Data[]): { label: string; detail: string }[] {
  const counts = new Map<string, number>();
  for (const item of history) {
    const format = getText(item, ["format", "contentFormat", "contentType"]);
    if (format) counts.set(format, (counts.get(format) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([label, count]) => ({ label, detail: `Used in ${count} saved experiment${count === 1 ? "" : "s"}. This shows frequency, not performance superiority.` }));
}

function ContentMix({ history, currentFormat }: { history: Data[]; currentFormat: string }) {
  const counts = new Map<string, number>();
  for (const item of history) {
    const format = getText(item, ["format", "contentFormat", "contentType"]);
    if (format) counts.set(format, (counts.get(format) ?? 0) + 1);
  }
  if (!counts.size && currentFormat) counts.set(currentFormat, 1);
  const total = [...counts.values()].reduce((sum, value) => sum + value, 0);
  if (!total) return <EmptyState message="Save experiment formats to see your content mix." />;
  return <div className="space-y-3">{[...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([format, count]) => <div key={format}><div className="mb-1 flex justify-between gap-2 text-xs"><span className="text-slate-600">{format}</span><span className="font-semibold text-slate-700">{Math.round(count / total * 100)}%</span></div><div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-sky-400" style={{ width: `${count / total * 100}%` }} /></div></div>)}</div>;
}
