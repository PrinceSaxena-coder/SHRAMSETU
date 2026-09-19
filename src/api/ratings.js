// src/api/ratings.js
//
// Future backend: REST resource `/api/ratings`
//   GET  /api/ratings?workerId=...   -> listRatings()
//   POST /api/ratings                -> submitRating(payload)

// src/api/ratings.js
// src/api/ratings.js

import { delay, readTable, writeTable } from './client'

const KEY = 'ss_ratings'


// GET /api/ratings
export async function listRatings() {
  await delay()
  return readTable(KEY, [])
}


// POST /api/ratings
export async function submitRating({
  bookingId,

  // Existing customer → worker field
  worker = null,

  // Two-way review fields
  reviewerId = null,
  reviewerRole = null,
  reviewedUserId = null,
  reviewedUserRole = null,

  rating,
  review,
}) {

  await delay()

  const current = readTable(KEY, [])


  const entry = {
    id: `rating_${Date.now()}`,

    bookingId,

    // Keep this for compatibility
    worker,

    // Who gave the review
    reviewerId,
    reviewerRole,

    // Who received the review
    reviewedUserId,
    reviewedUserRole,

    rating,
    review,

    date: Date.now(),
  }


  writeTable(
    KEY,
    [...current, entry]
  )


  return entry
}