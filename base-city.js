(()=>{
const q=id=>document.getElementById(id);
let timer=null;
const getTeam=()=>{try{return Array.isArray(team)?team:[]}catch(_){return[]}};
const roleText=r=>{try{return typeof roleLabel==='function'?roleLabel(r):({admin:'Administrador',partner:'Parceiro',substitute:'Substituto'}[r]||r||'Membro')}catch(_){return r||'Membro'}};
function injectFields(){
  const invitePhone=q('invitePhone')?.closest('label');
  if(invitePhone&&!q('inviteBaseCity')) invitePhone.insertAdjacentHTML('afterend','<label>Cidade base<input id="inviteBaseCity" autocomplete="address-level2" placeholder="Ex.: Lisboa, Porto, Arouca"></label>');
  const memberPhone=q('memberPhone')?.closest('label');
  if(memberPhone&&!q('memberBaseCity')) memberPhone.insertAdjacentHTML('afterend','<label>Cidade base<input id="memberBaseCity" autocomplete="address-level2" placeholder="Ex.: Lisboa, Porto, Arouca"></label>');
}
function currentMember(){const id=q('memberId')?.value;return getTeam().find(p=>String(p.id)===String(id))||null}
function fillMemberCity(){const p=currentMember(),el=q('memberBaseCity');if(p&&el&&document.activeElement!==el)el.value=p.base_city||''}
async function persistMemberCity(){const p=currentMember(),el=q('memberBaseCity');if(!p||!el)return;const city=el.value.trim()||null;try{const r=await sb.from('profiles').update({base_city:city}).eq('id',p.id);if(r.error)console.warn('Cidade base não atualizada:',r.error.message)}catch(err){console.warn('Cidade base não atualizada:',err)}}
function decorateTeam(){for(const p of getTeam()){const card=document.querySelector(`[data-member="${p.id}"]`);if(!card)continue;const small=card.querySelector('small');if(!small)continue;const city=String(p.base_city||'').trim();card.dataset.baseCityLabel=city?`${p.full_name||p.email||'Membro'} · ${city}`:'';if(city){const marker=`${city} · `;if(!small.textContent.startsWith(marker))small.textContent=`${marker}${roleText(p.role)} · ${p.active===false?'inativo':'ativo'}`}}}
function decorateSubstituteChoices(){document.querySelectorAll('[data-tech-id],[data-substitute-id]').forEach(el=>{const id=el.dataset.techId||el.dataset.substituteId,p=getTeam().find(x=>String(x.id)===String(id));if(!p)return;const city=String(p.base_city||'').trim();let s=el.querySelector(':scope > .td-base-city');if(!city){s?.remove();return}if(!s){s=document.createElement('small');s.className='td-base-city';el.appendChild(s)}if(s.textContent!==city)s.textContent=city})}
function wireForms(){injectFields();const md=q('memberDialog');if(md&&!md.dataset.baseCityWired){md.dataset.baseCityWired='1';md.addEventListener('toggle',fillMemberCity);new MutationObserver(()=>{if(md.open)fillMemberCity()}).observe(md,{attributes:true,attributeFilter:['open']})}const mf=q('memberForm');if(mf&&!mf.dataset.baseCityWired){mf.dataset.baseCityWired='1';mf.addEventListener('submit',()=>setTimeout(persistMemberCity,120))}}
function refresh(){wireForms();fillMemberCity();decorateTeam();decorateSubstituteChoices()}
function schedule(ms=80){clearTimeout(timer);timer=setTimeout(refresh,ms)}
function observe(id){const host=q(id);if(!host||host.dataset.baseCityObserved)return;host.dataset.baseCityObserved='1';new MutationObserver(m=>{if(m.some(x=>x.addedNodes.length||x.removedNodes.length))schedule(120)}).observe(host,{childList:true,subtree:true})}
function boot(){refresh();['teamList','substituteAvailability','tdAvailabilityChoices'].forEach(observe);setTimeout(()=>{['teamList','substituteAvailability','tdAvailabilityChoices'].forEach(observe);refresh()},600);if(typeof window.loadAll==='function'&&!window.__baseCityLoadAllPatched){const old=window.loadAll;window.loadAll=async function(...args){const r=await old.apply(this,args);schedule(120);return r};window.__baseCityLoadAllPatched=true}}
if(document.readyState==='loading')addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.TeamDuckBaseCity={refresh:()=>schedule(0)};
})();
