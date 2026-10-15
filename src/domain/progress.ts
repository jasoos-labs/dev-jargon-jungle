import type { AppSettings, LearnerLevel, LocalProgress, TermProgress } from './types.ts'

export const PROGRESS_KEY = 'dev-lingo.progress.v1'
export const SETTINGS_KEY = 'dev-lingo.settings.v1'

export const EMPTY_PROGRESS: LocalProgress = {
  schemaVersion: 1, terms: {}, gamesPlayed: 0, gamesWon: 0, currentStreak: 0, bestStreak: 0,
  journey: { difficulty: 'easy', reachedStop: 0, reviewedEvents: [] },
}

export function createEmptyProgress(): LocalProgress { return structuredClone(EMPTY_PROGRESS) }

export function normalizeProgress(saved: Partial<LocalProgress> | null | undefined): LocalProgress {
  if (!saved || saved.schemaVersion !== 1 || typeof saved.terms !== 'object' || !saved.terms) return createEmptyProgress()
  return {
    ...createEmptyProgress(), ...saved, terms: saved.terms,
    journey: { ...EMPTY_PROGRESS.journey, ...(saved.journey ?? {}), reviewedEvents: saved.journey?.reviewedEvents ?? [] },
  }
}

export const DEFAULT_SETTINGS: AppSettings = {
  music: false, soundEffects: true, voice: false, animations: true, personality: 'Coach', preset: 'Normal',
}

export function readProgress(): LocalProgress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    if (!raw) return structuredClone(EMPTY_PROGRESS)
    const saved = JSON.parse(raw) as Partial<LocalProgress>
    return normalizeProgress(saved)
  } catch { return structuredClone(EMPTY_PROGRESS) }
}

export function writeProgress(progress: LocalProgress): void {
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress)) } catch { /* current session still works without storage */ }
}

export function readSettings(): AppSettings {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? 'null') as Partial<AppSettings> | null
    return { ...DEFAULT_SETTINGS, ...(saved ?? {}) }
  } catch { return { ...DEFAULT_SETTINGS } }
}

export function writeSettings(settings: AppSettings): void {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)) } catch { /* current session still works without storage */ }
}

export function learnerLevel(progress: LocalProgress): LearnerLevel {
  const known = Object.values(progress.terms).filter(item => item.known).length
  const correct = Object.values(progress.terms).reduce((sum, item) => sum + item.correct, 0)
  const xp = known * 3 + correct
  if (xp >= 150) return 'Dragon'
  if (xp >= 85) return 'Strong Dev'
  if (xp >= 40) return 'Working Dev'
  if (xp >= 12) return 'Developing'
  return 'Beginner'
}

export function termProgress(progress: LocalProgress, id: string): TermProgress {
  return progress.terms[id] ?? { highestAnswerDepth: 0, attempts: 0, correct: 0, incorrect: 0, known: false, streak: 0 }
}

export function recordAnswer(progress: LocalProgress, id: string, result: 'correct' | 'partial' | 'incorrect', depth = 1): LocalProgress {
  const previous = termProgress(progress, id)
  const accepted = result === 'correct'
  const item: TermProgress = {
    ...previous,
    highestAnswerDepth: accepted ? Math.max(previous.highestAnswerDepth, depth) : previous.highestAnswerDepth,
    attempts: previous.attempts + 1,
    correct: previous.correct + (accepted ? 1 : 0),
    incorrect: previous.incorrect + (result === 'incorrect' ? 1 : 0),
    lastResult: result,
    known: accepted ? true : previous.known,
    streak: accepted ? previous.streak + 1 : 0,
    lastSeen: new Date().toISOString(),
  }
  const terms = { ...progress.terms, [id]: item }
  const currentStreak = accepted ? progress.currentStreak + 1 : 0
  return { ...progress, terms, currentStreak, bestStreak: Math.max(progress.bestStreak, currentStreak) }
}

export function recordGame(progress: LocalProgress, won: boolean): LocalProgress {
  return { ...progress, gamesPlayed: progress.gamesPlayed + 1, gamesWon: progress.gamesWon + (won ? 1 : 0) }
}
