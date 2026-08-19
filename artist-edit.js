(()=>{
  const q=id=>document.getElementById(id);
  function ensureDialog(){
    if(q('artistEditDialog')) return;
    document.body.insertAdjacentHTML('beforeend',`<dialog id="artistEditDialog"><form id="artistEditForm"><h3>Editar artista</h3><input id="artistEditId" type="hidden"><label>Nome<input id="artistEditName" required></label><label>Cachet base (€)<input id="artistEditFee" type="number" step=".01"></label><label>Telefone<input id="artistEditPhone"></label><label>E-mail<input id="artistEditEmail" type="email"></label><label>Manager<input id="artistEditManager"></label><label>E-mail do manager<input id="artistEditManagerEmail" type="email"></label><label>Telefone do manager<input id="artistEditManagerPhone"></label><label>NIF / Nº fiscal<input id="artistEditTax"></label><label>Nome de faturação<input id="artistEditBillingName"></label><label>E-mail de faturação<input id="artistEditBillingEmail" type="email"></label><label>Morada de faturação<textarea id="artistEditBillingAddress"></textarea></label><label>Notas<textarea id="artistEditNotes"></textarea></label><div class="actions"><button type="button" class="secondary" id="artistEditCancel">Cancelar</button><button type="submit">Guardar alterações</button></div></form></dialog>`);
    q('artistEditCancel').onclick=()=>q('artistEditDialog').close();
    q('artistEditForm').onsubmit=saveArtist;
  }
  function openArtistEdit(id){
    const a=artists.find(x=>x.id===id); if(!a) return;
    if(!can('artists_manage')) return toast('Sem permissão para editar artistas.');
    q('artistEditId').value=a.id;
    q('artistEditName').value=a.name||'';
    q('artistEditFee').value=a.base_fee??'';
    q('artistEditPhone').value=a.contact_phone||'';
    q('artistEditEmail').value=a.contact_email||'';
    q('artistEditManager').value=a.manager_name||'';
    q('artistEditManagerEmail').value=a.manager_email||'';
    q('artistEditManagerPhone').value=a.manager_phone||'';
    q('artistEditTax').value=a.tax_number||'';
    q('artistEditBillingName').value=a.billing_name||'';
    q('artistEditBillingEmail').value=a.billing_email||'';
    q('artistEditBillingAddress').value=a.billing_address||'';
    q('artistEditNotes').value=a.notes||'';
    q('artistEditDialog').showModal();
  }
  async function saveArtist(e){
    e.preventDefault();
    const id=q('artistEditId').value;
    const patch={
      name:q('artistEditName').value.trim(),
      base_fee:q('artistEditFee').value||null,
      contact_phone:q('artistEditPhone').value.trim()||null,
      contact_email:q('artistEditEmail').value.trim()||null,
      manager_name:q('artistEditManager').value.trim()||null,
      manager_email:q('artistEditManagerEmail').value.trim()||null,
      manager_phone:q('artistEditManagerPhone').value.trim()||null,
      tax_number:q('artistEditTax').value.trim()||null,
      billing_name:q('artistEditBillingName').value.trim()||null,
      billing_email:q('artistEditBillingEmail').value.trim()||null,
      billing_address:q('artistEditBillingAddress').value.trim()||null,
      notes:q('artistEditNotes').value.trim()||null,
      updated_at:new Date().toISOString()
    };
    const r=await sb.from('artists').update(patch).eq('id',id).select('*').single();
    if(r.error) return toast(r.error.message);
    q('artistEditDialog').close();
    toast('Artista atualizado');
    await loadAll();
  }
  function injectButtons(){
    const list=q('artistList'); if(!list) return;
    const cards=[...list.querySelectorAll('.item')];
    cards.forEach((card,i)=>{
      const a=artists[i]; if(!a) return;
      const actions=card.querySelector('.file-actions')||card;
      if(can('artists_manage')&&!actions.querySelector('[data-artist-edit]')){
        const b=document.createElement('button');
        b.type='button'; b.className='secondary tiny'; b.textContent='Editar';
        b.dataset.artistEdit=a.id;
        b.onclick=e=>{e.stopPropagation();openArtistEdit(a.id)};
        const filesBtn=actions.querySelector('[data-artist-files]');
        if(filesBtn) actions.insertBefore(b,filesBtn); else actions.appendChild(b);
      }
    });
  }
  ensureDialog();
  const obs=new MutationObserver(()=>injectButtons());
  const wait=setInterval(()=>{const list=q('artistList'); if(list){clearInterval(wait);obs.observe(list,{childList:true,subtree:true});injectButtons()}},200);
  setTimeout(()=>clearInterval(wait),15000);
})();