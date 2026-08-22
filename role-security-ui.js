(()=>{
const q=id=>document.getElementById(id);const isAdmin=()=>me?.role==='admin';
function fieldsetWith(selector,root=document){const el=root.querySelector(selector);return el?.closest('fieldset')||null}
function apply(){const member=q('memberDialog'),invite=q('inviteDialog');const memberPerms=member?fieldsetWith('[data-member-perm]',member):null;const invitePerms=invite?fieldsetWith('[data-perm]',invite):null;if(memberPerms)memberPerms.style.display=isAdmin()?'':'none';if(invitePerms)invitePerms.style.display=isAdmin()?'':'none';}
function boot(){apply();const obs=new MutationObserver(apply);obs.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['open','class']});document.addEventListener('teamduck:language',apply);setTimeout(apply,250);setTimeout(apply,800)}
if(document.readyState==='loading')addEventListener('DOMContentLoaded',boot,{once:true});else boot();window.TeamDuckRoleSecurityUI={refresh:apply};
})();
