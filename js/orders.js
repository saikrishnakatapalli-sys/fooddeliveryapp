const STEPS=[
  'Order Placed',
  'Restaurant Accepted',
  'Food Preparing',
  'Food Ready',
  'Out for Delivery',
  'Delivered'
];

const fmt=t=>new Date(t).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'});

function setStatus(id,st){
  const os=S.get('orders'),
  o=os.find(x=>x.id==id);
  o.st=st;
  S.set('orders',os);
  notify([
    `Your order #${id} has been placed.`,
    `Your order #${id} has been accepted.`,
    'Your food is being prepared.',
    'Your food is ready.',
    'Your order is out for delivery.',
    `Your order #${id} has been delivered.`,
    `Your order #${id} was cancelled.`
  ][st])
}

function receipt(o){
  const t=`${BRAND.name} Receipt
Order #${o.id}
${rest(o.rid).name}
${fmt(o.time)}

${o.items.map(i=>`${i.name} x${i.q}  ${inr(i.price*i.q)}`).join('\n')}

Total: ${inr(o.total)}
Payment: ${o.pay}
Deliver to: ${o.addr}`;

  Object.assign(document.createElement('a'),{
    href:URL.createObjectURL(new Blob([t],{type:'text/plain'})),
    download:`receipt-${o.id}.txt`
  }).click();

  toast('Receipt downloaded')
}

const orderById=id=>S.get('orders').find(o=>o.id==id);

document.addEventListener('click',e=>{
  const v=e.target.closest('[data-ov]'),
  r=e.target.closest('[data-ro]'),
  d=e.target.closest('[data-rc]');

  if(v){
    const o=orderById(v.dataset.ov);
    modal(`<h3>Order #${o.id}</h3><p class=muted>${rest(o.rid).name} • ${fmt(o.time)}</p><div class=mt>${o.items.map(i=>`<p class="row between"><span>${i.name} × ${i.q}</span><b>${inr(i.price*i.q)}</b></p>`).join('')}</div><p class="row between mt"><b>Total</b><b>${inr(o.total)}</b></p><p class=muted>💳 ${o.pay}<br>📍 ${o.addr}</p><span class="badge s${o.st}">${ST[o.st]}</span>`)
  }

  if(r){
    orderById(r.dataset.ro).items.forEach(i=>foodById(i.id)&&cartSet(i.id,(cartGet().find(c=>c.id==i.id)||{q:0}).q+i.q)||(foodById(i.id)&&0));
    location.href=L('cart.html')
  }

  if(d)receipt(orderById(d.dataset.rc))
});

PAGES.orders={
  role:'customer',
  title:'My Orders',
  tab:'All',
  render(){
    const T={
      All:()=>1,
      Ongoing:o=>o.st<5,
      Completed:o=>o.st==5,
      Cancelled:o=>o.st==6
    },
    os=S.get('orders').filter(o=>o.email==me().email&&T[this.tab](o));

    return `<h1>My Orders</h1><div class="tabs mt">${Object.keys(T).map(t=>`<button data-t=${t} class="${t==this.tab?'on':''}">${t}</button>`).join('')}</div><div class=mt>${os.length?os.map(o=>`<div class="card oc"><div class="row between"><b>#${o.id}</b><span class="badge s${o.st}">${ST[o.st]}</span></div><p><b>${rest(o.rid).name}</b> • ${fmt(o.time)}</p><p class=muted>${o.items.map(i=>`${i.name} × ${i.q}`).join(', ')}</p><div class="row between mt"><b>${inr(o.total)}</b><div class=row><button class="btn sm ghost" data-ov="${o.id}">View Details</button>${o.st<5?`<a class="btn sm" href="${L('tracking.html?id='+o.id)}">Track Order</a>`:''}<button class="btn sm alt" data-ro="${o.id}">Reorder</button><button class="btn sm ghost" data-rc="${o.id}">Download Receipt</button></div></div></div>`).join(''):empty('📦',"You haven't placed any orders yet.",'','Order Now',L('restaurants.html'))}</div>`
  },
  init(){
    $$('.tabs button').forEach(b=>b.onclick=()=>{
      PAGES.orders.tab=b.dataset.t;
      redraw()
    })
  }
};

PAGES.tracking={
  role:'customer',
  title:'Track Order',
  render(){
    const id=new URLSearchParams(location.search).get('id'),
    mine=S.get('orders').filter(o=>o.email==me().email),
    o=mine.find(x=>x.id==id)||mine[0];

    if(!o)return `<h1>Track Order</h1>`+empty('📦',"You haven't placed any orders yet.",'','Order Now',L('restaurants.html'));

    this.oid=o.id;

    return `<h1>Track Order</h1><div class="cols mt"><div class=card><div class="row between"><h3>Order #${o.id}</h3><span class="badge s${o.st}">${ST[o.st]}</span></div>${o.st==6?empty('❌','This order was cancelled'):`<div class=tl>${STEPS.map((s,i)=>`<div class="${i<=o.st?'ok':''} ${i==o.st&&o.st<5?'now':''}">${s}</div>`).join('')}</div>`}</div>
<aside class=card><h3>Details</h3><p class=mt><b>${rest(o.rid).name}</b></p><p class=muted>${o.items.map(i=>`${i.name} × ${i.q}`).join(', ')}</p><p class=mt>Total: <b>${inr(o.total)}</b></p><p class=muted>📍 ${o.addr}</p><p class=mt>🛵 Delivery partner: <b>Ramesh K</b> <span class=muted>+91 90000 12345</span></p><p>⏱ Arrival: <b>${['Awaiting restaurant','35 min','25 min','15 min','8 min','Delivered'][Math.min(o.st,5)]}</b></p>${o.st==0?`<button class="btn red block mt" id=cn>Cancel Order</button>`:''}</aside></div>`
  },
  init(){
    const P=PAGES.tracking;

    if($('#cn'))$('#cn').onclick=()=>confirmBox('Cancel this order?',()=>{
      setStatus(P.oid,6);
      toast('Order cancelled');
      redraw()
    });

    clearInterval(P.t);

    P.t=setInterval(()=>{
      const o=orderById(P.oid);
      if(o&&o.st<5){
        setStatus(o.id,o.st+1);
        redraw()
      }
    },8000)
  }
};