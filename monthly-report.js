(()=>{
const E=s=>String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
const EUR=v=>new Intl.NumberFormat('pt-PT',{style:'currency',currency:'EUR'}).format(Number(v||0));
const MONTHS=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
function canSee(){return me?.role==='admin'||me?.permissions?.financials_view===true}
function setup(){
 const nav=document.getElementById('nav'); if(!nav||document.getElementById('monthlyReportNav'))return;
 const b=document.createElement('button');b.id='monthlyReportNav';b.dataset.page='monthlyReport';b.textContent='Relatório mensal';
 const closed=[...nav.querySelectorAll('button')].find(x=>x.dataset.page==='closed');nav.insertBefore(b,closed||null);
 const app=document.getElementById('app');const s=document.createElement('section');s.id='monthlyReport';s.className='page hidden';s.innerHTML='<div class="title-row"><h2>Relatório mensal</h2></div><p class="muted">Trabalhos e valores por técnico, organizados por mês.</p><div id="monthlyReportList" class="list"></div>';app.appendChild(s);
 b.onclick=()=>{document.querySelectorAll('#nav button').forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('.page').forEach(p=>p.classList.toggle('hidden',p.id!=='monthlyReport'));renderMonthly()};
}
function renderMonthly(){
 const root=document.getElementById('monthlyReportList');if(!root)return;
 if(!canSee()){root.innerHTML='<div class="empty">Sem permissão para ver valores.</div>';return}
 const rows=(concerts||[]).filter(c=>c.starts_at).slice().sort((a,b)=>new Date(b.starts_at)-new Date(a.starts_at));
 const groups=new Map();
 rows.forEach(c=>{const d=new Date(c.starts_at),key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(c)});
 root.innerHTML=[...groups].map(([key,cs])=>{const [y,m]=key.split('-').map(Number);const people=new Map();cs.forEach(c=>{const id=c.technician_id||c.owner_id||'none';const p=(team||[]).find(x=>x.id===id);const name=p?.full_name||p?.email||'Sem técnico';if(!people.has(id)){people.set(id,{name,items:[],total:0,received:0})}const x=people.get(id);x.items.push(c);x.total+=Number(c.fee_override||0);x.received+=Number(c.amount_received||0)});const grand=[...people.values()].reduce((s,x)=>s+x.total,0);return `<details class="panel" style="margin-bottom:10px"><summary style="cursor:pointer;font-weight:800">${MONTHS[m-1]} ${y} <span class="money">${EUR(grand)}</span></summary><div class="list" style="margin-top:12px">${[...people.values()].map(p=>`<details class="item"><summary style="cursor:pointer"><strong>${E(p.name)}</strong> <span class="money">${EUR(p.total)}</span><small>Recebido: ${EUR(p.received)} · ${p.items.length} trabalho${p.items.length===1?'':'s'}</small></summary><div style="margin-top:10px">${p.items.sort((a,b)=>new Date(a.starts_at)-new Date(b.starts_at)).map(c=>{const d=new Date(c.starts_at);return `<div class="item"><div><strong>${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')} · ${E(c.artists?.name||'Trabalho')}</strong><small>${E(c.city||c.venue||'Local por definir')} · ${E(c.work_position||'')}</small></div><span class="money">${EUR(c.fee_override)}</span></div>`}).join('')}</div></details>`).join('')}</div></details>`}).join('')||'<div class="empty">Ainda não existem trabalhos para o relatório.</div>';
}
addEventListener('load',setup);
})();