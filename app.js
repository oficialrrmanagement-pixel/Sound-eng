const SUPABASE_URL='https://fnuchugrbwvmmtfbpboa.supabase.co';
const SUPABASE_KEY='sb_publishable_6onPy_AryFOeIp5XGgwcQA_OrgCijmm';
const sb=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);

const $=id=>document.getElementById(id);
let artists=[],concerts=[];

function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
function money(v){return new Intl.NumberFormat('pt-PT',{style:'currency',currency:'EUR'}).format(Number(v||0))}
function dt(v){return v?new Intl.DateTimeFormat('pt-PT',{dateStyle:'medium',timeStyle:'short'}).format(new Date(v)):''}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

async function boot(){
  const {data:{session}}=await sb.auth.getSession();
  if(session) showApp(); else showLogin();
  sb.auth.onAuthStateChange((_e,s)=>s?showApp():showLogin());
}
function showLogin(){$('login').classList.remove('hidden');$('app').classList.add('hidden')}
async function showApp(){$('login').classList.add('hidden');$('app').classList.remove('hidden');await loadAll()}

$('loginForm').addEventListener('submit',async e=>{
  e.preventDefault(); $('loginError').textContent='';
  const {error}=await sb.auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value});
  if(error)$('loginError').textContent='Não foi possível entrar. Confirma o e-mail e a palavra-passe.';
});
$('logout').onclick=()=>sb.auth.signOut();

document.querySelectorAll('#nav button').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('#nav button').forEach(x=>x.classList.toggle('active',x===b));
  document.querySelectorAll('.page').forEach(p=>p.classList.toggle('hidden',p.id!==b.dataset.page));
});

async function loadAll(){
  const [a,c,p]=await Promise.all([
    sb.from('artists').select('*').order('name'),
    sb.from('concerts').select('*,artists(name)').order('starts_at'),
    sb.from('profiles').select('full_name,email,role,active').order('full_name')
  ]);
  if(a.error) toast('Erro ao carregar artistas'); else artists=a.data||[];
  if(c.error) toast('Erro ao carregar agenda'); else concerts=c.data||[];
  renderArtists(); renderConcerts(); renderDashboard(); renderTeam(p.data||[]);
}

function renderDashboard(){
  const now=new Date();
  const future=concerts.filter(c=>new Date(c.starts_at)>=now&&!c.closed);
  $('statConcerts').textContent=future.length;
  $('statArtists').textContent=artists.length;
  const due=concerts.filter(c=>!c.closed).reduce((s,c)=>s+Math.max(0,Number(c.fee_override||0)-Number(c.amount_received||0)),0);
  $('statDue').textContent=money(due);
  $('nextConcerts').innerHTML=future.slice(0,5).map(concertCard).join('')||'<div class="empty">Sem trabalhos futuros.</div>';
}
function concertCard(c){
  return `<article class="item"><div><strong>${esc(c.artists?.name||'Trabalho')}</strong><small>${dt(c.starts_at)} · ${esc(c.city||c.venue||'Local por definir')}</small>${c.work_position?`<small>${esc(c.work_position)}</small>`:''}</div><span class="money">${money(c.fee_override)}</span></article>`;
}
function renderConcerts(){
  $('concerts').innerHTML=concerts.map(concertCard).join('')||'<div class="empty">Ainda não existem trabalhos.</div>';
}
function renderArtists(){
  $('artistList').innerHTML=artists.map(a=>`<article class="item"><div><strong>${esc(a.name)}</strong><small>${esc(a.contact_email||a.contact_phone||'Sem contacto')}</small></div><span class="money">${money(a.base_fee)}</span></article>`).join('')||'<div class="empty">Ainda não existem artistas.</div>';
  $('concertArtist').innerHTML='<option value="">Selecionar artista</option>'+artists.map(a=>`<option value="${a.id}">${esc(a.name)}</option>`).join('');
}
function renderTeam(team){
  $('teamList').innerHTML=team.map(p=>`<article class="item"><div><strong>${esc(p.full_name||p.email||'Membro')}</strong><small>${esc(p.role||'equipa')} ${p.active===false?'· inativo':''}</small></div></article>`).join('')||'<div class="empty">Sem membros visíveis.</div>';
}

$('newArtist').onclick=()=>$('artistDialog').showModal();
$('newConcert').onclick=()=>$('concertDialog').showModal();
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());

$('artistForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const {data:{user}}=await sb.auth.getUser();
  const payload={name:$('artistName').value.trim(),base_fee:$('artistFee').value||null,contact_phone:$('artistPhone').value.trim()||null,contact_email:$('artistEmail').value.trim()||null,created_by:user?.id};
  const {error}=await sb.from('artists').insert(payload);
  if(error){toast('Não foi possível guardar o artista');return}
  $('artistDialog').close();e.target.reset();toast('Artista guardado');await loadAll();
});

$('concertForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const {data:{user}}=await sb.auth.getUser();
  const payload={artist_id:$('concertArtist').value,starts_at:new Date($('concertStart').value).toISOString(),ends_at:$('concertEnd').value?new Date($('concertEnd').value).toISOString():null,venue:$('concertVenue').value.trim()||null,city:$('concertCity').value.trim()||null,work_position:$('concertPosition').value.trim()||null,fee_override:$('concertFee').value||null,notes:$('concertNotes').value.trim()||null,status:'confirmed',created_by:user?.id,owner_id:user?.id};
  const {error}=await sb.from('concerts').insert(payload);
  if(error){toast('Não foi possível guardar o trabalho');return}
  $('concertDialog').close();e.target.reset();toast('Trabalho guardado');await loadAll();
});

boot();
