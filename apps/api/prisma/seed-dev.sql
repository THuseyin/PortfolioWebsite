INSERT INTO "Category" ("id", "name", "slug", "updatedAt")
VALUES (
  '0199a4c0-0000-7000-8000-000000000001',
  'Experiments',
  'experiments',
  CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO UPDATE
SET "name" = EXCLUDED."name", "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "Article" (
  "id",
  "title",
  "slug",
  "summary",
  "content",
  "status",
  "publishedAt",
  "updatedAt",
  "categoryId"
)
VALUES (
  '0199a4c0-0000-7000-8000-000000000002',
  'Notes from an unfinished experiment',
  'notes-from-an-unfinished-experiment',
  'A temporary article used to test the public portfolio experience with real API data.',
  '{
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur vitae justo sed neque luctus tincidunt."
          }
        ]
      },
      {
        "type": "heading",
        "attrs": { "level": 2 },
        "content": [
          {
            "type": "text",
            "text": "Learning by making"
          }
        ]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Every experiment leaves behind a useful note."
          }
        ]
      }
    ]
  }'::jsonb,
  'PUBLISHED',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  (
    SELECT "id"
    FROM "Category"
    WHERE "slug" = 'experiments'
  )
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
