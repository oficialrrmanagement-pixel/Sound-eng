(()=>{
const q=id=>document.getElementById(id);
const STATUS={confirmed:'Confirmado',reserved:'Reservado',cancelled:'Cancelado'};
function techFor(c){return (window.team||team||[]).find(p=>String(p.id)===String(c.technician_id))||null}
function normalizePhone(raw){let d=String(raw||'').replace(/\D/g,'');if(d.startsWith('00'))d=d.slice(2);if(d.length===9)d='351'+d;return d}
function dateParts(c){const d=new Date(c.starts_at);return {date:d.toLocaleDateString('pt-PT',{weekday:'long',day:'2-digit',month:'2-digit',year:'numeric'}),time:d.toLocaleTimeString('pt-PT',{hour:'2-digit',minute:'2-digit'})}}
function booking(c){return c.booking_status||((c.status==='cancelled')?'cancelled':(c.status==='confirmed'?'confirmed':'reserved'))}
function place(c){const a=[c.venue,c.city].filter(Boolean);return a.length?a.join(' · '):'Por definir'}
function firstName(p){const name=(p?.full_name||p?.email||'').trim();return name.split(/\s+/)[0]||'Olá'}
function core(c){const d=dateParts(c);return `🎤 *Artista:* ${c.artists?.name||'Trabalho'}\n📅 *Data:* ${d.date}\n🕒 *Hora:* ${d.time}\n📍 *Local:* ${place(c)}\n🎚 *Função:* ${c.work_position||'Por definir'}\n📌 *Estado:* ${STATUS[booking(c)]||booking(c)}`}
function messageFor(c,p,type='new'){
 const hi=`Olá ${firstName(p)},`;
 if(type==='change')return `${hi}\n\n🦆 *TEAM DUCK — ALTERAÇÃO DE DATA*\n\nHouve uma atualização nesta data de trabalho. Confirma, por favor, os novos dados:\n\n${core(c)}\n\nSe houver algum problema com esta alteração, avisa-me assim que possível.\n\nObrigado.`;
 if(type==='reminder')return `${hi}\n\n🦆 *TEAM DUCK — LEMBRETE DE TRABALHO*\n\nSó para relembrar a seguinte data:\n\n${core(c)}\n\nObrigado e até lá.`;
 if(type==='cancel')return `${hi}\n\n🦆 *TEAM DUCK — CANCELAMENTO DE DATA*\n\nEsta data foi *cancelada*:\n\n${core(c)}\n\nFica sem efeito na agenda. Obrigado pela disponibilidade.`;
 return `${hi}\n\n🦆 *TEAM DUCK — NOVA DATA DE TRABALHO*\n\nFoi-te atribuída a seguinte data:\n\n${core(c)}\n\nConfirma, por favor, a tua disponibilidade para esta data.\n\nObrigado.`;
}
async function copyText(text){try{await navigator.clipboard.writeText(text);toast('Mensagem copiada.')}catch(_){toast('Não foi possível copiar a mensagem.')}}
function openWhatsApp(c,type='new'){
 const p=techFor(c);if(!p)return toast('Esta data não tem técnico atribuído.');
 const phone=normalizePhone(p.phone);if(!phone)return toast('O técnico não tem telefone guardado no perfil.');
 const url=`https://wa.me/${phone}?text=${encodeURIComponent(messageFor(c,p,type))}`;window.open(url,'_blank','noopener');
}
function promptAfterCreate(c){
 if(!c?.technician_id)return;const p=techFor(c);if(!p)return;
 setTimeout(()=>{if(confirm(`Data criada para ${p.full_name||p.email}.\n\nQueres enviar já por WhatsApp?`))openWhatsApp(c,'new')},120);
}
function ensureActions(card,c){
 if(!card||!c||c.closed)return;let actions=card.querySelector('.concert-actions');if(!actions){actions=document.createElement('div');actions.className='concert-actions';card.appendChild(actions)}
 actions.querySelectorAll('[data-whatsapp-action]').forEach(x=>x.remove());if(!can('concerts_manage'))return;
 const type=booking(c)==='cancelled'?'cancel':'new';
 const wa=document.createElement('button');wa.type='button';wa.className='secondary tiny';wa.dataset.whatsappAction='open';wa.textContent=type==='cancel'?'WhatsApp · Cancelamento':'WhatsApp';wa.onclick=()=>openWhatsApp(c,type);actions.appendChild(wa);
 if(type!=='cancel'){
  const ch=document.createElement('button');ch.type='button';ch.className='secondary tiny';ch.dataset.whatsappAction='change';ch.textContent='Enviar alteração';ch.onclick=()=>openWhatsApp(c,'change');actions.appendChild(ch);
  const rem=document.createElement('button');rem.type='button';rem.className='secondary tiny';rem.dataset.whatsappAction='reminder';rem.textContent='Enviar lembrete';rem.onclick=()=>openWhatsApp(c,'reminder');actions.appendChild(rem);
 }
 const cp=document.createElement('button');cp.type='button';cp.className='secondary tiny';cp.dataset.whatsappAction='copy';cp.textContent='Copiar mensagem';cp.onclick=()=>copyText(messageFor(c,techFor(c),type));actions.appendChild(cp);
}
function decorate(){const host=q('concerts');if(!host)return;const cards=[...host.querySelectorAll(':scope > .item')];cards.forEach((card,i)=>ensureActions(card,(window.concerts||concerts||[])[i]))}
function patchCreateFlow(){
 const form=q('concertForm');if(!form||form.dataset.whatsappCreatePatched||typeof form.onsubmit!=='function')return false;
 const old=form.onsubmit;form.dataset.whatsappCreatePatched='1';
 form.onsubmit=async function(e){
  const before=new Set((window.concerts||concerts||[]).map(c=>String(c.id)));
  await old.call(this,e);
  const added=(window.concerts||concerts||[]).filter(c=>!before.has(String(c.id))).sort((a,b)=>new Date(b.starts_at)-new Date(a.starts_at))[0];
  if(added)promptAfterCreate(added);
 };
 return true;
}
function patchLoadAll(){if(window.__whatsappDatesPatched||typeof window.loadAll!=='function')return;const old=window.loadAll;window.loadAll=async function(...args){const out=await old.apply(this,args);setTimeout(()=>{decorate();patchCreateFlow()},50);return out};window.__whatsappDatesPatched=true}
window.TeamDuckWhatsApp={open:openWhatsApp,messageFor,promptAfterCreate,copyText};
addEventListener('load',()=>{patchLoadAll();setTimeout(()=>{decorate();patchCreateFlow()},500);setTimeout(()=>{decorate();patchCreateFlow()},1200);setTimeout(patchCreateFlow,2200)});
})();