"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import {
  ArrowLeft, ArrowRight, Check, Compass, Heart, Lightbulb,
  Sparkles, Target, WandSparkles
} from "lucide-react";

const questions = [
  {
    id: "skills",
    eyebrow: "YOUR STRENGTHS",
    title: "What are you naturally good at?",
    subtitle: "Select the things you enjoy or feel come naturally to you. You don't need to be an expert.",
    helper: "Choose all that apply",
    options: [
      "Explaining things", "Storytelling", "Making people laugh", "Teaching",
      "Visual creativity", "Research", "Speaking", "Writing", "Problem solving",
      "Giving advice", "Entertaining people", "Designing and aesthetics",
      "Analyzing trends", "Organizing information", "Sharing personal experiences",
      "Interviewing people", "Photography and videography", "Building or making things", "Other"
    ],
  },
  {
    id: "interests",
    eyebrow: "YOUR CURIOSITY",
    title: "What could you talk about for hours?",
    subtitle: "Choose topics that genuinely interest you. You don't have to be an expert to create around them.",
    helper: "Choose all that apply",
    options: [
      "Technology & AI", "Education & Learning", "Business & Entrepreneurship",
      "Finance & Investing", "Health & Fitness", "Mental Wellness", "Travel & Adventure",
      "Lifestyle & Daily Life", "Food & Cooking", "Fashion & Beauty", "Movies & Entertainment",
      "Music & Dance", "Gaming & Esports", "Science & Space", "Sports", "Personal Development",
      "Psychology & Human Behaviour", "Relationships & Communication", "Culture & Society",
      "History & Mythology", "Books & Literature", "Art & Design", "Photography & Videography",
      "Parenting & Family", "Nature & Environment", "DIY & Crafts", "Automobiles",
      "Spirituality & Philosophy", "News & Current Affairs", "Career & Professional Growth",
      "Comedy & Memes", "Home Decor & Gardening", "Pets & Animals", "Other"
    ],
  },
  {
    id: "contentTypes",
    eyebrow: "YOUR CREATIVE STYLE",
    title: "What kind of content would you enjoy creating?",
    subtitle: "Think about the formats that sound fun to make—not what you think you should make.",
    helper: "Choose all that apply",
    options: [
      "Educational explainers or tutorials", "Personal stories and experiences",
      "Comedy, memes or relatable content", "Reviews and recommendations",
      "Tips, tricks and how-to guides", "Opinions and commentary",
      "Vlogs and day-in-the-life content", "Interviews and conversations",
      "Visual or artistic content", "Experiments and challenges",
      "News and trend breakdowns", "I'm still exploring"
    ],
  },
  {
    id: "audience",
    eyebrow: "WHO IT'S FOR",
    title: "Who would you like to help, entertain or inspire?",
    subtitle: "Picture the people you would love to make something valuable, useful or enjoyable for.",
    helper: "Choose all that apply",
    options: [
      "Students and learners", "Beginners exploring a topic", "Working professionals",
      "Entrepreneurs and business owners", "People seeking personal growth",
      "Hobbyists and enthusiasts", "Families and parents", "A general audience",
      "People with similar experiences to mine", "I'm not sure yet"
    ],
  },
  {
    id: "goals",
    eyebrow: "YOUR WHY",
    title: "What do you want from your creator journey?",
    subtitle: "There is no wrong answer. Your motivation helps EVOLEX recommend opportunities that fit you.",
    helper: "Choose all that apply",
    options: [
      "Build a personal brand", "Earn money", "Teach and share knowledge",
      "Explore a passion", "Build a community", "Grow a business",
      "Get career opportunities", "Express myself creatively",
      "Inspire or help others", "I'm still figuring it out"
    ],
  },
] as const;

type Answers = {
  skills: string[];
  interests: string[];
  contentTypes: string[];
  audience: string[];
  goals: string[];
};

const emptyAnswers: Answers = {
  skills: [], interests: [], contentTypes: [], audience: [], goals: []
};

const questionIcons = [Sparkles, Lightbulb, WandSparkles, Heart, Target];

export default function NewCreatorQuestionnaire() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(emptyAnswers);
  const [error, setError] = useState("");

  const current = questions[step];
  const selected = answers[current.id as keyof Answers];
  const progress = useMemo(() => Math.round(((step + 1) / questions.length) * 100), [step]);
  const CurrentIcon = questionIcons[step];

  function toggleOption(questionId: keyof Answers, option: string) {
    setAnswers((previous) => {
      const values = previous[questionId];
      const next = values.includes(option)
        ? values.filter((item) => item !== option)
        : [...values, option];
      return { ...previous, [questionId]: next };
    });
    setError("");
  }

  function continueFlow() {
    if (!selected.length) {
      setError("Choose at least one option to continue. You can always change your direction later.");
      return;
    }

    if (step < questions.length - 1) {
      setStep((value) => value + 1);
      setError("");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const profile = {
      ...answers,
      // Keep compatibility with the existing Opportunity Map profile shape.
      skills: answers.skills,
      experience: "",
      contentPreferences: answers.contentTypes,
      intendedAudience: answers.audience,
      motivations: answers.goals,
      completedAt: new Date().toISOString(),
    };

    try {
      sessionStorage.setItem("evolex_creator_profile", JSON.stringify(profile));
      localStorage.setItem("evolex_creator_profile", JSON.stringify(profile));
    } catch (storageError) {
      console.error("Could not save the creator profile:", storageError);
    }

    router.push("/opportunity-map");
  }

  return (
    <div className="flex min-h-screen bg-[#F8F9FF] text-[#171C46]">
      <Sidebar />

      <main className="relative min-w-0 flex-1 overflow-hidden px-4 py-6 sm:px-8 sm:py-9 lg:px-12">
        <div className="pointer-events-none absolute -right-32 -top-36 h-96 w-96 rounded-full bg-violet-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-28 h-96 w-96 rounded-full bg-sky-200/50 blur-3xl" />

        <div className="relative mx-auto max-w-5xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white/90 px-3.5 py-2 text-xs font-bold tracking-[0.12em] text-violet-700 shadow-sm">
              <Sparkles className="h-4 w-4" />
              EVOLEX <span className="text-slate-300">/</span> NEW CREATOR
            </div>
            <span className="text-sm font-medium text-slate-500">About 2 minutes · No wrong answers</span>
          </div>

          <section className="mt-7 overflow-hidden rounded-[30px] border border-white bg-white/90 shadow-[0_24px_80px_rgba(58,48,120,0.10)] backdrop-blur">
            <div className="bg-gradient-to-br from-[#29235F] via-[#5144A6] to-[#5C9FE8] px-6 py-8 text-white sm:px-10 sm:py-10">
              <div className="flex flex-col justify-between gap-7 sm:flex-row sm:items-end">
                <div className="max-w-2xl">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90">
                    <Compass className="h-3.5 w-3.5" /> YOUR CREATOR JOURNEY STARTS HERE
                  </div>
                  <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
                    Find your creative direction.
                  </h1>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
                    Tell us what makes you, you. EVOLEX will use your answers to uncover content opportunities that feel like a natural fit.
                  </p>
                </div>
                <div className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-[26px] border border-white/20 bg-white/10 sm:flex">
                  <CurrentIcon className="h-9 w-9" />
                </div>
              </div>
              <div className="mt-8 flex items-center justify-between text-xs font-semibold text-white/75">
                <span>QUESTION {step + 1} OF {questions.length}</span>
                <span>{progress}% complete</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20">
                <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-5 grid grid-cols-5 gap-2">
                {questions.map((question, index) => (
                  <div key={question.id} className={`h-1 rounded-full ${index <= step ? "bg-white" : "bg-white/25"}`} />
                ))}
              </div>
            </div>

            <div className="p-5 sm:p-8 lg:p-10">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-3xl">
                  <p className="text-xs font-extrabold tracking-[0.18em] text-violet-600">{current.eyebrow}</p>
                  <h2 className="mt-3 text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">{current.title}</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">{current.subtitle}</p>
                </div>
                <span className="rounded-2xl border border-violet-100 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">
                  {selected.length} selected
                </span>
              </div>

              <div className="mt-7 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">{current.helper}</p>
                <p className="text-xs text-slate-400">Tap a card to select</p>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {current.options.map((option, index) => {
                  const isSelected = selected.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => toggleOption(current.id as keyof Answers, option)}
                      className={`group flex min-h-[62px] items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                        isSelected
                          ? "border-violet-300 bg-gradient-to-r from-violet-50 to-sky-50 shadow-[0_8px_24px_rgba(99,77,180,0.10)] ring-2 ring-violet-100"
                          : "border-slate-200 bg-white hover:border-violet-200"
                      }`}
                    >
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                        isSelected ? "border-violet-600 bg-violet-600 text-white" : "border-slate-300 bg-white text-transparent group-hover:border-violet-400"
                      }`}>
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <span className={`text-sm font-medium leading-5 ${isSelected ? "text-violet-900" : "text-slate-700"}`}>{option}</span>
                    </button>
                  );
                })}
              </div>

              {error && (
                <p role="alert" className="mt-5 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  {error}
                </p>
              )}

              <div className="mt-9 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => { if (step === 0) router.push("/"); else { setStep((value) => value - 1); setError(""); } }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
                >
                  <ArrowLeft className="h-4 w-4" /> {step === 0 ? "Back to home" : "Previous question"}
                </button>
                <button
                  type="button"
                  onClick={continueFlow}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  {step === questions.length - 1 ? "Build my Opportunity Map" : "Continue"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>

          <p className="mt-5 text-center text-xs leading-5 text-slate-400">
            Your answers help shape your recommendations. You can revisit and refine your direction as you experiment.
          </p>
        </div>
      </main>
    </div>
  );
}
