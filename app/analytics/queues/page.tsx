'use client';

import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { AnalyticsPageLayout } from '@/components/analytics/analytics-page-layout';
import { useQueuesAnalyticsConfig } from '@/lib/scope/use-scoped-analytics-config';

export default function QueuesPage() {
  const config = useQueuesAnalyticsConfig();

  return (
    <DashboardShell>
      <AnalyticsPageLayout config={config} />
    </DashboardShell>
  );
}
