<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Writing style for all reader-facing text

UI copy, docs, sample content, and the AI prompts in `src/lib/ai/` follow the humanizer rules: no em or en dashes, simple verbs (is, are, has), active voice, no hype vocabulary (crucial, vibrant, seamless, testament, landscape), no "-ing" phrases tacked onto sentence ends, no filler openers, no generic upbeat closers. Write like a careful human editor. The full pattern list lives in the humanizer skill (`~/.claude/skills/humanizer/SKILL.md`).
