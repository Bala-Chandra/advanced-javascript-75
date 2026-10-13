import { readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const folders = readdirSync(resolve(root, 'programs')).sort();
const [action = 'list', number] = process.argv.slice(2);

if (action === 'list') {
  for (const folder of folders) console.log(folder);
  process.exit(0);
}

if (!['run', 'test'].includes(action)) {
  console.error('Expected action: list, run, or test');
  process.exit(1);
}

const n = Number(number);
if (!Number.isInteger(n) || n < 1 || n > 75) {
  console.error('Specify a number from 1 to 75, e.g. npm run run -- 8');
  process.exit(1);
}

const folder = folders.find(f => f.startsWith(String(n).padStart(2, '0') + '-'));
if (!folder) {
  console.error(`Program ${n} not found`);
  process.exit(1);
}

const file = resolve(root, 'programs', folder, action === 'test' ? 'solution.test.js' : 'run.js');
const args = action === 'test'
  ? [resolve(root, 'node_modules', 'vitest', 'vitest.mjs'), 'run', file]
  : [file];
const result = spawnSync(process.execPath, args, { cwd: root, stdio: 'inherit' });
process.exit(result.status ?? 1);
