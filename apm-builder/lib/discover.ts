import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { ManifestSchema } from './schema.ts';
import type { ComponentSource } from './types.ts';

const COMPONENT_DIRS = ['skills', 'plugins', 'rules', 'hooks', 'agents', 'mcp', 'personas', 'modes'] as const;

const DIR_FILENAME: Partial<Record<string, string>> = {
  personas: 'persona.md',
  modes: 'mode.md',
};

function getComponentFilename(dir: string): string {
  return DIR_FILENAME[dir] ?? 'SKILL.md';
}

export async function discoverComponents(repoRoot: string): Promise<ComponentSource[]> {
  const components: ComponentSource[] = [];
  for (const top of COMPONENT_DIRS) {
    const dir = path.join(repoRoot, top);
    const exists = await fs
      .stat(dir)
      .then((s) => s.isDirectory())
      .catch(() => false);
    if (!exists) continue;
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const componentDir = path.join(dir, entry.name);
      const skillPath = path.join(componentDir, getComponentFilename(top));
      const skillExists = await fs.stat(skillPath).then(() => true).catch(() => false);
      if (!skillExists) continue;
      const raw = await fs.readFile(skillPath, 'utf8');
      const parsed = matter(raw);
      let manifest;
      try {
        manifest = ManifestSchema.parse(parsed.data);
      } catch (err) {
        if (err instanceof Error) {
          const prefixed = new Error(
            `${path.relative(repoRoot, skillPath)}: ${err.message}`,
            { cause: err },
          );
          prefixed.stack = err.stack;
          throw prefixed;
        }
        throw err;
      }
      components.push({
        dir: componentDir,
        relativeDir: path.relative(repoRoot, componentDir),
        manifest,
        body: parsed.content,
      });
    }
  }
  return components;
}
