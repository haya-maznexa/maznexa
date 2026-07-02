"use client";
import { useSheetData } from "@/hooks/useSheetData";
import { ChartCard } from "@/components/charts/ChartCard";
import { CustomTooltip } from "@/components/charts/CustomTooltip";
import { fmt, fmtPct, shortMonthLabel, getColor, CHART_COLORS } from "@/lib/utils";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart, ScatterChart, Scatter, Cell,
} from "recharts";

export function PerformanceDashboard() {
  const { isLoading, byMonth, byBrand, byService, byPlatform } = useSheetData();

  const monthlyData = byMonth.map((m) => ({
    name: shortMonthLabel(m.monthKey),
    Planned: m.deliverables,
    Delivered: m.delivered,
    Extra: m.extra,
    Completion: m.completionRate,
    HPlanned: m.hPlanned,
    HDelivered: m.hDelivered,
    Brands: m.brands,
  }));

  const brandData = byBrand.map((b) => ({
    name: b.brand.length > 10 ? b.brand.slice(0, 10) + "…" : b.brand,
    Planned: b.deliverables,
    Delivered: b.delivered,
    Rate: b.completionRate,
    HPlanned: b.hPlanned,
    HDelivered: b.hDelivered,
  }));

  const serviceData = byService.map((s) => ({
    name: s.service.length > 12 ? s.service.slice(0, 12) + "…" : s.service,
    HPlanned: s.hPlanned,
    HDelivered: s.hDelivered,
    Deliverables: s.deliverables,
    Delivered: s.delivered,
    Rate: s.completionRate,
  }));

  const radarData = byBrand.slice(0, 6).map((b) => ({
    brand: b.brand,
    Completion: b.completionRate,
    "Over-Delivery": Math.min(b.overDeliveryRate, 150),
    "H-Efficiency": Math.min(b.hoursEfficiency, 150),
    Platforms: (b.platforms / 10) * 100,
    Services: (b.services / 6) * 100,
  }));

  // Brand scatter: Delivered vs Hours
  const scatterData = byBrand.map((b, i) => ({
    x: b.hDelivered,
    y: b.delivered,
    name: b.brand,
    color: CHART_COLORS[i],
  }));

  const loading = isLoading;

  return (
    <div className="p-6 space-y-6">
      {/* Row 1 — Monthly area + Completion line */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Deliverables Over Time" subtitle="Monthly Planned vs Delivered + Extras" height={260} loading={loading}>
          <ResponsiveContainer>
            <ComposedChart data={monthlyData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="gP2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="Planned" fill="url(#gP2)" stroke="#3B82F6" strokeWidth={2} />
              <Bar dataKey="Extra" fill="#8B5CF6" radius={[3, 3, 0, 0]} />
              <Line type="monotone" dataKey="Delivered" stroke="#34D399" strokeWidth={2.5} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Completion Rate Trend" subtitle="Monthly % completion" height={260} loading={loading}>
          <ResponsiveContainer>
            <LineChart data={monthlyData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 110]} tick={{ fontSize: 10 }} unit="%" />
              <Tooltip content={<CustomTooltip formatter={(v) => [`${v}%`, "Completion Rate"]} />} />
              <Line
                type="monotone"
                dataKey="Completion"
                stroke="#3B82F6"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#3B82F6" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 2 — Brand stacked bar + Hours */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Brand Deliverables" subtitle="Planned vs Delivered per brand" height={260} loading={loading}>
          <ResponsiveContainer>
            <BarChart data={brandData} margin={{ top: 4, right: 8, bottom: 20, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Planned" fill="#93C5FD" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Delivered" fill="#3B82F6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Hours: Planned vs Actual" subtitle="By brand" height={260} loading={loading}>
          <ResponsiveContainer>
            <BarChart data={brandData} margin={{ top: 4, right: 8, bottom: 20, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip formatter={(v) => [`${v}h`, ""]} />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="HPlanned" name="Planned Hours" fill="#BFDBFE" radius={[3, 3, 0, 0]} />
              <Bar dataKey="HDelivered" name="Actual Hours" fill="#3B82F6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 3 — Service hours + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Service Hours Breakdown" subtitle="Hours invested per service" height={260} loading={loading}>
          <ResponsiveContainer>
            <BarChart data={serviceData} layout="vertical" margin={{ top: 0, right: 16, left: 80, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={78} />
              <Tooltip content={<CustomTooltip formatter={(v) => [`${v}h`, ""]} />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="HPlanned" name="Planned" fill="#93C5FD" radius={[0, 3, 3, 0]} />
              <Bar dataKey="HDelivered" name="Actual" fill="#3B82F6" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Brand Radar" subtitle="Multi-dimensional brand performance" height={260} loading={loading}>
          <ResponsiveContainer>
            <RadarChart data={radarData.length > 0 ? [
              { metric: "Completion", ...Object.fromEntries(radarData.map(b => [b.brand, b.Completion])) },
              { metric: "Over-Delivery", ...Object.fromEntries(radarData.map(b => [b.brand, b["Over-Delivery"]])) },
              { metric: "H-Efficiency", ...Object.fromEntries(radarData.map(b => [b.brand, b["H-Efficiency"]])) },
            ] : []}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
              {radarData.map((b, i) => (
                <Radar key={b.brand} name={b.brand} dataKey={b.brand} stroke={CHART_COLORS[i]} fill={CHART_COLORS[i]} fillOpacity={0.15} />
              ))}
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 4 — Scatter */}
      <ChartCard title="Hours vs Deliverables" subtitle="Relationship between hours worked and items delivered by brand" height={240} loading={loading}>
        <ResponsiveContainer>
          <ScatterChart margin={{ top: 4, right: 16, bottom: 4, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="x" name="Hours Delivered" tick={{ fontSize: 10 }} label={{ value: "Hours", position: "insideBottom", offset: -2, fontSize: 11 }} />
            <YAxis dataKey="y" name="Items Delivered" tick={{ fontSize: 10 }} label={{ value: "Items", angle: -90, position: "insideLeft", fontSize: 11 }} />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload as typeof scatterData[0];
                return (
                  <div className="glass rounded-xl p-3 text-xs shadow-lg">
                    <p className="font-semibold">{d.name}</p>
                    <p className="text-muted-foreground">Hours: {d.x}h</p>
                    <p className="text-muted-foreground">Delivered: {d.y}</p>
                  </div>
                );
              }}
            />
            <Scatter data={scatterData} shape={(props: unknown) => {
              const p = props as { cx: number; cy: number; payload: typeof scatterData[0] };
              return <circle cx={p.cx} cy={p.cy} r={8} fill={p.payload.color} fillOpacity={0.8} stroke="white" strokeWidth={1.5} />;
            }} />
          </ScatterChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
