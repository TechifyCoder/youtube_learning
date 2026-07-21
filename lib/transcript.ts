import { YoutubeTranscript } from 'youtube-transcript'

// ─────────────────────────────────────────────────────────────
// lib/transcript.ts — Transcript fetching and formatting
// ─────────────────────────────────────────────────────────────

const MAX_TRANSCRIPT_CHARS = 80000 // Claude API context limit safety

/**
 * Fetches the raw transcript from YouTube
 */
export async function fetchTranscript(videoId: string): Promise<any[] | null> {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId)
    return transcript
  } catch (error) {
    console.error(`[fetchTranscript] Failed for ${videoId}:`, error)
    return null
  }
}

/**
 * Cleans the raw transcript array into a readable block of text
 */
export function cleanTranscript(rawTranscript: any[]): string {
  if (!rawTranscript || rawTranscript.length === 0) return ''
  
  return rawTranscript
    .map(t => t.text)
    .join(' ')
    .replace(/\s+/g, ' ') // collapse whitespace
    .replace(/\[Music\]/gi, '') // remove common auto-generated tags
    .trim()
}

/**
 * Prepares the transcript for the AI prompt, truncating if necessary
 */
export function prepareTranscriptForAI(text: string): string {
  if (!text) return ''
  
  if (text.length > MAX_TRANSCRIPT_CHARS) {
    // Truncate to save context window and cost
    return text.substring(0, MAX_TRANSCRIPT_CHARS) + '\n\n[TRANSCRIPT TRUNCATED DUE TO LENGTH]'
  }
  
  return text
}
