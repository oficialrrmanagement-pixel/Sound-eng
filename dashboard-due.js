(()=>{
const q=id=>document.getElementById(id);
function grossFor(c,personId){const total=Math.max(0,Number(c.fee_override||0)),principal=String(c.principal_technician_id||c.technician_id||''),sub=String(c.substitute_technician_id||''),pid=String(personId),subFee=sub?Math.max(0,Number(c.substitute_fee||0)):0,principalPart=sub?Math.max(0,Number(c.principal_commission??(total-subFee))):total;if(pid===principal)return principalPart;if(sub&&pid===sub)return subFee;return 0}
function dueFor(person){return (concerts||[]).filter(c=>!c.closed).reduce((sum,c)=>{const total=Math.max(0,Number(c.fee_override||0));if(!total)return sum;const outstanding=Math.max(0,total-Number(c.amount_received||0));if(!outstanding)return sum;const ratio=outstanding/total;return sum+(grossFor(c,person.id)*ratio)},0)}
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