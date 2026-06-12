/**
 * =============================================================================
 * Avenue Eyewear — Google Reviews Ingestion Pipeline
 * =============================================================================
 * FILE: scripts/sync-google-reviews.ts
 *
 * PURPOSE:
 *   Fetches all Google Maps reviews for the business via the Apify
 *   Google Maps Reviews Scraper API, filters out ≤3-star reviews, and
 *   upserts the remaining 4★ / 5★ reviews into our PostgreSQL database.
 *   Also updates the business_metadata table with the true total review count
 *   and average rating as reported by Google.
 *
 * SCHEDULING:
 *   Run this script weekly via a cron job. Example cron entry (every Monday
 *   at 03:00 AM server time):
 *
 *     0 3 * * 1  cd /path/to/optical-site && npx ts-node scripts/sync-google-reviews.ts >> /var/log/reviews-sync.log 2>&1
 *
 *   Or with node-cron (see the bottom of this file for an alternative approach).
 *
 * SETUP:
 *   1. Install dependencies:
 *        npm install pg dotenv node-fetch
 *        npm install -D @types/pg ts-node typescript
 *   2. Copy .env.local.example to .env.local and fill in your secrets.
 *   3. Run manually to test: npx ts-node scripts/sync-google-reviews.ts
 *
 * ENVIRONMENT VARIABLES (set in .env.local):
 *   DATABASE_URL        — PostgreSQL connection string
 *   APIFY_API_TOKEN     — Your Apify API token (from apify.com/account/integrations)
 *   GOOGLE_MAPS_URL     — The full Google Maps URL for Avenue Eyewear's listing
 *
 * =============================================================================
 */

import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local (Next.js convention)
dotenv.config({ path: '.env.local' });

// ---------------------------------------------------------------------------
// ── CONFIGURATION — swap these out when you have real credentials ──────────
// ---------------------------------------------------------------------------

/**
 * ⚠️  REPLACE THESE PLACEHOLDERS before deploying.
 * All three values should be stored in .env.local, NOT hardcoded here.
 */
const CONFIG = {
  // Your Apify personal API token. Found at: https://console.apify.com/account/integrations
  apifyToken: process.env.APIFY_API_TOKEN ?? 'YOUR_APIFY_API_TOKEN_HERE',

  // The Apify Actor ID for the Google Maps Reviews Scraper.
  // This is the official actor maintained by Apify. Double-check the latest
  // ID at: https://apify.com/compass/crawler-google-places
  apifyActorId: 'compass/crawler-google-places',

  // The Google Maps URL for Avenue Eyewear. Replace with the real URL.
  // It should look like: https://www.google.com/maps/place/Avenue+Eyewear/...
  googleMapsUrl: process.env.GOOGLE_MAPS_URL ?? 'https://www.google.com/maps/place/Avenue+Eyewear/@40.4305742,-74.2539434,17z/data=!YOUR_REAL_PLACE_DATA',

  // Minimum star rating to KEEP. Reviews at or below this threshold are dropped.
  // Current policy: only 4★ and 5★ reviews are stored.
  minRatingToKeep: 4,

  // PostgreSQL connection string. Should be set in .env.local.
  databaseUrl: process.env.DATABASE_URL ?? 'postgresql://user:password@localhost:5432/avenue_eyewear',
};

// ---------------------------------------------------------------------------
// ── TYPE DEFINITIONS ────────────────────────────────────────────────────────
// ---------------------------------------------------------------------------

/**
 * Shape of a single review object returned by the Apify scraper payload.
 * Field names reflect the Apify Google Maps Scraper actor output schema.
 * Adjust if you switch to a different Apify actor.
 */
interface ApifyReview {
  reviewId:         string;
  name:             string;          // Reviewer's display name
  stars:            number;          // Star rating (1–5)
  text:             string | null;   // Review body text (null if stars-only)
  publishedAtDate:  string | null;   // ISO-8601 date string
  reviewImageUrls?: string[];        // Optional array of photo URLs
  reviewUrl?:       string;          // Direct link to this review on Maps
  // Reviewer's profile photo URL
  reviewerPhotoUrl?: string;
}

/**
 * Shape of the top-level place object returned by the Apify actor.
 * The actor may return either a place-level object containing a `reviews`
 * array, or a flat array of review objects. We handle both below.
 */
interface ApifyPlaceResult {
  title?:         string;
  totalScore?:    number;    // Average rating (e.g. 4.8)
  reviewsCount?:  number;    // Total review count as reported by Google
  reviews?:       ApifyReview[];
  url?:           string;
}

// ---------------------------------------------------------------------------
// ── DATABASE CLIENT ─────────────────────────────────────────────────────────
// ---------------------------------------------------------------------------

/**
 * Singleton PostgreSQL connection pool.
 * We create it once at module level so repeated calls to runSync() don't
 * create a new pool each time (important if you import this as a module).
 */
const db = new Pool({
  connectionString: CONFIG.databaseUrl,
  // Keep the pool small since this is a background script, not a web server.
  max: 3,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 5_000,
});

// ---------------------------------------------------------------------------
// ── APIFY API HELPERS ────────────────────────────────────────────────────────
// ---------------------------------------------------------------------------

/**
 * Calls the Apify actor synchronously (runs the actor and waits for it to
 * finish, then returns the dataset items in a single response).
 *
 * We use the /run-sync-get-dataset-items endpoint which is ideal for
 * scheduled scripts since it blocks until the actor finishes.
 *
 * Docs: https://docs.apify.com/api/v2#/reference/actors/run-actor-synchronously
 */
async function fetchReviewsFromApify(): Promise<ApifyPlaceResult[]> {
  const url = `https://api.apify.com/v2/acts/${encodeURIComponent(CONFIG.apifyActorId)}/run-sync-get-dataset-items?token=${CONFIG.apifyToken}&timeout=120`;

  console.log(`[Apify] Starting actor run for: ${CONFIG.googleMapsUrl}`);

  /**
   * Actor input payload for the Apify Google Maps Reviews Scraper.
   * See the actor's input schema at:
   * https://apify.com/compass/crawler-google-places/input-schema
   *
   * Key fields you may want to adjust:
   *  - maxReviews: set to a high number to fetch all reviews. Set to null for unlimited.
   *  - language: 'en' ensures reviews are fetched in English where possible.
   *  - reviewsSort: 'newest' fetches newest reviews first (good for incremental runs).
   */
  const actorInput = {
    startUrls: [{ url: CONFIG.googleMapsUrl }],
    maxReviews: 500,         // ← Increase this if the business has more reviews
    reviewsSort: 'newest',   // Options: 'newest' | 'mostRelevant' | 'highestRanking' | 'lowestRanking'
    language: 'en',
    scrapeReviews: true,
    // Include reviewer profile photos
    includeReviewerPhotoUrl: true,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(actorInput),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`[Apify] Actor run failed. Status: ${response.status}. Body: ${errorText}`);
  }

  const data = await response.json();

  // The endpoint returns an array. Each item may be a place object (with
  // nested reviews) or a flat review object depending on the actor version.
  if (!Array.isArray(data)) {
    throw new Error('[Apify] Unexpected response shape — expected an array.');
  }

  console.log(`[Apify] Received ${data.length} item(s) from dataset.`);
  return data as ApifyPlaceResult[];
}

// ---------------------------------------------------------------------------
// ── PARSING HELPERS ─────────────────────────────────────────────────────────
// ---------------------------------------------------------------------------

/**
 * Extracts a flat list of reviews and the top-level business metadata
 * from the Apify response payload.
 *
 * The Apify Google Maps Scraper can return data in two formats:
 *   (a) An array containing one place object that has a `reviews` sub-array.
 *   (b) A flat array of review objects (when `scrapeReviews` mode is used).
 *
 * This function handles both cases gracefully.
 */
function parseApifyPayload(results: ApifyPlaceResult[]): {
  reviews: ApifyReview[];
  totalReviewCount: number;
  averageRating: number | null;
} {
  // Case (a): first item is a place object with a nested reviews array.
  if (results.length > 0 && results[0].reviews && Array.isArray(results[0].reviews)) {
    const place = results[0];
    return {
      reviews:          place.reviews ?? [],
      totalReviewCount: place.reviewsCount ?? place.reviews?.length ?? 0,
      averageRating:    place.totalScore ?? null,
    };
  }

  // Case (b): flat array of review objects.
  // In this case we don't have the total count from Google's side, so we
  // use the length of the array as a fallback (will be inaccurate if
  // maxReviews was capped — update accordingly).
  const reviews = results as unknown as ApifyReview[];
  console.warn('[Parser] Could not find a top-level place object. Treating all items as flat reviews. totalReviewCount may be inaccurate.');
  return {
    reviews,
    totalReviewCount: reviews.length,
    averageRating:    null,
  };
}

// ---------------------------------------------------------------------------
// ── DATABASE OPERATIONS ──────────────────────────────────────────────────────
// ---------------------------------------------------------------------------

/**
 * Upserts a single review into the google_reviews table.
 *
 * ON CONFLICT (review_id) DO UPDATE means:
 *  - If the review already exists in our DB, we update the text/rating (in
 *    case the reviewer edited their review on Google).
 *  - If it's brand new, we insert it.
 *
 * This is idempotent — safe to run multiple times.
 */
async function upsertReview(review: ApifyReview): Promise<void> {
  const sql = `
    INSERT INTO google_reviews (
      review_id,
      author_name,
      rating,
      review_text,
      publish_date,
      profile_photo_url,
      original_google_url
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (review_id) DO UPDATE SET
      author_name         = EXCLUDED.author_name,
      rating              = EXCLUDED.rating,
      review_text         = EXCLUDED.review_text,
      publish_date        = EXCLUDED.publish_date,
      profile_photo_url   = EXCLUDED.profile_photo_url,
      original_google_url = EXCLUDED.original_google_url,
      updated_at          = NOW()
  `;

  await db.query(sql, [
    review.reviewId,
    review.name,
    review.stars,
    review.text ?? null,
    review.publishedAtDate ? new Date(review.publishedAtDate) : null,
    review.reviewerPhotoUrl ?? (review.reviewImageUrls?.[0] ?? null),
    review.reviewUrl ?? null,
  ]);
}

/**
 * Updates the singleton business_metadata row with the latest aggregate data.
 * This always updates the one existing row (seeded by schema.sql).
 */
async function updateBusinessMetadata(
  totalReviewCount: number,
  averageRating:    number | null,
): Promise<void> {
  const sql = `
    UPDATE business_metadata SET
      total_review_count     = $1,
      average_rating         = $2,
      last_updated_timestamp = NOW()
    WHERE singleton = TRUE
  `;
  await db.query(sql, [totalReviewCount, averageRating]);
}

// ---------------------------------------------------------------------------
// ── MAIN SYNC FUNCTION ───────────────────────────────────────────────────────
// ---------------------------------------------------------------------------

/**
 * The main entry point for the pipeline.
 *
 * Steps:
 *  1. Fetch raw data from Apify.
 *  2. Parse out reviews and business metadata.
 *  3. Update business_metadata table.
 *  4. Filter: drop reviews with rating ≤ 3.
 *  5. Upsert remaining 4★ / 5★ reviews into google_reviews.
 *  6. Log summary.
 */
async function runSync(): Promise<void> {
  const startTime = Date.now();
  console.log('\n========================================');
  console.log(' Avenue Eyewear — Google Reviews Sync ');
  console.log(`  Started: ${new Date().toISOString()}`);
  console.log('========================================\n');

  try {
    // ── Step 1: Fetch from Apify ──────────────────────────────────────────
    const rawResults = await fetchReviewsFromApify();

    // ── Step 2: Parse ─────────────────────────────────────────────────────
    const { reviews, totalReviewCount, averageRating } = parseApifyPayload(rawResults);
    console.log(`[Parser] Total reviews from Google (all ratings): ${totalReviewCount}`);
    console.log(`[Parser] Average rating: ${averageRating ?? 'N/A'}`);
    console.log(`[Parser] Raw review objects in payload: ${reviews.length}`);

    // ── Step 3: Update business metadata ──────────────────────────────────
    await updateBusinessMetadata(totalReviewCount, averageRating);
    console.log('[DB] business_metadata updated.');

    // ── Step 4: Filter out ≤3-star reviews ────────────────────────────────
    const filteredReviews = reviews.filter(r => r.stars >= CONFIG.minRatingToKeep);
    const droppedCount    = reviews.length - filteredReviews.length;
    console.log(`[Filter] Kept ${filteredReviews.length} reviews (${droppedCount} dropped — rating ≤ ${CONFIG.minRatingToKeep - 1} stars).`);

    // ── Step 5: Upsert qualifying reviews ─────────────────────────────────
    let upsertedCount = 0;
    let skippedCount  = 0;

    for (const review of filteredReviews) {
      // Safety check: make sure we have a stable ID to upsert on.
      if (!review.reviewId) {
        console.warn(`[DB] Skipping review by "${review.name}" — no reviewId present.`);
        skippedCount++;
        continue;
      }
      await upsertReview(review);
      upsertedCount++;
    }

    // ── Step 6: Summary ───────────────────────────────────────────────────
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('\n========================================');
    console.log(' Sync Complete ✓');
    console.log(`  Total from Google : ${totalReviewCount}`);
    console.log(`  In payload        : ${reviews.length}`);
    console.log(`  Filtered (dropped): ${droppedCount}`);
    console.log(`  Upserted to DB    : ${upsertedCount}`);
    console.log(`  Skipped (no ID)   : ${skippedCount}`);
    console.log(`  Time elapsed      : ${elapsed}s`);
    console.log('========================================\n');

  } catch (err) {
    console.error('[SYNC ERROR]', err);
    process.exitCode = 1;
  } finally {
    // Always release the DB pool to allow the process to exit cleanly.
    await db.end();
  }
}

// ---------------------------------------------------------------------------
// ── ENTRY POINT ──────────────────────────────────────────────────────────────
// ---------------------------------------------------------------------------
// Run directly: `npx ts-node scripts/sync-google-reviews.ts`
runSync();

/**
 * ---------------------------------------------------------------------------
 * ALTERNATIVE: node-cron in-process scheduler
 * ---------------------------------------------------------------------------
 * If you prefer to run this as a long-lived Node.js process (e.g. inside a
 * Docker container) rather than a system cron, install node-cron and replace
 * the `runSync()` call above with:
 *
 *   import cron from 'node-cron';
 *   // Run every Monday at 03:00 AM
 *   cron.schedule('0 3 * * 1', () => {
 *     console.log('[Cron] Triggering weekly review sync...');
 *     runSync();
 *   });
 *   console.log('[Cron] Scheduler started. Waiting for next run...');
 *
 * Install with: npm install node-cron && npm install -D @types/node-cron
 * ---------------------------------------------------------------------------
 */
