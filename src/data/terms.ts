import vocabulary from './vocabulary.json' with { type: 'json' }
import type { AnswerDepth, CurriculumStatus, LearningLevel, TermDifficulty, TrailDifficulty, VocabularyTerm } from '../domain/types.ts'

export const ANSWER_DEPTH_KEYS = ['recognizePlace', 'responsibility', 'result', 'explain', 'apply'] as const
export type SourceAnswerDepth = typeof ANSWER_DEPTH_KEYS[number]

const depthMap: Record<SourceAnswerDepth, AnswerDepth> = {
  recognizePlace: 'recognize',
  responsibility: 'responsibility',
  result: 'result',
  explain: 'explain',
  apply: 'apply',
}

export const CATEGORIES = ['All', ...vocabulary.categoryOrder.map(item => item.category)] as const
export type TermCategory = typeof CATEGORIES[number]

export const LEARNING_PROGRESSION = vocabulary.learningProgression
export const RESEARCH_REFERENCES = vocabulary.researchReferences as { id: string; label: string; url: string }[]

type SourceAnswer = { prompt: string; expected?: string; expectedConcept?: string; keyConcepts?: string[] }
type SourceRecord = Omit<VocabularyTerm, 'answerLevels' | 'termDifficulty' | 'category' | 'additionalCategories'> & {
  category: string
  additionalCategories: string[]
  termDifficulty: TermDifficulty
  learningLevel: LearningLevel | null
  curriculumStatus: CurriculumStatus
  learningSequence: number | null
  prerequisiteTermIds: string[]
  trailStopId?: string | null
  trailStop?: string | null
  trailDifficulty?: TrailDifficulty | null
  difficulty?: TrailDifficulty | null
  answerLevels: Record<SourceAnswerDepth, SourceAnswer>
}

const records = vocabulary.records as unknown as SourceRecord[]

export const TERMS: VocabularyTerm[] = records.map(record => {
  const answerLevels = Object.fromEntries(ANSWER_DEPTH_KEYS.map(sourceDepth => {
    const answer = record.answerLevels[sourceDepth]
    const expected = answer.expected ?? answer.expectedConcept ?? ''
    return [depthMap[sourceDepth], {
      prompt: answer.prompt,
      expectedConcepts: Array.isArray(answer.keyConcepts) ? answer.keyConcepts : [expected],
    }]
  })) as VocabularyTerm['answerLevels']

  return {
    id: record.id,
    term: record.term,
    aliases: record.aliases,
    category: record.category,
    additionalCategories: record.additionalCategories,
    termDifficulty: record.termDifficulty,
    learningLevel: record.learningLevel,
    curriculumStatus: record.curriculumStatus,
    learningSequence: record.learningSequence,
    prerequisiteTermIds: record.prerequisiteTermIds,
    trailStopId: record.trailStopId,
    trailStop: record.trailStop,
    trailDifficulty: record.trailDifficulty,
    difficulty: record.difficulty,
    plainMeaning: record.plainMeaning,
    responsibility: record.responsibility,
    result: record.result,
    keyConcepts: record.keyConcepts,
    example: record.example,
    relatedTerms: record.relatedTerms,
    sourceRefs: record.sourceRefs,
    scenario: record.scenario,
    answerLevels,
    youtubeEpisode: record.youtubeEpisode ?? undefined,
    covered: record.covered,
    active: record.active,
  }
})
