import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { answerCell, hasBingo, newBingoRound, revealCell } from './game.ts'
import { TERMS } from '../data/terms.ts'

describe('Bingo round rules', () => {
  it('creates a nine-cell mystery board', () => {
    assert.equal(newBingoRound(TERMS).cells.length, 9)
  })
  it('keeps early rounds in beginner and junior terms', () => {
    const difficulty = new Set(['Beginner', 'Junior'])
    const round = newBingoRound(TERMS, 3, 'Beginner')
    assert.equal(round.cells.length, 9)
    assert.ok(round.cells.every(cell => difficulty.has(TERMS.find(term => term.id === cell.termId).termDifficulty)))
  })
  it('wins on a completed row', () => {
    const cells = Array.from({ length: 9 }, (_, i) => ({ termId: `${i}`, status: i < 3 ? 'correct' : 'covered' }))
    assert.equal(hasBingo(cells), true)
  })
  it('only answers a revealed covered cell', () => {
    const round = newBingoRound(TERMS)
    assert.equal(revealCell(round, 0).activeCell, 0)
    assert.equal(revealCell({ ...round, activeCell: 1 }, 0).activeCell, 1)
    assert.equal(answerCell({ ...round, activeCell: 0 }, true).cells[0].status, 'correct')
  })
  it('ends the round after three misses', () => {
    let round = newBingoRound(TERMS)
    for (let i = 0; i < 3; i += 1) {
      round = revealCell(round, i)
      round = answerCell(round, false)
    }
    assert.equal(round.finished, true)
    assert.equal(round.won, false)
  })
})
