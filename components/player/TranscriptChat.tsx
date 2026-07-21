'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/common/GlassCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Bot, User, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import type { Video } from '@/types'

// ─────────────────────────────────────────────────────────────
// TranscriptChat Component
// Sidebar panel for AI Q&A using the video transcript
// ─────────────────────────────────────────────────────────────

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface TranscriptChatProps {
  video: Video
}

export function TranscriptChat({ video }: TranscriptChatProps) {
  const [transcript, setTranscript] = useState<string | null>(null)
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 1. Fetch transcript on mount
  useEffect(() => {
    async function getTranscript() {
      try {
        const res = await fetch(`/api/transcript?videoId=${video.id}`)
        const data = await res.json()
        if (data.available && data.text) {
          setTranscript(data.text)
        }
      } catch (err) {
        console.error('Failed to fetch transcript:', err)
      } finally {
        setIsLoadingTranscript(false)
      }
    }
    getTranscript()
  }, [video.id])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !transcript || isTyping) return

    const question = input.trim()
    setInput('')
    
    // Add user message
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: question }
    setMessages(prev => [...prev, userMsg])
    
    // Add empty assistant message placeholder
    const assistantId = (Date.now() + 1).toString()
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }])
    
    setIsTyping(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: video.id,
          question,
          transcript,
        }),
      })

      if (!res.ok) throw new Error('API error')
      if (!res.body) throw new Error('No stream')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let answer = ''

      // Read the stream chunk by chunk
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        answer += chunk
        
        // Update the assistant message in real time
        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantId ? { ...msg, content: answer } : msg
          )
        )
      }
    } catch (err) {
      console.error('Chat error:', err)
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantId ? { ...msg, content: 'Sorry, I encountered an error answering your question. Please try again.' } : msg
        )
      )
    } finally {
      setIsTyping(false)
    }
  }

  // UI State: No Transcript Available
  if (!isLoadingTranscript && !transcript) {
    return (
      <GlassCard padding="lg" className="h-full flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-white/[0.05] flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-[--text-muted]" />
        </div>
        <div>
          <h3 className="font-heading font-medium text-[--text-primary]">
            No Transcript Available
          </h3>
          <p className="text-sm text-[--text-secondary] mt-1 px-4">
            AI chat is disabled because this video doesn't have closed captions available.
          </p>
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard padding="none" className="flex flex-col h-[500px] lg:h-[600px] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/[0.05] flex items-center gap-3 shrink-0 bg-white/[0.02]">
        <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-heading font-medium text-sm text-[--text-primary]">
            LearnLoop AI
          </h3>
          <p className="text-xs text-[--text-secondary]">
            Ask anything about this video
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {isLoadingTranscript ? (
          <div className="h-full flex items-center justify-center text-[--text-muted] gap-2 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Reading transcript...
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-2 opacity-60">
            <Bot className="w-8 h-8 text-[--text-muted]" />
            <p className="text-sm text-[--text-secondary] max-w-[200px]">
              Hi! I've read the transcript. What would you like to know?
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex flex-col max-w-[85%]",
                    msg.role === 'user' ? "items-end ml-auto" : "items-start"
                  )}
                >
                  <div className={cn(
                    "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-purple-600 text-white rounded-br-sm" 
                      : "bg-white/[0.05] text-[--text-primary] rounded-bl-sm border border-white/[0.05]"
                  )}>
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-black/50">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-3 bg-black/40 border-t border-white/[0.05] shrink-0">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isLoadingTranscript ? "Loading transcript..." : "Ask a question..."}
            disabled={isLoadingTranscript || isTyping}
            className="pr-12 bg-white/[0.03] border-white/[0.1] focus-visible:ring-purple-500 rounded-full"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!input.trim() || isLoadingTranscript || isTyping}
            className="absolute right-1 w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50"
          >
            {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 -ml-0.5" />}
          </Button>
        </form>
      </div>
    </GlassCard>
  )
}
