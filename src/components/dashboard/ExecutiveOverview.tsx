"use client";
import { motion } from "framer-motion";
import {
  Package, CheckCircle2, Clock, Percent, Users, Globe, Wrench,
  CalendarDays, TrendingUp, TrendingDown, Minus, Lightbulb,
  AlertTriangle, Info, Star,
} from "lucide-react";
import { useSheetData } from "@/hooks/useSheetData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartCard } from "@/components/charts/ChartCard";
import { CustomTooltip } from "@/components/charts/CustomTooltip";
import { fmt, fmtPct, fmtHours, shortMonthLabel, getColor, CHART_COLORS } from "@/lib/utils";
import type { Insight } from "@/types";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

// ─── KPI Card ──────────────────────────────────────────────────────────────────

function KPICard({
  icon: Icon, label, value, sub, trend, color, delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  trend?: "up" | "down" | "neutral";
  color?: string;
  delay?: number;
}) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-emerald-500" : trend === "down" ? "text-red-500" : "text-muted-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
    >
      <Card className="group hover:shadow-card-hover transition-shadow duration-300 overflow-hidden relative">
        <div
          className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity"
          style={{ background: `radial-gradient(ellipse at top right, ${color ?? "#3B82F6"}, transparent 70%)` }}
        />
        <CardContent className="pt-5">
          <div className="flex items-start justify-between">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${color ?? "#3B82F6"}18` }}
            >
              <Icon className="w-5 h-5" style={{ color: color ?? "#3B82F6" }} />
            </div>
            {trend && (
              <TrendIcon className={`w-4 h-4 ${trendColor}`} />
            )}
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs font-medium text-muted-foreground mt-0.5">{label}</p>
            {sub && <p className="text-[11px] text-muted-foreground/70 mt-0.5">{sub}</p>}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Insight Card ─────────────────────────────────────────────────────────────

const insightConfig = {
  success: { icon: Star, bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-400", badge: "success" as const },
  warning: { icon: AlertTriangle, bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-800", text: "text-amber-700 dark:text-amber-400", badge: "warning" as const },
  info:    { icon: Info,          bg: "bg-blue-50  dark:bg-blue-900/20",  border: "border-blue-200  dark:border-blue-800",  text: "text-blue-700  dark:text-blue-400",  badge: "default" as const },
  danger:  { icon: AlertTriangle, bg: "bg-red-50   dark:bg-red-900/20",   border: "border-red-200   dark:border-red-800",   text: "text-red-700   dark:text-red-400",   badge: "danger" as const },
};

function InsightCard({ insight, delay }: { insight: Insight; delay: number }) {
  const cfg = insightConfig[insight.type];
  const Icon = cfg.icon;
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={`flex items-start gap-3 p-3.5 rounded-xl border ${cfg.bg} ${cfg.border}`}
    >
      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${cfg.text}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold ${cfg.text}`}>{insight.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{insight.description}</p>
      </div>
      {insight.metric && (
        <Badge variant={cfg.badge} className="text-[10px] shrink-0">{insight.metric}</Badge>
      )}
    </motion.div>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────

export function ExecutiveOverview() {
  const { isLoading, kpis, byBrand, byMonth, byPlatform, insights, filtered } = useSheetData();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  const kpiCards = [
    { icon: Package,     label: "Total Deliverables", value: fmt(kpis.totalDeliverables), color: "#3B82F6", trend: "up" as const },
    { icon: CheckCircle2,label: "Total Delivered",    value: fmt(kpis.totalDelivered),    color: "#34D399", trend: "up" as const },
    { icon: TrendingUp,  label: "Extras Delivered",   value: fmt(kpis.totalExtra),        color: "#8B5CF6" },
    { icon: Percent,     label: "Completion Rate",    value: fmtPct(kpis.completionRate), color: "#3B82F6",
      sub: kpis.completionRate >= 95 ? "Excellent" : kpis.completionRate >= 80 ? "On Track" : "Needs Attention",
      trend: kpis.completionRate >= 90 ? "up" as const : "down" as const },
    { icon: Clock,       label: "Hours Delivered",    value: fmtHours(kpis.totalHDelivered), color: "#3B82F6" },
    { icon: Percent,     label: "Hours Efficiency",   value: fmtPct(kpis.hoursEfficiency), color: "#F59E0B",
      sub: kpis.hoursEfficiency >= 90 ? "On Budget" : "Over Budget" },
    { icon: Users,       label: "Active Brands",      value: fmt(kpis.activeBrands),      color: "#A78BFA" },
    { icon: Globe,       label: "Platforms",          value: fmt(kpis.activePlatforms),   color: "#34D399" },
    { icon: Wrench,      label: "Services",           value: fmt(kpis.activeServices),    color: "#FB923C" },
    { icon: CalendarDays,label: "Months Tracked",     value: fmt(kpis.activeMonths),      color: "#38BDF8" },
    { icon: Package,     label: "Total Records",      value: fmt(kpis.totalRows),         color: "#6366F1" },
    { icon: TrendingUp,  label: "Over-Delivery Rate", value: fmtPct(kpis.overDeliveryRate), color: "#8B5CF6" },
  ];

  const areaData = byMonth.map((m) => ({
    name: shortMonthLabel(m.monthKey),
    Planned: m.deliverables,
    Delivered: m.delivered,
    Extra: m.extra,
  }));

  const brandDonutData = byBrand.slice(0, 8).map((b, i) => ({
    name: b.brand,
    value: b.delivered,
    color: CHART_COLORS[i],
  }));

  const platformData = byPlatform.slice(0, 8).map((p) => ({
    name: p.platform,
    Delivered: p.delivered,
    Rate: p.completionRate,
  }));

  return (
    <div className="p-6 space-y-8">
      {/* KPI Grid */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Key Metrics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {kpiCards.map((k, i) => (
            <KPICard key={k.label} {...k} delay={i * 0.04} />
          ))}
        </div>
      </section>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area chart — monthly trend */}
        <ChartCard title="Monthly Deliverables" subtitle="Planned vs. Delivered" height={240} className="lg:col-span-2">
          <ResponsiveContainer>
            <AreaChart data={areaData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="gPlanned" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gDelivered" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34D399" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#34D399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="Planned" stroke="#3B82F6" fill="url(#gPlanned)" strokeWidth={2} />
              <Area type="monotone" dataKey="Delivered" stroke="#34D399" fill="url(#gDelivered)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Donut — brand share */}
        <ChartCard title="Deliverables by Brand" subtitle="Share of total" height={240}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={brandDonutData}
                cx="50%"
                cy="45%"
                innerRadius={58}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {brandDonutData.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
              <Tooltip
                content={<CustomTooltip formatter={(v, n) => [fmt(Number(v)), n]} />}
              />
              <Legend
                formatter={(value) => <span style={{ fontSize: 11 }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Platform bar + Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Platform Performance" subtitle="Delivered items per platform" height={220} className="lg:col-span-2">
          <ResponsiveContainer>
            <BarChart data={platformData} layout="vertical" margin={{ top: 0, right: 16, left: 60, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={58} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Delivered" fill="#3B82F6" radius={[0, 4, 4, 0]}>
                {platformData.map((_, i) => (
                  <Cell key={i} fill={getColor(i)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Insights panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              Auto Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 max-h-64 overflow-y-auto scrollbar-thin">
            {insights.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No data to analyze</p>
            )}
            {insights.map((ins, i) => (
              <InsightCard key={i} insight={ins} delay={i * 0.05} />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
