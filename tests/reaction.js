export async function runReaction(level='basic',onDone=()=>{}){
  const app=document.getElementById('app');
  app.innerHTML=`<div class='challenge-bar'><div><strong>Reaction</strong></div><div id='cd'>—</div><button id='cancel' class='btn'>ยกเลิก</button></div><div class='card center' style='min-height:50vh'><div id='stage' style='width:100%;height:260px;border-radius:12px;border:1px solid #333;display:flex;align-items:center;justify-content:center;background:#2a2d34;cursor:pointer'><div class='muted'>แตะเมื่อเป็นสีเขียว</div></div></div>`;
  const stage=document.getElementById('stage');
  await new Promise(r=>setTimeout(r,600));
  const map={basic:[1200,2500],skilled:[900,1800],expert:[700,1400]}, [mn,mx]=(map[level]||map.basic);
  const wait=Math.floor(Math.random()*(mx-mn)+mn);
  let ready=false;
  const tooSoon=()=>{ if(!ready){ stage.style.background='#ef4444'; stage.innerHTML='<div>เร็วไป • แตะเพื่อเริ่มใหม่</div>'; stage.addEventListener('pointerdown',()=>runReaction(level,onDone),{once:true}); } };
  stage.addEventListener('pointerdown',tooSoon,{once:true});
  await new Promise(r=>setTimeout(r,wait));
  ready=true; stage.removeEventListener('pointerdown',tooSoon);
  stage.style.background='#16a34a';
  const start=performance.now();
  stage.innerHTML='<div>แตะเดี๋ยวนี้!</div>';
  stage.addEventListener('pointerdown',()=>{
    const ms=Math.round(performance.now()-start);
    stage.innerHTML=`<div class='kpi'>${ms} ms</div><button id='save' class='btn primary'>บันทึก</button>`;
    document.getElementById('save').addEventListener('click',()=>onDone({ts:Date.now(),ms,level}));
  },{once:true});
}
