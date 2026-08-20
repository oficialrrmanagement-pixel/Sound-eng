(()=>{
let activeAgendaFilter='ALL';
const q=id=>document.getElementById(id);
function assigned(c){try{return window.TeamDuckAssignments?.byConcert?.(c.id)||[]}catch(_){return[]}}
function techFor(id){return (team||[]).find(x=>String(x.id)===String(id))||null}
function matches(c){
 if(c?.closed)return false;
 const list=assigned(c),pos=String(c?.work_position||'').toUpperCase();
 if(activeAgendaFilter==='ALL')return true;
 if(activeAgendaFilter==='FOH')return pos==='FOH'||list.some(a=>String(a.position||'').toUpperCase()==='FOH');
 if(activeAgendaFilter==='ROH')return pos==='ROH'||list.some(a=>String(a.position||'').toUpperCase()==='ROH');
 if(activeAgendaFilter==='SUB')return !!c?.substitute_technician_id||list.some(a=>techFor(a.technician_id)?.role==='substitute')||techFor(c?.technician_id)?.role==='substitute';
 return true;
}
function applyAgendaFilter(){
 const container=q('concerts');if(!container)return;
 const cards=[...container.querySelectorAll(':scope > .item')];
 let visible=0;
 cards.forEach((card,i)=>{
   const c=(concerts||[])[i];
   const filterOK=!!c&&matches(c);
   card.dataset.filterHidden=filterOK?'0':'1';
   const memberOK=card.dataset.memberHidden!=='1';
   const show=filterOK&&memberOK;
   card.style.display=show?'':'none';
   if(show)visible++;
 });
 let empty=q('agendaFilterEmpty');
 if(!empty){empty=document.createElement('div');empty.id='agendaFilterEmpty';empty.className='empty';container.insertAdjacentElement('afterend',empty)}
 empty.style.display=visible===0?'':'none';
 empty.textContent=activeAgendaFilter==='FOH'?'Sem datas FOH.':activeAgendaFilter==='ROH'?'Sem datas ROH.':activeAgendaFilter==='SUB'?'Sem datas atribuídas a substitutos.':'Sem trabalhos ativos.';
 const title=document.querySelector('#agenda .title-row h2');
 if(title)title.textContent=activeAgendaFilter==='ALL'?'Agenda':activeAgendaFilter==='SUB'?'Agenda · Substitutos':`Agenda · ${activeAgendaFilter}`;
}
function setFilter(value,button){activeAgendaFilter=value;document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('active',b===button));setTimeout(applyAgendaFilter,50);setTimeout(applyAgendaFilter,250);setTimeout(applyAgendaFilter,700)}
function wire(){
 const agendaBtn=document.querySelector('#nav button[data-page="agenda"]:not([data-agenda-filter])');
 const fohBtn=document.querySelector('#nav button[data-agenda-filter="FOH"]');
 const rohBtn=document.querySelector('#nav button[data-agenda-filter="ROH"]');
 const subBtn=document.querySelector('#nav button[data-agenda-filter="SUB"]');
 [[agendaBtn,'ALL'],[fohBtn,'FOH'],[rohBtn,'ROH'],[subBtn,'SUB']].forEach(([b,v])=>{if(b&&!b.dataset.filterWired){b.dataset.filterWired='1';b.addEventListener('click',()=>setFilter(v,b))}})
}
function patchLoadAll(){if(window.__agendaFilterLoadPatched||typeof window.loadAll!=='function')return;const original=window.loadAll;window.loadAll=async function(...args){const out=await original.apply(this,args);setTimeout(applyAgendaFilter,100);setTimeout(applyAgendaFilter,500);return out};window.__agendaFilterLoadPatched=true}
addEventListener('load',()=>{wire();patchLoadAll();setTimeout(applyAgendaFilter,700)});
window.TeamDuckAgendaFilter={refresh:applyAgendaFilter,current:()=>activeAgendaFilter};
})();