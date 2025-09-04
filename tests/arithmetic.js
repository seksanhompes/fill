function gen(level){
  const ops=level==='expert'?['+','-','×','÷']: level==='skilled'?['+','-','×']: ['+','-'];
  const a=Math.floor(Math.random()*(level==='expert'?90:60))+10;
  const b=Math.floor(Math.random()*(level==='expert'?90:60))+1;
  const op=ops[Math.floor(Math.random()*(ops.length))];
  let ans; switch(op){ case '+':ans=a+b;break; case '-':ans=a-b;break; case '×':ans=a*b;break; case '÷':ans=Math.floor(a/b);break; }
  return {q:`${a} ${op} ${b} = ?`, ans};
}
export async function runArithmetic(level='basic',onDone=()=>{}){
  const total=10;
  const app=document.getElementById('app');
  app.innerHTML=`<div class='challenge-bar'><div><strong>Mental Math</strong></div><div id='cd'>—</div><button id='cancel' class='btn'>ยกเลิก</button></div><div class='card'><div id='q' class='kpi' style='font-size:32px'></div><div class='row'><input id='ans' type='number' class='btn' placeholder='คำตอบ'><button id='ok' class='btn primary'>ยืนยัน</button></div><small id='prog' class='muted'>0/${total}</small></div>`;
  let correct=0,i=0; const t0=performance.now(); let cur=gen(level); show();
  $('#ok').addEventListener('click',check);
  $('#ans').addEventListener('keydown',e=>{ if(e.key==='Enter') check(); });
  function show(){ $('#q').textContent=cur.q; $('#prog').textContent=`${i}/${total}`; const input=$('#ans'); input.value=''; input.focus(); }
  function check(){
    const val=Number($('#ans').value);
    if(val===cur.ans) correct++; i++;
    if(i>=total){
      const time=Math.round((performance.now()-t0)/1000);
      app.innerHTML=`<div class='card center' style='min-height:40vh;text-align:center'><div class='kpi'>${correct}/${total} • ${time}s</div><div><button id='save' class='btn primary'>บันทึก</button></div></div>`;
      $('#save').addEventListener('click',()=>onDone({ts:Date.now(),correct,time}));
    } else { cur=gen(level); show(); }
  }
  function $(s,e=document){return e.querySelector(s)}
}
