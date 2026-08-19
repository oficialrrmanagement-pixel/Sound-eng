(()=>{
function isAdmin(){return me?.role==='admin'}
function restoreAdminActions(){
  if(!isAdmin())return;
  const ids=['newConcert','newMember','newArtist'];
  ids.forEach(id=>document.getElementById(id)?.classList.remove('hidden'));
  const nc=document.getElementById('newConcert');if(nc)nc.onclick=()=>document.getElementById('concertDialog')?.showModal();
  const nm=document.getElementById('newMember');if(nm)nm.onclick=()=>{document.getElementById('inviteDialog')?.showModal();try{setInviteDefaults?.()}catch(_){}};
  const na=document.getElementById('newArtist');if(na)na.onclick=()=>document.getElementById('artistDialog')?.showModal();
}
function patchLoad(){
  if(window.__adminActionsPatched||typeof window.loadAll!=='function')return;
  const original=window.loadAll;
  window.loadAll=async function(...args){const out=await original.apply(this,args);requestAnimationFrame(restoreAdminActions);setTimeout(restoreAdminActions,150);return out};
  window.__adminActionsPatched=true;
}
function loadInviteApproval(){
  if(document.getElementById('teamInviteApprovalScript'))return;
  const s=document.createElement('script');s.id='teamInviteApprovalScript';s.src='team-invite-approval.js?v=20260819-approval1';document.body.appendChild(s);
}
addEventListener('load',()=>{patchLoad();loadInviteApproval();setTimeout(restoreAdminActions,300);setTimeout(restoreAdminActions,1000)});
})();