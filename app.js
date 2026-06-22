const STORAGE_KEY = 'azfitness-v1';
const todayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());

const workouts = [
  { id:'mon-foundation-strength', day:'Monday', title:'Foundation Strength', category:'Strength', focus:'Legs, glutes, push strength, and clean basics', duration:32, intensity:3, exercises:[
    ex('Bodyweight squat',['quads','glutes','core'],'3 sets','10-14 reps',['Feet tripod: big toe, pinky toe, heel','Knees track over toes','Chest tall'],['knee cave','hip depth','torso angle']),
    ex('Incline push-up',['chest','triceps','shoulders','core'],'3 sets','8-12 reps',['Straight line ear-shoulder-hip-ankle','Elbows 30-45 degrees','Exhale while pressing'],['hip sag','elbow flare','neck position']),
    ex('Backpack row',['lats','upper back','biceps'],'3 sets','10-12 reps',['Pull elbows to pockets','Pause shoulder blades together','Slow lower'],['rounded shoulders','uneven pull']),
    ex('Dead bug',['deep core','hip flexors'],'3 sets','6 each side',['Low back gently pinned','Opposite arm and leg','Slow nasal breathing'],['rib flare','low-back arch'])
  ]},
  { id:'tue-cardio-engine', day:'Tuesday', title:'Cardio Engine + Steps', category:'Cardio', focus:'Heart health, endurance, step streak', duration:28, intensity:3, exercises:[
    ex('Brisk walk / hike intervals',['heart','calves','glutes'],'6 rounds','2 min brisk + 1 min easy',['Tall posture','Relax hands','Nose inhale / mouth exhale'],['stride symmetry','shoulder tension']),
    ex('Step-up',['quads','glutes','calves'],'3 sets','8 each side',['Whole foot on step','Drive through heel','Control the down'],['knee tracking','hip drop']),
    ex('Box breathing cooldown',['diaphragm'],'4 rounds','4-4-4-4 count',['Inhale 4','Hold 4','Exhale 4','Hold 4'],['shoulder breathing','rib motion'])
  ]},
  { id:'wed-mobility-core', day:'Wednesday', title:'Mobility + Core Control', category:'Mobility', focus:'Hips, ankles, shoulders, and balance', duration:25, intensity:2, exercises:[
    ex('World greatest stretch',['hips','hamstrings','thoracic spine'],'2 sets','5 each side',['Long back leg','Elbow toward instep','Rotate through upper back'],['back knee bend','rotation range']),
    ex('Bear plank shoulder taps',['core','shoulders','serratus'],'3 sets','8 each side',['Knees hover low','Hips quiet','Push floor away'],['hip sway','shoulder stacking']),
    ex('Single-leg balance reach',['feet','ankles','glutes'],'3 sets','6 each side',['Soft knee','Reach slow','Eyes on one spot'],['ankle wobble','hip drop'])
  ]},
  { id:'thu-upper-power', day:'Thursday', title:'Upper Body Power', category:'Strength', focus:'Push, pull, posture, and grip', duration:30, intensity:4, exercises:[
    ex('Tempo push-up',['chest','triceps','core'],'4 sets','5-10 reps',['3 seconds down','Light pause','Fast clean press'],['hip sag','range of motion']),
    ex('Towel isometric row',['back','biceps','grip'],'4 sets','20 sec',['Brace ribs down','Pull evenly','Neck relaxed'],['shoulder shrug','asymmetry']),
    ex('Y-T-W floor raises',['rear delts','mid-back'],'2 sets','6 each shape',['Thumbs up','Small clean lift','No low-back crank'],['neck tension','arm angle'])
  ]},
  { id:'fri-athletic-circuit', day:'Friday', title:'Athletic Circuit', category:'Conditioning', focus:'Coordination, speed, full-body conditioning', duration:24, intensity:4, exercises:[
    ex('Jumping jack / step jack',['heart','shoulders','calves'],'4 sets','35 sec',['Land softly','Arms controlled','Breathe rhythmically'],['landing stiffness','arm timing']),
    ex('Reverse lunge',['quads','glutes','hamstrings'],'3 sets','8 each side',['Step back on rails','Front knee tracks','Tall torso'],['knee cave','forward lean']),
    ex('Mountain climber',['core','hip flexors','shoulders'],'3 sets','30 sec',['Shoulders over wrists','Quiet hips','Drive knees'],['hips high','shoulder drift'])
  ]},
  { id:'sat-adventure-day', day:'Saturday', title:'Adventure Day', category:'Outdoor', focus:'Walk, hike, ride, yard game, or family challenge', duration:45, intensity:3, exercises:[
    ex('Outdoor zone-2 mission',['heart','legs'],'1 mission','30-45 min',['Can talk in sentences','Smooth pace','Notice breathing'],['posture fatigue']),
    ex('Nature carry',['grip','core','traps'],'4 carries','30-60 sec',['Carry a safe object','Tall ribs','Switch sides'],['leaning','shoulder hike'])
  ]},
  { id:'sun-recovery-review', day:'Sunday', title:'Recovery + Review', category:'Recovery', focus:'Stretch, breathing, recap wins, choose next goals', duration:20, intensity:1, exercises:[
    ex('Couch stretch',['quads','hip flexors'],'2 sets','45 sec',['Squeeze glute','Ribs down','No knee pain'],['back arch','hip angle']),
    ex('Child pose breathing',['lats','diaphragm'],'3 sets','60 sec',['Expand back ribs','Slow exhale','Relax jaw'],['upper-chest breathing']),
    ex('Weekly recap',['mindset'],'1 recap','3 wins + 1 target',['Celebrate consistency','Pick one form cue','Plan next adventure'],['n/a'])
  ]}
];

function ex(name, muscles, sets, reps, cues, checks){ return { name, muscles, sets, reps, cues, checks }; }

let state = loadState();
let currentTab = 'today';
let camera = { stream:null, timer:null, seconds:0, events:[] };

function loadState(){
  const saved = localStorage.getItem(STORAGE_KEY);
  if(saved){ try { return JSON.parse(saved); } catch {} }
  const zayne = crypto.randomUUID();
  return { activeProfileId:zayne, profiles:[
    { id:zayne, name:'Zayne', age:13, heightCm:150, weightKg:45, level:'active', goals:'strength, better form, outdoor endurance', limitations:'', theme:'forest' },
    { id:crypto.randomUUID(), name:'CAK3D', age:35, heightCm:178, weightKg:86, level:'starter', goals:'consistency, heart health, mobility', limitations:'', theme:'midnight' }
  ], logs:[] };
}
function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); document.documentElement.dataset.theme = activeProfile().theme; }
function activeProfile(){ return state.profiles.find(p=>p.id===state.activeProfileId) || state.profiles[0]; }
function todayPlan(){ return workouts.find(w=>w.day===todayName) || workouts[0]; }
function logs(){ return state.logs.filter(l=>l.profileId===activeProfile().id); }
function zone(age, hr){ if(!hr) return 'not tracked'; const pct = hr/(220-age); if(pct<.6) return 'easy recovery'; if(pct<.7) return 'zone 2 endurance'; if(pct<.85) return 'tempo fitness'; return 'hard interval'; }
function calories(profile, log){ const met = [2.5,3.5,5,7,9][log.effort-1] || 4; return Math.round((met*3.5*profile.weightKg/200)*log.duration); }
function scaled(plan){ const level = activeProfile().level; const scale = level === 'starter' ? .85 : level === 'athlete' ? 1.18 : 1; return { ...plan, duration: Math.round(plan.duration*scale) }; }

function render(){
  save();
  const p = activeProfile();
  const app = document.querySelector('#app');
  app.innerHTML = `
    <main class="app-shell">
      <header class="hero card glow">
        <div><p class="eyebrow">✦ AZFitness mission control</p><h1>Train smarter, safer, and more consistently.</h1><p>Adaptive family workouts for <b>${esc(p.name)}</b>, with camera form cues, step/GPS notes, heart-rate zones, and long-term progress recaps.</p></div>
        <div class="hero-stat"><span>${p.age} yrs</span><strong>${zone(p.age, logs()[0]?.avgHr)}</strong></div>
      </header>
      <nav class="tabs">${['today','coach','stats','profile','library'].map(t=>`<button class="${currentTab===t?'active':''}" data-tab="${t}">${t}</button>`).join('')}</nav>
      <section id="panel"></section>
    </main>`;
  app.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{ currentTab=b.dataset.tab; render(); }));
  ({today:renderToday, coach:renderCoach, stats:renderStats, profile:renderProfile, library:renderLibrary}[currentTab])();
}

function renderToday(){
  const plan = scaled(todayPlan());
  document.querySelector('#panel').innerHTML = `<section class="grid two"><div class="card"><p class="eyebrow">🏋 Today's workout • ${plan.day}</p><h2>${plan.title}</h2><p>${plan.focus}</p><div class="metrics"><span>${plan.duration} min</span><span>Intensity ${plan.intensity}/5</span><span>${plan.category}</span></div>${plan.exercises.map(exerciseCard).join('')}</div><div class="card"><h2>💾 Log session</h2><label>Effort 1-5<input id="effort" type="range" min="1" max="5" value="${plan.intensity}"><b id="effortOut">${plan.intensity}</b></label><label>Steps from phone/watch<input id="steps" type="number" value="0"></label><label>Average heart rate<input id="hr" inputmode="numeric" placeholder="optional"></label><label>Distance km / GPS note<input id="distance" inputmode="decimal" placeholder="optional"></label><label>Notes<input id="notes" placeholder="wins, soreness, form target"></label><button id="saveLog">Save workout</button><h3>This week</h3>${workouts.map(w=>scaled(w)).map(w=>`<p class="week-row"><span>${w.day}</span><b>${w.title}</b><em>${w.duration}m</em></p>`).join('')}</div></section>`;
  document.querySelector('#effort').addEventListener('input', e=>document.querySelector('#effortOut').textContent=e.target.value);
  document.querySelector('#saveLog').addEventListener('click',()=>saveLog(plan, [], {
    effort:Number(document.querySelector('#effort').value), steps:Number(document.querySelector('#steps').value||0), avgHr:Number(document.querySelector('#hr').value)||undefined, distanceKm:Number(document.querySelector('#distance').value)||undefined, notes:document.querySelector('#notes').value
  }));
}
function exerciseCard(e){ return `<article class="exercise"><h3>${esc(e.name)}</h3><p>${e.sets} • ${e.reps} • ${e.muscles.join(' • ')}</p><ul>${e.cues.map(c=>`<li>${esc(c)}</li>`).join('')}</ul><p class="tiny">Camera checks: ${e.checks.join(', ')}</p></article>`; }
function saveLog(plan, events, data){ state.logs.unshift({ id:crypto.randomUUID(), profileId:activeProfile().id, planId:plan.id, date:new Date().toISOString(), duration:data.duration || plan.duration, effort:data.effort || plan.intensity, steps:data.steps || 0, avgHr:data.avgHr, distanceKm:data.distanceKm, notes:data.notes || '', events }); currentTab='stats'; render(); }

function renderCoach(){
  const p = activeProfile(), plan = scaled(todayPlan());
  document.querySelector('#panel').innerHTML = `<section class="grid two"><div class="card coach"><h2>📷 Real-time camera coach</h2><p class="muted">Runs locally in the browser. This version opens the Android camera, draws a coaching overlay, watches routine timing, and creates pinpoint recap markers. Next phase can plug in MediaPipe pose landmarks for joint angles.</p><div class="video-box"><video id="video" playsinline muted></video><canvas id="overlay" width="640" height="480"></canvas></div><p class="cue" id="cue">Camera coach is ready. Put full body in frame.</p><div class="actions"><button id="startCam">Start camera</button><button id="stopCam" disabled>Stop + save recap</button></div><p class="tiny">Clock: <span id="clock">0</span>s • ${esc(p.name)}</p></div><div class="card"><h2>Pinpoint recap markers</h2><div id="events"><p>No corrections yet. Keep moving clean.</p></div><p class="tiny">Tip: if Android blocks camera, open over HTTPS after GitHub Pages deploy.</p></div></section>`;
  document.querySelector('#startCam').addEventListener('click', startCamera);
  document.querySelector('#stopCam').addEventListener('click', stopCamera);
}
async function startCamera(){
  const video = document.querySelector('#video'); const canvas = document.querySelector('#overlay'); const cue = document.querySelector('#cue');
  try { camera.stream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:'user' }, audio:false }); video.srcObject = camera.stream; await video.play(); }
  catch(err){ cue.textContent = 'Camera could not start: ' + err.message; return; }
  camera.seconds=0; camera.events=[]; document.querySelector('#startCam').disabled=true; document.querySelector('#stopCam').disabled=false;
  camera.timer = setInterval(()=>{
    camera.seconds++; document.querySelector('#clock').textContent = camera.seconds;
    const ctx = canvas.getContext('2d'); ctx.clearRect(0,0,canvas.width,canvas.height); ctx.drawImage(video,0,0,canvas.width,canvas.height);
    ctx.strokeStyle='rgba(34,197,94,.95)'; ctx.lineWidth=8; ctx.beginPath(); ctx.moveTo(210,95); ctx.lineTo(430,95); ctx.moveTo(320,95); ctx.lineTo(320,330); ctx.moveTo(320,170); ctx.lineTo(225,260); ctx.moveTo(320,170); ctx.lineTo(415,260); ctx.stroke();
    ctx.fillStyle='rgba(250,204,21,.95)'; ctx.font='22px sans-serif'; ctx.fillText('pose guide / recap capture', 24, 450);
    const checks = todayPlan().exercises.flatMap(e=>e.checks).filter(c=>c!=='n/a'); const pick = checks[camera.seconds % checks.length] || 'posture';
    if(camera.seconds > 4 && camera.seconds % 10 === 0){ const event = { id:crypto.randomUUID(), second:camera.seconds, joint:pick, severity:'fix', message:`Improve ${pick}: slow tempo, stack ribs, and keep alignment clean.` }; camera.events.unshift(event); cue.textContent = `Check ${pick}: slow down, align, breathe.`; renderEvents(); }
    else cue.textContent = 'Looking steady: smooth tempo, controlled breathing.';
  },1000);
}
function renderEvents(){ document.querySelector('#events').innerHTML = camera.events.length ? camera.events.map(e=>`<article class="event"><strong>${e.second}s • ${esc(e.joint)}</strong><p>${esc(e.message)}</p></article>`).join('') : '<p>No corrections yet. Keep moving clean.</p>'; }
function stopCamera(){ clearInterval(camera.timer); camera.stream?.getTracks().forEach(t=>t.stop()); document.querySelector('#startCam').disabled=false; document.querySelector('#stopCam').disabled=true; saveLog(scaled(todayPlan()), camera.events, { duration:Math.max(1,Math.round(camera.seconds/60)), effort:todayPlan().intensity, notes:`Camera coach recap: ${camera.events.length} pinpoint form marker(s).` }); }

function renderStats(){
  const p=activeProfile(), ls=logs(); const total={ workouts:ls.length, minutes:ls.reduce((a,l)=>a+l.duration,0), steps:ls.reduce((a,l)=>a+l.steps,0), calories:ls.reduce((a,l)=>a+calories(p,l),0) };
  document.querySelector('#panel').innerHTML = `<section class="grid two"><div class="card"><h2>📊 Progress dashboard</h2><div class="stat-grid"><b>${total.workouts}<span>workouts</span></b><b>${total.minutes}<span>minutes</span></b><b>${total.steps.toLocaleString()}<span>steps</span></b><b>${total.calories}<span>est cal</span></b></div><h3>Long-term improvement signals</h3><ul><li>Consistency: ${total.workouts>=3?'building streak momentum':'start with 3 sessions this week'}</li><li>Heart zone: ${zone(p.age, ls[0]?.avgHr)}</li><li>Form focus: ${ls.find(l=>l.events?.length)?.events[0]?.joint || 'collect a camera-coach session'}</li></ul></div><div class="card"><h2>Recent sessions</h2>${ls.length?ls.slice(0,8).map(l=>`<article class="log"><strong>${new Date(l.date).toLocaleDateString()} • ${l.duration} min</strong><span>Effort ${l.effort}/5 • ${l.steps} steps • HR ${l.avgHr || 'n/a'}</span><p>${esc(l.notes)}</p></article>`).join(''):'<p>No logs yet.</p>'}</div></section>`;
}
function renderProfile(){
  const p=activeProfile();
  document.querySelector('#panel').innerHTML = `<section class="grid two"><div class="card"><h2>👤 Athlete profile</h2><label>Choose profile<select id="profilePick">${state.profiles.map(x=>`<option value="${x.id}" ${x.id===p.id?'selected':''}>${esc(x.name)}</option>`).join('')}</select></label>${field('name','Name',p.name)}${field('age','Age',p.age,'number')}${field('heightCm','Height cm',p.heightCm,'number')}${field('weightKg','Weight kg',p.weightKg,'number')}<label>Level<select id="level"><option ${p.level==='starter'?'selected':''}>starter</option><option ${p.level==='active'?'selected':''}>active</option><option ${p.level==='athlete'?'selected':''}>athlete</option></select></label>${field('goals','Goals',p.goals)}${field('limitations','Limitations / notes',p.limitations)}<h3>🎨 Color scheme</h3><div class="theme-row">${['forest','midnight','ember','ocean'].map(t=>`<button class="${p.theme===t?'active':''}" data-theme="${t}">${t}</button>`).join('')}</div></div><div class="card"><h2>🔐 Account + cloud sync plan</h2><p class="muted">Local mode works now. Supabase Auth/cloud sync should be added via environment secrets only; no service, secret, or JWT keys should ever go into frontend code.</p><p class="pill warn">Offline/local-first mode active</p><label>Email for future magic login<input placeholder="you@example.com" disabled></label><button disabled>Magic link coming in cloud phase</button><p class="tiny">Suggested Supabase tables: profiles, workout_sessions, form_events with RLS by user.</p></div></section>`;
  document.querySelector('#profilePick').addEventListener('change',e=>{ state.activeProfileId=e.target.value; render(); });
  ['name','age','heightCm','weightKg','goals','limitations'].forEach(id=>document.querySelector('#'+id).addEventListener('input',e=>{ const val = ['age','heightCm','weightKg'].includes(id) ? Number(e.target.value) : e.target.value; updateProfile({[id]:val}); }));
  document.querySelector('#level').addEventListener('change',e=>updateProfile({level:e.target.value}));
  document.querySelectorAll('[data-theme]').forEach(b=>b.addEventListener('click',()=>updateProfile({theme:b.dataset.theme})));
}
function field(id,label,value,type='text'){ return `<label>${label}<input id="${id}" type="${type}" value="${esc(String(value||''))}"></label>`; }
function updateProfile(patch){ state.profiles = state.profiles.map(p=>p.id===activeProfile().id ? {...p,...patch} : p); render(); }
function renderLibrary(){
  const muscles = [...new Set(workouts.flatMap(w=>w.exercises.flatMap(e=>e.muscles)))];
  document.querySelector('#panel').innerHTML = `<section class="card"><h2>🌙 Workout library</h2><p class="muted">Daily/weekly routines by category and muscle group. This is the choreographed base routine; camera recaps identify pinpoint improvements.</p><div class="chips">${muscles.map(m=>`<span>${esc(m)}</span>`).join('')}</div>${workouts.map(w=>scaled(w)).map(w=>`<details class="plan"><summary><b>${w.day}: ${w.title}</b><span>${w.category} • ${w.duration} min</span></summary>${w.exercises.map(e=>`<article class="exercise compact"><h3>${esc(e.name)}</h3><p>${e.sets} • ${e.reps} • ${e.muscles.join(', ')}</p></article>`).join('')}</details>`).join('')}</section>`;
}
function esc(v){ return String(v).replace(/[&<>'"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }

render();
