"use client";

import { track } from "@vercel/analytics";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { Quiz, QuizAttempt } from "@/lib/types";

type Phase = "intro" | "playing" | "done";

export function QuizPlayer({
  quiz,
  signedIn,
  pastAttempts,
}: {
  quiz: Quiz;
  signedIn: boolean;
  pastAttempts: QuizAttempt[];
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("intro");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [saved, setSaved] = useState(false);

  const questions = quiz.questions;
  const q = questions[qIndex];

  function choose(i: number) {
    if (selected !== null) return;
    setSelected(i);
    if (i === q.answer) setScore((s) => s + 1);
  }

  async function next() {
    if (qIndex + 1 < questions.length) {
      setQIndex((i) => i + 1);
      setSelected(null);
      return;
    }
    // Finished.
    const finalScore = score;
    setPhase("done");
    track("activity_completed", {
      type: "quiz",
      score: finalScore,
      total: questions.length,
    });
    if (signedIn) {
      const res = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quiz_id: quiz.id,
          score: finalScore,
          total: questions.length,
        }),
      });
      if (res.ok) {
        setSaved(true);
        router.refresh();
      }
    }
  }

  function restart() {
    setPhase("playing");
    setQIndex(0);
    setSelected(null);
    setScore(0);
    setSaved(false);
  }

  if (phase === "intro") {
    return (
      <div className="rounded-xl border border-edge bg-surface p-8 text-center shadow-sm">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-accent">
          Week of {quiz.week_start}
        </p>
        <h2 className="mt-2 font-serif text-2xl font-semibold">
          How closely did you follow the markets?
        </h2>
        <p className="mt-2 text-sm text-muted">
          {questions.length} questions, with an explanation after every answer
          {signedIn
            ? ". Your score is saved."
            : ". Sign in to save your scores."}
        </p>
        <button
          onClick={restart}
          className="mt-5 rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-accent-ink shadow-sm transition-colors hover:bg-accent-strong"
        >
          Start the quiz
        </button>

        {pastAttempts.length > 0 && (
          <div className="mt-7 border-t border-edge pt-4 text-left">
            <p className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-faint">
              Your recent scores
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-muted">
              {pastAttempts.slice(0, 5).map((a, i) => (
                <li key={i} className="flex items-center justify-between">
                  <span>
                    {new Date(a.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="font-semibold text-ink">
                    {a.score}/{a.total}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  if (phase === "done") {
    const pct = Math.round((score / questions.length) * 100);
    const message =
      pct === 100
        ? "A perfect score. You followed the markets closely this week."
        : pct >= 70
          ? "A strong result. You caught most of what mattered."
          : pct >= 40
            ? "A fair showing. The recap and flashcards will fill in the gaps."
            : "A difficult week. Skim the feed and try again; repetition is the point.";

    return (
      <div className="rounded-xl border border-edge bg-surface p-8 text-center shadow-sm">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-faint">
          Your result
        </p>
        <p className="mt-2 font-serif text-5xl font-semibold text-ink">
          {score}/{questions.length}
        </p>
        <p className="mt-3 text-sm text-muted">{message}</p>
        {signedIn && saved && (
          <p className="mt-1 text-xs text-success">
            Score saved to your history
          </p>
        )}
        <button
          onClick={restart}
          className="mt-5 rounded-lg border border-edge px-5 py-2 text-sm font-medium text-accent shadow-sm transition-colors hover:bg-raised"
        >
          Retake quiz
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5" aria-label="Progress">
        {questions.map((_, i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i < qIndex
                ? "bg-accent"
                : i === qIndex
                  ? "bg-accent/40"
                  : "bg-edge"
            }`}
          />
        ))}
      </div>

      <div className="rounded-xl border border-edge bg-surface p-6 shadow-sm">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-faint">
          Question {qIndex + 1} of {questions.length}
        </p>
        <h2 className="mt-2 font-serif text-lg font-semibold leading-snug">
          {q.question}
        </h2>

        <div className="mt-4 space-y-2">
          {q.options.map((opt, i) => {
            let style =
              "border-edge bg-raised hover:border-faint hover:text-ink";
            if (selected !== null) {
              if (i === q.answer) {
                style = "border-success bg-success/10 text-success";
              } else if (i === selected) {
                style = "border-danger bg-danger/10 text-danger";
              } else {
                style = "border-edge opacity-50";
              }
            }
            return (
              <button
                key={i}
                onClick={() => choose(i)}
                disabled={selected !== null}
                className={`w-full rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors ${style}`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <div className="mt-4 rounded-lg bg-accent-soft p-4 text-sm leading-relaxed">
            <p className="font-semibold">
              {selected === q.answer ? "Correct" : "Not quite"}
            </p>
            <p className="mt-1 text-muted">{q.explanation}</p>
            <button
              onClick={next}
              className="mt-3 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-ink shadow-sm transition-colors hover:bg-accent-strong"
            >
              {qIndex + 1 < questions.length ? "Next question" : "See my score"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
