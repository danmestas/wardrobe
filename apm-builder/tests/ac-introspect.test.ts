import { describe, it, expect } from 'vitest';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { listCommand, showCommand, doctorCommand } from '../lib/ac/introspect.ts';

describe('ac list', () => {
  it('lists all personas', async () => {
    const builtinDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ac-builtin-'));
    await fs.mkdir(path.join(builtinDir, 'personas', 'one'), { recursive: true });
    await fs.writeFile(
      path.join(builtinDir, 'personas', 'one', 'persona.md'),
      `---
name: one
version: 1.0.0
type: persona
description: t
targets: [claude-code]
categories: [tooling]
---
`,
    );
    const out: string[] = [];
    await listCommand('personas', {
      projectDir: '/nonexistent',
      userDir: '/nonexistent',
      builtinDir,
      print: (line) => out.push(line),
    });
    expect(out.some((l) => l.includes('one'))).toBe(true);
    expect(out.some((l) => l.includes('builtin'))).toBe(true);
  });
});

describe('ac show', () => {
  it('prints persona details', async () => {
    const builtinDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ac-show-'));
    await fs.mkdir(path.join(builtinDir, 'personas', 'one'), { recursive: true });
    await fs.writeFile(
      path.join(builtinDir, 'personas', 'one', 'persona.md'),
      `---
name: one
version: 1.0.0
type: persona
description: backend
targets: [claude-code]
categories: [tooling, workflow]
skill_include: [debugging]
skill_exclude: [frontend-design]
---

readme body
`,
    );
    const out: string[] = [];
    await showCommand({ kind: 'persona', name: 'one' }, {
      projectDir: '/nonexistent',
      userDir: '/nonexistent',
      builtinDir,
      print: (l) => out.push(l),
    });
    const text = out.join('\n');
    expect(text).toMatch(/categories:.*tooling.*workflow/);
    expect(text).toMatch(/skill_include:.*debugging/);
  });
});

describe('ac doctor', () => {
  it('reports missing per-harness filter hooks', async () => {
    const harnessRoots = {
      'claude-code': '/nonexistent/claude',
      apm: '/nonexistent/apm',
      gemini: '/nonexistent/gemini',
      pi: '/nonexistent/pi',
    };
    const out: string[] = [];
    const code = await doctorCommand({
      harnessConfigRoots: harnessRoots,
      print: (l) => out.push(l),
    });
    expect(code).not.toBe(0);
    const text = out.join('\n');
    expect(text).toMatch(/claude-code/);
    expect(text).toMatch(/missing|not.*installed/i);
  });
});
