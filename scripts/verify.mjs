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
  ['workout library present', js.includes('Gold Strength Builder') && js.includes('Run/Walk Route Mission')],
  ['MediaPipe pose integration present', js.includes('@mediapipe/tasks-vision') && js.includes('PoseLandmarker')],
  ['PIN login present', js.includes('First login PIN is 0000') && js.includes('hashPin')],
  ['imperial profile fields present', js.includes('heightFt') && js.includes('weightLb') && js.includes('mph')],
  ['food search/meal plans present', js.includes('world.openfoodfacts.org') && js.includes('mealPlanHtml')],
  ['GPS route tracker present', js.includes('watchPosition') && js.includes('routeMiles')],
  ['photos/timeline present', js.includes('savePhoto') && js.includes('Clickable history timeline')],
  ['Supabase cloud sync present', js.includes('azfitness_sync') && js.includes('AZFITNESS_CONFIG') && html.includes('config.js')],
  ['local storage present', js.includes('localStorage')],
  ['responsive css present', css.includes('@media(max-width:980px)')]
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
