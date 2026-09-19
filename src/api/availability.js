// src/api/availability.js
//
// Future backend: REST resource `/api/workers/:id/availability`
//   GET /api/workers/:id/availability   -> getAvailability(workerId)
//   PUT /api/workers/:id/availability   -> setAvailability(workerId, availability)
//
// Shape: { Mon: ['9:00 AM', ...], Tue: [...], ... } — one entry per WEEK_DAYS
// day, listing which TIME_SLOTS that worker is available for. A worker with
// no saved record defaults to fully available (every day, every slot), so
// existing workers keep behaving exactly as before until they customize it.

import { delay, readTable, writeTable } from './client'
import { WEEK_DAYS, TIME_SLOTS } from '../data/mockauth'

const KEY = 'ss_availability'

function defaultAvailability() {
  const avail = {}
  WEEK_DAYS.forEach((day) => { avail[day] = [...TIME_SLOTS] })
  return avail
}

// GET /api/workers/:id/availability
export async function getAvailability(workerId) {
  await delay()
  const table = readTable(KEY, {})
  return table[workerId] || defaultAvailability()
}

// PUT /api/workers/:id/availability
export async function setAvailability(workerId, availability) {
  await delay()
  const table = readTable(KEY, {})
  table[workerId] = availability
  writeTable(KEY, table)
  return availability
}
