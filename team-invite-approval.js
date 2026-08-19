(()=>{
const PROD_ORIGIN='https://rosas-sound-eng-v3.vercel.app';
async function renderInviteApprovals(){
 try{
  if(typeof can!=='function'||!can('team_manage')) return;
  const host=document.getElementById('inviteList'); if(!host) return;
  const {data,error}=await sb.from('team_invitations').select('*').order('created_at',{ascending:false});
  if(error) return;
  const rows=data||[]; invites=rows;
  host.innerHTML=rows.map(i=>{
   let state='pendente',actions='';
   if(i.approved_at||i.accepted_at) state='validado';
   else if(i.rejected_at) state='recusado';
   else if(i.revoked_at) state='cancelado';
   else if(new Date(i.expires_at)<new Date()) state='expirado';
   else if(i.submitted_at&&i.user_id){
    state='AGUARDA VALIDAÇÃO';
    actions=`<div class="invite-actions"><button type="button" class="tiny invite-approve" data-invite-action="approve" data-invite-id="${i.id}">✓ Validar</button><button type="button" class="danger tiny" data-invite-action="reject" data-invite-id="${i.id}">✕ Recusar</button></div>`;
   }else{
    state='convite enviado · aguarda registo';
    actions=`<div class="invite-actions"><button type="button" class="secondary tiny" data-invite-copy="${i.id}">Copiar link</button><button type="button" class="danger tiny" data-invite-action="revoke" data-invite-id="${i.id}">Cancelar convite</button></div>`;
   }
   return `<article class="item invite-admin-card"><div><strong>${esc(i.email)}</strong><small>${roleLabel(i.role)} · ${state}</small></div>${actions}</article>`;
  }).join('')||'<div class="empty">Sem convites.</div>';
  host.querySelectorAll('[data-invite-copy]').forEach(b=>b.onclick=()=>copyInviteLink(b.dataset.inviteCopy));
  host.querySelectorAll('[data-invite-action]').forEach(b=>b.onclick=()=>reviewInvite(b.dataset.inviteId,b.dataset.inviteAction));
 }catch(e){console.error(e)}
}
async function copyInviteLink(id){
 const i=(invites||[]).find(x=>x.id===id);if(!i)return;
 const url=`${PROD_ORIGIN}/?invite=${encodeURIComponent(i.token)}`;
 try{await navigator.clipboard.writeText(url);toast('Link do convite copiado.')}catch(_){window.prompt('Copiar link do convite:',url)}
}
async function reviewInvite(id,action){
 const labels={approve:'validar este membro',reject:'recusar este pedido',revoke:'cancelar este convite'};
 if(!confirm(`Queres ${labels[action]||'continuar'}?`)) return;
 const buttons=[...document.querySelectorAll(`[data-invite-id="${id}"]`)];buttons.forEach(b=>b.disabled=true);
 const r=await sb.functions.invoke('review-team-invite',{body:{id,action}});
 if(r.error||!r.data?.ok){toast(r.data?.error||r.error?.message||'Não foi possível tratar o pedido.');buttons.forEach(b=>b.disabled=false);return}
 toast(action==='approve'?'Membro validado e acesso ativado.':action==='reject'?'Pedido recusado.':'Convite cancelado.');
 if(typeof loadAll==='function') await loadAll();
 await renderInviteApprovals();
}
async function blockUnapprovedSession(){
 try{
  const {data:{user}}=await sb.auth.getUser(); if(!user) return;
  const {data:p}=await sb.from('profiles').select('active').eq('id',user.id).maybeSingle();
  if(p&&p.active===false){
   const app=document.getElementById('app'),login=document.getElementById('login');
   if(app) app.classList.add('hidden'); if(login) login.classList.remove('hidden');
   const err=document.getElementById('loginError'); if(err) err.textContent='Registo recebido. Aguarda validação do administrador para entrares.';
   await sb.auth.signOut({scope:'local'});
  }
 }catch(e){console.error(e)}
}
function addInviteStyles(){
 if(document.getElementById('teamInviteApprovalStyle'))return;
 const s=document.createElement('style');s.id='teamInviteApprovalStyle';s.textContent=`.invite-admin-card{align-items:center;gap:12px}.invite-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}.invite-actions button{width:auto!important;min-width:0!important}.invite-approve{background:#00a650!important;border-color:#00a650!important;color:#fff!important}@media(max-width:600px){.invite-admin-card{align-items:flex-start;flex-direction:column}.invite-actions{width:100%;justify-content:flex-start}.invite-actions button{flex:1;min-height:42px!important}}`;document.head.appendChild(s)
}
if(typeof render==='function'){
 const baseRender=render;
 render=function(){baseRender();setTimeout(renderInviteApprovals,0)};
}
addInviteStyles();
sb.auth.onAuthStateChange(()=>setTimeout(blockUnapprovedSession,100));
addEventListener('load',()=>{setTimeout(renderInviteApprovals,250);setTimeout(renderInviteApprovals,900);setTimeout(blockUnapprovedSession,500)});
})();