(()=>{
const q=id=>document.getElementById(id);
function isSubstitute(){return me?.role==='substitute'}
function renderSubstituteArtists(){
  if(!isSubstitute()) return;
  const host=q('artistList'); if(!host) return;
  host.innerHTML=(artists||[]).map(a=>`<article class="item"><div><strong>${esc(a.name)}</strong></div><div class="file-actions"><button type="button" class="secondary tiny" data-artist-files="${a.id}">Ficheiros</button></div></article>`).join('')||'<div class="empty">Sem ficheiros disponíveis.</div>';
  document.querySelectorAll('[data-artist-files]').forEach(b=>b.onclick=()=>openArtistFiles(b.dataset.artistFiles));
}
function lockFilesReadOnly(){
  if(!isSubstitute()) return;
  const dialog=q('artistFilesDialog'); if(!dialog) return;
  dialog.querySelectorAll('.file-input,#artistFileCategory,#uploadProgress').forEach(el=>{
    const target=el.closest('label')||el;
    target.classList.add('hidden');
  });
  const notice=dialog.querySelector('.notice'); if(notice) notice.textContent='Acesso apenas para consulta. Podes abrir os ficheiros disponíveis.';
  dialog.querySelectorAll('[data-deletefile]').forEach(b=>b.remove());
  dialog.querySelectorAll('button').forEach(b=>{
    if(b.hasAttribute('data-openfile')||b.hasAttribute('data-close')) return;
    if(b.closest('.title-row')) return;
    b.classList.add('hidden');
  });
}
function applySubstituteMode(){
  if(!isSubstitute()) return;
  const nav=q('nav');
  if(nav){
    nav.querySelectorAll('button').forEach(b=>{
      const page=b.dataset.page;
      const filter=b.dataset.agendaFilter;
      const allowed=(page==='agenda' && (!filter || filter==='FOH' || filter==='ROH')) || page==='artists';
      b.classList.toggle('hidden',!allowed);
      if(page==='artists') b.textContent='Ficheiros';
      if(allowed) b.classList.remove('active');
    });
  }
  q('newConcert')?.classList.add('hidden');
  q('newArtist')?.classList.add('hidden');
  q('newMember')?.classList.add('hidden');
  document.querySelectorAll('.money,[data-team-action],#dueByPerson,#dashboard .stats').forEach(el=>el.classList.add('hidden'));
  const artistTitle=document.querySelector('#artists .title-row h2'); if(artistTitle) artistTitle.textContent='Ficheiros';
  renderSubstituteArtists();
  lockFilesReadOnly();
}
function patchOpenArtistFiles(){
  if(window.__substituteOpenFilesPatched||typeof window.openArtistFiles!=='function') return;
  const original=window.openArtistFiles;
  window.openArtistFiles=async function(...args){const out=await original.apply(this,args);requestAnimationFrame(lockFilesReadOnly);setTimeout(lockFilesReadOnly,150);return out};
  window.__substituteOpenFilesPatched=true;
}
function patchLoadAll(){
  if(window.__substituteModePatched || typeof window.loadAll!=='function') return;
  const original=window.loadAll;
  window.loadAll=async function(...args){const out=await original.apply(this,args);requestAnimationFrame(applySubstituteMode);return out};
  window.__substituteModePatched=true;
}
addEventListener('load',()=>{patchLoadAll();patchOpenArtistFiles();setTimeout(()=>{applySubstituteMode();patchOpenArtistFiles()},300);setTimeout(()=>{applySubstituteMode();patchOpenArtistFiles()},1000)});
})();