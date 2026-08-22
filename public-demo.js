(()=>{
const params=new URLSearchParams(location.search);
if(params.get('demo')!=='1')return;
const KEY='team-duck-demo-mode';
sessionStorage.setItem(KEY,'1');
window.__TEAM_DUCK_PUBLIC_DEMO=true;
const perms={artists_manage:true,files_manage:true,concerts_manage:true,financials_view:true,documents_manage:true,team_manage:true};
function forceDemoVisible(){try{me={id:'demo-admin',full_name:'Team Duck Demo',email:'demo@teamduck.invalid',role:'admin',active:true,permissions:perms};appVisible=true}catch(_){}
const login=document.getElementById('login'),invite=document.getElementById('inviteScreen'),app=document.getElementById('app');login?.classList.add('hidden');invite?.classList.add('hidden');app?.classList.remove('hidden');document.body.dataset.publicDemo='1';}
forceDemoVisible();
addEventListener('load',forceDemoVisible,{once:true});
let n=0;const guard=setInterval(()=>{forceDemoVisible();if(window.TeamDuckDemo?.refresh)window.TeamDuckDemo.refresh();if(++n>20)clearInterval(guard)},250);
document.addEventListener('click',e=>{if(!window.__TEAM_DUCK_PUBLIC_DEMO)return;const t=e.target.closest('button');if(!t)return;if(t.id==='logout'){e.preventDefault();e.stopImmediatePropagation();location.href=location.pathname;return}if(t.matches('#newMember,#newArtist,#newConcert,[data-paid],[data-invoice],[data-deletefile]')){e.preventDefault();e.stopImmediatePropagation();window.toast?.('Modo demonstração: nenhuma alteração é gravada.')}},true);
})();