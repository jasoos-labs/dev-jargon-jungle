import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { learnerLevel, recordAnswer, recordGame } from './progress.ts'
import { EMPTY_PROGRESS } from './progress.ts'

describe('local progression', () => {
  it('starts as a beginner and grows from correct answers', () => {
    let progress = structuredClone(EMPTY_PROGRESS)
    assert.equal(learnerLevel(progress), 'Beginner')
    for (let i = 0; i < 5; i += 1) progress = recordAnswer(progress, `term-${i}`, 'correct', 1)
    assert.equal(learnerLevel(progress), 'Developing')
    assert.equal(progress.terms['term-0'].known, true)
  })
  it('counts game outcomes separately from term mastery', () => {
    const won = recordGame(EMPTY_PROGRESS, true)
    const lost = recordGame(won, false)
    assert.equal(lost.gamesPlayed, 2)
    assert.equal(lost.gamesWon, 1)
  })
})
