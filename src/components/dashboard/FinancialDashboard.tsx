"use client";
import { motion } from "framer-motion";
import { Clock, TrendingUp, TrendingDown, Zap, AlertTriangle, CheckCircle } from "lucide-react";
import { useSheetData } from "@/hooks/useSheetData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartCard } from "@/components/charts/ChartCard";
import { CustomTooltip } from "@/components/charts/CustomTooltip";
import { fmt, fmtHours, fmtPct, shortMonthLabel, CHART_COLORS, getColor } from "@/lib/utils";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ComposedChart, ReferenceLine, Cell, PieChart, Pie, LabelList,
} from "recharts";

function StatCard({
  label, value, sub, icon: Icon, color, trend, delay = 0,
}: {
  label: string; value: string; sub?: string;
  icon: React.ElementType; color: string;
  trend?: "good" | "warn" | "bad"; delay?: number;
}) {
  const trendColor = trend === "good" ? "#34D399" : trend === "warn" ? "#F59E0B" : trend === "bad" ? "#F87171" : color;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
    >
      <Card className="hover:shadow-card-hover transition-shadow duration-300 overflow-hidden relative">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ background: `radial-gradient(ellipse at top right, ${color}, transparent 70%)` }}
        />
        <CardContent className="pt-5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}18` }}>
            <Icon className="w-[18px] h-[18px]" style={{ color }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: trendColor }}>{value}</p>
          <p className="text-xs font-medium text-muted-foreground mt-0.5">{label}</p>
          {sub && <p className="text-[11px] text-muted-foreground/70 mt-0.5">{sub}</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function FinancialDashboard() {
  const { isLoading, byMonth, byBrand, byService, byPlatform, kpis } = useSheetData();

  const totalVariance = kpis.totalHDelivered - kpis.totalHPlanned;
  const efficiency = kpis.hoursEfficiency;

  const monthlyData = byMonth.map((m) => ({
    name: shortMonthLabel(m.monthKey),
    "Planned h": m.hPlanned,
    "Actual h": m.hDelivered,
    "Extra h": m.hDelivered - m.hPlanned > 0 ? +(m.hDelivered - m.hPlanned).toFixed(1) : 0,
    "Variance": +(m.hDelivered - m.hPlanned).toFixed(1),
    "Efficiency %": m.hPlanned > 0 ? +((m.hPlanned / m.hDelivered) * 100).toFixed(1) : 100,
  }));

  const brandData = byBrand.map((b, i) => ({
    name: b.brand.length > 9 ? b.brand.slice(0, 9) : b.brand,
    "Planned h": b.hPlanned,
    "Actual h": b.hDelivered,
    "Efficiency %": b.hoursEfficiency,
    "Overtime": b.hDelivered - b.hPlanned > 0 ? +(b.hDelivered - b.hPlanned).toFixed(1) : 0,
    color: CHART_COLORS[i],
  }));

  const serviceData = byService.map((s, i) => ({
    name: s.service.length > 14 ? s.service.slice(0, 14) + "…" : s.service,
    "Planned h": s.hPlanned,
    "Actual h": s.hDelivered,
    "Efficiency %": s.hPlanned > 0 ? +((s.hPlanned / s.hDelivered) * 100).toFixed(1) : 100,
    color: CHART_COLORS[i],
  }));

  const brandPie = byBrand.map((b, i) => ({
    name: b.brand, value: b.hDelivered, color: CHART_COLORS[i],
  }));

  // ── Hours split by service (hours only, delivered) ──
  // Only services that actually logged hours (Design, SEO, CRM, Video/Photo …)
  const serviceHours = [...byService]
    .filter((s) => s.hDelivered > 0)
    .sort((a, b) => b.hDelivered - a.hDelivered)
    .map((s, i) => ({
      name: s.service,
      short: s.service.length > 16 ? s.service.slice(0, 16) + "…" : s.service,
      hours: Math.round(s.hDelivered),
      color: CHART_COLORS[i],
    }));
  const totalServiceHours = serviceHours.reduce((sum, s) => sum + s.hours, 0);

  // Overtime leaders
  const overtimeBrands = [...byBrand]
    .map((b) => ({ name: b.brand, overtime: b.hDelivered - b.hPlanned, eff: b.hoursEfficiency }))
    .sort((a, b) => b.overtime - a.overtime);

  return (
    <div className="p-6 space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Hours Planned"
          value={fmtHours(kpis.totalHPlanned)}
          sub="Contracted scope"
          icon={Clock}
          color="#5053C8"
          delay={0}
        />
        <StatCard
          label="Total Hours Delivered"
          value={fmtHours(kpis.totalHDelivered)}
          sub="Actual work done"
          icon={Clock}
          color="#5053C8"
          delay={0.05}
        />
        <StatCard
          label="Hours Variance"
          value={`${totalVariance >= 0 ? "+" : ""}${fmtHours(totalVariance)}`}
          sub={totalVariance > 0 ? "Over budget" : totalVariance < 0 ? "Under budget" : "On budget"}
          icon={totalVariance > 0 ? TrendingUp : TrendingDown}
          color={totalVariance > 0 ? "#F59E0B" : "#34D399"}
          trend={totalVariance > 0 ? "warn" : "good"}
          delay={0.1}
        />
        <StatCard
          label="Hours Efficiency"
          value={fmtPct(efficiency)}
          sub={efficiency >= 95 ? "On budget" : efficiency >= 80 ? "Slightly over" : "Over budget"}
          icon={efficiency >= 90 ? Zap : AlertTriangle}
          color={efficiency >= 90 ? "#34D399" : efficiency >= 75 ? "#F59E0B" : "#F87171"}
          trend={efficiency >= 90 ? "good" : efficiency >= 75 ? "warn" : "bad"}
          delay={0.15}
        />
        <StatCard
          label="Extra Hours"
          value={fmtHours(kpis.totalHExtra)}
          sub="Unplanned work logged"
          icon={Clock}
          color="#BE98FF"
          delay={0.2}
        />
        <StatCard
          label="Avg Hours / Brand"
          value={fmtHours(kpis.activeBrands > 0 ? kpis.totalHDelivered / kpis.activeBrands : 0)}
          sub="Per active brand"
          icon={Clock}
          color="#BE98FF"
          delay={0.25}
        />
        <StatCard
          label="Avg Hours / Month"
          value={fmtHours(kpis.activeMonths > 0 ? kpis.totalHDelivered / kpis.activeMonths : 0)}
          sub="Per tracked month"
          icon={Clock}
          color="#7B6FE0"
          delay={0.3}
        />
        <StatCard
          label="Avg Hours / Service"
          value={fmtHours(kpis.activeServices > 0 ? kpis.totalHDelivered / kpis.activeServices : 0)}
          sub="Per service category"
          icon={Clock}
          color="#8B5CF6"
          delay={0.35}
        />
      </div>

      {/* ── Hours by Service (split, hours only) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut: share of hours per service */}
        <ChartCard
          title="Hours by Service"
          subtitle="Share of delivered hours"
          height={300}
          loading={isLoading}
        >
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={serviceHours}
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={100}
                paddingAngle={3}
                dataKey="hours"
                nameKey="name"
              >
                {serviceHours.map((s, i) => (
                  <Cell key={i} fill={s.color} />
                ))}
              </Pie>
              <Tooltip
                content={
                  <CustomTooltip
                    formatter={(v, n) => [
                      `${fmtHours(Number(v))} · ${totalServiceHours ? ((Number(v) / totalServiceHours) * 100).toFixed(1) : 0}%`,
                      n,
                    ]}
                  />
                }
              />
              <Legend formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Horizontal bars: hours per service with value labels */}
        <ChartCard
          title="Delivered Hours per Service"
          subtitle="Design · SEO · CRM · Video/Photo and more"
          height={300}
          loading={isLoading}
          className="lg:col-span-2"
        >
          <ResponsiveContainer>
            <BarChart
              data={serviceHours}
              layout="vertical"
              margin={{ top: 4, right: 56, left: 110, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="short" tick={{ fontSize: 11 }} width={104} />
              <Tooltip
                content={<CustomTooltip formatter={(v, n) => [fmtHours(Number(v)), n]} />}
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
              />
              <Bar dataKey="hours" radius={[0, 6, 6, 0]}>
                {serviceHours.map((s, i) => (
                  <Cell key={i} fill={s.color} />
                ))}
                <LabelList
                  dataKey="hours"
                  position="right"
                  formatter={(v: React.ReactNode) => fmtHours(Number(v))}
                  style={{ fontSize: 11, fill: "hsl(var(--foreground))", fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Monthly area — planned vs actual */}
      <ChartCard
        title="Monthly Hours: Planned vs Actual"
        subtitle="Track budget adherence month by month"
        height={270}
        loading={isLoading}
      >
        <ResponsiveContainer>
          <ComposedChart data={monthlyData} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
            <defs>
              <linearGradient id="gHP" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#5053C8" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#5053C8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gHA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#5053C8" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#5053C8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="h" tick={{ fontSize: 10 }} />
            <YAxis yAxisId="eff" orientation="right" tick={{ fontSize: 10 }} unit="%" domain={[0, 130]} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area yAxisId="h" type="monotone" dataKey="Planned h" stroke="#5053C8" fill="url(#gHP)" strokeWidth={2} />
            <Area yAxisId="h" type="monotone" dataKey="Actual h" stroke="#5053C8" fill="url(#gHA)" strokeWidth={2} />
            <Line yAxisId="eff" type="monotone" dataKey="Efficiency %" stroke="#34D399" strokeWidth={2} strokeDasharray="5 2" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Variance bars + Brand hours */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Monthly Hours Variance"
          subtitle="Actual minus planned — red = over budget, green = under"
          height={250}
          loading={isLoading}
        >
          <ResponsiveContainer>
            <BarChart data={monthlyData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip formatter={(v) => [`${v}h`, "Variance"]} />} />
              <ReferenceLine y={0} stroke="hsl(var(--foreground))" strokeWidth={1.5} opacity={0.25} />
              <Bar dataKey="Variance" radius={[3, 3, 0, 0]}>
                {monthlyData.map((d, i) => (
                  <Cell key={i} fill={d.Variance > 0 ? "#F87171" : "#34D399"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Hours by Brand"
          subtitle="Planned vs actual per brand"
          height={250}
          loading={isLoading}
        >
          <ResponsiveContainer>
            <BarChart data={brandData} margin={{ top: 4, right: 8, bottom: 24, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip formatter={(v) => [`${v}h`, ""]} />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Planned h" fill="#B5B9FE" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Actual h" radius={[3, 3, 0, 0]}>
                {brandData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Service hours + Hours distribution pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Hours by Service"
          subtitle="Planned vs actual hours per service type"
          height={260}
          loading={isLoading}
        >
          <ResponsiveContainer>
            <BarChart data={serviceData} layout="vertical" margin={{ top: 0, right: 16, left: 100, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={98} />
              <Tooltip content={<CustomTooltip formatter={(v) => [`${v}h`, ""]} />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Planned h" fill="#B5B9FE" radius={[0, 3, 3, 0]} />
              <Bar dataKey="Actual h" radius={[0, 3, 3, 0]}>
                {serviceData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Hours Distribution by Brand"
          subtitle="Share of total hours worked"
          height={260}
          loading={isLoading}
        >
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={brandPie}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {brandPie.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip formatter={(v, n) => [`${v}h`, n]} />} />
              <Legend formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Efficiency line + Overtime ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Hours Efficiency Trend"
          subtitle="% of planned hours used — 100% = exactly on budget"
          height={240}
          loading={isLoading}
        >
          <ResponsiveContainer>
            <LineChart data={monthlyData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[60, 130]} tick={{ fontSize: 10 }} unit="%" />
              <Tooltip content={<CustomTooltip formatter={(v) => [`${v}%`, "Efficiency"]} />} />
              <ReferenceLine y={100} stroke="#34D399" strokeDasharray="4 2" strokeWidth={1.5} label={{ value: "Budget", fontSize: 10, fill: "#34D399", position: "right" }} />
              <Line
                type="monotone"
                dataKey="Efficiency %"
                stroke="#5053C8"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#5053C8" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Overtime ranking table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" /> Overtime by Brand
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {overtimeBrands.map((b, i) => (
              <motion.div
                key={b.name}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: getColor(i) }}
                  />
                  <span className="text-sm font-medium truncate">{b.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant={b.overtime > 10 ? "warning" : b.overtime > 0 ? "secondary" : "success"}
                    className="text-[10px]"
                  >
                    {b.overtime > 0 ? "+" : ""}{fmtHours(b.overtime)}
                  </Badge>
                  <span className="text-xs text-muted-foreground w-12 text-right">
                    {fmtPct(b.eff)}
                  </span>
                </div>
              </motion.div>
            ))}
            {overtimeBrands.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No data</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
