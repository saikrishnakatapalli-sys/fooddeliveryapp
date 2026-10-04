const cartGet=()=>S.get('cart',[]);

function cartAdd(id,q=1){
  const c=cartGet(),
  x=c.find(i=>i.id==id);
  x?x.q+=q:c.push({id,q});
  S.set('cart',c);
  updCart();
  toast('Added to cart')
}

function cartSet(id,q){
  let c=cartGet();
  if(q<=0)c=c.filter(i=>i.id!=id);
  else c.find(i=>i.id==id).q=q;
  S.set('cart',c);
  updCart()
}

function totals(){
  const c=cartGet()
    .map(i=>({...i,f:foodById(i.id)}))
    .filter(i=>i.f),
  sub=c.reduce((s,i)=>s+sell(i.f)*i.q,0),
  r=c[0]&&rest(c[0].f.rid),
  fee=c.length?(r?r.fee:40):0,
  tax=Math.ceil(sub*.05),
  disc=0;
  return{c,sub,fee,tax,disc,total:sub+fee+tax-disc}
}

const sumHTML=(t,ex=0)=>`<h3>Order Summary</h3><p><span>Subtotal</span><span>${inr(t.sub)}</span></p><p><span>Delivery Fee</span><span>${inr(t.fee)}</span></p>${ex?`<p><span>Express Delivery</span><span>${inr(ex)}</span></p>`:''}<p><span>Taxes (5%)</span><span>${inr(t.tax)}</span></p><p class=tot><span>TOTAL</span><span>${inr(t.total+ex)}</span></p>`;

document.addEventListener('click',e=>{
  const q=e.target.closest('[data-cq]'),
  r=e.target.closest('[data-rm]');

  if(q){
    const c=cartGet().find(i=>i.id==q.dataset.cq);
    cartSet(c.id,c.q+ +q.dataset.d);
    redraw()
  }

  if(r){
    cartSet(r.dataset.rm,0);
    toast('Item removed');
    redraw()
  }
});

PAGES.cart={
  role:'customer',
  title:'Cart',
  render(){
    const t=totals();

    if(!t.c.length)return `<h1>Cart</h1>`+empty('🛒','Your cart is empty','Add delicious food to your cart.','Explore Restaurants',L('restaurants.html'));

    return `<h1>Your Cart</h1><p class=muted>${t.c.length} item(s) from ${rest(t.c[0].f.rid).name}</p><div class="cols mt"><div class=card>${t.c.map(i=>`<div class=ci><img src="${foodImg(i.f)}" alt="${i.f.name}"><div class=i><b>${i.f.name}</b><div class=muted>${rest(i.f.rid).name}</div><div>${inr(sell(i.f))}</div></div><div class=qty><button data-cq="${i.id}" data-d=-1 aria-label=Decrease>−</button><span>${i.q}</span><button data-cq="${i.id}" data-d=1 aria-label=Increase>+</button></div><b>${inr(sell(i.f)*i.q)}</b><button class="btn sm red" data-rm="${i.id}" aria-label="Remove item">🗑</button></div>`).join('')}<a class="btn ghost mt" href="${L('restaurants.html')}">Continue Shopping</a></div><aside class="card sum">${sumHTML(t)}<a class="btn block mt" href="${L('checkout.html')}">Proceed to Checkout</a></aside></div>`
  }
};

PAGES.checkout={
  role:'customer',
  title:'Checkout',
  render(){
    const t=totals();

    if(!t.c.length)return `<h1>Checkout</h1>`+empty('🛒','Your cart is empty','Add delicious food to your cart.','Explore Restaurants',L('restaurants.html'));

    const u=curUser();

    return `<h1>Checkout</h1><div class="cols mt"><div><div class=card><h3>1. Delivery Address</h3>${u.addresses.map((a,i)=>`<label class=opt><input type=radio name=addr value=${i}><div><b>${a.label}</b><div class=muted>${a.text}</div></div></label>`).join('')}<button class="btn ghost sm" id=na>+ Add New Address</button></div>
<div class="card mt"><h3>2. Delivery Options</h3><label class=opt><input type=radio name=dl value=0 checked><div><b>Standard Delivery</b><div class=muted>30–40 min • Included</div></div></label><label class=opt><input type=radio name=dl value=30><div><b>Express Delivery</b><div class=muted>15–20 min • +₹30</div></div></label></div>
<div class="card mt"><h3>3. Payment Method (demo)</h3>${['UPI','Credit/Debit Card','Cash on Delivery','Wallet'].map((p,i)=>`<label class=opt><input type=radio name=pay value="${p}" ${i?'':'checked'}><div>${['📱','💳','💵','👛'][i]} ${p}</div></label>`).join('')}</div></div>
<aside class="card sum"><div id=cs></div><div class="mt">${t.c.map(i=>`<p class=muted><span>${i.f.name} × ${i.q}</span><span>${inr(sell(i.f)*i.q)}</span></p>`).join('')}</div><button class="btn block mt" id=po>Place Order</button></aside></div>`
  },

  init(){
    const upd=()=>$('#cs').innerHTML=sumHTML(totals(),+$('[name=dl]:checked').value);

    upd();

    $$('[name=dl]').forEach(r=>r.onchange=upd);

    $('#na').onclick=()=>addAddr(redraw);

    $('#po').onclick=()=>{
      const a=$('[name=addr]:checked'),
      t=totals(),
      ex=+$('[name=dl]:checked').value,
      u=curUser();

      if(!t.c.length)return toast('Cart is empty','bad');
      if(!a)return toast('Please select an address','bad');

      const o={
        id:'FN'+Math.floor(100000+Math.random()*900000),
        email:u.email,
        cust:u.name,
        rid:t.c[0].f.rid,
        items:t.c.map(i=>({id:i.id,name:i.f.name,q:i.q,price:sell(i.f)})),
        total:t.total+ex,
        addr:u.addresses[a.value].text,
        pay:$('[name=pay]:checked').value,
        st:0,
        time:new Date().toISOString()
      };

      S.set('orders',[o,...S.get('orders')]);
      S.set('cart',[]);
      notify(`Your order #${o.id} has been placed.`);
      updCart();
      toast('Order placed successfully');

      $('#main').innerHTML=`<div class="card done"><div class=tick>✓</div><h1>Order Placed Successfully!</h1><p class=muted>Order ID</p><h2>#${o.id}</h2><p class=mt>Estimated Delivery: <b>${ex?'15–20':'30–40'} minutes</b></p><div class="row mt" style="justify-content:center"><a class=btn href="${L('tracking.html?id='+o.id)}">Track Order</a><a class="btn ghost" href="${L('restaurants.html')}">Continue Shopping</a></div></div>`
    }
  }
};