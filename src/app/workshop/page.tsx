"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Database, Timer, Eye, Zap, RefreshCw, Moon, Sun,
  ArrowRight, Target, ListChecks, Compass, TrendingUp,
  Search, Lightbulb, Bell, MessageSquare, Users, Layers,
  CheckCircle2, Sparkles, BarChart3, Gauge, ArrowUpRight,
} from "lucide-react";
import {
  BENEFITS, KPI_STEPS, INTERPRET_STEPS, REPORTING_PRACTICES,
  TOOLS_TABLE, TOOL_DETAILS, SECTIONS,
} from "./data";

const BENEFIT_ICONS: Record<string, React.ElementType> = {
  database: Database, timer: Timer, eye: Eye, zap: Zap, refresh: RefreshCw,
};
const INTERPRET_ICONS = [TrendingUp, Compass, Search, Lightbulb, ArrowUpRight];
const REPORTING_ICONS = [Timer, Users, MessageSquare, Bell, RefreshCw];

// ── Scroll-reveal wrapper ──
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="max-w-2xl mb-12">
      <Reveal>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#5053C8] dark:text-[#BE98FF] bg-[#5053C8]/10 dark:bg-[#BE98FF]/10 px-3 py-1 rounded-full">
          {eyebrow}
        </span>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-foreground">{title}</h2>
      </Reveal>
      {subtitle && (
        <Reveal delay={0.1}>
          <p className="mt-3 text-base text-muted-foreground leading-relaxed">{subtitle}</p>
        </Reveal>
      )}
    </div>
  );
}

export default function Workshop() {
  const { theme, setTheme } = useTheme();
  const [active, setActive] = useState("why");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-5 h-16">
          <Link href="/workshop" className="flex items-center gap-2">
            <Image src="/logo.png" alt="MazNexa" width={420} height={90} className="h-6 w-auto object-contain" priority />
          </Link>
          <nav className="hidden lg:flex items-center gap-1">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  active === s.id ? "text-[#5053C8] dark:text-[#BE98FF] bg-[#5053C8]/10 dark:bg-[#BE98FF]/10" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-9 h-9 rounded-lg border border-input flex items-center justify-center hover:bg-muted transition-colors"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-medium text-white gradient-brand hover:opacity-90 transition-opacity"
            >
              <BarChart3 className="w-4 h-4" /> Live Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-40"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(190,152,255,0.35), transparent 70%)" }}
        />
        <div className="relative max-w-6xl mx-auto px-5 pt-20 pb-24 text-center">
          <Reveal>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#5053C8] dark:text-[#BE98FF] bg-white/60 dark:bg-white/5 border border-[#5053C8]/20 px-3 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5" /> MazNexa Workshop
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
              Dashboard Monitoring &<br />
              <span className="text-gradient">Performance Reporting</span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed">
              How to build dashboards that people actually use — turning scattered data
              into a single source of truth, clear KPIs, and decisions you can act on.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a href="#why" className="inline-flex items-center gap-2 h-11 px-6 rounded-xl text-white gradient-brand font-medium hover:opacity-90 transition-opacity">
                Start the Workshop <ArrowRight className="w-4 h-4" />
              </a>
              <Link href="/" className="inline-flex items-center gap-2 h-11 px-6 rounded-xl border border-input font-medium hover:bg-muted transition-colors">
                <Gauge className="w-4 h-4" /> See it live
              </Link>
            </div>
          </Reveal>

          {/* stat strip */}
          <Reveal delay={0.32}>
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {[
                { k: "5", v: "Core principles" },
                { k: "10", v: "KPI & insight rules" },
                { k: "4", v: "Reporting tools" },
                { k: "1", v: "Source of truth" },
              ].map((s) => (
                <div key={s.v} className="rounded-2xl border border-border bg-card/60 backdrop-blur px-4 py-5">
                  <p className="text-3xl font-bold text-gradient">{s.k}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.v}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 1. Why dashboards ── */}
      <section id="why" className="max-w-6xl mx-auto px-5 py-20 scroll-mt-20">
        <SectionHeading
          eyebrow="01 · Foundations"
          title="Why dashboards matter"
          subtitle="Reporting principles and the common pitfalls to avoid. A good dashboard is not about more data — it's about the right data, in the right place, at the right time."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {BENEFITS.map((b, i) => {
            const Icon = BENEFIT_ICONS[b.icon];
            return (
              <Reveal key={b.title} delay={i * 0.06}>
                <div className="group h-full rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 gradient-brand">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground">{b.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{b.body}</p>
                </div>
              </Reveal>
            );
          })}
          <Reveal delay={BENEFITS.length * 0.06}>
            <div className="h-full rounded-2xl border border-dashed border-[#5053C8]/30 bg-[#5053C8]/[0.04] p-6 flex flex-col justify-center">
              <Target className="w-6 h-6 text-[#5053C8] dark:text-[#BE98FF] mb-3" />
              <p className="text-sm font-medium text-foreground">The takeaway</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Consolidate, automate, and simplify — so every stakeholder trusts the numbers and acts on them.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 2. Structure & KPIs ── */}
      <section id="structure" className="scroll-mt-20 border-y border-border bg-muted/30">
        <div className="max-w-6xl mx-auto px-5 py-20">
          <SectionHeading
            eyebrow="02 · Design"
            title="Dashboard structure & KPI selection"
            subtitle="Choosing what to measure is half the battle. Follow these five steps to keep dashboards focused and decision-driven."
          />
          <div className="space-y-4">
            {KPI_STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.05}>
                <div className="group flex items-start gap-5 rounded-2xl border border-border bg-card p-5 md:p-6 hover:shadow-card transition-shadow">
                  <span className="shrink-0 w-14 h-14 rounded-xl gradient-brand flex items-center justify-center text-white text-xl font-bold">
                    {s.n}
                  </span>
                  <div className="pt-1">
                    <h3 className="font-semibold text-lg text-foreground">{s.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                  </div>
                  <ListChecks className="hidden md:block ml-auto w-5 h-5 text-muted-foreground/40 shrink-0" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Interpretation ── */}
      <section id="interpret" className="max-w-6xl mx-auto px-5 py-20 scroll-mt-20">
        <SectionHeading
          eyebrow="03 · Analysis"
          title="Data interpretation"
          subtitle="Turning metrics into decisions. Numbers only matter when you understand what they mean and what to do next."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {INTERPRET_STEPS.map((s, i) => {
            const Icon = INTERPRET_ICONS[i] ?? Compass;
            return (
              <Reveal key={s.n} delay={i * 0.06}>
                <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-[#5053C8]/10 dark:bg-[#BE98FF]/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#5053C8] dark:text-[#BE98FF]" />
                    </div>
                    <span className="text-3xl font-bold text-[#5053C8]/15 dark:text-[#BE98FF]/20">{s.n}</span>
                  </div>
                  <h3 className="font-semibold text-lg text-foreground">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ── 4. Reporting ── */}
      <section id="reporting" className="scroll-mt-20 border-y border-border bg-muted/30">
        <div className="max-w-6xl mx-auto px-5 py-20">
          <SectionHeading
            eyebrow="04 · Communication"
            title="Reporting practices & cadence"
            subtitle="Great reporting is a conversation with stakeholders — timely, tailored, and jargon-free."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {REPORTING_PRACTICES.map((p, i) => {
              const Icon = REPORTING_ICONS[i] ?? MessageSquare;
              return (
                <Reveal key={p.title} delay={i * 0.06}>
                  <div className="h-full flex items-start gap-4 rounded-2xl border border-border bg-card p-6 hover:shadow-card transition-shadow">
                    <div className="shrink-0 w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{p.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{p.body}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 5. Tools ── */}
      <section id="tools" className="max-w-6xl mx-auto px-5 py-20 scroll-mt-20">
        <SectionHeading
          eyebrow="05 · Toolkit"
          title="Tools we use"
          subtitle="The platforms behind our monitoring and reporting — from full BI suites to AI-assisted interpretation."
        />

        {/* comparison table */}
        <Reveal>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card mb-10">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="gradient-brand text-white">
                    <th className="text-left font-semibold px-5 py-3.5">Tool</th>
                    <th className="text-left font-semibold px-5 py-3.5">Type</th>
                    <th className="text-left font-semibold px-5 py-3.5">Speed</th>
                    <th className="text-left font-semibold px-5 py-3.5">Best For</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {TOOLS_TABLE.map((t) => (
                    <tr key={t.tool} className="hover:bg-muted/50 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-foreground">{t.tool}</td>
                      <td className="px-5 py-3.5 text-muted-foreground">{t.type}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-[#5053C8]/10 text-[#5053C8] dark:text-[#BE98FF]">
                          {t.speed}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">{t.best}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>

        {/* tool detail cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TOOL_DETAILS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.06}>
              <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-card-hover transition-all">
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center text-white font-bold">
                    {t.n}
                  </span>
                  <h3 className="text-xl font-bold text-foreground">{t.name}</h3>
                </div>
                {[
                  { label: "What it does", items: t.does, icon: Layers },
                  { label: "Best for", items: t.bestFor, icon: Target },
                  { label: "Key features", items: t.features, icon: Sparkles },
                ].map((group) => (
                  <div key={group.label} className="mb-4 last:mb-0">
                    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground/70 mb-2">
                      <group.icon className="w-3.5 h-3.5" /> {group.label}
                    </p>
                    <ul className="space-y-1.5">
                      {group.items.map((it) => (
                        <li key={it} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-[#5053C8] dark:text-[#BE98FF]" />
                          {it}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-6xl mx-auto px-5 pb-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl gradient-brand px-8 py-14 text-center text-white">
            <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(circle at 20% 20%, white, transparent 40%)" }} />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold">From principles to a live dashboard</h2>
              <p className="mt-3 max-w-xl mx-auto text-white/80">
                Everything in this workshop is applied in our real MazNexa analytics platform —
                a single source of truth that refreshes automatically.
              </p>
              <Link
                href="/"
                className="mt-7 inline-flex items-center gap-2 h-12 px-7 rounded-xl bg-white text-[#5053C8] font-semibold hover:bg-white/90 transition-colors"
              >
                Open the Live Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Image src="/logo.png" alt="MazNexa" width={360} height={80} className="h-5 w-auto object-contain opacity-80" />
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} MazNexa · Dashboard Monitoring & Performance Reporting Workshop
          </p>
        </div>
      </footer>
    </div>
  );
}
