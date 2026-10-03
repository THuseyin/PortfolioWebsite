# Hüseyin Tepe — Portfolio

A personal portfolio and editorial archive with a public reading experience and a private publishing workspace.

## Stack

- React 19, TypeScript, Vite, React Router and TanStack Query
- Tiptap article editor and Motion animations
- NestJS REST API
- Prisma and PostgreSQL
- Cookie-based admin sessions stored in PostgreSQL
- Pluggable local or Supabase Storage image uploads

## Requirements

- Node.js 22 or newer
- pnpm 12.8.1
- PostgreSQL 16 or newer

The repository is a pnpm workspace. Run the commands below from the repository root unless a section says otherwise.

## Installation

Enable Corepack, install the pinned pnpm version, and install dependencies:

```bash
corepack enable
corepack prepare pnpm@12.8.1 --activate
pnpm install
```

## Environment variables

Copy the root environment template:

```bash
# macOS / Linux
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

Then update `.env`:

```dotenv
POSTGRES_DB=portfolio
POSTGRES_USER=portfolio
POSTGRES_PASSWORD=replace_with_local_password
POSTGRES_PORT=5432

DATABASE_URL=postgresql://portfolio:replace_with_local_password@localhost:5432/portfolio?schema=public

NODE_ENV=development
WEB_ORIGIN=http://localhost:5173

SESSION_SECRET=replace-with-a-long-random-secret
ADMIN_USERNAME=replace-with-admin-username
ADMIN_PASSWORD_HASH=replace-with-password-hash

MEDIA_STORAGE_DRIVER=local
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_MEDIA_BUCKET=portfolio-media
```

Generate a bcrypt hash for the admin password:

```bash
pnpm --filter api exec node --input-type=module -e "import bcrypt from 'bcryptjs'; console.log(await bcrypt.hash('change-this-password', 12))"
```

Copy the printed value into `ADMIN_PASSWORD_HASH`. Do not store the plain-text password in `.env`.

The web application uses `/api` by default and Vite proxies it to `http://localhost:3000`. A separate `apps/web/.env` is therefore optional during local development. To call another API origin, create it from the provided template:

```bash
# macOS / Linux
cp apps/web/.env.example apps/web/.env

# Windows PowerShell
Copy-Item apps/web/.env.example apps/web/.env
```

## Database setup

Create a PostgreSQL database matching `DATABASE_URL`. With PostgreSQL command-line tools:

```bash
createdb -U portfolio portfolio
```

Alternatively, create the database and user through pgAdmin and update `DATABASE_URL` accordingly.

Generate the Prisma client and apply every migration:

```bash
pnpm --filter api prisma:generate
pnpm --filter api exec prisma migrate deploy
```

The migrations create the content tables, the PostgreSQL session store, and the singleton homepage content record.

Optional development content can be inserted with:

```bash
pnpm --filter api prisma:seed:dev
```

The development seed is repeatable. It adds or updates example categories, tags, and published articles.

## Development

Start the API and web application together:

```bash
pnpm dev
```

Default local addresses:

- Web: `http://localhost:5173`
- API: `http://localhost:3000/api`
- Admin: open the homepage and use the Admin button

If either port is already occupied, stop the existing process before starting another development session. Vite may select another web port automatically, but `WEB_ORIGIN` must match the actual web origin for authenticated admin requests.

To run one application only:

```bash
pnpm --filter web dev
pnpm --filter api dev
```

## Checks

Run all project checks:

```bash
pnpm lint
pnpm test
pnpm build
```

Or run them separately:

```bash
pnpm --filter web lint
pnpm --filter web build
pnpm --filter api lint
pnpm --filter api test
pnpm --filter api build
```

## Production build

Create both production builds:

```bash
pnpm build
```

Start the compiled API:

```bash
pnpm --filter api start:prod
```

The web output is written to `apps/web/dist`. The compiled NestJS application serves this directory automatically, so the public site, admin interface, and API can run from one process and one origin:

```text
/                 React application
/articles/*       React application
/admin/*          React application
/api/*            NestJS API
```

In production:

- set `NODE_ENV=production` so session cookies use the secure flag;
- set `WEB_ORIGIN` to the exact public web origin;
- use a strong `SESSION_SECRET`;
- configure Supabase Storage for image persistence, or keep `uploads/images` on persistent storage when using the local driver;
- apply migrations with `pnpm --filter api exec prisma migrate deploy` before starting the API.

## Media storage

Local development uses `MEDIA_STORAGE_DRIVER=local`. Images are written to `uploads/images` and served from `/api/media/images/:filename`. The directory is intentionally ignored by Git.

For deployment, create a **public** Supabase Storage bucket and configure:

```dotenv
MEDIA_STORAGE_DRIVER=supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_MEDIA_BUCKET=portfolio-media
```

The service-role key is used only by the API and must never be exposed to the browser or committed to Git. Uploaded objects are placed under the bucket's `images/` directory, and the API returns their public Supabase URL. Existing local image URLs remain readable while the application is running with local storage; changing providers does not migrate previously uploaded files.

## Workspace structure

```text
apps/
  api/    NestJS API, Prisma schema, migrations, and development seed
  web/    React public site and admin publishing interface
uploads/  Runtime image uploads; created automatically
```
