(()=>{
const q=id=>document.getElementById(id);
let view='list';
let cursor=new Date();

const MONTHS=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const WEEK=['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];

function isGeneralAgenda(){
 const general=document.querySelector('#nav button[data-page="agenda"]:not([data-agenda-filter])');
 return !!general?.classList.contains('active');
}
function activeConcerts(){return (window.concerts||concerts||[]).filter(c=>!c.closed)}
function sameDay(a,b){return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate()}
function monthConcerts(y,m){return activeConcerts().filter(c=>{const d=new Date(c.starts_at);return d.getFullYear()===y&&d.getMonth()===m})}
function escLocal(s){return typeof esc==='function'?esc(s):String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]))}
function techName(c){const p=(window.team||team||[]).find(x=>String(x.id)===String(c.technician_id));return p?.full_name||p?.email||''}
function timeLabel(c){return new Date(c.starts_at).toLocaleTimeString('pt-PT',{hour:'2-digit',minute:'2-digit'})}
function eventLabel(c){return `${timeLabel(c)} · ${escLocal(c.artists?.name||'Trabalho')}`}

function inject(){
 const agenda=q('agenda');if(!agenda||q('agendaViewControls'))return;
 const members=q('agendaMembers');
 const controls=document.createElement('div');
 controls.id='agendaViewControls';controls.className='agenda-view-controls';
 controls.innerHTML=`<div class="agenda-view-tabs"><button type="button" data-agenda-view="list" class="active">Lista</button><button type="button" data-agenda-view="month">Mês</button><button type="button" data-agenda-view="year">Ano</button></div><div class="agenda-view-nav hidden" id="agendaViewNav"><button type="button" class="secondary tiny" id="agendaPrev">‹</button><strong id="agendaPeriod"></strong><button type="button" class="secondary tiny" id="agendaNext">›</button><button type="button" class="secondary tiny" id="agendaToday">Hoje</button></div>`;
 members?.insertAdjacentElement('beforebegin',controls);
 const calendar=document.createElement('div');calendar.id='agendaCalendar';calendar.className='hidden';
 q('concerts')?.insertAdjacentElement('beforebegin',calendar);
 const style=document.createElement('style');style.id='agendaViewsStyle';style.textContent=`
 #agendaViewControls{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin:0 0 12px}
 .agenda-view-tabs{display:flex;gap:6px;padding:4px;border-radius:12px;background:rgba(255,255,255,.08)}
 .agenda-view-tabs button{border:0;border-radius:9px;padding:8px 13px;background:transparent;color:inherit;font-weight:800}
 .agenda-view-tabs button.active{background:#00843D;color:#fff}
 .agenda-view-nav{display:flex;align-items:center;gap:7px;min-width:0}
 #agendaPeriod{min-width:125px;text-align:center;white-space:nowrap}
 #agendaCalendar{width:100%;overflow-x:auto;padding-bottom:4px}
 .duck-cal{min-width:720px;border:1px solid rgba(255,255,255,.13);border-radius:14px;overflow:hidden;background:rgba(10,20,16,.42)}
 .duck-cal-head,.duck-cal-grid{display:grid;grid-template-columns:repeat(7,1fr)}
 .duck-cal-head div{padding:9px 7px;text-align:center;font-size:12px;font-weight:900;opacity:.72;border-bottom:1px solid rgba(255,255,255,.12)}
 .duck-day{min-height:112px;padding:7px;border-right:1px solid rgba(255,255,255,.09);border-bottom:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.025)}
 .duck-day:nth-child(7n){border-right:0}.duck-day.out{opacity:.26}.duck-day.today{box-shadow:inset 0 0 0 2px #00843D}
 .duck-day-num{font-weight:900;font-size:13px;margin-bottom:6px}.duck-events{display:flex;flex-direction:column;gap:4px}
 .duck-event{display:block;width:100%;border:0;text-align:left;border-radius:7px;padding:5px 6px;background:rgba(0,132,61,.28);color:inherit;font-size:11px;line-height:1.25;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
 .duck-event small{display:block;opacity:.72;overflow:hidden;text-overflow:ellipsis}
 .duck-year{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
 .duck-month{min-height:92px;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:14px;background:rgba(255,255,255,.04);color:inherit;text-align:left}
 .duck-month strong{display:block;font-size:17px;margin-bottom:7px}.duck-month span{font-size:12px;opacity:.7}.duck-month.has-dates{box-shadow:inset 0 0 0 1px rgba(0,132,61,.55)}
 @media(max-width:700px){.duck-year{grid-template-columns:repeat(2,minmax(0,1fr))}#agendaViewControls{align-items:stretch}.agenda-view-nav{justify-content:space-between;width:100%}.agenda-view-tabs{width:100%}.agenda-view-tabs button{flex:1}}
 `;document.head.appendChild(style);
 controls.querySelectorAll('[data-agenda-view]').forEach(b=>b.onclick=()=>setView(b.dataset.agendaView));
 q('agendaPrev').onclick=()=>move(-1);q('agendaNext').onclick=()=>move(1);q('agendaToday').onclick=()=>{cursor=new Date();renderView()};
}

function setView(v){view=v;document.querySelectorAll('[data-agenda-view]').forEach(b=>b.classList.toggle('active',b.dataset.agendaView===v));renderView()}
function move(n){if(view==='month')cursor=new Date(cursor.getFullYear(),cursor.getMonth()+n,1);else cursor=new Date(cursor.getFullYear()+n,cursor.getMonth(),1);renderView()}

function renderMonth(){
 const y=cursor.getFullYear(),m=cursor.getMonth();q('agendaPeriod').textContent=`${MONTHS[m]} ${y}`;
 const first=new Date(y,m,1),last=new Date(y,m+1,0);let offset=(first.getDay()+6)%7;
 const start=new Date(y,m,1-offset),today=new Date();let cells='';
 for(let i=0;i<42;i++){
  const d=new Date(start);d.setDate(start.getDate()+i);const dayEvents=activeConcerts().filter(c=>sameDay(new Date(c.starts_at),d)).sort((a,b)=>new Date(a.starts_at)-new Date(b.starts_at));
  cells+=`<div class="duck-day ${d.getMonth()!==m?'out':''} ${sameDay(d,today)?'today':''}"><div class="duck-day-num">${d.getDate()}</div><div class="duck-events">${dayEvents.map(c=>`<button type="button" class="duck-event" title="${escLocal(c.artists?.name||'Trabalho')} · ${escLocal(c.city||c.venue||'')} ">${eventLabel(c)}${techName(c)?`<small>${escLocal(techName(c))}</small>`:''}</button>`).join('')}</div></div>`;
 }
 q('agendaCalendar').innerHTML=`<div class="duck-cal"><div class="duck-cal-head">${WEEK.map(w=>`<div>${w}</div>`).join('')}</div><div class="duck-cal-grid">${cells}</div></div>`;
}
function renderYear(){
 const y=cursor.getFullYear();q('agendaPeriod').textContent=String(y);
 q('agendaCalendar').innerHTML=`<div class="duck-year">${MONTHS.map((name,m)=>{const cs=monthConcerts(y,m);return `<button type="button" class="duck-month ${cs.length?'has-dates':''}" data-open-month="${m}"><strong>${name}</strong><span>${cs.length?`${cs.length} ${cs.length===1?'data':'datas'}`:'Sem datas'}</span></button>`}).join('')}</div>`;
 q('agendaCalendar').querySelectorAll('[data-open-month]').forEach(b=>b.onclick=()=>{cursor=new Date(y,Number(b.dataset.openMonth),1);setView('month')});
}
function renderView(){
 inject();const general=isGeneralAgenda();q('agendaViewControls')?.classList.toggle('hidden',!general);if(!general)return;
 const list=q('concerts'),members=q('agendaMembers'),cal=q('agendaCalendar'),nav=q('agendaViewNav'),empty=q('agendaFilterEmpty');
 const isList=view==='list';list?.classList.toggle('hidden',!isList);members?.classList.toggle('hidden',!isList);cal?.classList.toggle('hidden',isList);nav?.classList.toggle('hidden',isList);if(empty)empty.classList.toggle('hidden',!isList);
 if(view==='month')renderMonth();if(view==='year')renderYear();
}
function wireNav(){document.querySelectorAll('#nav button[data-page="agenda"]').forEach(b=>b.addEventListener('click',()=>setTimeout(renderView,0)));}
function patchLoadAll(){if(window.__agendaViewsLoadPatched||typeof window.loadAll!=='function')return;const original=window.loadAll;window.loadAll=async function(...args){const out=await original.apply(this,args);setTimeout(renderView,0);return out};window.__agendaViewsLoadPatched=true}
addEventListener('load',()=>{inject();wireNav();patchLoadAll();setTimeout(renderView,450)});
})();