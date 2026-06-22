#!/usr/bin/env node
import { rmSync, mkdirSync, copyFileSync, cpSync, existsSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const verify = spawnSync(process.execPath, ['scripts/verify.mjs'], { stdio: 'inherit' });
if (verify.status !== 0) process.exit(verify.status ?? 1);

rmSync('public', { recursive: true, force: true });
mkdirSync('public', { recursive: true });
for (const file of ['index.html', 'app.js', 'styles.css', 'manifest.webmanifest', 'icon.svg']) {
  copyFileSync(file, `public/${file}`);
}
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
writeFileSync('public/config.js', `window.AZFITNESS_CONFIG=${JSON.stringify({ supabaseUrl, supabaseKey })};\n`);
if (existsSync('assets')) cpSync('assets', 'public/assets', { recursive: true });
console.log('AZFitness static files copied to public/ for Vercel.');
