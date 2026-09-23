# Nihongo JLPT

Mobile-first Japanese study platform foundation for Mongolian, English and Japanese learners. The application is moving from a static GitHub Pages prototype to a server-rendered Next.js app with Supabase Auth and Postgres.

## Run locally

1. Install Node.js 20.9 or newer.
2. Run `npm ci`.
3. Copy `.env.example` to `.env.local` and set the Supabase project URL, publishable key, and site URL.
4. In the Supabase SQL editor, apply `supabase/migrations/20260923083443_initial_jlpt_platform.sql` (or use the Supabase CLI linked to your project).
5. In Supabase Auth, enable email confirmation and add `<site-url>/auth/confirm` to the allowed redirect URLs.
6. Run `npm run dev` and open `http://localhost:3000/mn`.

The app intentionally shows a setup notice and disables registration until valid Supabase settings are present. Do not put a Supabase secret/service-role key in this project or any `NEXT_PUBLIC_` variable.

## Auth and authorization

- Email/password registration, login, confirmation callback, logout and profile creation use Supabase Auth. Supabase handles password hashing; passwords and role/payment data are not written to browser storage.
- Session cookies are `HttpOnly`, `Secure` in production, and `SameSite=Lax`. The request proxy refreshes sessions and applies per-request CSP nonces.
- The `/[locale]/admin` page checks the verified Supabase user on the server. Admin status comes only from signed `app_metadata.role`, never editable `user_metadata` or client state. Assign the claim from the trusted Supabase dashboard/management API, then have the user renew their session.
- Database tables have RLS enabled. Saved words, quiz attempts, profiles and study sessions are scoped to `auth.uid()`. Quiz answers live in a non-exposed schema and a database trigger calculates correctness; clients cannot submit their own `is_correct` value.
- Supabase Auth enforces its configured rate limits. Before public launch, enable CAPTCHA / bot protection, review Auth rate limits, configure the email sender, and restrict Auth redirect URLs in the Supabase dashboard.

## Database and content workflow

The initial migration creates profiles, N5–N1 level metadata, vocabulary, grammar points, quiz questions, private answer keys, saved words, attempts and study sessions. Content tables require two different reviewer IDs before entries can be published. The tables are initially empty: the old 24-word static starter set has not yet been migrated, reviewed or expanded into a complete N5–N1 dictionary. Do not label it a complete JLPT syllabus.

Payments, phone login, Google OAuth, admin CRUD screens, vocabulary import/review tooling, quiz UI, cross-device progress UI, PWA/offline support and analytics are not enabled yet. No live Supabase project credentials were provided, so applying the migration to a hosted database and exercising real email delivery still requires project setup.

## Quality checks

`npm run lint`, `npm run typecheck`, and `npm run build` are the local gates. GitHub Actions runs the same checks for pushes and pull requests.

## Deploy

Deploy this repository as a Next.js application (for example, on Vercel), not as a static GitHub Pages site. Set the three `.env.example` variables in the host and add the production `/auth/confirm` redirect URL in Supabase Auth.

The JLPT name is used descriptively. Questions and lessons are independent study material unless explicitly identified as official source links; do not redistribute commercial test scans or copied paid books.
