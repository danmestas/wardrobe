import { describe, it, expect } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execSync } from 'node:child_process';

describe('apm-builder docs --target --resolution', () => {
  it('regenerates AGENTS.md filtered per resolution artifact (codex target)', async () => {
    // Set up minimal repo with two skills, both targeting codex.
    const repo = await fs.mkdtemp(path.join(os.tmpdir(), 'docs-cmd-'));
    await fs.mkdir(path.join(repo, 'skills', 'a'), { recursive: true });
    await fs.mkdir(path.join(repo, 'skills', 'b'), { recursive: true });
    await fs.writeFile(
      path.join(repo, 'skills', 'a', 'SKILL.md'),
      `---
name: a
version: 1.0.0
type: skill
description: A
targets: [codex]
category:
  primary: tooling
---
A body
`,
    );
    await fs.writeFile(
      path.join(repo, 'skills', 'b', 'SKILL.md'),
      `---
name: b
version: 1.0.0
type: skill
description: B
targets: [codex]
category:
  primary: workflow
---
B body
`,
    );

    // Write resolution artifact dropping 'b'.
    const resPath = path.join(repo, 'res.json');
    await fs.writeFile(resPath, JSON.stringify({
      schemaVersion: 1,
      harness: 'codex',
      skillsDrop: ['b'],
      skillsKeep: null,
      modePrompt: '',
      metadata: { persona: 'p', mode: null, categories: ['tooling'] },
    }));

    const outPath = path.join(repo, 'AGENTS.md');

    // Run the command using tsx from project root, passing --repo to scope discovery.
    execSync(
      `node_modules/.bin/tsx apm-builder/cli.ts docs --target codex --resolution ${resPath} --repo ${repo} --out ${outPath}`,
      { cwd: process.cwd() },
    );

    const out = await fs.readFile(outPath, 'utf8');
    expect(out).toMatch(/A body/);
    expect(out).not.toMatch(/B body/);
  }, 30_000);
});
