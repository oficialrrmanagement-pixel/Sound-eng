(()=>{
const SCOPE='openid email profile https://www.googleapis.com/auth/calendar.events';
const PROD_ORIGIN='https://rosas-sound-eng-v3.vercel.app';
function q(id){return document.getElementById(id)}
async function status(){
 try{const {data:{user}}=await sb.auth.getUser();if(!user)return;const r=await sb.from('calendar_connections').select('google_account_email,sync_enabled').eq('user_id',user.id).eq('provider','google').maybeSingle();const b=q('googleCalendarBtn');if(!b)return;if(r.data?.sync_enabled){b.textContent='Calendar ✓';b.title=r.data.google_account_email||'Google Calendar ligado'}else{b.textContent='Ligar Calendar';b.title='Liga o Google Calendar'}}catch(_){}
}
async function saveProviderTokens(session,{quiet=false}={}){
 if(!session?.provider_token)return false;
 const r=await sb.functions.invoke('save-google-calendar-token',{body:{access_token:session.provider_token,refresh_token:session.provider_refresh_token||null}});
 if(r.error||!r.data?.ok){if(!quiet&&r.data?.error!=='Token sem permissão de Google Calendar')toast('Não foi possível concluir a ligação ao Google Calendar.');return false}
 toast('Google Calendar ligado.');await status();return true
}
async function connect(){
 const redirectTo=PROD_ORIGIN+'/';
 const {error}=await sb.auth.signInWithOAuth({provider:'google',options:{scopes:SCOPE,redirectTo,queryParams:{access_type:'offline',prompt:'consent',include_granted_scopes:'true'}}});
 if(error)toast('Não foi possível abrir o Google Calendar: '+error.message)
}
function inject(){const header=document.querySelector('#app header');if(!header||q('googleCalendarBtn'))return;const logout=q('logout');const b=document.createElement('button');b.id='googleCalendarBtn';b.type='button';b.className='ghost google-calendar-btn';b.textContent='Ligar Calendar';b.onclick=connect;if(logout)header.insertBefore(b,logout);else header.appendChild(b);status()}
function style(){if(q('googleCalendarStyle'))return;const s=document.createElement('style');s.id='googleCalendarStyle';s.textContent=`#app header{gap:8px}.google-calendar-btn{font-size:14px!important;line-height:1.1!important;padding:9px 11px!important;min-height:38px!important;max-width:130px!important;white-space:normal!important}#logout{font-size:14px!important;padding:9px 12px!important;min-height:38px!important}@media(max-width:600px){#app header .brand{min-width:0;flex:1}#app header .brand img{width:42px!important;height:42px!important}#app header .brand strong{font-size:18px!important}#app header .brand small{font-size:12px!important}.google-calendar-btn{font-size:12px!important;padding:7px 8px!important;max-width:94px!important}#logout{font-size:12px!important;padding:7px 9px!important}}`;document.head.appendChild(s)}
sb.auth.onAuthStateChange(async(_event,session)=>{if(session?.provider_token)await saveProviderTokens(session,{quiet:true});setTimeout(()=>{style();inject()},50)});
addEventListener('load',async()=>{style();inject();const {data:{session}}=await sb.auth.getSession();if(session?.provider_token)await saveProviderTokens(session,{quiet:true});setTimeout(inject,500)});
})();