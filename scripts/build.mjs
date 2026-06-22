#!/usr/bin/env node
import { rmSync, mkdirSync, copyFileSync, cpSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const verify = spawnSync(process.execPath, ['scripts/verify.mjs'], { stdio: 'inherit' });
if (verify.status !== 0) process.exit(verify.status ?? 1);

rmSync('public', { recursive: true, force: true });
mkdirSync('public', { recursive: true });
for (const file of ['index.html', 'app.js', 'styles.css', 'manifest.webmanifest', 'icon.svg']) {
  copyFileSync(file, `public/${file}`);
}
if (existsSync('assets')) cpSync('assets', 'public/assets', { recursive: true });
console.log('AZFitness static files copied to public/ for Vercel.');
