(()=>{
const q=id=>document.getElementById(id);
function isSubstitute(){return me?.role==='substitute'}
function applySubstituteMode(){
  if(!isSubstitute()) return;

  // Only the substitute's own agenda is available. Supabase RLS already limits
  // concert rows to technician_id = auth.uid().
  const nav=q('nav');
  if(nav){
    nav.querySelectorAll('button').forEach(b=>{
      const page=b.dataset.page;
      const filter=b.dataset.agendaFilter;
      const allowed=page==='agenda' && (!filter || filter==='FOH' || filter==='ROH');
      b.classList.toggle('hidden',!allowed);
      if(allowed) b.classList.remove('active');
    });
  }

  // Hide every page except Agenda.
  document.querySelectorAll('.page').forEach(p=>p.classList.toggle('hidden',p.id!=='agenda'));
  const agendaBtn=document.querySelector('#nav button[data-page="agenda"]:not([data-agenda-filter])');
  if(agendaBtn) agendaBtn.classList.add('active');

  // A substitute cannot create or manage work, team, artists or financials.
  q('newConcert')?.classList.add('hidden');
  q('newArtist')?.classList.add('hidden');
  q('newMember')?.classList.add('hidden');
  document.querySelectorAll('.money,[data-team-action],#dueByPerson,#dashboard .stats').forEach(el=>el.classList.add('hidden'));

  const title=document.querySelector('#agenda .title-row h2');
  if(title) title.textContent='A minha agenda';
}

function patchLoadAll(){
  if(window.__substituteModePatched || typeof window.loadAll!=='function') return;
  const original=window.loadAll;
  window.loadAll=async function(...args){
    const out=await original.apply(this,args);
    requestAnimationFrame(applySubstituteMode);
    return out;
  };
  window.__substituteModePatched=true;
}

addEventListener('load',()=>{
  patchLoadAll();
  setTimeout(applySubstituteMode,300);
  setTimeout(applySubstituteMode,1000);
});
})();