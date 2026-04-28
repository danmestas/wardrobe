import { describe, it, expect } from 'vitest';
import { PersonaSchema } from '../lib/schema.ts';

describe('PersonaSchema', () => {
  it('accepts a minimal valid persona', () => {
    const result = PersonaSchema.safeParse({
      name: 'backend',
      version: '1.0.0',
      type: 'persona',
      description: 'Backend dev work',
      targets: ['claude-code'],
      categories: ['tooling'],
    });
    expect(result.success).toBe(true);
  });

  it('defaults skill_include and skill_exclude to empty arrays', () => {
    const result = PersonaSchema.parse({
      name: 'backend',
      version: '1.0.0',
      type: 'persona',
      description: 'Backend dev work',
      targets: ['claude-code'],
      categories: ['tooling'],
    });
    expect(result.skill_include).toEqual([]);
    expect(result.skill_exclude).toEqual([]);
  });

  it('rejects missing categories field', () => {
    const result = PersonaSchema.safeParse({
      name: 'backend',
      version: '1.0.0',
      type: 'persona',
      description: 'Backend dev work',
      targets: ['claude-code'],
    });
    expect(result.success).toBe(false);
  });

  it('rejects type other than "persona"', () => {
    const result = PersonaSchema.safeParse({
      name: 'backend',
      version: '1.0.0',
      type: 'skill',
      description: 'x',
      targets: ['claude-code'],
      categories: ['tooling'],
    });
    expect(result.success).toBe(false);
  });
});
