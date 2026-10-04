const saveUser=p=>{
  const us=S.get('users'),
  i=us.findIndex(x=>x.email==me().email);
  us[i]={...us[i],...p};
  S.set('users',us);
  const s=me();
  s.name=us[i].name;
  S.set('session',s)
};

function addAddr(cb){
  modal(`<h3>Add New Address</h3><label>Label</label><select id=al><option>Home</option><option>College</option><option>Office</option><option>Other</option></select><label>Full address</label><textarea id=at rows=3></textarea><div class="row end"><button class="btn ghost" onclick="closeModal()">Cancel</button><button class=btn id=as>Save Address</button></div>`);
  $('#as').onclick=()=>{
    const t=$('#at').value.trim();
    if(t.length<8)return toast('Please enter a valid address','bad');
    saveUser({
      addresses:[
        ...curUser().addresses,
        {label:$('#al').value,text:t}
      ]
    });
    closeModal();
    toast('Address added');
    cb&&cb()
  }
}

PAGES.login={
  title:'Login',
  render(){
    return `<div class=auth><section class=hero><!-- Replace this image with your login hero image: assets/images/login-food.svg --><img class=bg src="${IMG('login-food')}" alt="Delicious food spread"><div class=logo><img src="${IMG('logo')}" alt="${BRAND.name} logo">${BRAND.name}</div><div><h1>${BRAND.tag.replace('. ','.<br>')}</h1><p>Your favorite meals, just a few clicks away.</p></div><small>© ${BRAND.name}</small></section>
<section class=pane><form class=logincard id=lf novalidate><div class=top><img src="${IMG('logo')}" alt="logo"><h2>${BRAND.name}</h2><h3>Welcome Back</h3><p class=muted>Login to continue</p></div><div class=roles role=group aria-label="Login as"><button type=button data-r=customer>🍴 Customer</button><button type=button data-r=owner>🏪 Restaurant Owner</button></div>
<label for=em>Email / Username</label><input id=em autocomplete=username placeholder="you@example.com"><label for=pw>Password</label><div class=pw><input id=pw type=password autocomplete=current-password placeholder="Enter password"><button type=button id=eye aria-label="Show password">👁</button></div>
<div class=rm><label><input type=checkbox id=rem> Remember me</label><a href=# id=fp>Forgot Password?</a></div><button class="btn block">Login</button><div class=err id=msg role=alert></div>
<p class=muted style="text-align:center" id=reg>Don't have an account? <a href="${L('register.html')}"><b>Create Customer Account</b></a></p><div class=demo id=dm></div></form></section></div>`
  },
  init(){
    let role=document.body.dataset.role||new URLSearchParams(location.search).get('role')||'customer';

    const D={
      customer:['customer@example.com','customer123'],
      owner:['owner@example.com','owner123']
    };

    const set=r=>{
      role=r;
      $$('.roles button').forEach(b=>b.classList.toggle('on',b.dataset.r==r));
      $('#reg').style.display=r=='customer'?'':'none';
      $('#dm').innerHTML=`<b>Demo Login (${r})</b><br>${D[r][0]} / ${D[r][1]} <button type=button class="btn sm ghost" id=fill>Autofill</button>`;
      $('#fill').onclick=()=>{
        $('#em').value=D[r][0];
        $('#pw').value=D[r][1]
      }
    };

    $$('.roles button').forEach(b=>b.onclick=()=>set(b.dataset.r));
    set(role);
    $('#em').value=S.get('remember','');

    $('#eye').onclick=()=>{
      const p=$('#pw');
      p.type=p.type=='password'?'text':'password'
    };

    $('#fp').onclick=e=>{
      e.preventDefault();
      modal(`<h3>Reset Password</h3><label>Registered email</label><input id=fe><div class="row end"><button class=btn id=fs>Send reset link</button></div>`);
      $('#fs').onclick=()=>{
        /^\S+@\S+\.\S+$/.test($('#fe').value)?(closeModal(),toast('Reset link sent (demo)')):toast('Invalid email','bad')
      }
    };

    $('#lf').onsubmit=e=>{
      e.preventDefault();
      const em=$('#em').value.trim().toLowerCase(),
      pw=$('#pw').value;
      let x=!em?'Email or username is required':em.includes('@')&&!/^\S+@\S+\.\S+$/.test(em)?'Invalid email':!pw?'Password required':'';

      if(!x){
        const u=S.get('users').find(u=>u.email==em||u.name.toLowerCase()==em);
        if(!u||u.pass!==pw)x='Incorrect email or password';
        else if(u.role!==role)x=`This is not a ${role=='owner'?'restaurant owner':'customer'} account`;
        else{
          S.set('session',{email:u.email,name:u.name,role:u.role});
          S.set('remember',$('#rem').checked?em:'');
          toast('Login successful');
          setTimeout(()=>location.href=L(role=='owner'?'owner-dashboard.html':'customer-dashboard.html'),600);
          return
        }
      }

      $('#msg').textContent=x;
      toast(x,'bad')
    }
  }
};

PAGES.register={
  title:'Register',
  render(){
    const f=(l,n,t='text')=>`<div><label for=r${n}>${l}</label><input id=r${n} name=${n} type=${t}></div>`;
    return `<div class=regwrap><form class=card id=rf novalidate><div class="row between"><h2>Create Customer Account</h2><a href="${ROOT}index.html" class="btn ghost sm">Login</a></div><div class="row mt"><img class=avatar id=av src="${IMG('profile')}" alt="Profile preview"><div><label class="btn ghost sm" for=ph>Upload Profile Image</label><input id=ph type=file accept="image/*" hidden></div></div>
<div class=f2>${f('Full Name','name')}${f('Email','email','email')}${f('Mobile Number','mobile','tel')}${f('City','city')}${f('Password','pass','password')}${f('Confirm Password','pass2','password')}${f('Pincode','pin')}${f('Address','address')}</div>
<label class=row style="font-weight:500"><input type=checkbox id=tc> I agree to the Terms & Conditions</label><button class="btn block mt">Create Account</button><div class=err id=msg role=alert></div><p class=muted style="text-align:center">Already have an account? <a href="${ROOT}index.html"><b>Login</b></a></p></form></div>`
  },
  init(){
    let photo='';

    $('#ph').onchange=e=>readImg(e.target,d=>{
      photo=d;
      $('#av').src=d
    });

    $('#rf').onsubmit=e=>{
      e.preventDefault();
      const v=Object.fromEntries(new FormData(e.target)),
      us=S.get('users');

      const x=!v.name.trim()?'Full name is required':!/^\S+@\S+\.\S+$/.test(v.email)?'Invalid email':us.some(u=>u.email==v.email.toLowerCase())?'Email already registered':!/^\d{10}$/.test(v.mobile)?'Mobile must be 10 digits':v.pass.length<6?'Password must be 6+ characters':v.pass!=v.pass2?'Passwords do not match':!v.address.trim()||!v.city.trim()?'Address and city are required':!/^\d{6}$/.test(v.pin)?'Pincode must be 6 digits':!$('#tc').checked?'Please accept the Terms & Conditions':'';

      if(x){
        $('#msg').textContent=x;
        return toast(x,'bad')
      }

      us.push({
        name:v.name.trim(),
        email:v.email.toLowerCase(),
        mobile:v.mobile,
        pass:v.pass,
        city:v.city,
        pin:v.pin,
        address:v.address,
        photo,
        role:'customer',
        addresses:[
          {label:'Home',text:`${v.address}, ${v.city} - ${v.pin}`}
        ]
      });

      S.set('users',us);
      toast('Account created! Please login');
      setTimeout(()=>location.href=ROOT+'index.html',900)
    }
  }
};

PAGES.profile={
  role:'customer',
  title:'Profile',
  render(){
    const u=curUser(),
    f=(l,n,v)=>`<div><label>${l}</label><input name=${n} value="${v||''}" disabled></div>`;
    return `<h1>My Profile</h1><div class="cols mt"><form class=card id=pf novalidate><div class=row><img class=avatar id=av src="${u.photo||IMG('profile')}" alt="Profile photo"><div><label class="btn ghost sm" for=ph>Change Photo</label><input id=ph type=file accept="image/*" hidden></div></div>
<div class=f2>${f('Full Name','name',u.name)}<div><label>Email</label><input value="${u.email}" disabled></div>${f('Mobile','mobile',u.mobile)}${f('City','city',u.city)}${f('Pincode','pin',u.pin)}${f('Address','address',u.address)}</div><div class="row mt"><button type=button class=btn id=ed>Edit Profile</button><button class="btn green" id=sv disabled>Save Changes</button></div></form>
<aside><div class=card id=addresses><h3>Saved Addresses</h3>${u.addresses.map(a=>`<p class=mt><b>${a.label}</b><br><span class=muted>${a.text}</span></p>`).join('')}<button class="btn ghost sm mt" id=aa>+ Add Address</button></div><div class="card mt"><button id=cp class="btn ghost block">Change Password</button><button id=lg class="btn red block mt">Logout</button></div></aside></div>`
  },
  init(){
    $('#ph').onchange=e=>readImg(e.target,d=>{
      saveUser({photo:d});
      toast('Profile updated');
      redraw()
    });

    $('#ed').onclick=()=>{
      $$('#pf input[name]').forEach(i=>i.disabled=false);
      $('#sv').disabled=false
    };

    $('#pf').onsubmit=e=>{
      e.preventDefault();
      const v=Object.fromEntries(new FormData(e.target));
      if(!v.name.trim())return toast('Name is required','bad');
      if(!/^\d{10}$/.test(v.mobile))return toast('Mobile must be 10 digits','bad');
      saveUser(v);
      toast('Profile updated');
      redraw()
    };

    $('#aa').onclick=()=>addAddr(redraw);
    $('#lg').onclick=logout;

    $('#cp').onclick=()=>{
      modal(`<h3>Change Password</h3><label>Current</label><input id=p1 type=password><label>New (6+ chars)</label><input id=p2 type=password><label>Confirm</label><input id=p3 type=password><div class="row end"><button class=btn id=ps>Update</button></div>`);
      $('#ps').onclick=()=>{
        const x=$('#p1').value!==curUser().pass?'Current password is wrong':$('#p2').value.length<6?'New password too short':$('#p2').value!==$('#p3').value?'Passwords do not match':'';
        if(x)return toast(x,'bad');
        saveUser({pass:$('#p2').value});
        closeModal();
        toast('Password updated')
      }
    };

    if(location.hash=='#addresses')$('#addresses').scrollIntoView()
  }
};