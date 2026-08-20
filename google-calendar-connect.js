(()=>{
const CAL_SCOPE='openid email profile https://www.googleapis.com/auth/calendar.events';
const RETURN_KEY='teamduck-google-link-return';
function q(id){return document.getElementById(id)}
function safeReturnUrl(){
 const u=new URL(location.href);u.hash='';u.search='';
 return u.origin+u.pathname;
}
async function status(){
 try{
  const {data:{user}}=await sb.auth.getUser();if(!user)return;
  const r=await sb.from('calendar_connections').select('google_account_email,sync_enabled,gmail_send_enabled').eq('user_id',user.id).eq('provider','google').maybeSingle();
  const b=q('googleCalendarBtn');if(!b)return;
  if(r.data?.sync_enabled){b.textContent='Calendar ✓';b.title=`Google Calendar ligado${r.data.google_account_email?' · '+r.data.google_account_email:''}`}
  else{b.textContent='Ligar Calendar';b.title='Liga o teu Google Calendar a esta conta Team Duck'}
 }catch(_){}
}
async function saveProviderTokens(session,{quiet=false}={}){
 if(!session?.provider_token)return false;
 const identities=await sb.auth.getUserIdentities().catch(()=>({data:null}));
 const googleIdentity=identities?.data?.identities?.find?.(x=>x.provider==='google');
 const r=await sb.functions.invoke('save-google-connection',{body:{access_token:session.provider_token,refresh_token:session.provider_refresh_token||null,google_identity_id:googleIdentity?.id||null}});
 if(r.error||!r.data?.ok){if(!quiet)toast('Não foi possível concluir a ligação Google.');return false}
 if(r.data.calendar){toast('Google Calendar ligado.');await status();return true}
 if(!quiet)toast('A conta Google foi ligada, mas falta autorização do Calendar.');return false
}
async function connect(){
 try{
  const {data:{user}}=await sb.auth.getUser();if(!user)return toast('Inicia sessão primeiro.');
  sessionStorage.setItem(RETURN_KEY,safeReturnUrl());
  const redirectTo=safeReturnUrl()+'?google_link=calendar';
  const {data,error}=await sb.auth.linkIdentity({provider:'google',options:{scopes:CAL_SCOPE,redirectTo,queryParams:{access_type:'offline',prompt:'consent',include_granted_scopes:'true'}}});
  if(error)throw error;
  if(data?.url)location.href=data.url;
 }catch(e){
  const m=String(e?.message||e||'');
  if(/manual.*link/i.test(m)||/linking.*disabled/i.test(m))toast('A ligação segura de contas Google precisa de ativar Identity Linking no Supabase.');
  else toast('Não foi possível abrir a ligação Google: '+m);
 }
}
async function handleReturn(){
 const params=new URLSearchParams(location.search);
 const returning=params.get('google_link')==='calendar';
 const {data:{session}}=await sb.auth.getSession();
 if(session?.provider_token)await saveProviderTokens(session,{quiet:!returning});
 if(returning){
  params.delete('google_link');
  const clean=location.pathname+(params.toString()?'?'+params.toString():'');
  history.replaceState({},'',clean);
 }
}
function inject(){
 const header=document.querySelector('#app header');if(!header||q('googleCalendarBtn'))return;
 const logout=q('logout');const b=document.createElement('button');b.id='googleCalendarBtn';b.type='button';b.className='ghost google-calendar-btn';b.textContent='Ligar Calendar';b.onclick=connect;
 if(logout)header.insertBefore(b,logout);else header.appendChild(b);status()
}
function style(){if(q('googleCalendarStyle'))return;const s=document.createElement('style');s.id='googleCalendarStyle';s.textContent=`#app header{gap:8px}.google-calendar-btn{font-size:14px!important;line-height:1.1!important;padding:9px 11px!important;min-height:38px!important;max-width:130px!important;white-space:normal!important}#logout{font-size:14px!important;padding:9px 12px!important;min-height:38px!important}@media(max-width:600px){#app header .brand{min-width:0;flex:1}#app header .brand img{width:42px!important;height:42px!important}#app header .brand strong{font-size:18px!important}#app header .brand small{font-size:12px!important}.google-calendar-btn{font-size:12px!important;padding:7px 8px!important;max-width:94px!important}#logout{font-size:12px!important;padding:7px 9px!important}}`;document.head.appendChild(s)}
sb.auth.onAuthStateChange(async(_event,session)=>{if(session?.provider_token)await saveProviderTokens(session,{quiet:true});setTimeout(()=>{style();inject();status()},50)});
addEventListener('load',async()=>{style();inject();await handleReturn();setTimeout(()=>{inject();status()},500)});
})();