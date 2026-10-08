/**
 * UrbanNest — Slug Utility
 * Generates URL-safe slugs for products, categories, and stores.
 */

import slugify from "slugify";

/**
 * Generate a clean URL slug from a string.
 * Example: "Men's Slim Fit Chinos" → "mens-slim-fit-chinos"
 */
export function generateSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,      // Remove special characters
    trim: true,
    locale: "en",
  });
}

/**
 * Generate a unique slug by appending a short suffix if needed.
 * The caller is responsible for checking uniqueness in the database.
 * This generates the candidate slug — the uniqueness check + retry loop
 * belongs in the service layer.
 */
export function generateSlugWithSuffix(text: string, suffix: string): string {
  return `${generateSlug(text)}-${suffix}`;
}
