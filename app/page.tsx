"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartNoAxesCombined, WandSparkles } from "lucide-react";
import {
  Compass,
  FlaskConical,
  FlaskRound,
} from "lucide-react";

const navigation = [
  { name: "Home", href: "/", icon: "🏠" },
  { name: "Opportunity Map", href: "/opportunity-map", icon: "🧭" },
  { name: "Pre-Publish Lab", href: "/pre-publish-lab", icon: "✨" },
  { name: "Post-Publish Lab", href: "/post-publish-lab", icon: "📊" },
  { name: "My Experiments", href: "/experiments", icon: "🧪" },
  { name: "Profile", href: "/profile", icon: "👤" },
];

const features = [
  {
    icon: Compass,
    number: "01",
    eyebrow: "FIND YOUR NEXT MOVE",
    title: "Opportunity Map",
    description:
      "Discover content directions shaped around your strengths, interests, and the audience you want to reach.",
    benefit: "Turn your creator identity into ideas",
    href: "/opportunity-map",
    tone: "violet",
  },
  {
    icon: FlaskConical,
    number: "02",
    eyebrow: "BEFORE YOU POST",
    title: "Pre-Publish Lab",
    description:
      "Pressure-test your content idea, hook, and structure before publishing, so you can refine the parts that matter.",
    benefit: "Make every draft more intentional",
    href: "/pre-publish-lab",
    tone: "blue",
  },
  {
    icon: ChartNoAxesCombined,
    number: "03",
    eyebrow: "AFTER YOU POST",
    title: "Post-Publish Lab",
    description:
      "Review available post details and performance metrics to spot useful signals and decide what to improve next.",
    benefit: "Learn from real results, not guesses",
    href: "/post-publish-lab",
    tone: "indigo",
  },
  {
    icon: FlaskRound,
    number: "04",
    eyebrow: "LEARN & ITERATE",
    title: "My Experiments",
    description:
      "Keep track of your content tests, compare predictions with outcomes when data is available, and carry lessons forward.",
    benefit: "Build a smarter process over time",
    href: "/experiments",
    tone: "sky",
  },
];

export default function Home() {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-white text-[#171C46]">
      {/* LEFT SIDEBAR */}
      <aside className="flex min-h-screen w-64 shrink-0 flex-col border-r border-violet-100 bg-[#FAF9FF] px-5 py-7 lg:w-72 lg:px-6">
        <Link href="/" className="mb-12 px-2 text-2xl font-extrabold tracking-tight">
          EVOLEX AI<span className="text-violet-600">.</span>
        </Link>

        <p className="mb-4 px-3 text-xs font-semibold tracking-widest text-slate-400">
          WORKSPACE
        </p>

        <nav className="space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-base font-semibold transition ${
                pathname === item.href
                  ? "bg-violet-100 text-violet-800"
                  : "text-slate-600 hover:bg-violet-50"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-base font-semibold">{item.name}</span>
            </Link>
          ))}
        </nav>

      </aside>

      {/* HOMEPAGE */}
      <main className="relative min-w-0 flex-1 overflow-hidden bg-[#FCFCFF]">
        <div className="pointer-events-none absolute -left-20 top-40 h-64 w-64 rounded-full bg-purple-200/40 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-20 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />

        {/* TOP NAVIGATION */}
        <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-end gap-5 px-6 pt-6 sm:gap-8 sm:px-10 lg:px-12">
          <Link
            href="#discover"
            className="text-base font-semibold text-violet-700 transition hover:text-violet-900"
          >
            Discover
          </Link>
          <Link
            href="#features"
            className="text-base font-medium text-slate-600 transition hover:text-violet-700"
          >
            Features
          </Link>
          <Link
            href="#about"
            className="text-base font-medium text-slate-600 transition hover:text-violet-700"
          >
            About
          </Link>
        </header>

        <div className="relative mx-auto max-w-6xl px-6 pb-10 pt-16 sm:px-10 sm:pt-20 lg:px-12 lg:pb-14">
          {/* HERO */}
          <section className="scroll-mt-8 text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white px-4 py-2 text-xs font-medium text-violet-700 shadow-sm sm:text-sm">
              <span className="h-2 w-2 rounded-full bg-violet-500" />
              Your personal AI content intelligence platform
            </div>

            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Create with intention.
              <span className="mt-2 block bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-500 bg-clip-text text-transparent">
                Evolve with intelligence.
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Your AI partner to discover opportunities, experiment with
              content, understand your audience, and grow with confidence.
            </p>
          </section>

          {/* CREATOR CARDS */}
          <section id="discover" className="scroll-mt-8">
            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              <article className="group relative overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-[#F8F2FF] via-white to-[#F2EDFF] p-6 shadow-[0_8px_35px_rgba(90,65,180,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-8">
                <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-violet-200/40 blur-2xl" />

                <div className="relative">
                  <div className="flex items-start justify-between">
                    <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                      START HERE
                    </span>
                  </div>

                  <div className="flex flex-col items-center">
  <WandSparkles className="h-9 w-9 text-sky-600" />
  <h2 className="mt-6 text-2xl font-bold">
    I&apos;m a New Creator
  </h2>
</div>

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Find your niche, uncover content opportunities, and discover
                    what makes your creative voice unique.
                  </p>

                  <ul className="mt-5 space-y-3 text-sm text-slate-700">
                    <li>✓ &nbsp; Personalized strengths and interests</li>
                    <li>✓ &nbsp; AI-powered content opportunities</li>
                    <li>✓ &nbsp; Ideas tailored to your creator journey</li>
                  </ul>

                  <Link
                    href="/new-creator"
                    className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-md shadow-violet-200 transition hover:from-violet-700 hover:to-indigo-700"
                  >
                    Get Started <span>→</span>
                  </Link>
                </div>
              </article>

              <article className="group relative overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-br from-[#EEF7FF] via-white to-[#EDF5FF] p-6 shadow-[0_8px_35px_rgba(50,110,190,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-8">
                <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-sky-200/50 blur-2xl" />

                <div className="relative">
                  <div className="flex items-start justify-between">
                    <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                      GROW FURTHER
                    </span>
                  </div>

                  <div className="flex flex-col items-center">
  <ChartNoAxesCombined className="h-9 w-9 text-violet-600" />
  <h2 className="mt-6 text-2xl font-bold">
    I&apos;m an Existing Creator
  </h2>
</div>

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Understand your content performance, uncover patterns, and
                    turn insights into your next big idea.
                  </p>

                  <ul className="mt-5 space-y-3 text-sm text-slate-700">
                    <li>✓ &nbsp; Content performance insights</li>
                    <li>✓ &nbsp; Personalized growth opportunities</li>
                    <li>✓ &nbsp; Smarter content experiments</li>
                  </ul>

                  <Link
                    href="/post-publish-lab"
                    className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-md shadow-violet-200 transition hover:-translate-y-0.5 hover:from-violet-700 hover:to-indigo-700"
                  >
                    Explore Dashboard <span>→</span>
                  </Link>
                </div>
              </article>
            </div>
          </section>

          <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs text-slate-500 sm:text-sm">
            <span>✦ AI-powered insights</span>
            <span>✦ Experiment-driven growth</span>
            <span>✦ Built for your creative journey</span>
          </div>

          {/* FEATURES */}
          <section id="features" className="scroll-mt-8 pt-24 sm:pt-28">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold tracking-[0.2em] text-violet-600">
                WHAT YOU CAN DO
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                One creative journey. <span className="text-violet-600">Smarter decisions.</span>
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                EVOLEX AI helps you move from an idea to an experiment, then learn
                from what actually happens.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {features.map((feature) => (
                <article
                  key={feature.title}
                  className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-violet-100/90 bg-white p-6 shadow-[0_12px_35px_rgba(80,65,160,0.06)] transition duration-300 hover:-translate-y-1.5 hover:border-violet-200 hover:shadow-[0_18px_45px_rgba(80,65,160,0.12)]"
                >
                  <div
                    className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-2xl transition group-hover:scale-125 ${
                      feature.tone === "blue"
                        ? "bg-sky-200/50"
                        : feature.tone === "indigo"
                          ? "bg-indigo-200/50"
                          : feature.tone === "sky"
                            ? "bg-cyan-200/50"
                            : "bg-violet-200/60"
                    }`}
                  />
                  <div className="relative flex items-start justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl shadow-sm ${
                        feature.tone === "blue"
                          ? "bg-sky-50 text-sky-700"
                          : feature.tone === "indigo"
                            ? "bg-indigo-50 text-indigo-700"
                            : feature.tone === "sky"
                              ? "bg-cyan-50 text-cyan-700"
                              : "bg-violet-50 text-violet-700"
                      }`}
                    >
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <span className="text-base font-bold tracking-widest text-slate-300">
                      {feature.number}
                    </span>
                  </div>
                  <p className="relative mt-6 text-xs font-bold tracking-[0.16em] text-violet-600">
                    {feature.eyebrow}
                  </p>
                  <h3 className="relative mt-2 text-2xl font-extrabold tracking-tight text-[#171C46]">
                    {feature.title}
                  </h3>
                  <p className="relative mt-3 flex-1 text-base leading-7 text-slate-600">
                    {feature.description}
                  </p>
                  <div className="relative mt-5 rounded-xl bg-slate-50 px-3 py-3 text-sm font-semibold leading-6 text-slate-600">
                    <span className="mr-2 text-violet-600">✦</span>
                    {feature.benefit}
                  </div>
                  <Link
                    href={feature.href}
                    className="relative mt-5 inline-flex items-center gap-2 text-base font-bold text-violet-700 transition group-hover:gap-3 hover:text-violet-900"
                  >
                    Explore feature <span aria-hidden="true">→</span>
                  </Link>
                </article>
              ))}
            </div>
          </section>

          {/* ABOUT */}
          <section id="about" className="scroll-mt-8 pt-20 sm:pt-24">
            <div className="relative overflow-hidden rounded-[2rem] border border-violet-100 bg-gradient-to-br from-[#F7F2FF] via-white to-[#EEF6FF] p-6 shadow-[0_20px_60px_rgba(91,67,170,0.09)] sm:p-10 lg:p-12">
              <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-violet-200/40 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-sky-200/40 blur-3xl" />

              <div className="relative">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white/90 px-4 py-2 text-xs font-bold tracking-[0.16em] text-violet-700 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-violet-500" />
                    ABOUT EVOLEX AI
                  </span>
                  <span className="text-sm font-medium text-slate-500">
                    A smarter loop for every creator
                  </span>
                </div>

                <div className="mt-7 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
                  <div>
                    <h2 className="max-w-2xl text-2xl font-extrabold leading-tight tracking-tight text-[#171C46] sm:text-3xl lg:text-4xl">
                      Growth is more than views.
                      <span className="mt-2 block bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-500 bg-clip-text text-transparent">
                        It&apos;s about what you learn.
                      </span>
                    </h2>

                    <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600">
                      EVOLEX AI is an AI-powered content intelligence workspace
                      that helps you turn creative ideas into intentional
                      experiments. Discover opportunities, prepare stronger
                      content before publishing, and learn from the results
                      afterward—all in one connected workflow.
                    </p>

                    <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
                      Whether you&apos;re finding your niche or refining an
                      established strategy, EVOLEX AI helps you explore new
                      directions, test creative choices, and use available
                      performance data to decide what to improve next. The aim
                      isn&apos;t to chase every view—it&apos;s to understand what
                      works for your audience and keep evolving.
                    </p>

                    <div className="mt-7 flex flex-wrap gap-3">
                      <div className="rounded-2xl border border-violet-100 bg-white/85 px-4 py-3 shadow-sm">
                        <p className="text-sm font-bold text-violet-700">Create</p>
                        <p className="mt-1 text-sm text-slate-500">With intention</p>
                      </div>
                      <div className="rounded-2xl border border-indigo-100 bg-white/85 px-4 py-3 shadow-sm">
                        <p className="text-sm font-bold text-indigo-700">Measure</p>
                        <p className="mt-1 text-sm text-slate-500">What matters</p>
                      </div>
                      <div className="rounded-2xl border border-sky-100 bg-white/85 px-4 py-3 shadow-sm">
                        <p className="text-sm font-bold text-sky-700">Evolve</p>
                        <p className="mt-1 text-sm text-slate-500">With every lesson</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="rounded-3xl border border-white/90 bg-white/85 p-5 shadow-[0_12px_35px_rgba(80,65,160,0.07)] backdrop-blur sm:p-6">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold tracking-[0.16em] text-violet-600">
                            THE EVOLEX AI LOOP
                          </p>
                          <h3 className="mt-2 text-xl font-bold text-[#171C46]">
                            From idea to insight
                          </h3>
                        </div>
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-sky-100 text-2xl">
                          ✦
                        </div>
                      </div>

                      <div className="mt-6 space-y-3">
                        {[
                          { number: "01", title: "Discover", text: "Find a direction worth exploring.", tone: "bg-violet-100 text-violet-700" },
                          { number: "02", title: "Prepare", text: "Strengthen the idea before publishing.", tone: "bg-blue-100 text-blue-700" },
                          { number: "03", title: "Analyze", text: "Review the signals in your results.", tone: "bg-indigo-100 text-indigo-700" },
                          { number: "04", title: "Learn & evolve", text: "Carry useful lessons into your next test.", tone: "bg-sky-100 text-sky-700" },
                        ].map((step) => (
                          <div key={step.number} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-gradient-to-r from-white to-[#FAF9FF] p-3.5">
                            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold ${step.tone}`}>
                              {step.number}
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800">{step.title}</p>
                              <p className="mt-1 text-sm leading-6 text-slate-500">{step.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-600 to-indigo-600 p-5 text-white shadow-lg shadow-violet-200/60">
                      <p className="text-xs font-bold tracking-[0.16em] text-violet-100">
                        THE EVOLEX AI MINDSET
                      </p>
                      <p className="mt-2 text-lg font-semibold leading-7">
                        Don&apos;t just publish more. Learn something from every post.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <footer className="mt-16 border-t border-violet-100 py-7 text-center">
            <p className="text-xs font-medium tracking-[0.12em] text-slate-400">
              CREATE WITH INTENTION. EVOLVE WITH INTELLIGENCE.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
