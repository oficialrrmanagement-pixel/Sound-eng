(()=>{
const FLAG='teamduck-google-calendar-linking';
const SCOPE='openid email profile https://www.googleapis.com/auth/calendar.events';
function q(id){return document.getElementById(id)}
async function status(){
  try{
    const {data:{user}}=await sb.auth.getUser();if(!user)return;
    const r=await sb.from('calendar_connections').select('google_account_email,sync_enabled').eq('user_id',user.id).eq('provider','google').maybeSingle();
    const b=q('googleCalendarBtn');if(!b)return;
    if(r.data?.sync_enabled){b.textContent='Google Calendar ✓';b.title=r.data.google_account_email||'Google Calendar ligado'}
    else{b.textContent='Ligar Google Calendar';b.title='Liga uma vez para as datas aceites entrarem automaticamente no teu calendário'}
  }catch(_){ }
}
async function saveProviderTokens(session){
  if(!session?.provider_token)return false;
  const r=await sb.functions.invoke('save-google-calendar-token',{body:{access_token:session.provider_token,refresh_token:session.provider_refresh_token||null}});
  if(r.error||!r.data?.ok){toast('Não foi possível ligar o Google Calendar.');return false}
  localStorage.removeItem(FLAG);toast('Google Calendar ligado. As datas aceites passam a entrar automaticamente.');await status();return true
}
async function connect(){
  localStorage.setItem(FLAG,'1');
  const redirectTo=location.origin+location.pathname;
  const {error}=await sb.auth.linkIdentity({provider:'google',options:{scopes:SCOPE,redirectTo,queryParams:{access_type:'offline',prompt:'consent'}}});
  if(error){localStorage.removeItem(FLAG);toast('Não foi possível abrir a ligação Google: '+error.message)}
}
function inject(){
  const header=document.querySelector('#app header');if(!header||q('googleCalendarBtn'))return;
  const logout=q('logout');const b=document.createElement('button');b.id='googleCalendarBtn';b.type='button';b.className='ghost';b.textContent='Ligar Google Calendar';b.onclick=connect;
  if(logout)header.insertBefore(b,logout);else header.appendChild(b);status();
}
sb.auth.onAuthStateChange(async(_event,session)=>{
  if(localStorage.getItem(FLAG)==='1'&&session?.provider_token)await saveProviderTokens(session);
  setTimeout(inject,50);
});
addEventListener('load',async()=>{
  inject();
  const {data:{session}}=await sb.auth.getSession();
  if(localStorage.getItem(FLAG)==='1'&&session?.provider_token)await saveProviderTokens(session);
  setTimeout(inject,500);
});
})();