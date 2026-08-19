(()=>{
const E=s=>String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
const EUR=v=>new Intl.NumberFormat('pt-PT',{style:'currency',currency:'EUR'}).format(Number(v||0));
const MONTHS=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
function canSee(){return me?.role==='admin'||me?.permissions?.financials_view===true}
function setup(){
 const nav=document.getElementById('nav'); if(!nav)return;
 let b=document.getElementById('monthlyReportNav');
 if(!b){b=document.createElement('button');b.id='monthlyReportNav';b.dataset.page='monthlyReport';b.textContent='Relatório mensal';const closed=[...nav.querySelectorAll('button')].find(x=>x.dataset.page==='closed');nav.insertBefore(b,closed||null)}
 let s=document.getElementById('monthlyReport');
 if(!s){const app=document.getElementById('app');s=document.createElement('section');s.id='monthlyReport';s.className='page hidden';s.innerHTML='<div class="title-row"><h2>Relatório mensal</h2></div><p class="muted">Balanço mensal da equipa por técnico.</p><div id="monthlyReportList" class="list"></div>';app.appendChild(s)}
 b.classList.toggle('hidden',!canSee());
 b.onclick=()=>{document.querySelectorAll('#nav button').forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('.page').forEach(p=>p.classList.toggle('hidden',p.id!=='monthlyReport'));renderMonthly()};
}
function personFor(c){const id=c.technician_id||c.owner_id||'none';const p=(team||[]).find(x=>String(x.id)===String(id));return {id,name:p?.full_name||p?.email||'Sem técnico'}}
function renderMonthly(){
 const root=document.getElementById('monthlyReportList');if(!root)return;
 if(!canSee()){root.innerHTML='<div class="empty">Sem permissão para ver valores.</div>';return}
 const rows=(concerts||[]).filter(c=>c.starts_at&&c.booking_status!=='cancelled'&&c.status!=='cancelled').slice().sort((a,b)=>new Date(b.starts_at)-new Date(a.starts_at));
 const groups=new Map();
 rows.forEach(c=>{const d=new Date(c.starts_at),key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(c)});
 root.innerHTML=[...groups].map(([key,cs])=>{const [y,m]=key.split('-').map(Number);const people=new Map();cs.forEach(c=>{const who=personFor(c);if(!people.has(who.id))people.set(who.id,{name:who.name,items:[],total:0,received:0});const x=people.get(who.id);x.items.push(c);x.total+=Number(c.fee_override||0);x.received+=Number(c.amount_received||0)});const grand=[...people.values()].reduce((s,x)=>s+x.total,0);return `<details class="panel" style="margin-bottom:10px"><summary style="cursor:pointer;font-weight:800">${MONTHS[m-1]} ${y} <span class="money">${EUR(grand)}</span></summary><div class="list" style="margin-top:12px">${[...people.values()].sort((a,b)=>a.name.localeCompare(b.name,'pt')).map(p=>`<details class="item"><summary style="cursor:pointer"><strong>${E(p.name)}</strong><span class="money">${EUR(p.total)}</span><small>A faturar: ${EUR(p.total)} · Recebido: ${EUR(p.received)} · Por receber: ${EUR(Math.max(0,p.total-p.received))} · ${p.items.length} trabalho${p.items.length===1?'':'s'}</small></summary><div style="margin-top:10px">${p.items.sort((a,b)=>new Date(a.starts_at)-new Date(b.starts_at)).map(c=>{const d=new Date(c.starts_at);return `<div class="item"><div><strong>${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()} · ${E(c.artists?.name||'Trabalho')}</strong><small>${E(c.city||c.venue||'Local por definir')} · ${E(c.work_position||'')}</small></div><span class="money">${EUR(c.fee_override)}</span></div>`}).join('')}</div></details>`).join('')}</div></details>`}).join('')||'<div class="empty">Ainda não existem trabalhos para o relatório.</div>';
}
function refresh(){setup();const b=document.getElementById('monthlyReportNav');if(b)b.classList.toggle('hidden',!canSee());if(!document.getElementById('monthlyReport')?.classList.contains('hidden'))renderMonthly()}
function patchLoadAll(){if(window.__monthlyReportLoadPatched||typeof window.loadAll!=='function')return;const original=window.loadAll;window.loadAll=async function(...args){const out=await original.apply(this,args);setTimeout(refresh,0);return out};window.__monthlyReportLoadPatched=true}
addEventListener('load',()=>{patchLoadAll();setTimeout(()=>{patchLoadAll();refresh()},200);setTimeout(()=>{patchLoadAll();refresh()},800);setTimeout(refresh,1600)});
})();