(()=>{
function applyTeamDuckBackground(){
  const chunks=window.__teamDuckBg;
  if(!chunks||chunks.length!==10)return;
  try{
    const raw=atob(chunks.join(''));
    const bytes=new Uint8Array(raw.length);
    for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
    const url=URL.createObjectURL(new Blob([bytes],{type:'image/webp'}));
    const mobile=window.matchMedia('(max-width:600px)').matches;
    const app=document.getElementById('app');
    if(app){app.style.backgroundImage=`linear-gradient(rgba(3,10,5,.58),rgba(3,10,5,.78)),url("${url}")`;app.style.backgroundSize='cover';app.style.backgroundPosition='center top';app.style.backgroundRepeat='no-repeat';app.style.backgroundAttachment=mobile?'scroll':'fixed';app.style.minHeight='100vh'}
    ['login','inviteScreen'].forEach(id=>{const el=document.getElementById(id);if(!el)return;el.style.backgroundImage=`linear-gradient(rgba(3,10,5,.38),rgba(3,10,5,.62)),url("${url}")`;el.style.backgroundSize='cover';el.style.backgroundPosition='center';el.style.backgroundRepeat='no-repeat';el.style.backgroundAttachment=mobile?'scroll':'fixed'});
    window.__teamDuckBackgroundUrl=url;
  }catch(err){console.warn('Team Duck background could not be applied',err)}
}
function loadStyle(src,key){if(document.querySelector(`link[data-team-duck-style="${key}"]`))return;const l=document.createElement('link');l.rel='stylesheet';l.href=src;l.dataset.teamDuckStyle=key;document.head.appendChild(l)}
function loadScript(src,key,onload){if(document.querySelector(`script[data-team-duck-extra="${key}"]`)){onload?.();return}const s=document.createElement('script');s.src=src;s.dataset.teamDuckExtra=key;if(onload)s.onload=onload;document.body.appendChild(s)}
addEventListener('load',()=>{applyTeamDuckBackground();loadStyle('premium-ui.css?v=20260819-premium1','premium-ui');loadScript('dual-assignments.js?v=20260819-final1','dual-assignments',()=>{setTimeout(()=>window.TeamDuckAssignments?.refresh?.(),50)});loadScript('finance-summary.js?v=20260819-final1','finance-summary',()=>{setTimeout(()=>window.TeamDuckFinance?.refresh?.(),50)});loadScript('role-layout.js?v=20260819-final1','role-layout',()=>{setTimeout(()=>window.TeamDuckRoleLayout?.apply?.(),80)});loadScript('profile-images.js?v=20260820-images2','profile-images',()=>{setTimeout(()=>window.TeamDuckImages?.enhance?.(),120)})});
})();