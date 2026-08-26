self.addEventListener('push',event=>{
  let data={};
  try{data=event.data?event.data.json():{}}catch(_){data={title:'Team Duck',body:event.data?.text?.()||'Tens uma nova notificação.'}}
  const title=data.title||'Team Duck';
  const options={
    body:data.body||'Tens uma nova notificação.',
    icon:data.icon||'/401FB0DA-DAD2-49CE-89E0-A9850A0722F7.png',
    badge:data.badge||'/401FB0DA-DAD2-49CE-89E0-A9850A0722F7.png',
    tag:data.tag||'teamduck',
    renotify:true,
    data:{url:data.url||'/',...(data.data||{})}
  };
  event.waitUntil(self.registration.showNotification(title,options));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const target=new URL(event.notification.data?.url||'/',self.location.origin).href;
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
    for(const c of list){if('focus'in c){c.navigate?.(target);return c.focus()}}
    return clients.openWindow?clients.openWindow(target):undefined;
  }));
});