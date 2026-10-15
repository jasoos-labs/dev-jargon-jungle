export const ANSWER_DEPTHS = ['recognize', 'responsibility', 'result', 'explain', 'apply'] as const
export type AnswerDepth = typeof ANSWER_DEPTHS[number]
export type TermDifficulty = 'Beginner' | 'Junior' | 'Working Dev' | 'Advanced' | 'Expert'
export type LearnerLevel = 'Beginner' | 'Developing' | 'Working Dev' | 'Strong Dev' | 'Dragon'
export type Category = string
export type LearningLevel = 'foundation' | 'developing' | 'advanced'
export type CurriculumStatus = 'core' | 'extended' | 'reference'
export type TrailDifficulty = 'easy' | 'trail' | 'summit'

export interface VocabularyTerm {
  id: string
  term: string
  aliases: string[]
  category: Category
  additionalCategories?: Category[]
  termDifficulty: TermDifficulty
  learningLevel: LearningLevel | null
  curriculumStatus: CurriculumStatus
  learningSequence: number | null
  prerequisiteTermIds: string[]
  trailStopId?: string | null
  trailStop?: string | null
  trailDifficulty?: TrailDifficulty | null
  difficulty?: TrailDifficulty | null
  plainMeaning: string
  responsibility: string
  result: string
  keyConcepts: string[]
  example: string
  relatedTerms: string[]
  sourceRefs?: string[]
  scenario: string
  answerLevels: Record<AnswerDepth, { prompt: string; expectedConcepts: string[] }>
  youtubeEpisode?: string
  storyIds?: string[]
  covered: boolean
  active: boolean
}

export interface TermProgress {
  highestAnswerDepth: number
  attempts: number
  correct: number
  incorrect: number
  lastResult?: 'correct' | 'partial' | 'incorrect'
  known: boolean
  streak: number
  lastSeen?: string
}

export interface LocalProgress {
  schemaVersion: 1
  terms: Record<string, TermProgress>
  gamesPlayed: number
  gamesWon: number
  currentStreak: number
  bestStreak: number
  journey: { difficulty: TrailDifficulty; reachedStop: number; reviewedEvents: string[] }
}

export type Personality = 'Off' | 'Coach' | 'Teacher' | 'Bestie' | 'Savage'
export type Preset = 'Party' | 'Normal' | 'Quiet' | 'Custom'
export interface AppSettings {
  music: boolean
  soundEffects: boolean
  voice: boolean
  animations: boolean
  personality: Personality
  preset: Preset
}

export type Screen = 'home' | 'play' | 'learn' | 'lookup' | 'level' | 'settings'
export interface BingoCell { termId: string; status: 'covered' | 'correct' | 'missed' }
export interface BingoRound {
  cells: BingoCell[]
  activeCell: number | null
  finished: boolean
  won: boolean
}

export interface JudgeResult {
  result: 'correct' | 'partial' | 'incorrect'
  score: number
  explanation: string
}
