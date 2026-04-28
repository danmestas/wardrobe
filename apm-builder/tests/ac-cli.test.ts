import { describe, it, expect } from 'vitest';
import { parseAcArgs } from '../lib/ac/run.ts';

describe('parseAcArgs', () => {
  it('splits ac flags from harness flags at --', () => {
    const r = parseAcArgs(['claude', '--persona', 'backend', '--', '--resume', 'sess']);
    expect(r.harness).toBe('claude');
    expect(r.persona).toBe('backend');
    expect(r.harnessArgs).toEqual(['--resume', 'sess']);
  });

  it('treats trailing args as harness args when no -- present', () => {
    const r = parseAcArgs(['claude', '--persona', 'backend']);
    expect(r.harnessArgs).toEqual([]);
  });

  it('handles --no-filter flag', () => {
    const r = parseAcArgs(['claude', '--no-filter']);
    expect(r.noFilter).toBe(true);
  });

  it('throws on missing harness name', () => {
    expect(() => parseAcArgs(['--persona', 'backend'])).toThrow(/harness/i);
  });

  it('throws on --persona without value', () => {
    expect(() => parseAcArgs(['claude', '--persona'])).toThrow(/--persona/);
  });
});
