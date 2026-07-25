'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getVisitorsByHour } from '@/lib/api/analytics';
import { useScope } from '@/lib/scope/ScopeContext';
import type { VisitorsByHourRow } from '@/lib/api/analytics';

export function VisitorsByHourChart() {
  const { storeId } = useScope();
  const [data, setData] = useState<VisitorsByHourRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const rows = await getVisitorsByHour({
        store_id: storeId ?? undefined,
      });
      if (!cancelled) {
        setData(rows);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [storeId]);

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="mb-4 text-sm font-semibold text-foreground">
        Visitors by Hour
      </h3>
      {loading ? (
        <div className="flex h-[300px] items-center justify-center">
          <div className="h-full w-full animate-pulse rounded bg-muted" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
              interval={2}
            />
            <YAxis
              tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-card)',
                border: `1px solid var(--color-border)`,
                borderRadius: '6px',
              }}
              labelStyle={{ color: 'var(--color-foreground)' }}
            />
            <Bar dataKey="visitors" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
