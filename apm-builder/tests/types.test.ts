import { describe, it, expect } from 'vitest';
import { COMPONENT_TYPES } from '../lib/types';

describe('COMPONENT_TYPES', () => {
  it('includes persona', () => {
    expect(COMPONENT_TYPES).toContain('persona');
  });
  it('includes mode', () => {
    expect(COMPONENT_TYPES).toContain('mode');
  });
});
