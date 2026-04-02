# Repository Guidelines

## Project Structure & Module Organization
`app/` contains the Next.js App Router surface: public pages, admin pages under `app/admin`, and API routes under `app/api`. Reusable UI lives in `components/` with admin-specific pieces in `components/admin`. Shared business logic, Prisma access, Stripe helpers, and formatting utilities live in `lib/`. Database schema and migrations are in `prisma/`. Static assets, report images, branding, and videos are served from `public/`. Utility scripts live in `scripts/`; generated files in `.next/`, `output/`, and `tmp/` should stay out of commits.

## Build, Test, and Development Commands
Use `npm install` to sync dependencies from `package-lock.json`.

- `npm run dev`: starts local development. This wraps `next dev` with a local concurrency helper.
- `npm run build`: production build; also catches type and route issues.
- `npm run start`: serves the production build locally.
- `npm run lint`: runs ESLint with the Next.js core-web-vitals and TypeScript rules.
- `npm run prisma:generate`: regenerates the Prisma client.
- `npm run prisma:migrate`: creates/applies a local migration.
- `npm run prisma:seed`: seeds default courses, reports, settings, and admin data.

## Coding Style & Naming Conventions
Write TypeScript with `strict` mode in mind. Follow the existing style: 2-space indentation, double quotes, semicolons, and small focused helpers in `lib/`. Use `PascalCase` for React components (`components/CourseCard.tsx`), `camelCase` for functions and variables, and lowercase route folders in `app/` (`app/kurse/[slug]/page.tsx`). Prefer the `@/` path alias over deep relative imports. Keep Tailwind utilities in JSX and shared tokens in [`app/globals.css`](/home/michael/webapps/fliegenfischen/app/globals.css).

## Testing Guidelines
There is no dedicated automated test suite yet. Treat `npm run lint` and `npm run build` as required checks, then manually test the affected public pages, admin screens, Prisma-backed mutations, and any Stripe checkout flow you touched. If you add automated coverage, colocate tests with the feature or under `tests/` using `*.test.ts` or `*.test.tsx`.

## Commit & Pull Request Guidelines
Recent history uses Conventional Commits (`fix:`, `feat:`, `style:`). Keep subjects short and imperative, for example `fix: handle empty weather response`. PRs should include a concise summary, linked issue if applicable, screenshots for UI/admin changes, and clear notes for schema, seed, or environment updates.

## Security & Configuration Tips
Never commit `.env` files or production secrets. Prisma commands are intentionally gated by `scripts/prisma-safe.sh`, which expects `DATABASE_URL` to point at the `fliegenfischen` database. Double-check Stripe and admin auth variables before testing payment or login flows.

## Verbindlicher Agenten-Standard
- Neue Features, Erweiterungen und groessere Aenderungen nicht mit Dummies, toten Buttons, Platzhalterseiten oder nur teilweise angeschlossenen Flows ausliefern, ausser der Auftrag verlangt das ausdruecklich.
- Den betroffenen Scope voll funktional zu Ende fuehren: UI, Serverlogik, Datenfluss, Error-Handling, Berechtigungen, Migrationen, Doku, Tests, Build- und Deploy-Pfad.
- Vor einer Rueckmeldung den geaenderten Scope vollstaendig pruefen, inklusive Browser-Experience, relevante Happy Paths, wichtige Error Paths, Admin-Flaechen und angrenzende Integrationen wie Stripe.
- Danach selbststaendig bis zu drei weitere intelligente Optimierungsrunden durchfuehren, auch wenn kein akuter Fehler sichtbar ist. Typische Schwerpunkte: Robustheit, UX, Performance, Sicherheit, Beobachtbarkeit, Cleanup und Testhaertung.
- Erst wenn alles funktioniert: committen, pushen und bei laufenden Anwendungen deployen oder einen bewusst ausgenommenen Deploy technisch begruenden.
- Erst danach Rueckmeldung geben. Standardmaessig keine Zwischenmeldungen und keine Rueckfragen; nur bei echtem externem Blocker oder wenn hoeherrangige Laufzeitregeln Statusupdates verlangen.
- Wenn Vollendung oder Verifikation blockiert ist, den Stand als `teilweise` oder `blockiert` kennzeichnen, die konkrete Luecke benennen und ihn nicht als fertig darstellen.
