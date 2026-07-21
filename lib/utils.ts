import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'

// ─── Class Merging ───────────────────────────────────────────
/**
 * Merge Tailwind CSS class names safely.
 * Handles conditional classes and deduplicates conflicting utilities.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

// ─── Duration Formatting ─────────────────────────────────────
/**
 * Format seconds into human-readable duration.
 * @example formatDuration(4980) → "1h 23min"
 * @example formatDuration(300)  → "5min"
 * @example formatDuration(7200) → "2h"
 */
export function formatDuration(seconds: number): string {
  if (seconds <= 0) return '0min'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}min`
  }
  if (hours > 0) {
    return `${hours}h`
  }
  return `${minutes}min`
}

/**
 * Format seconds into HH:MM:SS or MM:SS timestamp string.
 * @example formatTimestamp(3661) → "1:01:01"
 * @example formatTimestamp(90)   → "1:30"
 */
export function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)

  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')

  if (h > 0) {
    return `${h}:${mm}:${ss}`
  }
  return `${m}:${ss}`
}

// ─── Date Formatting ─────────────────────────────────────────
/**
 * Format a date into a short readable string.
 * @example formatDate(new Date('2026-07-17')) → "Jul 17"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'MMM d')
}

/**
 * Format a date with year.
 * @example formatDateFull(new Date('2026-07-17')) → "Jul 17, 2026"
 */
export function formatDateFull(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'MMM d, yyyy')
}

// ─── Percentage Formatting ───────────────────────────────────
/**
 * Format a fraction (0–1) as a percentage string.
 * @example formatPercent(0.42) → "42%"
 * @example formatPercent(1)    → "100%"
 */
export function formatPercent(fraction: number): string {
  return `${Math.round(fraction * 100)}%`
}

// ─── URL Utilities ───────────────────────────────────────────
/**
 * Check if a string looks like a YouTube URL.
 */
export function isYouTubeUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return (
      parsed.hostname === 'youtube.com' ||
      parsed.hostname === 'www.youtube.com' ||
      parsed.hostname === 'youtu.be' ||
      parsed.hostname === 'm.youtube.com'
    )
  } catch {
    return false
  }
}

// ─── Number Utilities ────────────────────────────────────────
/**
 * Clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Round to 2 decimal places.
 */
export function round2(n: number): number {
  return Math.round(n * 100) / 100
}
