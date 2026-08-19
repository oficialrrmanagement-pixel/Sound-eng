(()=>{
const q=id=>document.getElementById(id);
function dueFor(person){return (concerts||[]).filter(c=>String(c.technician_id)===String(person.id)&&!c.closed).reduce((sum,c)=>sum+Math.max(0,Number(c.fee_override||0)-Number(c.amount_received||0)),0)}
function renderDueByPerson(){
 const host=q('dueByPerson');if(!host)return;
 if(!me){setTimeout(renderDueByPerson,250);return}
 const sectionTitle=host.previousElementSibling;
 const isAdmin=me?.role==='admin';
 if(!isAdmin){host.innerHTML='';host.classList.add('hidden');if(sectionTitle)sectionTitle.classList.add('hidden');return}
 host.classList.remove('hidden');if(sectionTitle)sectionTitle.classList.remove('hidden');
 const people=(team||[]).filter(p=>p.active!==false);
 host.innerHTML=people.map(p=>`<article class="item"><div><strong>${esc(p.full_name||p.email||'Membro')}</strong><small>${roleLabel(p.role)}</small></div><span class="money">${money(dueFor(p))}</span></article>`).join('')||'<div class="empty">Sem membros na equipa.</div>'
}
function refresh(){const total=q('statDue');if(total)total.closest('article')?.classList.add('hidden');renderDueByPerson()}
function patchLoadAll(){if(window.__duePeoplePatched||typeof window.loadAll!=='function')return false;const original=window.loadAll;window.loadAll=async function(...args){const out=await original.apply(this,args);setTimeout(refresh,0);return out};window.__duePeoplePatched=true;return true}
addEventListener('load',()=>{let tries=0;const timer=setInterval(()=>{tries++;patchLoadAll();refresh();if(me||tries>20)clearInterval(timer)},250)});
})();