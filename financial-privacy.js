(()=>{
function syncFinancialPermission(){
 const inviteRole=document.getElementById('inviteRole');
 const inviteFinancial=document.querySelector('[data-perm="financials_view"]');
 if(inviteRole&&inviteFinancial){
   const admin=inviteRole.value==='admin';
   inviteFinancial.checked=admin;
   inviteFinancial.disabled=!admin;
   const label=inviteFinancial.closest('label');if(label)label.style.opacity=admin?'1':'.45';
 }
 const memberRole=document.getElementById('memberRole');
 const memberFinancial=document.querySelector('[data-member-perm="financials_view"]');
 if(memberRole&&memberFinancial){
   const admin=memberRole.value==='admin';
   memberFinancial.checked=admin;
   memberFinancial.disabled=!admin;
   const label=memberFinancial.closest('label');if(label)label.style.opacity=admin?'1':'.45';
 }
}
addEventListener('load',()=>{
 const inviteRole=document.getElementById('inviteRole');
 const memberRole=document.getElementById('memberRole');
 inviteRole?.addEventListener('change',syncFinancialPermission);
 memberRole?.addEventListener('change',syncFinancialPermission);
 document.getElementById('newMember')?.addEventListener('click',()=>setTimeout(syncFinancialPermission,0));
 document.querySelectorAll('[data-member]').forEach(x=>x.addEventListener('click',()=>setTimeout(syncFinancialPermission,0)));
 setTimeout(syncFinancialPermission,300);
});
})();