const L='ABCD';
export async function runNBack(n='1',onDone=()=>{}){
  n=Number(n)||1; const len=20+n*4;
  const app=document.getElementById('app');
  app.innerHTML=`<div class='challenge-bar'><div><strong>N-back (${n})</strong></div><div id='cd'>—</div><button id='cancel' class='btn'>ยกเลิก</button></div><div class='card center' style='min-height:50vh;flex-direction:column'><div id='letter' class='kpi' style='font-size:56px'>•</div><div class='row'><button id='btn' class='btn primary'>MATCH</button></div><small class='muted'>กด MATCH เมื่ออักษรซ้ำกับ ${n}-back</small></div>`;
  const seq=[]; let hits=0, fas=0, misses=0; const btn=$('#btn');
  for(let i=0;i<len;i++){
    const ch=L[Math.floor(Math.random()*L.length)]; seq.push(ch);
    $('#letter').textContent=ch; let clicked=false; const on=()=>{clicked=true};
    btn.addEventListener('click',on,{once:true}); await sleep(1000); btn.removeEventListener('click',on);
    const target=i>=n && seq[i]===seq[i-n];
    if(target&&clicked) hits++; else if(target&&!clicked) misses++; else if(!target&&clicked) fas++;
  }
  const acc=Math.max(0,Math.round(100*(hits-0.5*fas)/Math.max(len,1)));
  app.innerHTML=`<div class='card center' style='min-height:40vh;text-align:center'><div class='kpi'>${acc}%</div><div><button id='save' class='btn primary'>บันทึก</button></div></div>`;
  $('#save').addEventListener('click',()=>onDone({ts:Date.now(),n,acc,hits,fas,misses}));
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function $(s,e=document){return e.querySelector(s)}
