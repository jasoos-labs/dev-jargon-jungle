import type { JudgeResult, VocabularyTerm } from './types.ts'

const normalize = (value: string) => value.toLowerCase().normalize('NFKD').replace(/[’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim()

export function judgeAnswer(term: VocabularyTerm, answer: string, depth: number): JudgeResult {
  const clean = normalize(answer)
  if (!clean) return { result: 'incorrect', score: 0, explanation: `The term is ${term.term}. ${term.plainMeaning}` }

  const accepted = [term.term, ...term.aliases].map(normalize)
  const matchedName = accepted.some(name => name && (` ${clean} `).includes(` ${name} `))
  if (matchedName) return { result: 'correct', score: 1, explanation: term.plainMeaning }

  const depthKey = ['recognize', 'responsibility', 'result', 'explain', 'apply'][Math.max(0, Math.min(4, depth - 1))] as keyof VocabularyTerm['answerLevels']
  const concepts = term.answerLevels[depthKey].expectedConcepts.length ? term.answerLevels[depthKey].expectedConcepts : term.keyConcepts
  const matched = concepts.filter(concept => normalize(concept).split(' ').every(token => (` ${clean} `).includes(` ${token} `)))
  const score = concepts.length ? matched.length / concepts.length : 0
  if (score >= 0.67) return { result: 'correct', score, explanation: term.plainMeaning }
  if (score > 0) return { result: 'partial', score, explanation: `You have part of it. ${term.plainMeaning}` }
  return { result: 'incorrect', score, explanation: `The term is ${term.term}. ${term.plainMeaning}` }
}
