'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BrainCircuit, PlayCircle, CheckCircle2, XCircle, ArrowRight, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function QuizzesListClient({ attempts }: { attempts: any[] }) {
  const [selectedAttempt, setSelectedAttempt] = useState<any | null>(null)

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {attempts.map((attempt, idx) => {
          const isComplete = attempt.isComplete
          const score = attempt.score || 0
          const maxScore = attempt.maxScore || 1
          const percentage = Math.round((score / maxScore) * 100)
          
          return (
            <motion.div
              key={attempt.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-[--bg-card] border border-[--border-subtle] rounded-2xl p-6 shadow-card hover:shadow-glow transition-all group flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-1 bg-purple-500/[0.1] text-purple-400 rounded-md">
                      {attempt.quizType === 'video' ? 'Video Quiz' : 'Final Quiz'}
                    </span>
                    {isComplete ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase px-2 py-1 bg-green-500/[0.1] text-green-400 rounded-md">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-1 bg-yellow-500/[0.1] text-yellow-400 rounded-md">
                        In Progress
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-[--text-primary] truncate" title={attempt.videoTitle || attempt.playlistTitle}>
                    {attempt.videoTitle || attempt.playlistTitle || 'Unknown'}
                  </h3>
                </div>
                
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {percentage}%
                </div>
              </div>
              
              <div className="text-sm text-[--text-muted] mb-6">
                Score: {score} / {maxScore} correct
                <br />
                {new Date(attempt.startedAt).toLocaleDateString(undefined, {
                  year: 'numeric', month: 'short', day: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </div>

              <div className="mt-auto pt-4 border-t border-[--border-subtle]">
                <Button 
                  variant="ghost" 
                  className="w-full justify-between hover:bg-white/[0.04]"
                  onClick={() => setSelectedAttempt(attempt)}
                  disabled={!attempt.answers || attempt.answers.length === 0}
                >
                  Review Answers
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Button>
              </div>
            </motion.div>
          )
        })}
      </div>

      <AnimatePresence>
        {selectedAttempt && (
          <QuizReviewModal attempt={selectedAttempt} onClose={() => setSelectedAttempt(null)} />
        )}
      </AnimatePresence>
    </>
  )
}

import { Textarea } from '@/components/ui/textarea'
import { toast } from 'react-hot-toast'

function QuizReviewModal({ attempt, onClose }: { attempt: any, onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'mcq' | 'practice'>('mcq')
  const [localAnswers, setLocalAnswers] = useState<any[]>(attempt.answers || [])
  const [draftAnswers, setDraftAnswers] = useState<Record<string, string>>({})
  const [evaluating, setEvaluating] = useState<Record<string, boolean>>({})

  const mcqAnswers = localAnswers.filter((a: any) => a.type === 'mcq')
  const practiceAnswers = localAnswers.filter((a: any) => a.type === 'practice')
  const practiceQuestions = attempt.questions?.filter((q: any) => q.type === 'short_answer') || []

  // If no practice questions exist at all in the attempt, fallback to just answers
  const hasPracticeQuestions = practiceQuestions.length > 0

  const handleEvaluate = async (q: any) => {
    const text = draftAnswers[q.question] || ''
    if (text.split(' ').length < 5) {
      toast.error('Please write a bit more to get evaluated.')
      return
    }

    setEvaluating(prev => ({ ...prev, [q.question]: true }))
    try {
      const res = await fetch('/api/quiz/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q.question,
          userAnswer: text,
          sampleAnswer: q.sampleAnswer,
          criteria: q.evaluationCriteria
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      const newAnswer = {
        type: 'practice',
        question: q.question,
        userAnswer: text,
        evaluation: data
      }
      const updatedAnswers = [...localAnswers, newAnswer]
      setLocalAnswers(updatedAnswers)

      if (attempt.id) {
        await fetch(`/api/quiz/attempt/${attempt.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: updatedAnswers })
        })
      }
      toast.success('Answer evaluated successfully!')
    } catch (err: any) {
      toast.error('Failed to evaluate. Please try again.')
    } finally {
      setEvaluating(prev => ({ ...prev, [q.question]: false }))
    }
  }

  return (
    <div className="fixed inset-0 bg-[--bg-primary]/95 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[--bg-card] border border-[--border-subtle] rounded-xl shadow-card w-full max-w-3xl flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between p-4 border-b border-[--border-subtle] shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[--text-primary]">Quiz Review</h2>
            <p className="text-sm text-[--text-muted] truncate">{attempt.videoTitle || attempt.playlistTitle}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/[0.05] transition-colors">
            <X className="w-5 h-5 text-[--text-muted]" />
          </button>
        </div>

        <div className="flex border-b border-[--border-subtle] p-2 bg-background/50 shrink-0">
          <button
            onClick={() => setActiveTab('mcq')}
            className={cn(
              "flex-1 py-3 text-sm font-semibold rounded-lg transition-all",
              activeTab === 'mcq' ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:bg-secondary/50"
            )}
          >
            Multiple Choice ({mcqAnswers.length})
          </button>
          <button
            onClick={() => setActiveTab('practice')}
            className={cn(
              "flex-1 py-3 text-sm font-semibold rounded-lg transition-all",
              activeTab === 'practice' ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:bg-secondary/50"
            )}
          >
            Practice Questions ({hasPracticeQuestions ? practiceQuestions.length : practiceAnswers.length})
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
          {activeTab === 'mcq' && (
            mcqAnswers.length > 0 ? mcqAnswers.map((ans: any, idx: number) => (
              <div key={idx} className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold bg-white/[0.05] mt-0.5">
                    {idx + 1}
                  </div>
                  <h3 className="font-medium text-[--text-primary] text-lg">{ans.question}</h3>
                </div>
                
                <div className="pl-9 space-y-2">
                  <div className={cn(
                    "p-3 rounded-lg border text-sm flex items-center gap-3",
                    ans.isCorrect ? "bg-green-500/[0.1] border-green-500/30 text-green-100" : "bg-red-500/[0.1] border-red-500/30 text-red-100"
                  )}>
                    {ans.isCorrect ? <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" /> : <XCircle className="w-5 h-5 text-red-400 shrink-0" />}
                    <div>
                      <span className="font-bold uppercase text-[10px] opacity-70 block mb-0.5">Your Answer</span>
                      Option {ans.selectedOption + 1}
                    </div>
                  </div>
                  {!ans.isCorrect && (
                    <div className="p-3 rounded-lg border border-green-500/30 bg-green-500/[0.05] text-sm flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                      <div>
                        <span className="font-bold uppercase text-[10px] text-green-400 block mb-0.5">Correct Answer</span>
                        Option {ans.correctOption + 1}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )) : (
              <div className="text-center py-12 text-[--text-muted]">No multiple choice answers recorded.</div>
            )
          )}

          {activeTab === 'practice' && (
            hasPracticeQuestions ? (
              practiceQuestions.map((q: any, idx: number) => {
                const ans = practiceAnswers.find((a: any) => a.question === q.question)
                
                return (
                  <div key={idx} className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold bg-white/[0.05] mt-0.5">
                        {idx + 1}
                      </div>
                      <h3 className="font-medium text-[--text-primary] text-lg">{q.question}</h3>
                    </div>

                    <div className="pl-9 space-y-4">
                      {ans ? (
                        <>
                          <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                            <span className="font-bold uppercase text-[10px] text-[--text-muted] block mb-1">Your Answer</span>
                            <p className="text-sm text-[--text-secondary] whitespace-pre-wrap">{ans.userAnswer}</p>
                          </div>

                          <div className="p-4 rounded-lg bg-purple-500/[0.05] border border-purple-500/20">
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-bold uppercase text-[10px] text-purple-400 block">AI Evaluation</span>
                              <span className="text-sm font-bold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
                                {ans.evaluation?.score}/100
                              </span>
                            </div>
                            
                            <p className="text-sm text-[--text-primary] mb-4">{ans.evaluation?.feedback}</p>
                            
                            {ans.evaluation?.criteriaMet?.length > 0 && (
                              <div className="space-y-1">
                                <span className="font-bold uppercase text-[10px] text-green-400 block mb-2">Criteria Met</span>
                                {ans.evaluation.criteriaMet.map((crit: string, i: number) => (
                                  <div key={i} className="flex items-center gap-2 text-sm text-[--text-secondary]">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                    <span>{crit}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="space-y-3">
                          <Textarea 
                            value={draftAnswers[q.question] || ''}
                            onChange={(e) => setDraftAnswers(prev => ({ ...prev, [q.question]: e.target.value }))}
                            placeholder="You didn't answer this question. Type your answer here... (min 5 words)"
                            className="min-h-[120px] resize-none text-base"
                            disabled={evaluating[q.question]}
                          />
                          <Button 
                            onClick={() => handleEvaluate(q)} 
                            disabled={evaluating[q.question] || (draftAnswers[q.question] || '').length < 5}
                            className="w-full"
                          >
                            {evaluating[q.question] ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {evaluating[q.question] ? 'Evaluating...' : 'Submit Answer'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              practiceAnswers.length > 0 ? practiceAnswers.map((ans: any, idx: number) => (
                <div key={idx} className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold bg-white/[0.05] mt-0.5">
                      {idx + 1}
                    </div>
                    <h3 className="font-medium text-[--text-primary] text-lg">{ans.question}</h3>
                  </div>
  
                  <div className="pl-9 space-y-4">
                    <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                      <span className="font-bold uppercase text-[10px] text-[--text-muted] block mb-1">Your Answer</span>
                      <p className="text-sm text-[--text-secondary] whitespace-pre-wrap">{ans.userAnswer}</p>
                    </div>
  
                    <div className="p-4 rounded-lg bg-purple-500/[0.05] border border-purple-500/20">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold uppercase text-[10px] text-purple-400 block">AI Evaluation</span>
                        <span className="text-sm font-bold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
                          {ans.evaluation?.score}/100
                        </span>
                      </div>
                      
                      <p className="text-sm text-[--text-primary] mb-4">{ans.evaluation?.feedback}</p>
                      
                      {ans.evaluation?.criteriaMet?.length > 0 && (
                        <div className="space-y-1">
                          <span className="font-bold uppercase text-[10px] text-green-400 block mb-2">Criteria Met</span>
                          {ans.evaluation.criteriaMet.map((crit: string, i: number) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-[--text-secondary]">
                              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                              <span>{crit}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12 text-[--text-muted]">No practice questions available.</div>
              )
            )
          )}
        </div>
      </motion.div>
    </div>
  )
}

