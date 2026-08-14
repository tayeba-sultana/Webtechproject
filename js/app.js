/* ════════════════════════════════════
   SEC MUSLIMAH COMMUNITY — SHARED APP LOGIC
   Data persists in localStorage so every public page
   and the Admin Panel see the same information.
   ════════════════════════════════════ */

const STORE_KEY = 'secMuslimahDB_v1';

const DEFAULT_DB = {
  events: [
    {id:'e1',title:'Quran Recitation & Tafsir Circle',date:'2025-05-10',time:'3:00 PM – 5:00 PM',location:'SEC Seminar Hall',desc:'A beautiful gathering to recite, reflect and understand the meanings of selected Surahs together as sisters.',seats:'20 spots left',status:'open'},
    {id:'e2',title:'Sisters\' Halaqa — Seerah Series',date:'2025-05-18',time:'2:30 PM – 4:30 PM',location:'SEC Girls Common Room',desc:'Exploring the life of the Prophet ﷺ — his character, wisdom and lessons for our daily student life.',seats:'12 spots left',status:'open'},
    {id:'e3',title:'Dawah Workshop: Speaking with Wisdom',date:'2025-06-03',time:'10:00 AM – 1:00 PM',location:'SEC Lecture Hall B',desc:'Learn the art of sharing Islam with kindness, clarity and genuine care — a hands-on workshop.',seats:'Fully Booked',status:'full'}
  ],
  notices: [
    {id:'n1',type:'urgent',title:'Membership Registration Deadline Extended',text:'The deadline to submit your membership form has been extended to May 15, 2025. Please submit before the date to receive your membership card.',date:'May 1, 2025'},
    {id:'n2',type:'normal',title:'Monthly Meeting — Agenda Released',text:'The agenda for our May monthly meeting has been published. Topics include Ramadan reflections, new event planning, and resource sharing.',date:'April 28, 2025'},
    {id:'n3',type:'info',title:'New Resource Library Coming Soon',text:'We are compiling a collection of Islamic articles, duas and hadith. Updated every week in sha Allah.',date:'April 20, 2025'},
    {id:'n4',type:'normal',title:'Weekly Dhikr Circle — Every Thursday',text:'Our informal weekly dhikr and dua gathering continues every Thursday after Asr at the girls prayer room. All welcome.',date:'April 15, 2025'}
  ],
  resources: [
    {id:'r1',type:'ayah',src:'Surah At-Talaq (65:2–3)',arabic:'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ',trans:'And whoever fears Allah — He will make for him a way out, and will provide for him from where he does not expect.'},
    {id:'r2',type:'ayah',src:'Surah Ash-Sharh (94:6)',arabic:'إِنَّ مَعَ الْعُسْرِ يُسْرًا',trans:'Indeed, with hardship will be ease.'},
    {id:'r3',type:'hadith',src:'Ibn Majah',arabic:'طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ',trans:'Seeking knowledge is an obligation upon every Muslim.'},
    {id:'r4',type:'hadith',src:'Sahih Bukhari & Muslim',arabic:'الْمُؤْمِنُ لِلْمُؤْمِنِ كَالْبُنْيَانِ يَشُدُّ بَعْضُهُ بَعْضًا',trans:'A believer to another believer is like a building — each part strengthens and supports the other.'},
    {id:'r5',type:'article',src:'The Importance of Seeking Knowledge',arabic:'',trans:'Islam places immense value on learning for both men and women equally. The very first word revealed was Iqra: Read. As students, we are already on a path deeply honoured by our deen.'},
    {id:'r6',type:'article',src:'Sisterhood in Islam',arabic:'',trans:'True sisterhood is one of the greatest gifts of this deen. When we gather for the sake of Allah, the angels surround us and Allah mentions us among those with Him.'}
  ],
  members: [],
  regs: [],
  midCounter: 0,
  admins: [
    {id:'a1', username:'admin', password:'secmuslimah2025', name:'Super Admin', createdAt:'Initial Setup'}
  ],
  campaigns: [
    {id:'c1', type:'event', title:'Muslimah Summit', desc:'Help us fund venue, guest speakers and logistics for our flagship annual Muslimah Summit — a day of talks, workshops and sisterhood.', goal:20000, status:'active', createdAt:'Initial Setup'},
    {id:'c2', type:'activity', title:'Fiqh & Faith Intensive', desc:'Support our Fiqh & Faith Intensive — a focused learning program covering fiqh, aqeedah and practical deen for sisters.', goal:10000, status:'active', createdAt:'Initial Setup'}
  ],
  causes: [
    {id:'ca1', icon:'🌊', title:'Flood Relief Fund', desc:'Emergency support — food, clean water and shelter essentials — for families affected by flooding.', goal:20000, status:'active', createdAt:'Initial Setup'},
    {id:'ca2', icon:'🕊️', title:'Palestine Relief Fund', desc:'Contributing towards humanitarian relief efforts for our brothers and sisters in Palestine.', goal:30000, status:'active', createdAt:'Initial Setup'},
    {id:'ca3', icon:'🧸', title:'Orphanage Support Fund', desc:'Supporting local orphanages with essentials, education costs and everyday care for the children.', goal:15000, status:'active', createdAt:'Initial Setup'}
  ],
  donations: [],
  clothDrives: [
    {id:'cd1', season:'winter', title:'Winter Clothes Collection 2025', desc:'Collecting warm clothes, blankets and shawls to distribute to families in need around Sylhet.', dropoff:'SEC Girls Common Room, Room 204', deadline:'2025-12-15', status:'active'},
    {id:'cd2', season:'summer', title:'Summer Clothes Collection 2025', desc:'Collecting lightweight, gently-used clothing for families in need during the summer months.', dropoff:'SEC Girls Common Room, Room 204', deadline:'2026-06-30', status:'active'}
  ],
  clothPledges: [],
  settings: { bkashNumber:'01712-345678', bkashType:'Personal' }
};

/* ── LOAD / SAVE ── */
function loadDB(){
  try{
    const raw = localStorage.getItem(STORE_KEY);
    if(raw){
      const parsed = JSON.parse(raw);
      // Migration: older saved data (before multi-admin support) won't have an admins list yet.
      if(!Array.isArray(parsed.admins) || !parsed.admins.length){
        parsed.admins = JSON.parse(JSON.stringify(DEFAULT_DB.admins));
      }
      // Migration: older saved data (before donations/fundraising support) won't have these yet.
      if(!Array.isArray(parsed.campaigns))   parsed.campaigns   = JSON.parse(JSON.stringify(DEFAULT_DB.campaigns));
      if(!Array.isArray(parsed.causes))      parsed.causes      = JSON.parse(JSON.stringify(DEFAULT_DB.causes));
      if(!Array.isArray(parsed.donations))   parsed.donations   = [];
      if(!Array.isArray(parsed.clothDrives)) parsed.clothDrives = JSON.parse(JSON.stringify(DEFAULT_DB.clothDrives));
      if(!Array.isArray(parsed.clothPledges))parsed.clothPledges= [];
      if(!parsed.settings) parsed.settings = JSON.parse(JSON.stringify(DEFAULT_DB.settings));
      return parsed;
    }
  }catch(e){ console.warn('Could not read local storage, starting fresh.', e); }
  return JSON.parse(JSON.stringify(DEFAULT_DB));
}
function saveDB(){
  try{ localStorage.setItem(STORE_KEY, JSON.stringify(DB)); }
  catch(e){ console.warn('Could not save to local storage.', e); }
}

let DB = loadDB();

/* ── HELPERS ── */
function uid(){ return '_'+Math.random().toString(36).substr(2,9); }
function fmtDate(d){
  if(!d) return '';
  try{ return new Date(d+'T00:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}); }
  catch(e){ return d; }
}
function todayStr(){
  return new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
}
function genMID(){
  DB.midCounter++;
  return 'SMC-' + String(DB.midCounter).padStart(4,'0');
}

/* ════════════════════════════════════
   NAV — active link + hamburger
   ════════════════════════════════════ */
function initNav(){
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if(hamburger && navLinks){
    hamburger.onclick = ()=> navLinks.classList.toggle('open');
  }
  const here = (location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.nav-links a').forEach(a=>{
    const href = a.getAttribute('href');
    if(href === here || (here === '' && href === 'index.html')){
      a.classList.add('active');
    }
  });
}

/* ════════════════════════════════════
   RENDER: EVENTS (events.html)
   ════════════════════════════════════ */
function renderEvents(){
  const el = document.getElementById('evGrid');
  if(!el) return;
  if(!DB.events.length){ el.innerHTML='<div class="noevent">No upcoming events at the moment. Check back soon! 🌙</div>'; return; }
  el.innerHTML = DB.events.map(e=>`
    <div class="ecard">
      <div class="ebar"></div>
      <div class="ebody">
        <span class="edate">📅 ${fmtDate(e.date)}</span>
        <div class="etitle">${e.title}</div>
        <p class="edesc">${e.desc}</p>
        <div class="emeta"><span>🕐 ${e.time}</span><span>📍 ${e.location}</span><span>👥 ${e.seats}</span></div>
        ${e.status==='full'
          ? `<button class="breg efull" disabled>Fully Booked</button>`
          : `<button class="breg" onclick="openReg('${e.id}','${e.title.replace(/'/g,"\\'").replace(/"/g,'&quot;')}')">Register Now ✦</button>`
        }
      </div>
    </div>`).join('');
}

/* ════════════════════════════════════
   RENDER: NOTICES (notices.html)
   ════════════════════════════════════ */
function renderNotices(){
  const el = document.getElementById('notList');
  if(!el) return;
  if(!DB.notices.length){ el.innerHTML='<div class="nonot">No notices at the moment.</div>'; return; }
  const icons={urgent:'📢',normal:'📌',info:'💡'};
  const tags={urgent:'Urgent',normal:'Announcement',info:'Info'};
  el.innerHTML = DB.notices.map(n=>`
    <div class="ni ${n.type}">
      <div class="nico">${icons[n.type]||'📌'}</div>
      <div>
        <div class="ntag">${tags[n.type]||'Notice'}</div>
        <div class="ntit">${n.title}</div>
        <p class="ntxt">${n.text}</p>
        <div class="ndate">Posted: ${n.date}</div>
      </div>
    </div>`).join('');
}

/* ════════════════════════════════════
   RENDER: RESOURCES (resources.html)
   ════════════════════════════════════ */
function renderResources(){
  if(!document.getElementById('gAyah')) return;
  const ayahs   = DB.resources.filter(r=>r.type==='ayah');
  const hadiths = DB.resources.filter(r=>r.type==='hadith');
  const arts    = DB.resources.filter(r=>r.type==='article');

  const cAH = r=>`<div class="rc"><div class="rtype">${r.type==='ayah'?'Ayah of the Week':'Hadith'}</div>${r.arabic?`<div class="rarabic">${r.arabic}</div>`:''}<p class="rtrans">"${r.trans}"</p><div class="rsrc">— ${r.src}</div></div>`;
  const cArt= r=>`<div class="rc"><div class="rtype">Article</div><div style="font-family:'Playfair Display',serif;font-size:1.1rem;font-weight:700;margin-bottom:.6rem;color:var(--deep)">${r.src}</div><p class="rtrans" style="font-style:normal">${r.trans}</p></div>`;

  document.getElementById('gAyah').innerHTML    = ayahs.length   ? ayahs.map(cAH).join('')   : '<div class="nores">No ayahs added yet.</div>';
  document.getElementById('gHadith').innerHTML  = hadiths.length ? hadiths.map(cAH).join('')  : '<div class="nores">No hadith added yet.</div>';
  document.getElementById('gArt').innerHTML     = arts.length    ? arts.map(cArt).join('')    : '<div class="nores">No articles added yet.</div>';
}

function swTab(t,btn){
  document.querySelectorAll('.tpane').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.tbtn').forEach(b=>b.classList.remove('active'));
  document.getElementById('tp-'+t).classList.add('active'); btn.classList.add('active');
}

/* ════════════════════════════════════
   DONATIONS & FUNDRAISING HELPERS
   ════════════════════════════════════ */
function raisedFor(targetId){
  return DB.donations.filter(d=>d.targetId===targetId && d.status==='verified')
    .reduce((s,d)=>s+Number(d.amount||0),0);
}

/* ════════════════════════════════════
   RENDER: FUNDRAISING CAMPAIGNS (donate.html)
   ════════════════════════════════════ */
function renderCampaigns(){
  const el = document.getElementById('campGrid');
  if(!el) return;
  const active = DB.campaigns.filter(c=>c.status==='active');
  if(!active.length){ el.innerHTML='<div class="noevent">No active fundraising campaigns right now. Check back soon! 🌙</div>'; return; }
  el.innerHTML = active.map(c=>{
    const raised = raisedFor(c.id);
    const pct = c.goal ? Math.min(100, Math.round(raised/c.goal*100)) : 0;
    return `
    <div class="ecard">
      <div class="ebar"></div>
      <div class="ebody">
        <span class="edate">${c.type==='event'?'📅 Event Fund':'🤝 Activity Fund'}</span>
        <div class="etitle">${c.title}</div>
        <p class="edesc">${c.desc}</p>
        <div class="pbwrap">
          <div class="pbtrack"><div class="pbfill" style="width:${pct}%"></div></div>
          <div class="pbmeta"><span>৳${raised.toLocaleString()} raised</span><span>Goal ৳${c.goal.toLocaleString()}</span></div>
        </div>
        <button class="breg" onclick="openDonate('campaign','${c.id}','${c.title.replace(/'/g,"\\'").replace(/"/g,'&quot;')}')">Donate via bKash 💗</button>
      </div>
    </div>`;
  }).join('');
}

/* ════════════════════════════════════
   RENDER: DONATION CAUSES (donate.html)
   ════════════════════════════════════ */
function renderCauses(){
  const el = document.getElementById('causeGrid');
  if(!el) return;
  const active = DB.causes.filter(c=>c.status==='active');
  if(!active.length){ el.innerHTML='<div class="noevent">No active donation causes right now. Check back soon! 🌙</div>'; return; }
  el.innerHTML = active.map(c=>{
    const raised = raisedFor(c.id);
    const pct = c.goal ? Math.min(100, Math.round(raised/c.goal*100)) : 0;
    return `
    <div class="ecard">
      <div class="ebar"></div>
      <div class="ebody">
        <span class="edate">${c.icon||'🤲'} Donation Cause</span>
        <div class="etitle">${c.title}</div>
        <p class="edesc">${c.desc}</p>
        <div class="pbwrap">
          <div class="pbtrack"><div class="pbfill" style="width:${pct}%"></div></div>
          <div class="pbmeta"><span>৳${raised.toLocaleString()} raised</span><span>Goal ৳${c.goal.toLocaleString()}</span></div>
        </div>
        <button class="breg" onclick="openDonate('cause','${c.id}','${c.title.replace(/'/g,"\\'").replace(/"/g,'&quot;')}')">Donate via bKash 💗</button>
      </div>
    </div>`;
  }).join('');
}

/* ════════════════════════════════════
   RENDER: CLOTHES COLLECTION DRIVES (donate.html)
   ════════════════════════════════════ */
function renderClothDrives(){
  const el = document.getElementById('cdGrid');
  if(!el) return;
  const active = DB.clothDrives.filter(d=>d.status==='active');
  if(!active.length){ el.innerHTML='<div class="noevent">No active clothes collection drives right now. Check back soon! 🌙</div>'; return; }
  el.innerHTML = active.map(d=>`
    <div class="ecard">
      <div class="ebar" style="background:linear-gradient(to right,${d.season==='winter'?'#4a1880,#1e0a38':'var(--gold),var(--rose)'})"></div>
      <div class="ebody">
        <span class="edate">${d.season==='winter'?'❄️ Winter Drive':'☀️ Summer Drive'}</span>
        <div class="etitle">${d.title}</div>
        <p class="edesc">${d.desc}</p>
        <div class="emeta"><span>📍 ${d.dropoff||'TBA'}</span><span>⏳ Until ${fmtDate(d.deadline)}</span></div>
        <button class="breg" onclick="openPledge('${d.id}','${d.title.replace(/'/g,"\\'").replace(/"/g,'&quot;')}')">🧥 Pledge to Donate Clothes</button>
      </div>
    </div>`).join('');
}

/* ════════════════════════════════════
   RENDER: DONATE PAGE STATS
   ════════════════════════════════════ */
function renderDonateStats(){
  const el = document.getElementById('donStatWrap');
  if(!el) return;
  const genEl = document.getElementById('genRaised');
  const campEl = document.getElementById('campRaisedTotal');
  if(genEl)  genEl.textContent  = '৳'+DB.causes.reduce((s,c)=>s+raisedFor(c.id),0).toLocaleString();
  if(campEl) campEl.textContent = '৳'+DB.campaigns.reduce((s,c)=>s+raisedFor(c.id),0).toLocaleString();
}

/* ════════════════════════════════════
   DONATION MODAL (campaign or cause)
   ════════════════════════════════════ */
let curDonKind='cause', curDonTargetId='', curDonTargetTitle='';
function openDonate(kind, targetId, targetTitle){
  curDonKind=kind; curDonTargetId=targetId; curDonTargetTitle=targetTitle;
  document.getElementById('donTitle').textContent = `Donate to: ${targetTitle}`;
  document.getElementById('donBkashNo').textContent = DB.settings.bkashNumber;
  document.getElementById('donBkashType').textContent = DB.settings.bkashType;
  document.getElementById('donF').style.display='block';
  document.getElementById('donSucc').style.display='none';
  ['dName','dPhone','dSender','dTrx','dAmt','dNote'].forEach(f=>document.getElementById(f).value='');
  document.getElementById('donMov').classList.add('open');
}
function closeDonate(){ document.getElementById('donMov').classList.remove('open'); }
function submitDonation(){
  const n=document.getElementById('dName').value.trim();
  const p=document.getElementById('dPhone').value.trim();
  const sender=document.getElementById('dSender').value.trim();
  const trx=document.getElementById('dTrx').value.trim();
  const amt=document.getElementById('dAmt').value.trim();
  if(!n||!p||!sender||!trx||!amt||Number(amt)<=0){ alert('Please fill in Name, Phone, bKash Number, Transaction ID and a valid Amount.'); return; }
  DB.donations.unshift({
    id:uid(), kind:curDonKind, targetId:curDonTargetId, targetTitle:curDonTargetTitle,
    name:n, phone:p, bkashNumber:sender, trxId:trx, amount:Number(amt),
    note:document.getElementById('dNote').value.trim(),
    status:'pending', time:new Date().toLocaleString()
  });
  saveDB();
  document.getElementById('donF').style.display='none';
  document.getElementById('donSucc').style.display='block';
}

/* ════════════════════════════════════
   CLOTHES PLEDGE MODAL
   ════════════════════════════════════ */
let curPledgeDriveId='', curPledgeDriveTitle='';
function openPledge(driveId, driveTitle){
  curPledgeDriveId=driveId; curPledgeDriveTitle=driveTitle;
  document.getElementById('pldTitle').textContent = driveTitle;
  document.getElementById('pldF').style.display='block';
  document.getElementById('pldSucc').style.display='none';
  ['plName','plPhone','plItems','plQty','plNote'].forEach(f=>document.getElementById(f).value='');
  document.getElementById('pldMov').classList.add('open');
}
function closePledge(){ document.getElementById('pldMov').classList.remove('open'); }
function submitPledge(){
  const n=document.getElementById('plName').value.trim();
  const p=document.getElementById('plPhone').value.trim();
  const items=document.getElementById('plItems').value.trim();
  if(!n||!p||!items){ alert('Please fill in Name, Phone, and what items you would like to donate.'); return; }
  DB.clothPledges.unshift({
    id:uid(), driveId:curPledgeDriveId, driveTitle:curPledgeDriveTitle,
    name:n, phone:p, items:items, qty:document.getElementById('plQty').value.trim(),
    note:document.getElementById('plNote').value.trim(),
    status:'pending', time:new Date().toLocaleString()
  });
  saveDB();
  document.getElementById('pldF').style.display='none';
  document.getElementById('pldSucc').style.display='block';
}

/* ════════════════════════════════════
   EVENT REGISTRATION (events.html)
   ════════════════════════════════════ */
let curEvId='', curEvName='';
function openReg(id,name){
  curEvId=id; curEvName=name;
  document.getElementById('regEvName').textContent=name;
  document.getElementById('regF').style.display='block';
  document.getElementById('regSucc').style.display='none';
  ['rN','rS','rB'].forEach(f=>document.getElementById(f).value='');
  document.getElementById('rD').value='';
  document.getElementById('regMov').classList.add('open');
}
function closeReg(){ document.getElementById('regMov').classList.remove('open'); }

function submitReg(){
  const n=document.getElementById('rN').value.trim();
  const s=document.getElementById('rS').value.trim();
  if(!n||!s){ alert('Please fill in Name and Student ID.'); return; }
  DB.regs.unshift({name:n,sid:s,dept:document.getElementById('rD').value,batch:document.getElementById('rB').value.trim(),eventId:curEvId,event:curEvName,time:new Date().toLocaleString()});
  saveDB();
  document.getElementById('regF').style.display='none';
  document.getElementById('regSucc').style.display='block';
}

/* ════════════════════════════════════
   JOIN / MEMBERSHIP (join.html)
   ════════════════════════════════════ */
function submitJoin(){
  const n=document.getElementById('jN').value.trim();
  const s=document.getElementById('jS').value.trim();
  if(!n||!s){ alert('Please fill in Name and Student ID.'); return; }
  const mid = genMID();
  DB.members.unshift({
    mid, name:n, sid:s,
    dept:document.getElementById('jD').value,
    batch:document.getElementById('jBa').value.trim(),
    why:document.getElementById('jW').value.trim(),
    status:'pending',
    time:new Date().toLocaleString()
  });
  saveDB();
  document.getElementById('jFormArea').style.display='none';
  document.getElementById('jSucc').style.display='block';
  document.getElementById('jMidShow').textContent=mid;
  document.getElementById('jNameShow').textContent=n;
}

/* ════════════════════════════════════
   INIT — runs on every page load
   ════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', ()=>{
  initNav();
  renderEvents();
  renderNotices();
  renderResources();
  renderCampaigns();
  renderCauses();
  renderClothDrives();
  renderDonateStats();

  const regMov = document.getElementById('regMov');
  if(regMov){ regMov.onclick = e=>{ if(e.target===e.currentTarget) closeReg(); }; }
  const donMov = document.getElementById('donMov');
  if(donMov){ donMov.onclick = e=>{ if(e.target===e.currentTarget) closeDonate(); }; }
  const pldMov = document.getElementById('pldMov');
  if(pldMov){ pldMov.onclick = e=>{ if(e.target===e.currentTarget) closePledge(); }; }
});
