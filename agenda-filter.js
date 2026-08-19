(()=>{
let activeAgendaFilter='ALL';
const q=id=>document.getElementById(id);
function assigned(c){try{return window.TeamDuckAssignments?.byConcert?.(c.id)||[]}catch(_){return[]}}
function techFor(id){return (team||[]).find(x=>String(x.id)===String(id))||null}
function matches(c){
 if(c?.closed)return false;
 const list=assigned(c);
 if(activeAgendaFilter==='ALL')return true;
 if(activeAgendaFilter==='FOH')return list.length?list.some(a=>a.position==='FOH'):String(c?.work_position||'').toUpperCase()==='FOH';
 if(activeAgendaFilter==='ROH')return list.length?list.some(a=>a.position==='ROH'):String(c?.work_position||'').toUpperCase()==='ROH';
 if(activeAgendaFilter==='SUB')return list.length?list.some(a=>techFor(a.technician_id)?.role==='substitute'):techFor(c.technician_id)?.role==='substitute';
 return true;
}
function applyAgendaFilter(){
 const container=q('concerts');if(!container)return;
 const cards=[...container.querySelectorAll(':scope > .item')];
 let visible=0;
 cards.forEach((card,i)=>{const c=(concerts||[])[i];const show=!!c&&matches(c);card.style.display=show?'':'none';if(show)visible++});
 let empty=q('agendaFilterEmpty');
 if(!empty){empty=document.createElement('div');empty.id='agendaFilterEmpty';empty.className='empty';container.insertAdjacentElement('afterend',empty)}
 empty.style.display=visible===0?'':'none';
 empty.textContent=activeAgendaFilter==='FOH'?'Sem datas FOH.':activeAgendaFilter==='ROH'?'Sem datas ROH.':activeAgendaFilter==='SUB'?'Sem datas atribuídas a substitutos.':'Sem trabalhos ativos.';
 const title=document.querySelector('#agenda .title-row h2');
 if(title)title.textContent=activeAgendaFilter==='ALL'?'Agenda':activeAgendaFilter==='SUB'?'Agenda · Substitutos':`Agenda · ${activeAgendaFilter}`;
}
function setFilter(value,button){activeAgendaFilter=value;document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('active',b===button));setTimeout(applyAgendaFilter,120)}
function wire(){
 const agendaBtn=document.querySelector('#nav button[data-page="agenda"]:not([data-agenda-filter])');
 const fohBtn=document.querySelector('#nav button[data-agenda-filter="FOH"]');
 const rohBtn=document.querySelector('#nav button[data-agenda-filter="ROH"]');
 const subBtn=document.querySelector('#nav button[data-agenda-filter="SUB"]');
 [[agendaBtn,'ALL'],[fohBtn,'FOH'],[rohBtn,'ROH'],[subBtn,'SUB']].forEach(([b,v])=>{if(b&&!b.dataset.filterWired){b.dataset.filterWired='1';b.addEventListener('click',()=>setFilter(v,b))}})
}
function patchLoadAll(){if(window.__agendaFilterLoadPatched||typeof window.loadAll!=='function')return;const original=window.loadAll;window.loadAll=async function(...args){const out=await original.apply(this,args);setTimeout(applyAgendaFilter,250);return out};window.__agendaFilterLoadPatched=true}
addEventListener('load',()=>{wire();patchLoadAll();setTimeout(applyAgendaFilter,900)});window.TeamDuckAgendaFilter={refresh:applyAgendaFilter};
})();