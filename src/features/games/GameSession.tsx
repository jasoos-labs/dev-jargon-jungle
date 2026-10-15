import { useMemo, useState } from 'react'
import { ANSWER_DEPTHS } from '../../domain/types'
import { recordAnswer, recordGame } from '../../domain/progress'
import type { LocalProgress, VocabularyTerm } from '../../domain/types'
import type { GameMode } from './GameHub'

const titles: Record<Exclude<GameMode,'bingo'>, string> = { survival:'Survival Camp', match:'Match Pieces', jeopardy:'Jeopardy Lookout', scenario:'Scenario Safari' }
const shuffle = <T,>(items: T[]) => {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[other]] = [result[other], result[index]]
  }
  return result
}

export function GameSession({ mode, progress, terms, challengeDepth, onProgress, onExit }: { mode: Exclude<GameMode,'bingo'>; progress: LocalProgress; terms: VocabularyTerm[]; challengeDepth: number; onProgress: (value: LocalProgress) => void; onExit: () => void }) {
  const round = useMemo(() => shuffle(terms).slice(0, 5), [mode, terms])
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const term = round[index]
  const options = useMemo(() => term ? shuffle([term, ...shuffle(terms.filter(item => item.id !== term.id && item.category === term.category)).slice(0,3)]) : [], [term?.id, terms])
  if (terms.length < 2) return <section className="feature-page"><h1>Reach another trail stop</h1><p>Games unlock as more vocabulary becomes available on your journey. Your learned terms remain safe.</p><button className="button-primary" onClick={onExit}>Back to games</button></section>
  if (!term) return <section className="feature-page"><h1>Trail complete!</h1><p>You scored {score} points.</p><button className="button-primary" onClick={onExit}>Back to games</button></section>
  const finish = (correct: boolean) => {
    onProgress(recordAnswer(progress, term.id, correct ? 'correct' : 'incorrect', challengeDepth))
    setScore(value => value + (correct ? 100 : 0))
    setFeedback(correct ? 'Correct! Another term in your pack.' : `Good try. The answer is ${term.term}.`)
    setSelected(correct ? term.id : 'wrong')
  }
  const next = () => {
    if (mode === 'match' || index + 1 >= round.length) {
      const winThreshold = mode === 'match' ? 100 : Math.ceil(round.length * 0.6) * 100
      onProgress(recordGame(progress, score >= winThreshold))
      setIndex(round.length)
    } else { setIndex(value => value + 1); setFeedback(''); setSelected(null) }
  }
  const answerQuestion = (choice: VocabularyTerm) => { if (!selected) finish(choice.id === term.id) }
  const headline = titles[mode]
  const depthKey = ANSWER_DEPTHS[Math.max(0, challengeDepth - 1)]
  return <section className="feature-page game-session"><div className="game-session-top"><button className="back-link" onClick={onExit}>← Game trail</button><span>{headline} · {index + 1} / {round.length}</span><b>{score} pts</b></div><h1>{headline}</h1>
    {mode === 'survival' ? <Survival key={term.id} term={term} onGuess={finish} locked={Boolean(selected)} /> : mode === 'match' ? <Matching terms={round} onAnswer={finish} /> : <div className="question-panel"><span className="eyebrow">{mode === 'jeopardy' ? `${term.category} · ${100 + index * 100} POINTS` : mode === 'scenario' ? 'WHAT IS HAPPENING?' : `${depthKey.toUpperCase()} CHALLENGE`}</span><h2>{mode === 'scenario' ? term.scenario : mode === 'jeopardy' ? term.plainMeaning : term.answerLevels[depthKey].prompt}</h2><div className="answer-options">{options.map(option => <button key={option.id} disabled={Boolean(selected)} className={selected === option.id ? (option.id === term.id ? 'answer-right' : 'answer-wrong') : ''} onClick={() => answerQuestion(option)}>{option.term}</button>)}</div></div>}
    {feedback && <div className="game-feedback"><span>{feedback}</span><button onClick={next}>{index + 1 === round.length ? 'Finish round' : 'Next clue →'}</button></div>}
  </section>
}

function Survival({ term, onGuess, locked }: { term: VocabularyTerm; onGuess: (correct: boolean) => void; locked: boolean }) {
  const answer = term.term.toUpperCase().replace(/[^A-Z0-9]/g, '')
  const [guesses, setGuesses] = useState<string[]>([])
  const [mistakes, setMistakes] = useState(0)
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  const guess = (letter: string) => {
    if (locked || guesses.includes(letter)) return
    const next = [...guesses, letter]; setGuesses(next)
    if (!answer.includes(letter)) setMistakes(value => value + 1)
    if ([...new Set(answer.split(''))].every(char => next.includes(char))) onGuess(true)
    else if (mistakes >= 5 && !answer.includes(letter)) onGuess(false)
  }
  return <div className="question-panel survival-panel"><span className="eyebrow">CLUE</span><h2>{term.plainMeaning}</h2><div className="letter-slots">{answer.split('').map((letter, i) => <span key={i}>{letter === ' ' ? ' ' : guesses.includes(letter) || locked ? letter : '_'}</span>)}</div><p>{6 - mistakes} tries left</p><div className="letter-board">{letters.map(letter => <button key={letter} disabled={locked || guesses.includes(letter)} onClick={() => guess(letter)}>{letter}</button>)}</div></div>
}

function Matching({ terms, onAnswer }: { terms: VocabularyTerm[]; onAnswer: (correct: boolean) => void }) {
  const [chosen, setChosen] = useState<string | null>(null)
  const [matched, setMatched] = useState<string[]>([])
  const defs = useMemo(() => shuffle(terms), [terms])
  const pickMeaning = (id: string) => {
    if (!chosen || matched.includes(id)) return
    const right = chosen === id
    if (right) {
      const next = [...matched, id]; setMatched(next); setChosen(null)
      if (next.length === terms.length) onAnswer(true)
    } else { setChosen(null); onAnswer(false) }
  }
  return <div className="question-panel matching-panel"><span className="eyebrow">SELECT A TERM, THEN ITS MEANING</span><div className="match-columns"><div>{terms.map(item => <button key={item.id} className={matched.includes(item.id) ? 'matched-piece' : chosen === item.id ? 'picked-piece' : ''} disabled={matched.includes(item.id)} onClick={() => setChosen(item.id)}>{item.term}</button>)}</div><div>{defs.map(item => <button key={item.id} className={matched.includes(item.id) ? 'matched-piece' : ''} disabled={matched.includes(item.id)} onClick={() => pickMeaning(item.id)}>{item.plainMeaning}</button>)}</div></div>{matched.length === terms.length && <p className="match-done">All pairs matched!</p>}</div>
}
