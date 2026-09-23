const express=require('express');
const crypto=require('crypto');
const path=require('path');
const app=express();
const PORT=process.env.PORT||3000;
const DEMO_MODE=(process.env.DEMO_MODE||'true').toLowerCase()==='true';
app.use(express.json({limit:'1mb'}));
app.use(express.static(path.join(__dirname,'public')));

const products=[
{slug:'mobile-legends',name:'Mobile Legends',publisher:'Moonton',category:'MOBA',icon:'⚔️',cover:'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1000&q=85',note:'Diamond instan · proses otomatis',denominations:[['86 Diamonds',20000],['172 Diamonds',39000],['257 Diamonds',57000],['344 Diamonds',76000]]},
{slug:'free-fire',name:'Free Fire',publisher:'Garena',category:'Battle Royale',icon:'🔥',cover:'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1000&q=85',note:'Diamond murah · kirim cepat',denominations:[['70 Diamonds',11000],['140 Diamonds',21000],['355 Diamonds',51000],['720 Diamonds',99000]]},
{slug:'pubg-mobile',name:'PUBG Mobile',publisher:'KRAFTON',category:'Battle Royale',icon:'🎯',cover:'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=1000&q=85',note:'UC PUBG · pembayaran lengkap',denominations:[['60 UC',16000],['325 UC',72000],['660 UC',138000],['1800 UC',355000]]},
{slug:'valorant',name:'Valorant',publisher:'Riot Games',category:'PC',icon:'◈',cover:'https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&w=1000&q=85',note:'VP Valorant · pembayaran aman',denominations:[['125 VP',17000],['420 VP',52000],['700 VP',82000],['1375 VP',155000]]},
{slug:'genshin-impact',name:'Genshin Impact',publisher:'HoYoverse',category:'RPG',icon:'✦',cover:'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=85',note:'Genesis Crystals · cepat & praktis',denominations:[['60 Genesis Crystals',16000],['300 Genesis Crystals',69000],['980 Genesis Crystals',210000]]},
{slug:'honor-of-kings',name:'Honor of Kings',publisher:'Level Infinite',category:'MOBA',icon:'👑',cover:'https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&w=1000&q=85',note:'Tokens · support 24 jam',denominations:[['80 Tokens',19000],['240 Tokens',54000],['500 Tokens',109000]]}
].map(function(p){p.denominations=p.denominations.map(function(d,i){return {id:p.slug+'-'+i,label:d[0],price:d[1]}});return p});

const articles=[
{title:'Cara top up game yang aman tanpa ribet',tag:'GUIDE',time:'5 min read',image:'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=1000&q=85'},
{title:'Panduan cek ID game sebelum checkout',tag:'TIPS',time:'3 min read',image:'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1000&q=85'},
{title:'Perbandingan metode pembayaran untuk gamer',tag:'PAYMENT',time:'6 min read',image:'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1000&q=85'}
];
const orders=new Map();
function rupiah(v){return new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(v)}
function invoice(){return 'PM'+Date.now().toString(36).toUpperCase()+crypto.randomBytes(3).toString('hex').toUpperCase()}
app.get('/api/config',function(req,res){res.json({demoMode:DEMO_MODE,topupProviderConfigured:!!(process.env.TOPUP_API_BASE_URL&&process.env.TOPUP_API_KEY),paymentProviderConfigured:!!(process.env.PAYMENT_API_BASE_URL&&process.env.PAYMENT_API_KEY),supportWhatsapp:process.env.SUPPORT_WHATSAPP||'6281200000000'})});
app.get('/api/products',function(req,res){res.json(products)});
app.get('/api/articles',function(req,res){res.json(articles)});
app.post('/api/orders',function(req,res){
  var b=req.body||{}, p=products.find(function(x){return x.slug===b.productSlug}), d=p&&p.denominations.find(function(x){return x.id===b.denominationId});
  if(!p||!d||!b.userId||!b.paymentMethod||!b.whatsapp)return res.status(400).json({message:'Data pesanan belum lengkap.'});
  var inv=invoice();
  var order={invoice:inv,product:p.name,productSlug:p.slug,item:d.label,amount:d.price,amountLabel:rupiah(d.price),userId:b.userId,serverId:b.serverId||'',paymentMethod:b.paymentMethod,whatsapp:b.whatsapp,promo:b.promo||'',paymentStatus:DEMO_MODE?'PAID':'PENDING',transactionStatus:DEMO_MODE?'SUCCESS':'PENDING',createdAt:new Date().toISOString(),message:DEMO_MODE?'Pesanan demo berhasil diproses.':'Pesanan dibuat dan menunggu provider produksi.'};
  orders.set(inv,order);res.json(order);
});
app.get('/api/orders/:invoice',function(req,res){var o=orders.get(req.params.invoice.toUpperCase());if(!o)return res.status(404).json({message:'Invoice tidak ditemukan.'});res.json(o)});
app.use(function(req,res){if(req.path.startsWith('/api/'))return res.status(404).json({message:'API route not found'});res.sendFile(path.join(__dirname,'public','index.html'))});
app.listen(PORT,function(){console.log('PlayMart listening on '+PORT+' demo='+DEMO_MODE)});
