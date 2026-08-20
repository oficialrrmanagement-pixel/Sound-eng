(()=>{
const q=id=>document.getElementById(id);
function injectFields(){
  const invitePhone=q('invitePhone')?.closest('label');
  if(invitePhone&&!q('inviteBaseCity')) invitePhone.insertAdjacentHTML('afterend','<label>Cidade base<input id="inviteBaseCity" placeholder="Ex.: Lisboa, Porto, Arouca"></label>');
  const memberPhone=q('memberPhone')?.closest('label');
  if(memberPhone&&!q('memberBaseCity')) memberPhone.insertAdjacentHTML('afterend','<label>Cidade base<input id="memberBaseCity" placeholder="Ex.: Lisboa, Porto, Arouca"></label>');
}
function currentMember(){const id=q('memberId')?.value;return (team||[]).find(p=>String(p.id)===String(id))||null}
function fillMemberCity(){const p=currentMember();if(p&&q('memberBaseCity'))q('memberBaseCity').value=p.base_city||''}
async function persistMemberCity(){const p=currentMember(),city=q('memberBaseCity')?.value?.trim()||null;if(!p)return;const r=await sb.from('profiles').update({base_city:city}).eq('id',p.id);if(r.error)console.warn('Cidade base não atualizada:',r.error.message)}
async function persistInviteCity(){const city=q('inviteBaseCity')?.value?.trim();if(!city)return;setTimeout(async()=>{try{const {data:{user}}=await sb.auth.getUser();if(user)await sb.from('profiles').update({base_city:city}).eq('id',user.id)}catch(_){ }},1200)}
function decorateTeam(){for(const p of team||[]){const card=document.querySelector(`[data-member="${p.id}"]`);if(!card)continue;const small=card.querySelector('small');if(!small)continue;const city=p.base_city?.trim();if(city&&!small.dataset.baseCityDone){small.dataset.baseCityDone='1';const name=p.full_name||p.email||'Membro';small.textContent=`${city} · ${roleLabel(p.role)} · ${p.active?'ativo':'inativo'}`;card.dataset.baseCityLabel=`${name} · ${city}`}}
}
function decorateSubstituteChoices(){document.querySelectorAll('[data-tech-id],.td-tech-person,[data-substitute-id]').forEach(el=>{const id=el.dataset.techId||el.dataset.substituteId;const p=(team||[]).find(x=>String(x.id)===String(id));if(!p)return;const city=p.base_city?.trim();if(city&&!el.querySelector('.td-base-city')){const s=document.createElement('small');s.className='td-base-city';s.textContent=city;el.appendChild(s)}})}
function wire(){injectFields();const md=q('memberDialog');if(md&&!md.dataset.baseCityWired){md.dataset.baseCityWired='1';new MutationObserver(fillMemberCity).observe(md,{attributes:true,attributeFilter:['open']})}
const mf=q('memberForm');if(mf&&!mf.dataset.baseCityWired){mf.dataset.baseCityWired='1';mf.addEventListener('submit',()=>setTimeout(persistMemberCity,80))}
const ia=q('inviteAcceptForm');if(ia&&!ia.dataset.baseCityWired){ia.dataset.baseCityWired='1';ia.addEventListener('submit',persistInviteCity)}
decorateTeam();decorateSubstituteChoices()}
new MutationObserver(()=>setTimeout(wire,30)).observe(document.body,{childList:true,subtree:true});
if(document.readyState==='loading')addEventListener('load',()=>setTimeout(wire,300),{once:true});else wire();
window.TeamDuckBaseCity={refresh:wire};
})();