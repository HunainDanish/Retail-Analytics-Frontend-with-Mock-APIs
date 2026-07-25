'use client';

import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { AnalyticsPageLayout } from '@/components/analytics/analytics-page-layout';
import { useZonesAnalyticsConfig } from '@/lib/scope/use-scoped-analytics-config';

export default function ZonesPage() {
  const config = useZonesAnalyticsConfig();

  return (
    <DashboardShell>
      <AnalyticsPageLayout config={config} />
    </DashboardShell>
  );
}
