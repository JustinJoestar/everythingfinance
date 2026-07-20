import { relativeTime } from "@/lib/dates";
import type { Article } from "@/lib/types";

import { CategoryTag } from "./CategoryTag";

export function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="rounded-xl border border-edge bg-surface p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-md">
      <div className="mb-2 flex flex-wrap items-center gap-2 font-mono text-xs text-faint">
        {article.categories.map((c) => (
          <CategoryTag key={c} category={c} />
        ))}
        <span className="font-medium text-muted">{article.source}</span>
        <span aria-hidden>·</span>
        <time dateTime={article.published_at}>
          {relativeTime(article.published_at)}
        </time>
      </div>

      <h3 className="font-serif text-lg font-semibold leading-snug">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-accent"
        >
          {article.title}
        </a>
      </h3>

      <p className="mt-2 text-[15px] leading-relaxed text-muted">
        {article.summary}
      </p>

      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group/link mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
      >
        Read the original
        <svg
          className="transition-transform duration-300 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M7 17 17 7M9 7h8v8" />
        </svg>
      </a>
    </article>
  );
}
