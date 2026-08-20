(()=>{
const E=s=>String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
const EUR=v=>new Intl.NumberFormat('pt-PT',{style:'currency',currency:'EUR'}).format(Number(v||0));
const MONTHS=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
function actualRole(){try{return me?.role||null}catch(_){return null}}
function effectiveRole(){try{return window.TeamDuckRoleLayout?.effectiveRole?.()||actualRole()}catch(_){return actualRole()}}
function isPreview(){try{return actualRole()==='admin'&&['partner','substitute'].includes(sessionStorage.getItem('team-duck-role-preview'))}catch(_){return false}}
function canSee(){const r=effectiveRole();return r==='admin'||r==='partner'}
function setup(){
 const nav=document.getElementById('nav'); if(!nav)return;
 let b=document.getElementById('monthlyReportNav');
 if(!b){b=document.createElement('button');b.id='monthlyReportNav';b.dataset.page='monthlyReport';b.textContent='Relatório mensal';const closed=[...nav.querySelectorAll('button')].find(x=>x.dataset.page==='closed');nav.insertBefore(b,closed||null)}
 let s=document.getElementById('monthlyReport');
 if(!s){const app=document.getElementById('app');s=document.createElement('section');s.id='monthlyReport';s.className='page hidden';s.innerHTML='<div class="title-row"><h2>Relatório mensal</h2></div><p class="muted">Balanço mensal por técnico.</p><div id="monthlyReportList" class="list"></div>';app.appendChild(s)}
 b.classList.toggle('hidden',!canSee());
 b.onclick=()=>{document.querySelectorAll('#nav button').forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('.page').forEach(p=>p.classList.toggle('hidden',p.id!=='monthlyReport'));renderMonthly()};
}
function profile(id){return (team||[]).find(x=>String(x.id)===String(id))||null}
function addPerson(map,id,name,c,value,received){if(!id||value<=0)return;const key=String(id);if(!map.has(key))map.set(key,{name:name||'Técnico',items:[],total:0,received:0});const x=map.get(key);x.items.push({...c,__reportValue:value,__reportReceived:received});x.total+=value;x.received+=received}
function financialPeople(cs){
 const role=effectiveRole(),people=new Map(),uid=String(me?.id||'');
 cs.forEach(c=>{
   const total=Math.max(0,Number(c.fee_override||0)),receivedTotal=Math.max(0,Number(c.amount_received||0));
   if(!total)return;
   const principalId=String(c.principal_technician_id||c.technician_id||c.owner_id||''),subId=String(c.substitute_technician_id||'');
   const subFee=subId?Math.max(0,Number(c.substitute_fee||0)):0;
   const principalValue=subId?Math.max(0,Number(c.principal_commission??(total-subFee))):total;
   const ratio=Math.min(1,receivedTotal/total);
   if(role==='partner'){
     if(principalId!==uid)return;
     const p=profile(principalId);addPerson(people,principalId,p?.full_name||p?.email||me?.full_name||me?.email||'Parceiro',c,principalValue,principalValue*ratio);
     if(subId){const s=profile(subId);addPerson(people,subId,s?.full_name||s?.email||'Substituto',c,subFee,subFee*ratio)}
     return;
   }
   const p=profile(principalId);addPerson(people,principalId,p?.full_name||p?.email||'Sem técnico',c,principalValue,principalValue*ratio);
   if(subId){const s=profile(subId);addPerson(people,subId,s?.full_name||s?.email||'Substituto',c,subFee,subFee*ratio)}
 });
 return people
}
function scopedRows(){
 const all=(concerts||[]).filter(c=>c.starts_at&&c.booking_status!=='cancelled'&&c.status!=='cancelled');
 if(effectiveRole()==='partner'){
   if(isPreview())return [];
   const uid=String(me?.id||'');return all.filter(c=>String(c.principal_technician_id||c.technician_id||c.owner_id||'')===uid)
 }
 return all
}
function renderMonthly(){
 const root=document.getElementById('monthlyReportList');if(!root)return;
 if(!canSee()){root.innerHTML='<div class="empty">Sem permissão para ver valores.</div>';return}
 const rows=scopedRows().slice().sort((a,b)=>new Date(b.starts_at)-new Date(a.starts_at));
 if(effectiveRole()==='partner'&&isPreview()){root.innerHTML='<div class="empty">Sem dados financeiros deste Parceiro. A pré-visualização não mostra valores dos Administradores.</div>';return}
 const groups=new Map();
 rows.forEach(c=>{const d=new Date(c.starts_at),key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(c)});
 root.innerHTML=[...groups].map(([key,cs])=>{const [y,m]=key.split('-').map(Number);const people=financialPeople(cs);const grand=[...people.values()].reduce((s,x)=>s+x.total,0);return `<details class="panel" style="margin-bottom:10px"><summary style="cursor:pointer;font-weight:800">${MONTHS[m-1]} ${y} <span class="money">${EUR(grand)}</span></summary><div class="list" style="margin-top:12px">${[...people.values()].sort((a,b)=>a.name.localeCompare(b.name,'pt')).map(p=>`<details class="item"><summary style="cursor:pointer"><strong>${E(p.name)}</strong><span class="money">${EUR(p.total)}</span><small>A faturar: ${EUR(p.total)} · Recebido: ${EUR(p.received)} · Por receber: ${EUR(Math.max(0,p.total-p.received))} · ${p.items.length} trabalho${p.items.length===1?'':'s'}</small></summary><div style="margin-top:10px">${p.items.sort((a,b)=>new Date(a.starts_at)-new Date(b.starts_at)).map(c=>{const d=new Date(c.starts_at);return `<div class="item"><div><strong>${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()} · ${E(c.artists?.name||'Trabalho')}</strong><small>${E(c.city||c.venue||'Local por definir')} · ${E(c.work_position||'')}</small></div><span class="money">${EUR(c.__reportValue)}</span></div>`}).join('')}</div></details>`).join('')}</div></details>`}).join('')||'<div class="empty">Ainda não existem trabalhos para o relatório.</div>';
}
function refresh(){setup();const b=document.getElementById('monthlyReportNav');if(b)b.classList.toggle('hidden',!canSee());if(!document.getElementById('monthlyReport')?.classList.contains('hidden'))renderMonthly()}
function patchLoadAll(){if(window.__monthlyReportLoadPatched||typeof window.loadAll!=='function')return;const original=window.loadAll;window.loadAll=async function(...args){const out=await original.apply(this,args);setTimeout(refresh,0);return out};window.__monthlyReportLoadPatched=true}
if(document.readyState==='loading')addEventListener('load',()=>{patchLoadAll();setTimeout(()=>{patchLoadAll();refresh()},200);setTimeout(()=>{patchLoadAll();refresh()},800);setTimeout(refresh,1600)});else{patchLoadAll();refresh();setTimeout(refresh,500)}
window.TeamDuckMonthlyReport={refresh,render:renderMonthly};
})();