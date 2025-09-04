export async function runVSearch(level='basic',onDone=()=>{}){
  const size= level==='expert'?12: level==='skilled'?10:8, rounds=5;
  const app=document.getElementById('app');
  app.innerHTML=`<div class='challenge-bar'><div><strong>Visual Search</strong></div><div id='cd'>—</div><button id='cancel' class='btn'>ยกเลิก</button></div><div class='card'><div id='board' style='display:grid;gap:6px;grid-template-columns:repeat(${size},1fr)'></div></div>`;
  const board=$('#board'), times=[];
  function rand(ex){ const s='ABCDEFGHJKLMNPQRSTUVWXYZ'; let ch=s[Math.floor(Math.random()*s.length)]; if(ex&&ch===ex) return rand(ex); return ch; }
  for(let r=0;r<rounds;r++){
    board.innerHTML=''; const target=rand(); const distract=rand(target);
    const cells=size*size; const pos=Math.floor(Math.random()*cells);
    let done; const clicked=new Promise(res=>done=res); const t0=performance.now();
    for(let i=0;i<cells;i++){
      const b=document.createElement('button'); b.className='btn'; b.style.padding='8px'; b.textContent=(i===pos?target:distract);
      b.addEventListener('click',()=>{ if(i===pos){ done(Math.round(performance.now()-t0)); } });
      board.appendChild(b);
    }
    const ms=await clicked; times.push(ms); await new Promise(r=>setTimeout(r,200));
  }
  const avg=Math.round(times.reduce((a,b)=>a+b,0)/Math.max(times.length,1));
  board.innerHTML=`<div class='center' style='min-height:40vh;flex-direction:column'><div class='kpi'>${avg} ms</div><div><button id='save' class='btn primary'>บันทึก</button></div></div>`;
  $('#save').addEventListener('click',()=>onDone({ts:Date.now(),avgMs:avg,size}));
}
function $(s,e=document){return e.querySelector(s)}
