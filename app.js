/* H-Cap PWA v2.4.3 */
import { DB } from './db.js';
const Store={
  get(k,d=null){ try{return JSON.parse(localStorage.getItem(k)) ?? d}catch{ return d } },
  set(k,v){ localStorage.setItem(k,JSON.stringify(v)) },
  push(k,v){
    const a=Store.get(k,[]); a.push(v); Store.set(k,a);
    // สำเนาลง IndexedDB
    try{ DB.put(k,v); }catch{}
    // (ออปชัน) ยิงขึ้นคลาวด์ถ้ามี API
    try{
      if(navigator.onLine){
        const payload={entries:[{bucket:k,ts:(v?.ts||Date.now()),payload:v}]};
        navigator.sendBeacon?.('/api/logs', new Blob([JSON.stringify(payload)],{type:'application/json'})) ||
        fetch('/api/logs',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
      }
    }catch{}
  }
};

const $=(s,e=document)=>e.querySelector(s), $$=(s,e=document)=>[...e.querySelectorAll(s)];
function toast(m,t='info'){
  let el=$('#toast');
  if(!el){ el=document.createElement('div'); el.id='toast'; document.body.appendChild(el); }
  el.style.cssText='position:fixed;left:50%;bottom:18px;transform:translateX(-50%);background:'+
    (t==='error'?'#b91c1c':t==='ok'?'#065f46':'rgba(60,60,65,.9)')+
    ';color:#fff;padding:10px 14px;border-radius:12px;z-index:9999';
  el.textContent=m; setTimeout(()=>el.remove(),2200);
}
const Store={
  get(k,d=null){ try{return JSON.parse(localStorage.getItem(k)) ?? d}catch{ return d } },
  set(k,v){ localStorage.setItem(k,JSON.stringify(v)) },
  push(k,v){ const a=Store.get(k,[]); a.push(v); Store.set(k,a) }
};

const CATALOG=[
  {id:'reaction',name:'Reaction Time',desc:'แตะเร็วเมื่อเปลี่ยนสี',file:'tests/reaction.js',run:'runReaction',levels:['basic','skilled','expert'],cat:'Cognitive'},
  {id:'memory',name:'Memory Grid',desc:'จำตำแหน่งที่กระพริบ',file:'tests/memory.js',run:'runMemory',levels:['basic','skilled','expert'],cat:'Cognitive'},
  {id:'stroop',name:'Stroop',desc:'เลือกสีหมึกแทนคำ',file:'tests/stroop.js',run:'runStroop',levels:['basic','skilled','expert'],cat:'Cognitive'},
  {id:'nback',name:'N-back',desc:'แจ้งเมื่อซ้ำ n-back',file:'tests/nback.js',run:'runNBack',levels:['1','2','3'],cat:'Cognitive'},
  {id:'gng',name:'Go/No-Go',desc:'แตะเป้าหมาย หลีกเลี่ยงสิ่งลวง',file:'tests/gng.js',run:'runGNG',levels:['basic','skilled','expert'],cat:'Attention'},
  {id:'math',name:'Mental Math',desc:'คำนวณเร็ว 10 ข้อ',file:'tests/arithmetic.js',run:'runArithmetic',levels:['basic','skilled','expert'],cat:'Productivity'},
  {id:'typing',name:'Typing Speed',desc:'พิมพ์เร็ว/แม่น (TH/EN)',file:'tests/typing.js',run:'runTyping',levels:['thai','english'],cat:'Productivity'},
  {id:'vsearch',name:'Visual Search',desc:'หาเป้าหมายในฝูงตัวลวง',file:'tests/vsearch.js',run:'runVSearch',levels:['basic','skilled','expert'],cat:'Perception'},
  {id:'breath',name:'Breathing Coach',desc:'Box / 4-7-8 / Coherence',file:'tests/breath.js',run:'runBreath',levels:['box','4-7-8','coherence'],cat:'Recovery'},
  {id:'chronotype',name:'Chronotype Quiz',desc:'ประเมินนกเช้า/นกฮูก',file:'tests/chronotype.js',run:'runChrono',levels:['short'],cat:'Lifestyle'}
];
const CATS=[...new Set(CATALOG.map(t=>t.cat))];
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-');

// Theme
const Theme={ get(){return localStorage.getItem('theme')||'auto'},
  set(m){ localStorage.setItem('theme',m); applyTheme(); } };
function applyTheme(){ const m=Theme.get();
  document.documentElement.removeAttribute('data-theme');
  if(m==='light'||m==='dark') document.documentElement.setAttribute('data-theme',m);
}
applyTheme();
document.addEventListener('click',e=>{
  if(e.target?.id==='themeBtn'){
    const cur=Theme.get(); const next= cur==='auto'?'light': cur==='light'?'dark':'auto';
    Theme.set(next); e.target.textContent=(next==='auto'?'ธีม':next==='light'?'สว่าง':'มืด');
  }
});

// Install prompt
let dp=null;
addEventListener('beforeinstallprompt',e=>{
  e.preventDefault(); dp=e; $('#installBtn').style.display='inline-flex';
});
$('#installBtn')?.addEventListener('click', async ()=>{
  if(!dp) return; dp.prompt(); await dp.userChoice; dp=null; $('#installBtn').style.display='none';
});

// SW (ต้องเป็น https/localhost)
if('serviceWorker' in navigator &&
   (location.protocol==='https:' || location.hostname==='localhost' || location.hostname==='127.0.0.1')){
  addEventListener('load',()=>navigator.serviceWorker.register('sw.js')
    .catch(()=>toast('SW ต้องใช้ https หรือ localhost','error')));
}

// Router
const routes={'/home':home,'/tests':testsHome,'/stats':stats,'/profile':profile};
function router(){
  const raw=location.hash.replace('#','')||'/home';
  const a=raw.split('/').filter(Boolean); const p='/'+a.join('/');
  $$('.tabbar a').forEach(el=>{
    const t=el.getAttribute('data-tab');
    el.classList.toggle('active',
      (t==='home'&&p.startsWith('/home'))||
      (t==='tests'&&p.startsWith('/tests'))||
      (t==='stats'&&p.startsWith('/stats'))||
      (t==='profile'&&p.startsWith('/profile')));
  });
  if(a[0]==='tests'&&a.length===1) return testsHome();
  if(a[0]==='tests'&&a[1]==='cat'&&a[2]) return testsCat(a[2]);
  if(a[0]==='challenge'&&a[1]) return challenge(a[1]);
  (routes['/'+a[0]]||home)();
}
addEventListener('hashchange',router); addEventListener('load',router);

// ---- Views ----
function home(){
  const mood=(Store.get('moodLog',[]).slice(-1)[0]?.value)||3;
  const secs=(Number(localStorage.getItem('pomodoroLen'))||25)*60;
  if(!localStorage.getItem('pomLenInit')){ localStorage.setItem('pomLenInit','1'); localStorage.setItem('pomodoroLen','25'); }
  window._remain=window._remain||secs;

  $('#app').innerHTML=`
    <section class='row'>
      <div class='col'>
        <div class='card'>
          <h2>อารมณ์วันนี้</h2>
          <div class='kpi' id='moodLabel'>ระดับ ${mood}</div>
          <input id='moodSlider' type='range' min='1' max='5' step='1' value='${mood}'>
        </div>
      </div>
      <div class='col'>
        <div class='card'>
          <h2>โฟกัสไทเมอร์</h2>
          <div id='timer' class='timer'>${fmt(window._remain)}</div>
          <div class='row'>
            <button id='tStart' class='btn primary'>เริ่ม</button>
            <button id='tStop' class='btn'>หยุด</button>
            <button id='tReset' class='btn'>รีเซ็ต</button>
          </div>
        </div>
      </div>
    </section>`;

  $('#moodSlider').addEventListener('input',e=>$('#moodLabel').textContent='ระดับ '+e.target.value);
  $('#moodSlider').addEventListener('change',e=>Store.push('moodLog',{ts:Date.now(),value:Number(e.target.value)}));

  $('#tStart').addEventListener('click',startTimer);
  $('#tStop').addEventListener('click',stopTimer);
  $('#tReset').addEventListener('click',()=>{ window._remain=(Number(localStorage.getItem('pomodoroLen'))||25)*60; upd(); });

  function upd(){ const el=$('#timer'); if(el) el.textContent=fmt(window._remain); }
  function tick(){ window._remain--; upd();
    if(window._remain<=0){ stopTimer(); alert('ครบช่วงโฟกัสแล้ว');
      window._remain=(Number(localStorage.getItem('pomodoroLen'))||25)*60; upd(); } }
  function startTimer(){ if(window._t) return; window._t=setInterval(tick,1000); if(!window._start) window._start=Date.now(); }
  function stopTimer(){ if(!window._t) return; const spent=Math.round((Date.now()-window._start)/1000);
    clearInterval(window._t); window._t=null; window._start=null;
    if(spent>=180) Store.push('focusLog',{ts:Date.now(),sec:spent}); }
  function fmt(s){const m=String(Math.floor(s/60)).padStart(2,'0'), x=String(s%60).padStart(2,'0'); return m+':'+x }

  upd();
}

function testsHome(){
  let html = `<div class='card'><h2>เลือกหมวดชาเลนจ์</h2>
    <small class='muted'>จัดกลุ่มตามลักษณะความสามารถ</small></div><div class='list'>`;
  for(const c of CATS){
    const n=CATALOG.filter(t=>t.cat===c).length;
    html += `<div class='test-item'><h3>${c}</h3><p class='muted'>${n} ชาเลนจ์</p>
      <div class='row'><a class='btn primary' href='#/tests/cat/${slug(c)}'>เปิดดู</a></div></div>`;
  }
  html += `</div>`;
  $('#app').innerHTML = html;
}

function testsCat(s){
  const cat=CATS.find(c=>slug(c)===s)||'All';
  const items=CATALOG.filter(t=>slug(t.cat)===s);
  let h = `<div class='card'><div class='row'><a class='btn' href='#/tests'>← ย้อนกลับ</a><h2>${cat}</h2></div></div><div class='list'>`;
  for(const t of items){
    const last=(Store.get(t.id+'Log',[]).slice(-1)[0]);
    const meta= last? `<span class='meta'>ล่าสุด: ${human(t.id,last)}</span>` : `<span class='meta'>ยังไม่มีผลลัพธ์</span>`;
    h += `<div class='test-item'><h3>${t.name}</h3><p class='muted'>${t.desc}</p>
      <div class='row'><a class='btn primary' href='#/challenge/${t.id}'>รายละเอียด</a></div>${meta}</div>`;
  }
  h += `</div>`;
  $('#app').innerHTML=h;
}

function challenge(id){
  const t=CATALOG.find(x=>x.id===id);
  if(!t){ toast('ไม่พบ','error'); location.hash='#/tests'; return; }
  const opt=t.levels.map(l=>`<option value='${l}'>${l[0].toUpperCase()+l.slice(1)}</option>`).join('');
  $('#app').innerHTML=`
    <div class='card'>
      <div class='row'><a class='btn' href='#/tests/cat/${slug(t.cat)}'>← ย้อนกลับ</a><h2>${t.name}</h2></div>
      <p class='muted'>${t.desc} • หมวด: ${t.cat}</p>
      <div class='row'>
        <label class='col'>ระดับ <select id='level' class='btn'>${opt}</select></label>
        <label class='col'>กำหนดเวลา
          <select id='limit' class='btn'><option value='60'>1 นาที</option><option value='180' selected>3 นาที</option><option value='300'>5 นาที</option></select>
        </label>
      </div>
      <div class='row'><button id='startChallenge' class='btn primary'>เริ่มชาเลนจ์</button></div>
    </div>`;
  $('#startChallenge').addEventListener('click',()=>{
    const level=$('#level').value; const sec=Number($('#limit').value)||180;
    runChallenge(t,level,sec);
  });
}

// ---- Runner + XP ----
const CH={timer:null,endAt:0};
function bar(title){
  let b=$('#challengeBar');
  if(!b){ b=document.createElement('div'); b.id='challengeBar'; b.className='challenge-bar'; $('#app')?.prepend(b); }
  b.innerHTML=`<div><strong>${title}</strong></div><div class='countdown' id='cd'>--:--</div><button id='cancelChallenge' class='btn'>ยกเลิก</button>`;
  return b;
}
function runChallenge(t,level,secs){
  bar(t.name);
  function tick(){
    const left=Math.max(0,Math.round((CH.endAt-Date.now())/1000));
    $('#cd').textContent=`${String(Math.floor(left/60)).padStart(2,'0')}:${String(left%60).padStart(2,'0')}`;
    if(left<=0){ clearInterval(CH.timer); fin({status:'timeout'}); toast('หมดเวลา','error'); }
  }
  CH.endAt=Date.now()+secs*1000; clearInterval(CH.timer); CH.timer=setInterval(tick,250); tick();
  const cancel=()=>{ clearInterval(CH.timer); $('#challengeBar')?.remove(); location.hash='#/tests/cat/'+slug(t.cat); };
  $('#cancelChallenge').addEventListener('click', cancel, {once:true});

  (async ()=>{
    let mod; try{ mod=await import(new URL(t.file, document.baseURI).href); }
    catch(e){ console.error(e); toast('โหลดบททดสอบไม่ได้','error'); cancel(); return; }
    const startedAt=Date.now();
    const onDone=(result)=>fin({status:'done',result,startedAt});
    async function fin(payload){
      clearInterval(CH.timer); $('#challengeBar')?.remove();
      if(payload.status==='done'){
        const spent=Math.round((Date.now()-(payload.startedAt||Date.now()))/1000);
        const res=Object.assign({},payload.result,{level,spent});
        Store.push(t.id+'Log',res);
        const xp=scoreXP(t.id,res); Store.push('xpLog',{ts:Date.now(),id:t.id,xp,level});
        toast('ได้ XP: '+xp,'ok'); location.hash='#/stats';
      } else {
        Store.push('xpLog',{ts:Date.now(),id:t.id,xp:0,level,status:'timeout'});
      }
    }
    try{ await mod[t.run](level, onDone); }
    catch(err){ console.error(err); toast('ข้อผิดพลาดในบททดสอบ','error'); cancel(); }
  })();
}
function scoreXP(id,r){
  switch(id){
    case 'reaction': return Math.max(0,Math.round((600-Math.min(600,r.ms||600))/4));
    case 'memory': return Math.round((r.level||0)*12);
    case 'stroop': return Math.max(0,Math.round((r.acc||0)-Math.min(60,(r.rt||0)/10)));
    case 'nback': return Math.max(0,Math.round((r.acc||0)));
    case 'gng': return Math.max(0,Math.round((r.hit||0)-(r.fa||0)/2));
    case 'math': return Math.max(0,(r.correct||0)*10-Math.round((r.time||0)/2));
    case 'typing': return Math.max(0,Math.round((r.wpm||r.cpm/5||0)));
    case 'vsearch': return Math.max(0,Math.round(100-Math.min(100,(r.avgMs||0)/10)));
    case 'breath': return 20;
    case 'chronotype': return 30;
    default: return 10;
  }
}

function stats(){
  const r=Store.get('reactionLog',[]).slice(-10),
        m=Store.get('memoryLog',[]).slice(-10),
        moods=Store.get('moodLog',[]).slice(-14);
  const idx=capIndex(r,m,moods);
  const totalXP=(Store.get('xpLog',[])||[]).reduce((a,b)=>a+(b.xp||0),0);
  $('#app').innerHTML=`
    <div class='card'>
      <h2>ดัชนีศักยภาพวันนี้</h2>
      <div class='kpi'>${idx.score.toFixed(0)} / 100</div>
      <small class='muted'>${idx.text}</small>
      <hr><div><strong>รวม XP:</strong> ${totalXP}</div>
    </div>
    <div class='card'>
      <h3>Reaction ล่าสุด</h3><div>${r.map(x=>x.ms+'ms').join(' • ')||'—'}</div><hr>
      <h3>Memory ล่าสุด</h3><div>${m.map(x=>'L'+x.level).join(' • ')||'—'}</div><hr>
      <h3>อารมณ์ 14 วัน</h3><div>${moods.map(x=>x.value).join(' • ')||'—'}</div>
    </div>`;
}

function profile(){
  const pom=(Number(localStorage.getItem('pomodoroLen'))||25);
  $('#app').innerHTML=`
    <div class='card'>
      <h2>การตั้งค่า</h2>
      <label>ความยาวโฟกัส (นาที)
        <input id='pomLen' type='number' min='5' max='90' step='5' value='${pom}' class='btn'>
      </label>
      <hr>
      <h3>ข้อมูล</h3>
      <button id='exportData' class='btn'>ส่งออกข้อมูล (JSON)</button>
      <button id='exportCSV' class='btn'>ส่งออก CSV</button>
      <button id='wipeData' class='btn'>ล้างข้อมูล</button>
    </div>`;
  $('#pomLen').addEventListener('change',e=>{
    const v=Math.max(5,Math.min(90,Number(e.target.value)||25));
    localStorage.setItem('pomodoroLen',String(v)); toast('บันทึกแล้ว','ok');
  });
  $('#exportData').addEventListener('click',()=>{
    const data={moodLog:Store.get('moodLog',[]),reactionLog:Store.get('reactionLog',[]),
                memoryLog:Store.get('memoryLog',[]),xpLog:Store.get('xpLog',[])};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='hcap-data.json'; a.click();
  });
  $('#exportCSV').addEventListener('click',()=>{
    const rows=[], keys=['moodLog','reactionLog','memoryLog','stroopLog','nbackLog','gngLog','mathLog','typingLog','vsearchLog','focusLog','xpLog'];
    rows.push(['bucket','ts','payload'].join(','));
    keys.forEach(k=>{
      (Store.get(k,[])||[]).forEach(item=>{
        rows.push([k,(item.ts||''), JSON.stringify(item).replaceAll('"','""')].join(','));
      });
    });
    const blob=new Blob([rows.join('\n')],{type:'text/csv'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='hcap-data.csv'; a.click();
  });
  $('#wipeData').addEventListener('click',()=>{
    if(confirm('ลบข้อมูลทั้งหมด?')) ['moodLog','reactionLog','memoryLog','xpLog','focusLog'].forEach(k=>localStorage.removeItem(k));
  });
}

// Helpers
function capIndex(r,m,mo){
  const best = r.length? Math.min(...r.map(x=>x.ms)) : 600;
  const rS=Math.max(0,Math.min(100,100*(600-Math.min(600,best))/400));
  const mS= m.length? Math.max(...m.map(x=>x.level))*12.5 : 0;
  const moodAvg= mo.length? mo.reduce((a,b)=>a+b.value,0)/mo.length : 3;
  const moodS=(moodAvg-1)*25;
  const s=0.45*rS+0.35*mS+0.2*moodS;
  const text= s>80?'ศักยภาพสูงมาก': s>65?'ดีและเสถียร': s>50?'ปานกลาง':'ต้องปรับพื้นฐาน';
  return {score:s, text};
}
function human(id,r){
  switch(id){
    case 'reaction': return r.ms+'ms';
    case 'memory': return 'L'+r.level;
    case 'vsearch': return r.avgMs+'ms';
    case 'typing': return (r.wpm? r.wpm+' WPM': r.cpm+' CPM');
    case 'math': return (r.correct||0)+'/10';
    case 'nback': return (r.acc||0)+'%';
    case 'gng': return (r.hit||0)+'%';
    case 'stroop': return (r.acc||0)+'%';
    default: return '—';
  }
}
