const favs=()=>S.get('favs',{r:[],f:[]});

const restCard=r=>`<article class="card rc"><div class=im><img src="${rImg(r)}" alt="${r.name}" loading=lazy>${r.offer?`<span class=offer>${r.offer}</span>`:''}<button class=heart data-fav="r:${r.id}" aria-label="Favorite">${favs().r.includes(r.id)?'❤️':'🤍'}</button></div><div class=body><div class="row between"><h3>${r.name}</h3><span class=rate>★ ${r.rating}</span></div><p class=muted>${'★'.repeat(Math.round(r.rating))} (${r.reviews.toLocaleString()} reviews)</p><p class=muted>${r.cuisine} ${r.veg?'🟢 Pure Veg':''}</p><p class=muted>⏱ ${r.time} min • ${r.dist} km • ${'₹'.repeat(r.price)}</p><a class="btn block mt" href="${L('restaurant-menu.html?r='+r.id)}">View Menu</a></div></article>`;

const foodCard=f=>`<article class="card fc"><img src="${foodImg(f)}" alt="${f.name}"><div class=i><div class="row between"><span><i class="vg ${f.veg?'':'nv'}" title="${f.veg?'Veg':'Non-veg'}"></i> <b>${f.name}</b></span><button class="heart sm" data-fav="f:${f.id}" aria-label=Favorite>${favs().f.includes(f.id)?'❤️':'🤍'}</button></div><p class=muted>${f.desc}</p><p><span class=rate>★ ${f.rating}</span> <b>${inr(sell(f))}</b>${f.disc?`<span class=old>${inr(f.mrp)}</span> <small style="color:#16a34a">${f.disc}% off</small>`:''}</p>${f.avail?`<div class=row><div class=qty><button data-qd=-1 aria-label=Less>−</button><span>1</span><button data-qd=1 aria-label=More>+</button></div><button class="btn sm alt" data-add="${f.id}">Add to Cart</button></div>`:'<span class="badge s6">Currently unavailable</span>'}</div></article>`;

function filterR(o){
  const fs=S.get('foods');
  return S.get('restaurants').filter(r=>{
    const rf=fs.filter(f=>f.rid==r.id),
    q=(o.q||'').toLowerCase();

    return (!q||[r.name,r.cuisine,...rf.map(f=>f.name)].join(' ').toLowerCase().includes(q))
      &&(!o.cat||rf.some(f=>f.cat==o.cat))
      &&(!o.price||r.price<=+o.price)
      &&(!o.rating||r.rating>=+o.rating)
      &&(!o.time||parseInt(r.time)<=+o.time)
      &&(!o.veg||r.veg)
      &&(!o.offers||r.offer)
  }).sort((a,b)=>o.sort=='time'?parseInt(a.time)-parseInt(b.time):o.sort=='price'?a.price-b.price:b.rating-a.rating)
}

document.addEventListener('click',e=>{
  const t=e.target,
  fv=t.closest('[data-fav]'),
  qd=t.closest('[data-qd]'),
  ad=t.closest('[data-add]');

  if(fv){
    const[k,id]=fv.dataset.fav.split(':'),
    F=favs(),
    a=F[k],
    i=a.indexOf(+id);

    i<0?a.push(+id):a.splice(i,1);
    S.set('favs',F);
    toast(i<0?'Added to favorites':'Removed from favorites');
    fv.textContent=i<0?'❤️':'🤍';

    if(document.body.dataset.page=='favorites'&&i>=0)redraw()
  }

  if(qd){
    const s=qd.parentNode.querySelector('span');
    s.textContent=Math.max(1,+s.textContent+ +qd.dataset.qd)
  }

  if(ad){
    const s=ad.parentNode.querySelector('.qty span');
    cartAdd(+ad.dataset.add,+s.textContent);
    s.textContent=1
  }
});

PAGES['customer-dashboard']={
  role:'customer',
  title:'Dashboard',
  render(){
    const n=me().name.split(' ')[0],
    h=new Date().getHours(),
    g=h<12?'Morning':h<17?'Afternoon':'Evening',
    ao=S.get('orders').find(o=>o.email==me().email&&o.st<5);

    return `<h1>Good ${g}, ${n}! 👋</h1><p class=muted>What are you craving today?</p><form class=searchbar id=ds><input name=q placeholder="Search for restaurants, dishes or cuisines..." aria-label=Search><button class=btn>🔍 Search</button><a class="btn ghost" href="${L('restaurants.html')}">⚙ Filters & Sort</a></form>
${ao?`<div class="card row between"><div><b>Order #${ao.id}</b> is <span class="badge s${ao.st}">${ST[ao.st]}</span></div><a class="btn sm" href="${L('tracking.html?id='+ao.id)}">Track Order</a></div>`:''}
<h2 class=sec>Categories</h2><div class=cats>${CATS.map(c=>`<a class=cat href="${L('restaurants.html?cat='+encodeURIComponent(c))}"><img src="${IMG(slug(c))}" alt="${c}"><span>${c}</span></a>`).join('')}</div>
<h2 class=sec>Restaurants</h2><div class=grid>${S.get('restaurants').map(restCard).join('')}</div>`
  },

  init(){
    $('#ds').onsubmit=e=>{
      e.preventDefault();
      location.href=L('restaurants.html?q='+encodeURIComponent(e.target.q.value))
    }
  }
};

PAGES.restaurants={
  role:'customer',
  title:'Restaurants',
  render(){
    const p=new URLSearchParams(location.search);

    return `<h1>Restaurants</h1><div class=searchbar><input id=fq value="${p.get('q')||''}" placeholder="Search for restaurants, dishes or cuisines..." aria-label=Search></div>
<div class=filters id=fl><select id=fc aria-label=Cuisine><option value="">Cuisine</option>${CATS.map(c=>`<option ${p.get('cat')==c?'selected':''}>${c}</option>`).join('')}</select><select id=fp aria-label=Price><option value="">Price</option><option value=1>₹</option><option value=2>₹₹</option><option value=3>₹₹₹</option></select><select id=fr aria-label=Rating><option value="">Rating</option><option value=4>4.0+</option><option value=4.5>4.5+</option></select><select id=ft aria-label="Delivery time"><option value="">Delivery Time</option><option value=20>Under 20 min</option><option value=30>Under 30 min</option></select><label><input type=checkbox id=fv> Veg only</label><select id=fs aria-label=Sort><option value=rating>Sort: Rating</option><option value=time>Sort: Delivery time</option><option value=price>Sort: Price</option></select></div><div class=grid id=rg></div>`
  },

  init(){
    const g=$('#rg'),
    draw=()=>{
      const l=filterR({
        q:$('#fq').value,
        cat:$('#fc').value,
        price:$('#fp').value,
        rating:$('#fr').value,
        time:$('#ft').value,
        veg:$('#fv').checked,
        sort:$('#fs').value
      });

      g.innerHTML=l.length?l.map(restCard).join(''):empty('🔍','No restaurants found','Try changing your filters.')
    };

    g.innerHTML=Array(6).fill('<div class=skel></div>').join('');
    setTimeout(draw,500);
    $('#fl').oninput=draw;
    $('#fq').oninput=draw
  }
};

PAGES['restaurant-menu']={
  role:'customer',
  title:'Menu',
  cat:'Recommended',
  render(){
    const id=+new URLSearchParams(location.search).get('r')||1,
    r=rest(id),
    fs=S.get('foods').filter(f=>f.rid==id),
    cats=['Recommended',...new Set(fs.map(f=>f.cat))],
    rec=fs.filter(f=>f.rating>=4.3),
    list=this.cat=='Recommended'?(rec.length?rec:fs):fs.filter(f=>f.cat==this.cat);

    return `<div class=cover><!-- Replace with your restaurant cover image --><img src="${rImg(r)}" alt="${r.name}"><div class=t><h1>${r.name}</h1><p>${r.cuisine} • ⏱ ${r.time} min • ★ ${r.rating} (${r.reviews})</p></div></div><div class="card mt"><p>${r.about}</p><p class=muted>📍 ${r.address} • ${r.open}–${r.close} • Min order ${inr(r.minOrder)} • Delivery ${inr(r.fee)}</p><button class="btn ghost sm mt" data-fav="r:${r.id}">${favs().r.includes(r.id)?'❤️':'🤍'}</button></div>
<div class="tabs mt">${cats.map(c=>`<button data-c="${c}" class="${c==this.cat?'on':''}">${c}</button>`).join('')}</div><div class="foodgrid mt">${list.length?list.map(foodCard).join(''):empty('🍽️','No dishes here yet')}</div>`
  },

  init(){
    $$('.tabs button').forEach(b=>b.onclick=()=>{
      PAGES['restaurant-menu'].cat=b.dataset.c;
      redraw()
    })
  }
};

PAGES.favorites={
  role:'customer',
  title:'Favorites',
  render(){
    const F=favs(),
    rs=S.get('restaurants').filter(r=>F.r.includes(r.id)),
    fs=S.get('foods').filter(f=>F.f.includes(f.id));

    if(!rs.length&&!fs.length)return `<h1>Favorites</h1>`+empty('💔','No favorites yet','Your favorite restaurants will appear here.','Explore Restaurants',L('restaurants.html'));

    return `<h1>Favorites</h1>${rs.length?`<h2 class=sec>Restaurants</h2><div class=grid>${rs.map(restCard).join('')}</div>`:''}${fs.length?`<h2 class=sec>Dishes</h2><div class=foodgrid>${fs.map(foodCard).join('')}</div>`:''}`
  }
};