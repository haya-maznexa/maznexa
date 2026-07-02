"use client";
import { cn } from "@/lib/utils";

interface TooltipPayload {
  name: string;
  value: number | string;
  color?: string;
  unit?: string;
}

interface Props {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
  formatter?: (value: number, name: string) => [string, string];
  className?: string;
}

export function CustomTooltip({ active, payload, label, formatter, className }: Props) {
  if (!active || !payload?.length) return null;
  return (
    <div className={cn(
      "glass rounded-xl px-3 py-2.5 shadow-lg text-xs min-w-[130px]",
      className
    )}>
      {label && <p className="font-semibold text-foreground mb-1.5">{label}</p>}
      {payload.map((p, i) => {
        const [fmtVal, fmtName] = formatter ? formatter(Number(p.value), p.name) : [String(p.value), p.name];
        return (
          <div key={i} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
              {fmtName}
            </span>
            <span className="font-semibold text-foreground">{fmtVal}</span>
          </div>
        );
      })}
    </div>
  );
}
