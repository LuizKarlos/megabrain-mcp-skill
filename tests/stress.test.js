import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const skillRoot = join(fileURLToPath(import.meta.url), '..', '..');
const { validateDAG } = await import(`${skillRoot}/scripts/dag_validator.js`);
const { computeBlockHash, verifyLedger, canonicalStringify } = await import(`${skillRoot}/scripts/merkle_verify.js`);
const { sliceAst } = await import(`${skillRoot}/scripts/ast_slice.js`);
const { checkWcag, parseColor, getLuminance, getContrastRatio } = await import(`${skillRoot}/scripts/wcag_check.js`);

test('Stress: DAG Validator - 50 nodes linear chain', () => {
  const linear = Array.from({ length: 50 }, (_, i) => ({
    id: `node_${i}`,
    depends_on: i === 0 ? [] : [`node_${i - 1}`],
  }));

  const res = validateDAG(linear);
  assert.equal(res.valid, true);
  assert.equal(res.cycles.length, 0);
  assert.equal(res.waves.length, 50);
  for (let i = 0; i < 50; i++) {
    assert.deepEqual(res.waves[i], [`node_${i}`]);
  }
});

test('Stress: DAG Validator - 50 nodes disjoint components', () => {
  // 5 disconnected components of 10 nodes each
  const disjoint = [];
  for (let c = 0; c < 5; c++) {
    for (let i = 0; i < 10; i++) {
      disjoint.push({
        id: `c${c}_n${i}`,
        depends_on: i === 0 ? [] : [`c${c}_n${i - 1}`],
      });
    }
  }

  const res = validateDAG(disjoint);
  assert.equal(res.valid, true);
  assert.equal(res.cycles.length, 0);
  assert.equal(res.waves.length, 10);
  for (let w = 0; w < 10; w++) {
    assert.equal(res.waves[w].length, 5);
  }
});

test('Stress: DAG Validator - 50 nodes wide parallel waves', () => {
  // 5 waves of 10 nodes each (every node in wave w depends on all nodes in wave w-1)
  const parallel = [];
  for (let w = 0; w < 5; w++) {
    for (let i = 0; i < 10; i++) {
      parallel.push({
        id: `w${w}_n${i}`,
        depends_on: w === 0 ? [] : Array.from({ length: 10 }, (_, prev) => `w${w - 1}_n${prev}`),
      });
    }
  }

  const res = validateDAG(parallel);
  assert.equal(res.valid, true);
  assert.equal(res.cycles.length, 0);
  assert.equal(res.waves.length, 5);
  for (let w = 0; w < 5; w++) {
    assert.equal(res.waves[w].length, 10);
  }

  // 50 completely independent nodes in 1 single wave
  const allIndep = Array.from({ length: 50 }, (_, i) => ({ id: `indep_${i}`, depends_on: [] }));
  const resIndep = validateDAG(allIndep);
  assert.equal(resIndep.valid, true);
  assert.equal(resIndep.waves.length, 1);
  assert.equal(resIndep.waves[0].length, 50);
});

test('Stress: DAG Validator - Complex cycles in 50 nodes', () => {
  // 50 nodes total ring cycle: 0 -> 1 -> ... -> 49 -> 0
  const ring = Array.from({ length: 50 }, (_, i) => ({
    id: `ring_${i}`,
    depends_on: [`ring_${(i + 49) % 50}`],
  }));
  const resRing = validateDAG(ring);
  assert.equal(resRing.valid, false);
  assert.equal(resRing.cycles.length, 50);
  assert.equal(resRing.waves.length, 0);

  // 45 acyclic nodes + 5 cyclic nodes
  const mixed = Array.from({ length: 45 }, (_, i) => ({
    id: `ok_${i}`,
    depends_on: i === 0 ? [] : [`ok_${i - 1}`],
  }));
  for (let i = 0; i < 5; i++) {
    mixed.push({
      id: `cycle_${i}`,
      depends_on: ['ok_44', `cycle_${(i + 4) % 5}`],
    });
  }
  const resMixed = validateDAG(mixed);
  assert.equal(resMixed.valid, false);
  assert.deepEqual(resMixed.cycles.sort(), ['cycle_0', 'cycle_1', 'cycle_2', 'cycle_3', 'cycle_4'].sort());
  assert.equal(resMixed.waves.length, 45);

  // Figure-8 double cycle: c1_0 <-> c1_1 and c2_0 <-> c2_1 sharing a hub
  const fig8 = [
    { id: 'hub', depends_on: ['c1_b', 'c2_b'] },
    { id: 'c1_a', depends_on: ['hub'] },
    { id: 'c1_b', depends_on: ['c1_a'] },
    { id: 'c2_a', depends_on: ['hub'] },
    { id: 'c2_b', depends_on: ['c2_a'] },
  ];
  const resFig8 = validateDAG(fig8);
  assert.equal(resFig8.valid, false);
  assert.equal(resFig8.cycles.length, 5);

  // Self-loop: node depends on itself
  const selfLoop = [
    { id: 'start', depends_on: [] },
    { id: 'loop', depends_on: ['start', 'loop'] },
  ];
  const resSelf = validateDAG(selfLoop);
  assert.equal(resSelf.valid, false);
  assert.deepEqual(resSelf.cycles, ['loop']);
  assert.equal(resSelf.waves.length, 1);
  const resMissing = validateDAG([
    { id: 't1', depends_on: [] },
    { id: 't2', depends_on: ['t1', 'inexistent_task'] },
  ]);
  assert.equal(resMissing.valid, false);
  assert.deepEqual(resMissing.missing_dependencies, ['inexistent_task']);
  assert.deepEqual(resMissing.cycles, []);
});

test('Stress: DAG Validator - CLI file execution', () => {
  const tmpFile = join(tmpdir(), `dag_test_${Date.now()}.json`);
  const validData = [
    { id: 't1', depends_on: [] },
    { id: 't2', depends_on: ['t1'] },
  ];
  writeFileSync(tmpFile, JSON.stringify(validData), 'utf8');

  try {
    const stdout = execFileSync(process.execPath, [join(skillRoot, 'scripts', 'dag_validator.js'), tmpFile], {
      encoding: 'utf8',
    });
    const parsed = JSON.parse(stdout);
    assert.equal(parsed.valid, true);
    assert.equal(parsed.waves.length, 2);
  } finally {
    unlinkSync(tmpFile);
  }
});

test('Stress: Merkle Verify - 50 valid blocks chained', () => {
  const blocks = [];
  for (let i = 0; i < 50; i++) {
    const b = {
      index: i,
      timestamp: 1700000000 + i * 15,
      previous_hash: i === 0 ? '0' : blocks[i - 1].hash,
      data: {
        batch: `batch_${i}`,
        transactions: [
          { id: `tx_${i}_1`, amount: i * 10 + 1 },
          { id: `tx_${i}_2`, amount: i * 10 + 2 },
        ],
        author: 'sovereign_kernel',
      },
    };
    b.hash = computeBlockHash(b);
    blocks.push(b);
  }

  const res = verifyLedger(blocks);
  assert.equal(res.valid, true);
  assert.equal(res.blocks_verified, 50);
  assert.equal(res.errors.length, 0);

  // Also verify object wrapping format { blocks: [...] }
  const resWrapped = verifyLedger({ blocks });
  assert.equal(resWrapped.valid, true);
  assert.equal(resWrapped.blocks_verified, 50);
});

test('Stress: Merkle Verify - Tampering intermediate block and hash alteration', () => {
  const blocks = [];
  for (let i = 0; i < 50; i++) {
    const b = {
      index: i,
      previous_hash: i === 0 ? '0' : blocks[i - 1].hash,
      data: { sequence: i, payload: `payload_${i}` },
    };
    b.hash = computeBlockHash(b);
    blocks.push(b);
  }

  // 1. Tamper intermediate payload at block 25 without altering declared hash
  const tamperedPayload = JSON.parse(JSON.stringify(blocks));
  tamperedPayload[25].data.payload = 'tampered_malicious_data';
  const res1 = verifyLedger(tamperedPayload);
  assert.equal(res1.valid, false);
  assert.ok(res1.errors.some((e) => e.includes('Block 25: hash mismatch')));

  // 2. Tamper block 25 data AND recalculate block 25 hash
  // Block 26 previous_hash will no longer match block 25's new hash
  const tamperedChain = JSON.parse(JSON.stringify(blocks));
  tamperedChain[25].data.payload = 'tampered_malicious_data';
  tamperedChain[25].hash = computeBlockHash(tamperedChain[25]);
  const res2 = verifyLedger(tamperedChain);
  assert.equal(res2.valid, false);
  assert.ok(res2.errors.some((e) => e.includes('Block 26: previous_hash mismatch')));

  // 3. Alter declared hash of block 30 directly
  const tamperedHash = JSON.parse(JSON.stringify(blocks));
  tamperedHash[30].hash = 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
  const res3 = verifyLedger(tamperedHash);
  assert.equal(res3.valid, false);
  assert.ok(res3.errors.some((e) => e.includes('Block 30: hash mismatch')));
  assert.ok(res3.errors.some((e) => e.includes('Block 31: previous_hash mismatch')));
});

test('Stress: Merkle Verify - Genesis block edge cases', () => {
  const mkGenesis = (prev) => {
    const g = { index: 0, previous_hash: prev, data: 'genesis_content' };
    g.hash = computeBlockHash(g);
    return g;
  };

  // Valid genesis previous_hash variants
  assert.equal(verifyLedger([mkGenesis('0')]).valid, true);
  assert.equal(verifyLedger([mkGenesis('')]).valid, true);
  assert.equal(verifyLedger([mkGenesis(null)]).valid, true);
  assert.equal(verifyLedger([mkGenesis(undefined)]).valid, true);
  assert.equal(verifyLedger([mkGenesis('0'.repeat(64))]).valid, true);
  assert.equal(verifyLedger([mkGenesis('f'.repeat(64))]).valid, false);

  // Invalid genesis previous_hash
  const badPrev = verifyLedger([mkGenesis('not_a_valid_hash')]);
  assert.equal(badPrev.valid, false);
  assert.ok(badPrev.errors.some((e) => e.includes('Block 0: invalid previous_hash')));

  const numericPrev = verifyLedger([mkGenesis(0)]);
  assert.equal(numericPrev.valid, true);

  // Empty ledger is valid
  assert.equal(verifyLedger([]).valid, true);
  // Non-array ledger is invalid
  assert.equal(verifyLedger(null).valid, false);
  assert.equal(verifyLedger('not-blocks').valid, false);
});

test('Stress: Merkle Verify - Canonical key sorting determinism', () => {
  const o1 = { z: 10, a: 1, m: { y: 2, x: 1 } };
  const o2 = { a: 1, m: { x: 1, y: 2 }, z: 10 };
  assert.equal(canonicalStringify(o1), canonicalStringify(o2));
  assert.equal(computeBlockHash(o1), computeBlockHash(o2));
});

test('Stress: AST Slicer - Complex JS/TS with token reduction measurement', () => {
  const complexTs = `
import { Injectable, Inject, PipeTransform, ArgumentMetadata } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface Repository<T extends Record<string, any>, ID = string> {
  findById(id: ID): Promise<T | null>;
  findAll(filter?: Record<string, any>): Promise<T[]>;
  save(entity: T): Promise<T>;
  delete(id: ID): Promise<boolean>;
}

export type EntityId = string | number;
export type AsyncResult<T> = Promise<{ success: boolean; data?: T; error?: string }>;

@Injectable()
export class SovereignDatabaseService<T extends { id: EntityId }> implements Repository<T, EntityId> {
  private readonly store: Map<EntityId, T> = new Map();

  constructor(
    @Inject('CONFIG') private readonly config: Record<string, any>,
    private readonly logger: Console
  ) {}

  async findById(id: EntityId): Promise<T | null> {
    const item = this.store.get(id);
    if (!item) {
      this.logger.warn(\`Item \${id} not found\`);
      return null;
    }
    return item;
  }

  async findAll(filter?: Record<string, any>): Promise<T[]> {
    const all = Array.from(this.store.values());
    if (!filter) return all;
    return all.filter((entry) => Object.entries(filter).every(([k, v]) => entry[k] === v));
  }

  export async function* batchStreamer(batchSize: number = 50): AsyncGenerator<T[]> {
    let currentBatch: T[] = [];
    for (const item of this.store.values()) {
      currentBatch.push(item);
      if (currentBatch.length >= batchSize) {
        yield currentBatch;
        currentBatch = [];
      }
    }
    if (currentBatch.length > 0) {
      yield currentBatch;
    }
  }
}
`;

  const res = sliceAst(complexTs, 'ts');
  assert.equal(res.lang, 'ts');
  assert.ok(res.declarations.length >= 4);

  // Check specific declarations extracted
  assert.ok(res.declarations.some((d) => d.includes('interface Repository')));
  assert.ok(res.declarations.some((d) => d.includes('type EntityId')));
  assert.ok(res.declarations.some((d) => d.includes('type AsyncResult')));
  assert.ok(res.declarations.some((d) => d.includes('class SovereignDatabaseService')));

  // Measure token/character reduction
  const originalChars = complexTs.length;
  const outlineChars = res.outline.length;
  const reductionPct = ((originalChars - outlineChars) / originalChars) * 100;

  const origTokens = Math.ceil(originalChars / 4);
  const outlineTokens = Math.ceil(outlineChars / 4);

  assert.ok(reductionPct > 60, `Expected >60% reduction, got ${reductionPct.toFixed(1)}%`);
  assert.ok(outlineTokens < origTokens / 2, 'Outline tokens should be less than half original');
});

test('Stress: AST Slicer - Complex Python with nested classes and type hints', () => {
  const complexPy = `
import asyncio
from typing import Dict, List, Optional, Union, Tuple, Any, Callable
from dataclasses import dataclass, field

@dataclass
class SwarmMetrics:
    total_tasks: int = 0
    completed_tasks: int = 0
    failed_tasks: int = 0
    latency_ms: float = 0.0

class DistributedCoordinator:
    """Sovereign cluster coordinator managing nested worker agents."""

    class NodeWorker:
        """Nested worker agent handling subtasks."""
        def __init__(self, node_id: str, capacity: int = 16) -> None:
            self.node_id = node_id
            self.capacity = capacity
            self.active = True

        def evaluate_health(self) -> bool:
            return self.active and self.capacity > 0

    def __init__(self, cluster_name: str, metrics: Optional[SwarmMetrics] = None) -> None:
        self.cluster_name = cluster_name
        self.metrics = metrics or SwarmMetrics()
        self.workers: List[DistributedCoordinator.NodeWorker] = []

    async def schedule_workload(
        self,
        task_id: str,
        parameters: Dict[str, Union[str, int, float, List[str]]],
        retry_policy: Optional[Callable[[int], bool]] = None
    ) -> Tuple[bool, Optional[str]]:
        """Multi-line signature function with complex type hints."""
        for worker in self.workers:
            if worker.evaluate_health():
                await asyncio.sleep(0.01)
                self.metrics.completed_tasks += 1
                return True, worker.node_id
        return False, None

def top_level_bootstrap(config_path: str = "config.yaml") -> DistributedCoordinator:
    return DistributedCoordinator(cluster_name="primary")
`;

  const res = sliceAst(complexPy, 'py');
  assert.equal(res.lang, 'py');
  assert.ok(res.declarations.length >= 7);

  // Check extracted signatures
  assert.ok(res.declarations.some((d) => d.includes('class SwarmMetrics:')));
  assert.ok(res.declarations.some((d) => d.includes('class DistributedCoordinator:')));
  assert.ok(res.declarations.some((d) => d.includes('class NodeWorker:')));
  assert.ok(res.declarations.some((d) => d.includes('def __init__')));
  assert.ok(res.declarations.some((d) => d.includes('def evaluate_health')));
  assert.ok(res.declarations.some((d) => d.includes('async def schedule_workload')));
  assert.ok(res.declarations.some((d) => d.includes('def top_level_bootstrap')));

  // Measure token/character reduction
  const originalChars = complexPy.length;
  const outlineChars = res.outline.length;
  const reductionPct = ((originalChars - outlineChars) / originalChars) * 100;

  assert.ok(reductionPct > 60, `Expected >60% reduction, got ${reductionPct.toFixed(1)}%`);
});

test('Stress: AST Slicer - Auto language detection & CLI flags', () => {
  assert.equal(sliceAst('def calculate(): pass', 'auto').lang, 'py');
  assert.equal(sliceAst('interface Config { port: number; }', 'auto').lang, 'ts');
  assert.equal(sliceAst('function runTask() { return true; }', 'auto').lang, 'js');

  const tmpFile = join(tmpdir(), `ast_test_${Date.now()}.ts`);
  writeFileSync(tmpFile, 'export interface TestInterface {\n  id: string;\n}\nexport class TestService {}\n', 'utf8');

  try {
    const stdout = execFileSync(
      process.execPath,
      [join(skillRoot, 'scripts', 'ast_slice.js'), tmpFile, '--json', '--lang=ts'],
      { encoding: 'utf8' }
    );
    const parsed = JSON.parse(stdout);
    assert.equal(parsed.lang, 'ts');
    assert.equal(parsed.declarations.length, 2);
    assert.ok(parsed.outline.includes('TestInterface'));
    assert.ok(parsed.outline.includes('TestService'));
  } finally {
    unlinkSync(tmpFile);
  }
});

test('Stress: WCAG Check - Extreme contrasts and edge ratios', () => {
  // Max contrast 21:1
  const bw = checkWcag({ fg: '#000000', bg: '#ffffff' });
  assert.equal(bw.contrast.ratio, 21);
  assert.equal(bw.contrast.passAA, true);
  assert.equal(bw.contrast.passLarge, true);
  assert.equal(bw.valid, true);

  const wb = checkWcag({ fg: '#ffffff', bg: '#000000' });
  assert.equal(wb.contrast.ratio, 21);
  assert.equal(wb.contrast.passAA, true);

  // Min contrast 1:1
  const ww = checkWcag({ fg: '#ffffff', bg: '#ffffff' });
  assert.equal(ww.contrast.ratio, 1);
  assert.equal(ww.contrast.passAA, false);
  assert.equal(ww.contrast.passLarge, false);
  assert.equal(ww.valid, false);

  const bb = checkWcag({ fg: '#000000', bg: '#000000' });
  assert.equal(bb.contrast.ratio, 1);
  assert.equal(bb.contrast.passAA, false);

  // Boundary AA contrast (~4.5:1)
  // #767676 on white gives ~4.54:1 (PASS AA)
  const boundaryPass = checkWcag({ fg: '#767676', bg: '#ffffff' });
  assert.ok(boundaryPass.contrast.ratio >= 4.5);
  assert.equal(boundaryPass.contrast.passAA, true);

  // #777777 on white gives ~4.48:1 (FAIL AA, PASS Large)
  const boundaryFailAA = checkWcag({ fg: '#777777', bg: '#ffffff' });
  assert.ok(boundaryFailAA.contrast.ratio < 4.5);
  assert.equal(boundaryFailAA.contrast.passAA, false);
  assert.equal(boundaryFailAA.contrast.passLarge, true);

  // Shorthand 3-hex color support
  const shortHex = checkWcag({ fg: '#000', bg: '#fff' });
  assert.equal(shortHex.contrast.ratio, 21);
});

test('Stress: WCAG Check - Target size constraints (44x44px minimum)', () => {
  // Exactly 44x44
  const exact = checkWcag({ fg: '#000', bg: '#fff', width: 44, height: 44 });
  assert.equal(exact.targetSize.pass, true);
  assert.equal(exact.valid, true);

  // Sub-minimum width: 43x44
  const subWidth = checkWcag({ fg: '#000', bg: '#fff', width: 43, height: 44 });
  assert.equal(subWidth.targetSize.pass, false);
  assert.equal(subWidth.valid, false);

  // Sub-minimum height: 44x43
  const subHeight = checkWcag({ fg: '#000', bg: '#fff', width: 44, height: 43 });
  assert.equal(subHeight.targetSize.pass, false);
  assert.equal(subHeight.valid, false);

  // Typical mobile icon button: 24x24
  const iconSize = checkWcag({ fg: '#000', bg: '#fff', width: 24, height: 24 });
  assert.equal(iconSize.targetSize.pass, false);
  assert.equal(iconSize.valid, false);

  // Non-numeric and negative values
  assert.equal(checkWcag({ fg: '#000', bg: '#fff', width: -10, height: 44 }).targetSize.pass, false);
  assert.equal(checkWcag({ fg: '#000', bg: '#fff', width: 'abc', height: 'xyz' }).targetSize.pass, false);
});

test('Stress: WCAG Check - Invalid color fallback and edge cases', () => {
  const badColor = checkWcag({ fg: 'not-a-color', bg: '#fff' });
  assert.equal(badColor.contrast.ratio, 1);
  assert.equal(badColor.valid, false);

  const emptyCall = checkWcag({});
  assert.equal(emptyCall.valid, false);

  const rgbObj = checkWcag({ fg: { r: 0, g: 0, b: 0 }, bg: { r: 255, g: 255, b: 255 } });
  assert.equal(rgbObj.contrast.ratio, 21);
  assert.equal(rgbObj.valid, true);
});

test('Stress: WCAG Check - CLI formatted and JSON output with exit codes', () => {
  const scriptPath = join(skillRoot, 'scripts', 'wcag_check.js');

  const passOut = execFileSync(
    process.execPath,
    [scriptPath, '--fg=#000000', '--bg=#ffffff', '--width=48', '--height=48'],
    { encoding: 'utf8' }
  );
  assert.ok(passOut.includes('WCAG 2.1 Audit: PASSED'));
  assert.ok(passOut.includes('21:1'));

  const jsonOut = execFileSync(
    process.execPath,
    [scriptPath, '--fg=#000000', '--bg=#ffffff', '--width=48', '--height=48', '--json'],
    { encoding: 'utf8' }
  );
  const parsed = JSON.parse(jsonOut);
  assert.equal(parsed.valid, true);
  assert.equal(parsed.contrast.ratio, 21);
  assert.equal(parsed.targetSize.pass, true);

  assert.throws(
    () => {
      execFileSync(
        process.execPath,
        [scriptPath, '--fg=#ffffff', '--bg=#ffffff', '--width=20', '--height=20'],
        { encoding: 'utf8' }
      );
    },
    (err) => err.status === 1
  );
});
