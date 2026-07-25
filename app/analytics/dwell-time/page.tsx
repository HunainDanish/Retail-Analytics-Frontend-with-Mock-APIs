'use client';

import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { AnalyticsPageLayout } from '@/components/analytics/analytics-page-layout';
import { useDwellAnalyticsConfig } from '@/lib/scope/use-scoped-analytics-config';

export default function DwellTimePage() {
  const config = useDwellAnalyticsConfig();

  return (
    <DashboardShell>
      <AnalyticsPageLayout config={config} />
    </DashboardShell>
  );
}
