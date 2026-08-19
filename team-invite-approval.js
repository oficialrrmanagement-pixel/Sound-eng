(()=>{
async function renderInviteApprovals(){
 try{
  if(typeof can!=='function'||!can('team_manage')) return;
  const host=document.getElementById('inviteList'); if(!host) return;
  const {data,error}=await sb.from('team_invitations').select('*').order('created_at',{ascending:false});
  if(error) return;
  const rows=data||[];
  host.innerHTML=rows.map(i=>{
   let state='pendente',actions='';
   if(i.approved_at||i.accepted_at) state='validado';
   else if(i.rejected_at||i.revoked_at) state='recusado';
   else if(new Date(i.expires_at)<new Date()) state='expirado';
   else if(i.submitted_at){state='AGUARDA VALIDAÇÃO';actions=`<div class="file-actions"><button type="button" class="tiny" data-invite-approve="${i.id}">✓ Validar</button><button type="button" class="danger tiny" data-invite-reject="${i.id}">✕ Recusar</button></div>`}
   else state='convite enviado · aguarda registo';
   return `<article class="item"><div><strong>${esc(i.email)}</strong><small>${roleLabel(i.role)} · ${state}</small></div>${actions}</article>`;
  }).join('')||'<div class="empty">Sem convites.</div>';
  host.querySelectorAll('[data-invite-approve]').forEach(b=>b.onclick=()=>reviewInvite(b.dataset.inviteApprove,'approve'));
  host.querySelectorAll('[data-invite-reject]').forEach(b=>b.onclick=()=>reviewInvite(b.dataset.inviteReject,'reject'));
 }catch(e){console.error(e)}
}
async function reviewInvite(id,action){
 const label=action==='approve'?'validar':'recusar';
 if(!confirm(`Queres ${label} este pedido de entrada?`)) return;
 const r=await sb.functions.invoke('review-team-invite',{body:{id,action}});
 if(r.error||!r.data?.ok){toast(r.data?.error||r.error?.message||'Não foi possível tratar o pedido.');return}
 toast(action==='approve'?'Membro validado e acesso ativado.':'Pedido recusado.');
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
if(typeof render==='function'){
 const baseRender=render;
 render=function(){baseRender();setTimeout(renderInviteApprovals,0)};
}
sb.auth.onAuthStateChange(()=>setTimeout(blockUnapprovedSession,100));
addEventListener('load',()=>{setTimeout(renderInviteApprovals,400);setTimeout(blockUnapprovedSession,500)});
})();