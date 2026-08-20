(()=>{
function q(id){return document.getElementById(id)}
function artistFor(id){try{return (artists||[]).find(a=>String(a.id)===String(id))}catch(_){return null}}
function fillFee(){const sel=q('concertArtist'),fee=q('concertFee');if(!sel||!fee)return;const a=artistFor(sel.value);fee.value=a&&a.base_fee!=null&&a.base_fee!==''?Number(a.base_fee):'';fee.dispatchEvent(new Event('input',{bubbles:true}));fee.dispatchEvent(new Event('change',{bubbles:true}))}
function bind(){const sel=q('concertArtist');if(!sel||sel.dataset.feeAutofill)return;sel.dataset.feeAutofill='1';sel.addEventListener('change',fillFee);const btn=q('newConcert');btn?.addEventListener('click',()=>setTimeout(()=>{const s=q('concertArtist');if(s?.value)fillFee()},0))}
function boot(){bind();setTimeout(bind,300);setTimeout(bind,1200)}
if(document.readyState==='loading')addEventListener('load',boot,{once:true});else boot();
window.TeamDuckArtistFee={refresh:bind,fill:fillFee};
})();