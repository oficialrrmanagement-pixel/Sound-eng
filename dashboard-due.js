(()=>{
const q=id=>document.getElementById(id);
function dueFor(person){return (concerts||[]).filter(c=>String(c.technician_id)===String(person.id)&&!c.closed).reduce((sum,c)=>sum+Math.max(0,Number(c.fee_override||0)-Number(c.amount_received||0)),0)}
function renderDueByPerson(){const host=q('dueByPerson');if(!host)return;if(!can('financials_view')){host.innerHTML='<div class="empty">Sem permissão para ver valores.</div>';return}const people=(team||[]).filter(p=>p.active!==false);host.innerHTML=people.map(p=>`<article class="item"><div><strong>${esc(p.full_name||p.email||'Membro')}</strong><small>${roleLabel(p.role)}</small></div><span class="money">${money(dueFor(p))}</span></article>`).join('')||'<div class="empty">Sem membros na equipa.</div>'}
function refresh(){const total=q('statDue');if(total)total.closest('article')?.classList.add('hidden');renderDueByPerson()}
function patchLoadAll(){if(window.__duePeoplePatched||typeof window.loadAll!=='function')return;const original=window.loadAll;window.loadAll=async function(...args){const out=await original.apply(this,args);requestAnimationFrame(refresh);return out};window.__duePeoplePatched=true}
addEventListener('load',()=>{patchLoadAll();setTimeout(refresh,400)});
})();