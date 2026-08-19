(()=>{
let activeAgendaFilter='ALL';
const q=id=>document.getElementById(id);
function isSubstitute(c){const p=(team||[]).find(x=>String(x.id)===String(c.technician_id));return p?.role==='substitute'}
function applyAgendaFilter(){
 const container=q('concerts'); if(!container)return;
 const cards=[...container.querySelectorAll(':scope > .item')];
 cards.forEach((card,i)=>{
   const c=(concerts||[])[i];
   if(!c){card.hidden=false;return}
   const pos=String(c.work_position||'').toUpperCase();
   if(activeAgendaFilter==='ALL')card.hidden=false;
   else if(activeAgendaFilter==='SUB')card.hidden=!isSubstitute(c);
   else card.hidden=pos!==activeAgendaFilter;
 });
 const title=document.querySelector('#agenda .title-row h2');
 if(title)title.textContent=activeAgendaFilter==='ALL'?'Agenda':activeAgendaFilter==='SUB'?'Agenda · Substitutos':`Agenda · ${activeAgendaFilter}`;
}
function setFilter(value,button){activeAgendaFilter=value;requestAnimationFrame(()=>requestAnimationFrame(applyAgendaFilter));document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('active',b===button))}
function wire(){
 const agendaBtn=document.querySelector('#nav button[data-page="agenda"]:not([data-agenda-filter])');
 const fohBtn=document.querySelector('#nav button[data-agenda-filter="FOH"]');
 const rohBtn=document.querySelector('#nav button[data-agenda-filter="ROH"]');
 const subBtn=document.querySelector('#nav button[data-agenda-filter="SUB"]');
 [[agendaBtn,'ALL'],[fohBtn,'FOH'],[rohBtn,'ROH'],[subBtn,'SUB']].forEach(([b,v])=>{if(b&&!b.dataset.filterWired){b.dataset.filterWired='1';b.addEventListener('click',()=>setFilter(v,b))}})
}
function patchLoadAll(){if(window.__agendaFilterLoadPatched||typeof window.loadAll!=='function')return;const original=window.loadAll;window.loadAll=async function(...args){const out=await original.apply(this,args);requestAnimationFrame(applyAgendaFilter);return out};window.__agendaFilterLoadPatched=true}
addEventListener('load',()=>{wire();patchLoadAll();setTimeout(applyAgendaFilter,500)});
})();