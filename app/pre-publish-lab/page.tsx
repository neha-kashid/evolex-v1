
"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { upsertExperimentHistory } from "@/lib/experiment-history";


const analysisSections = [
  { number: "01", title: "Content Verdict", icon: "✦", tone: "violet" },
  { number: "02", title: "Hook Strategy", icon: "◎", tone: "blue" },
  { number: "03", title: "What Works", icon: "✓", tone: "emerald" },
  { number: "04", title: "What to Improve", icon: "↗", tone: "amber" },
  { number: "05", title: "Content Structure", icon: "◷", tone: "sky" },
  { number: "06", title: "Experiment Hypothesis", icon: "⚗", tone: "violet" },
  { number: "07", title: "Success Metric", icon: "▥", tone: "blue" },
  { number: "08", title: "Next Action", icon: "→", tone: "emerald" },
];

function parseAnalysisSections(raw: string) {
  const headingPattern = /(?:^|\n)\s*#{1,4}\s*(\d+)\.\s*([^\n]+)/g;
  const matches = [...raw.matchAll(headingPattern)];
  if (!matches.length) return [];

  return matches.map((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = index + 1 < matches.length ? (matches[index + 1].index ?? raw.length) : raw.length;
    const number = match[1].padStart(2, "0");
    const title = match[2].replace(/\*\*/g, "").trim();
    const content = raw.slice(start, end).replace(/^\s*[-–—]+\s*$/gm, "").trim();
    return { number, title, content };
  });
}

function InlineText({ text }: { text: string }) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((part, index) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={index} className="font-semibold text-slate-800">{part.slice(2, -2)}</strong>
        ) : (
          <span key={index}>{part.replace(/\*/g, "")}</span>
        )
      )}
    </>
  );
}

function AnalysisBody({ content }: { content: string }) {
  const lines = content.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const blocks: { type: "paragraph" | "list" | "quote"; lines: string[] }[] = [];

  for (const line of lines) {
    if (line.startsWith("> ")) {
      blocks.push({ type: "quote", lines: [line.slice(2)] });
      continue;
    }
    const isList = /^(?:[-*•]|\d+[.)])\s+/.test(line);
    const cleaned = line.replace(/^(?:[-*•]|\d+[.)])\s+/, "");
    const last = blocks[blocks.length - 1];
    if (isList) {
      if (last?.type === "list") last.lines.push(cleaned);
      else blocks.push({ type: "list", lines: [cleaned] });
    } else {
      blocks.push({ type: "paragraph", lines: [line] });
    }
  }

  return (
    <div className="space-y-3">
      {blocks.map((block, index) =>
        block.type === "quote" ? (
          <blockquote key={index} className="rounded-xl border border-violet-100 border-l-4 border-l-violet-400 bg-gradient-to-r from-violet-50 via-white to-sky-50 px-4 py-3.5 text-sm font-medium leading-6 text-slate-700 shadow-sm">
            <InlineText text={block.lines[0]} />
          </blockquote>
        ) : block.type === "list" ? (
          <div key={index} className="space-y-3">
            {block.lines.map((line, itemIndex) => (
              <div key={itemIndex} className="flex items-start gap-3 rounded-xl bg-white/80 p-3.5 ring-1 ring-slate-100">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-xs font-bold text-violet-700">
                  {String(itemIndex + 1).padStart(2, "0")}
                </span>
                <p className="min-w-0 text-sm leading-6 text-slate-600"><InlineText text={line} /></p>
              </div>
            ))}
          </div>
        ) : (
          <p key={index} className="text-sm leading-7 text-slate-600"><InlineText text={block.lines[0]} /></p>
        )
      )}
    </div>
  );
}

function FormattedAnalysis({ analysis }: { analysis: string }) {
  const sections = parseAnalysisSections(analysis);

  if (!sections.length) {
    return (
      <div className="rounded-2xl border border-violet-100 bg-white p-5 sm:p-7">
        <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">{analysis}</p>
      </div>
    );
  }

  const tones: Record<string, string> = {
    "01": "bg-violet-100 text-violet-700",
    "02": "bg-blue-100 text-blue-700",
    "03": "bg-emerald-100 text-emerald-700",
    "04": "bg-amber-100 text-amber-700",
    "05": "bg-sky-100 text-sky-700",
    "06": "bg-violet-100 text-violet-700",
    "07": "bg-blue-100 text-blue-700",
    "08": "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="mt-7 space-y-5">
      {sections.map((section, index) => {
        const meta = analysisSections.find((item) => item.number === section.number);
        const isFeatured = section.number === "01" || section.number === "08";
        return (
          <section
            key={`${section.number}-${index}`}
            className={`overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_8px_30px_rgba(50,45,100,0.045)] ${isFeatured ? "ring-1 ring-violet-100" : ""}`}
          >
            <div className={`flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6 ${isFeatured ? "bg-gradient-to-r from-violet-50/90 to-blue-50/70" : "bg-white"}`}>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${tones[section.number] ?? "bg-violet-100 text-violet-700"}`}>
                {meta?.icon ?? "✦"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold tracking-[0.16em] text-slate-400">SECTION {section.number}</p>
                <h3 className="mt-0.5 text-base font-bold text-slate-800 sm:text-lg">{section.title}</h3>
              </div>
              <span className="hidden text-xs font-semibold text-slate-300 sm:block">{section.number}/08</span>
            </div>
            <div className="p-5 sm:p-6">
              <AnalysisBody content={section.content} />
            </div>
          </section>
        );
      })}
    </div>
  );
}


const sampleAnalysis = `### 1. CONTENT VERDICT

> ✨ STRONG CONCEPT — WITH THE RIGHT HOOK

**Example idea:** 5 AI tools that save students time  
**Platform:** Instagram  
**Format:** Reel  
**Goal:** Engagement

**Why it could work**
Students want practical ways to save time. Instead of simply listing AI tools, demonstrate how each tool solves a real student problem.

> **EVOLEX TAKE:** Lead with the outcome, not the tools.

This is a qualitative assessment, not a guaranteed performance prediction.

### 2. HOOK STRATEGY

> 🎬 HOOK A — The relatable problem

“Still spending hours making notes? These AI tools could make your study routine easier.”

**Why test it:** It starts with a familiar frustration and promises a relevant benefit.

> ⚡ HOOK B — The curiosity angle

“I tested 5 AI tools students should know about. Here’s what each one is actually useful for.”

**Why test it:** It creates curiosity while setting clear expectations.

> **RECOMMENDATION:** Test both openings while keeping the main content as similar as possible.

### 3. WHAT WORKS

- **A clearly defined audience:** Students can quickly understand why the topic matters to them.
- **Practical demonstrations:** Showing a real task is more useful than simply listing features.
- **A repeatable content format:** A numbered list is easy to follow and can become a recurring series.

### 4. WHAT TO IMPROVE

- **01 — Start with the problem:** Skip a generic introduction. Show the challenge or result immediately.
- **02 — Demonstrate real value:** Show each tool solving a genuine task. Verify results rather than promising unrealistic time savings.
- **03 — Keep the pace focused:** Give each tool a distinct purpose and remove repetitive explanations.

> **PRIORITY:** Make the first example useful enough to encourage viewers to keep watching.

### 5. CONTENT STRUCTURE

- **0–3 SEC | HOOK:** Open with a relatable study problem.
- **3–8 SEC | CONTEXT:** Explain what viewers will learn.
- **8–30 SEC | DEMONSTRATION:** Show practical examples with readable on-screen labels.
- **30–40 SEC | RECAP:** Summarize which tool helps with which task.
- **FINAL SECONDS | CALL TO ACTION:** Ask viewers which study task they want to make easier.

These timings are illustrative; adapt them to the final edit.

### 6. EXPERIMENT HYPOTHESIS

> 🧪 THE TEST

**Hypothesis:** A problem-focused opening may improve early viewer retention compared with a generic introduction.

- **Version A:** Open with a relatable student problem.
- **Version B:** Open with a direct list-style introduction.
- Keep the main content and editing style as consistent as practical.

> **CHANGE ONE PRIMARY VARIABLE:** The opening hook.

The hypothesis remains unproven until results are measured.

### 7. SUCCESS METRIC

> 📊 WHAT TO MEASURE

**PRIMARY METRIC**  
Early audience retention, if available in platform analytics.

**SUPPORTING METRICS**

- Average watch time
- Completion rate, if available
- Shares and saves
- Relevant comments

**HOW TO EVALUATE**  
Compare versions using the same metric definitions and comparable reporting windows. Consider differences in distribution and audience.

No actual performance results are available in this sample.

### 8. NEXT ACTION

> 🚀 YOUR PRE-PUBLISH CHECKLIST

- Choose a hook to produce first.
- Prepare a genuine screen-recorded demonstration.
- Remove unnecessary introductions.
- Add readable captions and tool names.
- Define your success metric before publishing.
- Record actual results in EVOLEX after publishing.

> **YOUR NEXT EXPERIMENT:** Compare a problem-focused hook with a generic introduction, then use the results to guide your next video.

**SAMPLE REPORT** — Illustrative demonstration content, not a personalized Gemini analysis or a forecast of actual results.`;


export default function PrePublishLabPage() {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState("");
  const [sampleMode, setSampleMode] = useState(false);
  const [idea, setIdea] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [format, setFormat] = useState("Reel");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("Engagement");
  const [video, setVideo] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
  if (!video) {
    setVideoUrl("");
    return;
  }

  const url = URL.createObjectURL(video);
  setVideoUrl(url);

  return () => URL.revokeObjectURL(url);
}, [video]);
  function showSampleAnalysis() {
  setAnalysis(sampleAnalysis);
  setSampleMode(true);
  setMessage(
    "Showing a sample report. This is demonstration content, not an analysis of your idea."
  );
}

  
async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();

  if (!idea.trim()) {
    setMessage("Please describe your content idea first.");
    return;
  }

  setLoading(true);
  setMessage("");
  setAnalysis("");
  setSampleMode(false);

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idea,
        platform,
        format,
        audience,
        goal,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Analysis failed.");
    }

    setAnalysis(data.analysis);

const now = new Date().toISOString();
    const savedExperiment = {
      experimentId: crypto.randomUUID(),
      opportunity: idea,
      audience,
      format,
      concept: idea,
      hypothesis: "",
      platform,
      goal,
      prePublishAnalysis: data.analysis,
      status: "in_progress" as const,
      createdAt: now,
      updatedAt: now,
    };

    try {
      sessionStorage.setItem("evolex_publish_ready", JSON.stringify(savedExperiment));
      upsertExperimentHistory(savedExperiment);
      sessionStorage.setItem("evolex_experiment_status", JSON.stringify(savedExperiment));
    } catch (storageError) {
      console.error("Could not save experiment:", storageError);
    }

    setMessage("Your AI analysis is ready and your experiment has been saved!");
  } catch (error) {
    setMessage(
      error instanceof Error
        ? error.message
        : "Something went wrong. Please try again."
    );
  } finally {
    setLoading(false);
  }
}


  return (
    <div className="flex min-h-screen bg-[#f8f9ff] text-[#171C46]">
      <Sidebar />

      <main className="min-w-0 flex-1 px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span>Workspace</span>
            <span>/</span>
            <span className="font-medium text-violet-700">
              Pre-Publish Lab
            </span>
          </div>

          <div className="mt-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white px-3 py-2 text-xs font-semibold text-violet-700 shadow-sm">
              <span>✦</span>
              PLAN BEFORE YOU PUBLISH
            </div>

            <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Make your next post
              <span className="block bg-gradient-to-r from-violet-600 to-blue-500 bg-clip-text text-transparent">
                count.
              </span>
            </h1>

            <p className="mt-4 max-w-2xl leading-7 text-slate-600">
              Turn your content idea into a thoughtful experiment.
              Define your audience, choose your goal, and prepare
              your content for AI-powered feedback.
            </p>
          </div>

          {/* Progress */}
          <div className="mt-9 grid gap-3 sm:grid-cols-3">
            {[
              { number: "01", title: "Describe", text: "Your content idea" },
              { number: "02", title: "Define", text: "Audience and goal" },
              { number: "03", title: "Analyze", text: "Prepare for AI insights" },
            ].map((step) => (
              <div
                key={step.number}
                className="flex items-center gap-3 rounded-2xl border border-violet-100 bg-white p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-sm font-bold text-violet-700">
                  {step.number}
                </div>
                <div>
                  <p className="font-semibold">{step.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{step.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Content idea */}
            <section className="rounded-3xl border border-violet-100 bg-white p-6 shadow-[0_8px_35px_rgba(90,65,180,0.04)] sm:p-8">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-2xl">
                  ✨
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Your content idea</h2>
                  <p className="mt-1 text-base leading-7 text-slate-500">
                    What are you planning to create?
                  </p>
                </div>
              </div>

              <label
                htmlFor="idea"
                className="mt-6 block text-base font-semibold"
              >
                Describe your idea
              </label>

              <textarea
                id="idea"
                value={idea}
                onChange={(e) => {
                  setIdea(e.target.value);
                  setMessage("");
                }}
                placeholder="Example: A short video sharing 5 practical AI tools that save students time..."
                rows={5}
                required
                className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-[#FCFCFF] p-4 text-base leading-7 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
              />

              <p className="mt-2 text-right text-sm text-slate-400">
                {idea.length} characters
              </p>
            </section>

            {/* Platform and format */}
            <section className="rounded-3xl border border-sky-100 bg-white p-6 shadow-[0_8px_35px_rgba(50,110,190,0.04)] sm:p-8">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-2xl">
                  📱
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Publishing details</h2>
                  <p className="mt-1 text-base leading-7 text-slate-500">
                    Where and how will you publish?
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="platform" className="text-base font-semibold">
                    Platform
                  </label>
                  <select
                    id="platform"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                  >
                    <option>Instagram</option>
                    <option>YouTube</option>
                    <option>TikTok</option>
                    <option>LinkedIn</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="format" className="text-base font-semibold">
                    Content format
                  </label>
                  <select
                    id="format"
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                  >
                    <option>Reel</option>
                    <option>Short video</option>
                    <option>Long-form video</option>
                    <option>Carousel</option>
                    <option>Image post</option>
                    <option>Text post</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Audience and goal */}
            <section className="rounded-3xl border border-violet-100 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-2xl">
                  🎯
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Audience and goal</h2>
                  <p className="mt-1 text-base leading-7 text-slate-500">
                    Give your experiment a clear direction.
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="audience" className="text-base font-semibold">
                  Who is your target audience?
                </label>
                <input
                  id="audience"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="e.g. College students interested in AI"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-base outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                />
              </div>

              <fieldset className="mt-6">
                <legend className="text-base font-semibold">
                  What is your primary goal?
                </legend>

                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    "Reach",
                    "Engagement",
                    "Followers",
                    "Conversions",
                  ].map((item) => (
                    <label
                      key={item}
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-base transition ${
                        goal === item
                          ? "border-violet-400 bg-violet-50 text-violet-800"
                          : "border-slate-200 hover:border-violet-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="goal"
                        value={item}
                        checked={goal === item}
                        onChange={() => setGoal(item)}
                        className="accent-violet-600"
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </fieldset>
            </section>

            {/* Optional video */}
            <section className="rounded-3xl border border-sky-100 bg-gradient-to-br from-white to-[#F3F8FF] p-6 sm:p-8">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-2xl">
                  🎬
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    Add your video
                    <span className="ml-2 text-base font-normal text-slate-400">
                      Optional
                    </span>
                  </h2>
                  <p className="mt-1 text-base leading-7 text-slate-500">
                    Already have a draft? Add a video for a preview.
                    We'll connect video understanding in the Gemini stage.
                  </p>
                </div>
              </div>

              <label
                htmlFor="video"
                className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-sky-200 bg-white px-5 py-8 text-center transition hover:border-violet-300 hover:bg-violet-50/40"
              >
                <span className="text-3xl">↑</span>
                <span className="mt-3 text-base font-semibold">
                  {video ? video.name : "Choose a video from your device"}
                </span>
                <span className="mt-2 text-sm text-slate-500">
                  MP4, WebM or MOV · Keep uploads small for the prototype
                </span>
                <input
                  id="video"
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  className="sr-only"
                  onChange={(e) => {
                    const selected = e.target.files?.[0] ?? null;

                    if (selected && selected.size > 50 * 1024 * 1024) {
                      setVideo(null);
                      e.target.value = "";
                      setMessage("Please choose a video smaller than 50 MB.");
                      return;
                    }

                    setVideo(selected);
                    setMessage("");
                  }}
                />
              </label>

              {video && (
                <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                  <span className="truncate text-slate-600">
                    Selected: {video.name} (
                    {(video.size / (1024 * 1024)).toFixed(1)} MB)
                  </span>
                  <button
                    type="button"
                    onClick={() => setVideo(null)}
                    className="shrink-0 font-medium text-rose-600 hover:text-rose-700"
                  >
                    Remove
                  </button>
                </div>
              )}
            
              {videoUrl && (
                <div className="mt-5 overflow-hidden rounded-2xl border border-violet-100 bg-slate-950">
                  <video
                    src={videoUrl}
                    controls
                    playsInline
                    preload="metadata"
                    className="max-h-[420px] w-full object-contain"
                  >
                    Your browser does not support video playback.
                  </video>
                </div>
              )}
            </section>

            {/* Submit */}
            <div className="rounded-3xl border border-violet-100 bg-white p-6 sm:p-8">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div>
                  <h2 className="font-bold">Ready to explore your idea?</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Next, we'll use Gemini to evaluate your content brief.
                  </p>
                </div>

                
<button
  type="submit"
  disabled={loading}
  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:from-violet-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
>
  {loading ? "Analyzing your idea..." : "Analyze with Gemini"}
  {!loading && <span>→</span>}
</button>


<button
  type="button"
  onClick={showSampleAnalysis}
  disabled={loading}
  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-violet-200 bg-white px-5 py-3.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-60"
>
  Show sample analysis
</button>


              </div>

              {message && (
                <p
                  role="status"
                  className="mt-5 rounded-xl border border-violet-100 bg-violet-50 p-4 text-sm leading-6 text-violet-800"
                >
                  {message}
                </p>
              )}
            </div>

            
{analysis && (
  <section className={`mt-8 overflow-hidden rounded-3xl border p-5 shadow-[0_18px_55px_rgba(91,67,170,0.09)] sm:p-8 ${
    sampleMode
      ? "border-violet-200 bg-gradient-to-br from-white via-[#FAF7FF] to-[#EEF5FF]"
      : "border-slate-200 bg-gradient-to-br from-white via-[#FAF7FF] to-[#F0F6FF]"
  }`}>
    <div className="relative overflow-hidden rounded-2xl border border-white/80 bg-white/75 p-5 shadow-sm sm:p-6">
      <div className="pointer-events-none absolute -right-8 -top-12 h-36 w-36 rounded-full bg-violet-200/40 blur-3xl" />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl shadow-sm ${
            sampleMode ? "bg-gradient-to-br from-violet-100 to-sky-100" : "bg-violet-100"
          }`}>
            {sampleMode ? "✧" : "✨"}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                {sampleMode ? "Preview the analysis experience" : "Your AI content analysis"}
              </h2>
              {sampleMode && (
                <span className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[10px] font-extrabold tracking-[0.14em] text-violet-700">
                  SAMPLE REPORT
                </span>
              )}
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              {sampleMode
                ? "Explore how EVOLEX organizes content feedback into clear, actionable sections. This example is not based on your idea."
                : "Powered by Gemini · Use these insights as guidance, not guaranteed outcomes."}
            </p>
          </div>
        </div>
        <div className="hidden rounded-xl border border-slate-100 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-500 sm:block">
          {sampleMode ? "DEMO · 8 INSIGHTS" : "AI-GENERATED INSIGHTS"}
        </div>
      </div>
      {sampleMode && (
        <div className="relative mt-5 flex items-start gap-3 rounded-xl border border-violet-100 bg-gradient-to-r from-violet-50 to-sky-50 p-3.5">
          <span className="mt-0.5 text-violet-600">ⓘ</span>
          <p className="text-xs leading-5 text-slate-600">
            Sample content only. For feedback tailored to your own idea, complete the form and select <strong className="font-semibold text-slate-800">Analyze with Gemini</strong>.
          </p>
        </div>
      )}
    </div>

    <FormattedAnalysis analysis={analysis} />
  </section>
)}

          </form>

          <p className="mt-8 text-center text-xs text-slate-400">
            EVOLEX · Create. Learn. Evolve.
          </p>
        </div>
      </main>
    </div>
  );
}
