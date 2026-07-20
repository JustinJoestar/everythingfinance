import type { Metadata } from "next";

import { GlossaryExplorer } from "@/components/GlossaryExplorer";
import { PageHero } from "@/components/ui/page-hero";
import { getGlossary } from "@/lib/data";

export const metadata: Metadata = {
  title: "Glossary",
  description:
    "Finance terms defined in plain English, without the jargon.",
};

export default async function GlossaryPage() {
  const entries = await getGlossary();

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Reference"
        title="Glossary"
        description="Finance terms explained in plain English. If one is missing, ask and it gets added for everyone."
      />

      <div className="mx-auto w-full max-w-3xl">
        <GlossaryExplorer initialEntries={entries} />
      </div>
    </div>
  );
}
