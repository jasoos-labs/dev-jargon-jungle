import { useMemo, useState } from 'react'
import { ANSWER_DEPTHS } from '../../domain/types'
import { recordAnswer } from '../../domain/progress'
import { DIFFICULTIES, requiredChallengeDepth, termsAtStop, termsForJourney, TRAIL_STOPS } from '../../domain/trail'
import type { LocalProgress, TrailDifficulty } from '../../domain/types'

const journeys = [
  { title: 'A new route opens', story: 'A teammate offers two ways to move forward: take the marked trail and learn steadily, or pause at camp to review the terms you have met.', choices: ['Follow the marked trail', 'Take a review detour'] },
  { title: 'Weather at the ridge', story: 'Clouds roll across the ridge. The guide suggests a short camp before the next climb. Your learned terms stay safe either way.', choices: ['Camp and continue', 'Review the trail so far'] },
  { title: 'A fork in the path', story: 'The group reaches a fork. One path leads onward; a small loop revisits familiar ground before climbing again.', choices: ['Take the direct path', 'Take the review loop'] },
  { title: 'High-altitude camp', story: 'The team checks its notes, rests, and chooses a pace for the next section. Nothing you have learned can be lost here.', choices: ['Rest at camp', 'Review difficult terms'] },
]

export function FlashcardTrail({ progress, onProgress }: { progress: LocalProgress; onProgress: (progress: LocalProgress) => void }) {
  const reached = Math.max(0, Math.min(TRAIL_STOPS.length - 1, progress.journey?.reachedStop ?? 0))
  const difficulty = progress.journey?.difficulty ?? 'easy'
  const [selectedStop, setSelectedStop] = useState(reached)
  const [position, setPosition] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [reviewDetour, setReviewDetour] = useState(false)
  const [event, setEvent] = useState<{ title: string; story: string; choices: string[]; nextStop: number } | null>(null)
  const allCards = useMemo(() => termsAtStop(progress, selectedStop), [progress.journey?.difficulty, selectedStop])
  const historyCards = useMemo(() => termsForJourney({ ...progress, journey: { ...progress.journey, reachedStop: selectedStop } }, true), [progress.journey?.difficulty, progress.journey?.reachedStop, selectedStop])
  const cards = reviewDetour ? historyCards.filter(term => (progress.terms[term.id]?.attempts ?? 0) > 0) : allCards
  const term = cards[position % Math.max(1, cards.length)]
  const challengeDepth = requiredChallengeDepth(difficulty)
  const depthName = ANSWER_DEPTHS[Math.max(0, challengeDepth - 1)]
  const stop = TRAIL_STOPS[selectedStop]
  const mastered = Object.values(progress.terms).filter(item => item.known).length
  const advance = () => {
    if (selectedStop >= TRAIL_STOPS.length - 1) return
    const story = journeys[selectedStop % journeys.length]
    setEvent({ ...story, nextStop: selectedStop + 1 })
  }
  const chooseEvent = (choiceIndex: number) => {
    if (!event) return
    const isReview = choiceIndex === 1
    const nextStop = event.nextStop
    onProgress({ ...progress, journey: { ...progress.journey, reachedStop: Math.max(reached, nextStop), reviewedEvents: [...new Set([...progress.journey.reviewedEvents, `stop-${selectedStop}`])] } })
    setSelectedStop(nextStop); setPosition(0); setRevealed(false); setReviewDetour(isReview); setEvent(null)
  }
  const next = (answer: 'correct' | 'incorrect') => {
    onProgress(recordAnswer(progress, term.id, answer, challengeDepth))
    setRevealed(false)
    setPosition(value => (value + 1) % cards.length)
  }
  if (event) return <section className="feature-page event-page"><span className="eyebrow">JOURNEY EVENT · CAMP DECISION</span><div className="event-card"><span className="event-symbol">⌁</span><h1>{event.title}</h1><p>{event.story}</p><div className="event-choices">{event.choices.map((choice, index) => <button className={index === 0 ? 'button-primary' : 'button-secondary light-button'} key={choice} onClick={() => chooseEvent(index)}>{choice} <span>→</span></button>)}</div></div><p className="setback-note">A wrong answer is only a cue to practice. Your learned terms and trail progress are kept.</p></section>
  return <section className="feature-page flashcard-page">
    <div className="feature-heading"><div><span className="eyebrow">DEV TALK TRAIL · NEPAL TO EVEREST</span><h1>Flashcard <em>Trail</em></h1><p>Reach each stop, learn its terms, then choose the next camp.</p></div><div className="trail-count"><b>{mastered}</b><span>terms met</span></div></div>
    <div className="trail-route-panel"><div className="trail-route-photo" style={{ backgroundImage: `linear-gradient(90deg,#18382fe8,#18382fc9 57%,#18382f68),url("${import.meta.env.BASE_URL}everest-base-camp.jpg")` }}/><div className="trail-route-content"><div className="route-map-top"><span>YOUR JOURNEY</span><b>{stop.name} · {reached + 1}/{TRAIL_STOPS.length}</b></div><div className="trail-stop-grid">{TRAIL_STOPS.map((item, index) => <button key={item.id} disabled={index > reached} className={`trail-stop-node ${index === selectedStop ? 'selected' : ''} ${index <= reached ? 'reached' : 'locked'}`} onClick={() => { setSelectedStop(index); setPosition(0); setRevealed(false); setReviewDetour(false) }}><span>{index < reached ? '✓' : item.symbol}</span><b>{item.name}</b></button>)}</div><span className="image-credit">Photo by <a href="https://commons.wikimedia.org/wiki/File:Everest_Base_Camp.jpg" target="_blank" rel="noreferrer">Tom Simcock</a> · <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noreferrer">CC BY-SA 3.0</a> · resized</span></div></div>
    <div className="trail-level-row"><span className="eyebrow">CURRENT CLIMB</span><div className="difficulty-options compact">{DIFFICULTIES.map(item => <button key={item.id} className={difficulty === item.id ? 'difficulty-option selected' : 'difficulty-option'} onClick={() => { const nextDifficulty = item.id as TrailDifficulty; onProgress({ ...progress, journey: { ...progress.journey, difficulty: nextDifficulty } }); setPosition(0); setRevealed(false); setReviewDetour(false) }} aria-pressed={difficulty === item.id}><b>{item.name}</b><span>{item.detail}</span></button>)}</div></div>
    <div className="trail-controls"><span>{stop.place} · {cards.length} terms at this stop</span><button className={reviewDetour ? 'detour-toggle active' : 'detour-toggle'} onClick={() => { setReviewDetour(value => !value); setPosition(0); setRevealed(false) }}>{reviewDetour ? 'Return to trail cards' : '↶ Review detour'}</button><span>Card {cards.length ? position + 1 : 0} of {cards.length}</span></div>
    {!term ? <div className="empty-stop"><h2>{reviewDetour ? 'Detour complete' : 'This stop is being mapped'}</h2><p>{reviewDetour ? 'No earlier misses here. Your learned terms remain recorded.' : 'Vocabulary will appear here as the trail assignments arrive. The full glossary remains searchable.'}</p>{reviewDetour && <button className="button-secondary light-button" onClick={() => setReviewDetour(false)}>Back to current stop</button>}</div> : <>
      <button className={`study-card ${revealed ? 'revealed' : ''}`} onClick={() => setRevealed(value => !value)} aria-label={revealed ? 'Show term side' : 'Reveal definition'}>
        {!revealed ? <><span className="card-meta">{stop.name} · {term.category} · {difficulty.toUpperCase()} TREK</span><strong>{term.term}</strong>{term.aliases.length > 0 && <span className="term-alias">Also called: {term.aliases.join(', ')}</span>}<p className="think-prompt">{term.answerLevels[depthName].prompt}</p><small>Think first, then tap to turn the card ↻</small></> : <><span className="card-meta">PLAIN MEANING · {depthName.toUpperCase()}</span><strong className="meaning-text">{term.plainMeaning}</strong><p><b>Its job:</b> {term.responsibility}</p><p><b>Result:</b> {term.result}</p><p><b>Example:</b> {term.example}</p><p className="scenario-prompt"><b>Try it:</b> {term.answerLevels.apply.prompt} <span>{term.scenario}</span></p></>}
      </button>
      {revealed && <div className="study-actions"><button onClick={() => next('incorrect')}>↻ Practice again</button><button className="action-solid" onClick={() => next('correct')}>✓ I know this one</button></div>}
      <div className="trail-progress"><span style={{ width:`${Math.round((position + 1) / cards.length * 100)}%` }}/></div>
      <button className="skip-link" onClick={() => { setRevealed(false); setPosition(value => (value + 1) % cards.length) }}>Skip this term →</button>
    </>}
    <section className="trail-camp"><div><span className="eyebrow">CAMP {String(selectedStop + 1).padStart(2, '0')}</span><h2>{stop.name} camp</h2><p>Review here as long as you like. Moving on never removes learned terms or progress.</p></div>{selectedStop < TRAIL_STOPS.length - 1 && <button className="button-primary" onClick={advance}>Make camp & continue <span>↗</span></button>}</section>
  </section>
}
