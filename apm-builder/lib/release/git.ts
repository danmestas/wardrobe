import { simpleGit } from 'simple-git';

export interface TagReleaseOptions {
  repoRoot: string;
  skill: string;
  version: string;
  /** Set false in tests; defaults true (push to origin). */
  push?: boolean;
  /** Optional annotated message; defaults to "Release <tag>". */
  message?: string;
}

/** Compute the canonical "<skill>@v<version>" tag name. */
export function computeTag(skill: string, version: string): string {
  return `${skill}@v${version}`;
}

/**
 * Annotate-tag HEAD with "<skill>@v<version>" and (by default) push the tag to
 * origin. Refuses to operate if the tag already exists locally.
 */
export async function tagRelease(opts: TagReleaseOptions): Promise<string> {
  const tag = computeTag(opts.skill, opts.version);
  const g = simpleGit(opts.repoRoot);
  const existing = await g.tags();
  if (existing.all.includes(tag)) {
    throw new Error(`tag "${tag}" already exists; refusing to retag`);
  }
  const message = opts.message ?? `Release ${tag}`;
  await g.addAnnotatedTag(tag, message);
  if (opts.push !== false) {
    await g.push('origin', tag);
  }
  return tag;
}
