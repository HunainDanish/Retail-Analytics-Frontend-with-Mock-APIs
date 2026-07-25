'use client';

import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { AnalyticsPageLayout } from '@/components/analytics/analytics-page-layout';
import { useTrafficAnalyticsConfig } from '@/lib/scope/use-scoped-analytics-config';

export default function TrafficPage() {
  const config = useTrafficAnalyticsConfig();

  return (
    <DashboardShell>
      <AnalyticsPageLayout config={config} />
    </DashboardShell>
  );
}
