(()=>{
const defaults={admin:{artists_manage:true,files_manage:true,concerts_manage:true,financials_view:true,documents_manage:true,team_manage:true},partner:{artists_manage:true,files_manage:true,concerts_manage:true,financials_view:false,documents_manage:false,team_manage:false},substitute:{artists_manage:false,files_manage:false,concerts_manage:false,financials_view:false,documents_manage:false,team_manage:false}};
function applyDefaults(role){const d=defaults[role]||defaults.substitute;document.querySelectorAll('[data-member-perm]').forEach(c=>{c.checked=!!d[c.dataset.memberPerm]})}
function wire(){const role=document.getElementById('memberRole');if(!role||role.dataset.roleFix)return;role.dataset.roleFix='1';role.addEventListener('change',()=>{applyDefaults(role.value);const label={admin:'Administrador',partner:'Parceiro',substitute:'Substituto'}[role.value]||role.value;try{toast(`Função alterada para ${label}. Carrega em Guardar para confirmar.`)}catch(_){}})}
new MutationObserver(wire).observe(document.body,{childList:true,subtree:true});if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire,{once:true});else wire();
})();
