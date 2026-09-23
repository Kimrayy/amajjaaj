const express = require("express");
const crypto = require("crypto");
const path = require("path");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const DEMO_MODE = String(process.env.DEMO_MODE ?? "true").toLowerCase() === "true";
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
  { slug:"mobile-legends", name:"Mobile Legends", publisher:"Moonton", category:"MOBA", icon:"⚔️", cover:"https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1000&q=85", note:"Diamond instan · proses otomatis", denominations:[["86 Diamonds",20000],["172 Diamonds",39000],["257 Diamonds",57000],["344 Diamonds",76000]] },
  { slug:"free-fire", name:"Free Fire", publisher:"Garena", category:"Battle Royale", icon:"🔥", cover:"https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1000&q=85", note:"Diamond murah · kirim cepat", denominations:[["70 Diamonds",11000],["140 Diamonds",21000],["355 Diamonds",51000],["720 Diamonds",99000]] },
  { slug:"pubg-mobile", name:"PUBG Mobile", publisher:"KRAFTON", category:"Battle Royale", icon:"🎯", cover:"https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=1000&q=85", note:"UC PUBG · pembayaran lengkap", denominations:[["60 UC",16000],["325 UC",72000],["660 UC",138000],["1800 UC",355000]] },
  { slug:"valorant", name:"Valorant", publisher:"Riot Games", category:"PC", icon:"◈", cover:"https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&w=1000&q=85", note:"VP Valorant · pembayaran aman", denominations:[["125 VP",17000],["420 VP",52000],["700 VP",82000],["1375 VP",155000]] },
  { slug:"genshin-impact", name:"Genshin Impact", publisher:"HoYoverse", category:"RPG", icon:"✦", cover:"https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=85", note:"Genesis Crystals · cepat & praktis", denominations:[["60 Genesis Crystals",16000],["300 Genesis Crystals",69000],["980 Genesis Crystals",210000]] },
  { slug:"honor-of-kings", name:"Honor of Kings", publisher:"Level Infinite", category:"MOBA", icon:"👑", cover:"https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&w=1000&q=85", note:"Tokens · support 24 jam", denominations:[["80 Tokens",19000],["240 Tokens",54000],["500 Tokens",109000]] }
].map(p => ({ ...p, denominations:p.denominations.map((d,i)=>({id:p.slug+"-"+i,label:d[0],price:d[1]})) }));

const articles = [
  {title:"Cara top up game yang aman tanpa ribet",tag:"GUIDE",time:"5 min read",image:"https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=1000&q=85"},
  {title:"Panduan cek ID game sebelum checkout",tag:"TIPS",time:"3 min read",image:"https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1000&q=85"},
  {title:"Perbandingan metode pembayaran untuk gamer",tag:"PAYMENT",time:"6 min read",image:"https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1000&q=85"}
];

const orders = new Map();

const rupiah = value => new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(value);
const invoice = () => "PM" + Date.now().toString(36).toUpperCase() + crypto.randomBytes(3).toString("hex").toUpperCase();
const configured = {
  topup: Boolean(TOPUP_API_BASE_URL && TOPUP_API_KEY),
  payment: Boolean(PAYMENT_API_BASE_URL && PAYMENT_API_KEY),
  supabase: Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
};

async function providerRequest(baseUrl, apiKey, requestPath, payload) {
  const response = await fetch(baseUrl + (requestPath.startsWith("/") ? requestPath : "/" + requestPath), {
    method:"POST",
    headers:{"content-type":"application/json","authorization:"Bearer "+apiKey,"x-api-key":apiKey},
    body:JSON.stringify(payload)
  });
  const text = await response.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = {raw:text}; }
  if (!response.ok) {
    const error = new Error(data.message || data.error || ("Provider HTTP "+response.status));
    error.status = response.status;
    error.provider = data;
    throw error;
  }
  return data;
}

async function saveOrder(order) {
  orders.set(order.invoice, order);
  if (!configured.supabase) return;
  try {
    await fetch(SUPABASE_URL + "/rest/v1/orders", {
      method:"POST",
      headers:{
        "content-type":"application/json",
        "apikey":SUPABASE_SERVICE_ROLE_KEY,
        "authorization":"Bearer "+SUPABASE_SERVICE_ROLE_KEY,
        "prefer":"return=minimal"
      },
      body:JSON.stringify({
        invoice:order.invoice, product_slug:order.productSlug, product:order.product, item:order.item,
        amount:order.amount, user_id:order.userId, server_id:order.serverId, payment_method:order.paymentMethod,
        whatsapp:order.whatsapp, promo:order.promo, payment_status:order.paymentStatus,
        transaction_status:order.transactionStatus, provider_reference:order.providerReference || null,
        payment_url:order.paymentUrl || null, created_at:order.createdAt, updated_at:new Date().toISOString()
      })
    });
  } catch (e) {
    console.error("Supabase persistence warning:", e.message);
  }
}

async function findOrder(id) {
  if (orders.has(id)) return orders.get(id);
  if (!configured.supabase) return null;
  const r = await fetch(SUPABASE_URL + "/rest/v1/orders?invoice=eq."+encodeURIComponent(id)+"&select=*&limit=1", {
    headers:{apikey:SUPABASE_SERVICE_ROLE_KEY,authorization:"Bearer "+SUPABASE_SERVICE_ROLE_KEY}
  });
  if (!r.ok) return null;
  const rows = await r.json();
  if (!rows[0]) return null;
  const row = rows[0];
  const order = {
    invoice:row.invoice, product:row.product, productSlug:row.product_slug, item:row.item, amount:row.amount,
    amountLabel:rupiah(row.amount), userId:row.user_id, serverId:row.server_id || "", paymentMethod:row.payment_method,
    whatsapp:row.whatsapp, promo:row.promo || "", paymentStatus:row.payment_status, transactionStatus:row.transaction_status,
    providerReference:row.provider_reference, paymentUrl:row.payment_url, createdAt:row.created_at
  };
  orders.set(id, order);
  return order;
}

app.get("/health", (req,res) => res.json({status:"ok",service:"playmart",time:new Date().toISOString(),demoMode:DEMO_MODE,integrations:configured}));
app.get("/api/config", (req,res) => res.json({
  demoMode:DEMO_MODE,
  topupProviderConfigured:configured.topup,
  paymentProviderConfigured:configured.payment,
  persistentStorageConfigured:configured.supabase,
  supportWhatsapp:process.env.SUPPORT_WHATSAPP || "6281200000000"
}));
app.get("/api/products",(req,res)=>res.json(products));
app.get("/api/articles",(req,res)=>res.json(articles));

app.post("/api/orders", async (req,res) => {
  try {
    const b=req.body||{};
    const p=products.find(x=>x.slug===b.productSlug);
    const d=p && p.denominations.find(x=>x.id===b.denominationId);
    if(!p||!d||!b.userId||!b.paymentMethod||!b.whatsapp) return res.status(400).json({message:"Data pesanan belum lengkap."});
    if(!DEMO_MODE && (!configured.payment || !configured.topup)) {
      return res.status(503).json({message:"Provider produksi belum dikonfigurasi. Isi TOPUP_API_* dan PAYMENT_API_* di Railway atau aktifkan DEMO_MODE."});
    }

    const inv=invoice();
    const order={
      invoice:inv, product:p.name, productSlug:p.slug, item:d.label, amount:d.price, amountLabel:rupiah(d.price),
      userId:String(b.userId).trim(), serverId:String(b.serverId||"").trim(), paymentMethod:b.paymentMethod,
      whatsapp:String(b.whatsapp).trim(), promo:String(b.promo||"").trim(),
      paymentStatus:DEMO_MODE?"PAID":"PENDING", transactionStatus:DEMO_MODE?"SUCCESS":"PENDING",
      providerReference:null, paymentUrl:null, createdAt:new Date().toISOString(),
      message:DEMO_MODE?"Pesanan demo berhasil diproses.":"Pesanan dibuat; pembayaran dan fulfillment akan diproses provider."
    };

    if(!DEMO_MODE) {
      const payment = await providerRequest(PAYMENT_API_BASE_URL,PAYMENT_API_KEY,PAYMENT_CREATE_PATH,{
        invoice:inv, amount:order.amount, payment_method:order.paymentMethod,
        customer:{whatsapp:order.whatsapp}, item:{sku:d.id,name:d.label,game:p.name}
      });
      order.paymentStatus=payment.status==="PAID"?"PAID":"PENDING";
      order.paymentUrl=payment.payment_url || payment.checkout_url || payment.redirect_url || null;
      order.providerReference=payment.reference || payment.transaction_id || payment.id || null;
      await saveOrder(order);
      return res.json(order);
    }

    await saveOrder(order);
    return res.json(order);
  } catch (e) {
    console.error("Create order error:",e);
    return res.status(e.status && e.status<500?e.status:502).json({message:e.message||"Provider sedang bermasalah."});
  }
});

app.post("/api/webhooks/payment", async (req,res) => {
  if(WEBHOOK_SECRET && req.headers["x-webhook-secret"] !== WEBHOOK_SECRET) return res.status(401).json({message:"Unauthorized"});
  const b=req.body||{};
  const id=b.invoice || b.order_id || b.external_id;
  if(!id) return res.status(400).json({message:"Invoice missing"});
  const order=await findOrder(String(id).toUpperCase());
  if(!order) return res.status(404).json({message:"Invoice tidak ditemukan"});
  const status=String(b.status||"").toUpperCase();
  if(["PAID","SETTLED","SUCCESS","COMPLETED"].includes(status)) order.paymentStatus="PAID";
  if(["FAILED","EXPIRED","CANCELLED"].includes(status)) order.paymentStatus="FAILED";
  order.providerReference=b.reference || b.transaction_id || b.id || order.providerReference;
  if(order.paymentStatus==="PAID" && !DEMO_MODE && configured.topup && order.transactionStatus!=="SUCCESS") {
    const p=products.find(x=>x.slug===order.productSlug);
    const d=p && p.denominations.find(x=>x.label===order.item);
    const topup=await providerRequest(TOPUP_API_BASE_URL,TOPUP_API_KEY,TOPUP_ORDER_PATH,{
      external_id:order.invoice, game:order.productSlug, user_id:order.userId, server_id:order.serverId,
      sku:d?.id, product:order.item
    });
    order.transactionStatus=String(topup.status||"PENDING").toUpperCase();
    order.providerReference=topup.reference || topup.transaction_id || order.providerReference;
  }
  await saveOrder(order);
  res.json({ok:true,invoice:order.invoice,paymentStatus:order.paymentStatus,transactionStatus:order.transactionStatus});
});

app.get("/api/orders/:invoice",async(req,res)=>{
  const o=await findOrder(req.params.invoice.toUpperCase());
  if(!o)return res.status(404).json({message:"Invoice tidak ditemukan."});
  res.json(o);
});

app.use((req,res)=>{
  if(req.path.startsWith("/api/")) return res.status(404).json({message:"API route not found"});
  res.sendFile(path.join(__dirname,"public","index.html"));
});

app.listen(PORT,()=>console.log("PlayMart listening on "+PORT+" demo="+DEMO_MODE));
