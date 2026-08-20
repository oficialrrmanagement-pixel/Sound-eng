(()=>{
const q=id=>document.getElementById(id);let selected='ALL';
function activePeople(){return (team||[]).filter(p=>p.active!==false)}
function renderTabs(){const host=q('agendaMembers');if(!host)return;const people=activePeople();host.innerHTML=`<button type="button" class="secondary tiny ${selected==='ALL'?'active':''}" data-agenda-member="ALL">Geral</button>`+people.map(p=>`<button type="button" class="secondary tiny ${selected===String(p.id)?'active':''}" data-agenda-member="${p.id}">${esc(p.full_name||p.email||'Membro')}</button>`).join('');host.querySelectorAll('[data-agenda-member]').forEach(b=>b.onclick=()=>{selected=b.dataset.agendaMember;renderTabs();apply()})}
function belongsTo(c,id){if(!c)return false;const ids=[c.principal_technician_id,c.technician_id,c.owner_id,c.substitute_technician_id].filter(Boolean).map(String);return ids.includes(String(id))}
function apply(){const host=q('concerts');if(!host)return;const cards=[...host.querySelectorAll(':scope > .item')];cards.forEach((card,i)=>{const c=(concerts||[])[i];if(!c)return;const byMember=selected==='ALL'||belongsTo(c,selected);card.dataset.memberHidden=byMember?'0':'1';const filterOK=card.dataset.filterHidden!=='1';card.style.display=(byMember&&filterOK)?'':'none'});const title=document.querySelector('#agenda .title-row h2');if(title&&selected!=='ALL'){const p=activePeople().find(x=>String(x.id)===selected);title.textContent=`Agenda · ${p?.full_name||'Membro'}`}}
function resetToGeneral(){selected='ALL';renderTabs();setTimeout(apply,0)}
function hookAgendaClicks(){document.querySelectorAll('#nav button[data-page="agenda"]').forEach(b=>{if(b.dataset.memberResetWired)return;b.dataset.memberResetWired='1';b.addEventListener('click',()=>{selected='ALL';renderTabs();setTimeout(apply,80)})})}
function patchLoadAll(){if(window.__agendaMembersPatched||typeof window.loadAll!=='function')return;const old=window.loadAll;window.loadAll=async function(...args){const r=await old.apply(this,args);selected='ALL';renderTabs();setTimeout(apply,60);return r};window.__agendaMembersPatched=true}
function init(){hookAgendaClicks();patchLoadAll();selected='ALL';setTimeout(()=>{renderTabs();apply()},120);setTimeout(()=>{renderTabs();apply()},600)}
if(document.readyState==='loading')addEventListener('load',init,{once:true});else init();
window.addEventListener('teamduck:agenda-filter',()=>{if(selected==='ALL')setTimeout(apply,10)});
window.TeamDuckAgendaMembers={apply,reset:resetToGeneral,current:()=>selected};
})();