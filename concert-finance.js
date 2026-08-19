(()=>{
const q=id=>document.getElementById(id);
function isPast(c){const end=c.ends_at||c.starts_at;return end&&new Date(end)<new Date()}
function financeState(c){
 if(c.closed)return {key:'closed',label:'Fechada',icon:'✓',cls:'fin-closed'};
 if(!isPast(c)||c.booking_status==='cancelled'||c.status==='cancelled')return null;
 if(!c.receipt_issued)return {key:'invoice',label:'Por faturar',icon:'🧾',cls:'fin-invoice'};
 const fee=Number(c.fee_override||0),received=Number(c.amount_received||0);
 if(received+0.005<fee)return {key:'receive',label:'Por receber',icon:'€',cls:'fin-receive'};
 return {key:'close',label:'Pronto a fechar',icon:'✓',cls:'fin-ready'};
}
function ensureValidatedSection(){
 const agenda=q('agenda');if(!agenda)return null;
 let wrap=q('validatedDatesWrap');
 if(!wrap){wrap=document.createElement('div');wrap.id='validatedDatesWrap';wrap.className='validated-wrap';wrap.innerHTML='<h3>Datas validadas</h3><div id="validatedDates" class="list"></div>';agenda.appendChild(wrap)}
 return q('validatedDates');
}
async function markInvoiced(c){
 const r=await sb.from('concerts').update({receipt_issued:true,receipt_issued_at:new Date().toISOString()}).eq('id',c.id);
 if(r.error)return toast(r.error.message);toast('Data marcada como faturada');await loadAll();
}
async function markReceived(c){
 const fee=Number(c.fee_override||0);
 const r=await sb.from('concerts').update({amount_received:fee,payment_received_at:new Date().toISOString(),closed:true}).eq('id',c.id);
 if(r.error)return toast(r.error.message);toast('Pagamento recebido · data fechada');await loadAll();
}
async function closeConcert(c){
 const r=await sb.from('concerts').update({closed:true,payment_received_at:c.payment_received_at||new Date().toISOString()}).eq('id',c.id);
 if(r.error)return toast(r.error.message);toast('Data fechada');await loadAll();
}
function addFinanceToCard(card,c){
 if(!card||!c)return;
 const s=financeState(c);
 let meta=card.querySelector('.finance-meta');
 if(!meta){meta=document.createElement('div');meta.className='finance-meta';card.querySelector('div:first-child')?.appendChild(meta)}
 meta.innerHTML=s?`<span class="finance-chip ${s.cls}"><b>${s.icon}</b>${s.label}</span>`:'';
 let actions=card.querySelector('.finance-actions');
 if(!actions){actions=document.createElement('div');actions.className='finance-actions';card.appendChild(actions)}
 actions.innerHTML='';
 if(!s)return;
 if(s.key==='invoice'&&can('financials_view')){
  const b=document.createElement('button');b.type='button';b.className='tiny secondary';b.textContent='Marcar faturado';b.onclick=()=>markInvoiced(c);actions.appendChild(b);
 }
 if(s.key==='receive'&&can('financials_view')){
  const b=document.createElement('button');b.type='button';b.className='tiny';b.textContent='Marcar recebido';b.onclick=()=>markReceived(c);actions.appendChild(b);
 }
 if(s.key==='close'&&can('financials_view')){
  const b=document.createElement('button');b.type='button';b.className='tiny';b.textContent='Fechar data';b.onclick=()=>closeConcert(c);actions.appendChild(b);
 }
 card.classList.toggle('concert-closed',!!c.closed);
}
function decorateAgenda(){
 const list=q('concerts');if(!list)return;
 const cards=[...list.querySelectorAll(':scope > .item')];
 cards.forEach((card,i)=>{const c=(concerts||[])[i];if(c)addFinanceToCard(card,c)});
 const validated=ensureValidatedSection();if(!validated)return;
 validated.innerHTML='';
 cards.forEach((card,i)=>{const c=(concerts||[])[i];if(c?.closed)validated.appendChild(card)});
 if(!validated.children.length)validated.innerHTML='<div class="empty">Sem datas fechadas.</div>';
}
function decorateDashboard(){
 const future=(concerts||[]).filter(c=>new Date(c.starts_at)>=new Date()&&!c.closed).slice(0,5);
 [...(q('nextConcerts')?.querySelectorAll('.item')||[])].forEach((card,i)=>addFinanceToCard(card,future[i]));
}
function refresh(){decorateAgenda();decorateDashboard()}
addEventListener('load',()=>{setTimeout(refresh,400);setTimeout(refresh,1200);const app=q('app');if(app)new MutationObserver(()=>refresh()).observe(app,{subtree:true,childList:true})});
})();