#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';

const required = ['index.html', 'app.js', 'styles.css', 'manifest.webmanifest', 'icon.svg'];
const missing = required.filter(file => !existsSync(file));
if (missing.length) {
  console.error(`Missing required files: ${missing.join(', ')}`);
  process.exit(1);
}

const html = readFileSync('index.html', 'utf8');
const js = readFileSync('app.js', 'utf8');
const css = readFileSync('styles.css', 'utf8');
const manifest = JSON.parse(readFileSync('manifest.webmanifest', 'utf8'));

const checks = [
  ['index loads app.js', html.includes('src="./app.js"')],
  ['index loads styles.css', html.includes('href="./styles.css"')],
  ['manifest has app name', manifest.name === 'AZFitness'],
  ['camera coach present', js.includes('navigator.mediaDevices.getUserMedia')],
  ['workout library present', js.includes('Foundation Strength') && js.includes('Adventure Day')],
  ['local storage present', js.includes('localStorage')],
  ['responsive css present', css.includes('@media(max-width:820px)')]
];

let failed = false;
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
  if (!ok) failed = true;
}

new Function(js);
console.log('PASS app.js parses as JavaScript');
if (failed) process.exit(1);
console.log('AZFitness static verification complete.');
