import { CATEGORY_LABELS, type Category } from "@/lib/types";

export function CategoryTag({ category }: { category: Category }) {
  return (
    <span
      className={`cat-${category} inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide`}
    >
      {CATEGORY_LABELS[category]}
    </span>
  );
}
