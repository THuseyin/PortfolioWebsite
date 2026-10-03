# Hüseyin Tepe — Portfolio

A personal portfolio and editorial archive with a public reading experience and a private publishing workspace.

## Stack

- React 19, TypeScript, Vite, React Router and TanStack Query
- Tiptap article editor and Motion animations
- NestJS REST API
- Prisma and PostgreSQL
- Cookie-based admin sessions stored in PostgreSQL
- Local image uploads under `uploads/images`

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

The web output is written to `apps/web/dist`. Serve that directory with a static host and proxy `/api` to the NestJS application. In production:

- set `NODE_ENV=production` so session cookies use the secure flag;
- set `WEB_ORIGIN` to the exact public web origin;
- use a strong `SESSION_SECRET`;
- keep PostgreSQL and `uploads/images` on persistent storage;
- apply migrations with `pnpm --filter api exec prisma migrate deploy` before starting the API.

## Media storage

Admin image uploads are stored locally in `uploads/images` and served from `/api/media/images/:filename`. The directory is intentionally ignored by Git. Back it up or mount persistent storage if the application is deployed beyond local development.

## Workspace structure

```text
apps/
  api/    NestJS API, Prisma schema, migrations, and development seed
  web/    React public site and admin publishing interface
uploads/  Runtime image uploads; created automatically
```
