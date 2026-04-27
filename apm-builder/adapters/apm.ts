import fs from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';
import type {
  Adapter,
  AdapterContext,
  ComponentSource,
  EmittedFile,
} from '../lib/types.ts';

interface ApmConfig {
  package_scope?: string;
}

/** Build the package directory name (filesystem-safe portion). */
function packageDir(component: ComponentSource): string {
  return component.manifest.name;
}

/** Apply the repo-level package_scope to produce the manifest's `name:` value. */
function scopedName(component: ComponentSource, ctx: AdapterContext): string {
  const cfg = (ctx.config as ApmConfig) ?? {};
  const override = component.manifest.overrides?.apm?.package_name;
  if (typeof override === 'string') return override;
  if (cfg.package_scope) return `${cfg.package_scope}/${component.manifest.name}`;
  return component.manifest.name;
}

/**
 * Serialize a manifest object to a stable YAML string. `lineWidth: 0` and
 * PLAIN string defaults keep golden tests deterministic across Node versions.
 * The `yaml` library auto-quotes scoped names that begin with `@`.
 */
function renderManifest(manifest: Record<string, unknown>): string {
  return YAML.stringify(manifest, {
    defaultStringType: 'PLAIN',
    defaultKeyType: 'PLAIN',
    lineWidth: 0,
  });
}

function emitSkill(component: ComponentSource, ctx: AdapterContext): EmittedFile[] {
  const dir = packageDir(component);
  const manifest: Record<string, unknown> = {
    name: scopedName(component, ctx),
    version: component.manifest.version,
    description: component.manifest.description,
  };
  if (component.manifest.author) manifest.author = component.manifest.author;
  if (component.manifest.license) manifest.license = component.manifest.license;
  manifest.type = 'skill';
  manifest.includes = 'auto';
  return [
    { path: `${dir}/apm.yml`, content: renderManifest(manifest) },
    {
      path: `${dir}/.apm/skills/${component.manifest.name}/SKILL.md`,
      content: component.body.trimStart(),
    },
  ];
}

export const apmAdapter: Adapter = {
  target: 'apm',

  supports(component) {
    return component.manifest.targets.includes('apm');
  },

  async emit(component, ctx) {
    switch (component.manifest.type) {
      case 'skill':
        return emitSkill(component, ctx);
      case 'agent':
        return emitAgent(component, ctx);
      case 'hook':
        return emitHook(component, ctx);
      default:
        throw new Error(`apm adapter: type "${component.manifest.type}" not yet implemented`);
    }
  },
};

async function emitHook(component: ComponentSource, ctx: AdapterContext): Promise<EmittedFile[]> {
  if (!component.manifest.hooks) return [];
  const dir = packageDir(component);
  const files: EmittedFile[] = [];
  const scripts: Record<string, string> = {};

  for (const [event, def] of Object.entries(component.manifest.hooks)) {
    const scriptName = path.basename(def.command);
    scripts[`hook:${event}:${scriptName}`] = `\${APM_PACKAGE_DIR}/.apm/hooks/${scriptName}`;
    const scriptPath = path.join(component.dir, def.command);
    const exists = await fs.stat(scriptPath).then(() => true).catch(() => false);
    if (exists) {
      const content = await fs.readFile(scriptPath);
      files.push({
        path: `${dir}/.apm/hooks/${scriptName}`,
        content,
        mode: 0o755,
      });
    }
  }

  const manifest: Record<string, unknown> = {
    name: scopedName(component, ctx),
    version: component.manifest.version,
    description: component.manifest.description,
    type: 'skill',
    includes: 'auto',
    scripts,
  };
  files.push({ path: `${dir}/apm.yml`, content: renderManifest(manifest) });
  return files;
}

function emitAgent(component: ComponentSource, ctx: AdapterContext): EmittedFile[] {
  const dir = packageDir(component);
  const lines = ['---', `description: ${component.manifest.description}`];
  if (component.manifest.agent?.tools) {
    lines.push(`tools: [${component.manifest.agent.tools.join(', ')}]`);
  }
  if (component.manifest.agent?.model) {
    lines.push(`model: ${component.manifest.agent.model}`);
  }
  lines.push('---');
  const agentMd = `${lines.join('\n')}\n\n${component.body.trimStart()}`;

  const manifest: Record<string, unknown> = {
    name: scopedName(component, ctx),
    version: component.manifest.version,
    description: component.manifest.description,
    type: 'skill',
    includes: 'auto',
  };
  return [
    { path: `${dir}/apm.yml`, content: renderManifest(manifest) },
    { path: `${dir}/.apm/agents/${component.manifest.name}.agent.md`, content: agentMd },
  ];
}
