"use client";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown } from "lucide-react";
import { useSheetData } from "@/hooks/useSheetData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartCard } from "@/components/charts/ChartCard";
import { CustomTooltip } from "@/components/charts/CustomTooltip";
import { fmt, fmtPct, shortMonthLabel, CHART_COLORS } from "@/lib/utils";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ReferenceLine, Cell,
} from "recharts";

export function Trends() {
  const { isLoading, trends, byBrand, byMonth } = useSheetData();

  const trendData = trends.map((t) => ({
    name: t.month,
    Delivered: t.delivered,
    "Moving Avg": +t.movingAvgDelivered.toFixed(1),
    "Completion %": t.completionRate,
    "MoM %": t.momDelivered,
    "H Efficiency": t.hEfficiency,
  }));

  // MoM bars
  const momData = trends
    .filter((t) => t.momDelivered !== null)
    .map((t) => ({
      name: t.month,
      "MoM Change": t.momDelivered!,
    }));

  // Growth leaders / decliners
  const sortedMoM = [...trends]
    .filter((t) => t.momDelivered !== null)
    .sort((a, b) => (b.momDelivered ?? 0) - (a.momDelivered ?? 0));
  const topGrowth = sortedMoM.slice(0, 3);
  const topDecline = sortedMoM.slice(-3).reverse();

  // Brand MoM (using first and last month per brand is complex — we use total row count as proxy)
  const brandGrowth = byBrand.map((b) => ({
    name: b.brand,
    value: b.completionRate,
  })).sort((a, b) => b.value - a.value);

  return (
    <div className="p-6 space-y-6">
      {/* Top / decline cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Highest month */}
        {byMonth.length > 0 && (() => {
          const best = [...byMonth].sort((a, b) => b.delivered - a.delivered)[0];
          return (
            <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowUp className="w-4 h-4 text-emerald-500" />
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Best Month</p>
                </div>
                <p className="text-xl font-bold">{best.month} {best.year}</p>
                <p className="text-sm text-muted-foreground">{fmt(best.delivered)} items delivered</p>
                <Badge variant="success" className="mt-2 text-[10px]">{fmtPct(best.completionRate)} completion</Badge>
              </CardContent>
            </Card>
          );
        })()}

        {/* Latest MoM */}
        {trends.length > 1 && (() => {
          const last = trends[trends.length - 1];
          const mom = last.momDelivered ?? 0;
          const up = mom >= 0;
          return (
            <Card className={up ? "border-emerald-200 dark:border-emerald-800" : "border-red-200 dark:border-red-800"}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  {up ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
                  <p className="text-xs font-semibold text-muted-foreground">Latest MoM Change</p>
                </div>
                <p className="text-xl font-bold">{last.month}</p>
                <p className="text-sm text-muted-foreground">
                  {up ? "+" : ""}{mom.toFixed(1)}% vs previous month
                </p>
                <Badge variant={up ? "success" : "danger"} className="mt-2 text-[10px]">
                  {up ? "Growing" : "Declining"}
                </Badge>
              </CardContent>
            </Card>
          );
        })()}

        {/* Lowest month */}
        {byMonth.length > 0 && (() => {
          const worst = [...byMonth].sort((a, b) => a.delivered - b.delivered)[0];
          return (
            <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowDown className="w-4 h-4 text-red-500" />
                  <p className="text-xs font-semibold text-red-600 dark:text-red-400">Lowest Month</p>
                </div>
                <p className="text-xl font-bold">{worst.month} {worst.year}</p>
                <p className="text-sm text-muted-foreground">{fmt(worst.delivered)} items delivered</p>
                <Badge variant="danger" className="mt-2 text-[10px]">{fmtPct(worst.completionRate)} completion</Badge>
              </CardContent>
            </Card>
          );
        })()}
      </div>

      {/* Trend area + Moving avg */}
      <ChartCard
        title="Delivery Trend & Moving Average"
        subtitle="3-month moving average overlaid on monthly deliverables"
        height={280}
        loading={isLoading}
      >
        <ResponsiveContainer>
          <AreaChart data={trendData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="gTrend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="Delivered" stroke="#3B82F6" fill="url(#gTrend)" strokeWidth={2} />
            <Line type="monotone" dataKey="Moving Avg" stroke="#8B5CF6" strokeWidth={2.5} dot={false} strokeDasharray="6 2" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MoM change bars */}
        <ChartCard title="Month-over-Month Change" subtitle="% change in deliverables vs prior month" height={240} loading={isLoading}>
          <ResponsiveContainer>
            <BarChart data={momData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} unit="%" />
              <Tooltip content={<CustomTooltip formatter={(v) => [`${v}%`, "MoM"]} />} />
              <ReferenceLine y={0} stroke="hsl(var(--foreground))" strokeWidth={1} opacity={0.3} />
              <Bar dataKey="MoM Change" radius={[3, 3, 0, 0]}>
                {momData.map((d, i) => (
                  <Cell key={i} fill={d["MoM Change"] >= 0 ? "#34D399" : "#F87171"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Completion rate trend */}
        <ChartCard title="Completion Rate Trend" subtitle="Monthly % with H-Efficiency overlay" height={240} loading={isLoading}>
          <ResponsiveContainer>
            <LineChart data={trendData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 115]} tick={{ fontSize: 10 }} unit="%" />
              <Tooltip content={<CustomTooltip formatter={(v) => [`${v}%`, ""]} />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine y={100} stroke="#34D399" strokeDasharray="4 2" strokeWidth={1.5} />
              <Line type="monotone" dataKey="Completion %" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="H Efficiency" stroke="#F59E0B" strokeWidth={2} dot={false} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Growth & decline tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Top Growth Periods</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {topGrowth.map((t, i) => (
              <motion.div
                key={t.monthKey}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-100 dark:border-emerald-900/30"
              >
                <span className="text-sm font-medium">{t.month}</span>
                <Badge variant="success">+{(t.momDelivered ?? 0).toFixed(1)}%</Badge>
              </motion.div>
            ))}
            {topGrowth.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Not enough data</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-1.5"><TrendingDown className="w-3.5 h-3.5 text-red-500" /> Largest Declines</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {topDecline.map((t, i) => (
              <motion.div
                key={t.monthKey}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center justify-between p-2.5 rounded-lg bg-red-50 dark:bg-red-900/15 border border-red-100 dark:border-red-900/30"
              >
                <span className="text-sm font-medium">{t.month}</span>
                <Badge variant="danger">{(t.momDelivered ?? 0).toFixed(1)}%</Badge>
              </motion.div>
            ))}
            {topDecline.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Not enough data</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
