import { TERMS } from '../data/terms'
import type { LocalProgress, TrailDifficulty, VocabularyTerm } from './types'

export const TRAIL_STOPS = [
  { id: 'kathmandu', name: 'Kathmandu', place: 'Start · city streets', symbol: '⌂' },
  { id: 'foothills', name: 'The Foothills', place: 'First ascent', symbol: '⌁' },
  { id: 'namche', name: 'Namche Bazaar', place: 'Market town', symbol: '⌖' },
  { id: 'tengboche', name: 'Tengboche', place: 'Monastery ridge', symbol: '◇' },
  { id: 'dingboche', name: 'Dingboche', place: 'High valley', symbol: '△' },
  { id: 'lobuche', name: 'Lobuche', place: 'Mountain camp', symbol: '✦' },
  { id: 'base-camp', name: 'Everest Base Camp', place: 'Khumbu Glacier', symbol: '⚑' },
  { id: 'summit', name: 'Summit Challenge', place: 'Your final climb', symbol: '▲' },
] as const

export const DIFFICULTIES: { id: TrailDifficulty; name: string; detail: string; challengeDepth: number }[] = [
  { id: 'easy', name: 'Easy Trek', detail: 'Foundation terms · recognize', challengeDepth: 1 },
  { id: 'trail', name: 'Trail Trek', detail: 'Foundation + developing · explain', challengeDepth: 3 },
  { id: 'summit', name: 'Summit Trek', detail: 'All routed terms · apply', challengeDepth: 5 },
]

type RoutedTerm = VocabularyTerm & { trailStopId?: string | null; trailStop?: string | null; trailDifficulty?: TrailDifficulty | null; difficulty?: TrailDifficulty | null }

function stopIndex(term: RoutedTerm, sortedCore: RoutedTerm[]): number {
  const routeLabel = term.trailStopId ?? term.trailStop
  const normalizedLabel = routeLabel?.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const assigned = normalizedLabel ? TRAIL_STOPS.findIndex(stop => stop.id === normalizedLabel || stop.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === normalizedLabel) : -1
  if (assigned >= 0) return assigned
  const sequencePosition = Math.max(0, sortedCore.indexOf(term))
  return Math.min(TRAIL_STOPS.length - 1, Math.floor(sequencePosition / 4))
}

function hasAssignedStop(term: RoutedTerm): boolean {
  const label = (term.trailStopId ?? term.trailStop)?.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return Boolean(label && TRAIL_STOPS.some(stop => stop.id === label || stop.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === label))
}

function trailPool(): { candidates: RoutedTerm[]; fallbackCore: RoutedTerm[] } {
  const all = TERMS as RoutedTerm[]
  const fallbackCore = all.filter(term => term.active && term.curriculumStatus === 'core' && term.learningSequence !== null)
    .sort((a, b) => (a.learningSequence ?? 0) - (b.learningSequence ?? 0))
  const coreIds = new Set(fallbackCore.map(term => term.id))
  const candidates = all.filter(term => term.active && (hasAssignedStop(term) || coreIds.has(term.id)))
  return { candidates, fallbackCore }
}

export function difficultyForTerm(term: RoutedTerm): TrailDifficulty {
  const assigned = String(term.trailDifficulty ?? term.difficulty ?? '').toLowerCase()
  if (assigned.includes('summit')) return 'summit'
  if (assigned.includes('trail')) return 'trail'
  if (assigned.includes('easy')) return 'easy'
  if (term.learningLevel === 'advanced') return 'summit'
  if (term.learningLevel === 'developing') return 'trail'
  return 'easy'
}

export function termsForJourney(progress: LocalProgress, reachedOnly = true): VocabularyTerm[] {
  const { candidates, fallbackCore } = trailPool()
  const reachedStop = Math.max(0, Math.min(TRAIL_STOPS.length - 1, progress.journey?.reachedStop ?? 0))
  const selectedDifficulty = progress.journey?.difficulty ?? 'easy'
  const availableDifficulty = selectedDifficulty === 'easy' ? ['easy'] : selectedDifficulty === 'trail' ? ['easy', 'trail'] : ['easy', 'trail', 'summit']
  return candidates.filter(term => {
    const eligible = availableDifficulty.includes(difficultyForTerm(term))
    return eligible && (!reachedOnly || stopIndex(term, fallbackCore) <= reachedStop)
  })
}

export function termsAtStop(progress: LocalProgress, stop: number): VocabularyTerm[] {
  const { candidates, fallbackCore } = trailPool()
  const allowed = new Set(termsForJourney({ ...progress, journey: { ...progress.journey, reachedStop: TRAIL_STOPS.length - 1 } }, false).map(term => term.id))
  return candidates.filter(term => allowed.has(term.id) && stopIndex(term, fallbackCore) === stop)
}

export function requiredChallengeDepth(difficulty: TrailDifficulty): number {
  return DIFFICULTIES.find(item => item.id === difficulty)?.challengeDepth ?? 1
}
