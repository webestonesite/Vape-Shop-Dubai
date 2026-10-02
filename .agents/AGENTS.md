# UI & Design System Rules

## Icon Usage Policy
- **STRICT PROHIBITION**: NEVER use `Sparkles`, `Sparkle`, or AI-style magic spark icons anywhere in the UI or design system.
- Use relevant domain icons instead:
  - For Blog & Articles: `BookOpen`, `Tag`, `Calendar`
  - For Quality & Security: `ShieldCheck`, `Award`, `CheckCircle2`
  - For Actions & CTAs: `ArrowRight`, `ChevronRight`

## ECC Master Agent Engineering Rules (Always Enforced)
- **Mandatory ECC Execution Loop**: For any non-trivial coding task, bug fix, or refactoring, strictly adhere to the ECC workflow: `plan -> test -> implement -> review -> verify -> remember -> improve`.
- **Search & Plan First**: Always read relevant root specifications, TypeScript/Dart interfaces, and KIs BEFORE writing or editing code.
- **Strict TDD & Verification**: Always write/update test cases and verify with actual test runs or build commands (`tsc --noEmit`, `npm run build`, `flutter analyze`) before marking any task complete. Never declare success without empirical verification.
- **Zero Superficial Patches**: Never mask error symptoms or swallow exceptions. Address underlying root causes strictly supported by diagnostic log evidence.
- **Context Window Optimization**: Load only precision files and minimize output token bloat.
