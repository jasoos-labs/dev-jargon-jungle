import { useMemo, useState } from 'react'
import type { VocabularyTerm } from '../domain/types'
import { answerCell, newBingoRound, revealCell } from '../domain/game'
import { judgeAnswer } from '../domain/judge'
import { chooseLine, playTone, speakLine } from '../domain/feedback'
import { speechRecognitionAvailable, startSpeechInput } from '../domain/speech'
import { learnerLevel, recordAnswer, recordGame } from '../domain/progress'
import type { AppSettings, BingoRound, LocalProgress } from '../domain/types'

interface Props { progress: LocalProgress; terms: VocabularyTerm[]; challengeDepth: number; settings: AppSettings; onProgress: (next: LocalProgress) => void; onExit: () => void }

export function BingoGame({ progress, terms, challengeDepth, settings, onProgress, onExit }: Props) {
  const boardSize = Math.min(3, Math.floor(Math.sqrt(terms.length)))
  const [round, setRound] = useState(() => newBingoRound(terms, boardSize, learnerLevel(progress)))
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState('Pick a number. A workplace situation is hiding underneath.')
  const [result, setResult] = useState<'correct' | 'partial' | 'incorrect' | null>(null)
  const [listening, setListening] = useState(false)
  const activeTerm = useMemo(() => terms.find(term => term.id === round.cells[round.activeCell ?? -1]?.termId), [round, terms])
  const missedCount = round.cells.filter(cell => cell.status === 'missed').length
  const startOver = () => { setRound(newBingoRound(terms, boardSize, learnerLevel(progress))); setAnswer(''); setResult(null); setFeedback('Pick a number. A workplace situation is hiding underneath.') }

  const chooseCell = (index: number) => {
    if (round.cells[index].status !== 'covered' || round.finished) return
    setRound(current => revealCell(current, index))
    setAnswer(''); setResult(null)
    const term = terms.find(item => item.id === round.cells[index].termId)
    setFeedback(term ? 'Name the term that fits. Type it, or use the mic if your browser supports it.' : '')
  }

  const submit = () => {
    if (!activeTerm || !answer.trim()) return
    const judged = judgeAnswer(activeTerm, answer, challengeDepth)
    const correct = judged.result === 'correct'
    let nextProgress = progress
    nextProgress = recordAnswer(progress, activeTerm.id, judged.result, challengeDepth)
    const nextRound: BingoRound = answerCell(round, correct, boardSize)
    if (nextRound.finished) nextProgress = recordGame(nextProgress, nextRound.won)
    onProgress(nextProgress)
    setRound(nextRound)
    setResult(judged.result)
    const line = nextRound.finished && nextRound.won ? 'BINGO! Corporate lingo: handled.' : chooseLine(settings, correct, nextProgress.currentStreak)
    playTone(settings, correct)
    speakLine(settings, line)
    setFeedback(`${line} ${judged.explanation}${nextRound.finished && !nextRound.won ? ' Three misses. Round over.' : ''}`)
    setAnswer('')
  }

  const useMic = () => {
    setListening(true)
    const recognition = startSpeechInput(text => setAnswer(text), () => setListening(false))
    if (!recognition) setListening(false)
  }

  if (terms.length < 4) return <section className="feature-page"><h1>Reach four trail terms</h1><p>Bingo opens when at least four terms have been reached. The trail glossary remains available at every stage.</p><button className="button-primary" onClick={onExit}>Back to games</button></section>
  return <section className="game-shell">
    <div className="game-top"><button className="text-button" onClick={onExit}>← Game trail</button><span className="eyebrow">MYSTERY BOARD · SOLO</span><span className="miss-count">Misses <b>{missedCount}/3</b></span></div>
    <div className="game-heading"><div><p className="eyebrow">JARGON JUNGLE BINGO</p><h1>Pick a trail marker.<br /><em>Name the jargon.</em></h1></div><p className="game-note">Get a row to win.<br />Three misses ends the round.</p></div>
    <div className="bingo-grid" style={{ gridTemplateColumns: `repeat(${boardSize}, 1fr)` }} aria-label="Bingo mystery board">
      {round.cells.map((cell, index) => <button key={`${cell.termId}-${index}`} className={`bingo-cell ${cell.status}`} disabled={cell.status !== 'covered' || round.finished || round.activeCell !== null} onClick={() => chooseCell(index)} aria-label={`Square ${index + 1}${cell.status !== 'covered' ? `, ${cell.status}` : ''}`}>
        {cell.status === 'covered' ? <><span>{String(index + 1).padStart(2, '0')}</span><small>tap to reveal</small></> : <span className="cell-status">{cell.status === 'correct' ? '✓' : '×'}</span>}
      </button>)}
    </div>
    <div className={`answer-card ${result ? `answer-${result}` : ''}`}>
      {activeTerm ? <>
        <div className="scenario-label"><span className="category-pill">{activeTerm.category}</span><span className="eyebrow">SITUATION</span></div>
        <p className="scenario-text">“{activeTerm.scenario}”</p>
        <label className="answer-label" htmlFor="bingo-answer">Your answer</label>
        <div className="answer-row"><input id="bingo-answer" value={answer} onChange={event => setAnswer(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') submit() }} placeholder="Type the term…" autoComplete="off" />{speechRecognitionAvailable() && <button className={`mic-button ${listening ? 'listening' : ''}`} onClick={useMic} aria-label="Speak your answer">{listening ? '●' : '🎙'}</button>}<button className="submit-button" onClick={submit} disabled={!answer.trim()}>Check</button></div>
      </> : <p className="feedback-line" aria-live="polite">{feedback}</p>}
      {activeTerm && <p className="feedback-line inline-feedback" aria-live="polite">{feedback}</p>}
      {round.finished && <div className="round-finish"><strong>{round.won ? 'That’s a bingo!' : 'Round complete.'}</strong><button className="submit-button" onClick={startOver}>Play again</button></div>}
    </div>
  </section>
}
