import { simpleGit } from 'simple-git';
import type { Target } from '../../types.ts';

export interface GitUrlReleaseOptions {
  repoRoot: string;
  tag: string;
  skill: string;
  version: string;
  /** Git host + repo, e.g. "github.com/danmestas/agent-skills". */
  gitRepo: string;
  targets: Target[];
}

/**
 * "Publish" a git-URL release. The published git tag IS the installable
 * artifact for these targets — there is no registry to push to. This function
 * verifies the tag exists at HEAD and emits a target -> install-URL map that
 * upstream callers (orchestrator + release notes) can surface to humans.
 */
export async function publishGitUrl(
  opts: GitUrlReleaseOptions,
): Promise<{ installUrls: Partial<Record<Target, string>> }> {
  const g = simpleGit(opts.repoRoot);
  const tags = await g.tags();
  if (!tags.all.includes(opts.tag)) {
    throw new Error(
      `tag "${opts.tag}" is not present in this repo; cannot publish git-URL release`,
    );
  }
  const installUrls: Partial<Record<Target, string>> = {};
  for (const t of opts.targets) {
    installUrls[t] = `${opts.gitRepo}@${opts.tag}`;
  }
  return { installUrls };
}
