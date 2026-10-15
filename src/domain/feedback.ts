import type { AppSettings } from './types'

export const LINES = {
  correct: {
    Coach: ['Nice work. You spotted the team signal.','Good read. Keep that confidence steady.'],
    Teacher: ['Correct. You connected the situation to the term.','That is it. The term fits this workplace moment.'],
    Bestie: ['Look at you. Corporate material already.','Okay, vocabulary glow-up!'],
    Savage: ['Correct. LinkedIn may hear about this.','Right answer. We will alert the architecture committee.'],
  },
  incorrect: {
    Coach: ['Good try. Now you have a useful clue for next time.','Missed this one. Keep the meaning; let the wording go.'],
    Teacher: ['Not quite. Read the plain meaning and keep moving.','A miss is useful feedback. The answer is just ahead.'],
    Bestie: ['We have all been there. This one is a merge conflict.','No stress. Corporate has invented 900 words for normal things.'],
    Savage: ['Excellent confidence. Completely wrong, but excellent confidence.','Bold answer. The glossary respectfully disagrees.'],
  },
} as const

export function chooseLine(settings: AppSettings, correct: boolean, streak: number): string {
  if (settings.personality === 'Off') return correct ? 'Correct!' : 'Not quite.'
  if (correct && streak >= 3) return 'Three in a row. Somebody update LinkedIn.'
  const lines = LINES[correct ? 'correct' : 'incorrect'][settings.personality]
  return lines[Math.floor(Math.random() * lines.length)]
}

export function playTone(settings: AppSettings, correct: boolean): void {
  if (!settings.soundEffects || typeof window === 'undefined') return
  const Audio = window.AudioContext
  if (!Audio) return
  const context = new Audio()
  const now = context.currentTime
  const notes = correct ? [523, 659, 784] : [260, 220]
  notes.forEach((frequency, index) => {
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.value = frequency
    gain.gain.setValueAtTime(0.0001, now + index * 0.11)
    gain.gain.exponentialRampToValueAtTime(0.12, now + index * 0.11 + 0.025)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.11 + 0.22)
    oscillator.connect(gain).connect(context.destination)
    oscillator.start(now + index * 0.11)
    oscillator.stop(now + index * 0.11 + 0.23)
  })
  window.setTimeout(() => void context.close(), 1200)
}

export function speakLine(settings: AppSettings, line: string): void {
  if (!settings.voice || !('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(line)
  utterance.rate = 1.04
  window.speechSynthesis.speak(utterance)
}
