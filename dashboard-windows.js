(()=>{
const q=id=>document.getElementById(id);
function nextSunday(){const d=new Date();d.setHours(0,0,0,0);const days=(7-d.getDay())%7||7;d.setDate(d.getDate()+days);return d}
function sundayAfter(s){const d=new Date(s);d.setDate(d.getDate()+7);d.setHours(23,59,59,999);return d}
function monthEnd(){const d=new Date();d.setMonth(d.getMonth()+1);return d}
function card(c){return `<article class="item clickable" data-dash-concert="${c.id}"><div><strong>${esc(c.artists?.name||'Trabalho')}</strong><small>${dt(c.starts_at)} · ${esc(c.city||c.venue||'Local por definir')} · ${esc(c.work_position||'')}</small></div>${can('financials_view')?`<span class="money">${money(c.fee_override)}</span>`:''}</article>`}
function wire(host){host?.querySelectorAll('[data-dash-concert]').forEach(el=>el.onclick=()=>window.openConcertView?.(el.dataset.dashConcert))}
function renderWindows(){const w=q('nextWeekConcerts'),m=q('nextMonthConcerts'),count=q('nextMonthCount');if(!w||!m)return;const ws=nextSunday(),we=sundayAfter(ws),now=new Date(),me=monthEnd();const week=(concerts||[]).filter(c=>{const d=new Date(c.starts_at);return d>=ws&&d<=we&&!c.closed});const month=(concerts||[]).filter(c=>{const d=new Date(c.starts_at);return d>=now&&d<=me&&!c.closed});w.innerHTML=week.map(card).join('')||'<div class="empty">Sem trabalhos na próxima semana.</div>';m.innerHTML=month.map(card).join('')||'<div class="empty">Sem trabalhos no próximo mês.</div>';if(count)count.textContent=month.length;wire(w);wire(m)}
function patch(){if(window.__dashboardWindowsPatched||typeof window.loadAll!=='function')return;const original=window.loadAll;window.loadAll=async function(...args){const out=await original.apply(this,args);requestAnimationFrame(renderWindows);return out};window.__dashboardWindowsPatched=true}
addEventListener('load',()=>{patch();setTimeout(renderWindows,300);setTimeout(renderWindows,1200)});
})();