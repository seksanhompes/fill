const COLORS=[{w:'แดง',c:'#ef4444'},{w:'เขียว',c:'#22c55e'},{w:'น้ำเงิน',c:'#3b82f6'},{w:'เหลือง',c:'#eab308'}];

export async function runStroop(level='basic',onDone=()=>{}){
  const trials= level==='expert'?30: level==='skilled'?24:16;
  const app=document.getElementById('app');
  app.innerHTML=`<div class='challenge-bar'><div><strong>Stroop</strong></div><div id='cd'>—</div><button id='cancel' class='btn'>ยกเลิก</button></div><div class='card'><div id='stim' class='kpi' style='min-height:60px'></div><div id='choices' class='row'></div></div>`;
  const stim=$('#stim'), choices=$('#choices');
  COLORS.forEach((c,i)=>{ const b=document.createElement('button'); b.className='btn'; b.textContent=c.w; b.dataset.i=i; choices.appendChild(b); });
  let ok=0, rt=0;
  for(let t=0;t<trials;t++){
    const ink=Math.floor(Math.random()*4); let word=Math.floor(Math.random()*4);
    if(t%2===0 && word===ink) word=(word+1)%4;
    stim.textContent=COLORS[word].w; stim.style.color=COLORS[ink].c;
    const r=await ask(ink,choices); if(r.ok){ ok++; rt+=r.ms; }
  }
  const acc=Math.round((ok/trials)*100), rtAvg=Math.round(rt/Math.max(ok,1));
  const w=document.createElement('div'); w.className='card';
  w.innerHTML=`<div class='kpi'>${acc}% • ${rtAvg} ms</div><button id='save' class='btn primary'>บันทึก</button>`;
  choices.parentElement.after(w);
  $('#save').addEventListener('click',()=>onDone({ts:Date.now(),acc,rt:rtAvg}));
}
function ask(target,wrap){
  return new Promise(res=>{
    const start=performance.now();
    const h=e=>{
      const i=Number(e.currentTarget.dataset.i);
      wrap.querySelectorAll('button').forEach(b=>b.removeEventListener('click',h));
      res({ok:i===target, ms:Math.round(performance.now()-start)});
    };
    wrap.querySelectorAll('button').forEach(b=>b.addEventListener('click',h,{once:true}));
  });
}
function $(s,e=document){return e.querySelector(s)}
