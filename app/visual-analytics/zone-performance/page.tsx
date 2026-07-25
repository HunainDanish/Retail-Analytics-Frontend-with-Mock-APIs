'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { ZonePerformance } from '@/components/heatmap/zone-performance';
import { getZonePerformance } from '@/lib/api/analytics';
import { useScope } from '@/lib/scope/ScopeContext';
import type { ZoneRow } from '@/lib/types';
import { LayoutGrid, Clock, CalendarDays } from 'lucide-react';

const DATE_RANGES = ['Today', 'Yesterday', 'Last 7 days', 'Last 30 days', 'Custom'] as const;
type DateRange = typeof DATE_RANGES[number];

const COMPARE_OPTIONS = ['Previous period', 'Previous year', 'None'] as const;
type CompareOption = typeof COMPARE_OPTIONS[number];

export default function ZonePerformancePage() {
  const { storeId, zoneId } = useScope();
  const today = new Date().toISOString().slice(0, 10);

  const [zoneRows, setZoneRows] = useState<ZoneRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>('Today');
  const [compare, setCompare] = useState<CompareOption>('Previous period');
  const [customFrom, setCustomFrom] = useState(today);
  const [customTo, setCustomTo] = useState(today);
  const [timeFrom, setTimeFrom] = useState('09:00');
  const [timeTo, setTimeTo] = useState('21:00');

  const isCustom = dateRange === 'Custom';

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const rows = await getZonePerformance({
        store_id: storeId ?? undefined,
        zone_id: zoneId ?? undefined,
      });
      if (!cancelled) {
        setZoneRows(rows);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [storeId, zoneId]);

  const totalVisits = zoneRows.reduce((s, r) => s + r.visits, 0);

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground text-balance">Zone Performance</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Visits, dwell time and occupancy across all monitored zones.
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            Updated just now
          </span>
        </div>

        <div className="flex flex-wrap gap-3 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1">
              {DATE_RANGES.map((d) => (
                <button
                  key={d}
                  onClick={() => setDateRange(d)}
                  className={`
                    rounded-md px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap
                    ${dateRange === d
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'}
                  `}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {isCustom && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <span className="text-xs text-muted-foreground">to</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <input
              type="time"
              value={timeFrom}
              onChange={(e) => setTimeFrom(e.target.value)}
              className="rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <span className="text-xs text-muted-foreground">to</span>
            <input
              type="time"
              value={timeTo}
              onChange={(e) => setTimeTo(e.target.value)}
              className="rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground">Compare:</span>
            <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1">
              {COMPARE_OPTIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => setCompare(c)}
                  className={`
                    rounded-md px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap
                    ${compare === c
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'}
                  `}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border bg-card px-5 py-4">
                  <div className="mb-2 h-3 w-20 animate-pulse rounded bg-muted" />
                  <div className="mb-1 h-8 w-16 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                </div>
              ))
            : [
                { label: 'Total Visits', value: totalVisits.toLocaleString(), sub: 'across all zones' },
                { label: 'Avg Dwell Time', value: '2m 38s', sub: 'across all zones' },
                { label: 'Peak Zone', value: 'Entrance', sub: '1,284 visits today' },
                { label: 'Avg Occupancy', value: '58%', sub: 'store-wide' },
              ].map((kpi) => (
                <div key={kpi.label} className="rounded-xl border border-border bg-card px-5 py-4">
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{kpi.value}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{kpi.sub}</p>
                </div>
              ))}
        </div>

        {loading ? (
          <div className="rounded-lg border border-border bg-card p-8">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block relative w-10 h-10 mb-3">
                  <div className="absolute inset-0 border-4 border-transparent border-t-primary border-r-primary rounded-full animate-spin" />
                </div>
                <p className="text-sm text-muted-foreground">Loading zone performance…</p>
              </div>
            </div>
          </div>
        ) : (
          <ZonePerformance rows={zoneRows} />
        )}
      </div>
    </DashboardShell>
  );
}
