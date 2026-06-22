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
  ['no profile switcher inside app', js.includes('Log out / switch athlete') && js.includes('Log in before switching profiles')],
  ['imperial profile fields present', js.includes('heightFt') && js.includes('weightLb') && js.includes('mph')],
  ['weekly targets present', js.includes('Weekly target entry') && js.includes('targetUnit')],
  ['food search/meal plans present', js.includes('world.openfoodfacts.org') && js.includes('mealPlanHtml')],
  ['custom workout builder present', js.includes('Custom workout builder') && js.includes('saveCustomWorkout')],
  ['health monitors present', js.includes('blood oxygen') && js.includes('Health Connect') && js.includes('Samsung Health')],
  ['weather/environment present', js.includes('api.open-meteo.com') && js.includes('UV index')],
  ['GPS route tracker present', js.includes('watchPosition') && js.includes('routeMiles') && js.includes('OpenStreetMap')],
  ['route editing present', js.includes('editRoute') && js.includes('Add manual point')],
  ['muscle map present', js.includes('Detailed front/back muscle atlas') && js.includes('data-muscle')],
  ['detailed anatomy graphics present', js.includes('muscleSvg(\'front\')') && css.includes('muscle-atlas') && css.includes('anatomy')],
  ['open-source exercise data present', js.includes('wger.de/api/v2/exercise') && js.includes('wger exercise catalog results')],
  ['professional health rings present', js.includes('Professional health monitor board') && css.includes('metric-ring')],
  ['android app chrome present', js.includes('ANDROID GOLD HEALTH OS') && js.includes('bottom-nav') && css.includes('Android-grade product polish') && css.includes('bottom-tab')],
  ['open data source badges present', js.includes('Open Food Facts') && js.includes('Open-Meteo') && js.includes('wger Exercise API')],
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
