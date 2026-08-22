(()=>{
function keyFor(row){const id=String(row?.dataset?.techId||'').trim();if(id)return'id:'+id;const name=String(row?.querySelector('b')?.textContent||'').trim().toLocaleLowerCase('pt-PT');return name?'name:'+name:''}
function dedupe(host){if(!host)return;const seen=new Set();for(const row of [...host.querySelectorAll('.td-avail-row')]){const k=keyFor(row);if(!k)continue;if(seen.has(k))row.remove();else seen.add(k)}}
function refresh(){dedupe(document.getElementById('substituteAvailability'));dedupe(document.getElementById('tdAvailabilityChoices'))}
const observer=new MutationObserver(()=>queueMicrotask(refresh));function boot(){observer.observe(document.body,{childList:true,subtree:true});refresh()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();window.TeamDuckTechnicianDedupe={refresh};
})();