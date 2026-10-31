import { validateDAG } from '../scripts/dag_validator.js'
import { test } from 'node:test'
import assert from 'node:assert/strict'

test('DAG_CYCLE_DEPS: cycle via dependencies fails validation', () => {
  const r = validateDAG([
    { id: 'a', dependencies: ['b'] },
    { id: 'b', dependencies: ['a'] }
  ])
  assert.equal(r.valid, false)
  assert.deepEqual(r.cycles.sort(), ['a', 'b'])
  assert.equal(r.missing_dependencies.length, 0)
})

test('DAG_MISSING_DEPS: ghost via dependencies reported in missing_dependencies', () => {
  const r = validateDAG([{ id: 'a', dependencies: ['ghost'] }])
  assert.equal(r.valid, false)
  assert.ok(r.missing_dependencies.includes('ghost'))
  assert.equal(r.cycles.length, 0)
})

test('DAG_PARITY: dependencies and depends_on produce identical waves', () => {
  const legacy = [{ id: 'a' }, { id: 'b', depends_on: ['a'] }, { id: 'c', depends_on: ['b'] }]
  const canonical = [{ id: 'a' }, { id: 'b', dependencies: ['a'] }, { id: 'c', dependencies: ['b'] }]
  const r1 = validateDAG(legacy)
  const r2 = validateDAG(canonical)
  assert.equal(r2.valid, true)
  assert.deepEqual(r2.waves, r1.waves)
})

test('DAG_STRING_SHAPE: string dependencies does not spread into character ids', () => {
  const r = validateDAG([{ id: 'a', dependencies: 'ghost' }])
  assert.equal(r.valid, true)
  assert.equal(r.missing_dependencies.length, 0)
  assert.deepEqual(r.waves, [['a']])
})

test('DAG_CONFLICT: canonical dependencies has documented precedence over legacy depends_on', () => {
  const r = validateDAG([
    { id: 'a' },
    { id: 'b' },
    { id: 'c', dependencies: ['a'], depends_on: ['ghost'] }
  ])
  assert.equal(r.valid, true)
  assert.equal(r.missing_dependencies.length, 0)
  assert.deepEqual(r.waves, [['a', 'b'], ['c']])
})
