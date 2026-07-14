#!/usr/bin/env node
// publish-html.mjs — upload a standalone HTML file to an encrypted artifact Worker
// Node 22+ required (Wrangler 4.x tooling requires Node 22+; CI uses Node 24)

import { readFileSync, unlinkSync } from 'node:fs';
import { basename } from 'node:path';
import { spawnSync } from 'node:child_process';

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);

function hasFlag(flag) {
  return args.includes(flag);
}

function flagValue(flag) {
  const idx = args.indexOf(flag);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : undefined;
}

if (hasFlag('--help') || hasFlag('-h')) {
  console.log(`
Usage: node scripts/publish-html.mjs [options] <file.html>

Options:
  --title <text>     Title for the artifact (default: filename)
  --ttl <duration>   Time-to-live: 1h, 6h, 24h, 7d, 30d, never (default: 7d)
  --slug <slug>      Optional vanity slug
  --delete-local     Delete the local HTML file after a successful upload
  --json             Print only machine-readable JSON (no friendly output)
  --copy             Copy the viewer URL to clipboard even with --json
  --no-clipboard     Never attempt to copy the viewer URL to clipboard
  --help             Show this help

Environment variables (required):
  HTML_PUBLISHER_URL    Base URL of the publisher Worker
  HTML_PUBLISHER_TOKEN  Bearer token for the Worker API

Clipboard:
  Human output (no --json): viewer URL is copied to clipboard automatically.
  Machine output (--json): clipboard is skipped unless --copy is also given.
  Use --no-clipboard to suppress clipboard in any mode.

Share URL format:
  https://<your-domain>/v/<id>#<base64url-key>
  The decryption key lives only in the URL fragment — the server never sees it.
`);
  process.exit(0);
}

const jsonOnly    = hasFlag('--json');
const deleteLocal = hasFlag('--delete-local');
const copyFlag    = hasFlag('--copy');
const noClipboard = hasFlag('--no-clipboard');
const titleFlag   = flagValue('--title');
const ttlFlag     = flagValue('--ttl') ?? '7d';
const slugFlag    = flagValue('--slug');

// Copy to clipboard unless: explicitly suppressed, or machine mode without --copy
const shouldCopy = !noClipboard && (!jsonOnly || copyFlag);

// Collect positional arguments (not flags and not their values)
const flagsWithValues = new Set(['--title', '--ttl', '--slug']);
const positional = [];
for (let i = 0; i < args.length; i++) {
  if (flagsWithValues.has(args[i])) { i++; continue; }
  if (args[i].startsWith('-'))       continue;
  positional.push(args[i]);
}

const filePath = positional[0];
if (!filePath) {
  console.error('Error: HTML file path is required.\nRun with --help for usage.');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// TTL parsing
// ---------------------------------------------------------------------------

function parseTtl(raw) {
  if (raw === 'never') return 0;
  const m = raw.match(/^(\d+)(h|d)$/);
  if (!m) {
    console.error(`Error: invalid --ttl "${raw}". Expected e.g. 1h, 6h, 24h, 7d, 30d, never`);
    process.exit(1);
  }
  const n = parseInt(m[1], 10);
  return m[2] === 'h' ? n * 3_600 : n * 86_400;
}

const ttlSeconds = parseTtl(ttlFlag);

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

const baseUrl = process.env.HTML_PUBLISHER_URL?.replace(/\/$/, '');
const token   = process.env.HTML_PUBLISHER_TOKEN;

if (!baseUrl) {
  console.error('Error: HTML_PUBLISHER_URL environment variable is required');
  process.exit(1);
}
if (!token) {
  console.error('Error: HTML_PUBLISHER_TOKEN environment variable is required');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Read & validate
// ---------------------------------------------------------------------------

let html;
try {
  html = readFileSync(filePath, 'utf8');
} catch (err) {
  console.error(`Error reading file: ${err.message}`);
  process.exit(1);
}

const trimmedLower = html.trimStart().toLowerCase();
if (!trimmedLower.startsWith('<!doctype html') && !trimmedLower.startsWith('<html')) {
  console.error(
    'Error: file does not appear to be a standalone HTML document.\n' +
    '  Expected content to start with <!doctype html or <html',
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Scan for external references
// ---------------------------------------------------------------------------

const warnings = [];

// Catch all http/https URLs anywhere in the document
const urlMatches = html.match(/https?:\/\/[^\s"'>)\]]+/g) ?? [];
const uniqueUrls = [...new Set(urlMatches)];
for (const url of uniqueUrls) {
  warnings.push(`external URL: ${url}`);
}

if (warnings.length > 0 && !jsonOnly) {
  console.warn(`\nWarning: ${warnings.length} external reference(s) detected.`);
  const sample = warnings.slice(0, 10);
  for (const w of sample) console.warn(`  Warning: ${w}`);
  if (warnings.length > 10) console.warn(`  … and ${warnings.length - 10} more`);
  console.warn(
    '  Artifact may not render offline and could leak referrer information.\n',
  );
}

// ---------------------------------------------------------------------------
// Encrypt with AES-256-GCM (Web Crypto — no import needed in Node 20+)
// ---------------------------------------------------------------------------

const plaintext = new TextEncoder().encode(html);

const key = await globalThis.crypto.subtle.generateKey(
  { name: 'AES-GCM', length: 256 },
  /* extractable */ true,
  ['encrypt', 'decrypt'],
);

const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));

const ciphertextBuf = await globalThis.crypto.subtle.encrypt(
  { name: 'AES-GCM', iv },
  key,
  plaintext,
);

const rawKey = await globalThis.crypto.subtle.exportKey('raw', key);

// SHA-256 of ciphertext — the Worker can verify this without decrypting.
const sha256Buf = await globalThis.crypto.subtle.digest('SHA-256', ciphertextBuf);
const sha256Hex = Array.from(new Uint8Array(sha256Buf))
  .map((b) => b.toString(16).padStart(2, '0'))
  .join('');

// Base64url encode (Buffer.from supports 'base64url' in Node 16+)
const toB64u = (buf) => Buffer.from(buf).toString('base64url');

const encryptedPayload = toB64u(ciphertextBuf);
const ivB64u           = toB64u(iv);
const keyB64u          = toB64u(rawKey);

// ---------------------------------------------------------------------------
// POST /api/pages
// ---------------------------------------------------------------------------

const sourceName = basename(filePath);
const title      = titleFlag ?? sourceName;

const requestBody = {
  encryptedPayload,
  iv:         ivB64u,
  sha256:     sha256Hex,
  title,
  sourceName,
  ttlSeconds,
  ...(slugFlag        ? { slug: slugFlag } : {}),
};

let response;
try {
  response = await fetch(`${baseUrl}/api/pages`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(requestBody),
  });
} catch (err) {
  console.error(`Error: network request failed — ${err.message}`);
  process.exit(1);
}

if (!response.ok) {
  const body = await response.text().catch(() => '');
  console.error(`Error: upload failed with HTTP ${response.status}`);
  if (body) console.error(body);
  process.exit(1);
}

const result = await response.json();

// Append the key fragment — the server never receives it
const viewerUrl = `${result.viewerUrl}#${keyB64u}`;

// ---------------------------------------------------------------------------
// Clipboard — best-effort, never fatal
// ---------------------------------------------------------------------------

function copyToClipboard(text) {
  const { platform } = process;

  if (platform === 'darwin') {
    const r = spawnSync('pbcopy', { input: text });
    return !r.error && r.status === 0;
  }

  if (platform === 'win32') {
    // clip.exe reads from stdin; shell:true handles cmd.exe path resolution
    const r = spawnSync('clip', { input: text, shell: true });
    return !r.error && r.status === 0;
  }

  // Linux — try each tool in order; skip when not installed (ENOENT)
  for (const [cmd, extra] of [
    ['wl-copy', []],
    ['xclip',   ['-selection', 'clipboard']],
    ['xsel',    ['--clipboard', '--input']],
  ]) {
    const r = spawnSync(cmd, extra, { input: text });
    if (!r.error && r.status === 0) return true;
  }

  return false;
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

const output = {
  id:          result.id,
  viewerUrl,
  blobUrl:     result.blobUrl,
  expiresAt:   result.expiresAt ?? null,
  deleteToken: result.deleteToken,
  warnings:    warnings.length,
  warningMessages: warnings,
};

if (jsonOnly) {
  console.log(JSON.stringify(output));
} else {
  console.log(JSON.stringify(output, null, 2));
  console.log(`\nPublished: ${viewerUrl}`);
  if (result.expiresAt) {
    console.log(`   Expires:   ${new Date(result.expiresAt).toLocaleString()}`);
  }
  if (warnings.length > 0) {
    console.log(
      `   Warning: ${warnings.length} external reference(s) — artifact may depend on live URLs`,
    );
  }
}

// Clipboard — best-effort; upload already succeeded, failure is non-fatal
if (shouldCopy) {
  const copied = copyToClipboard(viewerUrl);
  if (jsonOnly) {
    // --json --copy: stdout stays clean JSON; clipboard note goes to stderr
    process.stderr.write(copied ? '# clipboard: copied\n' : '# clipboard: unavailable\n');
  } else {
    console.log(copied ? '   Copied to clipboard' : '   Clipboard unavailable');
  }
}

// ---------------------------------------------------------------------------
// Delete local file — only after confirmed successful upload
// ---------------------------------------------------------------------------

if (deleteLocal) {
  try {
    unlinkSync(filePath);
    if (!jsonOnly) console.log(`   Deleted:   ${filePath}`);
  } catch (err) {
    if (!jsonOnly) console.warn(`   Warning: could not delete ${filePath} — ${err.message}`);
  }
}
