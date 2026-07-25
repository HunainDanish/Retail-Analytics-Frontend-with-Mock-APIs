'use client';

import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { AnalyticsPageLayout } from '@/components/analytics/analytics-page-layout';
import { useOccupancyAnalyticsConfig } from '@/lib/scope/use-scoped-analytics-config';

export default function OccupancyPage() {
  const config = useOccupancyAnalyticsConfig();

  return (
    <DashboardShell>
      <AnalyticsPageLayout config={config} />
    </DashboardShell>
  );
}
