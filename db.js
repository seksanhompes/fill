// db.js — IndexedDB adapter (client-side)
const BUCKETS=['moodLog','reactionLog','memoryLog','stroopLog','nbackLog','gngLog','mathLog','typingLog','vsearchLog','focusLog','xpLog'];

export const DB={
  _db:null,
  async _open(){
    if(this._db) return this._db;
    return new Promise((res,rej)=>{
      const req=indexedDB.open('hcap',1);
      req.onupgradeneeded=()=>{ const db=req.result; BUCKETS.forEach(s=>{ if(!db.objectStoreNames.contains(s)) db.createObjectStore(s,{keyPath:'id',autoIncrement:true}); }); };
      req.onsuccess=()=>res(this._db=req.result);
      req.onerror=()=>rej(req.error);
    });
  },
  async put(bucket, payload){
    try{
      const db=await this._open();
      await new Promise((res,rej)=>{
        const tx=db.transaction(bucket,'readwrite');
        tx.objectStore(bucket).add({ts: payload?.ts || Date.now(), data: payload});
        tx.oncomplete=res; tx.onerror=()=>rej(tx.error);
      });
    }catch{}
  },
  async all(){
    const db=await this._open(); const out={}; const names=Array.from(db.objectStoreNames);
    await Promise.all(names.map(n=>new Promise((res,rej)=>{
      const tx=db.transaction(n,'readonly'); const st=tx.objectStore(n); const rq=st.getAll();
      rq.onsuccess=()=>{ out[n]=rq.result; res(); }; rq.onerror=()=>rej(rq.error);
    })));
    return out;
  }
};
