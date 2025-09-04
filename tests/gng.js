export async function runGNG(level='basic',onDone=()=>{}){
  const speed= level==='expert'?650: level==='skilled'?800:1000;
  const trials=30, goR=0.7;
  const app=document.getElementById('app');
  app.innerHTML=`<div class='challenge-bar'><div><strong>Go/No-Go</strong></div><div id='cd'>—</div><button id='cancel' class='btn'>ยกเลิก</button></div><div class='card center' style='min-height:50vh;flex-direction:column'><div id='stim' class='kpi' style='font-size:52px'>+</div><div class='row'><button id='tap' class='btn primary'>แตะเมื่อเห็น ⦿ (ห้ามแตะเมื่อเป็น ■)</button></div></div>`;
  const tap=$('#tap'); let hits=0, fas=0, miss=0, can=false, isGo=false;
  const onTap=()=>{ if(!can) return; if(isGo) hits++; else fas++; can=false; };
  tap.addEventListener('click',onTap);
  for(let i=0;i<trials;i++){
    isGo=Math.random()<goR; const el=$('#stim'); el.textContent=isGo?'⦿':'■';
    can=true; await sleep(speed); if(isGo&&can) miss++; can=false;
    el.textContent='+'; await sleep(300);
  }
  tap.removeEventListener('click',onTap);
  const hit=Math.round(100*hits/Math.max(Math.round(trials*goR),1));
  const fa=Math.round(100*fas/Math.max(Math.round(trials*(1-goR)),1));
  app.innerHTML=`<div class='card center' style='min-height:40vh;text-align:center'><div class='kpi'>ถูก ${hit}% • หลุดมือ ${fa}%</div><small>พลาด: ${miss}</small><br><br><div><button id='save' class='btn primary'>บันทึก</button></div></div>`;
  $('#save').addEventListener('click',()=>onDone({ts:Date.now(),hit,fa,miss}));
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function $(s,e=document){return e.querySelector(s)}
