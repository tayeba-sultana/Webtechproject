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
  document.getElementById('aLog').style.display='flex';
  // document.getElementById('aLog').style.display='block';
  document.getElementById('aLog').style.display='flex';
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
  const {members,regs,events,notices,resources,admins,campaigns,causes,donations,clothDrives,clothPledges,settings} = DB;
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

  // donations / cloth stats
  const verifiedTotal = donations.filter(d=>d.status==='verified').reduce((s,d)=>s+Number(d.amount||0),0);
  const pendingDon = donations.filter(d=>d.status==='pending').length;
  const dDon=document.getElementById('dDon'); if(dDon) dDon.textContent='৳'+verifiedTotal.toLocaleString();
  const dPend=document.getElementById('dPend'); if(dPend) dPend.textContent=pendingDon;
  const dPledge=document.getElementById('dPledge'); if(dPledge) dPledge.textContent=clothPledges.length;
  const bdgD=document.getElementById('bdgD'); if(bdgD) bdgD.textContent=pendingDon;
  const bdgP=document.getElementById('bdgP'); if(bdgP) bdgP.textContent=clothPledges.filter(p=>p.status==='pending').length;

  // bKash settings fields
  const bkNo=document.getElementById('bkNo'); if(bkNo) bkNo.value=settings.bkashNumber;
  const bkTy=document.getElementById('bkTy'); if(bkTy) bkTy.value=settings.bkashType;

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

  // campaigns admin table
  const cptb=document.getElementById('cpAdTb'), cpe=document.getElementById('cpAdEmp');
  if(cptb){
    if(!campaigns.length){ cptb.innerHTML=''; cpe.style.display='block'; }
    else{
      cpe.style.display='none';
      cptb.innerHTML=campaigns.map(c=>{
        const raised = raisedFor(c.id);
        return `<tr>
          <td><strong>${c.title}</strong></td>
          <td><span class="pill pb">${c.type==='event'?'Event':'Activity'}</span></td>
          <td>৳${c.goal.toLocaleString()}</td>
          <td>৳${raised.toLocaleString()}</td>
          <td><span class="pill ${c.status==='active'?'pg':'pr'}">${c.status}</span> <button class="bsm ba" style="padding:.2rem .5rem;font-size:.7rem;margin-left:.3rem" onclick="toggleCampaignStatus('${c.id}')">Toggle</button></td>
          <td><button class="bdel" onclick="delCampaign('${c.id}')">✕</button></td>
        </tr>`;
      }).join('');
    }
  }

  // donations table
  const dtb=document.getElementById('donTb'), de=document.getElementById('donEmp');
  if(dtb){
    if(!donations.length){ dtb.innerHTML=''; de.style.display='block'; }
    else{
      de.style.display='none';
      dtb.innerHTML=donations.map((d,i)=>`<tr>
        <td style="color:var(--soft);font-size:.76rem">${i+1}</td>
        <td style="font-size:.82rem">${d.targetTitle}</td>
        <td><strong>${d.name}</strong></td>
        <td style="font-size:.82rem">${d.phone}</td>
        <td><span class="pill pb">${d.bkashNumber}</span></td>
        <td style="font-size:.8rem">${d.trxId}</td>
        <td><strong>৳${Number(d.amount).toLocaleString()}</strong></td>
        <td>
          <span class="pill ${d.status==='verified'?'pg':d.status==='rejected'?'pr':'po'}">${d.status}</span><br>
          <button class="bapp" onclick="setDonStatus('${d.id}','verified')" style="margin-top:3px">✓ Verify</button>
          <button class="brej" onclick="setDonStatus('${d.id}','rejected')">✗ Reject</button>
        </td>
        <td style="font-size:.74rem;color:#a080c0;white-space:nowrap">${d.time}</td>
        <td><button class="bdel" onclick="delDon('${d.id}')">✕</button></td>
      </tr>`).join('');
    }
  }

  // donation causes admin table
  const catb=document.getElementById('caAdTb'), cae=document.getElementById('caAdEmp');
  if(catb){
    if(!causes.length){ catb.innerHTML=''; cae.style.display='block'; }
    else{
      cae.style.display='none';
      catb.innerHTML=causes.map(c=>{
        const raised = raisedFor(c.id);
        return `<tr>
          <td><strong>${c.icon||''} ${c.title}</strong></td>
          <td>৳${c.goal.toLocaleString()}</td>
          <td>৳${raised.toLocaleString()}</td>
          <td><span class="pill ${c.status==='active'?'pg':'pr'}">${c.status}</span> <button class="bsm ba" style="padding:.2rem .5rem;font-size:.7rem;margin-left:.3rem" onclick="toggleCauseStatus('${c.id}')">Toggle</button></td>
          <td><button class="bdel" onclick="delCause('${c.id}')">✕</button></td>
        </tr>`;
      }).join('');
    }
  }

  // clothes drives admin table
  const cdtb=document.getElementById('cdAdTb'), cde=document.getElementById('cdAdEmp');
  if(cdtb){
    if(!clothDrives.length){ cdtb.innerHTML=''; cde.style.display='block'; }
    else{
      cde.style.display='none';
      cdtb.innerHTML=clothDrives.map(d=>`<tr>
        <td><strong>${d.title}</strong></td>
        <td><span class="pill pb">${d.season==='winter'?'❄️ Winter':'☀️ Summer'}</span></td>
        <td style="font-size:.82rem">${d.dropoff||'—'}</td>
        <td style="font-size:.82rem">${fmtDate(d.deadline)}</td>
        <td><span class="pill ${d.status==='active'?'pg':'pr'}">${d.status}</span> <button class="bsm ba" style="padding:.2rem .5rem;font-size:.7rem;margin-left:.3rem" onclick="toggleDriveStatus('${d.id}')">Toggle</button></td>
        <td><button class="bdel" onclick="delDrive('${d.id}')">✕</button></td>
      </tr>`).join('');
    }
  }

  // clothes pledges table
  const pltb=document.getElementById('plTb'), ple=document.getElementById('plEmp');
  if(pltb){
    if(!clothPledges.length){ pltb.innerHTML=''; ple.style.display='block'; }
    else{
      ple.style.display='none';
      pltb.innerHTML=clothPledges.map((p,i)=>`<tr>
        <td style="color:var(--soft);font-size:.76rem">${i+1}</td>
        <td style="font-size:.82rem">${p.driveTitle}</td>
        <td><strong>${p.name}</strong></td>
        <td style="font-size:.82rem">${p.phone}</td>
        <td style="max-width:140px;font-size:.8rem;color:var(--soft)">${p.items}</td>
        <td style="font-size:.82rem">${p.qty||'—'}</td>
        <td>
          <span class="pill ${p.status==='collected'?'pg':'po'}">${p.status}</span><br>
          <button class="bapp" onclick="setPledgeStatus('${p.id}','collected')" style="margin-top:3px">✓ Collected</button>
        </td>
        <td style="font-size:.74rem;color:#a080c0;white-space:nowrap">${p.time}</td>
        <td><button class="bdel" onclick="delPledge('${p.id}')">✕</button></td>
      </tr>`).join('');
    }
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

/* ── FUNDRAISING: CAMPAIGNS ── */
function addCampaign(){
  const t=document.getElementById('cpT').value.trim();
  const g=Number(document.getElementById('cpG').value);
  if(!t||!g||g<=0){ alert('Title and a valid Goal Amount are required.'); return; }
  DB.campaigns.push({id:uid(), type:document.getElementById('cpTy').value, title:t, desc:document.getElementById('cpDs').value.trim(), goal:g, status:'active', createdAt:todayStr()});
  saveDB();
  ['cpT','cpDs','cpG'].forEach(f=>document.getElementById(f).value='');
  document.getElementById('cpTy').value='activity';
  refreshAdmin();
  alert('✦ Fundraising campaign launched!');
}
function toggleCampaignStatus(id){ const c=DB.campaigns.find(c=>c.id===id); if(!c) return; c.status = c.status==='active'?'closed':'active'; saveDB(); refreshAdmin(); }
function delCampaign(id){ if(!confirm('Delete this campaign? (Any donation records will remain.)')) return; DB.campaigns=DB.campaigns.filter(c=>c.id!==id); saveDB(); refreshAdmin(); }

/* ── DONATION CAUSES (Flood / Palestine / Orphanage etc.) ── */
function addCause(){
  const t=document.getElementById('caT').value.trim();
  const g=Number(document.getElementById('caG').value);
  if(!t||!g||g<=0){ alert('Title and a valid Goal Amount are required.'); return; }
  DB.causes.push({id:uid(), icon:document.getElementById('caIc').value.trim()||'🤲', title:t, desc:document.getElementById('caDs').value.trim(), goal:g, status:'active', createdAt:todayStr()});
  saveDB();
  ['caT','caIc','caDs','caG'].forEach(f=>document.getElementById(f).value='');
  refreshAdmin();
  alert('✦ Donation cause added!');
}
function toggleCauseStatus(id){ const c=DB.causes.find(c=>c.id===id); if(!c) return; c.status = c.status==='active'?'closed':'active'; saveDB(); refreshAdmin(); }
function delCause(id){ if(!confirm('Delete this donation cause? (Any donation records will remain.)')) return; DB.causes=DB.causes.filter(c=>c.id!==id); saveDB(); refreshAdmin(); }

/* ── FUNDRAISING: DONATIONS ── */
function setDonStatus(id,st){ const d=DB.donations.find(d=>d.id===id); if(!d) return; d.status=st; saveDB(); refreshAdmin(); }
function delDon(id){ if(!confirm('Delete this donation record?')) return; DB.donations=DB.donations.filter(d=>d.id!==id); saveDB(); refreshAdmin(); }

/* ── CLOTHES COLLECTION: DRIVES ── */
function addClothDrive(){
  const t=document.getElementById('cdT').value.trim();
  if(!t){ alert('Drive title is required.'); return; }
  DB.clothDrives.push({id:uid(), season:document.getElementById('cdSe').value, title:t, desc:document.getElementById('cdDs').value.trim(), dropoff:document.getElementById('cdLo').value.trim(), deadline:document.getElementById('cdDl').value, status:'active'});
  saveDB();
  ['cdT','cdDs','cdLo','cdDl'].forEach(f=>document.getElementById(f).value='');
  document.getElementById('cdSe').value='winter';
  refreshAdmin();
  alert('✦ Clothes collection drive started!');
}
function toggleDriveStatus(id){ const d=DB.clothDrives.find(d=>d.id===id); if(!d) return; d.status = d.status==='active'?'closed':'active'; saveDB(); refreshAdmin(); }
function delDrive(id){ if(!confirm('Delete this drive?')) return; DB.clothDrives=DB.clothDrives.filter(d=>d.id!==id); saveDB(); refreshAdmin(); }

/* ── CLOTHES COLLECTION: PLEDGES ── */
function setPledgeStatus(id,st){ const p=DB.clothPledges.find(p=>p.id===id); if(!p) return; p.status=st; saveDB(); refreshAdmin(); }
function delPledge(id){ if(!confirm('Delete this pledge?')) return; DB.clothPledges=DB.clothPledges.filter(p=>p.id!==id); saveDB(); refreshAdmin(); }

/* ── PAYMENT SETTINGS ── */
function saveBkash(){
  const no=document.getElementById('bkNo').value.trim();
  if(!no){ alert('bKash number is required.'); return; }
  DB.settings.bkashNumber = no;
  DB.settings.bkashType = document.getElementById('bkTy').value;
  saveDB();
  refreshAdmin();
  alert('✦ Payment settings saved! This bKash number is now shown on the Donate page.');
}

/* ── EXPORT CSV ── */
function expCSV(type){
  let data, h, rows;
  if(type==='members'){
    data=DB.members; h=['Member ID','Name','Student ID','Dept','Batch','Why Join','Status','Time'];
    rows=data.map(d=>[d.mid,d.name,d.sid,d.dept||'',d.batch||'',d.why||'',d.status,d.time]);
  } else if(type==='regs'){
    data=DB.regs; h=['Name','Student ID','Dept','Batch','Event','Time'];
    rows=data.map(d=>[d.name,d.sid,d.dept||'',d.batch||'',d.event,d.time]);
  } else if(type==='donations'){
    data=DB.donations; h=['For','Donor Name','Phone','bKash Number','Trx ID','Amount','Status','Time'];
    rows=data.map(d=>[d.targetTitle,d.name,d.phone,d.bkashNumber,d.trxId,d.amount,d.status,d.time]);
  } else if(type==='pledges'){
    data=DB.clothPledges; h=['Drive','Name','Phone','Items','Qty','Status','Time'];
    rows=data.map(d=>[d.driveTitle,d.name,d.phone,d.items,d.qty||'',d.status,d.time]);
  } else return;
  if(!data.length){ alert('No data to export.'); return; }
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
