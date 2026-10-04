const OWN=1,
oo=()=>S.get('orders').filter(o=>o.rid==OWN),
myFoods=()=>S.get('foods').filter(f=>f.rid==OWN);

const bars=(l,v)=>{
  const m=Math.max(...v,1);

  return `<div class=bars>${l.map((x,i)=>`<div>${v[i]}<i style="height:${v[i]/m*80}%"></i>${x}</div>`).join('')}</div>`
};

document.addEventListener('click',e=>{
  const b=e.target.closest('[data-os]'),
  t=e.target.closest('[data-tg]'),
  d=e.target.closest('[data-del]');

  if(b){
    const[id,st]=b.dataset.os.split(':'),
    go=()=>{
      setStatus(id,+st);
      toast(`Order #${id}: ${ST[st]}`);
      redraw()
    };

    +st==6?confirmBox('Reject this order?',go):go()
  }

  if(t){
    const fs=S.get('foods'),
    f=fs.find(x=>x.id==t.dataset.tg);

    f.avail=!f.avail;
    S.set('foods',fs);
    toast(f.avail?'Food enabled':'Food disabled');
    redraw()
  }

  if(d)confirmBox('Delete this food item?',()=>{
    S.set('foods',S.get('foods').filter(x=>x.id!=d.dataset.del));
    toast('Food item deleted');
    redraw()
  })
});

PAGES['owner-dashboard']={
  role:'owner',
  title:'Dashboard',
  render(){
    const o=oo(),
    rev=o.filter(x=>x.st<6).reduce((s,x)=>s+x.total,0),
    pop={};

    o.forEach(x=>x.items.forEach(i=>pop[i.name]=(pop[i.name]||0)+i.q));

    const pm=Object.entries(pop)
      .sort((a,b)=>b[1]-a[1])
      .slice(0,5),
    mx=pm[0]?pm[0][1]:1;

    const c=(i,t,v)=>`<div class="card stat"><div class=ic>${i}</div><div><span class=muted>${t}</span><b>${v}</b></div></div>`;

    return `<h1>Owner Dashboard</h1><p class=muted>${rest(OWN).name} • today's overview</p><div class=stats>${c('🧾',"Today's Orders",o.length)}${c('💰',"Today's Revenue",inr(rev))}${c('⏳','Pending Orders',o.filter(x=>x.st==0).length)}${c('✅','Completed Orders',o.filter(x=>x.st==5).length)}${c('👥','Total Customers',S.get('users').filter(u=>u.role=='customer').length)}${c('🍔','Food Items',myFoods().length)}</div>
<div class=charts><div class=card><h3>Sales Overview (₹ thousands)</h3>${bars(['Mon','Tue','Wed','Thu','Fri','Sat','Today'],[12,15,11,18,22,27,Math.max(1,Math.round(rev/1000))])}</div><div class=card><h3>Orders Overview</h3>${bars(['Mon','Tue','Wed','Thu','Fri','Sat','Today'],[38,45,41,52,48,60,o.length])}</div><div class=card><h3>Popular Food Items</h3>${pm.map(([n,v])=>`<div class=hbar>${n} — ${v} sold<i style="width:${v/mx*100}%"></i></div>`).join('')||empty('🍽️','No sales yet')}</div></div>`
  }
};

PAGES['owner-orders']={
  role:'owner',
  title:'Orders',
  render(){
    const N={
      1:'Preparing',
      2:'Ready',
      3:'Dispatch',
      4:'Complete'
    },
    os=oo();

    return `<h1>Order Management</h1><div class="card mt tw">${os.length?`<table class=rt><thead><tr><th>Order ID<th>Customer<th>Items<th>Amount<th>Payment<th>Time<th>Status<th>Action</tr></thead><tbody>${os.map(o=>`<tr><td data-label="Order ID"><b>#${o.id}</b><td data-label=Customer>${o.cust}<td data-label=Items>${o.items.map(i=>i.name+' ×'+i.q).join(', ')}<td data-label=Amount>${inr(o.total)}<td data-label=Payment>${o.pay}<td data-label=Time>${new Date(o.time).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}<td data-label=Status><span class="badge s${o.st}">${ST[o.st]}</span><td data-label=Action><div class=row>${o.st==0?`<button class="btn sm green" data-os="${o.id}:1">Accept</button><button class="btn sm red" data-os="${o.id}:6">Reject</button>`:N[o.st]?`<button class="btn sm" data-os="${o.id}:${o.st+1}">${N[o.st]}</button>`:'—'}</div></tr>`).join('')}</tbody></table>`:empty('🧾','No orders yet')}</div>`
  }
};

PAGES['owner-menu']={
  role:'owner',
  title:'Menu',
  cat:'All',
  render(){
    const fs=myFoods(),
    l=fs.filter(f=>this.cat=='All'||f.cat==this.cat);

    return `<div class="row between"><h1>Menu Management</h1><a class=btn href="${L('owner-add-food.html')}">+ Add New Food</a></div><div class="tabs mt">${['All',...CATS].map(c=>`<button data-c="${c}" class="${c==this.cat?'on':''}">${c} (${c=='All'?fs.length:fs.filter(f=>f.cat==c).length})</button>`).join('')}</div>
<div class="card mt tw">${l.length?`<table class=rt><thead><tr><th>Image<th>Name<th>Category<th>Price<th>Rating<th>Status<th>Actions</tr></thead><tbody>${l.map(f=>`<tr><td data-label=Image><img class=thumb src="${foodImg(f)}" alt="${f.name}"><td data-label=Name><i class="vg ${f.veg?'':'nv'}"></i> <b>${f.name}</b><td data-label=Category>${f.cat}<td data-label=Price>${inr(sell(f))}<td data-label=Rating>★ ${f.rating}<td data-label=Status><span class="badge ${f.avail?'s5':'s6'}">${f.avail?'Available':'Disabled'}</span><td data-label=Actions><div class=row><a class="btn sm ghost" href="${L('owner-add-food.html?edit='+f.id)}">Edit</a><button class="btn sm" data-tg="${f.id}">${f.avail?'Disable':'Enable'}</button><button class="btn sm red" data-del="${f.id}">Delete</button></div></tr>`).join('')}</tbody></table>`:empty('🍽️','No food items','Add your first dish.','+ Add Food',L('owner-add-food.html'))}</div>`
  },

  init(){
    $$('.tabs button').forEach(b=>b.onclick=()=>{
      PAGES['owner-menu'].cat=b.dataset.c;
      redraw()
    })
  }
};

PAGES['owner-add-food']={
  role:'owner',
  title:'Add Food',
  render(){
    const id=+new URLSearchParams(location.search).get('edit'),
    f=(id&&foodById(id))||{};

    this.img=f.img||'';
    this.id=f.id;

    return `<h1>${f.id?'Edit':'Add'} Food</h1><form class="card mt" id=ff novalidate><div class=f2><div><label>Food Image</label><img id=pv class=thumb style="width:150px;height:110px" src="${f.img||IMG(slug(f.cat||'Burger'))}" alt="Preview"><!-- Replace default preview image in assets/images --><input type=file id=fi accept="image/*" class=mt></div><div></div>
<div><label for=n>Food Name</label><input id=n name=name value="${f.name||''}"></div><div><label for=c>Category</label><select id=c name=cat>${CATS.map(c=>`<option ${f.cat==c?'selected':''}>${c}</option>`).join('')}</select></div>
<div><label for=p>Price (₹)</label><input id=p name=mrp type=number min=1 value="${f.mrp||''}"></div><div><label for=d>Discount (%)</label><input id=d name=disc type=number min=0 max=90 value="${f.disc??0}"></div>
<div><label for=t>Preparation Time (min)</label><input id=t name=prep type=number min=1 value="${f.prep||20}"></div><div><label for=v>Type</label><select id=v name=veg><option value=1 ${f.veg!==0?'selected':''}>Veg</option><option value=0 ${f.veg===0?'selected':''}>Non-Veg</option></select></div></div>
<label for=ds>Description</label><textarea id=ds name=desc rows=3>${f.desc||''}</textarea><label class=row style="font-weight:500"><input type=checkbox name=avail ${f.avail!==false?'checked':''}> Available</label><div class="row mt"><button class=btn>${f.id?'Save Changes':'Add Food'}</button><a class="btn ghost" href="${L('owner-menu.html')}">Cancel</a></div></form>`
  },

  init(){
    const P=PAGES['owner-add-food'];

    $('#fi').onchange=e=>readImg(e.target,d=>{
      P.img=d;
      $('#pv').src=d
    });

    $('#ff').onsubmit=e=>{
      e.preventDefault();

      const v=Object.fromEntries(new FormData(e.target));

      if(!v.name.trim())return toast('Food name is required','bad');
      if(!(+v.mrp>0))return toast('Enter a valid price','bad');
      if(+v.disc<0||+v.disc>90)return toast('Discount must be 0–90%','bad');

      const fs=S.get('foods'),
      o={
        name:v.name.trim(),
        cat:v.cat,
        mrp:+v.mrp,
        disc:+v.disc,
        prep:+v.prep,
        veg:+v.veg,
        desc:v.desc||v.name,
        avail:!!v.avail,
        img:P.img||undefined
      };

      if(P.id){
        const i=fs.findIndex(x=>x.id==P.id);
        fs[i]={...fs[i],...o}
      }else fs.push({
        id:Math.max(...fs.map(x=>x.id))+1,
        rid:OWN,
        rating:4,
        ...o
      });

      S.set('foods',fs);
      toast(P.id?'Food item updated':'Food item added');
      setTimeout(()=>location.href=L('owner-menu.html'),700)
    }
  }
};

PAGES['owner-profile']={
  role:'owner',
  title:'Restaurant Profile',
  render(){
    const r=rest(OWN),
    f=(l,n,t='text')=>`<div><label>${l}</label><input name=${n} type=${t} value="${r[n]??''}"></div>`;

    this.logo=r.logo;
    this.cover=r.cover;

    return `<h1>Restaurant Profile</h1><form class="card mt" id=rf novalidate><div class=f2><div><label>Restaurant Logo</label><img id=lg class=avatar src="${r.logo||IMG('logo')}" alt=Logo><input type=file id=lf accept="image/*" class=mt></div><div><label>Cover Image</label><img id=cv class=thumb style="width:160px;height:90px" src="${rImg(r)}" alt=Cover><input type=file id=cf accept="image/*" class=mt></div>
${f('Restaurant Name','name')}${f('Cuisine','cuisine')}${f('Phone','phone','tel')}${f('Email','email','email')}${f('Opening Time','open','time')}${f('Closing Time','close','time')}${f('Minimum Order (₹)','minOrder','number')}${f('Delivery Fee (₹)','fee','number')}</div>${''}<label>Address</label><input name=address value="${r.address}"><label>Description</label><textarea name=about rows=3>${r.about}</textarea><button class="btn mt">Save Changes</button></form>`
  },

  init(){
    const P=PAGES['owner-profile'];

    $('#lf').onchange=e=>readImg(e.target,d=>{
      P.logo=d;
      $('#lg').src=d
    });

    $('#cf').onchange=e=>readImg(e.target,d=>{
      P.cover=d;
      $('#cv').src=d
    });

    $('#rf').onsubmit=e=>{
      e.preventDefault();

      const v=Object.fromEntries(new FormData(e.target));

      if(!v.name.trim())return toast('Restaurant name is required','bad');
      if(!/^\S+@\S+\.\S+$/.test(v.email))return toast('Invalid email','bad');

      const rs=S.get('restaurants'),
      i=rs.findIndex(x=>x.id==OWN);

      rs[i]={
        ...rs[i],
        ...v,
        minOrder:+v.minOrder,
        fee:+v.fee,
        logo:P.logo,
        cover:P.cover
      };

      S.set('restaurants',rs);
      toast('Restaurant updated')
    }
  }
};

PAGES['owner-settings']={
  role:'owner',
  title:'Settings',
  render(){
    const t=new URLSearchParams(location.search).get('tab')||'settings';

    const REV=[
      ['Aarav S.',5,'Best biryani in town!'],
      ['Priya R.',4,'Great taste, slightly late delivery.'],
      ['Karthik R.',5,'Generous portions and well packed.'],
      ['Sneha P.',4,'Loved the veg biryani.']
    ];

    const body={
      customers:()=>`<div class=tw><table class=rt><thead><tr><th>Name<th>Email<th>Mobile<th>Orders</tr></thead><tbody>${S.get('users').filter(u=>u.role=='customer').map(u=>`<tr><td data-label=Name>${u.name}<td data-label=Email>${u.email}<td data-label=Mobile>${u.mobile}<td data-label=Orders>${oo().filter(o=>o.email==u.email).length}</tr>`).join('')}</tbody></table></div>`,

      offers:()=>`<div class=grid>${['20% OFF on all biryanis','₹50 OFF above ₹500','Free delivery on weekends'].map(x=>`<div class="banner" style="margin:0"><h3>🏷️ ${x}</h3></div>`).join('')}</div>`,

      reviews:()=>REV.map(r=>`<p class=mt><b>${r[0]}</b> <span class=rate>★ ${r[1]}</span><br><span class=muted>${r[2]}</span></p>`).join(''),

      settings:()=>`<h3>Preferences</h3><p class=muted>Toggle dark mode from the top bar.</p><button class="btn red mt" id=rs>Reset demo data</button>`
    }[t]();

    return `<h1>${t[0].toUpperCase()+t.slice(1)}</h1><div class="card mt">${body}</div>`
  },

  init(){
    const b=$('#rs');

    if(b)b.onclick=()=>confirmBox('This clears all saved demo data and logs you out.',()=>{
      Object.keys(localStorage)
        .filter(k=>k.startsWith('fn_'))
        .forEach(k=>localStorage.removeItem(k));

      location.href=ROOT+'index.html'
    })
  }
};