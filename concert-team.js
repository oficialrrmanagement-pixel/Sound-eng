(()=>{
const q=id=>document.getElementById(id);
const statusMeta={confirmed:{label:'Confirmado',cls:'s-green'},reserved:{label:'Reservado',cls:'s-yellow'},cancelled:{label:'Cancelado',cls:'s-red'}};
const responseMeta={accepted:{label:'Aceite pelo técnico',cls:'s-green'},pending:{label:'A aguardar resposta por e-mail',cls:'s-red'},declined:{label:'Recusado pelo técnico',cls:'s-red'}};
function injectFields(){
 const form=q('concertForm'); if(!form||q('concertTechnician'))return;
 const pos=q('concertPosition')?.closest('label'); if(!pos)return;
 pos.insertAdjacentHTML('afterend',`<label>Técnico selecionado<select id="concertTechnician" required><option value="">Selecionar técnico</option></select></label><fieldset class="status-selector"><legend>Estado da data</legend><div class="status-three"><label><input type="radio" name="concertBookingStatus" value="confirmed"><span class="dot green"></span>Confirmado</label><label><input type="radio" name="concertBookingStatus" value="reserved" checked><span class="dot yellow"></span>Reservado</label><label><input type="radio" name="concertBookingStatus" value="cancelled"><span class="dot red"></span>Cancelado</label></div></fieldset>`);
 fillTechnicians();
}
function fillTechnicians(){
 const sel=q('concertTechnician'); if(!sel)return;
 const active=(team||[]).filter(p=>p.active!==false);
 const html='<option value="">Selecionar técnico</option>'+active.map(p=>`<option value="${p.id}">${esc(p.full_name||p.email||'Membro')} — ${esc(p.email||'sem e-mail')}</option>`).join('');
 if(sel.innerHTML!==html)sel.innerHTML=html;
}
function technicianName(c){const p=(team||[]).find(x=>x.id===c.technician_id);return p?.full_name||p?.email||'Sem técnico';}
function bookingStatus(c){return c.booking_status||((c.status==='cancelled')?'cancelled':(c.status==='confirmed'?'confirmed':'reserved'));}
function responseStatus(c){return c.technician_response||'pending';}
async function sendTechnicianEmail(c,quiet=false){
 const r=await sb.functions.invoke('send-concert-invite',{body:{concert_id:c.id}});
 if(r.error||!r.data?.ok){if(!quiet)toast(r.data?.error||r.error?.message||'Não foi possível enviar o e-mail');return false}
 if(!quiet)toast('Convite enviado por e-mail para '+(r.data.email||'o técnico'));
 return true;
}
function decorateContainer(container,arr){
 if(!container)return;
 const cards=[...container.querySelectorAll('.item')];
 cards.forEach((card,i)=>{
   const c=arr[i]; if(!c)return;
   let meta=card.querySelector('.concert-meta');
   if(!meta){meta=document.createElement('div');meta.className='concert-meta';card.querySelector('div:first-child')?.appendChild(meta)}
   const bs=statusMeta[bookingStatus(c)]||statusMeta.reserved, rs=responseMeta[responseStatus(c)]||responseMeta.pending;
   const sent=c.technician_response_email_sent_at?' · e-mail enviado':'';
   const metaHtml=`<span class="status-chip ${bs.cls}"><i></i>${bs.label}</span><span class="status-chip ${rs.cls}"><i></i>${rs.label}${sent}</span><span class="tech-name">Técnico: ${esc(technicianName(c))}</span>`;
   if(meta.innerHTML!==metaHtml)meta.innerHTML=metaHtml;
   let actions=card.querySelector('.concert-actions');
   if(!actions){actions=document.createElement('div');actions.className='concert-actions';card.appendChild(actions)}
   actions.replaceChildren();
   if(can('concerts_manage')&&c.technician_id&&responseStatus(c)==='pending'){
     const e=document.createElement('button');e.type='button';e.className='secondary tiny';e.textContent=c.technician_response_email_sent_at?'Reenviar e-mail':'Enviar e-mail';e.onclick=()=>sendTechnicianEmail(c);actions.appendChild(e);
   }
   if(can('concerts_manage')&&c.technician_id){
     const g=document.createElement('button');g.type='button';g.className='secondary tiny';g.textContent='Google Calendar';g.onclick=()=>openGoogleInvite(c);actions.appendChild(g);
   }
 });
}
function decorate(){
 const future=(concerts||[]).filter(c=>new Date(c.starts_at)>=new Date()&&!c.closed).slice(0,5);
 decorateContainer(q('concerts'),concerts||[]);
 decorateContainer(q('nextConcerts'),future);
}
function googleDates(c){
 const fmt=d=>new Date(d).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
 const start=fmt(c.starts_at),end=fmt(c.ends_at||new Date(new Date(c.starts_at).getTime()+2*60*60*1000));return `${start}/${end}`;
}
async function openGoogleInvite(c){
 const tech=(team||[]).find(x=>x.id===c.technician_id); if(!tech?.email)return toast('Este técnico não tem e-mail registado.');
 const title=`${c.artists?.name||'Trabalho'} — ${c.work_position||''}`.trim();
 const details=`Team Duck\nTécnico: ${tech.full_name||tech.email}\nEstado: ${statusMeta[bookingStatus(c)]?.label||bookingStatus(c)}.`;
 const location=[c.venue,c.city].filter(Boolean).join(', ');
 const url='https://calendar.google.com/calendar/render?action=TEMPLATE&text='+encodeURIComponent(title)+'&dates='+encodeURIComponent(googleDates(c))+'&details='+encodeURIComponent(details)+'&location='+encodeURIComponent(location)+'&add='+encodeURIComponent(tech.email);
 window.open(url,'_blank');
}
function patchSubmit(){
 const form=q('concertForm'); if(!form||form.dataset.teamPatched)return; form.dataset.teamPatched='1';
 form.onsubmit=async e=>{
   e.preventDefault();if(!can('concerts_manage'))return toast('Sem permissão.');
   const tech=q('concertTechnician')?.value;if(!tech)return toast('Seleciona o técnico para esta data.');
   const {data:{user}}=await sb.auth.getUser();
   const booking=document.querySelector('input[name="concertBookingStatus"]:checked')?.value||'reserved';
   const r=await sb.from('concerts').insert({artist_id:q('concertArtist').value,starts_at:new Date(q('concertStart').value).toISOString(),ends_at:q('concertEnd').value?new Date(q('concertEnd').value).toISOString():null,venue:q('concertVenue').value||null,city:q('concertCity').value||null,work_position:q('concertPosition').value,technician_id:tech,booking_status:booking,technician_response:'pending',fee_override:q('concertFee').value||null,amount_received:q('concertReceived').value||0,notes:q('concertNotes').value||null,status:booking==='cancelled'?'cancelled':'confirmed',created_by:user.id,owner_id:user.id}).select('id,starts_at,ends_at,venue,city,work_position,technician_id,booking_status,technician_response,artists(name)').single();
   if(r.error)return toast(r.error.message);
   const sent=await sendTechnicianEmail(r.data,true);
   q('concertDialog').close();form.reset();
   const reserved=document.querySelector('input[name="concertBookingStatus"][value="reserved"]');if(reserved)reserved.checked=true;
   toast(sent?'Data criada e convite enviado por e-mail.':'Data criada, mas o e-mail não foi enviado.');await loadAll();
 };
}
function refresh(){injectFields();fillTechnicians();patchSubmit();decorate()}
function patchLoadAll(){
 if(window.__teamDuckLoadPatched||typeof window.loadAll!=='function')return;
 const original=window.loadAll;
 window.loadAll=async function(...args){const out=await original.apply(this,args);requestAnimationFrame(refresh);return out};
 window.__teamDuckLoadPatched=true;
}
addEventListener('load',()=>{patchLoadAll();setTimeout(refresh,250);setTimeout(refresh,1000)});
})();