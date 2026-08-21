(()=>{
const q=id=>document.getElementById(id);
function effectiveRole(){try{return window.TeamDuckRoleLayout?.effectiveRole?.()||me?.role||null}catch(_){return me?.role||null}}
function isSubstitute(){return effectiveRole()==='substitute'}
function isRealSubstitute(){return me?.role==='substitute'}
function currentUserId(){return isRealSubstitute()?String(me?.id||''):''}
function allowedArtistIds(){
  if(!isSubstitute()||!isRealSubstitute())return new Set();
  const uid=currentUserId(),now=Date.now();
  return new Set((concerts||[]).filter(c=>{
    if(c.status==='cancelled'||c.booking_status==='cancelled')return false;
    const assigned=[c.substitute_technician_id,c.technician_id].some(x=>String(x||'')===uid);
    if(!assigned)return false;
    const end=new Date(c.ends_at||new Date(new Date(c.starts_at).getTime()+12*3600000)).getTime();
    return end>=now;
  }).map(c=>String(c.artist_id)));
}
function renderSubstituteArtists(){
  if(!isSubstitute())return;
  const host=q('artistList');if(!host)return;
  const allowed=allowedArtistIds(),rows=(artists||[]).filter(a=>allowed.has(String(a.id)));
  host.innerHTML=rows.map(a=>`<article class="item"><div><strong>${esc(a.name)}</strong><small>Acesso aos ficheiros da tua data atribuída</small></div><div class="file-actions"><button type="button" class="secondary tiny" data-artist-files="${a.id}">Ficheiros</button></div></article>`).join('')||'<div class="empty">Sem ficheiros disponíveis. O acesso é libertado apenas quando tens uma data atribuída.</div>';
  host.querySelectorAll('[data-artist-files]').forEach(b=>b.onclick=()=>openArtistFiles(b.dataset.artistFiles));
}
function lockFilesReadOnly(){
  if(!isSubstitute())return;
  q('artistEditDialog')?.close?.();
  document.querySelectorAll('[data-artist-edit],.td-photo-btn,#newArtist').forEach(el=>el.remove?.()||el.classList.add('hidden'));
  const dialog=q('artistFilesDialog');if(!dialog)return;
  dialog.querySelectorAll('.file-input,#artistFileCategory,#uploadProgress,[data-deletefile]').forEach(el=>{const target=el.closest('label')||el;target.classList.add('hidden')});
  const notice=dialog.querySelector('.notice');if(notice)notice.textContent='Acesso apenas para consulta dos ficheiros necessários à tua data atribuída.';
  dialog.querySelectorAll('button').forEach(b=>{if(b.hasAttribute('data-openfile')||b.hasAttribute('data-close')||b.closest('.title-row'))return;b.classList.add('hidden')});
}
function applySubstituteMode(){
  if(!isSubstitute())return;
  const nav=q('nav');if(nav){nav.querySelectorAll('button').forEach(b=>{const page=b.dataset.page,filter=b.dataset.agendaFilter,allowed=(page==='agenda'&&!filter)||page==='artists';b.classList.toggle('hidden',!allowed);if(page==='artists')b.textContent='Ficheiros'})}
  q('newConcert')?.classList.add('hidden');q('newArtist')?.classList.add('hidden');q('newMember')?.classList.add('hidden');
  document.querySelectorAll('.money,[data-team-action],#dueByPerson,#dashboard .stats,[data-artist-edit]').forEach(el=>el.classList.add('hidden'));
  const title=document.querySelector('#artists .title-row h2');if(title)title.textContent='Ficheiros';
  renderSubstituteArtists();lockFilesReadOnly();
}
function patchOpenArtistFiles(){
  if(window.__substituteOpenFilesPatched||typeof window.openArtistFiles!=='function')return;
  const original=window.openArtistFiles;
  window.openArtistFiles=async function(id,...rest){
    if(isSubstitute()&&!allowedArtistIds().has(String(id)))return toast('Sem acesso. Este artista não está associado a uma data tua.');
    const out=await original.call(this,id,...rest);requestAnimationFrame(lockFilesReadOnly);setTimeout(lockFilesReadOnly,100);return out
  };
  window.__substituteOpenFilesPatched=true;
}
function patchLoadAll(){if(window.__substituteModePatched||typeof window.loadAll!=='function')return;const original=window.loadAll;window.loadAll=async function(...args){const out=await original.apply(this,args);requestAnimationFrame(applySubstituteMode);return out};window.__substituteModePatched=true}
function boot(){patchLoadAll();patchOpenArtistFiles();setTimeout(applySubstituteMode,200);setTimeout(applySubstituteMode,700);const list=q('artistList');if(list&&!list.dataset.subLockObserved){list.dataset.subLockObserved='1';new MutationObserver(()=>{if(isSubstitute())setTimeout(()=>{renderSubstituteArtists();lockFilesReadOnly()},30)}).observe(list,{childList:true,subtree:false})}}
if(document.readyState==='loading')addEventListener('load',boot,{once:true});else boot();
})();