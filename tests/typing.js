const TH=['วันนี้อากาศดี เรามาเริ่มต้นสิ่งใหม่กันเถอะ','ความสำเร็จเริ่มจากการลงมือทำในวันนี้','คิดดี พูดดี ทำดี แล้วชีวิตจะดี'];
const EN=['Focus on progress, not perfection.','Small steps every day lead to big changes.','Discipline beats motivation in the long run.'];

export async function runTyping(level='thai',onDone=()=>{}){
  const text=(level==='english'?EN:TH)[Math.floor(Math.random()*3)];
  const app=document.getElementById('app');
  app.innerHTML=`<div class='challenge-bar'><div><strong>Typing</strong></div><div id='cd'>—</div><button id='cancel' class='btn'>ยกเลิก</button></div><div class='card'><p class='muted'>พิมพ์ให้ตรงตามข้อความ แล้วกด Enter</p><div class='card' style='background:var(--surface)'>${text}</div><input id='in' class='btn' placeholder='เริ่มพิมพ์ที่นี่' /><div id='stat' class='muted'></div></div>`;
  const input=$('#in'); let start=null;
  function cpl(a,b){ let i=0; for(;i<Math.min(a.length,b.length);i++){ if(a[i]!==b[i]) break; } return i; }
  input.addEventListener('input',()=>{
    if(!start) start=performance.now();
    const typed=input.value; const correct=cpl(text,typed); const sec=(performance.now()-start)/1000;
    const cpm=Math.round((correct/sec)*60); const wpm=Math.round(((correct/5)/sec)*60);
    $('#stat').textContent=`${cpm} CPM • ${wpm} WPM`;
  });
  input.addEventListener('keydown',e=>{
    if(e.key==='Enter'){
      e.preventDefault();
      const sec=(performance.now()-start)/1000; const typed=input.value; const correct=cpl(text,typed);
      const cpm=Math.round((correct/sec)*60); const wpm=Math.round(((correct/5)/sec)*60);
      const acc=Math.round(100*correct/Math.max(text.length,1));
      app.innerHTML=`<div class='card center' style='min-height:40vh;text-align:center'><div class='kpi'>${level==='english'? wpm+' WPM' : cpm+' CPM'}</div><small>ความถูกต้อง ${acc}%</small><br><br><div><button id='save' class='btn primary'>บันทึก</button></div></div>`;
      $('#save').addEventListener('click',()=>onDone({ts:Date.now(),wpm,cpm,acc,level}));
    }
  });
  input.focus();
}
function $(s,e=document){return e.querySelector(s)}
