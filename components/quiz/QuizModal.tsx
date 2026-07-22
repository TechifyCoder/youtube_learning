'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QuizQuestion } from '@/types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface QuizModalProps {
  videoId: string
  playlistId: string
  transcript: string
  videoTitle: string
  onComplete: (score: number) => void
  onSkip: () => void
}

export function QuizModal({ videoId, playlistId, transcript, videoTitle, onComplete, onSkip }: QuizModalProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [loading, setLoading] = useState(true)
  
  const [activeTab, setActiveTab] = useState<'quiz' | 'practice'>('quiz')
  
  const quizQuestions = questions.filter(q => q.type !== 'short_answer')
  const practiceQuestions = questions.filter(q => q.type === 'short_answer')

  // Quiz state
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [score, setScore] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const [attemptId, setAttemptId] = useState<string | null>(null)

  // Practice state
  const [practiceIndex, setPracticeIndex] = useState(0)
  const [shortAnswerText, setShortAnswerText] = useState('')
  const [evaluation, setEvaluation] = useState<{score: number, feedback: string, criteriaMet: string[]} | null>(null)
  const [isEvaluating, setIsEvaluating] = useState(false)

  useEffect(() => {
    async function generateQuiz() {
      try {
        const res = await fetch('/api/quiz/generate-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript, videoTitle })
        })
        const data = await res.json()
        
        if (!res.ok) throw new Error(data.error || 'Failed to generate')
        setQuestions(data)

        // create attempt
        const attemptRes = await fetch('/api/quiz/attempt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            videoId,
            playlistId,
            quizType: 'video',
            questions: data,
            maxScore: data.filter((q: any) => q.type !== 'short_answer').length
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
  }, [transcript, videoTitle, videoId, playlistId, onSkip])

  const handleNextQuiz = async () => {
    if (selectedOption === null) return

    const currentQ = quizQuestions[currentIndex]
    let newScore = score
    if (currentQ && selectedOption === currentQ.correct) {
      newScore += 1
    }
    setScore(newScore)

    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setSelectedOption(null)
      setShowAnswer(false)
    } else {
      setIsFinished(true)
      if (attemptId) {
        const finalScore = Math.round((newScore / Math.max(1, quizQuestions.length)) * 100)
        await fetch(`/api/quiz/attempt/${attemptId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            score: finalScore,
            isComplete: true
          })
        })
        onComplete(finalScore)
      } else {
        onComplete(Math.round((newScore / Math.max(1, quizQuestions.length)) * 100))
      }
    }
  }

  const handleNextPractice = () => {
    if (practiceIndex < practiceQuestions.length - 1) {
      setPracticeIndex(prev => prev + 1)
      setShortAnswerText('')
      setEvaluation(null)
    }
  }

  const handleEvaluatePractice = async () => {
    const currentQ = practiceQuestions[practiceIndex]
    if (!currentQ) return
    if (shortAnswerText.split(' ').length < 5) {
      toast.error('Please write a bit more to get evaluated.')
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
          <p className="text-lg font-medium">Generating quiz and practice questions...</p>
        </div>
      </div>
    )
  }

  if (isFinished) {
    const percentage = Math.round((score / Math.max(1, quizQuestions.length)) * 100)
    return (
      <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-xl shadow-xl p-8 max-w-md w-full text-center space-y-6">
          <h2 className="text-3xl font-bold">Quiz Complete! 🎉</h2>
          <div className="py-6">
            <div className="text-5xl font-black text-primary mb-2">{percentage}%</div>
            <p className="text-muted-foreground">{score} out of {quizQuestions.length} correct</p>
          </div>
          <Button className="w-full" onClick={() => onSkip()}>Continue</Button>
        </div>
      </div>
    )
  }

  const renderQuizContent = () => {
    const question = quizQuestions[currentIndex]
    if (!question) return <div className="p-6">No quiz questions available.</div>

    return (
      <>
        <div className="p-6 border-b border-border flex items-center justify-between shrink-0">
          <h3 className="font-semibold text-lg">Question {currentIndex + 1} of {quizQuestions.length}</h3>
          <div className="flex gap-1">
            {quizQuestions.map((_, i) => (
              <div key={i} className={`h-2 w-8 rounded-full ${i < currentIndex ? 'bg-primary' : i === currentIndex ? 'bg-primary/50' : 'bg-secondary'}`} />
            ))}
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <h2 className="text-xl font-medium mb-6">{question.question}</h2>
          
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
          </div>

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

        <div className="p-6 border-t border-border flex justify-between shrink-0 bg-card">
          <Button variant="ghost" onClick={onSkip}>Quit</Button>
          {!showAnswer ? (
            <Button onClick={() => setShowAnswer(true)} disabled={selectedOption === null}>
              Check Answer
            </Button>
          ) : (
            <Button onClick={handleNextQuiz} className="gap-2">
              {currentIndex < quizQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'} <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </>
    )
  }

  const renderPracticeContent = () => {
    const question = practiceQuestions[practiceIndex]
    if (!question) return (
      <div className="p-6 text-center text-muted-foreground flex-1 flex items-center justify-center">
        No practice questions available.
      </div>
    )

    return (
      <>
        <div className="p-6 border-b border-border flex items-center justify-between shrink-0">
          <h3 className="font-semibold text-lg">Practice {practiceIndex + 1} of {practiceQuestions.length}</h3>
          <div className="flex gap-1">
            {practiceQuestions.map((_, i) => (
              <div key={i} className={`h-2 w-8 rounded-full ${i < practiceIndex ? 'bg-primary' : i === practiceIndex ? 'bg-primary/50' : 'bg-secondary'}`} />
            ))}
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          <h2 className="text-xl font-medium mb-6">{question.question}</h2>
          
          <div className="space-y-4">
            <Textarea 
              value={shortAnswerText}
              onChange={(e) => setShortAnswerText(e.target.value)}
              placeholder="Type your answer here... (min 5 words)"
              className="min-h-[150px] resize-none text-base"
              disabled={!!evaluation || isEvaluating}
            />
            
            {!evaluation ? (
              <Button 
                onClick={handleEvaluatePractice} 
                disabled={isEvaluating || shortAnswerText.length < 5}
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
        </div>

        <div className="p-6 border-t border-border flex justify-between shrink-0 bg-card">
          <Button variant="ghost" onClick={onSkip}>Quit</Button>
          {evaluation && practiceIndex < practiceQuestions.length - 1 && (
            <Button onClick={handleNextPractice} className="gap-2">
              Next Practice <ArrowRight className="w-4 h-4" />
            </Button>
          )}
          {evaluation && practiceIndex === practiceQuestions.length - 1 && (
            <Button onClick={() => setActiveTab('quiz')} className="gap-2">
              Back to Quiz <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </>
    )
  }

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        
        {/* Header Tabs */}
        <div className="flex border-b border-border p-2 bg-background/50 rounded-t-xl shrink-0">
          <button
            onClick={() => setActiveTab('quiz')}
            className={cn(
              "flex-1 py-3 text-sm font-semibold rounded-lg transition-all",
              activeTab === 'quiz' ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:bg-secondary/50"
            )}
          >
            Quiz
          </button>
          <button
            onClick={() => setActiveTab('practice')}
            className={cn(
              "flex-1 py-3 text-sm font-semibold rounded-lg transition-all",
              activeTab === 'practice' ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:bg-secondary/50"
            )}
          >
            Practice Questions
          </button>
        </div>

        {activeTab === 'quiz' ? renderQuizContent() : renderPracticeContent()}

      </div>
    </div>
  )
}
