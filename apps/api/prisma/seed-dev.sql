-- Development-only content. Safe to run repeatedly: records are updated by slug.

INSERT INTO "Category" ("id", "name", "slug", "updatedAt")
VALUES
  ('0199a4c0-0000-7000-8000-000000000001', 'Experiments', 'experiments', CURRENT_TIMESTAMP),
  ('0199a4c0-0000-7000-8000-000000000003', 'Frontend', 'frontend', CURRENT_TIMESTAMP),
  ('0199a4c0-0000-7000-8000-000000000004', 'Backend', 'backend', CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO UPDATE
SET "name" = EXCLUDED."name", "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "Tag" ("id", "name", "slug", "updatedAt")
VALUES
  ('0199a4c0-0000-7000-8000-000000000010', 'React', 'react', CURRENT_TIMESTAMP),
  ('0199a4c0-0000-7000-8000-000000000011', 'TypeScript', 'typescript', CURRENT_TIMESTAMP),
  ('0199a4c0-0000-7000-8000-000000000012', 'NestJS', 'nestjs', CURRENT_TIMESTAMP),
  ('0199a4c0-0000-7000-8000-000000000013', 'PostgreSQL', 'postgresql', CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO UPDATE
SET "name" = EXCLUDED."name", "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "Article" (
  "id", "title", "slug", "summary", "content", "status",
  "publishedAt", "updatedAt", "categoryId"
)
VALUES
(
  '0199a4c0-0000-7000-8000-000000000002',
  'Notes from an unfinished experiment',
  'notes-from-an-unfinished-experiment',
  'A temporary article used to test the public portfolio experience with real API data.',
  '{
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [{ "type": "text", "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur vitae justo sed neque luctus tincidunt." }]
      },
      {
        "type": "heading",
        "attrs": { "level": 2 },
        "content": [{ "type": "text", "text": "Learning by making" }]
      },
      {
        "type": "paragraph",
        "content": [{ "type": "text", "text": "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Every experiment leaves behind a useful note." }]
      }
    ]
  }'::jsonb,
  'PUBLISHED',
  '2026-09-29T10:00:00+02:00'::timestamptz,
  CURRENT_TIMESTAMP,
  (SELECT "id" FROM "Category" WHERE "slug" = 'experiments')
),
(
  '0199a4c0-0000-7000-8000-000000000005',
  'Building the frontend as an editorial playground',
  'building-the-frontend-as-an-editorial-playground',
  'A look at the tools and decisions behind the portfolio interface, from React and Vite to Motion and Tiptap.',
  '{
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [{ "type": "text", "text": "The frontend started with a simple constraint: it should feel personal and experimental without becoming difficult to read. The result is an editorial interface built from a small set of reusable primitives rather than a ready-made component theme." }]
      },
      {
        "type": "heading",
        "attrs": { "level": 2 },
        "content": [{ "type": "text", "text": "The foundation" }]
      },
      {
        "type": "bulletList",
        "content": [
          { "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "React 19 and TypeScript provide the component and type system." }] }] },
          { "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Vite handles the development server and production build." }] }] },
          { "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "React Router defines the public and admin navigation structure." }] }] },
          { "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "TanStack Query owns remote data loading, caching, and request states." }] }] }
        ]
      },
      {
        "type": "heading",
        "attrs": { "level": 2 },
        "content": [{ "type": "text", "text": "Interaction and writing" }]
      },
      {
        "type": "paragraph",
        "content": [{ "type": "text", "text": "Motion powers the restrained page and section transitions. Radix Dialog supplies accessible modal behavior, Lucide provides the icon set, and Tiptap will support structured article editing with inline images. Tailwind CSS is available for utility work, while the visual system itself is expressed through custom CSS variables and page-level styles." }]
      },
      {
        "type": "paragraph",
        "content": [{ "type": "text", "text": "There is no AI model in the website runtime. Development can use an AI coding assistant, but the public application remains a conventional React client consuming the portfolio API." }]
      }
    ]
  }'::jsonb,
  'PUBLISHED',
  '2026-09-30T14:30:00+02:00'::timestamptz,
  CURRENT_TIMESTAMP,
  (SELECT "id" FROM "Category" WHERE "slug" = 'frontend')
),
(
  '0199a4c0-0000-7000-8000-000000000006',
  'Inside the portfolio API',
  'inside-the-portfolio-api',
  'How NestJS, Prisma, and PostgreSQL shape a compact backend for articles, taxonomy, sessions, and media.',
  '{
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [{ "type": "text", "text": "The API is intentionally compact: enough structure to make publishing reliable, but not so much machinery that a personal site becomes a platform project." }]
      },
      {
        "type": "heading",
        "attrs": { "level": 2 },
        "content": [{ "type": "text", "text": "Service architecture" }]
      },
      {
        "type": "paragraph",
        "content": [{ "type": "text", "text": "NestJS organizes the application into focused modules for authentication, articles, categories, tags, and media. DTO validation protects the HTTP boundary, while administrator routes use session-based authentication backed by PostgreSQL. Password verification uses bcrypt." }]
      },
      {
        "type": "heading",
        "attrs": { "level": 2 },
        "content": [{ "type": "text", "text": "Data models" }]
      },
      {
        "type": "bulletList",
        "content": [
          { "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Article stores drafts and published writing as structured Tiptap JSON." }] }] },
          { "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Category gives each article a primary section." }] }] },
          { "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Tag and ArticleTag provide a reusable many-to-many taxonomy." }] }] },
          { "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Session persists authenticated admin sessions." }] }] }
        ]
      },
      {
        "type": "paragraph",
        "content": [{ "type": "text", "text": "Prisma supplies the typed database client and migrations, PostgreSQL stores the data, and Vitest plus Supertest cover service behavior and HTTP contracts. Public endpoints expose only published material; admin endpoints add filtering, pagination, drafting, and publishing controls." }]
      }
    ]
  }'::jsonb,
  'PUBLISHED',
  '2026-10-01T11:15:00+02:00'::timestamptz,
  CURRENT_TIMESTAMP,
  (SELECT "id" FROM "Category" WHERE "slug" = 'backend')
)
ON CONFLICT ("slug") DO UPDATE
SET
  "title" = EXCLUDED."title",
  "summary" = EXCLUDED."summary",
  "content" = EXCLUDED."content",
  "status" = EXCLUDED."status",
  "publishedAt" = EXCLUDED."publishedAt",
  "updatedAt" = CURRENT_TIMESTAMP,
  "categoryId" = EXCLUDED."categoryId";

INSERT INTO "ArticleTag" ("articleId", "tagId")
VALUES
  ('0199a4c0-0000-7000-8000-000000000005', '0199a4c0-0000-7000-8000-000000000010'),
  ('0199a4c0-0000-7000-8000-000000000005', '0199a4c0-0000-7000-8000-000000000011'),
  ('0199a4c0-0000-7000-8000-000000000006', '0199a4c0-0000-7000-8000-000000000011'),
  ('0199a4c0-0000-7000-8000-000000000006', '0199a4c0-0000-7000-8000-000000000012'),
  ('0199a4c0-0000-7000-8000-000000000006', '0199a4c0-0000-7000-8000-000000000013')
ON CONFLICT ("articleId", "tagId") DO NOTHING;
