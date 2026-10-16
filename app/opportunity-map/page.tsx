"use client";
import Sidebar from "@/components/Sidebar";

import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronRight,
  Lightbulb,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";

type CreatorProfile = {
  skills: string[];
  interests: string[];
  experience: string;
  goals: string[];
  contentTypes: string[];
  audience: string[];
};

type Opportunity = {
  number: string;
  title: string;
  description: string;
  alignment: string;
  competition: string;
  reason: string;
  formats: string[];
};

const defaultProfile: CreatorProfile = {
  skills: [],
  interests: [],
  experience: "",
  goals: [],
  contentTypes: [],
  audience: [],
};

function generateOpportunities(profile: CreatorProfile): Opportunity[] {
  const skills = profile.skills ?? [];
  const interests = profile.interests ?? [];
  const goals = profile.goals ?? [];
  const contentTypes = profile.contentTypes ?? [];
  const audience = profile.audience ?? [];
  const lower = (items: string[]) => items.map((item) => item.toLowerCase());
  const skillText = lower(skills).join(" ");
  const formatText = lower(contentTypes).join(" ");
  const goalText = lower(goals).join(" ");
  const audienceText = lower(audience).join(" ");
  const canExplain = /explain|teach|organizing information|writing|problem solving/.test(skillText);
  const canStorytell = /story|personal experiences|speaking|entertaining|interview/.test(skillText);
  const canVisual = /visual|design|photography|videography|artistic/.test(skillText) || /visual|vlog|artistic|video/.test(formatText);
  const canResearch = /research|analyz|problem solving|writing/.test(skillText);
  const educational = /educational|tutorial|tips|how-to|learning|students|learners|beginners/.test(`${formatText} ${audienceText}`) || /teach and share knowledge/.test(goalText);
  const storyDriven = /personal stor|vlog|interview|story|experience/.test(`${formatText} ${skillText}`);
  const monetization = /earn money|grow a business|entrepreneurs|business owners/.test(`${goalText} ${audienceText}`);

  const topicTemplates: { match: RegExp; title: (interest: string) => string; description: (interest: string) => string; competition: string; formats: string[] }[] = [
    { match: /technology|\bai\b|science|space|gaming|esports|automobile/, title: (i) => /ai/i.test(i) ? (canExplain ? "AI explained simply" : "Your perspective on AI") : `${i}: made understandable`, description: (i) => `Create accessible ${i.toLowerCase()} content using relatable examples, clear explanations, and practical demonstrations.`, competition: "High competition", formats: ["Explainers", "Short-form video", "Carousel"] },
    { match: /education|learning|books|literature|history|mythology|career|professional growth/, title: (i) => /education|learning/i.test(i) ? "Make learning easier" : `Useful insights on ${i.toLowerCase()}`, description: (i) => `Turn ${i.toLowerCase()} into clear, memorable content that helps your intended audience learn something useful.`, competition: "Medium competition", formats: ["Tutorials", "Visual explainers", "How-to guides"] },
    { match: /business|entrepreneurship|finance|investing/, title: (i) => monetization ? "Practical business and money insights" : `${i}: practical takeaways`, description: (i) => `Make ${i.toLowerCase()} easier to understand through examples, lessons, and decisions people can apply.`, competition: "High competition", formats: ["Case studies", "Explainers", "Carousel"] },
    { match: /health|fitness|mental wellness|psychology|personal development|relationships/, title: (i) => `${i}: practical everyday guidance`, description: (i) => `Create approachable ${i.toLowerCase()} content grounded in clear explanations, thoughtful experiences, and useful takeaways.`, competition: "High competition", formats: ["How-to guides", "Short-form video", "Personal stories"] },
    { match: /travel|lifestyle|food|cooking|fashion|beauty|home decor|gardening|parenting|family|pets|animals|nature|environment|diy|crafts/, title: (i) => `Make ${i.toLowerCase()} worth sharing`, description: (i) => `Turn ${i.toLowerCase()} into useful or entertaining content with practical tips, demonstrations, and a personal point of view.`, competition: "High competition", formats: ["Vlogs", "How-to", "Short-form video"] },
    { match: /movies|entertainment|music|dance|sports|comedy|memes|culture|society|art|design|photography|videography|spirituality|philosophy|news|current affairs/, title: (i) => `A fresh perspective on ${i.toLowerCase()}`, description: (i) => `Build engaging ${i.toLowerCase()} content around your own perspective, useful context, and the details your audience cares about.`, competition: "High competition", formats: ["Commentary", "Storytelling", "Short-form video"] },
  ];

  const opportunities: Opportunity[] = [];
  const seen = new Set<string>();
  const selectedInterests = interests.length ? interests : ["Your chosen interests"];

  for (const interest of selectedInterests) {
    if (opportunities.length >= 3) break;
    const template = topicTemplates.find((item) => item.match.test(interest));
    const key = template ? String(topicTemplates.indexOf(template)) : interest.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    const title = template ? template.title(interest) : `Explore ${interest.toLowerCase()} your way`;
    const description = template ? template.description(interest) : `Create content about ${interest.toLowerCase()} using the strengths, formats, and goals you selected.`;
    const fitSignals = [
      skills.length ? `${skills.slice(0, 2).join(" and ").toLowerCase()}` : "your chosen strengths",
      audience.length && !audienceText.includes("not sure") ? `your intended audience of ${audience.slice(0, 2).join(" and ").toLowerCase()}` : "the audience you want to reach",
      goals.length && !goalText.includes("figuring it out") ? `your goal to ${goals.slice(0, 2).join(" and ").toLowerCase()}` : "your creator goals",
    ];
    let alignment = "Exploration stage";
    if (skills.length && interests.length && goals.length) alignment = "Strong alignment";
    if (skills.length && interests.length && (canExplain || canStorytell || canResearch || canVisual) && (educational || storyDriven || formatText)) alignment = "Very strong alignment";
    if (!skills.length || !goals.length) alignment = interests.length ? "Emerging fit" : "Exploration stage";

    const tailoredFormats = contentTypes.length && !formatText.includes("still exploring")
      ? contentTypes.slice(0, 3).map((item) => item.replace(/^Educational explainers or tutorials$/i, "Educational tutorials").replace(/^Comedy, memes or relatable content$/i, "Comedy & relatable content"))
      : (template?.formats ?? ["Short-form video", "Storytelling", "How-to guides"]);

    opportunities.push({
      number: `0${opportunities.length + 1}`,
      title,
      description,
      alignment,
      competition: template?.competition ?? "Niche-dependent",
      reason: `This direction connects ${fitSignals[0]} with your interest in ${interest.toLowerCase()}. It can support ${fitSignals[1]} and ${fitSignals[2]}. ${canExplain ? "Use clear explanations and concrete examples" : canStorytell ? "Use relatable stories and personal perspective" : canResearch ? "Use well-organized research and useful takeaways" : canVisual ? "Use strong visuals and demonstrations" : "Experiment with a format that feels natural to you"} to make the idea recognizably yours.`,
      formats: tailoredFormats,
    });
  }

  if (!opportunities.length) {
    opportunities.push({
      number: "01",
      title: "Discover your first content direction",
      description: "Choose at least one interest in your creator questionnaire to receive more tailored opportunities.",
      alignment: "Exploration stage",
      competition: "Not assessed",
      reason: "Your map will become more specific when you select interests, strengths, content styles, audience, and goals.",
      formats: contentTypes.length ? contentTypes.slice(0, 3) : ["Explainers", "Short-form video", "Storytelling"],
    });
  }

  return opportunities;
}

export default function OpportunityMap() {
  const [profile, setProfile] =
    useState<CreatorProfile | null>(null);

  useEffect(() => {
    try {
      const storedProfile = sessionStorage.getItem(
        "evolex_creator_profile"
      );

      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);

        setProfile({
          skills: Array.isArray(parsed.skills)
            ? parsed.skills
            : defaultProfile.skills,

          interests: Array.isArray(parsed.interests)
            ? parsed.interests
            : defaultProfile.interests,

          experience:
            typeof parsed.experience === "string"
              ? parsed.experience
              : "",

          goals: Array.isArray(parsed.goals) ? parsed.goals : [],
          contentTypes: Array.isArray(parsed.contentTypes)
            ? parsed.contentTypes
            : Array.isArray(parsed.contentPreferences) ? parsed.contentPreferences : [],
          audience: Array.isArray(parsed.audience)
            ? parsed.audience
            : Array.isArray(parsed.intendedAudience) ? parsed.intendedAudience : [],
        });
      } else {
        setProfile(defaultProfile);
      }
    } catch (error) {
      console.error(
        "EVOLEX profile could not be loaded:",
        error
      );

      setProfile(defaultProfile);
    }
  }, []);

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#F8F7FF] via-white to-[#EEF6FF] text-[#171C46]">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-100 bg-white text-violet-700 shadow-[0_8px_24px_rgba(91,67,170,0.12)]">
            <Sparkles className="h-5 w-5" />
          </div>

          <p className="mt-5 text-sm text-slate-500">
            Preparing your opportunity map...
          </p>
        </div>
      </main>
    );
  }

  const opportunities = generateOpportunities(profile);

  return (
    <div className="flex min-h-screen bg-[#F8F9FF] text-[#171C46]">
      <Sidebar />
      <main className="relative min-w-0 flex-1 overflow-hidden">

      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute -right-48 -top-48 h-[600px] w-[600px] rounded-full bg-violet-200/50 blur-3xl" />

        <div className="absolute -bottom-48 -left-48 h-[550px] w-[550px] rounded-full bg-sky-200/40 blur-3xl" />

      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-7 sm:px-8 lg:px-10">

        {/* Header */}
        <header className="flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-violet-100 bg-white text-violet-700 shadow-[0_8px_24px_rgba(91,67,170,0.12)]">
              <Sparkles className="h-4 w-4" />
            </div>

            <span className="text-sm font-extrabold tracking-[0.22em] text-[#202653]">
              EVOLEX
            </span>

          </div>

          <span className="hidden rounded-full border border-violet-100 bg-white/80 px-4 py-2 text-[10px] font-bold tracking-[0.16em] text-violet-700 sm:block">
            CREATOR INTELLIGENCE
          </span>

        </header>


        {/* Hero */}
        <section className="mx-auto max-w-5xl pb-14 pt-16 sm:pt-20">

          <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white/80 px-4 py-2 text-xs font-bold tracking-[0.13em] text-violet-700 shadow-sm">

            <Sparkles className="h-3.5 w-3.5" />

            EVOLEX / YOUR PROFILE

          </div>

          <h1 className="mt-7 max-w-4xl text-4xl font-extrabold leading-[0.98] tracking-[-0.055em] sm:text-6xl">

            Your Creator
            <br />

            <span className="bg-gradient-to-r from-violet-600 via-indigo-500 to-sky-500 bg-clip-text text-transparent">
              Opportunity Map.
            </span>

          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">

            EVOLEX connected your strengths, interests and
            goals to discover content opportunities that could
            fit you.

          </p>

          <div className="mt-10 flex flex-wrap gap-3">

            <div className="flex items-center gap-2 rounded-full border border-violet-100 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-[0_5px_18px_rgba(91,67,170,0.06)]">

              <Check className="h-4 w-4 text-violet-500" />

              Profile analyzed

            </div>

            <div className="flex items-center gap-2 rounded-full border border-violet-100 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-[0_5px_18px_rgba(91,67,170,0.06)]">

              <Sparkles className="h-4 w-4 text-violet-500" />

              Personalized for you

            </div>

          </div>

        </section>


        {/* Profile cards */}
        <section className="grid gap-5 lg:grid-cols-2">

          {/* Strengths */}
          <div className="rounded-[28px] border border-violet-100/80 bg-white/90 p-7 shadow-[0_16px_45px_rgba(91,67,170,0.07)] backdrop-blur-sm transition-shadow hover:shadow-[0_20px_55px_rgba(91,67,170,0.11)]">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">

                <Target className="h-5 w-5" />

              </div>

              <div>

                <p className="text-xs font-semibold tracking-[0.14em] text-black/30">
                  YOUR STRENGTHS
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  What you bring
                </h2>

              </div>

            </div>

            <div className="mt-7 flex flex-wrap gap-2">

              {profile.skills.map((skill) => (

                <span
                  key={skill}
                  className="rounded-full border border-violet-100 bg-violet-50/60 px-4 py-2 text-sm font-medium text-violet-800"
                >
                  {skill}
                </span>

              ))}

            </div>

          </div>


          {/* Interests */}
          <div className="rounded-[28px] border border-violet-100/80 bg-white/90 p-7 shadow-[0_16px_45px_rgba(91,67,170,0.07)] backdrop-blur-sm transition-shadow hover:shadow-[0_20px_55px_rgba(91,67,170,0.11)]">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

                <Lightbulb className="h-5 w-5" />

              </div>

              <div>

                <p className="text-xs font-semibold tracking-[0.14em] text-black/30">
                  YOUR INTERESTS
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  What could inspire you
                </h2>

              </div>

            </div>

            <div className="mt-7 flex flex-wrap gap-2">

              {profile.interests.map((interest) => (

                <span
                  key={interest}
                  className="rounded-full border border-violet-100 bg-violet-50/60 px-4 py-2 text-sm font-medium text-violet-800"
                >
                  {interest}
                </span>

              ))}

            </div>

          </div>

        </section>


        {/* Opportunities title */}
        <section className="pb-5 pt-24">

          <div className="flex items-end justify-between gap-6">

            <div>

              <p className="text-xs font-semibold tracking-[0.16em] text-black/30">
                CONTENT OPPORTUNITIES
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                Where could you create?
              </h2>

              <p className="mt-3 max-w-xl text-base leading-6 text-black/40">
                These are possibilities, not instructions.
                You decide what direction feels right.
              </p>

            </div>

            <div className="hidden items-center gap-2 text-xs text-black/30 sm:flex">

              <TrendingUp className="h-4 w-4" />

              Opportunity signals

            </div>

          </div>

        </section>


        {/* Opportunity cards */}
        <section className="space-y-5">

          {opportunities.map((opportunity) => (

            <article
              key={opportunity.number}
              className="group rounded-[28px] border border-black/[0.08] bg-white p-7 shadow-[0_15px_50px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] sm:p-9"
            >

              <div className="flex flex-col gap-7 lg:flex-row">

                {/* Number */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-violet-200">

                  {opportunity.number}

                </div>


                {/* Content */}
                <div className="flex-1">

                  <div className="flex flex-col justify-between gap-4 sm:flex-row">

                    <div>

                      <h3 className="text-2xl font-semibold tracking-[-0.035em]">
                        {opportunity.title}
                      </h3>

                      <p className="mt-3 max-w-2xl text-base leading-7 text-black/45">
                        {opportunity.description}
                      </p>

                    </div>


                    <div className="flex shrink-0 flex-wrap gap-2">

                      <span className="h-fit rounded-full bg-violet-50 px-3 py-1.5 text-sm font-medium text-violet-700">
                        {opportunity.alignment}
                      </span>

                      <span className="h-fit rounded-full bg-black/[0.04] px-3 py-1.5 text-sm font-medium text-black/45">
                        {opportunity.competition}
                      </span>

                    </div>

                  </div>


                  {/* Why */}
                  <div className="mt-7 rounded-2xl border border-violet-100/80 bg-gradient-to-br from-[#F8F6FF] to-[#F2F7FF] p-5">

                    <p className="text-sm font-semibold tracking-[0.12em] text-black/40">
                      WHY THIS FITS YOU
                    </p>

                    <p className="mt-2 text-base leading-7 text-black/60">
                      {opportunity.reason}
                    </p>

                  </div>


                  {/* Formats */}
                  <div className="mt-6 flex flex-wrap items-center gap-2">

                    <span className="mr-1 text-sm font-medium text-black/40">
                      Possible formats:
                    </span>

                    {opportunity.formats.map((format) => (

                      <span
                        key={format}
                        className="rounded-full border border-black/[0.08] px-3 py-1.5 text-sm text-black/60"
                      >
                        {format}
                      </span>

                    ))}

                  </div>


                </div>

              </div>

            </article>

          ))}

        </section>


        {/* Creator direction */}
        <section className="mt-24 overflow-hidden rounded-[32px] border border-violet-800/20 bg-gradient-to-br from-[#20164F] via-[#29245F] to-[#173B69] p-8 text-white shadow-[0_24px_70px_rgba(43,35,104,0.2)] sm:p-10 lg:p-12">

          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">

            <div>

              <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-white/40">

                <Sparkles className="h-4 w-4" />

                YOUR CREATOR DIRECTION

              </div>

              <h2 className="mt-5 max-w-2xl text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">

                Your strengths and interests can become your starting point.

              </h2>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/50">

                EVOLEX is showing you possibilities, not making
                the decision for you. Your next step is to experiment
                and discover what actually resonates with your audience.

              </p>

            </div>

            <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-white/[0.08]">

              <BarChart3 className="h-9 w-9 text-white/70" />

            </div>

          </div>

        </section>


        {/* Bottom CTA */}
        <section className="flex flex-col items-center justify-between gap-5 py-14 sm:flex-row">

          <div>

            <p className="text-sm font-semibold">
              Ready to experiment?
            </p>

            <p className="mt-1 text-sm text-black/40">
              Choose an opportunity and start exploring.
            </p>

          </div>


          
<button
  type="button"
  onClick={() => {
    sessionStorage.setItem(
      "evolex_pre_publish",
      JSON.stringify({
        opportunity: opportunities[0]?.title ?? "Discover your content direction",
        audience: profile.audience.join(", ") || "Audience to be explored",
        format: profile.contentTypes[0] || opportunities[0]?.formats[0] || "Short-form video",
        angle: opportunities[0]?.description || "Explore a content idea that fits your interests",
        concept: opportunities[0]?.title || "My first content experiment",
        hypothesis: `If I create content about ${profile.interests[0] || "a topic I care about"} using ${profile.skills[0] || "a format that feels natural to me"}, it may resonate with ${profile.audience[0] || "my intended audience"}. I will compare the actual results after publishing.`,
        hook: opportunities[0]?.title || "A useful idea for my audience",
        value: opportunities[0]?.description || "Deliver one clear takeaway",
        clarity: 5,
        confidence: 5,
      })
    );

    window.location.href =
      "/pre-publish-lab";
  }}
  className="flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition-all hover:-translate-y-0.5 hover:from-violet-700 hover:to-indigo-700"
>
  Start exploring
  <ChevronRight className="h-4 w-4" />
</button>

        </section>

      </div>

      </main>
    </div>
  );
}