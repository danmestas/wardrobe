import { describe, it, expect } from 'vitest';
import { resolve } from '../lib/resolution.ts';
import type { ComponentSource } from '../lib/types.ts';

const skill = (name: string, category: string | undefined): ComponentSource => ({
  relativeDir: `skills/${name}`,
  dir: `/tmp/skills/${name}`,
  body: '',
  manifest: {
    name,
    version: '1.0.0',
    type: 'skill',
    description: '',
    targets: ['claude-code'],
    ...(category ? { category: { primary: category } } : {}),
  } as any,
});

describe('resolve', () => {
  it('returns full catalog when no persona or mode is given', () => {
    const catalog = [skill('a', 'tooling'), skill('b', 'workflow')];
    const r = resolve({ catalog, harness: 'claude-code' });
    expect(r.skillsKeep).toBeNull();
    expect(r.skillsDrop).toEqual([]);
    expect(r.modePrompt).toBe('');
  });

  it('drops skills outside persona categories', () => {
    const catalog = [skill('a', 'tooling'), skill('b', 'workflow')];
    const persona = {
      name: 'p',
      type: 'persona',
      categories: ['tooling'],
      skill_include: [],
      skill_exclude: [],
    } as any;
    const r = resolve({ catalog, persona, harness: 'claude-code' });
    expect(r.skillsDrop).toContain('b');
    expect(r.skillsDrop).not.toContain('a');
  });

  it('keeps uncategorized skills (universal default)', () => {
    const catalog = [skill('a', 'tooling'), skill('b', undefined)];
    const persona = {
      name: 'p',
      type: 'persona',
      categories: ['tooling'],
      skill_include: [],
      skill_exclude: [],
    } as any;
    const r = resolve({ catalog, persona, harness: 'claude-code' });
    expect(r.skillsDrop).not.toContain('b');
  });

  it('skill_include forces inclusion across categories', () => {
    const catalog = [skill('a', 'tooling'), skill('b', 'workflow')];
    const persona = {
      name: 'p',
      type: 'persona',
      categories: ['tooling'],
      skill_include: ['b'],
      skill_exclude: [],
    } as any;
    const r = resolve({ catalog, persona, harness: 'claude-code' });
    expect(r.skillsDrop).not.toContain('b');
  });

  it('skill_exclude wins over category match', () => {
    const catalog = [skill('a', 'tooling')];
    const persona = {
      name: 'p',
      type: 'persona',
      categories: ['tooling'],
      skill_include: [],
      skill_exclude: ['a'],
    } as any;
    const r = resolve({ catalog, persona, harness: 'claude-code' });
    expect(r.skillsDrop).toContain('a');
  });

  it('persona ∩ mode categories', () => {
    const catalog = [skill('a', 'tooling'), skill('b', 'workflow'), skill('c', 'philosophy')];
    const persona = {
      name: 'p',
      type: 'persona',
      categories: ['tooling', 'workflow'],
      skill_include: [],
      skill_exclude: [],
    } as any;
    const mode = {
      name: 'm',
      type: 'mode',
      categories: ['tooling'],
      skill_include: [],
      skill_exclude: [],
    } as any;
    const r = resolve({ catalog, persona, mode, harness: 'claude-code' });
    expect(r.skillsDrop).toContain('b'); // in persona but not in mode
    expect(r.skillsDrop).toContain('c'); // in neither
    expect(r.skillsDrop).not.toContain('a'); // in both
  });

  it('mode body becomes mode_prompt', () => {
    const catalog = [skill('a', 'tooling')];
    const mode = {
      name: 'm',
      type: 'mode',
      categories: ['tooling'],
      skill_include: [],
      skill_exclude: [],
    } as any;
    const r = resolve({
      catalog,
      mode,
      modeBody: 'You are in focused mode.\n',
      harness: 'claude-code',
    });
    expect(r.modePrompt).toBe('You are in focused mode.\n');
  });

  it('emits resolved metadata', () => {
    const catalog = [skill('a', 'tooling')];
    const persona = {
      name: 'p',
      type: 'persona',
      categories: ['tooling'],
      skill_include: [],
      skill_exclude: [],
    } as any;
    const r = resolve({ catalog, persona, harness: 'claude-code' });
    expect(r.metadata.persona).toBe('p');
    expect(r.metadata.categories).toContain('tooling');
  });
});
