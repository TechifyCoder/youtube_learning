'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FinalQuizQuestion } from '@/types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, CheckCircle2, XCircle, ArrowRight, ExternalLink } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface FinalQuizModalProps {
  playlistId: string
  courseTitle: string
  videoTitles: string[]
  combinedTranscript: string
  onComplete: (score: number) => void
  onSkip: () => void
}

export function FinalQuizModal({ playlistId, courseTitle, videoTitles, combinedTranscript, onComplete, onSkip }: FinalQuizModalProps) {
  const [questions, setQuestions] = useState<FinalQuizQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // MCQ state
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  
  // Short answer state
  const [shortAnswerText, setShortAnswerText] = useState('')
  const [evaluation, setEvaluation] = useState<{score: number, feedback: string, criteriaMet: string[]} | null>(null)
  const [isEvaluating, setIsEvaluating] = useState(false)

  // Global state
  const [totalScore, setTotalScore] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const [attemptId, setAttemptId] = useState<string | null>(null)

  useEffect(() => {
    async function generateQuiz() {
      try {
        const res = await fetch('/api/quiz/generate-final', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseTitle, videoTitles, combinedTranscript })
        })
        const data = await res.json()
        
        if (!res.ok) throw new Error(data.error || 'Failed to generate')
        setQuestions(data)

        const attemptRes = await fetch('/api/quiz/attempt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playlistId,
            quizType: 'final',
            questions: data,
            maxScore: 100
          })
        })
        const attemptData = await attemptRes.json()
        if (attemptRes.ok) setAttemptId(attemptData.id)
        
      } catch (err: any) {
        toast.error(err.message)
        onSkip()
      } finally {
        setLoading(false)
      }
    }
    generateQuiz()
  }, [courseTitle, videoTitles, combinedTranscript, playlistId, onSkip])

  const handleNext = async () => {
    const currentQ = questions[currentIndex]
    let earnedPoints = 0

    if (!currentQ) return

    if (currentQ.type === 'mcq') {
      if (selectedOption === currentQ.correct) earnedPoints = 20
    } else if (currentQ.type === 'short_answer') {
      if (evaluation) {
        earnedPoints = (evaluation.score / 100) * 10
      }
    } else if (currentQ.type === 'coding_practice') {
      earnedPoints = 4
      if (attemptId) {
        await fetch('/api/quiz/coding-done', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quizAttemptId: attemptId, questionIndex: currentIndex })
        })
      }
    }

    const newScore = totalScore + earnedPoints
    setTotalScore(newScore)

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setSelectedOption(null)
      setShowAnswer(false)
      setShortAnswerText('')
      setEvaluation(null)
    } else {
      setIsFinished(true)
      const finalScore = Math.round(newScore)
      if (attemptId) {
        await fetch(`/api/quiz/attempt/${attemptId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            score: finalScore,
            isComplete: true
          })
        })
      }
      onComplete(finalScore)
    }
  }

  const handleEvaluateShortAnswer = async () => {
    const currentQ = questions[currentIndex]
    if (!currentQ) return
    if (shortAnswerText.split(' ').length < 10) {
      toast.error('Please write at least a few words.')
      return
    }

    setIsEvaluating(true)
    try {
      const res = await fetch('/api/quiz/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQ.question,
          userAnswer: shortAnswerText,
          sampleAnswer: currentQ.sampleAnswer,
          criteria: currentQ.evaluationCriteria
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setEvaluation(data)
    } catch (err: any) {
      toast.error('Failed to evaluate. Please try again.')
    } finally {
      setIsEvaluating(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-[100] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-lg font-medium">Crafting your final exam...</p>
        </div>
      </div>
    )
  }

  if (isFinished) {
    return (
      <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-xl shadow-xl p-8 max-w-md w-full text-center space-y-6">
          <h2 className="text-3xl font-bold">Course Complete! 🏆</h2>
          <div className="py-6">
            <div className="text-5xl font-black text-primary mb-2">{Math.round(totalScore)}/100</div>
            <p className="text-muted-foreground">Final Score</p>
          </div>
          <Button className="w-full" onClick={() => onSkip()}>View Your Certificate</Button>
        </div>
      </div>
    )
  }

  const question = questions[currentIndex]
  if (!question) return null

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-border flex items-center justify-between shrink-0">
          <h3 className="font-semibold text-lg">Question {currentIndex + 1} of {questions.length}</h3>
          <div className="flex gap-1">
            {questions.map((_, i) => (
              <div key={i} className={`h-2 w-5 rounded-full ${i < currentIndex ? 'bg-primary' : i === currentIndex ? 'bg-primary/50' : 'bg-secondary'}`} />
            ))}
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground uppercase tracking-wider font-semibold">
            {question.type === 'mcq' && '🧠 Multiple Choice (20 pts)'}
            {question.type === 'short_answer' && '✍️ Short Answer (10 pts)'}
            {question.type === 'coding_practice' && '💻 Coding Challenge (4 pts)'}
          </div>
          <h2 className="text-xl font-medium mb-6">{question.question}</h2>
          
          {question.type === 'mcq' && (
            <div className="space-y-3">
              {question.options?.map((opt, idx) => {
                const isSelected = selectedOption === idx
                const isCorrect = idx === question.correct
                
                let btnClass = "w-full justify-start text-left h-auto whitespace-normal p-4 border"
                if (!showAnswer) {
                  btnClass += isSelected ? " border-primary bg-primary/10" : " border-border hover:border-primary/50 bg-background"
                } else {
                  if (isCorrect) {
                    btnClass += " border-green-500 bg-green-500/10"
                  } else if (isSelected && !isCorrect) {
                    btnClass += " border-red-500 bg-red-500/10"
                  } else {
                    btnClass += " border-border opacity-50"
                  }
                }

                return (
                  <Button 
                    key={idx} 
                    variant="ghost" 
                    className={btnClass}
                    onClick={() => !showAnswer && setSelectedOption(idx)}
                    disabled={showAnswer}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0
                        ${isSelected && !showAnswer ? 'border-primary' : ''}
                        ${showAnswer && isCorrect ? 'border-green-500 bg-green-500 text-white' : ''}
                        ${showAnswer && isSelected && !isCorrect ? 'border-red-500 bg-red-500 text-white' : ''}
                      `}>
                        {showAnswer && isCorrect && <CheckCircle2 className="w-3 h-3" />}
                        {showAnswer && isSelected && !isCorrect && <XCircle className="w-3 h-3" />}
                      </div>
                      <span>{opt}</span>
                    </div>
                  </Button>
                )
              })}

              <AnimatePresence>
                {showAnswer && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-6 p-4 rounded-lg ${selectedOption === question.correct ? 'bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-red-500/10 text-red-700 dark:text-red-400'}`}
                  >
                    <p className="font-semibold mb-1">
                      {selectedOption === question.correct ? 'Correct!' : 'Incorrect'}
                    </p>
                    <p className="text-sm">{question.explanation}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {question.type === 'short_answer' && (
            <div className="space-y-4">
              <Textarea 
                value={shortAnswerText}
                onChange={(e) => setShortAnswerText(e.target.value)}
                placeholder="Type your answer here... (min 10 words)"
                className="min-h-[150px] resize-none text-base"
                disabled={!!evaluation || isEvaluating}
              />
              
              {!evaluation ? (
                <Button 
                  onClick={handleEvaluateShortAnswer} 
                  disabled={isEvaluating || shortAnswerText.length < 10}
                  className="w-full"
                >
                  {isEvaluating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {isEvaluating ? 'Evaluating...' : 'Submit Answer'}
                </Button>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-lg bg-secondary/50 border border-border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-primary">AI Feedback</h4>
                    <span className="font-bold text-lg">{evaluation.score}/100</span>
                  </div>
                  <p className="text-sm mb-4">{evaluation.feedback}</p>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase font-bold">Criteria Met:</p>
                    {evaluation.criteriaMet.length > 0 ? (
                      evaluation.criteriaMet.map((crit, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-green-500">
                          <CheckCircle2 className="w-4 h-4" /> {crit}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No key criteria met.</p>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {question.type === 'coding_practice' && (
            <div className="space-y-6">
              <div className="p-4 bg-secondary/30 border border-border rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Context:</p>
                <p className="font-medium">{question.context}</p>
              </div>

              {question.hint && (
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg text-primary text-sm">
                  <span className="font-bold">Hint:</span> {question.hint}
                </div>
              )}

              <div>
                <p className="font-semibold mb-3">Practice on:</p>
                <div className="flex flex-wrap gap-3">
                  {question.platform_links?.map((link, i) => (
                    <a key={i} href={link.url} target="_blank" rel="noreferrer">
                      <Button variant="ghost" className="gap-2">
                        {link.name} <ExternalLink className="w-4 h-4" />
                      </Button>
                    </a>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-border mt-8">
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  This is a trust-based exercise. Try to solve it before moving on!
                </p>
                <Button 
                  className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white" 
                  onClick={handleNext}
                >
                  <CheckCircle2 className="w-5 h-5" /> I completed this challenge
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border flex justify-between shrink-0 bg-card">
          <Button variant="ghost" onClick={onSkip}>Quit Exam</Button>
          
          {question.type === 'mcq' && !showAnswer ? (
            <Button onClick={() => setShowAnswer(true)} disabled={selectedOption === null}>
              Check Answer
            </Button>
          ) : question.type === 'mcq' && showAnswer ? (
            <Button onClick={handleNext} className="gap-2">
              Next <ArrowRight className="w-4 h-4" />
            </Button>
          ) : question.type === 'short_answer' && evaluation ? (
            <Button onClick={handleNext} className="gap-2">
              Next <ArrowRight className="w-4 h-4" />
            </Button>
          ) : question.type === 'coding_practice' ? (
            <div />
          ) : (
            <Button disabled className="opacity-0">Placeholder</Button>
          )}
        </div>
      </div>
    </div>
  )
}
