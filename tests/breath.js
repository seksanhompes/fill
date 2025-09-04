export async function runBreath(mode='box',onDone=()=>{}){
  const presets={'box':{inh:4,hold1:4,ex:4,hold2:4,note:'4-4-4-4'},'4-7-8':{inh:4,hold1:7,ex:8,hold2:0,note:'4-7-8'},'coherence':{inh:5,hold1:0,ex:5,hold2:0,note:'5-5 (6 bpm)'}};
  const p=presets[mode]||presets.box;
  const app=document.getElementById('app');
  app.innerHTML=`<div class='challenge-bar'><div><strong>Breathing (${mode})</strong></div><div id='cd'>—</div><button id='cancel' class='btn'>ยกเลิก</button></div><div class='card center' style='min-height:70vh;flex-direction:column'><small class='muted'>${p.note}</small><div id='circle' style='width:220px;height:220px;border-radius:50%;border:2px solid var(--line);background:var(--surface);margin:16px'></div><div id='phase' class='kpi'>พร้อม</div><div style='margin-top:12px'><button id='start' class='btn primary'>เริ่ม</button><button id='stop' class='btn'>หยุด</button><button id='done' class='btn'>เสร็จสิ้น</button></div></div>`;
  const circle=$('#circle'), phase=$('#phase');
  let running=false, raf=null, t0=0, phaseName='idle';
  const seq=[['inh',p.inh],['hold',p.hold1],['ex',p.ex],['hold',p.hold2]].filter(([,s])=>s>0);
  function loop(){
    if(!running){ cancelAnimationFrame(raf); return; }
    const elapsed=(performance.now()-t0)/1000; const total=seq.reduce((a,[,s])=>a+s,0);
    let e=elapsed%total, acc=0, idx=0, sec;
    for(let i=0;i<seq.length;i++){ if(e>=acc && e<acc+seq[i][1]){ idx=i; sec=seq[i][1]; break;} acc+=seq[i][1]; }
    if(!phaseName||phaseName==='idle'){ const [nm,sc]=seq[idx%seq.length]; phaseName=nm; phase.textContent=(nm==='inh'?'หายใจเข้า':nm==='ex'?'หายใจออก':'กลั้นหายใจ')+' '+sc+'s'; }
    const [nm]=seq[idx]; const prog=(e-(acc-(sec||0)))/(sec||1); const scale= nm==='inh'? 0.6+0.4*prog : nm==='ex'? 1-0.4*prog : 1; circle.style.transform=`scale(${scale})`;
    raf=requestAnimationFrame(loop);
  }
  $('#start').addEventListener('click',()=>{ if(!running){ running=true; t0=performance.now(); phaseName='idle'; loop(); } });
  $('#stop').addEventListener('click',()=>{ running=false; phase.textContent='หยุด'; });
  $('#done').addEventListener('click',()=>{ running=false; onDone({ts:Date.now(),mode}); });
}
function $(s,e=document){return e.querySelector(s)}
