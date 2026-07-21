// ─────────────────────────────────────────────────────────────
// LearnLoop — App-Wide Constants
// From ARCHITECTURE.md Section 3 — do not change without updating MEMORY.md
// ─────────────────────────────────────────────────────────────

// Progress tracking
/** Videos longer than this threshold (seconds) get auto-split into parts */
export const SPLIT_THRESHOLD_SECONDS = 7200  // 2 hours

/** Minimum duration for a video part when splitting */
export const MIN_PART_SECONDS = 1200  // 20 minutes

/** Maximum duration for a video part when splitting */
export const MAX_PART_SECONDS = 7200  // 2 hours

/** A video is "complete" when this fraction has been watched */
export const COMPLETION_THRESHOLD = 0.9  // 90%

/** How often to record progress while playing (milliseconds) */
export const PROGRESS_SAVE_INTERVAL = 5000  // 5 seconds

/** Segment merge tolerance — segments within 2 seconds of each other are merged */
export const SEGMENT_MERGE_TOLERANCE = 2  // seconds

// AI Q&A
/** Maximum questions per video session */
export const MAX_AI_QUESTIONS = 10

/** Maximum transcript characters sent to AI */
export const MAX_TRANSCRIPT_CHARS = 80000

// YouTube API
/** Maximum results per YouTube API page request */
export const YOUTUBE_MAX_RESULTS = 50

// Schedule
/** Default start date is today */
export const DEFAULT_START_DATE = new Date()

// UI
/** Debounce delay for URL input in milliseconds */
export const URL_DEBOUNCE_MS = 500
