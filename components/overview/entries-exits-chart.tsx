'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getEntriesExits } from '@/lib/api/analytics';
import { useScope } from '@/lib/scope/ScopeContext';
import type { EntriesExitsRow } from '@/lib/api/analytics';

export function EntriesExitsChart() {
  const { storeId } = useScope();
  const [data, setData] = useState<EntriesExitsRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const rows = await getEntriesExits({
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
        Entries vs Exits
      </h3>
      {loading ? (
        <div className="flex h-[300px] items-center justify-center">
          <div className="h-full w-full animate-pulse rounded bg-muted" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
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
            <Legend
              wrapperStyle={{
                color: 'var(--color-foreground)',
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="entries"
              stroke="var(--color-primary)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="exits"
              stroke="var(--color-muted-foreground)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
