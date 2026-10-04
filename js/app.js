const $=(s,r=document)=>r.querySelector(s),
$$=(s,r=document)=>[...r.querySelectorAll(s)];

const inr=n=>'₹'+Math.round(n).toLocaleString('en-IN');

const L=p=>(ROOT?'':'pages/')+p;

const S={
  get(k,d){
    try{
      const v=JSON.parse(localStorage.getItem('fn_'+k));
      return v??d
    }catch(e){
      return d
    }
  },
  set(k,v){
    try{
      localStorage.setItem('fn_'+k,JSON.stringify(v))
    }catch(e){
      toast('Storage full - use a smaller image','bad')
    }
  }
};

const PAGES={};

if(S.get('ver')!=2){
  Object.keys(localStorage)
    .filter(k=>k.startsWith('fn_'))
    .forEach(k=>localStorage.removeItem(k));
  S.set('ver',2)
}

if(!S.get('foods')){
  S.set('foods',FOODS);
  S.set('users',USERS);
  S.set('orders',mkOrders());
  S.set('restaurants',RESTAURANTS);
  S.set('notifs',['Your account is ready. Start ordering!','Welcome to '+BRAND.name+'!'])
}

const me=()=>S.get('session');

const curUser=()=>S.get('users').find(u=>u.email==me().email);

const rest=id=>S.get('restaurants').find(r=>r.id==id);

const foodImg=f=>f.img||IMG(slug(f.cat));

const rImg=r=>r.cover||IMG(r.img);

const foodById=id=>S.get('foods').find(f=>f.id==id);

const notify=m=>S.set('notifs',[m,...S.get('notifs',[])].slice(0,8));

const applyTheme=()=>document.documentElement.dataset.theme=S.get('theme','light');

const empty=(em,t,s,b,h)=>`<div class=empty><div class=em>${em}</div><h3>${t}</h3><p class=muted>${s||''}</p>${b?`<a class=btn href="${h}">${b}</a>`:''}</div>`;

function toast(m,t='ok'){
  let w=$('#toasts');
  if(!w){
    w=document.createElement('div');
    w.id='toasts';
    document.body.append(w)
  }
  const e=document.createElement('div');
  e.className='toast '+(t=='bad'?'bad':'');
  e.textContent=(t=='bad'?'✕ ':'✓ ')+m;
  w.append(e);
  setTimeout(()=>e.remove(),2800)
}

function modal(h){
  closeModal();
  const m=document.createElement('div');
  m.className='ov';
  m.innerHTML=`<div class="modal card" role=dialog aria-modal=true><button class=x aria-label=Close onclick="closeModal()">×</button>${h}</div>`;
  m.onclick=e=>e.target===m&&closeModal();
  document.body.append(m)
}

const closeModal=()=>$('.ov')&&$('.ov').remove();

function confirmBox(msg,fn){
  modal(`<h3>Are you sure?</h3><p class=muted>${msg}</p><div class="row end"><button class="btn ghost" onclick="closeModal()">Cancel</button><button class="btn red" id=cy>Confirm</button></div>`);
  $('#cy').onclick=()=>{
    closeModal();
    fn()
  }
}

function readImg(input,cb){
  const f=input.files[0];
  if(!f)return;
  const r=new FileReader();
  r.onload=()=>{
    const i=new Image();
    i.onload=()=>{
      const k=Math.min(1,500/Math.max(i.width,i.height)),
      c=document.createElement('canvas');
      c.width=i.width*k;
      c.height=i.height*k;
      c.getContext('2d').drawImage(i,0,0,c.width,c.height);
      cb(c.toDataURL('image/jpeg',.8))
    };
    i.src=r.result
  };
  r.readAsDataURL(f)
}

function updCart(){
  const e=$('#cc');
  if(e)e.textContent=S.get('cart',[]).reduce((a,c)=>a+c.q,0)
}

const guard=role=>{
  const s=me();
  if(!s||s.role!==role){
    location.href=ROOT+'index.html?role='+role;
    return false
  }
  return true
};

const logout=()=>confirmBox('Do you want to log out?',()=>{
  localStorage.removeItem('fn_session');
  location.href=ROOT+'index.html'
});

const CNAV=[
  ['🏠','Dashboard','customer-dashboard'],
  ['🍽️','Restaurants','restaurants'],
  ['📖','Food Menu','restaurant-menu'],
  ['📦','My Orders','orders'],
  ['🛒','Cart','cart'],
  ['❤️','Favorites','favorites'],
  ['📍','Addresses','profile#addresses'],
  ['👤','Profile','profile'],
  ['💬','Help & Support','#help']
];

const ONAV=[
  ['📊','Dashboard','owner-dashboard'],
  ['🧾','Orders','owner-orders'],
  ['🍔','Menu','owner-menu'],
  ['➕','Add Food','owner-add-food'],
  ['👥','Customers','owner-settings?tab=customers'],
  ['⭐','Reviews','owner-settings?tab=reviews'],
  ['🏪','Restaurant Profile','owner-profile'],
  ['⚙️','Settings','owner-settings']
];

function shell(P){
  const s=me(),
  u=curUser()||s,
  own=P.role=='owner',
  cur=location.pathname.split('/').pop().replace('.html',''),
  nav=own?ONAV:CNAV,
  n=S.get('notifs',[]);

  const act=pg=>{
    if(pg.includes('#'))return false;
    const[b,q]=pg.split('?');
    return b==cur&&(q?location.search.includes(q):!/offers=|tab=/.test(location.search))
  };

  const lnk=pg=>pg=='#help'?'#':L(pg.replace(/^([^?#]+)/,'$1.html'));

  $('#app').innerHTML=`<div class=layout><aside class=side id=side><a class=brand href="${L(own?'owner-dashboard.html':'customer-dashboard.html')}"><img src="${IMG('logo')}" alt="${BRAND.name} logo"><span>${BRAND.name}</span></a><nav>${nav.map(([i,t,p])=>`<a href="${lnk(p)}" class="${act(p)?'on':''}" ${p=='#help'?'data-help':''}>${i} ${t}</a>`).join('')}<a href=# id=lo>🚪 Logout</a></nav></aside>
  <div class=content><header class=top><button class="icon burger" id=bg aria-label=Menu>☰</button>${own?'':`<form id=sf class=sbox><input name=q placeholder="Search restaurants or dishes..." aria-label=Search></form>`}<span class=sp></span>
  <div class=dd><button class=icon id=nb aria-label=Notifications>🔔<i class=dot>${n.length}</i></button><div class=menu id=nm>${n.map(x=>`<p>🔔 ${x}</p>`).join('')||'<p>No notifications</p>'}</div></div>
  ${own?'':`<a class=icon href="${L('cart.html')}" aria-label=Cart>🛒<i class=dot id=cc>0</i></a>`}
  <div class=dd><button class=prof id=pb><img src="${u.photo||IMG('profile')}" alt=""><span>${s.name.split(' ')[0]}</span></button><div class=menu id=pm><a href="${L(own?'owner-profile.html':'profile.html')}">👤 Profile</a><a href=# id=lo2>🚪 Logout</a></div></div></header><main id=main></main></div></div>`;

  $('#bg').onclick=e=>{
    e.stopPropagation();
    $('#side').classList.toggle('open')
  };

  $('#nb').onclick=e=>{
    e.stopPropagation();
    $('#pm').classList.remove('show');
    $('#nm').classList.toggle('show')
  };

  $('#pb').onclick=e=>{
    e.stopPropagation();
    $('#nm').classList.remove('show');
    $('#pm').classList.toggle('show')
  };

  document.addEventListener('click',()=>{
    $$('.menu').forEach(m=>m.classList.remove('show'))
  });

  [$('#lo'),$('#lo2')].forEach(b=>b.onclick=e=>{
    e.preventDefault();
    logout()
  });

  $$('[data-help]').forEach(a=>a.onclick=e=>{
    e.preventDefault();
    modal(`<h3>Help & Support</h3><p class=muted>We're here 24/7.</p><p class=mt>📞 +91 98765 00000</p><p>✉️ support@foodnest.com</p>`)
  });

  if($('#sf'))$('#sf').onsubmit=e=>{
    e.preventDefault();
    location.href=L('restaurants.html?q='+encodeURIComponent(e.target.q.value))
  };

  window.redraw=()=>{
    $('#main').innerHTML=P.render();
    P.init&&P.init();
    updCart()
  };

  redraw()
}

document.addEventListener('DOMContentLoaded',()=>{
  applyTheme();
  const P=PAGES[document.body.dataset.page];
  if(!P)return;
  document.title=P.title+' • '+BRAND.name;
  if(P.role){
    if(guard(P.role))shell(P)
  }else{
    $('#app').innerHTML=P.render();
    P.init&&P.init()
  }
});