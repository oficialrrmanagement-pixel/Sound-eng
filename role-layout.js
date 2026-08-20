(()=>{
const q=id=>document.getElementById(id);
const hide=el=>el&&el.classList.add('hidden');
const show=el=>el&&el.classList.remove('hidden');
const PREVIEW_KEY='team-duck-role-preview';
function actualRole(){try{return typeof me!=='undefined'&&me?me.role:null}catch(_){return null}}
function currentUserId(){try{return typeof me!=='undefined'&&me?String(me.id||''):''}catch(_){return ''}}
function previewRole(){if(actualRole()!=='admin')return null;const v=sessionStorage.getItem(PREVIEW_KEY);return ['partner','substitute'].includes(v)?v:null}
function effectiveRole(){return previewRole()||actualRole()}
function isPreview(){return actualRole()==='admin'&&!!previewRole()}
function navButton(page,filter){return [...document.querySelectorAll('#nav button')].find(b=>b.dataset.page===page&&(filter?b.dataset.agendaFilter===filter:!b.dataset.agendaFilter));}
function hideAdminOnly(){hide(q('team'));hide(navButton('team'));hide(q('newMember'));hide(q('inviteDialog'));hide(q('inviteLinkDialog'));hide(q('memberDialog'));document.querySelectorAll('[data-team-action],[data-member],[data-admin-only]').forEach(hide)}
function addPreviewControl(){
 const wrap=q('rolePreviewControl');
 if(actualRole()!=='admin'){hide(wrap);return}
 if(!wrap)return;
 show(wrap);
 const sel=q('rolePreviewSelect');if(!sel)return;
 sel.value=previewRole()||'admin';
 if(!sel.dataset.wired){sel.dataset.wired='1';sel.onchange=()=>{const v=sel.value;if(v==='admin')sessionStorage.removeItem(PREVIEW_KEY);else sessionStorage.setItem(PREVIEW_KEY,v);location.reload()}}
 q('rolePreviewNotice')?.remove();
 if(isPreview()){
   const tag=document.createElement('div');tag.id='rolePreviewNotice';tag.textContent=`Pré-visualização: ${previewRole()==='partner'?'Parceiro':'Substituto'} · permissões reais continuam de Administrador`;
   tag.style.cssText='position:sticky;top:0;z-index:50;background:#183321;color:#dff8df;border-bottom:1px solid #3f7b4e;padding:7px 12px;text-align:center;font-size:12px;font-weight:800';
   q('app')?.prepend(tag)
 }
}
function filterCardsForPartner(){if(isPreview())return;const uid=currentUserId();if(!uid)return;[...document.querySelectorAll('#concerts > .item')].forEach((card,i)=>{const c=(concerts||[])[i];const mine=!!c&&String(c.principal_technician_id||c.technician_id||c.owner_id||'')===uid;card.style.display=mine?'':'none'});[...document.querySelectorAll('#artistList > .item')].forEach((card,i)=>{const a=(artists||[])[i];if(a?.principal_technician_id&&String(a.principal_technician_id)!==uid)card.style.display='none'})}
function filterCardsForSubstitute(){if(isPreview())return;const uid=currentUserId();if(!uid)return;[...document.querySelectorAll('#concerts > .item')].forEach((card,i)=>{const c=(concerts||[])[i];const mine=!!c&&String(c.substitute_technician_id||'')===uid;card.style.display=mine?'':'none'})}
function applyPartner(){hideAdminOnly();show(navButton('dashboard'));show(navButton('agenda'));show(navButton('agenda','FOH'));show(navButton('agenda','ROH'));show(navButton('agenda','SUB'));show(navButton('closed'));show(navButton('artists'));show(q('newConcert'));show(q('newArtist'));const teamTitle=document.querySelector('#dashboard h3:last-of-type');if(teamTitle&&/Equipa/i.test(teamTitle.textContent||''))hide(teamTitle);hide(q('dueByPerson'));document.querySelectorAll('#memberDialog,#inviteDialog,#inviteLinkDialog').forEach(hide);filterCardsForPartner()}
async function loadSubDirectory(){const host=q('artistList');if(!host)return;const [dir,con]=await Promise.all([sb.from('artist_directory').select('id,name').order('name'),sb.from('concerts').select('artist_id,starts_at,ends_at,status,substitute_technician_id,technician_id')]);const rows=dir.data||[],all=con.data||[],now=Date.now(),uid=currentUserId();const mine=isPreview()?all:all.filter(c=>String(c.substitute_technician_id||'')===uid);const allowed=new Set(mine.filter(c=>c.status!=='cancelled'&&new Date(c.ends_at||new Date(new Date(c.starts_at).getTime()+12*3600000)).getTime()>=now).map(c=>String(c.artist_id)));host.innerHTML=rows.map(a=>`<article class="item"><div><strong>${esc(a.name)}</strong><small>${allowed.has(String(a.id))?'Ficheiros disponíveis para a tua data':'Acesso restrito'}</small></div><div class="file-actions">${allowed.has(String(a.id))?`<button type="button" class="secondary tiny" data-sub-files="${a.id}" data-sub-name="${esc(a.name)}">Ficheiros</button>`:'<span class="muted">🔒</span>'}</div></article>`).join('')||'<div class="empty">Sem artistas.</div>';document.querySelectorAll('[data-sub-files]').forEach(b=>b.onclick=async()=>{currentArtist={id:b.dataset.subFiles,name:b.dataset.subName};q('artistFilesTitle').textContent='Ficheiros · '+b.dataset.subName;q('artistFilesDialog').showModal();await loadArtistFiles();lockSubFileDialog()})}
function lockSubFileDialog(){const d=q('artistFilesDialog');if(!d)return;d.querySelectorAll('.file-input,#artistFileCategory,#uploadProgress,[data-deletefile]').forEach(el=>hide(el.closest('label')||el));const n=d.querySelector('.notice');if(n)n.textContent='Acesso apenas aos ficheiros necessários para as tuas datas atribuídas.'}
function applySubstitute(){hideAdminOnly();hide(navButton('dashboard'));hide(navButton('closed'));hide(navButton('team'));hide(navButton('agenda','FOH'));hide(navButton('agenda','ROH'));hide(navButton('agenda','SUB'));show(navButton('agenda'));show(navButton('artists'));hide(q('newConcert'));hide(q('newArtist'));hide(q('newMember'));hide(q('dashboard'));hide(q('closed'));hide(q('team'));document.querySelectorAll('.money,#dueByPerson,.stats,[data-finance-split],#concertDialog,#artistDialog').forEach(hide);const title=document.querySelector('#artists .title-row h2');if(title)title.textContent='Ficheiros dos artistas';const artistNav=navButton('artists');if(artistNav)artistNav.textContent='Ficheiros';filterCardsForSubstitute();loadSubDirectory();lockSubFileDialog()}
function applyRoleLayout(){const role=effectiveRole();addPreviewControl();if(!role)return false;document.body.dataset.teamDuckRole=role;document.body.dataset.actualRole=actualRole()||'';if(role==='partner')applyPartner();else if(role==='substitute')applySubstitute();return true}
function patchLoadAll(){if(window.__roleLayoutPatched||typeof loadAll!=='function')return;const original=loadAll;window.loadAll=async function(...args){const out=await original.apply(this,args);setTimeout(applyRoleLayout,0);setTimeout(applyRoleLayout,250);return out};window.__roleLayoutPatched=true}
function init(){patchLoadAll();let n=0;const tick=()=>{n++;patchLoadAll();const done=applyRoleLayout();if(!done&&n<40)setTimeout(tick,200)};tick();q('artistFilesDialog')?.addEventListener('toggle',()=>{if(effectiveRole()==='substitute')lockSubFileDialog()})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.TeamDuckRoleLayout={apply:applyRoleLayout,effectiveRole,clearPreview:()=>{sessionStorage.removeItem(PREVIEW_KEY);location.reload()}};
})();