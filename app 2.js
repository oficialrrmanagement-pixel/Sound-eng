const SUPABASE_URL='https://fnuchugrbwvmmtfbpboa.supabase.co';
const SUPABASE_KEY='sb_publishable_6onPy_AryFOeIp5XGgwcQA_OrgCijmm';

const sb=supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{
  auth:{
    persistSession:true,
    autoRefreshToken:true,
    detectSessionInUrl:true,
    storage:window.localStorage,
    storageKey:'team-duck-v4-auth'
  }
});

const $=id=>document.getElementById(id);
let artists=[],concerts=[],team=[],appVisible=false;

const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const money=v=>new Intl.NumberFormat('pt-PT',{style:'currency',currency:'EUR'}).format(Number(v||0));
const dt=v=>v?new Intl.DateTimeFormat('pt-PT',{dateStyle:'medium',timeStyle:'short'}).format(new Date(v)):'';

function toast(msg){
  const t=$('toast');
  if(!t) return;
  t.textContent=msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2500);
}

function showLogin(){
  appVisible=false;
  $('login').classList.remove('hidden');
  $('app').classList.add('hidden');
}

async function showApp(){
  if(appVisible) return;
  appVisible=true;
  $('login').classList.add('hidden');
  $('app').classList.remove('hidden');
  await loadAll();
}

async function loadAll(){
  const [a,c,p]=await Promise.all([
    sb.from('artists').select('*').order('name'),
    sb.from('concerts').select('*,artists(name)').order('starts_at'),
    sb.from('profiles').select('*').order('full_name')
  ]);

  if(a.error) console.error('artists',a.error); else artists=a.data||[];
  if(c.error) console.error('concerts',c.error); else concerts=c.data||[];
  if(p.error) console.error('profiles',p.error); else team=p.data||[];

  render();
}

function render(){
  const future=concerts.filter(c=>new Date(c.starts_at)>=new Date()&&!c.closed);

  $('statConcerts').textContent=future.length;
  $('statArtists').textContent=artists.length;
  $('statDue').textContent=money(
    concerts.filter(c=>!c.closed)
      .reduce((s,c)=>s+Math.max(0,Number(c.fee_override||0)-Number(c.amount_received||0)),0)
  );

  const card=c=>`<article class="item"><div><strong>${esc(c.artists?.name||'Trabalho')}</strong><small>${dt(c.starts_at)} · ${esc(c.city||c.venue||'Local por definir')} · ${esc(c.work_position||'')}</small></div><span class="money">${money(c.fee_override)}</span></article>`;

  $('nextConcerts').innerHTML=future.slice(0,5).map(card).join('')||'<div class="empty">Sem trabalhos futuros.</div>';
  $('concerts').innerHTML=concerts.map(card).join('')||'<div class="empty">Sem trabalhos.</div>';

  $('artistList').innerHTML=artists.map(a=>`<article class="item"><div><strong>${esc(a.name)}</strong><small>${esc(a.contact_email||a.contact_phone||'Sem contacto')}</small></div><span class="money">${money(a.base_fee)}</span></article>`).join('')||'<div class="empty">Sem artistas.</div>';

  $('teamList').innerHTML=team.map(p=>`<article class="item"><div><strong>${esc(p.full_name||p.email||'Membro')}</strong><small>${esc(p.role||'equipa')} · ${p.active?'ativo':'inativo'}</small></div></article>`).join('')||'<div class="empty">Sem membros.</div>';

  $('concertArtist').innerHTML='<option value="">Selecionar</option>'+artists.map(a=>`<option value="${a.id}">${esc(a.name)}</option>`).join('');
}

$('loginForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const errorEl=$('loginError');
  errorEl.textContent='';

  const button=e.submitter||$('loginForm').querySelector('button');
  button.disabled=true;
  button.textContent='A entrar…';

  try{
    const {data,error}=await sb.auth.signInWithPassword({
      email:$('email').value.trim(),
      password:$('password').value
    });

    if(error||!data.session){
      errorEl.textContent='E-mail ou password incorretos.';
      return;
    }

    await showApp();
  }catch(err){
    console.error(err);
    errorEl.textContent='Não foi possível iniciar sessão.';
  }finally{
    button.disabled=false;
    button.textContent='Entrar';
  }
});

$('logout').onclick=async()=>{
  await sb.auth.signOut({scope:'local'});
  localStorage.removeItem('team-duck-v4-auth');
  showLogin();
};

document.querySelectorAll('#nav button').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('#nav button').forEach(x=>x.classList.toggle('active',x===b));
  document.querySelectorAll('.page').forEach(p=>p.classList.toggle('hidden',p.id!==b.dataset.page));
});

document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
$('newArtist').onclick=()=>$('artistDialog').showModal();
$('newConcert').onclick=()=>$('concertDialog').showModal();
$('newMember').onclick=()=>$('memberDialog').showModal();

$('artistForm').onsubmit=async e=>{
  e.preventDefault();
  const {data:{user}}=await sb.auth.getUser();
  const {error}=await sb.from('artists').insert({
    name:$('artistName').value.trim(),
    base_fee:$('artistFee').value||null,
    contact_phone:$('artistPhone').value||null,
    contact_email:$('artistEmail').value||null,
    created_by:user?.id
  });
  if(error) return toast(error.message);
  $('artistDialog').close();
  e.target.reset();
  toast('Artista guardado');
  await loadAll();
};

$('concertForm').onsubmit=async e=>{
  e.preventDefault();
  const {data:{user}}=await sb.auth.getUser();
  const {error}=await sb.from('concerts').insert({
    artist_id:$('concertArtist').value,
    starts_at:new Date($('concertStart').value).toISOString(),
    ends_at:$('concertEnd').value?new Date($('concertEnd').value).toISOString():null,
    venue:$('concertVenue').value||null,
    city:$('concertCity').value||null,
    work_position:$('concertPosition').value,
    fee_override:$('concertFee').value||null,
    amount_received:$('concertReceived').value||0,
    notes:$('concertNotes').value||null,
    status:'confirmed',
    created_by:user?.id,
    owner_id:user?.id
  });
  if(error) return toast(error.message);
  $('concertDialog').close();
  e.target.reset();
  toast('Trabalho guardado');
  await loadAll();
};

$('memberForm').onsubmit=async e=>{
  e.preventDefault();
  const {data,error}=await sb.functions.invoke('admin-create-user',{
    body:{
      full_name:$('memberName').value.trim(),
      email:$('memberEmail').value.trim(),
      phone:$('memberPhone').value.trim(),
      role:$('memberRole').value,
      password:$('memberPassword').value
    }
  });

  if(error||data?.ok===false){
    return toast(data?.error||error?.message||'Erro ao criar membro');
  }

  $('memberDialog').close();
  e.target.reset();
  toast('Membro criado');
  await loadAll();
};

$('googleConnect').onclick=()=>toast('Google Calendar: falta concluir a autorização OAuth.');

(async function boot(){
  const {data,error}=await sb.auth.getSession();

  if(error){
    localStorage.removeItem('team-duck-v4-auth');
    showLogin();
    return;
  }

  if(data.session) await showApp();
  else showLogin();

  sb.auth.onAuthStateChange((event,session)=>{
    if(event==='SIGNED_OUT'||!session){
      showLogin();
    }
  });
})();
