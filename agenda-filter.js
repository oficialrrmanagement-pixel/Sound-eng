(()=>{
let activeAgendaFilter='ALL';
const q=id=>document.getElementById(id);
function applyAgendaFilter(){
 const container=q('concerts'); if(!container)return;
 const cards=[...container.querySelectorAll(':scope > .item')];
 cards.forEach((card,i)=>{
   const c=(concerts||[])[i];
   if(!c){card.hidden=false;return}
   const pos=String(c.work_position||'').toUpperCase();
   card.hidden=activeAgendaFilter!=='ALL'&&pos!==activeAgendaFilter;
 });
 const title=document.querySelector('#agenda .title-row h2');
 if(title)title.textContent=activeAgendaFilter==='ALL'?'Agenda':`Agenda · ${activeAgendaFilter}`;
}
function setFilter(value,button){
 activeAgendaFilter=value;
 requestAnimationFrame(()=>requestAnimationFrame(applyAgendaFilter));
 document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('active',b===button));
}
function wire(){
 const agendaBtn=document.querySelector('#nav button[data-page="agenda"]:not([data-agenda-filter])');
 const fohBtn=document.querySelector('#nav button[data-agenda-filter="FOH"]');
 const rohBtn=document.querySelector('#nav button[data-agenda-filter="ROH"]');
 if(agendaBtn&&!agendaBtn.dataset.filterWired){agendaBtn.dataset.filterWired='1';agendaBtn.addEventListener('click',()=>setFilter('ALL',agendaBtn))}
 if(fohBtn&&!fohBtn.dataset.filterWired){fohBtn.dataset.filterWired='1';fohBtn.addEventListener('click',()=>setFilter('FOH',fohBtn))}
 if(rohBtn&&!rohBtn.dataset.filterWired){rohBtn.dataset.filterWired='1';rohBtn.addEventListener('click',()=>setFilter('ROH',rohBtn))}
}
function patchLoadAll(){
 if(window.__agendaFilterLoadPatched||typeof window.loadAll!=='function')return;
 const original=window.loadAll;
 window.loadAll=async function(...args){const out=await original.apply(this,args);requestAnimationFrame(applyAgendaFilter);return out};
 window.__agendaFilterLoadPatched=true;
}
addEventListener('load',()=>{wire();patchLoadAll();setTimeout(applyAgendaFilter,500)});
})();