(()=>{
const q=id=>document.getElementById(id);
const getConcerts=()=>{try{return Array.isArray(concerts)?concerts:[]}catch(_){return[]}};
const escSafe=v=>{try{return typeof esc==='function'?esc(v):String(v??'')}catch(_){return String(v??'')}};
const dtSafe=v=>{try{return typeof dt==='function'?dt(v):new Date(v).toLocaleString('pt-PT')}catch(_){return String(v??'')}};
const moneySafe=v=>{try{return typeof money==='function'?money(v):`${Number(v||0).toFixed(2)} €`}catch(_){return `${Number(v||0).toFixed(2)} €`}};
function canFinancials(){try{return typeof can==='function'?can('financials_view'):false}catch(_){return false}}
function renderAgendaActive(){const host=q('concerts');if(!host)return;const rows=getConcerts().filter(c=>!c.closed);host.innerHTML=rows.length?rows.map(c=>`<article class="item"><div><strong>${escSafe(c.artists?.name||'Trabalho')}</strong><small>${dtSafe(c.starts_at)} · ${escSafe(c.city||c.venue||'Local por definir')} · ${escSafe(c.work_position||'')}</small></div>${canFinancials()?`<span class="money">${moneySafe(c.fee_override)}</span>`:''}</article>`).join(''):'<div class="empty">Sem trabalhos.</div>'}
function patchRender(){if(window.__teamDuckFinalizedRenderPatched)return;const base=window.render;if(typeof base!=='function')return;window.render=function(...args){const r=base.apply(this,args);renderAgendaActive();setTimeout(()=>window.TeamDuckConcertView?.refresh?.(),0);return r};window.__teamDuckFinalizedRenderPatched=true}
function refresh(){renderAgendaActive();setTimeout(()=>window.TeamDuckConcertView?.refresh?.(),0)}
function boot(){patchRender();refresh();document.querySelector('#nav button[data-page="agenda"]')?.addEventListener('click',()=>setTimeout(refresh,20));document.querySelector('#nav button[data-page="closed"]')?.addEventListener('click',()=>setTimeout(()=>window.TeamDuckConcertView?.refresh?.(),20))}
if(document.readyState==='loading')addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.TeamDuckFinalizedWorkflow={refresh};
})();
