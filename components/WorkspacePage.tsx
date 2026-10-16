
import Sidebar from "./Sidebar";

type Props = {
  title: string;
  description: string;
  eyebrow?: string;
};

export default function WorkspacePage({
  title,
  description,
  eyebrow = "EVOLEX WORKSPACE",
}: Props) {
  return (
    <div className="flex min-h-screen bg-[#FCFCFF] text-[#171C46]">
      <Sidebar />

      <main className="min-w-0 flex-1 px-8 py-16 lg:px-14">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold tracking-widest text-violet-600">
            {eyebrow}
          </p>

          <h1 className="mt-4 text-4xl font-extrabold">{title}</h1>

          <p className="mt-4 max-w-2xl leading-7 text-slate-600">
            {description}
          </p>

          <section className="mt-10 rounded-3xl border border-violet-100 bg-gradient-to-br from-white to-violet-50 p-8">
            <h2 className="text-xl font-bold">
              Your next step starts here
            </h2>

            <p className="mt-3 leading-7 text-slate-600">
              Your EVOLEX workspace is ready to build.
              We'll connect its features and Gemini AI analysis next.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
