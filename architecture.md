# System Architecture & Technical Specifications

## Framework & Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4, Vanilla CSS Design System Tokens
- **Icons**: Lucide React (Domain Specific Icons)
- **State Management**: React Context (`CartContext`)

## Directory Structure
- `/src/app`: App router pages, route handlers, site map, robots.ts, layout.tsx, globals.css
- `/src/app/admin`: Theme customizer (merchant-facing admin panel)
- `/src/components/ui`: Primitive UI components (Button, Card, Badge, Accordion, Sheet)
- `/src/components/sections`: Domain feature sections (Hero, Categories, ProductFeed, WhyShopWithUs, CustomerReviews, Blog, JuulApp, MyleVerification, BottomCollectionGrid)
- `/src/components/admin`: Customizer UI (Customizer, FieldRenderer, field primitives)
- `/src/lib/theme`: Theme settings — types, defaults, admin form schema, file storage
- `/src/lib/auth`: Admin authentication — scrypt hashing, signed sessions, user store
- `/src/lib`: Utilities and helpers
- `/src/proxy.ts`: Route guard for `/admin` and `/api/admin` (Next 16 replaces `middleware.ts` with `proxy.ts`)
- `/data`: Runtime JSON store for theme settings and admin users (gitignored)

## Theme Customizer
Page composition is data-driven rather than hard-coded, following Shopify's
model: shared header/footer groups, plus one **template** per page type holding
an ordered list of section **instances** (each with its own content).

- Catalogue of section types, their admin fields and defaults: `src/lib/theme/sections.ts`
- Factory content for every template: `src/lib/theme/defaults.ts`
- The old handle-based display rules, now as data: `src/lib/theme/conditions.ts`
- Migration, backfill and repair of saved settings: `src/lib/theme/normalize.ts`
- Type → component mapping and the `slots` escape hatch: `src/components/sections/SectionRenderer.tsx`

Pages render `<TemplateSections>`; those with heavy local state (collection,
product) pass their own sections in as `slots` so the template still controls
order and visibility. Per-handle overrides (`collection:juul-1-series`) take
full manual control and switch conditions off. See `docs/theme-customizer.md`.

## Mega Menu Architecture
- Configured under `ThemeSettings.header.megaMenu`.
- Managed dynamically from the Admin Theme Customizer (`/admin` -> Header -> Mega Menu tab).
- Category schemas: `id`, `title`, `subtitle`, `badge`, `icon`, `viewAllHref`, `viewAllLabel`, `featuredTitle`, `featuredDescription`, `featuredTag`, `brands`.
- Sourced dynamically into `Navbar.tsx` with zero hardcoded client content and seamless live preview bridge.
