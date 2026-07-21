'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Download, Loader2 } from 'lucide-react'
import { formatTime } from '@/lib/schedule'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface Note {
  id: string
  content: string
  timestampSeconds: number
  createdAt: string
}

interface TimestampNotesProps {
  videoId: string
  videoTitle: string
  currentPlayhead: number
  onSeek: (seconds: number) => void
}

export function TimestampNotes({ videoId, videoTitle, currentPlayhead, onSeek }: TimestampNotesProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [newNoteContent, setNewNoteContent] = useState('')
  const [capturedTime, setCapturedTime] = useState<number | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    fetchNotes()
  }, [videoId])

  const fetchNotes = async () => {
    try {
      const res = await fetch(`/api/notes?videoId=${videoId}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setNotes(data)
    } catch (err) {
      toast.error('Failed to load notes')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartAdd = () => {
    setCapturedTime(Math.floor(currentPlayhead))
    setIsAdding(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const handleCancelAdd = () => {
    setIsAdding(false)
    setNewNoteContent('')
    setCapturedTime(null)
  }

  const handleSaveNote = async () => {
    if (!newNoteContent.trim() || capturedTime === null) return

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId,
          content: newNoteContent.trim(),
          timestampSeconds: capturedTime
        })
      })

      if (!res.ok) throw new Error('Failed to save')
      const newNote = await res.json()
      
      setNotes(prev => [...prev, newNote].sort((a, b) => a.timestampSeconds - b.timestampSeconds))
      handleCancelAdd()
      toast.success('Note saved')
    } catch (err) {
      toast.error('Failed to save note')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/notes?noteId=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      
      setNotes(prev => prev.filter(n => n.id !== id))
      toast.success('Note deleted')
    } catch (err) {
      toast.error('Failed to delete note')
    }
  }

  const handleExport = () => {
    const text = `${videoTitle} — Notes\n\n` + 
      notes.map(n => `[${formatTime(n.timestampSeconds)}] ${n.content}`).join('\n')
    
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${videoTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_notes.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-black/20 rounded-xl overflow-hidden border border-white/[0.05]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/[0.05]">
        <h3 className="font-semibold text-sm">Your Notes</h3>
        {notes.length > 0 && (
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 text-xs text-purple-400 hover:text-purple-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export .txt
          </button>
        )}
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence initial={false}>
          {notes.length === 0 && !isAdding ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center text-sm text-[--text-muted] py-8"
            >
              No notes yet. Click below to add one while watching.
            </motion.div>
          ) : (
            notes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group flex gap-3 p-3 bg-white/[0.02] hover:bg-white/[0.04] rounded-lg border border-white/[0.05] transition-colors"
              >
                <button 
                  onClick={() => onSeek(note.timestampSeconds)}
                  className="shrink-0 text-xs font-mono text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded h-fit hover:bg-purple-500/20 transition-colors mt-0.5"
                >
                  {formatTime(note.timestampSeconds)}
                </button>
                <p className="flex-1 text-sm text-[--text-secondary] whitespace-pre-wrap leading-relaxed">
                  {note.content}
                </p>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="shrink-0 opacity-0 group-hover:opacity-100 p-1 text-[--text-muted] hover:text-red-400 transition-all"
                  title="Delete note"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Add Note Area */}
      <div className="p-4 border-t border-white/[0.05] bg-black/20">
        <AnimatePresence mode="wait">
          {!isAdding ? (
            <motion.button
              key="add-btn"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={handleStartAdd}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/[0.1] text-sm text-[--text-secondary] hover:text-[--text-primary] hover:bg-white/[0.02] hover:border-white/[0.2] transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Note at {formatTime(currentPlayhead)}
            </motion.button>
          ) : (
            <motion.div
              key="add-form"
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 text-xs text-purple-400 mb-2">
                Taking note at {formatTime(capturedTime ?? 0)}
              </div>
              <textarea
                ref={inputRef}
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSaveNote()
                  }
                  if (e.key === 'Escape') handleCancelAdd()
                }}
                placeholder="Type your note here... (Press Enter to save)"
                className="w-full h-24 bg-black/40 border border-white/[0.1] focus:border-purple-500/50 rounded-xl p-3 text-sm text-[--text-primary] placeholder-[--text-disabled] outline-none resize-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleCancelAdd}
                  className="px-4 py-2 text-xs text-[--text-secondary] hover:text-[--text-primary] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNote}
                  disabled={!newNoteContent.trim()}
                  className="px-4 py-2 text-xs font-medium bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  Save Note
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
