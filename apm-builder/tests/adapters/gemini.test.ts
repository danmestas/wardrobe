import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { geminiAdapter } from '../../adapters/gemini.ts';
import { runGolden } from './golden.ts';

const HERE = path.resolve(fileURLToPath(import.meta.url), '..');

describe('gemini adapter', () => {
  it('emits a skill with metadata.json + skill.md', async () => {
    const result = await runGolden(geminiAdapter, path.join(HERE, 'gemini/skill-basic'));
    expect(result.diff).toEqual([]);
    expect(result.matched).toBe(true);
  });
});
