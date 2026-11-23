// GTA 6 x make.fun X meme bounty entry (gta6-meme-x-01)
// Deterministically validates and emits POST.json into MAKEFUN_OUTPUT_DIR (/output).

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface PostManifest {
  url: string;
}

const MAX_POST_JSON_BYTES = 16384;
const X_STATUS_PATTERN =
  /^https:\/\/(?:(?:www|mobile)\.)?(?:x\.com|twitter\.com)\/(?:[A-Za-z0-9_]{1,15}|i\/web)\/status\/(\d+)(?:[?#].*)?$/;

function loadPostManifest(sourceDir: string): PostManifest {
  const inputPath = resolve(sourceDir, 'POST.json');
  const rawBuffer = readFileSync(inputPath);

  if (rawBuffer.byteLength > MAX_POST_JSON_BYTES) {
    throw new Error(`POST.json exceeds ${MAX_POST_JSON_BYTES} bytes (${rawBuffer.byteLength})`);
  }

  const parsed = JSON.parse(rawBuffer.toString('utf8')) as Partial<PostManifest>;
  if (typeof parsed.url !== 'string' || !X_STATUS_PATTERN.test(parsed.url.trim())) {
    throw new Error(`Invalid X post URL in ${inputPath}: ${String(parsed.url)}`);
  }

  return { url: parsed.url.trim() };
}

function main(): void {
  const botRoot = process.env.MAKEFUN_BOT_DIR || '/bot';
  const outputRoot = process.env.MAKEFUN_OUTPUT_DIR || '/output';

  const manifest = loadPostManifest(botRoot);
  mkdirSync(outputRoot, { recursive: true });

  const destinationPath = resolve(outputRoot, 'POST.json');
  const serialized = `${JSON.stringify(manifest, null, 2)}\n`;
  writeFileSync(destinationPath, serialized, 'utf8');
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`gta6-meme-x-01 entry failed: ${message}`);
  process.exit(1);
}
