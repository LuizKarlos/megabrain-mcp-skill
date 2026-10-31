import { validateDAG } from '../scripts/dag_validator.js'
import { test } from 'node:test'
import assert from 'node:assert/strict'

test('DAG_DUP: duplicate id is rejected and produces no waves', () => {
  const r = validateDAG([{ id: 'x' }, { id: 'x' }])
  assert.equal(r.valid, false)
  assert.equal(r.waves.length, 0)
  assert.equal(r.error, 'DUPLICATE_ID')
})

test('DAG_BAD_ID: empty, absent and null ids are rejected', () => {
  assert.equal(validateDAG([{ id: '' }]).error, 'INVALID_ID')
  assert.equal(validateDAG([{}]).error, 'INVALID_ID')
  assert.equal(validateDAG([{ id: null }]).error, 'INVALID_ID')
  assert.equal(validateDAG([{ id: 'x' }, { id: null }]).error, 'INVALID_ID')
})

test('DAG_LINEAR: linear a->b dependency stays valid', () => {
  const r = validateDAG([{ id: 'a' }, { id: 'b', depends_on: ['a'] }])
  assert.equal(r.valid, true)
  assert.equal(r.cycles.length, 0)
  assert.equal(r.missing_dependencies.length, 0)
  assert.deepEqual(r.waves, [['a'], ['b']])
})

test('DAG_INDEPENDENT: two roots share one wave and each id appears once', () => {
  const r = validateDAG([{ id: 'a' }, { id: 'b' }])
  assert.equal(r.valid, true)
  assert.equal(r.waves.length, 1)
  assert.deepEqual([...r.waves[0]].sort(), ['a', 'b'])
  assert.equal(new Set(r.waves.flat()).size, 2)
})

test('DAG_BAD_TYPE: boolean and object ids are INVALID_ID', () => {
  assert.equal(validateDAG([{ id: true }]).error, 'INVALID_ID')
  assert.equal(validateDAG([{ id: { x: 1 } }]).error, 'INVALID_ID')
})

test('DAG_MISSING vs DAG_CYCLE: missing dependency and cycle stay distinct', () => {
  const missing = validateDAG([{ id: 'a', depends_on: ['ghost'] }])
  assert.equal(missing.valid, false)
  assert.ok(missing.missing_dependencies.includes('ghost'))
  assert.equal(missing.cycles.length, 0)
  const cycle = validateDAG([{ id: 'a', depends_on: ['b'] }, { id: 'b', depends_on: ['a'] }])
  assert.equal(cycle.valid, false)
  assert.ok(cycle.cycles.length > 0)
  assert.equal(cycle.missing_dependencies.length, 0)
})
