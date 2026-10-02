<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# UI & Design System Rules

## Icon Usage Policy
- **STRICT PROHIBITION**: NEVER use `Sparkles`, `Sparkle`, or AI-style magic spark icons anywhere in the UI or design system.
- Use relevant domain icons instead (e.g. `BookOpen`, `ShieldCheck`, `Award`, `Flame`).

## ECC Master Agent Engineering Rules (Always Enforced)
- **Mandatory ECC Execution Loop**: For any non-trivial coding task, bug fix, or refactoring, strictly adhere to the ECC workflow: `plan -> test -> implement -> review -> verify -> remember -> improve`.
- **Search & Plan First**: Always read relevant root specifications, TypeScript/Dart interfaces, and KIs BEFORE writing or editing code.
- **Strict TDD & Verification**: Always write/update test cases and verify with actual test runs or build commands (`tsc --noEmit`, `npm run build`, `flutter analyze`) before marking any task complete. Never declare success without empirical verification.
- **Zero Superficial Patches**: Never mask error symptoms or swallow exceptions. Address underlying root causes strictly supported by diagnostic log evidence.
- **Context Window Optimization**: Load only precision files and minimize output token bloat.

