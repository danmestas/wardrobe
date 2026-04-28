import { describe, it, expect } from 'vitest';
import { ModeSchema } from '../lib/schema.ts';

describe('ModeSchema', () => {
  it('accepts a minimal valid mode', () => {
    const result = ModeSchema.safeParse({
      name: 'focused',
      version: '1.0.0',
      type: 'mode',
      description: 'Single-task focus',
      targets: ['claude-code'],
      categories: ['tooling'],
    });
    expect(result.success).toBe(true);
  });

  it('defaults skill_include and skill_exclude to empty arrays', () => {
    const result = ModeSchema.parse({
      name: 'focused',
      version: '1.0.0',
      type: 'mode',
      description: 'x',
      targets: ['claude-code'],
      categories: ['tooling'],
    });
    expect(result.skill_include).toEqual([]);
    expect(result.skill_exclude).toEqual([]);
  });

  it('rejects type other than "mode"', () => {
    const result = ModeSchema.safeParse({
      name: 'focused',
      version: '1.0.0',
      type: 'persona',
      description: 'x',
      targets: ['claude-code'],
      categories: ['tooling'],
    });
    expect(result.success).toBe(false);
  });
});
