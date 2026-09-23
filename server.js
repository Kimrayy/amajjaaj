const express = require("express");
const crypto = require("crypto");
const path = require("path");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const DEMO_MODE = String(process.env.DEMO_MODE ?? "true").toLowerCase() === "true";
const SUPPORT_WHATSAPP = process.env.SUPPORT_WHATSAPP || "6281200000000";
const TOPUP_API_BASE_URL = (process.env.TOPUP_API_BASE_URL || "").replace(/\/$/, "");
const TOPUP_API_KEY = process.env.TOPUP_API_KEY || "";
const PAYMENT_API_BASE_URL = (process.env.PAYMENT_API_BASE_URL || "").replace(/\/$/, "");
const PAYMENT_API_KEY = process.env.PAYMENT_API_KEY || "";
const PAYMENT_CREATE_PATH = process.env.PAYMENT_CREATE_PATH || "/payments";
const TOPUP_ORDER_PATH = process.env.TOPUP_ORDER_PATH || "/orders";
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "";
const SUPABASE_URL = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

const products = [
  {slug:"mobile-legends",name:"Mobile Legends",publisher:"Moonton",category:"MOBA",popular:true,icon:"⚔️",cover:"https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=85", fields:["ID","Server"], hint:"Masukkan ID dan Server Mobile Legends dengan benar.", denominations:[["5 Diamonds",1800],["86 Diamonds",19900],["172 Diamonds",38900],["257 Diamonds",57900],["344 Diamonds",75900],["568 Diamonds",119000],["Weekly Diamond Pass",28900]]},
  {slug:"free-fire",name:"Free Fire",publisher:"Garena",category:"Battle Royale",popular:true,icon:"🔥",cover:"https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=1200&q=85", fields:["ID"], hint:"Masukkan Player ID Free Fire.", denominations:[["70 Diamonds",11000],["140 Diamonds",21000],["355 Diamonds",51000],["720 Diamonds",99000],["1450 Diamonds",198000]]},
  {slug:"pubg-mobile",name:"PUBG Mobile",publisher:"KRAFTON",category:"Battle Royale",popular:true,icon:"🎯",cover:"https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&w=1200&q=85", fields:["ID"], hint:"Masukkan Player ID PUBG Mobile.", denominations:[["60 UC",16000],["325 UC",72000],["660 UC",138000],["1800 UC",355000],["3850 UC",699000]]},
  {slug:"valorant",name:"Valorant",publisher:"Riot Games",category:"PC",popular:true,icon:"◈",cover:"https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&w=1200&q=85", fields:["Riot ID"], hint:"Gunakan Riot ID sesuai format di akunmu.", denominations:[["125 VP",17000],["420 VP",52000],["700 VP",82000],["1375 VP",155000],["2400 VP",259000]]},
  {slug:"genshin-impact",name:"Genshin Impact",publisher:"HoYoverse",category:"RPG",popular:true,icon:"✦",cover:"https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=85", fields:["UID","Server"], hint:"Pilih server sesuai akun Genshin Impact.", denominations:[["60 Genesis Crystals",16000],["300 Genesis Crystals",69000],["980 Genesis Crystals",210000],["1980 Genesis Crystals",399000]]},
  {slug:"honor-of-kings",name:"Honor of Kings",publisher:"Level Infinite",category:"MOBA",popular:true,icon:"👑",cover:"https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=85", fields:["Player ID"], hint:"Masukkan Player ID Honor of Kings.", denominations:[["80 Tokens",19000],["240 Tokens",54000],["500 Tokens",109000],["1000 Tokens",209000]]},
  {slug:"efootball",name:"eFootball",publisher:"KONAMI",category:"Sports",icon:"⚽",cover:"https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=85", fields:["User ID"], hint:"Masukkan User ID eFootball.", denominations:[["130 Coins",19000],["550 Coins",69000],["1040 Coins",129000]]},
  {slug:"roblox",name:"Roblox",publisher:"Roblox",category:"Voucher",icon:"▦",cover:"https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=1200&q=85", fields:["Username"], hint:"Masukkan username Roblox untuk pembelian.", denominations:[["80 Robux",15000],["400 Robux",67000],["800 Robux",129000],["1700 Robux",255000]]},
  {slug:"netflix",name:"Netflix",publisher:"Netflix",category:"Voucher",icon:"N",cover:"https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=85", fields:["Email/No. HP"], hint:"Pastikan akun dapat menerima akses.", denominations:[["1 Bulan",33000],["3 Bulan",89000],["6 Bulan",165000]]},
  {slug:"spotify",name:"Spotify Premium",publisher:"Spotify",category:"Subscription",icon:"♫",cover:"https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=85", fields:["Email"], hint:"Gunakan email akun Spotify yang benar.", denominations:[["1 Bulan",55000],["3 Bulan",149000],["12 Bulan",499000]]},
  {slug:"point-blank",name:"Point Blank",publisher:"Zepetto",category:"Voucher",icon:"⌁",cover:"https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?auto=format&fit=crop&w=1200&q=85", fields:["ID"], hint:"Masukkan ID akun Zepetto.", denominations:[["30.000 PB Cash",31000],["60.000 PB Cash",60500],["120.000 PB Cash",119000]]},
  {slug:"mycard",name:"MyCard",publisher:"MyCard",category:"Voucher",icon:"▣",cover:"https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=85", fields:["No. HP"], hint:"Masukkan nomor kontak untuk voucher.", denominations:[["50.000",52000],["100.000",101000],["250.000",249000]]}
].map(p=>({...p,denominations:p.denominations.map((d,i)=>({id:p.slug+"-"+i,label:d[0],price:d[1]}))}));

const articles = [
  {id:1,title:"Cara Top Up Game Aman dan Anti Salah ID",tag:"GUIDE",time:"5 menit",image:"https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1000&q=85",excerpt:"Checklist singkat sebelum melakukan top up supaya transaksi tidak nyasar."},
  {id:2,title:"Tips Memilih Nominal Top Up Sesuai Budget",tag:"TIPS",time:"4 menit",image:"https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=85",excerpt:"Cara membandingkan nominal dan menghindari pembelian impulsif."},
  {id:3,title:"QRIS, E-Wallet, dan VA: Apa Bedanya?",tag:"PAYMENT",time:"6 menit",image:"https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1000&q=85",excerpt:"Kenali karakter tiap metode pembayaran sebelum checkout."},
  {id:4,title:"Panduan Cek Invoice Setelah Pembayaran",tag:"GUIDE",time:"3 menit",image:"https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1000&q=85",excerpt:"Langkah melihat status pembayaran dan transaksi melalui invoice."},
  {id:5,title:"Kenapa Game ID Harus Dicek Sebelum Order?",tag:"TIPS",time:"3 menit",image:"https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=1000&q=85",excerpt:"Kesalahan data akun termasuk penyebab paling umum transaksi bermasalah."},
  {id:6,title:"Mengenal Proses Top Up Otomatis",tag:"NEWS",time:"5 menit",image:"https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=85",excerpt:"Apa yang terjadi di balik layar sejak order dibuat sampai sukses."}
];

const leaderboard = [
  ["Raka Gaming","Rp 4.870.000",4820],["Noxx","Rp 3.920.000",3920],["Vynn","Rp 3.410.000",3410],["Mika","Rp 2.980.000",2980],["Azel","Rp 2.550.000",2550],["Kyo","Rp 2.180.000",2180],["Renz","Rp 1.940.000",1940],["Lynn","Rp 1.720.000",1720]
];

const recent = [
  ["PMDEMO001","Mobile Legends","Rp 19.900","SUCCESS"],
  ["PMDEMO002","Free Fire","Rp 51.000","SUCCESS"],
  ["PMDEMO003","PUBG Mobile","Rp 72.000","SUCCESS"],
  ["PMDEMO004","Valorant","Rp 82.000","PAID"],
  ["PMDEMO005","Genshin Impact","Rp 69.000","SUCCESS"]
];

const reviews = [
  ["Adit","★★★★★","Checkout-nya cepat dan alurnya jelas."],
  ["Mila","★★★★★","Suka karena invoice gampang dicek."],
  ["Zayn","★★★★☆","Tampilan bersih, pilih nominal juga gampang."],
  ["Kris","★★★★★","Untuk demo ini sudah berasa marketplace beneran."]
];

const orders = new Map();
const rupiah=v=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(v);
const invoice=()=> "TPDEMO" + Date.now().toString(36).toUpperCase() + crypto.randomBytes(3).toString("hex").toUpperCase();
const configured={topup:Boolean(TOPUP_API_BASE_URL&&TOPUP_API_KEY),payment:Boolean(PAYMENT_API_BASE_URL&&PAYMENT_API_KEY),supabase:Boolean(SUPABASE_URL&&SUPABASE_SERVICE_ROLE_KEY)};
const demoUsers = new Map([
  ["demo",{id:"demo-user-001",name:"Demo User",username:"demo",email:"demo@playmart.test",whatsapp:"6281200000000",password:"demo123"}]
]);

async function providerRequest(baseUrl,apiKey,requestPath,payload){
  const r=await fetch(baseUrl+(requestPath.startsWith("/")?requestPath:"/"+requestPath),{method:"POST",headers:{"content-type":"application/json","authorization":"Bearer "+apiKey,"x-api-key":apiKey},body:JSON.stringify(payload)});
  const text=await r.text(); let data={}; try{data=text?JSON.parse(text):{}}catch{data={raw:text}}
  if(!r.ok){const e=new Error(data.message||data.error||("Provider HTTP "+r.status));e.status=r.status;throw e}
  return data;
}

async function saveOrder(order){
  orders.set(order.invoice,order);
  if(!configured.supabase)return;
  try{
    await fetch(SUPABASE_URL+"/rest/v1/orders",{method:"POST",headers:{"content-type":"application/json","apikey":SUPABASE_SERVICE_ROLE_KEY,"authorization":"Bearer "+SUPABASE_SERVICE_ROLE_KEY,"prefer":"return=minimal"},body:JSON.stringify({
      invoice:order.invoice,product_slug:order.productSlug,product:order.product,item:order.item,amount:order.amount,user_id:order.userId,server_id:order.serverId||"",payment_method:order.paymentMethod,whatsapp:order.whatsapp,promo:order.promo||"",payment_status:order.paymentStatus,transaction_status:order.transactionStatus,provider_reference:order.providerReference||null,payment_url:order.paymentUrl||null,created_at:order.createdAt,updated_at:new Date().toISOString()
    })});
  }catch(e){console.error("Supabase persistence warning:",e.message)}
}

async function findOrder(id){
  if(orders.has(id))return orders.get(id);
  if(!configured.supabase)return null;
  const r=await fetch(SUPABASE_URL+"/rest/v1/orders?invoice=eq."+encodeURIComponent(id)+"&select=*&limit=1",{headers:{apikey:SUPABASE_SERVICE_ROLE_KEY,authorization:"Bearer "+SUPABASE_SERVICE_ROLE_KEY}});
  if(!r.ok)return null; const a=await r.json(); if(!a[0])return null; const x=a[0];
  const o={invoice:x.invoice,product:x.product,productSlug:x.product_slug,item:x.item,amount:x.amount,amountLabel:rupiah(x.amount),userId:x.user_id,serverId:x.server_id,paymentMethod:x.payment_method,whatsapp:x.whatsapp,promo:x.promo,paymentStatus:x.payment_status,transactionStatus:x.transaction_status,providerReference:x.provider_reference,paymentUrl:x.payment_url,createdAt:x.created_at,message:"Pesanan ditemukan.",quantity:Number(x.quantity||1),subtotal:Number(x.subtotal||x.amount||0),fee:Number(x.fee||0),discount:Number(x.discount||0)};
  orders.set(id,o); return o;
}

app.get("/health",(req,res)=>res.json({status:"ok",service:"playmart",time:new Date().toISOString(),demoMode:DEMO_MODE,integrations:configured}));
app.get("/api/config",(req,res)=>res.json({demoMode:DEMO_MODE,topupProviderConfigured:configured.topup,paymentProviderConfigured:configured.payment,persistentStorageConfigured:configured.supabase,supportWhatsapp:SUPPORT_WHATSAPP}));
app.get("/api/products",(req,res)=>res.json(products));
app.get("/api/products/:slug",(req,res)=>{const p=products.find(x=>x.slug===req.params.slug); if(!p)return res.status(404).json({message:"Produk tidak ditemukan"}); res.json(p)});
app.get("/api/articles",(req,res)=>res.json(articles));
app.get("/api/articles/:id",(req,res)=>{const a=articles.find(x=>x.id===Number(req.params.id)); if(!a)return res.status(404).json({message:"Artikel tidak ditemukan"}); res.json(a)});
app.get("/api/leaderboard",(req,res)=>res.json(leaderboard.map((x,i)=>({rank:i+1,name:x[0],spent:x[1],points:x[2]}))));
app.get("/api/reviews",(req,res)=>res.json(reviews.map(x=>({name:x[0],stars:x[1],text:x[2]}))));
app.get("/api/transactions/recent",(req,res)=>res.json(recent.map(x=>({invoice:x[0],product:x[1],amount:x[2],status:x[3]}))));

app.post("/api/auth/login",(req,res)=>{
  if(!DEMO_MODE)return res.status(503).json({message:"Demo authentication is disabled."});
  const username=String(req.body?.username||"").trim().toLowerCase();
  const password=String(req.body?.password||"");
  const user=demoUsers.get(username);
  if(!user||user.password!==password)return res.status(401).json({message:"Username atau password salah."});
  const {password:_,...safe}=user;
  res.json({ok:true,user:safe});
});

app.post("/api/auth/register",(req,res)=>{
  if(!DEMO_MODE)return res.status(503).json({message:"Demo registration is disabled."});
  const b=req.body||{};
  const name=String(b.name||"").trim();
  const username=String(b.username||"").trim().toLowerCase();
  const email=String(b.email||"").trim().toLowerCase();
  const whatsapp=String(b.whatsapp||"").trim();
  const password=String(b.password||"");
  if(!name||username.length<3||!email||password.length<6)return res.status(400).json({message:"Lengkapi data dan gunakan password minimal 6 karakter."});
  if(demoUsers.has(username))return res.status(409).json({message:"Username sudah dipakai."});
  const user={id:"demo-"+crypto.randomBytes(5).toString("hex"),name,username,email,whatsapp,password};
  demoUsers.set(username,user);
  const {password:_,...safe}=user;
  res.status(201).json({ok:true,user:safe});
});

app.post("/api/orders",async(req,res)=>{
  try{
    const b=req.body||{}; const p=products.find(x=>x.slug===b.productSlug); const d=p&&p.denominations.find(x=>x.id===b.denominationId);
    const quantity=Math.min(20,Math.max(1,Number.parseInt(b.quantity,10)||1));
    const promo=String(b.promo||"").trim().toUpperCase();
    if(!p||!d||!b.userId||!b.paymentMethod||!b.whatsapp)return res.status(400).json({message:"Data pesanan belum lengkap."});
    if(!DEMO_MODE&&(!configured.payment||!configured.topup))return res.status(503).json({message:"Provider produksi belum dikonfigurasi."});
    const subtotal=d.price*quantity;
    const fee=DEMO_MODE?1500:0;
    const discount=promo==="DEMO15"?Math.round(subtotal*0.15):0;
    const total=Math.max(0,subtotal+fee-discount);
    const inv=invoice(); const o={invoice:inv,product:p.name,productSlug:p.slug,item:d.label,quantity,subtotal,fee,discount,amount:total,amountLabel:rupiah(total),userId:String(b.userId).trim(),serverId:String(b.serverId||"").trim(),paymentMethod:String(b.paymentMethod),whatsapp:String(b.whatsapp).trim(),promo,accountData:Array.isArray(b.accountData)?b.accountData.slice(0,6).map(x=>String(x).trim()):[],paymentStatus:DEMO_MODE?"PAID":"PENDING",transactionStatus:DEMO_MODE?"SUCCESS":"PENDING",providerReference:null,paymentUrl:null,createdAt:new Date().toISOString(),message:DEMO_MODE?"Pesanan demo berhasil diproses.":"Pesanan dibuat dan menunggu pembayaran."};
    if(!DEMO_MODE){
      const pay=await providerRequest(PAYMENT_API_BASE_URL,PAYMENT_API_KEY,PAYMENT_CREATE_PATH,{invoice:inv,amount:o.amount+o.fee-(o.discount?Number(o.discount):0),payment_method:o.paymentMethod,customer:{whatsapp:o.whatsapp},item:{sku:d.id,name:d.label,game:p.name,quantity:o.quantity}});
      o.paymentStatus=String(pay.status||"PENDING").toUpperCase(); o.paymentUrl=pay.payment_url||pay.checkout_url||pay.redirect_url||null; o.providerReference=pay.reference||pay.transaction_id||pay.id||null; await saveOrder(o); return res.json(o);
    }
    await saveOrder(o); res.json(o);
  }catch(e){console.error("Create order error:",e);res.status(e.status&&e.status<500?e.status:502).json({message:e.message||"Provider sedang bermasalah."})}
});

app.post("/api/webhooks/payment",async(req,res)=>{
  if(WEBHOOK_SECRET&&req.headers["x-webhook-secret"]!==WEBHOOK_SECRET)return res.status(401).json({message:"Unauthorized"});
  const b=req.body||{}; const id=String(b.invoice||b.order_id||b.external_id||"").toUpperCase(); if(!id)return res.status(400).json({message:"Invoice missing"});
  const o=await findOrder(id); if(!o)return res.status(404).json({message:"Invoice tidak ditemukan"});
  const status=String(b.status||"").toUpperCase(); if(["PAID","SETTLED","SUCCESS","COMPLETED"].includes(status))o.paymentStatus="PAID"; if(["FAILED","EXPIRED","CANCELLED"].includes(status))o.paymentStatus="FAILED";
  o.providerReference=b.reference||b.transaction_id||b.id||o.providerReference;
  if(o.paymentStatus==="PAID"&&!DEMO_MODE&&configured.topup&&o.transactionStatus!=="SUCCESS"){const p=products.find(x=>x.slug===o.productSlug),d=p&&p.denominations.find(x=>x.label===o.item);const top=await providerRequest(TOPUP_API_BASE_URL,TOPUP_API_KEY,TOPUP_ORDER_PATH,{external_id:o.invoice,game:o.productSlug,user_id:o.userId,server_id:o.serverId,sku:d?.id,product:o.item});o.transactionStatus=String(top.status||"PENDING").toUpperCase();o.providerReference=top.reference||top.transaction_id||o.providerReference}
  await saveOrder(o);res.json({ok:true,invoice:o.invoice,paymentStatus:o.paymentStatus,transactionStatus:o.transactionStatus});
});

app.get("/api/orders/:invoice",async(req,res)=>{const o=await findOrder(req.params.invoice.toUpperCase());if(!o)return res.status(404).json({message:"Invoice tidak ditemukan."});res.json(o)});

app.use((req,res)=>{if(req.path.startsWith("/api/"))return res.status(404).json({message:"API route not found"});res.sendFile(path.join(__dirname,"public","index.html"))});
app.listen(PORT,()=>console.log("PlayMart listening on "+PORT+" demo="+DEMO_MODE));
