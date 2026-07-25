'use client';

import { useEffect, useState } from 'react';
import type {
  AnalyticsPageConfig,
  ComparisonKey,
  DataRow,
  DateRangeKey,
  StatSummary,
} from '@/lib/types';
import { DateRangePicker }   from './date-range-picker';
import { ComparisonToggle }  from './comparison-toggle';
import { AnalyticsChart } from './analytics-chart';
import { StatCard }          from './stat-card';
import { DataTable }         from './data-table';
import { useScope } from '@/lib/scope/ScopeContext';


// ─── Component ────────────────────────────────────────────────────────────────

export function AnalyticsPageLayout({ config }: { config: AnalyticsPageConfig }) {
  const [range,      setRange]      = useState<DateRangeKey>('day');
  const [comparison, setComparison] = useState<ComparisonKey>('none');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo,   setCustomTo]   = useState('');
  const [data,       setData]       = useState<DataRow[]>([]);
  const [stats,      setStats]      = useState<StatSummary[]>([]);
  const [loading,    setLoading]    = useState(true);
  const { storeId, cameraId, zoneId } = useScope();
  const scopeKey = `${storeId ?? ''}:${cameraId ?? ''}:${zoneId ?? ''}`;

  const intervalLabel = config.getIntervalLabel(range);
  const currentLabel = config.currentSeriesLabel ?? 'Current period';
  const priorLabel   = config.priorSeriesLabel   ?? 'Prior period';

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const [rows, summaries] = await Promise.all([
        config.getData(range),
        config.getStats(range),
      ]);
      if (!cancelled) {
        setData(rows);
        setStats(summaries);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [config, range, scopeKey]);

  return (
    <div className="flex flex-col gap-6">

      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">{config.title}</h1>
        {config.description && (
          <p className="mt-0.5 text-sm text-muted-foreground">{config.description}</p>
        )}
      </div>

      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card px-4 py-3">
        <DateRangePicker
          value={range}
          onChange={setRange}
          customFrom={customFrom}
          customTo={customTo}
          onCustomFromChange={setCustomFrom}
          onCustomToChange={setCustomTo}
        />
        <div className="h-4 w-px bg-border hidden sm:block" />
        <ComparisonToggle value={comparison} onChange={setComparison} />
      </div>

      {/* Main chart */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            {config.title}
          </h2>
          {comparison !== 'none' && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2 w-6 rounded-full"
                  style={{ background: 'var(--color-primary)' }}
                />
                {currentLabel}
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="inline-block h-0.5 w-6 border-t-2 border-dashed"
                  style={{ borderColor: 'var(--color-muted-foreground)' }}
                />
                {priorLabel}
              </span>
            </div>
          )}
        </div>
        {loading ? (
          <div className="flex h-[300px] items-center justify-center">
            <div className="text-center">
              <div className="inline-block relative w-10 h-10 mb-3">
                <div className="absolute inset-0 border-4 border-transparent border-t-primary border-r-primary rounded-full animate-spin" />
              </div>
              <p className="text-sm text-muted-foreground">Loading chart data…</p>
            </div>
          </div>
        ) : (
          <AnalyticsChart
            data={data}
            chartType={config.chartType}
            metricLabel={config.metricLabel}
            comparison={comparison}
            currentLabel={currentLabel}
            priorLabel={priorLabel}
            unit={config.unit}
          />
        )}
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-4">
                <div className="mb-2 h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="h-8 w-20 animate-pulse rounded bg-muted" />
              </div>
            ))
          : stats.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
      </div>

      {/* Data table */}
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-foreground">Data Table</h2>
        {loading ? (
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-8 animate-pulse rounded bg-muted" />
              ))}
            </div>
          </div>
        ) : (
          <DataTable
            data={data}
            intervalLabel={intervalLabel}
            metricLabel={config.metricLabel}
            comparison={comparison}
            priorLabel={priorLabel}
          />
        )}
      </div>

    </div>
  );
}
