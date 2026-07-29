import type { Metadata } from "next";

import { ArchiveCard } from "@/components/ArchiveCard";
import { QuizPlayer } from "@/components/QuizPlayer";
import { PageHero } from "@/components/ui/page-hero";
import { getCurrentQuiz, getQuizArchive, getSessionUser } from "@/lib/data";

export const metadata: Metadata = {
  title: "Daily quiz",
  description: "A short quiz on today's finance news, in plain English.",
};

export default async function QuizPage() {
  const [quiz, user, archive] = await Promise.all([
    getCurrentQuiz(),
    getSessionUser(),
    getQuizArchive(),
  ]);

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Learn"
        title="Daily quiz"
        description="A short test on the day's news. A new one every day, and you don't need a finance degree."
      />

      <div className="mx-auto w-full max-w-2xl space-y-8">
        {!quiz ? (
          <div className="rounded-2xl border border-edge bg-surface p-12 text-center text-muted">
            <p className="font-serif text-xl font-semibold text-ink">
              No quiz yet
            </p>
            <p className="mt-2 text-sm">
              Today&rsquo;s quiz is generated each morning from the day&rsquo;s
              news. Check back soon.
            </p>
          </div>
        ) : (
          <QuizPlayer quiz={quiz} signedIn={Boolean(user)} />
        )}

        {user && (
          <ArchiveCard
            title="Your quiz archive"
            emptyText="No quizzes completed yet. Finish today's quiz and it lands here with the date."
            rows={archive.map((a) => ({
              day: a.day,
              value: `${a.score}/${a.total}`,
            }))}
          />
        )}
      </div>
    </div>
  );
}
