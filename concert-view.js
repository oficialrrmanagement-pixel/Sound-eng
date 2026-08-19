(()=>{
const q=id=>document.getElementById(id);
function ensureDialog(){
 if(q('concertViewDialog'))return;
 document.body.insertAdjacentHTML('beforeend',`<dialog id="concertViewDialog"><div><div class="title-row"><h3 id="concertViewTitle">Detalhes da data</h3><button type="button" id="concertViewClose">Fechar</button></div><div id="concertViewBody" class="panel"></div></div></dialog>`);
 q('concertViewClose').onclick=()=>q('concertViewDialog').close();
}
function val(v){return v===null||v===undefined||v===''?'—':esc(v)}
function techName(c){const p=(team||[]).find(x=>String(x.id)===String(c.technician_id));return p?.full_name||p?.email||'—'}
function moneySafe(v){try{return money(v)}catch{return v??'—'}}
function openConcertView(id){
 const c=(concerts||[]).find(x=>String(x.id)===String(id));if(!c)return;
 ensureDialog();
 q('concertViewTitle').textContent=`${c.artists?.name||'Trabalho'} · detalhes`;
 const rows=[
  ['Artista',c.artists?.name],['Início',dt(c.starts_at)],['Fim',c.ends_at?dt(c.ends_at):'—'],['Local',c.venue],['Cidade',c.city],['Função',c.work_position],['Técnico',techName(c)],['Estado',c.booking_status||c.status],['Resposta do técnico',c.technician_response],['Call time',c.call_time],['Soundcheck',c.soundcheck_time],['Show',c.show_time],['Notas',c.notes]
 ];
 if(can('financials_view')){rows.push(['Cachet',moneySafe(c.fee_override)],['Recebido',moneySafe(c.amount_received)]);}
 q('concertViewBody').innerHTML=rows.map(([k,v])=>`<div style="margin:0 0 12px"><strong>${esc(k)}</strong><div class="muted" style="margin-top:4px;white-space:pre-wrap">${val(v)}</div></div>`).join('');
 q('concertViewDialog').showModal();
}
function injectViewButtons(container,arr){
 if(!container)return;
 const cards=[...container.querySelectorAll(':scope > .item')];
 cards.forEach((card,i)=>{const c=arr[i];if(!c)return;let actions=card.querySelector('.concert-actions');if(!actions){actions=document.createElement('div');actions.className='concert-actions';card.appendChild(actions)}if(!actions.querySelector('[data-concert-view]')){const b=document.createElement('button');b.type='button';b.className='secondary tiny';b.textContent='Ver';b.dataset.concertView=c.id;b.onclick=e=>{e.stopPropagation();openConcertView(c.id)};actions.prepend(b)}});
}
function refresh(){
 ensureDialog();
 injectViewButtons(q('concerts'),concerts||[]);
 const future=(concerts||[]).filter(c=>new Date(c.starts_at)>=new Date()&&!c.closed).slice(0,5);
 injectViewButtons(q('nextConcerts'),future);
}
addEventListener('load',()=>{setTimeout(refresh,300);setTimeout(refresh,1000)});
window.openConcertView=openConcertView;
})();