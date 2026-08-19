(()=>{
const PROD_ORIGIN='https://teamduck.app';
function recoveryUrl(){
  const host=(location.hostname||'').toLowerCase();
  const local=host==='localhost'||host==='127.0.0.1'||host==='';
  const origin=local?PROD_ORIGIN:location.origin;
  return origin.replace(/\/$/,'')+'/?recovery=1';
}
function ensureRecoveryUI(){
  const loginForm=document.getElementById('loginForm');
  if(loginForm&&!document.getElementById('forgotPasswordBtn')){
    const btn=document.createElement('button');btn.type='button';btn.id='forgotPasswordBtn';btn.className='ghost';btn.textContent='Esqueci-me da password';btn.style.marginTop='10px';loginForm.appendChild(btn);btn.onclick=sendReset;
  }
  if(!document.getElementById('resetPasswordDialog')){
    document.body.insertAdjacentHTML('beforeend',`<dialog id="resetPasswordDialog"><form id="resetPasswordForm"><h3>Definir nova password</h3><p class="muted">Escolhe uma nova password para a tua conta Team Duck.</p><label>Nova password<input id="newPassword" type="password" minlength="8" required></label><label>Confirmar password<input id="newPassword2" type="password" minlength="8" required></label><p id="resetPasswordError" class="error"></p><div class="actions"><button type="button" id="resetPasswordCancel">Cancelar</button><button type="submit">Guardar nova password</button></div></form></dialog>`);
    document.getElementById('resetPasswordCancel').onclick=()=>document.getElementById('resetPasswordDialog').close();document.getElementById('resetPasswordForm').onsubmit=saveNewPassword;
  }
}
async function sendReset(){
  const email=(document.getElementById('email')?.value||'').trim();if(!email)return toast('Escreve primeiro o teu e-mail.');
  const btn=document.getElementById('forgotPasswordBtn');btn.disabled=true;btn.textContent='A enviar…';
  try{const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:recoveryUrl()});if(error)return toast('Não foi possível enviar o e-mail: '+error.message);toast('E-mail de recuperação enviado. Verifica a caixa de entrada e o spam.');}
  finally{btn.disabled=false;btn.textContent='Esqueci-me da password'}
}
async function saveNewPassword(e){
  e.preventDefault();const p1=document.getElementById('newPassword').value,p2=document.getElementById('newPassword2').value,err=document.getElementById('resetPasswordError');err.textContent='';
  if(p1.length<8){err.textContent='A password deve ter pelo menos 8 caracteres.';return}if(p1!==p2){err.textContent='As passwords não coincidem.';return}
  const b=e.submitter;b.disabled=true;b.textContent='A guardar…';try{const {error}=await sb.auth.updateUser({password:p1});if(error){err.textContent=error.message;return}document.getElementById('resetPasswordDialog').close();toast('Password alterada com sucesso. Já podes entrar com a nova password.');history.replaceState({},document.title,location.pathname);await sb.auth.signOut({scope:'local'});showLogin();}finally{b.disabled=false;b.textContent='Guardar nova password'}
}
function openRecoveryDialog(){ensureRecoveryUI();document.getElementById('login')?.classList.remove('hidden');document.getElementById('app')?.classList.add('hidden');const d=document.getElementById('resetPasswordDialog');if(d&&!d.open)d.showModal()}
addEventListener('load',()=>{ensureRecoveryUI();sb.auth.onAuthStateChange((event)=>{if(event==='PASSWORD_RECOVERY')setTimeout(openRecoveryDialog,50)});const hash=location.hash||'',qs=location.search||'';if(hash.includes('type=recovery')||qs.includes('type=recovery')||qs.includes('recovery=1'))setTimeout(openRecoveryDialog,300)});
})();