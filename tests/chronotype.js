export async function runChrono(level='short',onDone=()=>{}){
  const Q=[
    {q:'ตื่นเองบ่อยสุดช่วงไหน?',a:[['ก่อน 6 โมง',-2],['6-7 โมง',-1],['7-8 โมง',0],['หลัง 8 โมง',+1]]},
    {q:'ช่วงพลังงาน/โฟกัสดีสุด',a:[['เช้ามาก',-2],['สาย-เที่ยง',-1],['บ่าย',0],['ค่ำ-ดึก',+2]]},
    {q:'วันหยุดนอนดึกแค่ไหน?',a:[['ก่อน 22:00',-2],['22:00-23:00',-1],['23:00-00:00',0],['หลังเที่ยงคืน',+2]]},
    {q:'ตื่นเช้าแล้วสดชื่นง่ายไหม?',a:[['มาก',-2],['พอได้',-1],['เฉยๆ',0],['ยาก',+2]]},
    {q:'หลัง 21:00 พลังงานเป็นอย่างไร?',a:[['ตกชัดเจน',-2],['ลดลงเล็กน้อย',-1],['ปกติ',0],['พุ่งขึ้น',+2]]}
  ];
  const app=document.getElementById('app'); let i=0, score=0;
  app.innerHTML=`<div class='challenge-bar'><div><strong>Chronotype</strong></div><div id='cd'>—</div><button id='cancel' class='btn'>ยกเลิก</button></div><div class='card'><h2>แบบประเมิน Chronotype</h2><div id='q'></div><div id='opts' class='row' style='margin-top:8px'></div></div>`;
  show();
  function show(){
    const cur=Q[i]; $('#q').innerHTML=`<div class='kpi' style='font-size:20px'>${i+1}. ${cur.q}</div>`;
    const ops=$('#opts'); ops.innerHTML='';
    cur.a.forEach(([label,val])=>{
      const b=document.createElement('button'); b.className='btn'; b.textContent=label;
      b.addEventListener('click',()=>{ score+=val; i++; if(i>=Q.length) finish(); else show(); });
      ops.appendChild(b);
    });
  }
  function finish(){
    let type, tip;
    if(score<=-4){ type='นกเช้า (Lark)'; tip='งานสำคัญ 7:00–11:00'; }
    else if(score>=4){ type='นกฮูก (Owl)'; tip='งานลึก 17:00–22:00'; }
    else { type='กลางวัน (Intermediate)'; tip='งาน 10:00–14:00'; }
    app.innerHTML=`<div class='card center' style='min-height:50vh;flex-direction:column;text-align:center'><div class='kpi'>${type}</div><small class='muted'>${tip}</small><br><br><button id='save' class='btn primary'>บันทึก</button></div>`;
    $('#save').addEventListener('click',()=>onDone({ts:Date.now(),type,score,tip}));
  }
}
function $(s,e=document){return e.querySelector(s)}
