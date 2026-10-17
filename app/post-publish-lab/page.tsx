"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import Sidebar from "../../components/Sidebar";
import { upsertExperimentHistory } from "@/lib/experiment-history";

type ExperimentData = {
  experimentId?: string;
  concept?: string;
  hypothesis?: string;
  hook?: string;
  audience?: string;
  format?: string;
  angle?: string;
  platform?: string;
  predictedViews?: number;
};

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100";

const sampleReport = {
  summary:
    "This is a demonstration report showing how EVOLEX AI structures content feedback. It is not based on your uploaded video or URL. Run AI analysis to request a report about your own content.",
  hook: {
    verdict: "Needs a clear, audience-specific promise",
    details:
      "A strong opening quickly tells viewers who the content is for and why they should keep watching. Review the first 1–3 seconds for a clear visual or verbal reason to stay.",
  },
  storytelling: {
    verdict: "Build a simple progression",
    details:
      "A useful structure is: audience problem → specific insight → example or proof → one next step. Remove setup that does not help the viewer reach the payoff.",
  },
  strengths: [
    "The workflow encourages reviewing the creative itself, not just a view count.",
    "A focused experiment makes it easier to learn what to change in the next post.",
  ],
  improvements: [
    "Make the opening promise specific and understandable without extra context.",
    "Use one main idea and support it with a concrete example.",
    "Finish with a natural next step instead of several competing calls to action.",
  ],
  hypothesis:
    "No conclusion can be drawn without the original hypothesis and reliable performance evidence. Treat this as a creative review, not proof of what caused a post to perform.",
  nextExperiment:
    "Keep the topic and target audience consistent. Change only the opening hook in the next version, then compare retention or average watch time where the platform provides it.",
  successMetrics:
    "Compare first-seconds retention or average watch time first; then review shares, saves, and meaningful comments. Use platform-reported metrics when available.",
};


type ReportSectionKey =
  | "summary"
  | "hook"
  | "storytelling"
  | "worked"
  | "improve"
  | "hypothesis"
  | "next"
  | "metrics";

const reportHeadings: { key: ReportSectionKey; labels: string[] }[] = [
  { key: "summary", labels: ["summary", "executive summary", "overall assessment", "content summary"] },
  { key: "hook", labels: ["hook analysis", "hook", "opening hook"] },
  { key: "storytelling", labels: ["storytelling & content quality", "storytelling and content quality", "storytelling", "content analysis", "content quality"] },
  { key: "worked", labels: ["what worked", "strengths", "what went well", "positive signals"] },
  { key: "improve", labels: ["what could improve", "what to improve", "improvements", "opportunities to improve"] },
  { key: "hypothesis", labels: ["hypothesis assessment", "hypothesis result", "original hypothesis"] },
  { key: "next", labels: ["recommended next experiment", "next experiment", "recommendation", "action plan"] },
  { key: "metrics", labels: ["success signals to track", "success metrics", "metrics to track", "what to measure"] },
];

function extractReportSections(text: string): Partial<Record<ReportSectionKey, string>> {
  const lines = text.split(/\r?\n/);
  const sections: Partial<Record<ReportSectionKey, string>> = {};
  let current: ReportSectionKey | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    const normalized = trimmed
      .replace(/^#+\s*/, "")
      .replace(/^[\d.)\s*-]+/, "")
      .replace(/[*_:`]/g, "")
      .replace(/:$/, "")
      .trim()
      .toLowerCase();

    const heading = reportHeadings.find((item) =>
      item.labels.some((label) => normalized === label || normalized.startsWith(`${label} `))
    );

    if (heading) {
      current = heading.key;
      if (!sections[current]) sections[current] = "";
      continue;
    }

    if (current && trimmed) {
      sections[current] = `${sections[current] ? `${sections[current]}\n` : ""}${trimmed}`;
    }
  }

  for (const key of Object.keys(sections) as ReportSectionKey[]) {
    sections[key] = sections[key]?.trim();
  }
  return sections;
}

export default function PostPublishLab() {
  const [video, setVideo] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoError, setVideoError] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [metrics, setMetrics] = useState({
    views: "",
    reach: "",
    likes: "",
    comments: "",
    shares: "",
    saves: "",
    followersGained: "",
    averageWatchTime: "",
  });
  const [formError, setFormError] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [sampleMode, setSampleMode] = useState(false);
  const [experiment, setExperiment] = useState<ExperimentData | null>(null);

  useEffect(() => {
    try {
      const stored =
        sessionStorage.getItem("evolex_publish_ready") ??
        sessionStorage.getItem("evolex_experiment_status");
      if (stored) setExperiment(JSON.parse(stored) as ExperimentData);
    } catch (error) {
      console.error("Unable to load published experiment:", error);
    }
  }, []);

  useEffect(() => {
    if (!video) {
      setVideoUrl("");
      return;
    }
    const url = URL.createObjectURL(video);
    setVideoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [video]);

 
function handleVideoChange(event: ChangeEvent<HTMLInputElement>) {
  const file = event.target.files?.[0] ?? null;

  setVideoError("");
  setFormError("");
  setAiError("");
  setAiAnalysis("");
  setSampleMode(false);

  if (!file) return;

  const allowedTypes = ["video/mp4", "video/webm", "video/quicktime"];

  if (!allowedTypes.includes(file.type)) {
    setVideoError("Choose an MP4, WebM, or MOV video.");
    event.target.value = "";
    return;
  }

  if (file.size > 20 * 1024 * 1024) {
    setVideoError("For this demo, your video must be 20 MB or smaller.");
    event.target.value = "";
    return;
  }

  setVideo(file);
}

  function updateMetric(field: keyof typeof metrics, value: string) {
    setMetrics((current) => ({ ...current, [field]: value }));
    setFormError("");
    setAiError("");
    setAiAnalysis("");
    setSampleMode(false);
  }

  async function analyzeVideoWithAI() {
    const requiredViews = Number(metrics.views);
    if (!metrics.views.trim() || !Number.isFinite(requiredViews) || requiredViews <= 0) {
      setFormError("Enter actual views greater than zero to analyze your post.");
      return;
    }

    const numericMetrics = Object.fromEntries(
      Object.entries(metrics).map(([key, value]) => [key, value.trim() === "" ? 0 : Number(value)]),
    );
    const invalidMetric = Object.entries(numericMetrics).some(
      ([, value]) => !Number.isFinite(value) || Number(value) < 0,
    );
    if (invalidMetric) {
      setFormError("Enter valid non-negative numbers for all metrics.");
      return;
    }

    setAiLoading(true);
    setAiError("");
    setFormError("");
    setAiAnalysis("");
    setSampleMode(false);

    try {
      const formData = new FormData();
      if (video) formData.append("video", video);
      formData.append("platform", platform);
      formData.append("metrics", JSON.stringify({
        ...numericMetrics,
        interactions: Number(numericMetrics.likes) + Number(numericMetrics.comments) + Number(numericMetrics.shares) + Number(numericMetrics.saves),
        engagementRate: ((Number(numericMetrics.likes) + Number(numericMetrics.comments) + Number(numericMetrics.shares) + Number(numericMetrics.saves)) / requiredViews) * 100,
      }));
      if (experiment) formData.append("experiment", JSON.stringify(experiment));

      const response = await fetch("/api/analyze-post-publish", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "AI analysis failed.");
      if (typeof data.analysis !== "string" || !data.analysis.trim()) {
        throw new Error("The AI response was empty. Please try again.");
      }
      setAiAnalysis(data.analysis);

      const now = new Date().toISOString();
      const updatedExperiment = {
        ...(experiment ?? {}),
        experimentId: experiment?.experimentId || crypto.randomUUID(),
        concept: experiment?.concept || "Post-publish performance review",
        platform,
        predictedViews: experiment?.predictedViews,
        actualViews: Number(numericMetrics.views),
        postMetrics: numericMetrics,
        postAnalysis: data.analysis,
        analyzedAt: now,
        status: "completed" as const,
        createdAt: (experiment as (ExperimentData & { createdAt?: string }) | null)?.createdAt || now,
        updatedAt: now,
      };

      try {
        upsertExperimentHistory(updatedExperiment);
        sessionStorage.setItem("evolex_publish_ready", JSON.stringify(updatedExperiment));
        sessionStorage.setItem("evolex_experiment_status", JSON.stringify(updatedExperiment));
        sessionStorage.setItem("evolex_post_analysis", JSON.stringify({
          experiment: updatedExperiment,
          metrics: numericMetrics,
          analysis: data.analysis,
          analyzedAt: now,
        }));
        setExperiment(updatedExperiment);
      } catch (storageError) {
        console.error("Could not save post-publish analysis:", storageError);
        setAiError("The analysis completed, but EVOLEX AI could not save it to experiment history. Check browser storage permissions and try again.");
      }
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "Could not complete the AI analysis. Please try again.");
    } finally {
      setAiLoading(false);
    }
  }

  function showSampleAnalysis() {
    setAiError("");
    setAiAnalysis("");
    setSampleMode(true);
  }

  const reportText = sampleMode
    ? [
        "SAMPLE REPORT — NOT GENERATED FROM YOUR CONTENT",
        "",
        "SUMMARY",
        sampleReport.summary,
        "",
        "HOOK ANALYSIS",
        `${sampleReport.hook.verdict}\n${sampleReport.hook.details}`,
        "",
        "STORYTELLING & CONTENT QUALITY",
        `${sampleReport.storytelling.verdict}\n${sampleReport.storytelling.details}`,
        "",
        "WHAT WORKED",
        ...sampleReport.strengths.map((item) => `• ${item}`),
        "",
        "WHAT COULD IMPROVE",
        ...sampleReport.improvements.map((item) => `• ${item}`),
        "",
        "HYPOTHESIS ASSESSMENT",
        experiment?.hypothesis
          ? `Original hypothesis: ${experiment.hypothesis}\n${sampleReport.hypothesis}`
          : sampleReport.hypothesis,
        "",
        "RECOMMENDED NEXT EXPERIMENT",
        sampleReport.nextExperiment,
        "",
        "SUCCESS SIGNALS TO TRACK",
        sampleReport.successMetrics,
      ].join("\n")
    : aiAnalysis;

  const reportSections = extractReportSections(reportText);

  return (
    <div className="flex min-h-screen bg-[#f8f9ff] text-slate-800">
      <Sidebar />

      <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <header className="mb-8">
            <p className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white px-3 py-1.5 text-xs font-semibold text-violet-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-violet-500" />
              EVOLEX AI PERFORMANCE INTELLIGENCE
            </p>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
  Post <span className="text-violet-600">Publish</span> Lab
</h1>
<p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
  Review your published content, understand creative signals, and
  turn every post into a focused next experiment.
</p>
</header>

          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-xl">↗</div>
              <h2 className="mt-3 font-semibold text-slate-800">Review</h2>
              <p className="mt-1 text-sm leading-5 text-slate-500">Enter actual post-performance metrics.</p>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-xl">◉</div>
              <h2 className="mt-3 font-semibold text-slate-800">Understand</h2>
              <p className="mt-1 text-sm leading-5 text-slate-500">Explore the hook, story, and creative quality.</p>
            </div>
            <div className="rounded-2xl border border-fuchsia-100 bg-white p-5 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-100 text-xl">✦</div>
              <h2 className="mt-3 font-semibold text-slate-800">Improve</h2>
              <p className="mt-1 text-sm leading-5 text-slate-500">Get a focused experiment to try next.</p>
            </div>
          </div>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-3xl">↑</div>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-violet-600">Step 01</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">Your published video</h2>
                <p className="mt-1 text-base leading-6 text-slate-500">
                  Optionally upload the published video so EVOLEX AI can review its creative structure alongside your actual metrics.
                </p>
              </div>
            </div>

            <label
              htmlFor="published-video"
              className="mt-6 flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-violet-200 bg-gradient-to-br from-violet-50 to-blue-50 px-5 py-9 text-center transition hover:border-violet-400"
            >
              <span className="text-lg font-semibold text-slate-800">{video ? video.name : "Choose a video to upload"}</span>
              <span className="mt-2 text-base text-slate-500">MP4, WebM, or MOV · Maximum 20 MB</span>
              <span className="mt-5 rounded-xl bg-violet-600 px-5 py-3 text-base font-semibold text-white">Browse files</span>
              <input
                id="published-video"
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={handleVideoChange}
                className="sr-only"
              />
            </label>

            {videoError && <p role="alert" className="mt-3 text-base text-red-600">{videoError}</p>}

            {video && (
              <div className="mt-5 rounded-2xl border border-violet-100 bg-violet-50/50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-800">Video selected</p>
                    <p className="mt-1 text-sm text-slate-500">{(video.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVideo(null)}
                    className="rounded-lg px-3 py-2 text-base font-medium text-violet-700 hover:bg-violet-100"
                  >
                    Remove video
                  </button>
                </div>
                {videoUrl && (
                  <video controls preload="metadata" className="mt-4 max-h-96 w-full rounded-xl bg-black" src={videoUrl}>
                    Your browser does not support video playback.
                  </video>
                )}
              </div>
            )}
            <p className="mt-4 text-sm leading-5 text-slate-400">
              The selected video stays in your browser until you choose Analyze with EVOLEX AI. If selected, it is sent to the server for analysis alongside your metrics.
            </p>
          </section>

          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="mb-6">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-violet-600">Step 02</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Enter your actual post metrics</h2>
              <p className="mt-1 text-base leading-6 text-slate-500">
                Copy these values from your platform analytics. EVOLEX AI will use the numbers you provide; it does not fetch private analytics automatically.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="platform" className="text-base font-semibold text-slate-700">Platform</label>
                <select id="platform" value={platform} onChange={(event) => setPlatform(event.target.value)} className={inputClass}>
                  <option>Instagram</option>
                  <option>YouTube</option>
                  <option>TikTok</option>
                  <option>LinkedIn</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="views" className="text-base font-semibold text-slate-700">Views <span className="text-rose-500">*</span></label>
                <input id="views" type="number" min="1" step="1" required value={metrics.views} onChange={(event) => updateMetric("views", event.target.value)} placeholder="e.g. 12500" className={inputClass} />
              </div>
              <div>
                <label htmlFor="reach" className="text-base font-semibold text-slate-700">Reach <span className="font-normal text-slate-400">(optional)</span></label>
                <input id="reach" type="number" min="0" step="1" value={metrics.reach} onChange={(event) => updateMetric("reach", event.target.value)} placeholder="Accounts reached" className={inputClass} />
              </div>
              <div>
                <label htmlFor="likes" className="text-base font-semibold text-slate-700">Likes</label>
                <input id="likes" type="number" min="0" step="1" value={metrics.likes} onChange={(event) => updateMetric("likes", event.target.value)} placeholder="e.g. 850" className={inputClass} />
              </div>
              <div>
                <label htmlFor="comments" className="text-base font-semibold text-slate-700">Comments</label>
                <input id="comments" type="number" min="0" step="1" value={metrics.comments} onChange={(event) => updateMetric("comments", event.target.value)} placeholder="e.g. 64" className={inputClass} />
              </div>
              <div>
                <label htmlFor="shares" className="text-base font-semibold text-slate-700">Shares</label>
                <input id="shares" type="number" min="0" step="1" value={metrics.shares} onChange={(event) => updateMetric("shares", event.target.value)} placeholder="e.g. 120" className={inputClass} />
              </div>
              <div>
                <label htmlFor="saves" className="text-base font-semibold text-slate-700">Saves</label>
                <input id="saves" type="number" min="0" step="1" value={metrics.saves} onChange={(event) => updateMetric("saves", event.target.value)} placeholder="e.g. 210" className={inputClass} />
              </div>
              <div>
                <label htmlFor="followers-gained" className="text-base font-semibold text-slate-700">Followers gained <span className="font-normal text-slate-400">(optional)</span></label>
                <input id="followers-gained" type="number" min="0" step="1" value={metrics.followersGained} onChange={(event) => updateMetric("followersGained", event.target.value)} placeholder="New followers from this post" className={inputClass} />
              </div>
              <div>
                <label htmlFor="average-watch-time" className="text-base font-semibold text-slate-700">Average watch time (seconds) <span className="font-normal text-slate-400">(optional)</span></label>
                <input id="average-watch-time" type="number" min="0" step="0.1" value={metrics.averageWatchTime} onChange={(event) => updateMetric("averageWatchTime", event.target.value)} placeholder="e.g. 12.5" className={inputClass} />
              </div>
            </div>
            {metrics.views && Number(metrics.views) > 0 && (
              <div className="mt-5 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 to-sky-50 p-4">
                <p className="text-sm font-bold uppercase tracking-wider text-violet-700">Calculated engagement rate</p>
                <p className="mt-1 text-3xl font-bold text-slate-900">{(((Number(metrics.likes || 0) + Number(metrics.comments || 0) + Number(metrics.shares || 0) + Number(metrics.saves || 0)) / Number(metrics.views)) * 100).toFixed(2)}%</p>
                <p className="mt-1 text-sm leading-5 text-slate-500">(Likes + comments + shares + saves) ÷ views. This is a simple interaction rate for comparison, not necessarily the platform's own engagement-rate definition.</p>
              </div>
            )}
            {formError && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-base text-red-700">{formError}</p>}
          </section>

          {experiment?.predictedViews && metrics.views.trim() && Number(metrics.views) > 0 && (
            <section className="mt-6 rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-sky-50 p-5 shadow-sm sm:p-6">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-violet-700">Prediction vs actual</p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">How close was your estimate?</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white bg-white/90 p-4">
                  <p className="text-sm font-semibold text-slate-500">Predicted views</p>
                  <p className="mt-1 text-2xl font-bold text-violet-700">{Number(experiment.predictedViews).toLocaleString("en-IN")}</p>
                </div>
                <div className="rounded-2xl border border-white bg-white/90 p-4">
                  <p className="text-sm font-semibold text-slate-500">Actual views</p>
                  <p className="mt-1 text-2xl font-bold text-sky-700">{Number(metrics.views).toLocaleString("en-IN")}</p>
                </div>
                <div className="rounded-2xl border border-white bg-white/90 p-4">
                  <p className="text-sm font-semibold text-slate-500">Prediction accuracy</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-700">{Math.max(0, (1 - Math.abs(Number(metrics.views) - Number(experiment.predictedViews)) / Number(experiment.predictedViews)) * 100).toFixed(1)}%</p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-5 text-slate-500">Accuracy is calculated as 1 − absolute prediction error ÷ predicted views, with a minimum of 0%. This is a simple estimate based on the numbers you entered.</p>
            </section>
          )}

          <section className="mt-8 rounded-3xl border border-violet-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-violet-600">EVOLEX AI INSIGHTS</p>
                <h2 className="mt-2 text-3xl font-bold text-slate-900">Deep content analysis</h2>
                <p className="mt-2 max-w-2xl text-base leading-6 text-slate-500">
                  Get a structured review of your actual performance metrics, creative signals, hypothesis, and next experiment.
                </p>
              </div>
              <button
                type="button"
                onClick={analyzeVideoWithAI}
                disabled={!metrics.views.trim() || Number(metrics.views) <= 0 || aiLoading}
                className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-3 text-base font-semibold text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {aiLoading ? "Analyzing..." : "Analyze with EVOLEX AI →"}
              </button>
            </div>

            {!metrics.views.trim() && (
              <p className="mt-5 rounded-xl bg-violet-50 p-4 text-base text-violet-800">
                Enter your post views to enable AI analysis. Video upload is optional and can provide extra creative context. You can also view a clearly labelled sample report.
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={showSampleAnalysis}
                className="rounded-xl border border-violet-200 bg-white px-4 py-2.5 text-base font-semibold text-violet-700 transition hover:bg-violet-50"
              >
                Show sample analysis
              </button>
              <p className="text-sm text-slate-400">💡 If Gemini API is temporarily unavailable or experiencing high demand, click <strong> Show Sample Analysis </strong> to explore a sample content analysis and see how EVOLEX AI works.</p>
            </div>

            {experiment && (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-sm font-bold uppercase tracking-wider text-slate-400">Saved concept</p>
                  <p className="mt-2 text-base leading-6 text-slate-700">{experiment.concept || "No concept saved"}</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-sm font-bold uppercase tracking-wider text-slate-400">Original hypothesis</p>
                  <p className="mt-2 text-base leading-6 text-slate-700">{experiment.hypothesis || "No hypothesis saved"}</p>
                </div>
              </div>
            )}

            {aiError && (
              <div role="alert" className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4 text-base leading-6 text-red-700">
                <p className="font-semibold">AI analysis could not be completed</p>
                <p className="mt-1">{aiError}</p>
                <p className="mt-2">You can retry later or use the sample report while Gemini is unavailable.</p>
              </div>
            )}

            {aiLoading && (
              <div className="mt-6 rounded-2xl bg-violet-50 p-6">
                <p className="font-semibold text-violet-900">EVOLEX AI is reviewing your content...</p>
                <p className="mt-2 text-base text-violet-700">Temporary Gemini demand spikes may require a retry. Please keep this page open.</p>
              </div>
            )}

            {(aiAnalysis || sampleMode) && (
              <div className="mt-7 space-y-5">
                {sampleMode && (
                  <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-base text-amber-950">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-xl">ⓘ</span>
                    <div>
                      <p className="font-bold">Sample report · Not generated from your content</p>
                      <p className="mt-1 leading-5 text-amber-900/80">This preview demonstrates the analysis layout. Enter your actual post metrics and run AI analysis for feedback tailored to the numbers you provide.</p>
                    </div>
                  </div>
                )}

                <div className="overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-[#f8f5ff] via-white to-[#f0f7ff] shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-violet-100/80 px-5 py-5 sm:px-7">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.16em] text-violet-600">01 · Executive summary</p>
                      <h3 className="mt-2 text-2xl font-bold text-slate-900">The big picture</h3>
                    </div>
                    <span className="rounded-full border border-violet-100 bg-white px-3 py-1.5 text-sm font-semibold text-violet-700">Content intelligence</span>
                  </div>
                  <div className="px-5 py-5 sm:px-7">
                    <p className="whitespace-pre-wrap text-base leading-7 text-slate-700">
                      {reportSections.summary || (sampleMode ? sampleReport.summary : reportText)}
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <article className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm">
                    <div className="flex items-start gap-3 border-b border-blue-50 bg-gradient-to-r from-blue-50 to-sky-50/50 p-5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-2xl">◉</div>
                      <div>
                        <p className="text-sm font-bold uppercase tracking-[0.14em] text-blue-700">02 · First impression</p>
                        <h3 className="mt-1 text-xl font-bold text-slate-900">Hook analysis</h3>
                        <p className="mt-1 text-sm leading-5 text-slate-500">Does the opening earn attention?</p>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="whitespace-pre-wrap text-base leading-7 text-slate-700">{reportSections.hook || (sampleMode ? `${sampleReport.hook.verdict}\n\n${sampleReport.hook.details}` : "The AI response did not provide a separate hook section. Review the first 1–3 seconds for a clear promise, visual pattern interrupt, and reason to keep watching.")}</p>
                    </div>
                  </article>

                  <article className="overflow-hidden rounded-3xl border border-fuchsia-100 bg-white shadow-sm">
                    <div className="flex items-start gap-3 border-b border-fuchsia-50 bg-gradient-to-r from-fuchsia-50 to-violet-50/50 p-5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-fuchsia-100 text-2xl">✧</div>
                      <div>
                        <p className="text-sm font-bold uppercase tracking-[0.14em] text-fuchsia-700">03 · Narrative flow</p>
                        <h3 className="mt-1 text-xl font-bold text-slate-900">Storytelling & content analysis</h3>
                        <p className="mt-1 text-sm leading-5 text-slate-500">Clarity, pacing, value, and payoff</p>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="whitespace-pre-wrap text-base leading-7 text-slate-700">{reportSections.storytelling || (sampleMode ? `${sampleReport.storytelling.verdict}\n\n${sampleReport.storytelling.details}` : "The AI response did not provide a separate storytelling section. Look for a clear progression from audience problem to insight, example, and payoff.")}</p>
                    </div>
                  </article>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <article className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-2xl text-emerald-700">✓</div>
                      <div>
                        <p className="text-sm font-bold uppercase tracking-[0.14em] text-emerald-700">04 · Keep doing</p>
                        <h3 className="text-xl font-bold text-slate-900">What worked</h3>
                      </div>
                    </div>
                    <p className="mt-4 whitespace-pre-wrap text-base leading-7 text-slate-700">{reportSections.worked || (sampleMode ? sampleReport.strengths.map((item) => `• ${item}`).join("\n") : "The AI response did not provide a separate strengths section. No unsupported performance claims are shown here.")}</p>
                  </article>

                  <article className="rounded-3xl border border-amber-100 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-2xl text-amber-700">↗</div>
                      <div>
                        <p className="text-sm font-bold uppercase tracking-[0.14em] text-amber-700">05 · Opportunity</p>
                        <h3 className="text-xl font-bold text-slate-900">What could improve</h3>
                      </div>
                    </div>
                    <p className="mt-4 whitespace-pre-wrap text-base leading-7 text-slate-700">{reportSections.improve || (sampleMode ? sampleReport.improvements.map((item) => `• ${item}`).join("\n") : "The AI response did not provide a separate improvement section. Try changing one creative element at a time and compare the next version.")}</p>
                  </article>
                </div>

                <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-2xl">◎</div>
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.14em] text-violet-700">06 · Learning loop</p>
                      <h3 className="text-xl font-bold text-slate-900">Hypothesis assessment</h3>
                    </div>
                  </div>
                  <p className="mt-4 whitespace-pre-wrap text-base leading-7 text-slate-700">{reportSections.hypothesis || (sampleMode ? sampleReport.hypothesis : (experiment?.hypothesis ? `Original hypothesis: ${experiment.hypothesis}\n\nThe AI response did not provide a separate assessment. Treat the hypothesis as unverified until supported by reliable evidence.` : "No saved hypothesis or separate AI assessment was found. Record a prediction before the next post so you can test it."))}</p>
                </article>

                <div className="grid gap-5 lg:grid-cols-2">
                  <article className="rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm sm:p-6">
                    <p className="text-sm font-bold uppercase tracking-[0.14em] text-violet-700">07 · Next move</p>
                    <h3 className="mt-2 text-xl font-bold text-slate-900">Recommended next experiment</h3>
                    <p className="mt-3 whitespace-pre-wrap text-base leading-7 text-slate-700">{reportSections.next || (sampleMode ? sampleReport.nextExperiment : "Test one change in the next post while keeping the audience and topic as consistent as practical.")}</p>
                  </article>
                  <article className="rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-5 shadow-sm sm:p-6">
                    <p className="text-sm font-bold uppercase tracking-[0.14em] text-sky-700">08 · Measure learning</p>
                    <h3 className="mt-2 text-xl font-bold text-slate-900">Success signals to track</h3>
                    <p className="mt-3 whitespace-pre-wrap text-base leading-7 text-slate-700">{reportSections.metrics || (sampleMode ? sampleReport.successMetrics : "Compare average watch time where available, then review saves, shares, comments, and follows in context. Use the actual values you entered and avoid treating correlation as proof of cause.")}</p>
                  </article>
                </div>

                {!sampleMode && (
                  <details className="rounded-2xl border border-slate-200 bg-white p-4">
                    <summary className="cursor-pointer text-base font-semibold text-slate-600">View full AI response</summary>
                    <pre className="mt-4 whitespace-pre-wrap font-sans text-base leading-6 text-slate-600">{aiAnalysis}</pre>
                  </details>
                )}
              </div>
            )}
          </section>

          <footer className="mt-8 rounded-2xl border border-slate-200 bg-white/70 p-5 text-sm leading-5 text-slate-500">
            <strong className="text-slate-700">Evidence note:</strong> EVOLEX AI should distinguish observations from hypotheses. Metrics are manually supplied by the creator and are not independently verified by EVOLEX AI. The sample report is illustrative only.
          </footer>
        </div>
      </main>
    </div>
  );
}
