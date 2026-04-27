import type {
  Adapter,
  ComponentSource,
  EmittedFile,
} from '../lib/types.ts';

export const geminiAdapter: Adapter = {
  target: 'gemini',

  supports(component) {
    return component.manifest.targets.includes('gemini');
  },

  async emit(component, _ctx) {
    switch (component.manifest.type) {
      case 'skill':
        return emitSkill(component);
      // Tasks 3-5 add: rules, hook, mcp.
      // agent and plugin are schema-rejected by validate.ts (compatibility matrix).
      default:
        throw new Error(
          `gemini adapter: type "${component.manifest.type}" is not supported on Gemini`,
        );
    }
  },
};

function emitSkill(component: ComponentSource): EmittedFile[] {
  const { manifest, body } = component;

  // Metadata: loaded at session start, used by Gemini's skill index.
  const metadata = {
    name: manifest.name,
    version: manifest.version,
    description: manifest.description,
    ...(manifest.tags ? { tags: manifest.tags } : {}),
    body_path: 'skill.md',
  };

  // Skill body: loaded only when Gemini calls activate_skill.
  const bodyFrontmatter = [
    '---',
    `name: ${manifest.name}`,
    `description: ${manifest.description}`,
    '---',
  ].join('\n');

  return [
    {
      path: `skills/${manifest.name}/metadata.json`,
      content: `${JSON.stringify(metadata, null, 2)}\n`,
    },
    {
      path: `skills/${manifest.name}/skill.md`,
      content: `${bodyFrontmatter}\n\n${body.trimStart()}`,
    },
  ];
}
