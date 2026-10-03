CREATE TABLE "HomePageContent" (
  "id" TEXT NOT NULL DEFAULT 'home',
  "name" TEXT NOT NULL,
  "eyebrow" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "locations" JSONB NOT NULL,
  "aboutHeadline" TEXT NOT NULL,
  "aboutNote" TEXT NOT NULL,
  "currently" TEXT NOT NULL,
  "interests" TEXT NOT NULL,
  "instagramLabel" TEXT NOT NULL,
  "instagramUrl" TEXT NOT NULL,
  "collageImages" JSONB NOT NULL,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "HomePageContent_pkey" PRIMARY KEY ("id")
);

INSERT INTO "HomePageContent" (
  "id", "name", "eyebrow", "role", "locations", "aboutHeadline", "aboutNote",
  "currently", "interests", "instagramLabel", "instagramUrl", "collageImages"
) VALUES (
  'home', 'Hüseyin Tepe', 'Independent developer / Personal archive',
  'Software, writing & digital experiments',
  '[{"city":"Berlin","timeZone":"Europe/Berlin"},{"city":"Istanbul","timeZone":"Europe/Istanbul"}]'::jsonb,
  E'I came,\nI wandered,\nI learned —\nnow I write.',
  'Notes shaped by curiosity, practice, and experience.',
  'Berlin / Istanbul', 'Systems, interfaces, creative code', 'tepee.huseyin',
  'https://www.instagram.com/tepee.huseyin/',
  '["/images/home-collage/collage-01.jpg","/images/home-collage/collage-02.jpg","/images/home-collage/collage-03.jpg","/images/home-collage/collage-04.jpg","/images/home-collage/collage-05.jpg","/images/home-collage/collage-06.jpg","/images/home-collage/collage-07.jpg","/images/home-collage/collage-08.jpg","/images/home-collage/collage-09.jpg","/images/home-collage/collage-10.jpg","/images/home-collage/collage-11.jpg","/images/home-collage/collage-12.jpg"]'::jsonb
);
