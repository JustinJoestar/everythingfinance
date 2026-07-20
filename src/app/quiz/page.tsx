import type { Metadata } from "next";

import { QuizPlayer } from "@/components/QuizPlayer";
import { PageHero } from "@/components/ui/page-hero";
import { getCurrentQuiz, getQuizAttempts, getSessionUser } from "@/lib/data";

export const metadata: Metadata = {
  title: "Weekly quiz",
  description: "A short quiz on the week's finance news, in plain English.",
};

export default async function QuizPage() {
  const [quiz, user, attempts] = await Promise.all([
    getCurrentQuiz(),
    getSessionUser(),
    getQuizAttempts(),
  ]);

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Learn"
        title="Weekly quiz"
        description="A short test on the week's news. New every Monday, and you don't need a finance degree."
      />

      <div className="mx-auto w-full max-w-2xl">
      {!quiz ? (
        <div className="rounded-2xl border border-edge bg-surface p-12 text-center text-muted">
          <p className="font-serif text-xl font-semibold text-ink">
            No quiz yet
          </p>
          <p className="mt-2 text-sm">
            This week’s quiz is generated every Monday. Check back soon.
          </p>
        </div>
      ) : (
        <QuizPlayer
          quiz={quiz}
          signedIn={Boolean(user)}
          pastAttempts={attempts}
        />
      )}
      </div>
    </div>
  );
}
