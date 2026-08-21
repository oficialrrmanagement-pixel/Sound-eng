(()=>{
const q=id=>document.getElementById(id);
function actualPartner(){try{return me?.role==='partner'}catch(_){return false}}
async function loadPartnerPicker(){
 if(!actualPartner())return;
 const r=await sb.rpc('partner_team_picker');
 if(r.error){console.warn('partner_team_picker',r.error);return}
 const own=(team||[]).filter(p=>String(p.id)===String(me?.id||''));
 const safe=(r.data||[]).map(p=>({
   id:p.id,
   full_name:p.full_name,
   role:p.role,
   active:p.active,
   photo_path:p.photo_path||null,
   base_city:p.base_city||null,
   owner_partner_id:p.owner_partner_id||null
 }));
 const map=new Map([...own,...safe].map(p=>[String(p.id),p]));
 team=[...map.values()];
 setTimeout(()=>window.TeamDuckAssignments?.refresh?.(),20);
 setTimeout(()=>window.TeamDuckImages?.enhance?.(),30);
 setTimeout(()=>window.TeamDuckAgendaMembers?.refresh?.(),40);
}
function patchPartnerArtistCreate(){
 const form=q('artistForm');if(!form||form.dataset.partnerScopePatched)return;
 form.dataset.partnerScopePatched='1';
 form.addEventListener('submit',async e=>{
   if(!actualPartner())return;
   e.preventDefault();e.stopImmediatePropagation();
   const {data:{user}}=await sb.auth.getUser();if(!user)return toast('Sessão inválida.');
   const payload={name:q('artistName').value.trim(),base_fee:q('artistFee').value||null,contact_phone:q('artistPhone').value||null,contact_email:q('artistEmail').value||null,notes:q('artistNotes').value||null,created_by:user.id,principal_technician_id:user.id};
   const r=await sb.from('artists').insert(payload);if(r.error)return toast(r.error.message);
   q('artistDialog').close();form.reset();toast('Artista guardado');await loadAll();await loadPartnerPicker();window.TeamDuckRoleLayout?.apply?.();
 },true)
}
function protectPreviewWrites(){
 const preview=()=>{try{return me?.role==='admin'&&['partner','substitute'].includes(sessionStorage.getItem('team-duck-role-preview'))}catch(_){return false}};
 ['newArtist','newConcert'].forEach(id=>{const b=q(id);if(!b||b.dataset.previewProtected)return;b.dataset.previewProtected='1';b.addEventListener('click',e=>{if(!preview())return;e.preventDefault();e.stopImmediatePropagation();toast('Esta é uma pré-visualização. Para criar dados, volta à Vista Administrador.')},true)})
}
async function refresh(){patchPartnerArtistCreate();protectPreviewWrites();await loadPartnerPicker();window.TeamDuckRoleLayout?.apply?.()}
function init(){setTimeout(refresh,120);setTimeout(refresh,700)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.TeamDuckPartnerScope={refresh};
})();
