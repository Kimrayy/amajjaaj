"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Copy,
  CreditCard,
  Gift,
  Globe2,
  Headphones,
  Home,
  LogIn,
  LogOut,
  Menu,
  MessageCircle,
  Minus,
  MoreHorizontal,
  Package,
  PanelTop,
  Percent,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
  TicketPercent,
  Trophy,
  UserRound,
  WalletCards,
  X,
  Zap,
} from "lucide-react";

const FALLBACK_REVIEWS = [
  { name: "Adit", stars: "★★★★★", text: "Checkout-nya cepat dan alurnya jelas." },
  { name: "Mila", stars: "★★★★★", text: "Suka karena invoice gampang dicek." },
  { name: "Zayn", stars: "★★★★☆", text: "Tampilan bersih, pilih nominal juga gampang." },
  { name: "Kris", stars: "★★★★★", text: "Untuk demo ini sudah berasa marketplace beneran." },
];

const CATEGORIES = ["Semua", "MOBA", "Battle Royale", "PC", "RPG", "Sports", "Voucher", "Subscription"];

const faqItems = [
  ["Berapa lama proses top up?", "Mode demo diproses langsung. Integrasi produksi nantinya mengikuti provider yang dipilih."],
  ["Apakah pembayaran di sini nyata?", "Tidak. Mode DEMO aktif, jadi preview pembayaran dan QR hanya simulasi."],
  ["Bagaimana cara cek pesanan?", "Buka menu Cek Transaksi lalu masukkan nomor invoice yang dibuat setelah checkout."],
];

const money = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const compact = (value) =>
  new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 }).format(Number(value || 0));

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function safeUser() {
  try {
    return JSON.parse(localStorage.getItem("playmartUser") || "null");
  } catch {
    return null;
  }
}

export default function Page() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [articles, setArticles] = useState([]);
  const [reviews, setReviews] = useState(FALLBACK_REVIEWS);
  const [config, setConfig] = useState({ demoMode: true, supportWhatsapp: "6281200000000" });
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    setUser(safeUser());
  }, [pathname]);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/articles").then((r) => r.json()),
      fetch("/api/reviews").then((r) => r.json()),
      fetch("/api/config").then((r) => r.json()),
    ])
      .then(([p, a, r, c]) => {
        if (!active) return;
        setProducts(Array.isArray(p) ? p : []);
        setArticles(Array.isArray(a) ? a : []);
        setReviews(Array.isArray(r) ? r : FALLBACK_REVIEWS);
        setConfig(c || {});
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setLoading(false);
        setToast("Gagal memuat data demo.");
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const go = (path) => {
    setDrawerOpen(false);
    router.push(path);
  };

  const logout = () => {
    localStorage.removeItem("playmartUser");
    setUser(null);
    setToast("Kamu sudah keluar dari akun demo.");
    go("/");
  };

  const isHome = pathname === "/";
  const isCatalog = pathname === "/catalog";
  const isProduct = pathname.startsWith("/product/");
  const isInvoice = pathname === "/invoice" || pathname.startsWith("/invoice/");
  const isArticles = pathname === "/articles";
  const isLeaderboard = pathname === "/leaderboard";
  const isReviews = pathname === "/reviews";
  const isCalculator = pathname.startsWith("/calculator");
  const isContact = pathname === "/contact-us";
  const isAuth = ["/sign-in", "/sign-up", "/forgot-password"].includes(pathname);
  const isLegal = ["/privacy-policy", "/terms"].includes(pathname);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <AnnouncementBar />
      <Header
        pathname={pathname}
        user={user}
        onNavigate={go}
        onMenu={() => setDrawerOpen(true)}
      />

      <main className="min-h-[calc(100vh-140px)]">
        {loading && !products.length ? (
          <LoadingState />
        ) : isHome ? (
          <HomePage products={products} articles={articles} reviews={reviews} onNavigate={go} />
        ) : isCatalog ? (
          <CatalogPage products={products} searchParams={searchParams} onNavigate={go} />
        ) : isProduct ? (
          <ProductPage
            slug={pathname.split("/")[2]}
            products={products}
            config={config}
            user={user}
            onNavigate={go}
            onToast={setToast}
          />
        ) : isInvoice ? (
          <InvoicePage invoiceId={pathname.split("/")[2]} onNavigate={go} onToast={setToast} />
        ) : isArticles ? (
          <ArticlesPage articles={articles} />
        ) : isLeaderboard ? (
          <LeaderboardPage />
        ) : isReviews ? (
          <ReviewsPage reviews={reviews} />
        ) : isCalculator ? (
          <MagicWheelPage />
        ) : isContact ? (
          <ContactPage config={config} onToast={setToast} />
        ) : isAuth ? (
          <AuthPage mode={pathname.slice(1)} onNavigate={go} onLogin={(nextUser) => setUser(nextUser)} onToast={setToast} />
        ) : isLegal ? (
          <LegalPage mode={pathname.slice(1)} />
        ) : (
          <NotFoundPage onNavigate={go} />
        )}
      </main>

      <Footer onNavigate={go} config={config} />

      <MobileDrawer
        open={drawerOpen}
        user={user}
        onClose={() => setDrawerOpen(false)}
        onNavigate={go}
        onLogout={logout}
      />

      {toast ? (
        <div className="fixed bottom-5 left-1/2 z-[120] w-[min(92vw,420px)] -translate-x-1/2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white shadow-2xl">
          {toast}
        </div>
      ) : null}
    </div>
  );
}

function AnnouncementBar() {
  return (
    <div className="bg-violet-600 px-4 py-2 text-center text-[11px] font-semibold text-white">
      <span className="inline-flex items-center gap-2">
        <Sparkles size={13} />
        Mode demo aktif · Tidak ada pembayaran uang nyata
      </span>
    </div>
  );
}

function Header({ pathname, user, onNavigate, onMenu }) {
  const links = [
    ["/", "Topup", Zap],
    ["/invoice", "Cek Transaksi", Package],
    ["/leaderboard", "Leaderboard", Trophy],
    ["/articles", "Artikel", BookOpen],
    ["/calculator/magic-wheel", "Kalkulator", BarChart3],
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-4 px-4 sm:px-6">
        <button onClick={() => onNavigate("/")} className="group flex shrink-0 items-center gap-3" aria-label="PlayMart">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20 transition group-hover:scale-[1.03]">
            <ShoppingBag size={19} />
          </span>
          <span className="hidden text-left sm:block">
            <span className="block text-[15px] font-extrabold tracking-tight">PlayMart</span>
            <span className="block text-[10px] font-medium text-slate-400">Game & Digital Store</span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map(([href, label, Icon]) => {
            const active = pathname === href || (href === "/" && pathname === "/");
            return (
              <button
                key={href}
                onClick={() => onNavigate(href)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-semibold transition",
                  active
                    ? "bg-violet-50 text-violet-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon size={15} />
                {label}
              </button>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button className="hidden h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 md:flex">
            <Globe2 size={15} />
            IDR
            <ChevronDown size={13} />
          </button>

          {user ? (
            <button
              onClick={() => onNavigate("/account")}
              className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 sm:flex"
            >
              <span className="grid h-6 w-6 place-items-center rounded-lg bg-slate-100 text-slate-500">
                <UserRound size={13} />
              </span>
              {user.username || "Akun"}
            </button>
          ) : (
            <button
              onClick={() => onNavigate("/sign-in")}
              className="hidden items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 sm:inline-flex"
            >
              <LogIn size={15} />
              Masuk
            </button>
          )}

          <button
            onClick={onMenu}
            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 lg:hidden"
            aria-label="Buka menu"
          >
            <Menu size={19} />
          </button>
        </div>
      </div>
    </header>
  );
}

function MobileDrawer({ open, user, onClose, onNavigate, onLogout }) {
  const links = [
    ["/", "Topup", Home],
    ["/catalog", "Semua Produk", Package],
    ["/invoice", "Cek Transaksi", RefreshCw],
    ["/leaderboard", "Leaderboard", Trophy],
    ["/articles", "Artikel", BookOpen],
    ["/calculator/magic-wheel", "Kalkulator", BarChart3],
    ["/contact-us", "Hubungi Kami", Headphones],
  ];

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-[70] bg-slate-950/40 backdrop-blur-[2px] transition",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed right-0 top-0 z-[80] flex h-full w-[86vw] max-w-[380px] flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-600 text-white">
              <ShoppingBag size={17} />
            </span>
            <div>
              <p className="text-sm font-extrabold">PlayMart</p>
              <p className="text-[10px] text-slate-400">Menu</p>
            </div>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200">
            <X size={17} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="mb-5 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 p-4 text-white">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-100">Akun</p>
            <p className="mt-1 text-sm font-bold">{user ? user.username : "Guest User"}</p>
            <p className="mt-1 text-xs text-violet-100">
              {user ? "Login demo aktif." : "Masuk untuk menyimpan sesi demo."}
            </p>
          </div>

          <div className="space-y-1">
            {links.map(([href, label, Icon]) => (
              <button
                key={href}
                onClick={() => onNavigate(href)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-950"
              >
                <span className="inline-flex items-center gap-3">
                  <Icon size={17} />
                  {label}
                </span>
                <ChevronRight size={15} className="text-slate-300" />
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-200 p-4">
          {user ? (
            <button
              onClick={onLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600"
            >
              <LogOut size={16} />
              Keluar
            </button>
          ) : (
            <button
              onClick={() => onNavigate("/sign-in")}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/20"
            >
              <LogIn size={16} />
              Masuk sebagai User
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

function Footer({ onNavigate, config }) {
  return (
    <footer className="mt-16 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <button onClick={() => onNavigate("/")} className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-violet-600 text-white">
                <ShoppingBag size={18} />
              </span>
              <div className="text-left">
                <p className="font-extrabold text-white">PlayMart</p>
                <p className="text-[10px] text-slate-500">Game & Digital Store</p>
              </div>
            </button>
            <p className="mt-5 max-w-sm text-sm leading-6 text-slate-500">
              Marketplace demo untuk top up game dan produk digital dengan fokus pada alur checkout yang jelas.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 px-3 py-1.5 text-[11px] font-semibold text-slate-400">
                <ShieldCheck size={13} />
                Demo Secure Flow
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 px-3 py-1.5 text-[11px] font-semibold text-slate-400">
                <Zap size={13} />
                Fast Checkout
              </span>
            </div>
          </div>

          <FooterColumn
            title="Produk"
            items={[
              ["/", "Topup"],
              ["/catalog", "Semua Produk"],
              ["/invoice", "Cek Transaksi"],
              ["/leaderboard", "Leaderboard"],
            ]}
            onNavigate={onNavigate}
          />
          <FooterColumn
            title="Bantuan"
            items={[
              ["/articles", "Artikel"],
              ["/contact-us", "Hubungi Kami"],
              ["/calculator/magic-wheel", "Kalkulator"],
              ["/reviews", "Ulasan"],
            ]}
            onNavigate={onNavigate}
          />
          <FooterColumn
            title="Legal"
            items={[
              ["/privacy-policy", "Kebijakan Privasi"],
              ["/terms", "Syarat & Ketentuan"],
            ]}
            onNavigate={onNavigate}
          >
            <a
              href={"https://wa.me/" + (config.supportWhatsapp || "6281200000000")}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-xs text-slate-500 hover:text-white"
            >
              <MessageCircle size={14} />
              WhatsApp Support
            </a>
          </FooterColumn>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-slate-800 pt-5 text-[11px] text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} PlayMart Demo.</span>
          <span>Mode demo · No real payment is charged.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, items, onNavigate, children }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-white">{title}</p>
      <div className="mt-4 space-y-2.5">
        {items.map(([href, label]) => (
          <button
            key={href + label}
            onClick={() => onNavigate(href)}
            className="block text-sm text-slate-500 transition hover:text-white"
          >
            {label}
          </button>
        ))}
        {children}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="h-7 w-52 animate-pulse rounded-lg bg-slate-200" />
      <div className="mt-3 h-4 w-80 max-w-full animate-pulse rounded-lg bg-slate-200" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
            <div className="h-44 animate-pulse bg-slate-100" />
            <div className="space-y-3 p-4">
              <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />
              <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
              <div className="h-8 w-full animate-pulse rounded-xl bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function HomePage({ products, articles, reviews, onNavigate }) {
  const popular = products.filter((p) => p.popular).slice(0, 8);
  const featured = popular.length ? popular : products.slice(0, 8);

  return (
    <>
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(139,92,246,.32),_transparent_35%),linear-gradient(135deg,#111827_0%,#2b174e_46%,#6d28d9_100%)]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_.92fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-violet-100 backdrop-blur">
                <Sparkles size={13} />
                Marketplace demo siap dicoba
              </div>
              <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.02] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                Top up cepat.
                <br />
                <span className="text-violet-300">Checkout lebih enak.</span>
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Cari game, pilih nominal, masukkan data akun, dan lihat preview pembayaran sebelum pesanan dibuat.
              </p>

              <div className="mt-7 flex max-w-2xl flex-col gap-2 sm:flex-row">
                <div className="flex min-h-14 flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white px-4 shadow-2xl">
                  <Search size={18} className="text-slate-400" />
                  <input
                    defaultValue=""
                    onKeyDown={(e) => {
                      if (e.key === "Enter") onNavigate("/catalog?q=" + encodeURIComponent(e.currentTarget.value));
                    }}
                    placeholder="Cari Mobile Legends, Free Fire, Valorant..."
                    className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-400"
                  />
                </div>
                <button
                  onClick={() => onNavigate("/catalog")}
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-white px-6 text-sm font-extrabold text-violet-700 shadow-xl shadow-black/10 transition hover:-translate-y-0.5"
                >
                  Jelajahi Produk
                  <ArrowRight size={17} />
                </button>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                {[
                  ["25+", "produk demo"],
                  ["4", "metode bayar"],
                  ["24/7", "support flow"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
                    <p className="text-lg font-extrabold text-white">{value}</p>
                    <p className="text-[10px] font-semibold text-slate-400">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-8 rounded-full bg-violet-500/20 blur-3xl" />
              <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl">
                <div className="overflow-hidden rounded-[22px] bg-slate-900">
                  <img
                    src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1400&q=85"
                    alt=""
                    className="h-64 w-full object-cover opacity-80"
                  />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <PromoStat icon={Tag} label="Promo demo" value="DEMO15" />
                  <PromoStat icon={Zap} label="Order flow" value="6 langkah" />
                </div>
                <div className="mt-3 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Highlight</p>
                    <p className="mt-1 text-sm font-bold text-white">Preview pembayaran sebelum bayar</p>
                  </div>
                  <ArrowRight size={18} className="text-violet-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="-mt-7 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 sm:grid-cols-3">
            <QuickFeature icon={ShieldCheck} title="Checkout transparan" text="Subtotal, fee, diskon, total." />
            <QuickFeature icon={Clock3} title="Alur ringkas" text="Data → nominal → pembayaran." />
            <QuickFeature icon={MessageCircle} title="Support siap" text="Shortcut WhatsApp dari halaman produk." />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16">
        <SectionHeading
          kicker="POPULER"
          title="Pilih produk favoritmu"
          desc="Kartu produk dibuat lebih bersih supaya nominal dan harga awal mudah dibaca."
          action="Lihat semua"
          onAction={() => onNavigate("/catalog")}
        />

        <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((category, i) => (
            <span
              key={category}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-xs font-bold",
                i === 0 ? "bg-violet-600 text-white" : "border border-slate-200 bg-white text-slate-500"
              )}
            >
              {category}
            </span>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.slug} product={product} onClick={() => onNavigate("/product/" + product.slug)} />
          ))}
        </div>
      </section>

      <section className="bg-white py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            kicker="CARA KERJA"
            title="Checkout yang lebih gampang dipahami"
            desc="Setiap tahap punya konteks dan ringkasan yang jelas."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              [1, "Pilih produk", "Buka game atau produk digital yang mau kamu beli."],
              [2, "Isi data & nominal", "Masukkan ID yang benar, pilih nominal dan jumlah."],
              [3, "Preview & konfirmasi", "Lihat detail biaya sebelum invoice dibuat."],
            ].map(([number, title, text]) => (
              <div key={number} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-600 text-sm font-extrabold text-white">
                  {number}
                </span>
                <h3 className="mt-5 text-base font-extrabold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <SectionHeading
          kicker="ARTIKEL"
          title="Tips gamer & informasi transaksi"
          desc="Konten demo disusun dalam layout editorial yang lebih rapi."
          action="Lihat semua"
          onAction={() => onNavigate("/articles")}
        />
        <div className="mt-7 grid gap-5 lg:grid-cols-3">
          {articles.slice(0, 3).map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </section>

      <section className="bg-slate-900 py-14 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-300">CUSTOMER REVIEWS</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">Feedback yang bikin flow terus dibenerin.</h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-slate-400">
              Semua review di versi ini masih data demo untuk membantu menguji tampilan.
            </p>
            <button
              onClick={() => onNavigate("/reviews")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-extrabold text-slate-900"
            >
              Lihat semua ulasan
              <ArrowRight size={15} />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {reviews.slice(0, 4).map((review) => (
              <div key={review.name} className="rounded-3xl border border-slate-800 bg-slate-950/40 p-5">
                <div className="text-xs tracking-[0.15em] text-amber-300">{review.stars}</div>
                <p className="mt-3 text-sm leading-6 text-slate-300">“{review.text}”</p>
                <p className="mt-4 text-xs font-bold text-white">{review.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function PromoStat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <Icon size={16} className="text-violet-300" />
      <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-extrabold text-white">{value}</p>
    </div>
  );
}

function QuickFeature({ icon: Icon, title, text }) {
  return (
    <div className="flex items-center gap-4 border-b border-slate-200 p-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-violet-50 text-violet-600">
        <Icon size={18} />
      </span>
      <div>
        <p className="text-sm font-extrabold">{title}</p>
        <p className="mt-1 text-xs text-slate-500">{text}</p>
      </div>
    </div>
  );
}

function SectionHeading({ kicker, title, desc, action, onAction }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-violet-600">{kicker}</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{desc}</p>
      </div>
      {action ? (
        <button onClick={onAction} className="inline-flex items-center gap-2 text-xs font-extrabold text-violet-700">
          {action}
          <ArrowRight size={14} />
        </button>
      ) : null}
    </div>
  );
}

function ProductCard({ product, onClick }) {
  return (
    <button onClick={onClick} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/8">
      <div className="relative h-44 overflow-hidden bg-slate-200">
        <img src={product.cover} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/10 to-transparent" />
        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-extrabold text-slate-700 backdrop-blur">
          {product.category}
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-violet-700 shadow-lg">{product.icon}</span>
          <span className="text-xs font-bold">{product.publisher}</span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-extrabold">{product.name}</h3>
            <p className="mt-1 text-[11px] text-slate-400">Mulai dari</p>
            <p className="mt-0.5 text-sm font-black text-violet-700">{money(product.denominations?.[0]?.price)}</p>
          </div>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-50 text-violet-700 transition group-hover:bg-violet-600 group-hover:text-white">
            <ArrowRight size={16} />
          </span>
        </div>
      </div>
    </button>
  );
}

function ArticleCard({ article }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="h-48 bg-slate-200">
        <img src={article.image} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-violet-600">
          <span>{article.tag}</span>
          <span className="text-slate-300">•</span>
          <span>{article.time}</span>
        </div>
        <h3 className="mt-3 text-base font-extrabold leading-6">{article.title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">{article.excerpt}</p>
      </div>
    </article>
  );
}

function CatalogPage({ products, searchParams, onNavigate }) {
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState("Semua");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchCat = category === "Semua" || p.category === category;
      const matchQ = !q || (p.name + " " + p.publisher + " " + p.category).toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [products, query, category]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
      <Breadcrumb items={[["Home", "/"], ["Katalog", "/catalog"]]} onNavigate={onNavigate} />
      <div className="mt-5 rounded-[32px] bg-slate-900 p-6 text-white sm:p-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-300">KATALOG</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Semua produk</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
          Filter game, voucher, dan subscription dari satu halaman.
        </p>
        <div className="mt-6 flex flex-col gap-3 lg:flex-row">
          <label className="flex min-h-12 flex-1 items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950/50 px-4">
            <Search size={17} className="text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama produk, publisher, kategori..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-600"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={cn(
                  "rounded-xl px-3 py-2 text-[11px] font-extrabold transition",
                  category === item ? "bg-white text-slate-900" : "bg-white/5 text-slate-400 hover:bg-white/10"
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-extrabold">{filtered.length} produk</p>
          <p className="mt-1 text-xs text-slate-500">Harga awal ditampilkan pada kartu.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-500">
          <Package size={14} />
          Demo catalog
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((product) => (
          <ProductCard key={product.slug} product={product} onClick={() => onNavigate("/product/" + product.slug)} />
        ))}
      </div>

      {!filtered.length ? (
        <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <Search size={24} className="mx-auto text-slate-400" />
          <p className="mt-3 text-sm font-extrabold">Produk tidak ditemukan</p>
          <p className="mt-1 text-xs text-slate-500">Coba kata kunci atau kategori lain.</p>
        </div>
      ) : null}
    </section>
  );
}

function ProductPage({ slug, products, config, user, onNavigate, onToast }) {
  const product = products.find((item) => item.slug === slug);
  const [selected, setSelected] = useState(product?.denominations?.[0] || null);
  const [payment, setPayment] = useState("QRIS");
  const [qty, setQty] = useState(1);
  const [promo, setPromo] = useState("");
  const [tab, setTab] = useState("transaction");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [accountData, setAccountData] = useState([]);
  const [wa, setWa] = useState(user?.whatsapp || "");

  useEffect(() => {
    if (!product) return;
    setSelected(product.denominations?.[0] || null);
    setAccountData(product.fields.map(() => ""));
  }, [product]);

  useEffect(() => {
    if (user?.whatsapp) setWa(user.whatsapp);
  }, [user]);

  if (!product) {
    return <NotFoundPage onNavigate={onNavigate} />;
  }

  const appliedPromo = promo.trim().toUpperCase() === "DEMO15";
  const subtotal = Number(selected?.price || 0) * qty;
  const discount = appliedPromo ? Math.round(subtotal * 0.15) : 0;
  const fee = 1500;
  const total = Math.max(0, subtotal + fee - discount);

  const updateAccount = (index, value) => {
    setAccountData((current) => current.map((v, i) => (i === index ? value : v)));
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
      <Breadcrumb
        items={[
          ["Home", "/"],
          ["Katalog", "/catalog"],
          [product.name, "/product/" + product.slug],
        ]}
        onNavigate={onNavigate}
      />

      <div className="mt-5 overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
        <div className="relative h-56 sm:h-72">
          <img src={product.cover} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4 text-white">
              <span className="grid h-14 w-14 place-items-center rounded-2xl border border-white/20 bg-white text-xl text-violet-700 shadow-xl">
                {product.icon}
              </span>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-violet-200">{product.category}</p>
                <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">{product.name}</h1>
                <p className="mt-1 text-xs text-slate-300">{product.publisher}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-violet-100">Mulai dari</p>
              <p className="mt-1 text-xl font-black text-white">{money(product.denominations?.[0]?.price)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <div className="grid gap-3 md:grid-cols-3">
            <InfoPill icon={Zap} title="Proses Cepat" text="Flow demo otomatis." />
            <InfoPill icon={Headphones} title="Chat Support" text="WhatsApp tersedia." />
            <InfoPill icon={ShieldCheck} title="Pembayaran Aman" text="Preview sebelum order." />
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex gap-1 border-b border-slate-200">
              {[
                ["transaction", "Transaksi"],
                ["information", "Keterangan"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={cn(
                    "border-b-2 px-4 pb-3 text-xs font-extrabold transition",
                    tab === key ? "border-violet-600 text-violet-700" : "border-transparent text-slate-400"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === "transaction" ? (
              <div className="mt-6 space-y-8">
                <CheckoutStep number="01" title="Masukkan Data Akun">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {product.fields.map((field, index) => (
                      <label key={field} className="block">
                        <span className="mb-2 block text-xs font-extrabold text-slate-700">{field}</span>
                        <input
                          value={accountData[index] || ""}
                          onChange={(e) => updateAccount(index, e.target.value)}
                          placeholder={"Masukkan " + field}
                          className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                        />
                      </label>
                    ))}
                  </div>
                  <p className="mt-3 text-[11px] leading-5 text-slate-400">
                    Pastikan data akun benar sebelum melanjutkan. Jangan masukkan password akun.
                  </p>
                </CheckoutStep>

                <CheckoutStep number="02" title="Pilih Nominal">
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {product.denominations.map((denomination) => {
                      const active = selected?.id === denomination.id;
                      return (
                        <button
                          key={denomination.id}
                          onClick={() => setSelected(denomination)}
                          className={cn(
                            "rounded-2xl border p-3 text-left transition",
                            active
                              ? "border-violet-500 bg-violet-50 shadow-sm"
                              : "border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50/40"
                          )}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className={cn("text-xs font-extrabold", active ? "text-violet-700" : "text-slate-700")}>
                              {denomination.label}
                            </span>
                            {active ? <Check size={15} className="text-violet-600" /> : null}
                          </div>
                          <p className="mt-1 text-sm font-black text-slate-950">{money(denomination.price)}</p>
                        </button>
                      );
                    })}
                  </div>
                </CheckoutStep>

                <CheckoutStep number="03" title="Masukkan Jumlah Pembelian">
                  <div className="inline-flex overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                    <button onClick={() => setQty((v) => Math.max(1, v - 1))} className="grid h-12 w-12 place-items-center bg-white text-slate-600 hover:bg-slate-100">
                      <Minus size={16} />
                    </button>
                    <div className="grid h-12 min-w-16 place-items-center px-3 text-sm font-black">{qty}</div>
                    <button onClick={() => setQty((v) => Math.min(20, v + 1))} className="grid h-12 w-12 place-items-center bg-white text-slate-600 hover:bg-slate-100">
                      <Plus size={16} />
                    </button>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-400">Maksimal 20 item per order demo.</p>
                </CheckoutStep>

                <CheckoutStep number="04" title="Kode Promo">
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="flex h-12 flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 focus-within:border-violet-500">
                      <TicketPercent size={16} className="text-slate-400" />
                      <input
                        value={promo}
                        onChange={(e) => setPromo(e.target.value)}
                        placeholder="Ketik Kode Promo Kamu"
                        className="w-full bg-transparent text-sm outline-none"
                      />
                    </div>
                    <button
                      onClick={() => onToast(promo.trim().toUpperCase() === "DEMO15" ? "Promo DEMO15 aktif." : "Kode promo demo tidak ditemukan.")}
                      className="rounded-xl border border-violet-200 bg-violet-50 px-5 text-xs font-extrabold text-violet-700"
                    >
                      Gunakan
                    </button>
                  </div>
                  <p className={cn("mt-2 text-[11px]", appliedPromo ? "text-emerald-600" : "text-slate-400")}>
                    {appliedPromo ? "✓ Promo DEMO15 aktif · diskon 15%." : "Pakai promo demo DEMO15 untuk mencoba diskon."}
                  </p>
                </CheckoutStep>

                <CheckoutStep number="05" title="Pilih Pembayaran">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      ["QRIS", "All Payment", WalletCards],
                      ["E-Wallet", "DANA / OVO", CreditCard],
                      ["VA", "Virtual Account", PanelTop],
                      ["Retail", "Alfamart / Indomaret", ShoppingBag],
                    ].map(([name, label, Icon]) => (
                      <button
                        key={name}
                        onClick={() => setPayment(name)}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl border p-4 text-left transition",
                          payment === name
                            ? "border-violet-500 bg-violet-50"
                            : "border-slate-200 bg-white hover:border-violet-200"
                        )}
                      >
                        <span className={cn("grid h-10 w-10 place-items-center rounded-xl", payment === name ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-500")}>
                          <Icon size={17} />
                        </span>
                        <span>
                          <span className="block text-xs font-extrabold">{name}</span>
                          <span className="mt-1 block text-[11px] text-slate-400">{label}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </CheckoutStep>

                <CheckoutStep number="06" title="Detail Kontak">
                  <label className="block max-w-xl">
                    <span className="mb-2 block text-xs font-extrabold text-slate-700">No. WhatsApp</span>
                    <input
                      value={wa}
                      onChange={(e) => setWa(e.target.value)}
                      placeholder="628XXXXXXXXXX"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                    />
                  </label>
                  <p className="mt-3 max-w-2xl text-[11px] leading-5 text-slate-400">
                    Nomor ini akan dipakai jika transaksi bermasalah. Tulis tanpa angka 0 di depan.
                  </p>
                </CheckoutStep>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                <p className="text-sm font-extrabold">Tentang {product.name}</p>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  Top up {product.name} melalui flow demo PlayMart. Pilih nominal, masukkan data akun, gunakan promo bila perlu, lalu lihat preview pembayaran.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-slate-500">
                  {[
                    "Cek ID/Server sebelum order.",
                    "Nominal dan quantity dihitung otomatis.",
                    "Preview pembayaran tampil sebelum invoice dibuat.",
                    "Invoice demo dapat dicek ulang kapan saja.",
                  ].map((text) => (
                    <li key={text} className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-500" />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-violet-600">ULASAN</p>
                <p className="mt-1 text-2xl font-black">0.0 <span className="text-base text-slate-400">/ 5.0</span></p>
              </div>
              <button onClick={() => onNavigate("/reviews")} className="text-xs font-extrabold text-violet-700">
                Lihat semua ulasan
              </button>
            </div>
            <p className="mt-3 text-xs text-slate-500">Pelanggan merasa puas dengan produk ini.</p>
          </div>
        </div>

        <aside className="h-fit xl:sticky xl:top-24">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-violet-600">RINGKASAN PESANAN</p>
                <h2 className="mt-2 text-lg font-black">{product.name}</h2>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-700">{product.icon}</span>
            </div>

            <div className="mt-6 space-y-3">
              <SummaryRow label="Nominal" value={selected?.label || "-"} />
              <SummaryRow label="Jumlah" value={qty + " ×"} />
              <SummaryRow label="Pembayaran" value={payment} />
              <SummaryRow label="Subtotal" value={money(subtotal)} />
              <SummaryRow label="Biaya layanan" value={money(fee)} />
              <SummaryRow label="Diskon" value={"− " + money(discount)} muted={discount === 0} />
              <div className="border-t border-dashed border-slate-200 pt-4">
                <SummaryRow label="Total pembayaran" value={money(total)} strong />
              </div>
            </div>

            <button
              onClick={() => {
                const valid = accountData.every((v) => v.trim()) && wa.trim();
                if (!valid) {
                  onToast("Lengkapi semua data akun dan nomor WhatsApp dulu.");
                  return;
                }
                setPreviewOpen(true);
              }}
              className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 text-sm font-extrabold text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-700"
            >
              Pesan Sekarang
              <ArrowRight size={17} />
            </button>

            <a
              href={"https://wa.me/" + (config.supportWhatsapp || "6281200000000")}
              target="_blank"
              rel="noreferrer"
              className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-extrabold text-slate-600"
            >
              <MessageCircle size={15} />
              Hubungi Admin
            </a>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck size={16} className="mt-0.5 text-emerald-500" />
                <div>
                  <p className="text-xs font-extrabold">Mode demo aman</p>
                  <p className="mt-1 text-[11px] leading-5 text-slate-500">
                    Tidak ada uang nyata yang ditagihkan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {previewOpen ? (
        <OrderPreviewModal
          product={product}
          selected={selected}
          qty={qty}
          payment={payment}
          subtotal={subtotal}
          fee={fee}
          discount={discount}
          total={total}
          accountData={accountData}
          wa={wa}
          promo={appliedPromo ? "DEMO15" : ""}
          onClose={() => setPreviewOpen(false)}
          onSuccess={(invoice) => {
            setPreviewOpen(false);
            onNavigate("/invoice/" + encodeURIComponent(invoice));
          }}
          onToast={onToast}
        />
      ) : null}
    </section>
  );
}

function InfoPill({ icon: Icon, title, text }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-50 text-violet-600">
          <Icon size={16} />
        </span>
        <div>
          <p className="text-xs font-extrabold">{title}</p>
          <p className="mt-1 text-[11px] text-slate-400">{text}</p>
        </div>
      </div>
    </div>
  );
}

function CheckoutStep({ number, title, children }) {
  return (
    <div className="grid grid-cols-[42px_minmax(0,1fr)] gap-4">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-50 text-[10px] font-black text-violet-700">
        {number}
      </span>
      <div>
        <h3 className="text-sm font-black">{title}</h3>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, strong, muted }) {
  return (
    <div className={cn("flex items-center justify-between gap-4 text-xs", strong && "text-sm")}>
      <span className={strong ? "font-extrabold text-slate-900" : "text-slate-500"}>{label}</span>
      <span className={cn("max-w-[55%] text-right", strong ? "font-black text-slate-950" : muted ? "text-slate-300" : "font-bold text-slate-700")}>
        {value}
      </span>
    </div>
  );
}

function OrderPreviewModal({
  product,
  selected,
  qty,
  payment,
  subtotal,
  fee,
  discount,
  total,
  accountData,
  wa,
  promo,
  onClose,
  onSuccess,
  onToast,
}) {
  const [loading, setLoading] = useState(false);

  const confirm = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          productSlug: product.slug,
          denominationId: selected.id,
          quantity: qty,
          userId: accountData[0] || "",
          serverId: accountData[1] || "",
          accountData,
          paymentMethod: payment,
          whatsapp: wa,
          promo,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Pesanan gagal dibuat.");
      localStorage.setItem("lastInvoice", data.invoice);
      onSuccess(data.invoice);
    } catch (error) {
      onToast(error.message || "Pesanan gagal dibuat.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/60 p-3 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-[30px] border border-white/20 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-5 sm:px-6">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-violet-600">PREVIEW PESANAN</p>
            <h2 className="mt-1 text-xl font-black">Cek sebelum lanjut</h2>
            <p className="mt-1 text-xs text-slate-400">Tidak ada pembayaran nyata dalam demo.</p>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200">
            <X size={17} />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-5 sm:p-6">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-violet-700 shadow-sm">{product.icon}</span>
              <div>
                <p className="text-sm font-extrabold">{product.name}</p>
                <p className="mt-1 text-[11px] text-slate-400">{selected.label}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <PreviewItem label="Data akun" value={accountData.join(" · ")} />
            <PreviewItem label="WhatsApp" value={wa} />
            <PreviewItem label="Jumlah" value={String(qty)} />
            <PreviewItem label="Pembayaran" value={payment} />
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 p-4">
            <SummaryRow label="Subtotal" value={money(subtotal)} />
            <div className="mt-3"><SummaryRow label="Biaya layanan" value={money(fee)} /></div>
            <div className="mt-3"><SummaryRow label="Diskon" value={"− " + money(discount)} muted={!discount} /></div>
            <div className="mt-4 border-t border-dashed border-slate-200 pt-4">
              <SummaryRow label="Total bayar" value={money(total)} strong />
            </div>
          </div>
        </div>

        <div className="grid gap-2 border-t border-slate-200 bg-white p-5 sm:grid-cols-2 sm:p-6">
          <button onClick={onClose} className="h-12 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-600">
            Kembali
          </button>
          <button
            onClick={confirm}
            disabled={loading}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-violet-600 text-xs font-extrabold text-white disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Konfirmasi & Bayar"}
            {!loading ? <ArrowRight size={15} /> : null}
          </button>
        </div>
      </div>
    </div>
  );
}

function PreviewItem({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-1 break-words text-xs font-extrabold text-slate-800">{value || "-"}</p>
    </div>
  );
}

function InvoicePage({ invoiceId, onNavigate, onToast }) {
  const [invoice, setInvoice] = useState(null);
  const [search, setSearch] = useState(invoiceId ? decodeURIComponent(invoiceId) : "");
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(Boolean(invoiceId));

  useEffect(() => {
    fetch("/api/transactions/recent")
      .then((r) => r.json())
      .then((data) => setRecent(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!invoiceId) return;
    lookup(decodeURIComponent(invoiceId));
  }, [invoiceId]);

  async function lookup(value) {
    const trimmed = value.trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      const response = await fetch("/api/orders/" + encodeURIComponent(trimmed));
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Invoice tidak ditemukan.");
      setInvoice(data);
    } catch (error) {
      setInvoice(null);
      onToast(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
      <Breadcrumb items={[["Home", "/"], ["Cek Transaksi", "/invoice"]]} onNavigate={onNavigate} />
      <div className="mt-5 max-w-3xl">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-violet-600">CEK TRANSAKSI</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Lacak invoice kamu</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">Masukkan nomor invoice yang dibuat setelah checkout.</p>
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <div className="flex h-13 flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">
          <Search size={17} className="text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Contoh: TPDEMO..." className="w-full text-sm outline-none" />
        </div>
        <button onClick={() => lookup(search)} disabled={loading} className="h-13 rounded-2xl bg-violet-600 px-6 text-xs font-extrabold text-white disabled:opacity-60">
          {loading ? "Mencari..." : "Cari Invoice"}
        </button>
      </div>

      {invoice ? (
        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <div className="rounded-3xl bg-emerald-50 p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-emerald-600">
                  <Check size={18} />
                </span>
                <div>
                  <p className="text-sm font-black text-emerald-800">
                    {invoice.transactionStatus === "SUCCESS" ? "Pesanan selesai" : "Pesanan dibuat"}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-emerald-700">{invoice.message}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {["Order", "Pembayaran", "Diproses", "Selesai"].map((step) => (
                <div key={step} className="rounded-2xl bg-white p-3 text-center shadow-sm ring-1 ring-slate-200">
                  <span className="mx-auto grid h-7 w-7 place-items-center rounded-full bg-emerald-50 text-[10px] font-black text-emerald-600">
                    <Check size={13} />
                  </span>
                  <p className="mt-2 text-[9px] font-bold text-slate-500">{step}</p>
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-black">Detail pesanan</p>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(invoice.invoice);
                    onToast("Nomor invoice disalin.");
                  }}
                  className="inline-flex items-center gap-2 text-[11px] font-extrabold text-violet-700"
                >
                  <Copy size={14} />
                  Salin
                </button>
              </div>
              <div className="mt-5 divide-y divide-slate-100">
                <InvoiceRow label="No. Invoice" value={invoice.invoice} />
                <InvoiceRow label="Produk" value={invoice.product} />
                <InvoiceRow label="Item" value={invoice.item + (invoice.quantity ? " × " + invoice.quantity : "")} />
                <InvoiceRow label="ID Akun" value={invoice.userId} />
                <InvoiceRow label="Server" value={invoice.serverId || "—"} />
                <InvoiceRow label="Metode Pembayaran" value={invoice.paymentMethod} />
                <InvoiceRow label="Status Pembayaran" value={invoice.paymentStatus} badge={invoice.paymentStatus === "PAID"} />
                <InvoiceRow label="Status Transaksi" value={invoice.transactionStatus} badge={invoice.transactionStatus === "SUCCESS"} />
              </div>
            </div>
          </div>

          <aside className="h-fit xl:sticky xl:top-24">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/5">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-violet-600">PEMBAYARAN DEMO</p>
              <p className="mt-2 text-3xl font-black">{invoice.amountLabel}</p>
              <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5">
                <div className="mx-auto grid aspect-square w-44 place-items-center rounded-3xl bg-white p-4 shadow-sm">
                  <FakeQr />
                </div>
                <p className="mt-4 text-center text-[11px] leading-5 text-slate-500">
                  QR ini hanya placeholder demo. Tidak terhubung ke payment gateway.
                </p>
              </div>
              <button
                onClick={() => onNavigate("/product/" + invoice.productSlug)}
                className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-xs font-extrabold text-white"
              >
                Beli Lagi
                <ArrowRight size={15} />
              </button>
            </div>
          </aside>
        </div>
      ) : (
        <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <Package size={24} className="mx-auto text-slate-300" />
          <p className="mt-3 text-sm font-extrabold">Belum ada invoice yang dipilih</p>
          <p className="mt-1 text-xs text-slate-500">Buat order demo dari salah satu halaman produk.</p>
        </div>
      )}

      <div className="mt-12">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-violet-600">DEMO FEED</p>
            <h2 className="mt-2 text-xl font-black">Transaksi terbaru</h2>
          </div>
        </div>
        <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white">
          <div className="divide-y divide-slate-100">
            {recent.map((row) => (
              <button
                key={row.invoice}
                onClick={() => {
                  setSearch(row.invoice);
                  lookup(row.invoice);
                }}
                className="grid w-full grid-cols-[1.1fr_1fr_auto] gap-3 px-4 py-4 text-left text-xs hover:bg-slate-50 sm:grid-cols-[1.1fr_1.5fr_1fr_auto]"
              >
                <span className="font-extrabold text-slate-700">{row.invoice}</span>
                <span className="truncate text-slate-500">{row.product}</span>
                <span className="text-slate-500">{row.amount}</span>
                <span className={cn("rounded-full px-2 py-1 text-[9px] font-black", row.status === "SUCCESS" ? "bg-emerald-50 text-emerald-600" : "bg-violet-50 text-violet-600")}>
                  {row.status}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FakeQr() {
  const cells = [];
  for (let i = 0; i < 121; i++) {
    const edge = i < 11 || i >= 110 || i % 11 === 0 || i % 11 === 10;
    const block = (i * 13) % 17 < 7;
    cells.push(<span key={i} className={cn("h-2.5 w-2.5", edge || block ? "bg-slate-900" : "bg-white")} />);
  }
  return <div className="grid grid-cols-11 gap-0.5">{cells}</div>;
}

function InvoiceRow({ label, value, badge }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 text-xs">
      <span className="text-slate-400">{label}</span>
      {badge ? (
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-black text-emerald-600">{value}</span>
      ) : (
        <span className="max-w-[64%] break-words text-right font-extrabold text-slate-700">{value}</span>
      )}
    </div>
  );
}

function ArticlesPage({ articles }) {
  const [active, setActive] = useState(null);
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
      <SectionHeading
        kicker="ARTIKEL"
        title="Informasi untuk gamer"
        desc="Koleksi guide, tips, dan insight transaksi digital dalam grid editorial."
      />
      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {articles.map((article) => (
          <button key={article.id} onClick={() => setActive(article)} className="text-left">
            <ArticleCard article={article} />
          </button>
        ))}
      </div>
      {active ? (
        <SimpleModal title={active.title} subtitle={active.tag + " · " + active.time} onClose={() => setActive(null)}>
          <div className="overflow-hidden rounded-2xl">
            <img src={active.image} alt="" className="h-60 w-full object-cover" />
          </div>
          <p className="mt-5 text-sm leading-7 text-slate-600">{active.excerpt}</p>
          <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-xs leading-6 text-slate-500">
            Konten ini masih demo. Struktur siap disambungkan ke CMS atau sumber berita produksi.
          </div>
        </SimpleModal>
      ) : null}
    </section>
  );
}

function LeaderboardPage() {
  const [period, setPeriod] = useState("today");
  const names = [
    ["Raka Gaming", 4870],
    ["Noxx", 3920],
    ["Vynn", 3410],
    ["Mika", 2980],
    ["Azel", 2550],
    ["Kyo", 2180],
    ["Renz", 1940],
    ["Lynn", 1720],
    ["Fano", 1590],
    ["Diva", 1470],
  ];
  const multiplier = period === "today" ? 1 : period === "week" ? 1.7 : 2.5;

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:py-14">
      <SectionHeading
        kicker="LEADERBOARD"
        title="Top 10 pembelian terbanyak"
        desc="Data demo untuk menguji tab, ranking, dan responsif layout."
      />
      <div className="mt-6 flex flex-wrap gap-2">
        {[
          ["today", "Hari Ini"],
          ["week", "Minggu Ini"],
          ["month", "Bulan Ini"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            className={cn(
              "rounded-xl px-4 py-2 text-xs font-extrabold",
              period === key ? "bg-violet-600 text-white" : "border border-slate-200 bg-white text-slate-500"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {names.map(([name, points], index) => (
          <div key={name} className="grid grid-cols-[42px_1fr_auto] items-center gap-3 border-b border-slate-100 px-4 py-4 last:border-b-0 sm:grid-cols-[50px_1fr_120px] sm:px-5">
            <span className={cn("grid h-9 w-9 place-items-center rounded-xl text-xs font-black", index < 3 ? "bg-violet-50 text-violet-700" : "bg-slate-100 text-slate-500")}>
              {index + 1}
            </span>
            <div>
              <p className="text-sm font-extrabold">{name}</p>
              <p className="mt-1 text-[10px] text-slate-400">PlayMart Demo User</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-slate-900">{money(Math.round(points * 1000 * multiplier))}</p>
              <p className="mt-1 text-[10px] font-bold text-violet-600">{compact(Math.round(points * multiplier))} pts</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ReviewsPage({ reviews }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <SectionHeading
        kicker="ULASAN"
        title="Apa kata pelanggan demo?"
        desc="Kumpulan review simulasi untuk mengisi tampilan customer feedback."
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review) => (
          <article key={review.name} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm tracking-[0.18em] text-amber-400">{review.stars}</div>
            <p className="mt-4 text-sm leading-7 text-slate-600">“{review.text}”</p>
            <div className="mt-5 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-500">
                <UserRound size={16} />
              </span>
              <div>
                <p className="text-xs font-extrabold">{review.name}</p>
                <p className="mt-1 text-[10px] text-slate-400">Verified demo</p>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-white p-5 text-center text-xs font-semibold text-slate-400">
        Tidak ada lagi yang dapat dimuat
      </div>
    </section>
  );
}

function MagicWheelPage() {
  const [point, setPoint] = useState(0);
  const stars = Math.floor(point / 10);
  const need = Math.max(0, 10800 - stars * 60);

  return (
    <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-14">
      <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
        <div className="bg-gradient-to-br from-slate-950 to-violet-900 px-6 py-8 text-white sm:px-8">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-violet-300">KALKULATOR</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Magic Wheel Calculator</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Geser titik untuk melihat estimasi diamond yang masih dibutuhkan.
          </p>
        </div>
        <div className="p-6 sm:p-8">
          <div className="mx-auto grid h-52 w-52 place-items-center rounded-full border-[18px] border-slate-900 bg-[conic-gradient(#7c3aed_0deg,#e9d5ff_90deg,#7c3aed_180deg,#e9d5ff_270deg,#7c3aed_360deg)] shadow-xl">
            <div className="grid h-24 w-24 place-items-center rounded-full bg-white text-center shadow-lg">
              <div>
                <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Stars</p>
                <p className="text-3xl font-black text-slate-950">{stars}</p>
              </div>
            </div>
          </div>

          <label className="mt-10 block">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-extrabold">Titik Magic Wheel Kamu</span>
              <span className="rounded-full bg-violet-50 px-3 py-1 text-[10px] font-black text-violet-700">{point}</span>
            </div>
            <input
              value={point}
              onChange={(e) => setPoint(Number(e.target.value))}
              type="range"
              min="0"
              max="180"
              className="mt-5 w-full accent-violet-600"
            />
          </label>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Poin bintang</p>
              <p className="mt-2 text-3xl font-black">{stars}</p>
            </div>
            <div className="rounded-3xl bg-violet-50 p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-violet-400">Membutuhkan</p>
              <p className="mt-2 text-3xl font-black text-violet-700">{need.toLocaleString("id-ID")}</p>
              <p className="mt-1 text-[11px] text-violet-500">Diamond</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactPage({ config, onToast }) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:py-14">
      <div className="grid gap-6 lg:grid-cols-[.75fr_1.25fr]">
        <div className="rounded-[32px] bg-slate-900 p-7 text-white sm:p-8">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-violet-300">SUPPORT</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight">Hubungi kami</h1>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            Tempatkan pertanyaan, laporan transaksi, atau request bantuan di sini.
          </p>
          <div className="mt-8 space-y-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">WhatsApp</p>
              <p className="mt-2 text-sm font-extrabold">{config.supportWhatsapp || "6281200000000"}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Email</p>
              <p className="mt-2 text-sm font-extrabold">support@playmart.demo</p>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-black">Kirim laporan / permintaan</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-xs font-extrabold">Nama</span>
              <input className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none" placeholder="Nama kamu" />
            </label>
            <label>
              <span className="mb-2 block text-xs font-extrabold">WhatsApp</span>
              <input className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none" placeholder="628XXXXXXXXXX" />
            </label>
          </div>
          <label className="mt-4 block">
            <span className="mb-2 block text-xs font-extrabold">Tipe</span>
            <select className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none">
              <option>Masalah Transaksi</option>
              <option>Permintaan</option>
              <option>Pertanyaan</option>
            </select>
          </label>
          <label className="mt-4 block">
            <span className="mb-2 block text-xs font-extrabold">Deskripsi</span>
            <textarea className="min-h-36 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" placeholder="Ceritakan detailnya..." />
          </label>
          <button onClick={() => onToast("Demo: laporan berhasil dikirim.")} className="mt-5 h-12 w-full rounded-xl bg-violet-600 text-sm font-extrabold text-white">
            Kirim Pesan
          </button>
        </div>
      </div>
    </section>
  );
}

function AuthPage({ mode, onNavigate, onLogin, onToast }) {
  const [form, setForm] = useState({ name: "", username: "", email: "", whatsapp: "", password: "", confirm: "", agree: true });
  const [loading, setLoading] = useState(false);
  const title = mode === "sign-up" ? "Buat akun demo" : mode === "forgot-password" ? "Reset password" : "Masuk ke PlayMart";

  const submit = async () => {
    setLoading(true);
    try {
      if (mode === "sign-up") {
        if (!form.agree) throw new Error("Centang persetujuan dulu.");
        if (form.password !== form.confirm) throw new Error("Konfirmasi password tidak sama.");
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Pendaftaran gagal.");
        localStorage.setItem("playmartUser", JSON.stringify(data.user));
        onLogin(data.user);
        onToast("Akun demo berhasil dibuat.");
        onNavigate("/");
      } else if (mode === "sign-in") {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: { username: form.username, password: form.password }.constructor === Object
            ? JSON.stringify({ username: form.username, password: form.password })
            : "{}",
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Login gagal.");
        localStorage.setItem("playmartUser", JSON.stringify(data.user));
        onLogin(data.user);
        onToast("Login demo berhasil.");
        onNavigate("/");
      } else {
        onToast("Demo: tautan reset password disimulasikan.");
      }
    } catch (error) {
      onToast(error.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-md px-4 py-12 sm:px-6 lg:py-16">
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
        <div className="text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-violet-600 text-white">
            {mode === "sign-up" ? <UserRound size={20} /> : mode === "forgot-password" ? <RefreshCw size={20} /> : <LogIn size={20} />}
          </span>
          <p className="mt-5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-violet-600">ACCOUNT DEMO</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {mode === "sign-in"
              ? "Gunakan akun demo bawaan atau akun demo yang sudah kamu daftarkan."
              : mode === "sign-up"
                ? "Buat akun untuk mencoba flow user dari ujung ke ujung."
                : "Masukkan username atau email untuk simulasi reset."}
          </p>
        </div>

        {mode === "sign-in" ? (
          <div className="mt-6 rounded-2xl bg-violet-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-violet-400">Akun demo bawaan</p>
            <p className="mt-2 text-sm font-extrabold text-violet-900">demo / demo123</p>
          </div>
        ) : null}

        <div className="mt-6 space-y-4">
          {mode === "sign-up" ? (
            <>
              <AuthInput label="Nama lengkap" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              <AuthInput label="Username" value={form.username} onChange={(v) => setForm({ ...form, username: v })} />
              <AuthInput label="Alamat email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" />
              <AuthInput label="Nomor WhatsApp" value={form.whatsapp} onChange={(v) => setForm({ ...form, whatsapp: v })} />
              <AuthInput label="Kata sandi" value={form.password} onChange={(v) => setForm({ ...form, password: v })} type="password" />
              <AuthInput label="Konfirmasi kata sandi" value={form.confirm} onChange={(v) => setForm({ ...form, confirm: v })} type="password" />
              <label className="flex items-start gap-2 text-[11px] leading-5 text-slate-500">
                <input checked={form.agree} onChange={(e) => setForm({ ...form, agree: e.target.checked })} type="checkbox" className="mt-1" />
                Saya setuju dengan Syarat dan Ketentuan serta Kebijakan Privasi.
              </label>
            </>
          ) : mode === "forgot-password" ? (
            <AuthInput label="Username / Email" value={form.username} onChange={(v) => setForm({ ...form, username: v })} />
          ) : (
            <>
              <AuthInput label="Username" value={form.username} onChange={(v) => setForm({ ...form, username: v })} />
              <AuthInput label="Kata sandi" value={form.password} onChange={(v) => setForm({ ...form, password: v })} type="password" />
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Ingat akun ini</span>
                <button onClick={() => onNavigate("/forgot-password")} className="font-extrabold text-violet-700">Lupa password?</button>
              </div>
            </>
          )}
        </div>

        <button
          onClick={submit}
          disabled={loading}
          className="mt-6 h-12 w-full rounded-xl bg-violet-600 text-sm font-extrabold text-white disabled:opacity-60"
        >
          {loading ? "Memproses..." : mode === "sign-up" ? "Daftar" : mode === "forgot-password" ? "Kirim Link Reset" : "Masuk"}
        </button>

        {mode === "sign-in" ? (
          <p className="mt-5 text-center text-xs text-slate-400">
            Belum punya akun?{" "}
            <button onClick={() => onNavigate("/sign-up")} className="font-extrabold text-violet-700">Daftar</button>
          </p>
        ) : (
          <p className="mt-5 text-center text-xs text-slate-400">
            Kembali ke{" "}
            <button onClick={() => onNavigate("/sign-in")} className="font-extrabold text-violet-700">Masuk</button>
          </p>
        )}
      </div>
    </section>
  );
}

function AuthInput({ label, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-extrabold">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10" />
    </label>
  );
}

function LegalPage({ mode }) {
  const privacy = mode === "privacy-policy";
  return (
    <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-14">
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-violet-600">LEGAL</p>
        <h1 className="mt-2 text-3xl font-black">{privacy ? "Kebijakan Privasi" : "Syarat & Ketentuan"}</h1>
        <p className="mt-3 text-sm leading-7 text-slate-500">
          {privacy
            ? "Dokumen demo untuk menjelaskan penggunaan data dalam versi simulasi PlayMart."
            : "Ketentuan demo untuk menjelaskan batasan penggunaan layanan simulasi PlayMart."}
        </p>

        <div className="mt-8 space-y-7">
          {(
            privacy
              ? [
                  ["1. Pengantar", "PlayMart Demo adalah simulasi layanan top up game dan produk digital."],
                  ["2. Penggunaan Data", "Data yang dimasukkan digunakan untuk membuat invoice dan menampilkan status transaksi demo."],
                  ["3. Keamanan", "Jangan masukkan password akun game atau data pembayaran sensitif."],
                  ["4. Retensi", "Versi produksi nantinya memakai kebijakan penyimpanan data yang lebih lengkap."],
                ]
              : [
                  ["1. Penggunaan Layanan", "PlayMart Demo hanya untuk pengujian tampilan dan alur."],
                  ["2. Transaksi", "Tidak ada pembayaran uang nyata selama DEMO_MODE aktif."],
                  ["3. Data Akun", "Gunakan data contoh saat mencoba fitur."],
                ]
          ).map(([title, text]) => (
            <div key={title}>
              <h2 className="text-sm font-black">{title}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Breadcrumb({ items, onNavigate }) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-semibold text-slate-400">
      {items.map(([label, href], index) => (
        <div key={label} className="flex shrink-0 items-center gap-1.5">
          {index > 0 ? <ChevronRight size={13} className="text-slate-300" /> : null}
          <button onClick={() => onNavigate(href)} className={index === items.length - 1 ? "text-slate-600" : "hover:text-violet-700"}>
            {label}
          </button>
        </div>
      ))}
    </div>
  );
}

function SimpleModal({ title, subtitle, children, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/60 p-3 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-[30px] bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-5">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-violet-600">{subtitle}</p>
            <h2 className="mt-1 text-lg font-black">{title}</h2>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200">
            <X size={17} />
          </button>
        </div>
        <div className="max-h-[78vh] overflow-y-auto p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
}

function NotFoundPage({ onNavigate }) {
  return (
    <section className="mx-auto max-w-xl px-4 py-20 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
        <MoreHorizontal size={24} />
      </span>
      <h1 className="mt-5 text-3xl font-black">Halaman tidak ditemukan</h1>
      <p className="mt-2 text-sm text-slate-500">Route yang kamu buka belum tersedia di demo ini.</p>
      <button onClick={() => onNavigate("/")} className="mt-6 rounded-xl bg-violet-600 px-5 py-3 text-xs font-extrabold text-white">
        Kembali ke Home
      </button>
    </section>
  );
}
