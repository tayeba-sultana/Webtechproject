/* ════════════════════════════════════
   SEC MUSLIMAH COMMUNITY — ADMIN PANEL LOGIC
   Requires js/app.js to be loaded first (DB, helpers).
   ════════════════════════════════════ */

const ADMIN_SESSION_KEY = 'secMuslimahAdminSession';
let currentAdmin = null; // {id, username, name}

function findAdmin(username, password){
  const u = (username||'').trim().toLowerCase();
  return DB.admins.find(a => a.username.toLowerCase()===u && a.password===password) || null;
}
function findAdminByUsername(username){
  const u = (username||'').trim().toLowerCase();
  return DB.admins.find(a => a.username.toLowerCase()===u) || null;
}

function showLogin(){
  currentAdmin = null;
  document.getElementById('aLog').style.display='block';
  document.getElementById('aPanel').style.display='none';
  document.getElementById('aUser').value='';
  document.getElementById('aPass').value='';
  document.getElementById('lerr').style.display='none';
}
function showPanel(){
  document.getElementById('aLog').style.display='none';
  document.getElementById('aPanel').style.display='flex';
  document.getElementById('aPanel').style.flexDirection='column';
  const who = document.getElementById('whoAmI');
  if(who) who.textContent = currentAdmin ? `Logged in as ${currentAdmin.name} (@${currentAdmin.username})` : '';
  refreshAdmin();
}
function chkPass(){
  const u = document.getElementById('aUser').value;
  const p = document.getElementById('aPass').value;
  const match = findAdmin(u,p);
  if(match){
    currentAdmin = {id:match.id, username:match.username, name:match.name};
    try{ sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(currentAdmin)); }catch(e){}
    showPanel();
  } else {
    document.getElementById('lerr').style.display='block';
    document.getElementById('aPass').value='';
  }
}
function aLogout(){
  try{ sessionStorage.removeItem(ADMIN_SESSION_KEY); }catch(e){}
  showLogin();
}
function aTab(t,btn){
  document.querySelectorAll('.asec').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.atab').forEach(b=>b.classList.remove('active'));
  document.getElementById('as-'+t).classList.add('active'); btn.classList.add('active');
}

/* ── REFRESH ADMIN ── */
function refreshAdmin(){
  const {members,regs,events,notices,resources,admins} = DB;
  document.getElementById('dM').textContent  = members.length;
  document.getElementById('dR').textContent  = regs.length;
  document.getElementById('dE').textContent  = events.length;
  document.getElementById('dN').textContent  = notices.length;
  document.getElementById('dRes').textContent= resources.length;
  document.getElementById('dAdm').textContent= admins.length;
  document.getElementById('bdgM').textContent= members.length;
  document.getElementById('bdgR').textContent= regs.length;
  const bdgA = document.getElementById('bdgA');
  if(bdgA) bdgA.textContent = admins.length;

  const all=[...members.map(m=>({...m,_t:'member'})),...regs.map(r=>({...r,_t:'reg'}))].slice(0,6);
  document.getElementById('actLog').innerHTML = all.length
    ? all.map(a=>`<div style="padding:.5rem 0;border-bottom:1px solid #f0e8ff;display:flex;gap:.8rem;align-items:center;flex-wrap:wrap;">
        <span class="pill ${a._t==='member'?'pg':'pb'}">${a._t==='member'?'Member':'Event Reg'}</span>
        <strong>${a.name}</strong>
        ${a._t==='member'?`<span class="midb">${a.mid}</span>`:`<span style="color:var(--soft);font-size:.82rem">→ ${a.event}</span>`}
        <span style="margin-left:auto;font-size:.74rem;color:#a080c0">${a.time}</span>
      </div>`).join('')
    : '<span style="color:var(--soft);font-style:italic">No activity yet.</span>';

  // members table
  const mtb=document.getElementById('memTb'), me=document.getElementById('memEmp');
  if(!members.length){ mtb.innerHTML=''; me.style.display='block'; }
  else {
    me.style.display='none';
    mtb.innerHTML=members.map((m,i)=>`<tr>
      <td style="color:var(--soft);font-size:.76rem">${i+1}</td>
      <td><span class="midb">${m.mid}</span></td>
      <td><strong>${m.name}</strong></td>
      <td><span class="pill pb">${m.sid}</span></td>
      <td style="font-size:.82rem">${m.dept||'—'}</td>
      <td style="font-size:.82rem">${m.batch||'—'}</td>
      <td style="max-width:110px;font-style:italic;font-size:.8rem;color:var(--soft)">${m.why||'—'}</td>
      <td>
        <span class="pill ${m.status==='approved'?'pg':m.status==='rejected'?'pr':'po'}">${m.status}</span><br>
        <button class="bapp" onclick="setStatus(${i},'approved')" style="margin-top:3px">✓ Approve</button>
        <button class="brej" onclick="setStatus(${i},'rejected')">✗ Reject</button>
      </td>
      <td style="font-size:.74rem;color:#a080c0;white-space:nowrap">${m.time}</td>
      <td><button class="bdel" onclick="delM(${i})">✕</button></td>
    </tr>`).join('');
  }

  // regs table
  const rtb=document.getElementById('regTb'), re=document.getElementById('regEmp');
  if(!regs.length){ rtb.innerHTML=''; re.style.display='block'; }
  else {
    re.style.display='none';
    rtb.innerHTML=regs.map((r,i)=>`<tr>
      <td style="color:var(--soft);font-size:.76rem">${i+1}</td>
      <td><strong>${r.name}</strong></td>
      <td><span class="pill pb">${r.sid}</span></td>
      <td style="font-size:.82rem">${r.dept||'—'}</td>
      <td style="font-size:.82rem">${r.batch||'—'}</td>
      <td style="font-size:.82rem">${r.event}</td>
      <td style="font-size:.74rem;color:#a080c0;white-space:nowrap">${r.time}</td>
      <td><button class="bdel" onclick="delR(${i})">✕</button></td>
    </tr>`).join('');
  }

  // events admin table
  const etb=document.getElementById('evAdTb'), ee=document.getElementById('evAdEmp');
  if(!events.length){ etb.innerHTML=''; ee.style.display='block'; }
  else {
    ee.style.display='none';
    etb.innerHTML=events.map((e)=>`<tr>
      <td><strong>${e.title}</strong></td>
      <td>${fmtDate(e.date)}</td>
      <td>${e.time}</td>
      <td>${e.location}</td>
      <td><span class="pill ${e.status==='full'?'pr':'pg'}">${e.status==='full'?'Full':'Open'}</span></td>
      <td><button class="bdel" onclick="delEv('${e.id}')">✕</button></td>
    </tr>`).join('');
  }

  // notices admin table
  const ntb=document.getElementById('noAdTb'), ne=document.getElementById('noAdEmp');
  if(!notices.length){ ntb.innerHTML=''; ne.style.display='block'; }
  else {
    ne.style.display='none';
    ntb.innerHTML=notices.map((n)=>`<tr>
      <td><strong>${n.title}</strong></td>
      <td><span class="pill ${n.type==='urgent'?'pr':n.type==='info'?'pb':'po'}">${n.type}</span></td>
      <td style="max-width:180px;font-size:.82rem;color:var(--soft)">${n.text.substring(0,70)}…</td>
      <td style="font-size:.78rem;color:#a080c0;white-space:nowrap">${n.date}</td>
      <td><button class="bdel" onclick="delNo('${n.id}')">✕</button></td>
    </tr>`).join('');
  }

  // resources admin table
  const rstb=document.getElementById('rsAdTb'), rse=document.getElementById('rsAdEmp');
  if(!resources.length){ rstb.innerHTML=''; rse.style.display='block'; }
  else {
    rse.style.display='none';
    rstb.innerHTML=resources.map((r)=>`<tr>
      <td><span class="pill pb">${r.type}</span></td>
      <td>${r.src}</td>
      <td style="max-width:180px;font-size:.82rem;color:var(--soft)">${(r.arabic||r.trans).substring(0,60)}…</td>
      <td><button class="bdel" onclick="delRs('${r.id}')">✕</button></td>
    </tr>`).join('');
  }

  // admins table
  const atb=document.getElementById('admAdTb'), ae=document.getElementById('admAdEmp');
  if(!admins.length){ atb.innerHTML=''; ae.style.display='block'; }
  else {
    ae.style.display='none';
    atb.innerHTML=admins.map((a)=>{
      const isSelf = currentAdmin && a.id===currentAdmin.id;
      const isLast = admins.length===1;
      const disabled = isSelf || isLast;
      const title = isSelf ? 'You cannot delete your own logged-in account' : (isLast ? 'At least one admin must remain' : 'Remove this admin');
      return `<tr>
      <td><strong>${a.name}</strong>${isSelf?' <span class="pill pg">You</span>':''}</td>
      <td><span class="pill pb">@${a.username}</span></td>
      <td style="font-size:.78rem;color:#a080c0;white-space:nowrap">${a.createdAt}</td>
      <td><button class="bdel" ${disabled?'disabled style="opacity:.35;cursor:not-allowed;"':''} title="${title}" onclick="delAdmin('${a.id}')">✕</button></td>
    </tr>`;}).join('');
  }
}

/* ── MEMBER STATUS ── */
function setStatus(i,st){ DB.members[i].status=st; saveDB(); refreshAdmin(); }
function delM(i){ if(!confirm('Delete this member?')) return; DB.members.splice(i,1); saveDB(); refreshAdmin(); }
function delR(i){ if(!confirm('Delete?')) return; DB.regs.splice(i,1); saveDB(); refreshAdmin(); }

/* ── ADD EVENT ── */
function addEvent(){
  const t=document.getElementById('evT').value.trim();
  const d=document.getElementById('evDt').value;
  if(!t||!d){ alert('Title and Date are required.'); return; }
  DB.events.push({
    id:uid(), title:t, date:d,
    time:document.getElementById('evTm').value.trim()||'TBA',
    location:document.getElementById('evLo').value.trim()||'TBA',
    desc:document.getElementById('evDs').value.trim()||'',
    seats:document.getElementById('evSe').value.trim()||'Open',
    status:document.getElementById('evSt').value
  });
  saveDB();
  ['evT','evDt','evTm','evLo','evDs','evSe'].forEach(f=>document.getElementById(f).value='');
  document.getElementById('evSt').value='open';
  refreshAdmin();
  alert('✦ Event added to website successfully!');
}
function delEv(id){ if(!confirm('Delete this event?')) return; DB.events=DB.events.filter(e=>e.id!==id); saveDB(); refreshAdmin(); }

/* ── ADD NOTICE ── */
function addNotice(){
  const t=document.getElementById('noT').value.trim();
  const x=document.getElementById('noTx').value.trim();
  if(!t||!x){ alert('Title and Content are required.'); return; }
  DB.notices.unshift({id:uid(), type:document.getElementById('noTy').value, title:t, text:x, date:todayStr()});
  saveDB();
  document.getElementById('noT').value=''; document.getElementById('noTx').value=''; document.getElementById('noTy').value='normal';
  refreshAdmin();
  alert('✦ Notice posted to website!');
}
function delNo(id){ if(!confirm('Delete?')) return; DB.notices=DB.notices.filter(n=>n.id!==id); saveDB(); refreshAdmin(); }

/* ── ADD RESOURCE ── */
function toggleArabic(){ document.getElementById('arGroup').style.display=document.getElementById('rsT').value==='article'?'none':'block'; }
function addResource(){
  const sr=document.getElementById('rsSr').value.trim();
  const tr=document.getElementById('rsTr').value.trim();
  if(!sr||!tr){ alert('Source/Title and content are required.'); return; }
  DB.resources.push({id:uid(), type:document.getElementById('rsT').value, src:sr, arabic:document.getElementById('rsAr').value.trim(), trans:tr});
  saveDB();
  ['rsSr','rsAr','rsTr'].forEach(f=>document.getElementById(f).value='');
  document.getElementById('rsT').value='ayah'; document.getElementById('arGroup').style.display='block';
  refreshAdmin();
  alert('✦ Resource added to website!');
}
function delRs(id){ if(!confirm('Delete?')) return; DB.resources=DB.resources.filter(r=>r.id!==id); saveDB(); refreshAdmin(); }

/* ── MANAGE ADMINS ── */
function addAdminUser(){
  const name = document.getElementById('adName').value.trim();
  const user = document.getElementById('adUser').value.trim();
  const pass = document.getElementById('adPass').value;
  if(!name || !user || !pass){ alert('Name, username and password are all required.'); return; }
  if(user.includes(' ')){ alert('Username cannot contain spaces.'); return; }
  if(pass.length < 6){ alert('Password should be at least 6 characters.'); return; }
  if(findAdminByUsername(user)){ alert('That username is already taken. Please choose another.'); return; }
  DB.admins.push({id:uid(), username:user, password:pass, name:name, createdAt:todayStr()});
  saveDB();
  ['adName','adUser','adPass'].forEach(f=>document.getElementById(f).value='');
  refreshAdmin();
  alert('✦ New admin account created!');
}
function delAdmin(id){
  if(currentAdmin && id===currentAdmin.id){ alert('You cannot delete your own logged-in account. Ask another admin to remove it.'); return; }
  if(DB.admins.length<=1){ alert('At least one admin account must remain.'); return; }
  const target = DB.admins.find(a=>a.id===id);
  if(!target) return;
  if(!confirm(`Remove admin "${target.name}" (@${target.username})?`)) return;
  DB.admins = DB.admins.filter(a=>a.id!==id);
  saveDB();
  refreshAdmin();
}

/* ── EXPORT CSV ── */
function expCSV(type){
  const data=type==='members'?DB.members:DB.regs;
  if(!data.length){ alert('No data to export.'); return; }
  const h=type==='members'?['Member ID','Name','Student ID','Dept','Batch','Why Join','Status','Time']:['Name','Student ID','Dept','Batch','Event','Time'];
  const rows=data.map(d=>type==='members'?[d.mid,d.name,d.sid,d.dept||'',d.batch||'',d.why||'',d.status,d.time]:[d.name,d.sid,d.dept||'',d.batch||'',d.event,d.time]);
  const csv=[h,...rows].map(r=>r.map(c=>`"${String(c||'').replace(/"/g,'""')}"`).join(',')).join('\n');
  const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download=`sec_${type}_${Date.now()}.csv`; a.click();
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', ()=>{
  document.getElementById('aUser').addEventListener('keydown', e=>{ if(e.key==='Enter') chkPass(); });
  document.getElementById('aPass').addEventListener('keydown', e=>{ if(e.key==='Enter') chkPass(); });

  let session=null;
  try{ session = JSON.parse(sessionStorage.getItem(ADMIN_SESSION_KEY)||'null'); }catch(e){}
  // Validate the session still maps to a real admin account (in case it was deleted).
  if(session && DB.admins.find(a=>a.id===session.id)){
    currentAdmin = session;
    showPanel();
  } else {
    showLogin();
  }
});
