(()=>{
let timer=null;
const q=id=>document.getElementById(id);
const getArtists=()=>{try{return Array.isArray(artists)?artists:[]}catch(_){return[]}};
const getTeam=()=>{try{return Array.isArray(team)?team:[]}catch(_){return[]}};
const isAdmin=()=>{try{return me?.role==='admin'}catch(_){return false}};
function refresh(){clearTimeout(timer);timer=setTimeout(()=>{
  const host=q('artistList');if(!host)return;
  host.querySelectorAll('.td-created-by').forEach(x=>x.remove());
  if(!isAdmin())return;
  const list=getArtists(),profiles=getTeam();
  [...host.querySelectorAll(':scope > .item')].forEach((card,i)=>{
    const a=list[i];if(!a?.created_by)return;
    const p=profiles.find(x=>String(x.id)===String(a.created_by));
    const name=p?.full_name||p?.email||'Utilizador';
    const target=card.querySelector('div')||card;
    const small=document.createElement('small');
    small.className='td-created-by';
    small.textContent=name;
    small.style.cssText='display:block;margin-top:4px;font-size:11px;line-height:1.2;color:#7f8b84;opacity:.9;font-weight:650;letter-spacing:.01em';
    target.appendChild(small);
  });
},40)}
function boot(){refresh();document.querySelectorAll('#nav button[data-page="artists"]').forEach(b=>b.addEventListener('click',()=>refresh()));if(typeof window.loadAll==='function'&&!window.__artistCreatorLoadPatched){const old=window.loadAll;window.loadAll=async function(...args){const r=await old.apply(this,args);refresh();return r};window.__artistCreatorLoadPatched=true}}
if(document.readyState==='loading')addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.TeamDuckArtistCreatedBy={refresh};
})();
