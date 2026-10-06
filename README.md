# Corstack

Next.js agency website hosted on Cloudflare Workers through OpenNext. Neon stores site content, portfolio records, leads, settings, and payment records. Cloudflare R2 stores portfolio images. Firebase Authentication handles the existing administrator sign-in.

## Local development

Use Node.js 24 and npm. Run `npm ci`. For a fresh checkout, copy `.env.example` to `.env.local`; for an existing checkout, add the new variables without replacing your Firebase or provider configuration. Run `npm run dev`.

Set `DATABASE_URL` to Neon's pooled connection string. Set `DATABASE_URL_UNPOOLED` to the direct connection string for migration commands. These values are server-only and must never use a `NEXT_PUBLIC_` prefix. The schema is versioned in `migrations/`. `npm run db:migrate` previews the migration names; `npm run db:migrate -- --apply` applies them.

The five `NEXT_PUBLIC_FIREBASE_*` values in `.env.example` remain the existing Firebase web app's configuration and must be present at build time. Keep the same Firebase project and accounts. Runtime token verification requires only `FIREBASE_PROJECT_ID`. Firebase service-account private keys are needed only for exporting the old Firestore data, and are not required in the deployed app.

Set `ADMIN_UID` to the administrator's Firebase Authentication UID. Alternatively use `ADMIN_EMAIL`, which requires a verified email. UID configuration takes precedence. The server checks administrator access on every protected request. The legacy `NEXT_PUBLIC_ADMIN_EMAIL` fallback remains supported. This migration does not change who has admin access.

Set `RESEND_API_KEY` and verify the sending domain. Keep existing payment-provider settings. Set `SITE_URL` to the actual production origin; uploads and other writes reject origins that do not match it. Local development also accepts the local request origin.

## Portfolio images

The `PORTFOLIO_BUCKET` R2 binding is declared in `wrangler.toml` and points to the existing `corstack-media` bucket in the configured Cloudflare account. Local `next dev` and Worker preview use Wrangler's local R2 simulation, so test uploads do not modify the production bucket.

The browser uploads to `POST /api/admin/uploads` with its existing Firebase ID token. The server verifies the same administrator identity as the dashboard, checks the file type and actual file signature, enforces a 10 MB limit, generates an immutable key, and writes to R2 through the Worker binding. No R2 credentials are shipped to the browser, and a Firebase Storage custom claim is no longer required.

Public images are served at `/media/portfolio/<filename>` through the Worker. The bucket can remain private; only the portfolio image namespace is exposed by the image route. Responses use the stored MIME type, `nosniff`, ETags, and immutable cache headers. This same-origin setup needs neither a public R2 bucket nor upload CORS configuration. Static logos and images already in `public/` stay in the application.

Portfolio image windows remain 4:3 for desktop and 3:4 for phone mockups, with edge-to-edge images and browser controls outside the image window.

## Database layout and checks

`corstack_documents` stores a row for each original document, keyed by collection and ID. Postgres JSONB preserves existing fields and legacy image structures without losing IDs or lead/payment history. Collection constraints and indexes support content ordering and lead dates. SQL parameters protect IDs and values, ordering fields are allowlisted, updates preserve unrelated fields, and batches commit in one transaction.

- `npm run lint` checks JavaScript, TypeScript, React rules, and accessibility.
- `npm run typecheck` generates route types and checks TypeScript.
- `npm test` runs regression tests, including real SQL against an isolated in-memory Postgres engine, rollback behavior, complete imports, upload authorization, and image validation. No live services are used.
- `npm run build` produces the Next.js production build.
- `npm run cloudflare:build` produces the Worker and assets.
- `npm audit` checks dependencies.

## Migrate the existing data and files

Perform this first on an isolated Neon branch. Use a separate test Worker or local Worker preview for verification. Keep Firestore and its original objects until the live cutover has been verified.

1. Create or select the Neon project and an isolated migration branch. Store that branch's pooled and direct connection strings in the ignored `.env.local`. Create/select the R2 bucket and update `wrangler.toml`. Sign in to Wrangler with `npx wrangler login` on your own machine, or provide an existing authorized Cloudflare API token through the environment.
2. Supply the original `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` only in the local migration environment. Export the source with `npm run migration -- export-firestore --output migration-backups/firestore.json`. This reads Firestore and preserves all eight application collections, IDs, lead/payment data, and settings. Unexpected collections are exported but must be explicitly mapped before import; subcollections stop the exporter rather than being silently skipped.
3. Copy referenced Firebase images with `npm run migration -- copy-media migration-backups/firestore.json --bucket corstack-portfolio --source-bucket corstack-dev.firebasestorage.app --output migration-backups/prepared.json`. The source bucket must match the real project. Every uploaded object is downloaded from R2 again and checked with SHA-256. The prepared backup replaces Firebase file URLs with same-origin R2 image URLs only after all copies succeed. It retains image descriptions, external links, and local assets.
4. Firebase Storage must allow source downloads during that copy. If disabled billing prevents access, temporarily restore source access or add `--asset-dir <directory>` pointing to original files with their Firebase object paths, such as `portfolio/<original-filename>`. Failed copies do not change database records. The original source objects are never deleted.
5. Apply the schema with `npm run db:migrate -- --apply`. Preview the import with `npm run migration -- import-neon migration-backups/prepared.json`. Then import with `npm run migration -- import-neon migration-backups/prepared.json --apply`. Import refuses a populated destination and runs atomically. It also refuses unresolved Firebase Storage references. After import it compares all counts, IDs, and record fields. Re-run that comparison at any time with `npm run migration -- verify-neon migration-backups/prepared.json`.
6. Verify public content, Firebase admin login, admin CRUD, a new image upload and its public URL, contact persistence, and payment verification against the migration branch and R2 bucket. Then select/promote the verified Neon database for production and set the Worker's `DATABASE_URL` secret to its pooled connection string. Keep the Firebase Authentication configuration unchanged and ensure the Worker R2 binding targets the verified bucket.
7. During the final export/copy/import, pause admin writes and contact/payment writes on the old deployment so data created after the export is not lost. Re-export immediately before cutover, or reconcile any new records. Deploy only after this final source snapshot matches the target. Retain the original data for rollback.

All files under `migration-backups/` and `scripts/db-backup.json` are ignored because they may contain private leads, payments, and Firebase download tokens. Do not publish them. Migration commands require the real service configuration; local placeholder values do not perform a live migration.

## Cloudflare deployment

Keep the Firebase browser configuration in the build environment. Supply `DATABASE_URL`, `FIREBASE_PROJECT_ID`, `ADMIN_UID` (or `ADMIN_EMAIL`), Resend/payment secrets, and the correct `SITE_URL` to the Worker. Do not deploy `DATABASE_URL_UNPOOLED` or Firebase service-account private keys unless a separate operational tool explicitly needs them.

Run `npm run cloudflare:build` and inspect the Worker before deploying. `npm run preview` previews it locally; `npm run deploy` publishes it. The production public APIs also require the existing `PUBLIC_API_RATE_LIMITER` binding. Editing repository configuration does not create an R2 bucket, apply the database schema, or update production secrets automatically.

## Maintenance scripts

`npm run db:backup` exports Neon application data to the ignored `scripts/db-backup.json` in the existing backup format. `npm run db:seed -- --replace-existing` restores public content from that backup or uses the bundled defaults. Seed, `tsx --env-file=.env.local scripts/restore-client-types.mjs --replace-existing`, and `tsx --env-file=.env.local scripts/clear-portfolio.ts --replace-existing` now operate on Neon. Their replacements are atomic and retain existing safeguards. Seeding never deletes leads or payment records; clearing portfolio records does not delete R2 files.

`firestore.rules`, `storage.rules`, and `set-admin-claim.mjs` concern the legacy Firebase data/storage deployment. They are not used by the Neon/R2 runtime and are not published by this migration. Firebase Authentication and its existing users remain in place.
