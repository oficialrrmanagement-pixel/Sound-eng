(()=>{
const VAPID_PUBLIC='BG8_kI9hqNkpqSGkHKroXPEOFNW8fhCDxkDLuJFwEmzRMA_ySeRpgXGGG9pns1Y4pgrpn_60Fz7kuNmgiDZK8EU';
const BTN='teamDuckPushBtn';
function b64ToUint8(s){const p='='.repeat((4-s.length%4)%4),b=atob((s+p).replace(/-/g,'+').replace(/_/g,'/')),a=new Uint8Array(b.length);for(let i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return a}
function standalone(){return matchMedia('(display-mode: standalone)').matches||navigator.standalone===true}
async function reg(){if(!('serviceWorker'in navigator))throw new Error('Este telefone não suporta notificações da app.');return navigator.serviceWorker.register('/team-duck-sw.js?v=20260826-push1',{scope:'/'})}
async function currentUser(){const {data:{user}}=await sb.auth.getUser();return user}
async function saveSubscription(sub){const user=await currentUser();if(!user)throw new Error('Inicia sessão primeiro.');const j=sub.toJSON();const row={user_id:user.id,endpoint:j.endpoint,p256dh:j.keys?.p256dh,auth:j.keys?.auth,user_agent:navigator.userAgent,updated_at:new Date().toISOString()};const r=await sb.from('push_subscriptions').upsert(row,{onConflict:'user_id,endpoint'});if(r.error)throw r.error}
async function enable(){try{
  const user=await currentUser();if(!user)return toast('Inicia sessão primeiro.');
  if(!('Notification'in window)||!('PushManager'in window))return toast('Este dispositivo não suporta notificações push.');
  if(/iPhone|iPad|iPod/.test(navigator.userAgent)&&!standalone())return toast('No iPhone, abre a Team Duck pelo ícone no ecrã principal para ativar notificações.');
  const permission=await Notification.requestPermission();
  if(permission!=='granted')return toast('As notificações não foram autorizadas no telefone.');
  const r=await reg();
  let sub=await r.pushManager.getSubscription();
  if(!sub)sub=await r.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64ToUint8(VAPID_PUBLIC)});
  await saveSubscription(sub);toast('Notificações da Team Duck ativadas.');refresh();
 }catch(e){console.error(e);toast('Não foi possível ativar notificações: '+String(e?.message||e||''))}}
async function refresh(){const b=document.getElementById(BTN);if(!b)return;let active=false;try{if(Notification.permission==='granted'){const r=await reg();active=!!(await r.pushManager.getSubscription())}}catch(_){}b.textContent=active?'🔔 Notificações ✓':'🔔 Ativar notificações';b.dataset.active=active?'1':'0';b.title=active?'Receberás alertas de novas datas neste telefone':'Ativar alertas de novas datas neste telefone'}
function inject(){const nav=document.getElementById('nav');if(!nav||document.getElementById(BTN))return;const b=document.createElement('button');b.id=BTN;b.type='button';b.textContent='🔔 Ativar notificações';b.addEventListener('click',enable);nav.appendChild(b);refresh()}
async function maintain(){try{if(Notification.permission!=='granted')return;const user=await currentUser();if(!user)return;const r=await reg();const sub=await r.pushManager.getSubscription();if(sub)await saveSubscription(sub)}catch(e){console.warn('Team Duck push',e)}}
window.TeamDuckPush={enable,refresh,maintain};
addEventListener('load',()=>{inject();setTimeout(maintain,1800);setTimeout(inject,2500)});
sb.auth.onAuthStateChange(()=>setTimeout(()=>{inject();maintain();refresh()},300));
})();