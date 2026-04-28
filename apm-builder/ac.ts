#!/usr/bin/env node
import { runAc } from './lib/ac/run.ts';

const argv = process.argv.slice(2);
runAc(argv).then(
  (code) => process.exit(code),
  (err) => {
    process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`);
    process.exit(2);
  },
);
