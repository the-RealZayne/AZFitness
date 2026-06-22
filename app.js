const STORAGE_KEY = 'azfitness-pro-v2';
const AUTH_KEY = 'azfitness-auth-v1';
const todayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());

const workouts = [
  plan('mon', 'Monday', 'Gold Standard Strength', 'Strength', 'Lower body + push/pull foundation', 38, 3, [
    ex('Gold Squat Matrix', ['quads','glutes','core'], '4 sets', '8 tempo squats + 8 pulses', ['Tripod feet','Knees follow toes','Chest badge forward'], ['knee valgus','hip depth','torso lean'], {knee:90, hip:105}),
    ex('Panther Push-Up', ['chest','triceps','shoulders','core'], '4 sets', '6-12 reps', ['Body like a board','Elbows tucked','Exhale on press'], ['hip sag','elbow flare','neck drop'], {elbow:85, shoulder:45}),
    ex('Backpack Gorilla Row', ['lats','upper back','biceps'], '4 sets', '10 each side', ['Hips back','Pull elbow to pocket','Pause at top'], ['rounding','uneven shoulders'], {hip:120}),
    ex('Dead Bug Breath Lock', ['deep core','diaphragm'], '3 sets', '6 each side', ['Low back quiet','Slow reach','Four-count exhale'], ['rib flare','low back arch'], {hip:90})
  ]),
  plan('tue', 'Tuesday', 'Engine Room Cardio', 'Cardio', 'Steps, heart zones, breath control', 34, 3, [
    ex('Walk/Hike Intervals', ['heart','calves','glutes'], '7 rounds', '2 min brisk + 1 min easy', ['Tall crown','Quiet shoulders','Nasal inhale'], ['stride symmetry','shoulder tension'], {}),
    ex('Step-Up Climb', ['quads','glutes','calves'], '3 sets', '10 each side', ['Whole foot planted','Drive tall','Control descent'], ['knee tracking','hip drop'], {knee:95}),
    ex('Box Breathing Reset', ['diaphragm','nervous system'], '5 rounds', '4-4-4-4', ['Belly/rib expansion','No shoulder shrug','Long exhale'], ['shoulder breathing','rib motion'], {})
  ]),
  plan('wed', 'Wednesday', 'Mobility Lab', 'Mobility', 'Hips, ankles, shoulders, balance', 28, 2, [
    ex('World’s Greatest Stretch', ['hips','hamstrings','thoracic spine'], '3 sets', '5 each side', ['Long back leg','Elbow to instep','Rotate open'], ['rotation range','back knee bend'], {hip:100}),
    ex('Bear Plank Shoulder Taps', ['core','shoulders','serratus'], '4 sets', '8 each', ['Knees hover','Hips frozen','Push floor away'], ['hip sway','shoulder stack'], {shoulder:90}),
    ex('Single-Leg Compass Reach', ['feet','ankles','glutes'], '3 sets', '6 each', ['Soft knee','Slow reach','Eyes fixed'], ['ankle wobble','hip drop'], {})
  ]),
  plan('thu', 'Thursday', 'Upper Armor', 'Strength', 'Posture, grip, push and pull power', 36, 4, [
    ex('Tempo Push-Up', ['chest','triceps','core'], '5 sets', '5-10', ['3 seconds down','Pause','Clean press'], ['hip sag','range of motion'], {elbow:80}),
    ex('Towel Isometric Row', ['back','biceps','grip'], '5 sets', '20 sec', ['Brace ribs','Pull evenly','Relax neck'], ['shoulder shrug','asymmetry'], {}),
    ex('Y-T-W Floor Raises', ['rear delts','mid-back'], '3 sets', '6 each', ['Thumbs up','Small lift','No low-back crank'], ['neck tension','arm angle'], {shoulder:130})
  ]),
  plan('fri', 'Friday', 'Athlete Circuit', 'Conditioning', 'Coordination, speed, full-body work', 30, 4, [
    ex('Soft-Landing Jacks', ['heart','shoulders','calves'], '5 sets', '35 sec', ['Quiet feet','Rhythm arms','Steady breath'], ['landing stiffness','arm timing'], {}),
    ex('Reverse Lunge Rails', ['quads','glutes','hamstrings'], '4 sets', '8 each', ['Step straight back','Front knee tracks','Tall torso'], ['knee cave','forward lean'], {knee:95}),
    ex('Mountain Climber Line', ['core','hip flexors','shoulders'], '4 sets', '30 sec', ['Shoulders over wrists','Quiet hips','Drive knees'], ['hips high','shoulder drift'], {shoulder:90})
  ]),
  plan('sat', 'Saturday', 'Adventure Miles', 'Outdoor', 'Hike, ride, yard game, family mission', 50, 3, [
    ex('Zone-2 Outdoor Mission', ['heart','legs'], '1 mission', '30-50 min', ['Talk-test pace','Smooth stride','Nose-mouth rhythm'], ['posture fatigue','stride symmetry'], {}),
    ex('Farmer/Nature Carry', ['grip','core','traps'], '5 carries', '45 sec', ['Tall ribs','Switch sides','No lean'], ['leaning','shoulder hike'], {})
  ]),
  plan('sun', 'Sunday', 'Recovery + Growth Review', 'Recovery', 'Stretch, hydration, recap, plan next week', 24, 1, [
    ex('Couch Stretch', ['quads','hip flexors'], '3 sets', '45 sec', ['Squeeze glute','Ribs down','No knee pain'], ['back arch','hip angle'], {hip:180}),
    ex('Child Pose Breathing', ['lats','diaphragm'], '4 rounds', '60 sec', ['Expand back ribs','Slow exhale','Relax jaw'], ['upper-chest breathing'], {}),
    ex('Gold Log Review', ['mindset'], '1 recap', '3 wins + 1 target', ['Celebrate consistency','Choose one form cue','Pick next adventure'], ['n/a'], {})
  ])
];
const foodTemplates = ['eggs + fruit','turkey wrap','rice/chicken bowl','protein smoothie','salmon + potatoes','beans + avocado','Greek yogurt + berries'];
const hydrationGoalMl = 2400;
function plan(id, day, title, category, focus, duration, intensity, exercises){ return {id, day, title, category, focus, duration, intensity, exercises}; }
function ex(name, muscles, sets, reps, cues, checks, targets){ return {name, muscles, sets, reps, cues, checks, targets}; }

let state = loadState();
let auth = loadAuth();
let currentTab = auth.sessionProfileId ? 'dashboard' : 'login';
let camera = { stream:null, timer:null, seconds:0, events:[], pose:null, vision:null, running:false, pulseSamples:[], breathSamples:[], lastLandmarks:null, health:{heart:'calibrating', breath:'calibrating', pupil:'calibrating', posture:'waiting'} };

function defaultState(){
  const zayne = crypto.randomUUID(); const cak = crypto.randomUUID();
  return { activeProfileId:zayne, profiles:[
    { id:zayne, name:'Zayne', age:13, heightCm:150, weightKg:45, level:'active', goals:'strength, athletic form, outdoor endurance', limitations:'', theme:'gold', pinSet:false },
    { id:cak, name:'CAK3D', age:35, heightCm:178, weightKg:86, level:'starter', goals:'consistency, heart health, mobility, fat loss', limitations:'', theme:'gold', pinSet:false }
  ], logs:[], meals:[], water:[], vitals:[], miles:[], badges:[] };
}
function loadState(){ const saved=localStorage.getItem(STORAGE_KEY); if(saved){ try { return migrate(JSON.parse(saved)); } catch{} } return defaultState(); }
function migrate(s){ s.meals ||= []; s.water ||= []; s.vitals ||= []; s.miles ||= []; s.badges ||= []; s.profiles?.forEach(p=>{ p.theme='gold'; p.pinSet = Boolean(p.pinHash); }); return s; }
function loadAuth(){ const saved=localStorage.getItem(AUTH_KEY); if(saved){ try { return JSON.parse(saved); } catch{} } return {sessionProfileId:null}; }
function persist(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); localStorage.setItem(AUTH_KEY, JSON.stringify(auth)); document.documentElement.dataset.theme='gold'; }
function activeProfile(){ return state.profiles.find(p=>p.id===state.activeProfileId) || state.profiles[0]; }
function activeLogs(){ return state.logs.filter(l=>l.profileId===activeProfile().id); }
function todayPlan(){ return workouts.find(w=>w.day===todayName) || workouts[0]; }
function scaled(plan){ const level=activeProfile().level; const scale=level==='starter'?.86:level==='athlete'?1.2:1; return {...plan, duration:Math.round(plan.duration*scale)}; }
function esc(v){ return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
async function hashPin(pin){ const bytes=new TextEncoder().encode('azfitness:'+pin); const digest=await crypto.subtle.digest('SHA-256', bytes); return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join(''); }
function zone(age, hr){ if(!hr || Number.isNaN(hr)) return 'not tracked'; const pct=hr/(220-age); if(pct<.6) return 'recovery'; if(pct<.7) return 'zone 2'; if(pct<.85) return 'tempo'; return 'redline'; }
function calories(profile, log){ const met=[2.5,3.5,5,7,9][(log.effort||3)-1]||4; return Math.round((met*3.5*profile.weightKg/200)*(log.duration||0)); }
function bmi(p){ return (p.weightKg/((p.heightCm/100)**2)).toFixed(1); }
function latest(arr){ return arr[0]; }

function render(){ persist(); const app=document.querySelector('#app'); if(!auth.sessionProfileId){ renderLogin(app); return; } state.activeProfileId=auth.sessionProfileId; const p=activeProfile(); app.innerHTML=`
  <main class="app-shell">
    <aside class="side card">
      <div class="brand"><span class="crest">AZ</span><div><b>A-Z FITNESS</b><small>Gold Lab</small></div></div>
      ${['dashboard','coach','workouts','nutrition','progress','profile'].map(t=>`<button class="nav ${currentTab===t?'active':''}" data-tab="${t}">${icon(t)} ${label(t)}</button>`).join('')}
      <button class="nav ghost" id="logout">⏻ Lock app</button>
      <p class="tiny warning">Camera wellness signals are experimental education tools, not medical measurements.</p>
    </aside>
    <section class="main-stage">
      <header class="topbar card">
        <div><p class="eyebrow">BLACK • YELLOW • GOLD PERFORMANCE SYSTEM</p><h1>${headline(currentTab)}</h1></div>
        <div class="athlete-chip"><span>${esc(p.name[0])}</span><div><b>${esc(p.name)}</b><small>${p.age} yrs • ${p.level} • BMI ${bmi(p)}</small></div></div>
      </header>
      <section id="panel"></section>
    </section>
  </main>`;
  app.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{currentTab=b.dataset.tab; render();}));
  document.querySelector('#logout').addEventListener('click',()=>{ auth.sessionProfileId=null; currentTab='login'; render(); });
  ({dashboard:renderDashboard, coach:renderCoach, workouts:renderWorkouts, nutrition:renderNutrition, progress:renderProgress, profile:renderProfile}[currentTab])();
}
function icon(t){ return {dashboard:'⌁',coach:'◎',workouts:'◆',nutrition:'◒',progress:'▰',profile:'◈'}[t]; }
function label(t){ return {dashboard:'Command Deck',coach:'Pose Lab',workouts:'Training',nutrition:'Fuel + Water',progress:'Growth Charts',profile:'Athletes + PIN'}[t]; }
function headline(t){ return {dashboard:'Full health command deck',coach:'MediaPipe pose + camera lab',workouts:'Choreographed workout system',nutrition:'Fuel, hydration, calories',progress:'Progress, growth, miles, trends',profile:'Secure athlete profiles'}[t]; }

function renderLogin(app){ const profiles=state.profiles; app.innerHTML=`<main class="login-wrap"><section class="login-card card glow"><div class="logo-xl">A-Z</div><p class="eyebrow">A-Z FITNESS GOLD ACCESS</p><h1>Pick your athlete. Enter your 4-digit PIN.</h1><p class="muted">First login uses <b>0000</b>. Then you choose and verify your private 4-digit PIN for this device.</p><label>Athlete<select id="loginProfile">${profiles.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select></label><label>PIN<input id="pin" inputmode="numeric" maxlength="4" type="password" placeholder="0000"></label><div id="newPinBox" hidden><label>Choose new PIN<input id="pinNew" inputmode="numeric" maxlength="4" type="password"></label><label>Verify new PIN<input id="pinVerify" inputmode="numeric" maxlength="4" type="password"></label></div><button id="loginBtn">Unlock Gold Lab</button><p id="loginMsg" class="tiny"></p></section></main>`;
  const pick=document.querySelector('#loginProfile'), pin=document.querySelector('#pin'), box=document.querySelector('#newPinBox'), msg=document.querySelector('#loginMsg');
  function selected(){ return state.profiles.find(p=>p.id===pick.value) || state.profiles[0]; }
  function updateBox(){ box.hidden = Boolean(selected().pinHash); }
  pick.addEventListener('change', updateBox); updateBox();
  document.querySelector('#loginBtn').addEventListener('click', async()=>{
    const p=selected(); const entered=pin.value.trim(); if(!/^\d{4}$/.test(entered)){ msg.textContent='PIN must be 4 digits.'; return; }
    if(!p.pinHash){ if(entered!=='0000'){ msg.textContent='First login PIN is 0000.'; return; } const n=document.querySelector('#pinNew').value.trim(), v=document.querySelector('#pinVerify').value.trim(); if(!/^\d{4}$/.test(n)||n!==v){ msg.textContent='Choose and verify a matching 4-digit PIN.'; return; } p.pinHash=await hashPin(n); p.pinSet=true; }
    else if(await hashPin(entered)!==p.pinHash){ msg.textContent='Wrong PIN.'; return; }
    auth.sessionProfileId=p.id; state.activeProfileId=p.id; currentTab='dashboard'; render();
  });
}

function renderDashboard(){ const p=activeProfile(), ls=activeLogs(); const today=scaled(todayPlan()); const totals=calcTotals(p,ls); document.querySelector('#panel').innerHTML=`
  <section class="deck-grid">
    <article class="card hero-gold"><p class="eyebrow">TODAY'S GOLD ROUTINE • ${today.day}</p><h2>${today.title}</h2><p>${today.focus}</p><div class="metric-row"><b>${today.duration}<span>min</span></b><b>${today.intensity}/5<span>load</span></b><b>${today.exercises.length}<span>blocks</span></b><b>${totals.streak}<span>day streak</span></b></div><button data-jump="workouts">Open routine</button></article>
    <article class="card monitor"><h2>Live readiness</h2>${vitalTiles(p,ls)}</article>
    <article class="card"><h2>Progress rings</h2><canvas id="rings" width="360" height="240"></canvas></article>
    <article class="card"><h2>Quick log</h2>${quickLogForm(today)}</article>
    <article class="card wide"><h2>Gold graph</h2><canvas id="weeklyChart" height="220"></canvas></article>
  </section>`;
  document.querySelector('[data-jump="workouts"]').addEventListener('click',()=>{currentTab='workouts';render();}); wireQuickLog(today); drawRings(totals); drawChart('weeklyChart', chartSeries(ls), ['Minutes','Steps/100','Water cups']); }
function vitalTiles(p,ls){ const v=latest(state.vitals.filter(x=>x.profileId===p.id)); return `<div class="tile-grid"><div><span>Heart zone</span><b>${zone(p.age, v?.heartRate || ls[0]?.avgHr)}</b></div><div><span>Breath</span><b>${v?.breathRate?Math.round(v.breathRate)+' rpm':'scan needed'}</b></div><div><span>Posture</span><b>${v?.postureScore?Math.round(v.postureScore)+'%':'scan needed'}</b></div><div><span>Pupil/focus proxy</span><b>${v?.pupilProxy?Math.round(v.pupilProxy)+'%':'scan needed'}</b></div></div>`; }
function quickLogForm(plan){ return `<label>Effort<input id="effort" type="range" min="1" max="5" value="${plan.intensity}"></label><label>Steps<input id="steps" type="number" value="0"></label><label>Miles<input id="miles" inputmode="decimal" placeholder="0.0"></label><label>Avg heart rate<input id="hr" inputmode="numeric" placeholder="optional"></label><label>Notes<input id="notes" placeholder="wins, soreness, form target"></label><button id="saveLog">Save full session</button>`; }
function wireQuickLog(plan){ document.querySelector('#saveLog').addEventListener('click',()=>saveLog(plan, [], {effort:+val('#effort'), steps:+val('#steps')||0, distanceKm:(+val('#miles')||0)*1.60934, avgHr:+val('#hr')||undefined, notes:val('#notes')})); }
function val(sel){ return document.querySelector(sel)?.value || ''; }
function saveLog(plan, events, data){ state.logs.unshift({id:crypto.randomUUID(), profileId:activeProfile().id, planId:plan.id, date:new Date().toISOString(), duration:data.duration||plan.duration, effort:data.effort||plan.intensity, steps:data.steps||0, distanceKm:data.distanceKm||0, avgHr:data.avgHr, calories:data.calories, notes:data.notes||'', events}); if(data.distanceKm) state.miles.unshift({id:crypto.randomUUID(), profileId:activeProfile().id, date:new Date().toISOString(), km:data.distanceKm}); currentTab='progress'; render(); }
function calcTotals(p,ls){ const today=new Date().toDateString(); return {workouts:ls.length, minutes:ls.reduce((a,l)=>a+l.duration,0), steps:ls.reduce((a,l)=>a+l.steps,0), miles:ls.reduce((a,l)=>a+(l.distanceKm||0),0)*.621371, calories:ls.reduce((a,l)=>a+(l.calories||calories(p,l)),0), water:waterToday(), food:foodToday(), streak:streak(ls)}; }
function streak(ls){ const days=new Set(ls.map(l=>new Date(l.date).toDateString())); let n=0,d=new Date(); while(days.has(d.toDateString())){n++; d.setDate(d.getDate()-1);} return n; }
function waterToday(){ const today=new Date().toDateString(); return state.water.filter(w=>w.profileId===activeProfile().id&&new Date(w.date).toDateString()===today).reduce((a,w)=>a+w.ml,0); }
function foodToday(){ const today=new Date().toDateString(); return state.meals.filter(m=>m.profileId===activeProfile().id&&new Date(m.date).toDateString()===today).reduce((a,m)=>a+(m.calories||0),0); }

function renderCoach(){ document.querySelector('#panel').innerHTML=`<section class="coach-layout"><article class="card camera-card"><h2>Pose Lab</h2><p class="muted">MediaPipe pose landmarks load from a public CDN. If unavailable, the app keeps a fallback overlay. Joint angles and wellness proxies are educational only.</p><div class="video-box"><video id="video" playsinline muted></video><canvas id="overlay" width="960" height="720"></canvas></div><div class="actions"><button id="startCam">Start camera scan</button><button id="stopCam" disabled>Stop + save recap</button></div><p class="cue" id="cue">Full body in frame. Good lighting. Camera at hip/chest height.</p></article><article class="card"><h2>Live biometrics + form</h2><div id="liveMetrics" class="tile-grid"></div><h3>Joint angles</h3><div id="angles" class="angle-list"></div><h3>Pinpoint recap</h3><div id="events"><p>No markers yet.</p></div></article></section>`;
  document.querySelector('#startCam').addEventListener('click',startCamera); document.querySelector('#stopCam').addEventListener('click',stopCamera); renderLiveMetrics(); }
async function loadPose(){ if(camera.pose) return camera.pose; try{ const mod=await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/+esm'); const vision=await mod.FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm'); camera.pose=await mod.PoseLandmarker.createFromOptions(vision,{baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task'},runningMode:'VIDEO',numPoses:1}); return camera.pose; }catch(e){ console.warn('MediaPipe unavailable', e); return null; } }
async function startCamera(){ const video=document.querySelector('#video'), cue=document.querySelector('#cue'); try{ camera.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user', width:{ideal:1280}, height:{ideal:720}}, audio:false}); video.srcObject=camera.stream; await video.play(); }catch(err){ cue.textContent='Camera could not start: '+err.message; return; } camera.pose=await loadPose(); camera.running=true; camera.seconds=0; camera.events=[]; camera.pulseSamples=[]; camera.breathSamples=[]; document.querySelector('#startCam').disabled=true; document.querySelector('#stopCam').disabled=false; camera.timer=setInterval(scanFrame,250); }
function scanFrame(){ const video=document.querySelector('#video'), canvas=document.querySelector('#overlay'), ctx=canvas.getContext('2d'); if(!video.videoWidth) return; ctx.clearRect(0,0,canvas.width,canvas.height); ctx.drawImage(video,0,0,canvas.width,canvas.height); camera.seconds+=.25; let lm=null; if(camera.pose){ try{ const result=camera.pose.detectForVideo(video, performance.now()); lm=result.landmarks?.[0] || null; }catch{} } if(lm){ camera.lastLandmarks=lm; drawLandmarks(ctx,lm,canvas); analyzePose(lm); } else { drawFallback(ctx,canvas); fallbackVitals(ctx,canvas); } renderLiveMetrics(); if(Math.round(camera.seconds)%8===0 && Math.abs(camera.seconds-Math.round(camera.seconds))<.13) maybeMarker(); }
function pt(lm,i,c){ const p=lm[i]; return {x:p.x*c.width,y:p.y*c.height,z:p.z||0,vis:p.visibility??1}; }
function angle(a,b,c){ const ab=Math.atan2(a.y-b.y,a.x-b.x), cb=Math.atan2(c.y-b.y,c.x-b.x); let deg=Math.abs((ab-cb)*180/Math.PI); return deg>180?360-deg:deg; }
function drawLandmarks(ctx,lm,canvas){ const pairs=[[11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24],[23,25],[25,27],[24,26],[26,28]]; ctx.lineWidth=6; ctx.strokeStyle='#f7c948'; pairs.forEach(([a,b])=>{const A=pt(lm,a,canvas),B=pt(lm,b,canvas); ctx.beginPath(); ctx.moveTo(A.x,A.y); ctx.lineTo(B.x,B.y); ctx.stroke();}); ctx.fillStyle='#ffd700'; [0,11,12,13,14,15,16,23,24,25,26,27,28].forEach(i=>{const P=pt(lm,i,canvas); ctx.beginPath(); ctx.arc(P.x,P.y,7,0,7); ctx.fill();}); }
function analyzePose(lm){ const c=document.querySelector('#overlay'); const L={lElbow:angle(pt(lm,11,c),pt(lm,13,c),pt(lm,15,c)), rElbow:angle(pt(lm,12,c),pt(lm,14,c),pt(lm,16,c)), lKnee:angle(pt(lm,23,c),pt(lm,25,c),pt(lm,27,c)), rKnee:angle(pt(lm,24,c),pt(lm,26,c),pt(lm,28,c)), lHip:angle(pt(lm,11,c),pt(lm,23,c),pt(lm,25,c)), rHip:angle(pt(lm,12,c),pt(lm,24,c),pt(lm,26,c))}; camera.health.angles=L; const shoulderTilt=Math.abs(pt(lm,11,c).y-pt(lm,12,c).y); const hipTilt=Math.abs(pt(lm,23,c).y-pt(lm,24,c).y); camera.health.posture=Math.max(45,100-(shoulderTilt+hipTilt)/3); const chest=(pt(lm,11,c).y+pt(lm,12,c).y+pt(lm,23,c).y+pt(lm,24,c).y)/4; sample(camera.breathSamples,{t:performance.now(),v:chest},180); camera.health.breath=estimateRate(camera.breathSamples,60000); camera.health.pupil=pupilProxy(lm,c); camera.health.heart=estimatePulseFromCanvas(); document.querySelector('#angles').innerHTML=Object.entries(L).map(([k,v])=>`<p><b>${k.replace(/[A-Z]/g,m=>' '+m).trim()}</b><span>${Math.round(v)}°</span></p>`).join(''); }
function pupilProxy(lm,c){ const left=pt(lm,2,c), right=pt(lm,5,c); const spread=Math.abs(left.x-right.x)||1; return Math.max(35,Math.min(100,spread/2)); }
function estimatePulseFromCanvas(){ const canvas=document.querySelector('#overlay'), ctx=canvas.getContext('2d'); try{ const data=ctx.getImageData(canvas.width*.42, canvas.height*.18, canvas.width*.16, canvas.height*.12).data; let r=0,g=0,n=0; for(let i=0;i<data.length;i+=16){r+=data[i];g+=data[i+1];n++;} sample(camera.pulseSamples,{t:performance.now(),v:(g-r)/(n||1)},240); const bpm=estimateRate(camera.pulseSamples,60000); return bpm?Math.round(bpm):'calibrating'; }catch{return 'calibrating';} }
function estimateRate(samples,scale){ if(samples.length<20) return null; const vals=samples.map(s=>s.v), avg=vals.reduce((a,b)=>a+b,0)/vals.length; let crossings=0; for(let i=1;i<vals.length;i++) if((vals[i-1]-avg)<=0 && (vals[i]-avg)>0) crossings++; const span=samples.at(-1).t-samples[0].t; return span>2000 ? crossings/(span/scale) : null; }
function sample(arr,item,max){ arr.push(item); while(arr.length>max) arr.shift(); }
function fallbackVitals(ctx,canvas){ camera.health.posture='fallback'; camera.health.heart=estimatePulseFromCanvas(); camera.health.breath='scan body'; camera.health.pupil='face only'; }
function drawFallback(ctx,canvas){ ctx.strokeStyle='#ffd700'; ctx.lineWidth=7; ctx.strokeRect(canvas.width*.24,canvas.height*.08,canvas.width*.52,canvas.height*.76); ctx.fillStyle='#f7c948'; ctx.font='26px sans-serif'; ctx.fillText('MediaPipe loading/fallback guide',32,canvas.height-35); }
function maybeMarker(){ const h=camera.health; const bad=(h.posture&&h.posture<78)||Math.random()<.25; if(!bad) return; const msg=h.posture<78?'Shoulder/hip line drift: square up and slow tempo.':'Tempo cue: control the rep and breathe through the hard part.'; camera.events.unshift({id:crypto.randomUUID(), second:Math.round(camera.seconds), joint:'alignment', severity:'fix', message:msg}); renderEvents(); }
function renderEvents(){ document.querySelector('#events').innerHTML=camera.events.length?camera.events.map(e=>`<article class="event"><strong>${e.second}s • ${esc(e.joint)}</strong><p>${esc(e.message)}</p></article>`).join(''):'<p>No markers yet.</p>'; }
function renderLiveMetrics(){ const h=camera.health; const pct=v=>typeof v==='number'?Math.round(v)+'%':v; const heart=typeof h.heart==='number'?h.heart+' bpm':h.heart; document.querySelector('#liveMetrics')?.replaceChildren(); const box=document.querySelector('#liveMetrics'); if(box) box.innerHTML=`<div><span>Heart-rate proxy</span><b>${heart||'calibrating'}</b></div><div><span>Breath-rate proxy</span><b>${typeof h.breath==='number'?Math.round(h.breath)+' rpm':h.breath||'calibrating'}</b></div><div><span>Posture score</span><b>${pct(h.posture)||'waiting'}</b></div><div><span>Pupil/focus proxy</span><b>${pct(h.pupil)||'waiting'}</b></div>`; }
function stopCamera(){ clearInterval(camera.timer); camera.stream?.getTracks().forEach(t=>t.stop()); camera.running=false; const h=camera.health; state.vitals.unshift({id:crypto.randomUUID(), profileId:activeProfile().id, date:new Date().toISOString(), heartRate:typeof h.heart==='number'?h.heart:undefined, breathRate:typeof h.breath==='number'?h.breath:undefined, postureScore:typeof h.posture==='number'?h.posture:undefined, pupilProxy:typeof h.pupil==='number'?h.pupil:undefined}); saveLog(scaled(todayPlan()), camera.events, {duration:Math.max(1,Math.round(camera.seconds/60)), effort:todayPlan().intensity, notes:`Pose Lab recap: ${camera.events.length} correction marker(s).`}); }

function renderWorkouts(){ const week=workouts.map(w=>scaled(w)); document.querySelector('#panel').innerHTML=`<section class="workout-board"><article class="card wide"><h2>Choreographed week</h2><div class="week-strip">${week.map(w=>`<button class="day-card ${w.day===todayName?'today':''}" data-plan="${w.id}"><small>${w.day}</small><b>${w.title}</b><span>${w.duration}m • ${w.category}</span></button>`).join('')}</div></article><article class="card wide" id="planDetail"></article></section>`; document.querySelectorAll('[data-plan]').forEach(b=>b.addEventListener('click',()=>showPlan(b.dataset.plan))); showPlan(todayPlan().id); }
function showPlan(id){ const w=scaled(workouts.find(x=>x.id===id)||todayPlan()); document.querySelector('#planDetail').innerHTML=`<p class="eyebrow">${w.category} • intensity ${w.intensity}/5</p><h2>${w.title}</h2><p>${w.focus}</p><div class="exercise-grid">${w.exercises.map(e=>`<article class="exercise"><h3>${esc(e.name)}</h3><p>${e.sets} • ${e.reps}</p><p class="muscles">${e.muscles.join(' • ')}</p><ul>${e.cues.map(c=>`<li>${esc(c)}</li>`).join('')}</ul><p class="tiny">Camera checks: ${e.checks.join(', ')} ${Object.keys(e.targets).length?'• target angles '+JSON.stringify(e.targets):''}</p></article>`).join('')}</div><button id="doThis">Log this workout</button>`; document.querySelector('#doThis').addEventListener('click',()=>{currentTab='dashboard';render();}); }

function renderNutrition(){ const p=activeProfile(); document.querySelector('#panel').innerHTML=`<section class="deck-grid"><article class="card"><h2>Water intake</h2><div class="hydration"><b>${waterToday()}</b><span>/ ${hydrationGoalMl} ml</span></div><button data-water="250">+250 ml</button><button data-water="500">+500 ml</button></article><article class="card"><h2>Food log</h2><label>Meal<input id="mealName" list="foods" placeholder="protein bowl"></label><datalist id="foods">${foodTemplates.map(f=>`<option value="${f}">`).join('')}</datalist><label>Calories<input id="mealCals" type="number" placeholder="450"></label><label>Protein g<input id="protein" type="number" placeholder="30"></label><button id="addMeal">Add fuel</button></article><article class="card wide"><h2>Today’s fuel</h2><div id="mealList"></div></article></section>`; document.querySelectorAll('[data-water]').forEach(b=>b.addEventListener('click',()=>{state.water.unshift({id:crypto.randomUUID(),profileId:p.id,date:new Date().toISOString(),ml:+b.dataset.water});renderNutrition();})); document.querySelector('#addMeal').addEventListener('click',()=>{state.meals.unshift({id:crypto.randomUUID(),profileId:p.id,date:new Date().toISOString(),name:val('#mealName'),calories:+val('#mealCals')||0,protein:+val('#protein')||0});renderNutrition();}); renderMeals(); }
function renderMeals(){ const today=new Date().toDateString(); const ms=state.meals.filter(m=>m.profileId===activeProfile().id&&new Date(m.date).toDateString()===today); document.querySelector('#mealList').innerHTML=ms.length?ms.map(m=>`<article class="log"><b>${esc(m.name||'Meal')}</b><span>${m.calories} cal • ${m.protein||0}g protein</span></article>`).join(''):'<p>No food logged yet.</p>'; }

function renderProgress(){ const p=activeProfile(), ls=activeLogs(), t=calcTotals(p,ls); document.querySelector('#panel').innerHTML=`<section class="deck-grid"><article class="card"><h2>Total stats</h2><div class="stat-grid"><b>${t.workouts}<span>workouts</span></b><b>${t.minutes}<span>minutes</span></b><b>${t.steps.toLocaleString()}<span>steps</span></b><b>${t.miles.toFixed(1)}<span>miles</span></b><b>${t.calories}<span>calories</span></b><b>${t.water}<span>ml water today</span></b></div></article><article class="card"><h2>Body + growth</h2><canvas id="bodyChart" height="230"></canvas></article><article class="card wide"><h2>30-day performance</h2><canvas id="perfChart" height="260"></canvas></article><article class="card wide"><h2>Recent logs</h2>${ls.slice(0,10).map(l=>`<article class="log"><b>${new Date(l.date).toLocaleDateString()} • ${l.duration} min</b><span>${l.steps} steps • ${(l.distanceKm*.621371).toFixed(2)} mi • HR ${l.avgHr||'n/a'} • ${l.events?.length||0} form markers</span><p>${esc(l.notes)}</p></article>`).join('')||'<p>No logs yet.</p>'}</article></section>`; drawChart('perfChart', chartSeries(ls), ['Minutes','Steps/100','Miles x10']); drawChart('bodyChart', [{label:'Height',data:[p.heightCm-2,p.heightCm-1,p.heightCm]},{label:'Weight',data:[p.weightKg,p.weightKg,p.weightKg]}], ['Height cm','Weight kg']); }
function chartSeries(ls){ const arr=[...ls].reverse().slice(-14); return [{label:'Minutes',data:arr.map(l=>l.duration)},{label:'Steps/100',data:arr.map(l=>Math.round((l.steps||0)/100))},{label:'Miles x10',data:arr.map(l=>Math.round((l.distanceKm||0)*6.21371))}]; }
function drawChart(id, series, labels){ const c=document.getElementById(id), ctx=c?.getContext('2d'); if(!ctx) return; const w=c.width=c.clientWidth*devicePixelRatio, h=c.height=(+c.getAttribute('height')||240)*devicePixelRatio; ctx.clearRect(0,0,w,h); ctx.strokeStyle='rgba(255,255,255,.12)'; for(let i=1;i<5;i++){ctx.beginPath();ctx.moveTo(40,h*i/5);ctx.lineTo(w-20,h*i/5);ctx.stroke();} const max=Math.max(10,...series.flatMap(s=>s.data)); const colors=['#ffd700','#f7c948','#fff3a3']; series.forEach((s,si)=>{ctx.strokeStyle=colors[si%colors.length];ctx.lineWidth=4;ctx.beginPath();s.data.forEach((v,i)=>{const x=50+i*((w-80)/Math.max(1,s.data.length-1)); const y=h-30-(v/max)*(h-60); i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.stroke();}); ctx.fillStyle='#f7c948'; ctx.font=`${13*devicePixelRatio}px sans-serif`; labels.forEach((l,i)=>ctx.fillText(l,48+i*130*devicePixelRatio,22*devicePixelRatio)); }
function drawRings(t){ const c=document.getElementById('rings'), ctx=c.getContext('2d'), w=c.width, h=c.height; ctx.clearRect(0,0,w,h); const vals=[Math.min(1,t.workouts/5),Math.min(1,t.steps/50000),Math.min(1,t.water/hydrationGoalMl)]; vals.forEach((v,i)=>{ctx.beginPath();ctx.lineWidth=18;ctx.strokeStyle='rgba(255,255,255,.12)';ctx.arc(90+i*90,115,38,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.strokeStyle=['#ffd700','#f7c948','#fff3a3'][i];ctx.arc(90+i*90,115,38,-Math.PI/2,-Math.PI/2+Math.PI*2*v);ctx.stroke();}); }

function renderProfile(){ const p=activeProfile(); document.querySelector('#panel').innerHTML=`<section class="deck-grid"><article class="card"><h2>Athlete profile</h2>${field('name','Name',p.name)}${field('age','Age',p.age,'number')}${field('heightCm','Height cm',p.heightCm,'number')}${field('weightKg','Weight kg',p.weightKg,'number')}<label>Level<select id="level"><option ${p.level==='starter'?'selected':''}>starter</option><option ${p.level==='active'?'selected':''}>active</option><option ${p.level==='athlete'?'selected':''}>athlete</option></select></label>${field('goals','Goals',p.goals)}${field('limitations','Limitations',p.limitations)}<button id="saveProfile">Save profile</button></article><article class="card"><h2>Switch athlete</h2>${state.profiles.map(x=>`<button class="athlete-row" data-athlete="${x.id}"><b>${esc(x.name)}</b><span>${x.pinHash?'PIN set':'first PIN 0000'}</span></button>`).join('')}<p class="tiny">To change a PIN, lock app and use the device profile reset process planned for the cloud phase.</p></article></section>`; document.querySelector('#saveProfile').addEventListener('click',()=>{Object.assign(p,{name:val('#name'),age:+val('#age'),heightCm:+val('#heightCm'),weightKg:+val('#weightKg'),goals:val('#goals'),limitations:val('#limitations'),level:val('#level')});render();}); document.querySelectorAll('[data-athlete]').forEach(b=>b.addEventListener('click',()=>{auth.sessionProfileId=null; currentTab='login'; render();})); }
function field(id,label,value,type='text'){ return `<label>${label}<input id="${id}" type="${type}" value="${esc(value)}"></label>`; }

render();
