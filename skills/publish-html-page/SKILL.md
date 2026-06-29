---
name: publish-html-page
version: 1.0.0
type: skill
targets: [claude-code, codex, gemini, pi]
description: Publish a self-contained HTML file to a shareable encrypted Cloudflare-hosted artifact URL using html-artifact-publisher. Use when asked to upload, publish, share, or host a generated HTML page/artifact/explainer via artifacts.craftdesign.group or the HTML artifact publisher.
---

# publish-html-page

Publish a self-contained HTML file to a shareable encrypted URL. The Worker stores encrypted HTML bytes; metadata such as title, source name, expiry, and slug remains plaintext. The decryption key lives only in the URL `#fragment` and never reaches the server.

## Use when

Use after generating a standalone HTML explainer, report, prototype, or artifact file that should be viewable by URL. Confirm the file is self-contained first: inline assets are preferred; external URLs may leak referrer data or fail offline.

## Implementation location

Run the colocated publisher from the wardrobe repo root (Node 22+ required):

```bash
node skills/publish-html-page/scripts/publish-html.mjs [options] <file.html>
```

Required environment:

```bash
HTML_PUBLISHER_URL=https://artifacts.craftdesign.group
HTML_PUBLISHER_TOKEN=<bearer token>
```

Never print, persist, or pass the bearer token in a way that exposes it in logs.

## CLI reference

```bash
node skills/publish-html-page/scripts/publish-html.mjs [options] <file.html>

  --title <text>     Human-readable title (default: filename)
  --ttl <duration>   1h | 6h | 24h | 7d | 30d | never  (default: 7d)
  --slug <slug>      Optional vanity slug
  --delete-local     Delete local HTML only after confirmed successful upload
  --json             Machine-readable JSON output only
  --copy             Copy viewer URL to clipboard even with --json
  --no-clipboard     Never attempt clipboard copy
```

## Workflow

1. Confirm the target file starts with `<!doctype html` or `<html`.
2. Prefer `--json` when running as an agent so stdout is parseable.
3. Set `HTML_PUBLISHER_URL` and `HTML_PUBLISHER_TOKEN` through the tool environment, not inline in prose.
4. Run the publisher with a useful `--title` and appropriate `--ttl`.
5. Return only `viewerUrl` unless the user needs deletion/revocation details.
6. Preserve and report `warningMessages`; external-resource warnings matter.

Example:

```bash
HTML_PUBLISHER_URL=https://artifacts.craftdesign.group \
HTML_PUBLISHER_TOKEN="$HTML_PUBLISHER_TOKEN" \
node skills/publish-html-page/scripts/publish-html.mjs /path/to/page.html --title "Artifact title" --ttl 30d --json
```

## Rules

- Share the full `viewerUrl`, including the `#fragment`; without it the browser cannot decrypt.
- Treat `viewerUrl` as a secret-bearing link: anyone with the full URL can read the artifact.
- Do not expose `deleteToken` unless the user may need to revoke the artifact early.
- Use `--delete-local` only for files generated in the current session and only after upload succeeds.
- Never delete the source file manually before upload completes.
- If upload fails, leave the file untouched and report the exact error.
- Clipboard copy is best-effort; failure does not mean upload failed.

## Success output

```json
{
  "id": "abc123",
  "viewerUrl": "https://artifacts.craftdesign.group/v/abc123#<base64url-key>",
  "blobUrl": "https://artifacts.craftdesign.group/blob/abc123",
  "expiresAt": "2026-07-23T00:00:00.000Z",
  "deleteToken": "deadbeef…",
  "warnings": 0,
  "warningMessages": []
}
```
