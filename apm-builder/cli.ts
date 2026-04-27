import { defineCommand, runMain } from 'citty';
import pc from 'picocolors';
import { discoverComponents } from './lib/discover.ts';
import { validateComponents } from './lib/validate.ts';
import { runBuild } from './lib/build.ts';
import { TARGETS, type Target } from './lib/types.ts';
import { listImplementedTargets } from './adapters/index.ts';

const validateCmd = defineCommand({
  meta: { name: 'validate', description: 'Validate all components' },
  async run() {
    const repoRoot = process.cwd();
    const components = await discoverComponents(repoRoot);
    const errors = validateComponents(components);
    for (const e of errors) {
      const prefix = e.severity === 'error' ? pc.red('error') : pc.yellow('warn');
      console.log(`${prefix} [${e.componentName}] ${e.message}`);
    }
    const fatal = errors.filter((e) => e.severity === 'error');
    if (fatal.length > 0) {
      console.log(pc.red(`\n${fatal.length} validation error(s).`));
      process.exit(1);
    }
    console.log(pc.green(`OK (${components.length} components, ${errors.length} warnings).`));
  },
});

const buildCmd = defineCommand({
  meta: { name: 'build', description: 'Build per-target artifacts to dist/' },
  args: {
    target: { type: 'string', description: 'Target name (or "all")', default: 'all' },
    filter: { type: 'string', description: 'Glob filter on component names', required: false },
    'dry-run': { type: 'boolean', default: false },
    out: { type: 'string', default: 'dist' },
  },
  async run({ args }) {
    const repoRoot = process.cwd();
    let targets: Target[];
    if (args.target === 'all') targets = listImplementedTargets();
    else if ((TARGETS as readonly string[]).includes(args.target)) targets = [args.target as Target];
    else {
      console.log(pc.red(`unknown target: ${args.target}`));
      process.exit(1);
    }
    const result = await runBuild({
      repoRoot,
      targets,
      outDir: args.out,
      filter: args.filter,
      dryRun: args['dry-run'],
    });
    for (const e of result.errors) {
      const prefix = e.severity === 'error' ? pc.red('error') : pc.yellow('warn');
      console.log(`${prefix} [${e.componentName}] ${e.message}`);
    }
    if (result.errors.some((e) => e.severity === 'error')) process.exit(1);
    console.log(pc.green(`built ${result.written.length} file(s) across ${targets.length} target(s).`));
  },
});

const main = defineCommand({
  meta: { name: 'apm-builder', description: 'Multi-harness skills build tool' },
  subCommands: { validate: validateCmd, build: buildCmd },
});

runMain(main);
