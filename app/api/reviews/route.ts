/**
 * =============================================================================
 * API Route: /api/reviews
 * =============================================================================
 * FILE: app/api/reviews/route.ts
 *
 * PURPOSE:
 *   Returns all 4★ / 5★ Google reviews stored in our PostgreSQL database,
 *   plus the business metadata (total review count, average rating) needed
 *   for the header disclaimer on the Testimonials page.
 *
 * RESPONSE SHAPE:
 *   {
 *     meta: {
 *       totalReviewCount: number;
 *       averageRating: number | null;
 *       lastUpdated: string;       // ISO-8601 timestamp
 *     };
 *     reviews: Array<{
 *       reviewId:         string;
 *       authorName:       string;
 *       rating:           number;
 *       reviewText:       string | null;
 *       publishDate:      string | null;  // ISO-8601
 *       profilePhotoUrl:  string | null;
 *       originalGoogleUrl: string | null;
 *     }>;
 *   }
 *
 * CACHING:
 *   We add a Cache-Control header so Next.js / CDN caches this for 1 hour.
 *   The weekly pipeline run will make the cache stale, but data never goes
 *   out of date by more than an hour from a user's perspective.
 *   Adjust the max-age value to suit your needs.
 *
 * SETUP:
 *   1. npm install pg
 *   2. npm install -D @types/pg
 *   3. Add DATABASE_URL to .env.local
 *
 * =============================================================================
 */

import { NextResponse } from 'next/server';
import { Pool }         from 'pg';

// ---------------------------------------------------------------------------
// ── DATABASE CONNECTION ──────────────────────────────────────────────────────
// We create the pool at module level so it persists across requests in the
// same serverless function instance / Node.js process.
// ---------------------------------------------------------------------------
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Keep the pool small — this is a read-only route.
  max: 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 15_000,
});

// ---------------------------------------------------------------------------
// ── GET /api/reviews ─────────────────────────────────────────────────────────
// ---------------------------------------------------------------------------
export async function GET() {
  try {
    // ── 1. Fetch business metadata (single row) ────────────────────────────
    const metaResult = await db.query<{
      total_review_count:     number;
      average_rating:         string | null;  // NUMERIC comes back as string from pg
      last_updated_timestamp: string;
    }>(`
      SELECT
        total_review_count,
        average_rating,
        last_updated_timestamp
      FROM business_metadata
      WHERE singleton = TRUE
      LIMIT 1
    `);

    // Fallback to zeros if the table is somehow empty (shouldn't happen after
    // schema.sql is run, but defensive is good).
    const meta = metaResult.rows[0] ?? {
      total_review_count:     0,
      average_rating:         null,
      last_updated_timestamp: new Date().toISOString(),
    };

    // ── 2. Fetch all 4★ / 5★ reviews, newest first ────────────────────────
    const reviewsResult = await db.query<{
      review_id:           string;
      author_name:         string;
      rating:              number;
      review_text:         string | null;
      publish_date:        string | null;
      profile_photo_url:   string | null;
      original_google_url: string | null;
    }>(`
      SELECT
        review_id,
        author_name,
        rating,
        review_text,
        publish_date,
        profile_photo_url,
        original_google_url
      FROM google_reviews
      WHERE rating >= 4
        AND author_name NOT ILIKE 'sha muhammad'
        AND (review_text IS NULL OR (
          review_text NOT ILIKE '%black owned%'
          AND review_text NOT ILIKE '%black-owned%'
        ))
      ORDER BY
        CASE
          WHEN review_text IS NOT NULL AND TRIM(review_text) <> '' THEN 0
          ELSE 1
        END ASC,
        publish_date DESC NULLS LAST
    `);

    // ── 3. Shape the response ─────────────────────────────────────────────
    const responseBody = {
      meta: {
        totalReviewCount: meta.total_review_count,
        // pg returns NUMERIC as a string; parse it to a float.
        averageRating:    meta.average_rating ? parseFloat(meta.average_rating) : null,
        lastUpdated:      meta.last_updated_timestamp,
      },
      reviews: reviewsResult.rows.map(row => ({
        reviewId:          row.review_id,
        authorName:        row.author_name,
        rating:            row.rating,
        reviewText:        row.review_text,
        publishDate:       row.publish_date,
        profilePhotoUrl:   row.profile_photo_url,
        originalGoogleUrl: row.original_google_url,
      })),
    };

    return NextResponse.json(responseBody, {
      status: 200,
      headers: {
        // Cache for 1 hour on CDN / ISR, allow stale-while-revalidate for 5 min.
        // Adjust or remove if you want truly live data on every request.
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300',
      },
    });

  } catch (err) {
    console.error('[GET /api/reviews] Database error:', err);

    return NextResponse.json(
      { error: 'Failed to fetch reviews. Please try again later.' },
      { status: 500 },
    );
  }
}
