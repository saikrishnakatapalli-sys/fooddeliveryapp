const ROOT=location.pathname.includes('/pages/')?'../':'';

const BRAND={
  name:'Sai Food delivery App',
  tag:'Delicious food. Delivered to your door.'
}; // change brand here

const CATS=[
  'Biryani',
  'Pizza',
  'Burger',
  'South Indian',
  'Chinese'
];

const slug=s=>s.toLowerCase().replace(/ /g,'-');

// ALL image paths come from here. Replace files in assets/images/ (same name) or change this one function.
const IMG=n=>`${ROOT}assets/images/${n}.png`;

const ST=[
  'Pending',
  'Accepted',
  'Preparing',
  'Ready',
  'Out for Delivery',
  'Delivered',
  'Cancelled'
];

const RAW_R=`Spice Garden|Indian • Biryani|4.6|1280|25-30|2.1|2|0|20% OFF|40
Pizza Palace|Italian • Pizza|4.4|940|30-35|3.2|2|0|Buy 1 Get 1|45
Burger Barn|American • Burgers|4.3|760|20-25|1.5|1|0|15% OFF|30
Dosa Darbar|South Indian|4.7|2100|20-30|1.8|1|1|10% OFF|25
Wok Express|Chinese • Asian|4.2|650|25-35|2.9|2|0|₹100 OFF|40
Tandoor Tales|North Indian|4.5|1500|30-40|3.5|3|0|25% OFF|50
Sweet Tooth|Desserts • Bakery|4.6|880|15-25|1.2|1|1|Free Delivery|0
Green Bowl|Healthy • Salads|4.4|420|20-30|2.4|2|1|12% OFF|35
Juice Junction|Drinks • Shakes|4.1|390|10-20|0.9|1|1|Buy 2 Get 1|20
Quick Bites|Fast Food|4.0|1100|15-25|1.6|1|0|30% OFF|30`.split('\n').slice(0,5);

const RESTAURANTS=RAW_R.map((l,i)=>{
  const[n,c,r,v,t,d,p,veg,o,f]=l.split('|');
  return{
    id:i+1,
    name:n,
    cuisine:c,
    rating:+r,
    reviews:+v,
    time:t,
    dist:+d,
    price:+p,
    veg:+veg,
    offer:'',
    fee:+f,
    img:'restaurant-'+(i+1),
    about:`${n} serves freshly prepared ${c.replace(/ • /g,', ')} dishes made with quality ingredients.`,
    address:`${10+i}, MG Road, Vijayawada`,
    minOrder:100,
    phone:'+91 98765 4321'+i,
    email:'hello@'+slug(n).replace(/-/g,'')+'.com',
    open:'10:00',
    close:'23:00'
  }
});

const RAW_F=[
  'Chicken Biryani,Biryani,249,0',
  'Mutton Biryani,Biryani,329,0',
  'Veg Biryani,Biryani,199,1',
  'Margherita Pizza,Pizza,229,1',
  'Pepperoni Pizza,Pizza,329,0',
  'Farmhouse Pizza,Pizza,299,1',
  'Classic Veg Burger,Burger,119,1',
  'Chicken Zinger Burger,Burger,169,0',
  'Cheese Burst Burger,Burger,189,1',
  'Masala Dosa,South Indian,90,1',
  'Idly (3 pcs),South Indian,60,1',
  'Medu Vada,South Indian,70,1',
  'Veg Fried Rice,Chinese,149,1',
  'Hakka Noodles,Chinese,159,1',
  'Chicken 65,Chinese,199,0',
  'Paneer Butter Masala,North Indian,229,1',
  'Butter Chicken,North Indian,289,0',
  'Garlic Naan,North Indian,45,1',
  'Gulab Jamun,Desserts,80,1',
  'Chocolate Brownie,Desserts,120,1',
  'Ice Cream Sundae,Desserts,140,1',
  'Quinoa Salad,Healthy,189,1',
  'Grilled Chicken Bowl,Healthy,249,0',
  'Fruit Bowl,Healthy,129,1',
  'Fresh Orange Juice,Drinks,90,1',
  'Mango Shake,Drinks,110,1',
  'Cold Coffee,Drinks,100,1',
  'French Fries,Fast Food,89,1',
  'Chicken Nuggets,Fast Food,149,0',
  'Veg Wrap,Fast Food,109,1'
];

const FOODS=RAW_F.slice(0,15).map((l,i)=>{
  const[n,c,p,v]=l.split(',');
  return{
    id:i+1,
    rid:Math.floor(i/3)+1,
    name:n,
    cat:c,
    mrp:+p,
    disc:0,
    veg:+v,
    rating:+(4+((i*7)%10)/10).toFixed(1),
    prep:15+i%4*5,
    avail:true,
    desc:n+' prepared fresh with authentic spices and quality ingredients.'
  }
});

const sell=f=>Math.round(f.mrp*(1-f.disc/100));

const NAMES=[
  'Customer Demo',
  'Aarav Sharma',
  'Priya Reddy',
  'Karthik Rao',
  'Sneha Patel',
  'Rahul Verma',
  'Ananya Iyer',
  'Vikram Singh',
  'Divya Nair',
  'Rohit Gupta'
];

const mkAddr=()=>[
  {
    label:'Home',
    text:'Plot 12, Benz Circle, Vijayawada - 520010'
  },
  {
    label:'College',
    text:'KL University, Vaddeswaram - 522302'
  },
  {
    label:'Office',
    text:'Tech Park, Auto Nagar, Vijayawada - 520007'
  }
];

const USERS=[
  ...NAMES.slice(0,5).map((n,i)=>({
    name:n,
    email:i?n.split(' ')[0].toLowerCase()+'@example.com':'customer@example.com',
    mobile:'98480'+(10000+i*111),
    pass:'customer123',
    city:'Vijayawada',
    pin:'520010',
    address:'Plot 12, Benz Circle',
    role:'customer',
    addresses:mkAddr()
  })),
  {
    name:'Sai krishna',
    email:'saikrishnakatapalli@gmail.com',
    pass:'owner123',
    role:'owner',
    mobile:'9381860939'
  }
];

const mkOrders=()=>Array.from({length:10},(_,i)=>{
  const its=[
    FOODS[i%3],
    FOODS[(i+1)%3]
  ].map((f,j)=>({
    id:f.id,
    name:f.name,
    q:j+1,
    price:sell(f)
  }));

  const sub=its.reduce((s,x)=>s+x.price*x.q,0);

  return{
    id:'FN'+(102930+i*7),
    email:USERS[i%3].email,
    cust:USERS[i%3].name,
    rid:1,
    items:its,
    total:Math.ceil(sub*1.05)+40,
    addr:'Plot 12, Benz Circle, Vijayawada',
    pay:['UPI','COD','Card','Wallet'][i%4],
    st:[5,5,5,0,1,2,3,4,6,5][i],
    time:new Date(Date.now()-i*108e5).toISOString()
  }
});