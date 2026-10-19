import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, MapPin, ShieldCheck, ShoppingBag, Store } from "lucide-react";

export const metadata: Metadata = {
  title: "UrbanNest — Discover Your Style, Closer.",
  description:
    "A new way to discover independent fashion shops and local brands. UrbanNest is building a marketplace rooted in your neighbourhood.",
};

const values = [
  {
    icon: Store,
    title: "Independent shops",
    description: "Find local boutiques and emerging labels as the marketplace grows.",
  },
  {
    icon: MapPin,
    title: "Closer to home",
    description: "Discover fashion from sellers in your city and beyond.",
  },
  {
    icon: ShieldCheck,
    title: "A considered experience",
    description: "Seller review and clear order information are part of the plan.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-brand-50">
      <header className="border-b border-brand-200/70 bg-white/80">
        <nav className="container-main flex h-18 items-center justify-between" aria-label="Main navigation">
          <Link href="/" className="flex items-center gap-3" aria-label="UrbanNest home">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-950 font-display text-xl font-semibold text-white">U</span>
            <span className="font-display text-xl font-semibold tracking-tight text-ink-950">UrbanNest</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="rounded-full px-4 py-2 text-sm font-medium text-ink-700 hover:bg-brand-50">Log in</Link>
            <Link href="/register" className="rounded-full bg-ink-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-ink-800">Join UrbanNest</Link>
          </div>
        </nav>
      </header>

      <section className="container-main grid min-h-[570px] items-center gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
        <div className="max-w-2xl">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-800">
            <span className="h-2 w-2 rounded-full bg-brand-500" /> A marketplace taking shape
          </p>
          <h1 className="font-display text-5xl leading-[1.08] tracking-tight text-ink-950 sm:text-6xl lg:text-7xl">
            Good style has a <span className="italic text-brand-700">neighbourhood.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-ink-600">
            UrbanNest is building a home for independent fashion shops, local labels, and the people who love finding them.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/catalog" className="inline-flex items-center gap-2 rounded-full bg-ink-950 px-6 py-3.5 font-medium text-white transition hover:bg-ink-800">
              Browse the catalogue <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link href="/register" className="inline-flex items-center gap-2 rounded-full bg-ink-950 px-6 py-3.5 font-medium text-white transition hover:bg-ink-800">
              Create your account <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link href="/login" className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-6 py-3.5 font-medium text-ink-800 transition hover:border-ink-400">
              <ShoppingBag size={17} aria-hidden="true" /> Sign in
            </Link>
          </div>
          <p className="mt-5 text-sm text-ink-500">The shop catalogue is being prepared. No products are listed yet.</p>
        </div>

        <div className="relative mx-auto w-full max-w-lg">
          <div className="absolute -inset-4 rounded-[2.5rem] bg-brand-200/50 blur-2xl" aria-hidden="true" />
          <div className="relative overflow-hidden rounded-[2rem] bg-ink-950 p-8 text-white shadow-2xl sm:p-10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">Made for discovery</p>
                <p className="mt-2 font-display text-3xl">A little closer.</p>
              </div>
              <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/70">UrbanNest</span>
            </div>
            <div className="my-10 grid grid-cols-2 gap-3">
              <div className="flex h-44 items-end rounded-2xl bg-gradient-to-br from-brand-300 via-brand-500 to-brand-800 p-4">
                <span className="text-sm font-medium text-white">Find your next favourite</span>
              </div>
              <div className="mt-8 flex h-44 items-end rounded-2xl bg-gradient-to-br from-[#e9d9c8] via-[#ad8666] to-[#5e4836] p-4">
                <span className="text-sm font-medium text-white">Support local style</span>
              </div>
            </div>
            <p className="max-w-sm text-sm leading-6 text-white/65">We’re laying the groundwork for thoughtful shopping from the stores around you.</p>
          </div>
        </div>
      </section>

      <section className="border-y border-brand-200/70 bg-white py-16 sm:py-20">
        <div className="container-main">
          <div className="mb-10 max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">The idea</p>
            <h2 className="mt-3 font-display text-3xl text-ink-950 sm:text-4xl">A better way to find what feels like you.</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {values.map(({ icon: Icon, title, description }) => (
              <article key={title} className="border-t border-brand-200 pt-5">
                <Icon size={21} className="text-brand-700" aria-hidden="true" />
                <h3 className="mt-4 font-semibold text-ink-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="container-main flex flex-col gap-3 py-8 text-sm text-ink-500 sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} UrbanNest</span>
        <div className="flex gap-4"><Link href="/seller" className="hover:text-ink-950">Sell on UrbanNest</Link><span>Independent style, rooted locally.</span></div>
      </footer>
    </main>
  );
}
