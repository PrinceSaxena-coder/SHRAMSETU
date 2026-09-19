// src/api/client.js
//
// Mock API client for the ShramSetu prototype.
//
// Every function in this folder is written the way a real REST call would be:
// it's async, it returns a Promise, it can fail, and callers already
// await/catch it. Right now the "network" is just localStorage with an
// artificial delay. When a real backend exists, only the inside of these
// functions changes (swap localStorage.* for fetch('/api/...')) — every
// page that calls this layer stays exactly the same.

const LATENCY_MS = 350

export function delay(ms = LATENCY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function readTable(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) {
      localStorage.setItem(key, JSON.stringify(fallback))
      return fallback
    }
    return JSON.parse(raw)
  } catch (err) {
    console.error(`[api] failed to read ${key}`, err)
    return fallback
  }
}

export function writeTable(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (err) {
    console.error(`[api] failed to write ${key}`, err)
    return false
  }
}
