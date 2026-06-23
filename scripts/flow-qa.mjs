#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { JSDOM, VirtualConsole } from 'jsdom';
import nodeCrypto from 'node:crypto';

const html = readFileSync('index.html', 'utf8');
const js = readFileSync('app.js', 'utf8');
const config = "window.AZFITNESS_CONFIG={supabaseUrl:'',supabaseKey:''};";
const errors = [];
const virtualConsole = new VirtualConsole();
virtualConsole.on('error', msg => errors.push(String(msg)));
virtualConsole.on('jsdomError', err => errors.push(String(err?.message || err)));

const dom = new JSDOM(html, {
  url: 'https://azfitness.local/',
  runScripts: 'outside-only',
  pretendToBeVisual: true,
  virtualConsole
});
const { window } = dom;
window.console = { ...console, error: (...args) => errors.push(args.join(' ')), warn: () => {} };
Object.defineProperty(window, 'crypto', { value: nodeCrypto.webcrypto, configurable: true });
window.HTMLCanvasElement.prototype.getContext = () => ({
  clearRect(){}, fillRect(){}, strokeRect(){}, beginPath(){}, moveTo(){}, lineTo(){}, stroke(){}, fill(){}, arc(){}, drawImage(){}, fillText(){}, save(){}, restore(){},
  set fillStyle(v){}, set strokeStyle(v){}, set lineWidth(v){}, set shadowColor(v){}, set shadowBlur(v){}, set font(v){}
});
window.navigator.geolocation = {
  watchPosition(success){ success({ coords: { latitude: 44.31, longitude: -69.78, speed: 1.4 } }); return 1; },
  clearWatch(){},
  getCurrentPosition(success){ success({ coords: { latitude: 44.31, longitude: -69.78 } }); }
};
window.navigator.mediaDevices = { getUserMedia: async () => ({ getTracks: () => [{ stop(){} }] }) };
window.fetch = async url => {
  if (String(url).includes('openfoodfacts')) return { json: async () => ({ products: [] }) };
  if (String(url).includes('open-meteo')) return { json: async () => ({ current: { temperature_2m: 20, relative_humidity_2m: 50, apparent_temperature: 20, uv_index: 3, wind_speed_10m: 4 } }) };
  if (String(url).includes('wger')) return { json: async () => ({ results: [{ id: 1, translations: [{ name: 'Air Squat', description: '<p>Bodyweight squat</p>' }], muscles: [{ name: 'Quadriceps' }], equipment: [] }] }) };
  return { ok: true, json: async () => [] };
};

function assert(name, ok) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
  if (!ok) process.exitCode = 1;
}
function text() { return window.document.body.textContent.replace(/\s+/g, ' ').trim(); }
function qs(sel) { return window.document.querySelector(sel); }
function qsa(sel) { return [...window.document.querySelectorAll(sel)]; }
function set(sel, value) { const el = qs(sel); if (!el) throw new Error(`missing ${sel}`); el.value = value; el.dispatchEvent(new window.Event('input', { bubbles: true })); el.dispatchEvent(new window.Event('change', { bubbles: true })); }
async function click(selOrEl) { const el = typeof selOrEl === 'string' ? qs(selOrEl) : selOrEl; if (!el) throw new Error(`missing click target ${selOrEl}`); if (typeof el.click === 'function') el.click(); else el.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true })); await new Promise(r => setTimeout(r, 5)); }

window.eval(config);
window.eval(js);
await new Promise(r => setTimeout(r, 20));

assert('fresh app starts with create profile flow', text().includes('Create your first athlete profile'));
assert('fresh app does not show fake starter stats', !text().includes('100 lb') && !text().includes('190 lb'));

set('#newName', 'QA Athlete');
set('#newBirthday', '2010-04-05');
set('#newSex', 'male');
set('#newHeightFt', '5');
set('#newHeightIn', '8');
set('#newWeightLb', '150');
set('#newLevel', 'medium');
set('#newGoals', 'strengthen core, walk');
set('#newLimitations', 'none');
set('#newPin', '1234');
set('#newPin2', '1234');
await click('#createAthlete');
await new Promise(r => setTimeout(r, 30));

assert('profile creation lands on dashboard', text().includes('Today’s command center'));
assert('today ask uses multi-select dropdown', !!qs('#askSelect') && text().includes('Pick up to 3 things for today'));
assert('real profile stats render after entry', text().includes('150 lb') && text().includes("5'8"));
assert('bottom nav exists with five tabs', qsa('.bottom-tab').length === 5);

const bottomExpect = [
  ['dashboard', 'Today’s command center'],
  ['goals', 'Targets, choices, generated plans'],
  ['coach', 'MediaPipe pose landmarks'],
  ['fuel', 'Food search, calories'],
  ['profile', 'Athlete account and settings']
];
for (const [tab, expected] of bottomExpect) {
  await click(`.bottom-tab[data-tab="${tab}"]`);
  assert(`bottom tab ${tab} loads ${expected}`, text().includes(expected));
}

const sideExpect = [
  ['builder', 'Pick, customize, and launch routines'],
  ['health', 'Samsung-style manual'],
  ['route', 'Live GPS map'],
  ['muscles', 'Clickable body map'],
  ['timeline', 'Photos, workouts, routes']
];
for (const [tab, expected] of sideExpect) {
  await click(`.nav[data-tab="${tab}"]`);
  assert(`side tab ${tab} loads ${expected}`, text().includes(expected));
}

await click('.nav[data-tab="goals"]');
assert('goals page uses dropdown selectors', !!qs('#goalPick') && !!qs('#activityPick') && !!qs('#loadPick'));
set('#targetName', 'Walk miles');
set('#targetAmount', '5');
set('#targetUnit', 'miles');
await click('#addTarget');
assert('weekly target saves and remains visible', text().includes('Walk miles') && text().includes('5 miles'));

await click('.nav[data-tab="builder"]');
assert('workout library uses dropdown selector', !!qs('#workoutPick') && text().includes('Choose routine'));
set('#workoutFilter', 'core');
await click('#filterBtn');
assert('builder filter keeps routine list usable', text().includes('Core Armor'));

await click('.nav[data-tab="fuel"]');
set('#foodQ', 'soda');
await click('#foodSearch');
await new Promise(r => setTimeout(r, 20));
assert('food search displays selectable food and drink results', text().includes('soda') || text().includes('Cola'));
assert('drink entries can be added to diet log', text().includes('drink') && text().includes('Add to diet log'));

await click('.nav[data-tab="route"]');
set('#manualLat', '44.31');
set('#manualLng', '-69.78');
await click('#addPoint');
set('#manualLat', '44.32');
set('#manualLng', '-69.79');
await click('#addPoint');
await click('#stopRoute');
assert('manual route can save route history', text().includes('Saved editable routes') && text().includes('mi'));
assert('route map shows GPS live map and step estimate', text().includes('Steps est.') && !!qs('#routeMap'));

await click('.nav[data-tab="health"]');
await click('#fetchWeather');
await new Promise(r => setTimeout(r, 20));
assert('weather renders Fahrenheit not Celsius', text().includes('°F') && !text().includes('°C'));

await click('.nav[data-tab="builder"]');
set('#workoutPick', 'route-mission');
await click('#startPicked');
assert('route activity asks outside track or treadmill', text().includes('Outside / trail / road') && text().includes('Treadmill with camera'));

await click('.nav[data-tab="muscles"]');
const muscle = qs('[data-muscle="core"]');
await click(muscle);
assert('muscle map click shows workouts', text().includes('Core') && text().includes('Focus workouts'));

assert('no console/runtime errors during app flow', errors.length === 0);
if (errors.length) console.error(errors.join('\n'));
