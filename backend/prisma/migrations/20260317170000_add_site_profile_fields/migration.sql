ALTER TABLE "site_settings"
ADD COLUMN "skills" JSONB,
ADD COLUMN "experiences" JSONB,
ADD COLUMN "contact_email" VARCHAR(200),
ADD COLUMN "social_links" JSONB;
