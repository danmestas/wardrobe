import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';
import matter from 'gray-matter';
import { codexAdapter } from '../../adapters/codex.ts';
import { ManifestSchema } from '../../lib/schema.ts';
import { runGolden } from './golden.ts';
import type { ComponentSource, AdapterContext } from '../../lib/types.ts';

const HERE = path.resolve(fileURLToPath(import.meta.url), '..');

async function loadComponent(dir: string, repoRoot: string): Promise<ComponentSource> {
  const raw = await fs.readFile(path.join(dir, 'SKILL.md'), 'utf8');
  const parsed = matter(raw);
  return {
    dir,
    relativeDir: path.relative(repoRoot, dir),
    manifest: ManifestSchema.parse(parsed.data),
    body: parsed.content,
  };
}

describe('codex adapter', () => {
  it('emits a single skill into AGENTS.md', async () => {
    const result = await runGolden(codexAdapter, path.join(HERE, 'codex/skill-basic'));
    expect(result.diff).toEqual([]);
    expect(result.matched).toBe(true);
  });

  it('emits a single agent into AGENTS.md', async () => {
    const result = await runGolden(codexAdapter, path.join(HERE, 'codex/agent-basic'));
    expect(result.diff).toEqual([]);
  });
});
