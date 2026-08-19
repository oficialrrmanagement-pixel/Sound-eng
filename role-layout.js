(()=>{
const q=id=>document.getElementById(id);
const hide=el=>el&&el.classList.add('hidden');
const show=el=>el&&el.classList.remove('hidden');
function navButton(page,filter){return [...document.querySelectorAll('#nav button')].find(b=>b.dataset.page===page&&(filter?b.dataset.agendaFilter===filter:!b.dataset.agendaFilter));}
function hideAdminOnly(){
 hide(q('team')); hide(navButton('team')); hide(q('newMember')); hide(q('inviteDialog')); hide(q('inviteLinkDialog')); hide(q('memberDialog'));
 document.querySelectorAll('[data-team-action],[data-member],[data-admin-only]').forEach(hide);
}
function applyPartner(){
 hideAdminOnly();
 show(navButton('dashboard'));show(navButton('agenda'));show(navButton('agenda','FOH'));show(navButton('agenda','ROH'));show(navButton('agenda','SUB'));show(navButton('closed'));show(navButton('artists'));
 show(q('newConcert'));show(q('newArtist'));
 const teamTitle=document.querySelector('#dashboard h3:last-of-type');
 if(teamTitle&&/Equipa/i.test(teamTitle.textContent||''))hide(teamTitle);
 hide(q('dueByPerson'));
 document.querySelectorAll('#memberDialog,#inviteDialog,#inviteLinkDialog').forEach(hide);
}
async function loadSubDirectory(){
 const host=q('artistList');if(!host)return;
 const [dir,con]=await Promise.all([
  sb.from('artist_directory').select('id,name').order('name'),
  sb.from('concerts').select('artist_id,starts_at,ends_at,status,substitute_technician_id,technician_id')
 ]);
 const rows=dir.data||[], mine=con.data||[];
 const now=Date.now();
 const allowed=new Set(mine.filter(c=>c.status!=='cancelled'&&new Date(c.ends_at||new Date(new Date(c.starts_at).getTime()+12*3600000)).getTime()>=now).map(c=>String(c.artist_id)));
 host.innerHTML=rows.map(a=>`<article class="item"><div><strong>${esc(a.name)}</strong><small>${allowed.has(String(a.id))?'Ficheiros disponíveis para a tua data':'Acesso restrito'}</small></div><div class="file-actions">${allowed.has(String(a.id))?`<button type="button" class="secondary tiny" data-sub-files="${a.id}" data-sub-name="${esc(a.name)}">Ficheiros</button>`:'<span class="muted">🔒</span>'}</div></article>`).join('')||'<div class="empty">Sem artistas.</div>';
 document.querySelectorAll('[data-sub-files]').forEach(b=>b.onclick=async()=>{
   currentArtist={id:b.dataset.subFiles,name:b.dataset.subName};
   q('artistFilesTitle').textContent='Ficheiros · '+b.dataset.subName;
   q('artistFilesDialog').showModal();
   await loadArtistFiles();
   lockSubFileDialog();
 });
}
function lockSubFileDialog(){
 const d=q('artistFilesDialog');if(!d)return;
 d.querySelectorAll('.file-input,#artistFileCategory,#uploadProgress,[data-deletefile]').forEach(el=>{const t=el.closest('label')||el;hide(t)});
 const n=d.querySelector('.notice');if(n)n.textContent='Acesso apenas aos ficheiros necessários para as tuas datas atribuídas.';
}
function applySubstitute(){
 hideAdminOnly();
 hide(navButton('dashboard'));hide(navButton('closed'));hide(navButton('team'));hide(navButton('agenda','SUB'));
 show(navButton('agenda'));show(navButton('agenda','FOH'));show(navButton('agenda','ROH'));show(navButton('artists'));
 hide(q('newConcert'));hide(q('newArtist'));hide(q('newMember'));hide(q('dashboard'));hide(q('closed'));hide(q('team'));
 document.querySelectorAll('.money,#dueByPerson,.stats,[data-finance-split],#concertDialog,#artistDialog').forEach(hide);
 const title=document.querySelector('#artists .title-row h2');if(title)title.textContent='Ficheiros dos artistas';
 const artistNav=navButton('artists');if(artistNav)artistNav.textContent='Ficheiros';
 loadSubDirectory();lockSubFileDialog();
}
function applyRoleLayout(){
 if(!window.me)return false;
 document.body.dataset.teamDuckRole=me.role||'';
 if(me.role==='admin')return true;
 if(me.role==='partner')applyPartner();
 if(me.role==='substitute')applySubstitute();
 return true;
}
function patchLoadAll(){
 if(window.__roleLayoutPatched||typeof window.loadAll!=='function')return;
 const original=window.loadAll;
 window.loadAll=async function(...args){const out=await original.apply(this,args);setTimeout(applyRoleLayout,0);setTimeout(applyRoleLayout,300);return out};
 window.__roleLayoutPatched=true;
}
addEventListener('load',()=>{patchLoadAll();let n=0;const t=setInterval(()=>{n++;patchLoadAll();if(applyRoleLayout()||n>24)clearInterval(t)},250);q('artistFilesDialog')?.addEventListener('toggle',()=>{if(me?.role==='substitute')lockSubFileDialog()})});
window.TeamDuckRoleLayout={apply:applyRoleLayout};
})();