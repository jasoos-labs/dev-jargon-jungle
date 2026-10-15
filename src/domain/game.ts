import type { BingoCell, BingoRound, LearnerLevel, VocabularyTerm } from './types.ts'

const allowedDifficulty: Record<LearnerLevel, string[]> = {
  Beginner: ['Beginner', 'Junior'],
  Developing: ['Beginner', 'Junior', 'Working Dev'],
  'Working Dev': ['Junior', 'Working Dev', 'Advanced'],
  'Strong Dev': ['Working Dev', 'Advanced', 'Expert'],
  Dragon: ['Beginner', 'Junior', 'Working Dev', 'Advanced', 'Expert'],
}

export function newBingoRound(terms: VocabularyTerm[], size = 3, level: LearnerLevel = 'Beginner'): BingoRound {
  const active = terms.filter(term => term.active)
  const eligible = active.filter(term => allowedDifficulty[level].includes(term.termDifficulty))
  const pool = eligible.length >= size * size ? eligible : active
  const shuffled = [...pool]
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  const selected = shuffled.slice(0, size * size)
  return { cells: selected.map(term => ({ termId: term.id, status: 'covered' })), activeCell: null, finished: false, won: false }
}

export function hasBingo(cells: BingoCell[], size = 3): boolean {
  const won = (indices: number[]) => indices.every(index => cells[index]?.status === 'correct')
  for (let row = 0; row < size; row += 1) if (won(Array.from({ length: size }, (_, col) => row * size + col))) return true
  for (let col = 0; col < size; col += 1) if (won(Array.from({ length: size }, (_, row) => row * size + col))) return true
  if (won(Array.from({ length: size }, (_, i) => i * size + i))) return true
  return won(Array.from({ length: size }, (_, i) => i * size + size - i - 1))
}

export function revealCell(round: BingoRound, index: number): BingoRound {
  if (round.finished || round.activeCell !== null || round.cells[index]?.status !== 'covered') return round
  return { ...round, activeCell: index }
}

export function answerCell(round: BingoRound, correct: boolean, size = 3): BingoRound {
  if (round.activeCell === null || round.finished) return round
  const cells = round.cells.map((cell, index) => index === round.activeCell ? { ...cell, status: correct ? 'correct' as const : 'missed' as const } : cell)
  const won = hasBingo(cells, size)
  const lost = cells.filter(cell => cell.status === 'missed').length >= 3 || cells.every(cell => cell.status !== 'covered')
  return { cells, activeCell: null, won, finished: won || lost }
}
