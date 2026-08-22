(()=>{
const q=id=>document.getElementById(id);
const STATUS={confirmed:'Confirmado',reserved:'Reservado',cancelled:'Cancelado'};
let cacheConcerts=[],cacheProfiles=[],decorating=false,lastIds=new Set();
function normalizePhone(raw){let d=String(raw||'').replace(/\D/g,'');if(d.startsWith('00'))d=d.slice(2);if(d.length===9)d='351'+d;return d}
function dateParts(c){const d=new Date(c.starts_at);return {date:d.toLocaleDateString('pt-PT',{weekday:'long',day:'2-digit',month:'2-digit',year:'numeric'}),time:d.toLocaleTimeString('pt-PT',{hour:'2-digit',minute:'2-digit'})}}
function booking(c){return c.booking_status||((c.status==='cancelled')?'cancelled':(c.status==='confirmed'?'confirmed':'reserved'))}
function place(c){const a=[c.venue,c.city].filter(Boolean);return a.length?a.join(' · '):'Por definir'}
function targetTechId(c){return c.substitute_technician_id||c.technician_id||null}
function techFor(c){const id=targetTechId(c);return cacheProfiles.find(p=>String(p.id)===String(id))||null}
function firstName(p){const name=(p?.full_name||p?.email||'').trim();return name.split(/\s+/)[0]||'Olá'}
function core(c){const d=dateParts(c);return `*Artista:* ${c.artists?.name||'Trabalho'}\n*Data:* ${d.date}\n*Hora:* ${d.time}\n*Local:* ${place(c)}\n*Função:* ${c.work_position||'Por definir'}\n*Estado:* ${STATUS[booking(c)]||booking(c)}`}
function messageFor(c,p,type='new'){
 const hi=`Olá ${firstName(p)},`;
 if(type==='change')return `${hi}\n\n*TEAM DUCK — ALTERAÇÃO DE DATA*\n\nHouve uma atualização nesta data de trabalho. Confirma, por favor, os novos dados:\n\n${core(c)}\n\nSe houver algum problema com esta alteração, avisa-me assim que possível.\n\nObrigado.`;
 if(type==='reminder')return `${hi}\n\n*TEAM DUCK — LEMBRETE DE TRABALHO*\n\nSó para relembrar a seguinte data:\n\n${core(c)}\n\nObrigado e até lá.`;
 if(type==='cancel')return `${hi}\n\n*TEAM DUCK — CANCELAMENTO DE DATA*\n\nEsta data foi *cancelada*:\n\n${core(c)}\n\nFica sem efeito na agenda. Obrigado pela disponibilidade.`;
 return `${hi}\n\n*TEAM DUCK — PEDIDO DE DISPONIBILIDADE*\n\n${core(c)}\n\nAbre o convite abaixo e escolhe *ACEITAR* ou *RECUSAR*.`;
}
function say(msg){try{if(typeof toast==='function')toast(msg);else alert(msg)}catch(_){alert(msg)}}
async function copyText(text){try{await navigator.clipboard.writeText(text);say('Mensagem copiada.')}catch(_){say('Não foi possível copiar a mensagem.')}}
function openWhatsApp(c,type='new'){
 const p=techFor(c);if(!p)return say('Esta data não tem substituto/técnico atribuído.');
 const phone=normalizePhone(p.phone);if(!phone)return say('O substituto/técnico não tem telefone guardado no perfil.');
 const url=`https://wa.me/${phone}?text=${encodeURIComponent(messageFor(c,p,type))}`;
 location.href=url;
}
async function createShareLink(c){
 const r=await sb.functions.invoke('create-concert-share-link',{body:{concert_id:c.id}});
 if(r.error||!r.data?.ok)throw new Error(r.data?.error||r.error?.message||'Não foi possível criar o link');
 if(!r.data.invite_url)throw new Error('O convite foi criado sem link.');
 return r.data.invite_url;
}
async function shareInvite(c){
 const p=techFor(c);if(!p)return say('Esta data não tem substituto/técnico atribuído.');
 const phone=normalizePhone(p.phone);if(!phone)return say('O substituto/técnico não tem telefone guardado no perfil.');
 try{
  const inviteUrl=await createShareLink(c);
  const text=`${messageFor(c,p,'new')}\n\n*ABRIR CONVITE E RESPONDER:*\n${inviteUrl}\n\nA resposta fica registada automaticamente na Team Duck.`;
  const wa=`https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  location.href=wa;
  return true;
 }catch(err){console.warn('share invite failed',err);say(err?.message||'Não foi possível criar o convite.');return false}
}
async function copyInviteLink(c){try{const url=await createShareLink(c);await navigator.clipboard.writeText(url);say('Link do convite copiado.')}catch(err){say(err?.message||'Não foi possível copiar o link.')}}
function permitted(){try{return typeof can!=='function'||can('concerts_manage')}catch(_){return true}}
async function refreshData(){try{const [cr,pr]=await Promise.all([
 sb.from('concerts').select('id,starts_at,ends_at,venue,city,work_position,technician_id,substitute_technician_id,principal_technician_id,owner_id,created_by,booking_status,status,closed,technician_response,technician_response_at,technician_response_source,invite_created_by,artists(name)').order('starts_at'),
 sb.from('profiles').select('id,full_name,email,phone,active').order('full_name')
]);if(cr.error)throw cr.error;if(pr.error)throw pr.error;cacheConcerts=cr.data||[];cacheProfiles=pr.data||[];return true}catch(err){console.warn('WhatsApp data refresh failed',err);return false}}
function button(text,action,type){const b=document.createElement('button');b.type='button';b.className='secondary tiny';b.textContent=text;b.dataset.whatsappAction=type;b.onclick=action;return b}
function attach(card,c){if(!card||!c||c.closed||!permitted())return;let actions=card.querySelector('.concert-actions');if(!actions){actions=document.createElement('div');actions.className='concert-actions';card.appendChild(actions)}actions.querySelectorAll('[data-whatsapp-action],[data-share-invite],[data-copy-invite]').forEach(x=>x.remove());const t=booking(c)==='cancelled'?'cancel':'new';if(t==='cancel')actions.appendChild(button('WhatsApp · Cancelamento',()=>openWhatsApp(c,'cancel'),'open'));else{actions.appendChild(button('Partilhar convite',()=>shareInvite(c),'share'));actions.appendChild(button('Copiar link',()=>copyInviteLink(c),'copy-link'))}if(t!=='cancel'){actions.appendChild(button('Enviar alteração',()=>openWhatsApp(c,'change'),'change'));actions.appendChild(button('Enviar lembrete',()=>openWhatsApp(c,'reminder'),'reminder'))}actions.appendChild(button('Copiar mensagem',()=>copyText(messageFor(c,techFor(c),t)),'copy'))}
async function decorate(){if(decorating)return;decorating=true;try{const host=q('concerts');if(!host)return;if(!cacheConcerts.length)await refreshData();const cards=[...host.querySelectorAll(':scope > .item')];cards.forEach((card,i)=>attach(card,cacheConcerts[i]))}finally{decorating=false}}
async function detectNewAfterSubmit(){await refreshData();lastIds=new Set(cacheConcerts.map(c=>String(c.id)));setTimeout(async()=>{const before=new Set(lastIds);await refreshData();const added=cacheConcerts.filter(c=>!before.has(String(c.id))).sort((a,b)=>new Date(b.starts_at)-new Date(a.starts_at))[0];lastIds=new Set(cacheConcerts.map(c=>String(c.id)));await decorate();if(targetTechId(added)){const p=techFor(added);if(p&&confirm(`Data criada para ${p.full_name||p.email}.\n\nQueres partilhar já o pedido de disponibilidade por WhatsApp?`))shareInvite(added)}},1400)}
function observeAgenda(){const host=q('concerts');if(!host||host.dataset.whatsappObserved)return;host.dataset.whatsappObserved='1';new MutationObserver(()=>setTimeout(async()=>{await refreshData();decorate()},80)).observe(host,{childList:true,subtree:false})}
function wire(){observeAgenda();q('concertForm')?.addEventListener('submit',detectNewAfterSubmit);document.querySelectorAll('#nav button[data-page="agenda"]').forEach(b=>b.addEventListener('click',()=>setTimeout(async()=>{await refreshData();decorate()},180)))}
window.TeamDuckWhatsApp={open:openWhatsApp,shareInvite,copyInviteLink,messageFor,copyText,refresh:async()=>{await refreshData();await decorate()}};
addEventListener('load',async()=>{wire();await refreshData();lastIds=new Set(cacheConcerts.map(c=>String(c.id)));await decorate();setTimeout(decorate,700);setTimeout(decorate,1600)});
})();