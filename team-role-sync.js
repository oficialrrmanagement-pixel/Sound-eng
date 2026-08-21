(()=>{
let syncing=false,timer=null;
const mergeRows=rows=>{if(!Array.isArray(rows))return;const current=Array.isArray(team)?team:[],map=new Map(current.map(p=>[String(p.id),p]));for(const row of rows){const id=String(row?.id||'');if(!id)continue;map.set(id,{...(map.get(id)||{}),...row})}team=[...map.values()]};
async function fetchRoles(){
 if(!me?.id)return [];
 if(me.role==='admin'){
  const r=await sb.from('profiles').select('id,full_name,email,role,active,photo_path,base_city,owner_partner_id').order('full_name');
  if(r.error)throw r.error;return r.data||[];
 }
 if(me.role==='partner'){
  const r=await sb.rpc('partner_team_picker');
  if(r.error)throw r.error;return r.data||[];
 }
 const r=await sb.from('profiles').select('id,full_name,email,role,active,photo_path,base_city,owner_partner_id').eq('id',me.id);
 if(r.error)throw r.error;return r.data||[];
}
function refreshViews(){
 try{window.TeamDuckDue?.refresh?.()}catch(_){}
 try{window.TeamDuckAgendaMembers?.refresh?.()}catch(_){}
 try{window.TeamDuckAgendaMemberPhotos?.refresh?.()}catch(_){}
 try{window.TeamDuckImages?.enhance?.()}catch(_){}
 try{window.TeamDuckPartnerTeams?.refresh?.()}catch(_){}
 try{window.TeamDuckScopedTeam?.refresh?.()}catch(_){}
 try{window.TeamDuckAssignments?.refresh?.()}catch(_){}
 try{window.TeamDuckFinance?.refresh?.()}catch(_){}
 try{window.TeamDuckRoleLayout?.apply?.()}catch(_){}
 document.dispatchEvent(new CustomEvent('teamduck:roles-synced',{detail:{at:Date.now()}}));
}
async function sync(){
 if(syncing||!me?.id)return;syncing=true;
 try{const rows=await fetchRoles();mergeRows(rows);const self=(team||[]).find(p=>String(p.id)===String(me.id));if(self)me={...me,...self};refreshViews()}
 catch(err){console.warn('Team Duck role sync',err)}finally{syncing=false}
}
function schedule(ms=80){clearTimeout(timer);timer=setTimeout(sync,ms)}
function wireMemberSave(){const f=document.getElementById('memberForm');if(!f||f.dataset.globalRoleSync)return;f.dataset.globalRoleSync='1';f.addEventListener('submit',()=>{schedule(350);setTimeout(()=>schedule(0),900)},false)}
function boot(){wireMemberSave();schedule(120);setTimeout(()=>schedule(0),700);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')schedule(80)});window.addEventListener('focus',()=>schedule(80));new MutationObserver(wireMemberSave).observe(document.body,{childList:true,subtree:true})}
if(document.readyState==='loading')addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.TeamDuckRoleSync={sync:()=>sync(),refresh:()=>schedule(0)};
})();
