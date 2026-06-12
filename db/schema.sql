-- =============================================================================
-- Avenue Eyewear — Google Reviews Database Schema
-- =============================================================================
-- Run this once against your PostgreSQL database to create the required tables.
-- Example: psql -h <host> -U <user> -d <dbname> -f schema.sql
--
-- To connect: make sure DATABASE_URL is set in your .env.local, e.g.:
--   DATABASE_URL=postgresql://user:password@localhost:5432/avenue_eyewear
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 1. google_reviews
--    One row per individual review fetched from the Apify scraper.
--    Only 4-star and 5-star reviews are stored (3 and below are filtered out
--    at ingestion time in the pipeline script).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS google_reviews (
  -- Stable, unique identifier for each review.
  -- We derive this from the Apify payload (reviewId field). Using TEXT instead
  -- of SERIAL so we can upsert by the Google-issued ID without duplicates.
  review_id         TEXT        PRIMARY KEY,

  -- The reviewer's display name as it appears on Google Maps.
  author_name       TEXT        NOT NULL,

  -- Numeric star rating (1–5). Only 4 and 5 are admitted by the pipeline.
  rating            SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),

  -- Full text of the review. May be NULL if the reviewer left only a star rating.
  review_text       TEXT,

  -- The date the review was originally published on Google Maps.
  -- Stored as TIMESTAMPTZ so it is timezone-aware.
  publish_date      TIMESTAMPTZ,

  -- URL to the reviewer's Google profile photo (the small avatar).
  -- May be NULL for anonymous / deleted accounts.
  profile_photo_url TEXT,

  -- Direct link to this review on Google Maps.
  -- Used to make each card a clickable link back to the original review.
  original_google_url TEXT,

  -- Housekeeping: when this row was created or last updated in our DB.
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index on publish_date so the frontend can ORDER BY publish_date DESC quickly.
CREATE INDEX IF NOT EXISTS idx_google_reviews_publish_date
  ON google_reviews (publish_date DESC);


-- ---------------------------------------------------------------------------
-- 2. business_metadata
--    Single-row table that stores aggregate stats about the business's
--    Google Maps listing. The pipeline updates this on every scrape run.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS business_metadata (
  -- We only ever have one row for this business; enforce that with a
  -- singleton check column set to a fixed value.
  singleton         BOOLEAN     PRIMARY KEY DEFAULT TRUE,
  CONSTRAINT business_metadata_singleton CHECK (singleton = TRUE),

  -- The TOTAL number of Google reviews (including 1-, 2-, and 3-star ones
  -- that we don't display). Scraped from the Apify payload's totalScore
  -- / reviewsCount field and stored here so the header disclaimer can read
  -- "Based on X total reviews" accurately.
  total_review_count INTEGER     NOT NULL DEFAULT 0,

  -- The average star rating for the business as reported by Google.
  -- Stored as NUMERIC(3,1) to hold values like 4.8.
  average_rating     NUMERIC(3,1),

  -- Timestamp of the most recent successful pipeline run.
  last_updated_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed the single metadata row so the pipeline can always UPDATE rather than
-- having to decide between INSERT and UPDATE.
INSERT INTO business_metadata (singleton, total_review_count)
VALUES (TRUE, 0)
ON CONFLICT (singleton) DO NOTHING;


-- ---------------------------------------------------------------------------
-- Optional helper: auto-update `updated_at` on google_reviews rows
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_google_reviews_updated_at ON google_reviews;
CREATE TRIGGER trg_google_reviews_updated_at
  BEFORE UPDATE ON google_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
