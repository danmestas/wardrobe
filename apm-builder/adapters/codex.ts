import type {
  Adapter,
  AdapterContext,
  ComponentSource,
  EmittedFile,
} from '../lib/types.ts';
import {
  composeAgentsMd,
  DEFAULT_SECTION_ORDER,
  type AgentsMdSection,
} from '../lib/agents-md.ts';

const TARGET = 'codex' as const;

export const codexAdapter: Adapter = {
  target: TARGET,

  supports(component) {
    return component.manifest.targets.includes(TARGET);
  },

  async emit(component, ctx) {
    switch (component.manifest.type) {
      case 'skill':
      case 'agent':
      case 'rules':
        return emitAgentsMd(component, ctx);
      // hook + mcp added in Tasks 8 + 9.
      // plugin is schema-rejected for codex (see Plan 1's validate.ts).
      default:
        throw new Error(
          `codex adapter: type "${component.manifest.type}" not yet implemented`,
        );
    }
  },
};

/**
 * Emit `AGENTS.md` exactly once across all content-bearing component invocations.
 * The "alphabetically-first content-bearing component targeting codex" wins;
 * everyone else returns []. Same idempotency pattern as the claude-code rules
 * adapter in Plan 1.
 */
function emitAgentsMd(
  component: ComponentSource,
  ctx: AdapterContext,
): EmittedFile[] {
  const contentBearing = ctx.allComponents
    .filter(
      (c) =>
        (c.manifest.type === 'skill' ||
          c.manifest.type === 'agent' ||
          c.manifest.type === 'rules') &&
        c.manifest.targets.includes(TARGET),
    )
    .sort((a, b) => a.manifest.name.localeCompare(b.manifest.name));

  if (contentBearing[0]?.manifest.name !== component.manifest.name) return [];

  const sectionOrder = readSectionOrder(ctx.config);
  const content = composeAgentsMd({
    target: TARGET,
    components: ctx.allComponents,
    sectionOrder,
  });
  return [{ path: 'AGENTS.md', content }];
}

function readSectionOrder(config: Record<string, unknown>): AgentsMdSection[] {
  const raw = config['agents_md_section_order'];
  if (!Array.isArray(raw)) return DEFAULT_SECTION_ORDER;
  const valid: AgentsMdSection[] = ['rules', 'agents', 'skills'];
  const filtered = raw.filter((x): x is AgentsMdSection =>
    valid.includes(x as AgentsMdSection),
  );
  // Fill in any missing sections at the end so we never lose content.
  for (const s of valid) if (!filtered.includes(s)) filtered.push(s);
  return filtered;
}
