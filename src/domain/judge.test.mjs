import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { judgeAnswer } from './judge.ts'
import { TERMS } from '../data/terms.ts'

describe('judgeAnswer', () => {
  const term = TERMS.find(item => item.id === 'dl-pull-request')
  it('accepts canonical names and aliases', () => {
    assert.equal(judgeAnswer(term, 'PR', 1).result, 'correct')
    assert.equal(judgeAnswer(term, 'pull request', 1).result, 'correct')
  })
  it('accepts a concise explanation using key concepts', () => {
    assert.equal(judgeAnswer(term, 'propose change review integration', 3).result, 'correct')
  })
  it('gives partial feedback when only part matches', () => {
    assert.equal(judgeAnswer(term, 'review', 3).result, 'partial')
  })
  it('rejects unrelated answers', () => {
    assert.equal(judgeAnswer(term, 'a production server', 1).result, 'incorrect')
  })
})
