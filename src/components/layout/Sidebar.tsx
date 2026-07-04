"use client";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, TrendingUp, Building2, Globe, Wrench,
  Clock, LineChart, Table2, ChevronLeft, ChevronRight, GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardView } from "@/types";

const NAV: { id: DashboardView; label: string; icon: React.ElementType; desc: string }[] = [
  { id: "overview",     label: "Executive Overview", icon: LayoutDashboard, desc: "KPIs & highlights" },
  { id: "performance",  label: "Performance",        icon: TrendingUp,      desc: "Charts & analytics" },
  { id: "brands",       label: "Brand Analytics",    icon: Building2,       desc: "Per-brand breakdown" },
  { id: "platforms",    label: "Platform Analytics", icon: Globe,           desc: "Platform comparison" },
  { id: "services",     label: "Service Analytics",  icon: Wrench,          desc: "Service breakdown" },
  { id: "financial",    label: "Workload",           icon: Clock,           desc: "Hours & efficiency" },
  { id: "trends",       label: "Trends",             icon: LineChart,       desc: "MoM & growth" },
  { id: "data",         label: "Data Table",         icon: Table2,          desc: "Raw data & export" },
];

interface Props {
  view: DashboardView;
  onViewChange: (v: DashboardView) => void;
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ view, onViewChange, collapsed, onToggle }: Props) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 220 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="relative flex flex-col h-screen bg-card border-r border-border shrink-0 z-20 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-border min-h-[64px]">
        {collapsed ? (
          <Image
            src="/logo-icon.png"
            alt="MazNexa"
            width={32}
            height={32}
            className="w-8 h-8 object-contain shrink-0"
            priority
          />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key="full-logo"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col"
            >
              <Image
                src="/logo.png"
                alt="MazNexa"
                width={580}
                height={120}
                className="h-7 w-auto object-contain"
                priority
              />
              <p className="text-[10px] text-muted-foreground font-medium mt-1 pl-0.5">
                Analytics Platform
              </p>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto scrollbar-thin">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              title={collapsed ? item.label : undefined}
              className={cn(
                "w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-left text-sm transition-all duration-150 group",
                active
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "w-[18px] h-[18px] shrink-0 transition-colors",
                  active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className="truncate leading-tight"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {active && !collapsed && (
                <motion.div
                  layoutId="active-pill"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                />
              )}
            </button>
          );
        })}

        {/* Workshop link */}
        <div className="pt-2 mt-2 border-t border-border">
          <Link
            href="/workshop"
            title={collapsed ? "Workshop" : undefined}
            className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150 group"
          >
            <GraduationCap className="w-[18px] h-[18px] shrink-0 text-muted-foreground group-hover:text-foreground" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  className="truncate leading-tight"
                >
                  Workshop
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-[72px] w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center shadow-sm hover:bg-muted transition-colors z-30"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3 text-muted-foreground" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-muted-foreground" />
        )}
      </button>
    </motion.aside>
  );
}
