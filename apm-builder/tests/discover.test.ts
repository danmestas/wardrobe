import { describe, it, expect, beforeAll } from 'vitest';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { discoverComponents } from '../lib/discover.ts';

const FIXTURES_ROOT = path.resolve(
  fileURLToPath(import.meta.url),
  '../fixtures/discover',
);

describe('discoverComponents', () => {
  it('finds SKILL.md under skills/, plugins/, rules/', async () => {
    const components = await discoverComponents(FIXTURES_ROOT);
    const names = components.map((c) => c.manifest.name).sort();
    expect(names).toEqual(['sample-rule', 'sample-skill']);
  });

  it('parses frontmatter into manifest', async () => {
    const components = await discoverComponents(FIXTURES_ROOT);
    const skill = components.find((c) => c.manifest.name === 'sample-skill');
    expect(skill?.manifest.type).toBe('skill');
    expect(skill?.manifest.targets).toEqual(['claude-code', 'apm']);
    expect(skill?.body.trim().startsWith('# Sample Skill')).toBe(true);
  });

  it('records relativeDir from repo root', async () => {
    const components = await discoverComponents(FIXTURES_ROOT);
    const skill = components.find((c) => c.manifest.name === 'sample-skill');
    expect(skill?.relativeDir).toBe('skills/sample-skill');
  });

  it('surfaces the offending file path when frontmatter is invalid', async () => {
    const BAD_ROOT = path.resolve(fileURLToPath(import.meta.url), '../fixtures/discover-invalid');
    await expect(discoverComponents(BAD_ROOT)).rejects.toThrow(/skills\/bad\/SKILL\.md/);
  });

  it('finds personas under personas/', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'discover-'));
    await fs.mkdir(path.join(tmp, 'personas', 'test-persona'), { recursive: true });
    await fs.writeFile(
      path.join(tmp, 'personas', 'test-persona', 'persona.md'),
      `---
name: test-persona
version: 1.0.0
type: persona
description: t
targets: [claude-code]
categories: [tooling]
---

body
`,
    );
    const result = await discoverComponents(tmp);
    expect(result.find((c) => c.manifest.type === 'persona' && c.manifest.name === 'test-persona')).toBeDefined();
  });

  it('finds modes under modes/', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'discover-'));
    await fs.mkdir(path.join(tmp, 'modes', 'test-mode'), { recursive: true });
    await fs.writeFile(
      path.join(tmp, 'modes', 'test-mode', 'mode.md'),
      `---
name: test-mode
version: 1.0.0
type: mode
description: t
targets: [claude-code]
categories: [tooling]
---

You are in test mode.
`,
    );
    const result = await discoverComponents(tmp);
    expect(result.find((c) => c.manifest.type === 'mode' && c.manifest.name === 'test-mode')).toBeDefined();
  });
});
