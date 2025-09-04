export async function runMemory(level='basic',onDone=()=>{}){
  const N={basic:3,skilled:4,expert:5}[level]||3;
  const app=document.getElementById('app');
  app.innerHTML=`<div class='challenge-bar'><div><strong>Memory</strong></div><div id='cd'>—</div><button id='cancel' class='btn'>ยกเลิก</button></div><div class='card'><h2>จำลำดับ</h2><div id='g' class='grid' style='grid-template-columns:repeat(${N},1fr)'></div><div id='msg' class='muted'>ลำดับจะกระพริบ</div></div>`;
  const g=document.getElementById('g'); const cells=[];
  for(let i=0;i<N*N;i++){ const c=document.createElement('div'); c.className='cell'; c.dataset.idx=i; g.appendChild(c); cells.push(c); }
  await sleep(500);
  const seq=[]; let round=1;
  while(true){
    seq.push(Math.floor(Math.random()*N*N));
    await flash(seq,cells);
    const got=await capture(seq.length,cells);
    if(!got.every((v,i)=>v===seq[i])) break;
    round++;
  }
  const res={ts:Date.now(),level:round-1,size:N};
  const w=document.createElement('div'); w.className='card';
  w.innerHTML=`<div class='kpi'>Level ${res.level}</div><button id='save' class='btn primary'>บันทึก</button>`;
  g.parentElement.after(w);
  document.getElementById('save').addEventListener('click',()=>onDone(res));
}
async function flash(seq,cs){ for(const i of seq){ cs[i].classList.add('flash'); await sleep(550); cs[i].classList.remove('flash'); await sleep(250);} }
function capture(n,cs){ return new Promise(res=>{ const a=[]; const h=e=>{ a.push(Number(e.currentTarget.dataset.idx)); if(a.length===n){ cs.forEach(c=>c.removeEventListener('click',h)); res(a);} }; cs.forEach(c=>c.addEventListener('click',h)); }); }
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
