import { useState } from 'react'
import { TERMS } from '../../data/terms'
import type { LocalProgress } from '../../domain/types'

export function ProgressPage({ progress, level, onReset }: { progress: LocalProgress; level: string; onReset: () => void }) {
  const [confirm, setConfirm] = useState(false)
  const known = Object.values(progress.terms).filter(term => term.known).length
  const percent = Math.min(100, Math.round(known / Math.max(1, TERMS.length) * 100))
  return <section className="feature-page progress-page"><div className="feature-heading"><div><span className="eyebrow">YOUR JOURNEY, ON THIS DEVICE</span><h1>Progress <em>path</em></h1><p>Local profiles only. No server accounts or cloud sync.</p></div><div className="level-medallion">✦<b>{level}</b></div></div><div className="progress-feature-card"><span className="eyebrow">TERMS MET</span><strong>{known}<small> / {TERMS.length}</small></strong><div className="progress-track"><span style={{ width:`${percent}%` }}/></div><p>{percent}% of the glossary explored</p></div><div className="progress-stat-row"><div><b>{progress.gamesPlayed}</b><span>game rounds</span></div><div><b>{progress.gamesWon}</b><span>rounds won</span></div><div><b>{progress.bestStreak}</b><span>best correct streak</span></div></div><div className="privacy-box"><span>▣</span><p><b>Your profile is encrypted on this device.</b><br/>Progress is protected with your profile password. Clearing browser data erases it; a forgotten password cannot be recovered.</p></div><div className="reset-progress">{confirm ? <><span>Reset all saved progress?</span><button onClick={() => setConfirm(false)}>Cancel</button><button className="danger-action" onClick={onReset}>Reset</button></> : <><span>Want to start over?</span><button onClick={() => setConfirm(true)}>Reset progress</button></>}</div></section>
}
