(()=>{
const q=id=>document.getElementById(id);
function isPast(c){const end=c.ends_at||c.starts_at;return !!(end&&new Date(end)<new Date())}
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
 if(r.error)return toast(r.error.message);toast('Data marcada como faturada');await loadAll();refresh();
}
async function markReceived(c){
 const fee=Number(c.fee_override||0);
 const r=await sb.from('concerts').update({amount_received:fee,payment_received_at:new Date().toISOString(),closed:true}).eq('id',c.id);
 if(r.error)return toast(r.error.message);toast('Pagamento recebido · data fechada');await loadAll();refresh();
}
async function closeConcert(c){
 const r=await sb.from('concerts').update({closed:true,payment_received_at:c.payment_received_at||new Date().toISOString()}).eq('id',c.id);
 if(r.error)return toast(r.error.message);toast('Data fechada');await loadAll();refresh();
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
 if(s?.key==='invoice'&&can('financials_view')){
  const b=document.createElement('button');b.type='button';b.className='tiny secondary';b.textContent='Marcar faturado';b.onclick=()=>markInvoiced(c);actions.appendChild(b);
 }
 if(s?.key==='receive'&&can('financials_view')){
  const b=document.createElement('button');b.type='button';b.className='tiny';b.textContent='Marcar recebido';b.onclick=()=>markReceived(c);actions.appendChild(b);
 }
 if(s?.key==='close'&&can('financials_view')){
  const b=document.createElement('button');b.type='button';b.className='tiny';b.textContent='Fechar data';b.onclick=()=>closeConcert(c);actions.appendChild(b);
 }
 card.classList.toggle('concert-closed',!!c.closed);
 card.classList.toggle('finance-hidden-main',!!c.closed);
}
function renderValidated(){
 const validated=ensureValidatedSection();if(!validated)return;
 const closed=(concerts||[]).filter(c=>c.closed);
 if(!closed.length){validated.innerHTML='<div class="empty">Sem datas fechadas.</div>';return}
 validated.innerHTML=closed.map(c=>`<article class="item concert-closed"><div><strong>${esc(c.artists?.name||'Trabalho')}</strong><small>${dt(c.starts_at)} · ${esc(c.city||c.venue||'Local por definir')} · ${esc(c.work_position||'')}</small><div class="finance-meta"><span class="finance-chip fin-closed"><b>✓</b>Fechada</span></div></div>${can('financials_view')?`<span class="money">${money(c.fee_override)}</span>`:''}</article>`).join('');
}
function decorateAgenda(){
 const list=q('concerts');if(!list)return;
 const cards=[...list.querySelectorAll(':scope > .item')];
 cards.forEach((card,i)=>{const c=(concerts||[])[i];if(c)addFinanceToCard(card,c)});
 renderValidated();
}
function decorateDashboard(){
 const future=(concerts||[]).filter(c=>new Date(c.starts_at)>=new Date()&&!c.closed).slice(0,5);
 [...(q('nextConcerts')?.querySelectorAll(':scope > .item')||[])].forEach((card,i)=>addFinanceToCard(card,future[i]));
}
let refreshing=false;
function refresh(){if(refreshing)return;refreshing=true;try{decorateAgenda();decorateDashboard()}finally{refreshing=false}}
addEventListener('load',()=>{setTimeout(refresh,500);setTimeout(refresh,1400)});
})();