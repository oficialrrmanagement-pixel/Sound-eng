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
    if(app){
      app.style.backgroundImage=`linear-gradient(rgba(3,10,5,.58),rgba(3,10,5,.78)),url("${url}")`;
      app.style.backgroundSize='cover';
      app.style.backgroundPosition='center top';
      app.style.backgroundRepeat='no-repeat';
      app.style.backgroundAttachment=mobile?'scroll':'fixed';
      app.style.minHeight='100vh';
    }
    ['login','inviteScreen'].forEach(id=>{
      const el=document.getElementById(id);
      if(!el)return;
      el.style.backgroundImage=`linear-gradient(rgba(3,10,5,.32),rgba(3,10,5,.58)),url("${url}")`;
      el.style.backgroundSize='cover';
      el.style.backgroundPosition='center center';
      el.style.backgroundRepeat='no-repeat';
      el.style.backgroundAttachment=mobile?'scroll':'fixed';
    });
    window.__teamDuckBackgroundUrl=url;
  }catch(err){console.warn('Team Duck background could not be applied',err)}
}
addEventListener('load',applyTeamDuckBackground);
})();