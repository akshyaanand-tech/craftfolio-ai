## Craftfolio AI — Build Plan

A premium, startup-quality SaaS frontend inspired by Linear / Arc / Stripe. Frontend + auth + DB schema only (no AI yet).

### Stack notes (small deviation to flag)
Your brief lists Next.js, but this project is on **TanStack Start + React + Vite + Tailwind v4** (the Lovable modern stack). I'll build on that — same DX, same deployability, no functional loss. TypeScript, Tailwind, and Framer Motion all apply as-is.

### Design system
- Fonts: **Space Grotesk** (logo, hero, section titles) + **Inter** (everything else), loaded via `<link>` in `__root.tsx`.
- Tokens in `src/styles.css` using OKLCH equivalents of your hexes (#050816 bg, #0E1325 surface, #151B32 card, #2563EB primary, #3B82F6 accent, #94A3B8 muted) plus light-theme counterparts. Dark mode default, toggleable.
- Semantic tokens only — no hardcoded `bg-[#...]` in components. Custom Button variants (`hero`, `ghostNav`), Card surfaces, subtle borders, no glassmorphism, no bright gradients, no emojis, no robot illustrations.

### Animations (Framer Motion)
- Landing startup sequence: black screen → "CRAFTFOLIO AI" types letter-by-letter (Space Grotesk) → pause → hero fades up → nav slides down → CTAs scale in. Plays once per session (sessionStorage flag) so it's not annoying on repeat visits.
- Subtle scroll reveals on sections, hover transitions on cards/buttons.

### Routes (TanStack file-based)

```text
src/routes/
  __root.tsx                       (shell, fonts, theme provider, auth listener)
  index.tsx                        Landing
  auth.login.tsx                   Login
  auth.signup.tsx                  Sign Up
  auth.forgot-password.tsx         Forgot Password
  auth.reset-password.tsx          Reset Password (public, handles recovery hash)
  onboarding.tsx                   Multi-step onboarding wizard (6 steps)
  _authenticated/route.tsx         (integration-managed gate)
  _authenticated/dashboard.tsx
  _authenticated/resumes.tsx
  _authenticated/resumes.$id.tsx   Editor
  _authenticated/portfolio.tsx     Portfolio builder
  _authenticated/cover-letters.tsx
  _authenticated/ats.tsx           ATS analyzer (UI only)
  _authenticated/skills.tsx        Skill insights
  _authenticated/jobs.tsx          Job tracker (Kanban)
  _authenticated/templates.tsx
  _authenticated/profile.tsx
  _authenticated/settings.tsx
  sitemap[.]xml.ts + public/robots.txt
```

### Landing page sections
Hero (with startup typing animation) → Stats (10k+ / 5k+ / 92%) → Features grid (8 cards: Resume Builder, Portfolio Builder, Cover Letters, ATS, Skill Gap, GitHub Import, LinkedIn Import, Versioning) → Interactive resume preview (animated mockup) → Testimonials → Pricing (Free / Pro / Team) → Footer.

### Dashboard shell
Three-column layout: left sidebar nav (collapsible, shadcn `Sidebar`), center workspace, right insights panel. Theme toggle in sidebar footer. Top bar with search + user menu.

Dashboard widgets: Welcome card, Resume analytics (views/downloads sparkline), Portfolio analytics, Recent activity feed, Job tracker mini-board, Resume versions list, Recent exports.

### Feature pages (UI-complete, persisting to Supabase)
- **My Resumes** — list/grid with create/edit/delete/duplicate, versions panel, preview pane, "Download PDF" button (wired but disabled with tooltip "coming soon" since PDF gen isn't in scope).
- **Portfolio Builder** — section editors (Hero/About/Projects/Skills/Contact) with live preview panel split view.
- **Job Tracker** — Kanban with 5 columns (Applied/Assessment/Interview/Offer/Rejected), drag-to-move via `@dnd-kit`.
- **Cover Letters / ATS / Skills / Templates / Profile / Settings** — full polished UIs, persisting where applicable.

### Onboarding
6-step wizard with progress bar, animated transitions between steps, saves to `profiles` and related tables, redirects to `/dashboard` on completion. Skippable.

### Backend (Lovable Cloud / Supabase)
Enable Lovable Cloud. Auth: email/password + Google + GitHub (I'll wire Google via the Lovable broker; GitHub requires you to enable it in Supabase dashboard — I'll show the steps).

Schema (all with RLS scoped to `auth.uid()` + grants):

```text
profiles              (id→auth.users, full_name, headline, avatar_url,
                       career_path, onboarding_completed, theme)
education             (id, user_id, school, degree, field, start, end, gpa)
experiences           (id, user_id, company, role, start, end, description)
skills                (id, user_id, name, level, category)
projects              (id, user_id, name, description, url, repo, tags[])
career_goals          (id, user_id, target_role, target_industry, timeline, notes)
resumes               (id, user_id, title, template, content jsonb, updated_at)
resume_versions       (id, resume_id, version_number, content jsonb, created_at)
portfolios            (id, user_id, slug, hero jsonb, about, sections jsonb)
cover_letters         (id, user_id, title, company, role, content)
job_applications      (id, user_id, company, role, status, applied_at, notes, url)
ats_analyses          (id, user_id, resume_id, score, feedback jsonb)  -- UI placeholder
```

### Out of scope (per your brief)
- No Gemini / AI generation logic — buttons present, wired to placeholder states.
- No actual PDF rendering — button shows toast "Export coming soon".
- LinkedIn/GitHub import UI shown but stubbed.

### Build order
1. Enable Lovable Cloud + create schema migration (tables, RLS, grants, trigger for auto-profile on signup).
2. Design system: tokens, fonts, button/card variants, theme toggle.
3. Auth pages + onboarding wizard.
4. Landing page with full startup animation.
5. Dashboard shell + sidebar + theme toggle.
6. All authenticated feature pages.
7. Sitemap/robots, polish pass, slop-sweep.

This is ~25–30 files. I'll batch edits aggressively. Want me to go?