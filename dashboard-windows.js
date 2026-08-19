(()=>{
const q=id=>document.getElementById(id);
function startOfNextSunday(){const now=new Date();const d=new Date(now);d.setHours(0,0,0,0);const add=(7-d.getDay())%7||7;d.setDate(d.getDate()+add);return d}
function endOfNextSunday(start){const d=new Date(start);d.setDate(d.getDate()+7);d.setHours(23,59,59,999);return d}
function oneMonthFromToday(){const now=new Date();const d=new Date(now);d.setMonth(d.getMonth()+1);return d}
function card(c){return `<article class="item"><div><strong>${esc(c.artists?.name||'Trabalho')}</strong><small>${dt(c.starts_at)} · ${esc(c.city||c.venue||'Local por definir')} · ${esc(c.work_position||'')}</small></div>${can('financials_view')?`<span class="money">${money(c.fee_override)}</span>`:''}</article>`}
function renderWindows(){
 const nextHost=q('nextConcerts'); if(!nextHost)return;
 const weekStart=startOfNextSunday(),weekEnd=endOfNextSunday(weekStart),now=new Date(),monthEnd=oneMonthFromToday();
 const week=(concerts||[]).filter(c=>{const d=new Date(c.starts_at);return d>=weekStart&&d<=weekEnd&&!c.closed});
 const month=(concerts||[]).filter(c=>{const d=new Date(c.starts_at);return d>=now&&d<=monthEnd&&!c.closed});
 nextHost.innerHTML=`<section class="panel"><div class="title-row"><div><strong>Próxima semana</strong><small>Domingo a domingo</small></div><span>${week.length}</span></div><div class="list" style="margin-top:10px">${week.map(card).join('')||'<div class="empty">Sem trabalhos na próxima semana.</div>'}</div></section><details class="panel" id="nextMonthWindow"><summary style="cursor:pointer;font-weight:800">Próximo mês <span class="muted">(${month.length})</span></summary><small>De hoje até à mesma data do próximo mês</small><div class="list" style="margin-top:10px">${month.map(card).join('')||'<div class="empty">Sem trabalhos neste período.</div>'}</div></details>`;
 if(typeof window.openConcertView==='function'){setTimeout(()=>{const weekCards=[...nextHost.querySelectorAll('section .item')];weekCards.forEach((el,i)=>{const c=week[i];if(!c)return;el.onclick=()=>window.openConcertView(c.id)});const monthCards=[...nextHost.querySelectorAll('details .item')];monthCards.forEach((el,i)=>{const c=month[i];if(!c)return;el.onclick=()=>window.openConcertView(c.id)})},0)}
}
function patch(){if(window.__dashboardWindowsPatched||typeof window.loadAll!=='function')return;const original=window.loadAll;window.loadAll=async function(...args){const out=await original.apply(this,args);requestAnimationFrame(renderWindows);return out};window.__dashboardWindowsPatched=true}
addEventListener('load',()=>{patch();setTimeout(renderWindows,500)});
})();