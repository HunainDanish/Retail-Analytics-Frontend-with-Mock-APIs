'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { AlertFilters } from '@/components/alerts/alert-filters';
import { AlertCard } from '@/components/alerts/alert-card';
import { getAlerts, updateAlert } from '@/lib/api/alerts';
import { SEVERITY_COLORS } from '@/lib/constants';
import type { Alert, AlertSeverity, AlertStatus } from '@/lib/types';
import { AlertCircle } from 'lucide-react';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [severity, setSeverity] = useState<AlertSeverity | 'all'>('all');
  const [status, setStatus] = useState<AlertStatus | 'all'>('all');
  const [camera, setCamera] = useState('all');
  const [zone, setZone] = useState('all');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const data = await getAlerts();
      if (!cancelled) {
        setAlerts(data);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredAlerts = alerts.filter((alert) => {
    if (severity !== 'all' && alert.severity !== severity) return false;
    if (status !== 'all' && alert.status !== status) return false;
    if (camera !== 'all' && alert.camera !== camera) return false;
    if (zone !== 'all' && alert.zone !== zone) return false;
    return true;
  });

  const handleAcknowledge = async (id: string) => {
    const updated = await updateAlert(id, { status: 'acknowledged' });
    if (updated) {
      setAlerts((prev) =>
        prev.map((alert) => (alert.id === id ? updated : alert)),
      );
    }
  };

  const handleResolve = async (id: string) => {
    const updated = await updateAlert(id, { status: 'resolved' });
    if (updated) {
      setAlerts((prev) =>
        prev.map((alert) => (alert.id === id ? updated : alert)),
      );
    }
  };

  const openCount = alerts.filter((a) => a.status === 'open').length;
  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-foreground">Alerts</h1>
          <p className="text-muted-foreground">
            Monitor and manage store events in real-time
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-card/50 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${SEVERITY_COLORS.critical.dot}`} />
              <span className="text-sm text-muted-foreground">Critical Alerts</span>
              <span className="ml-auto font-bold text-foreground">
                {loading ? '—' : criticalCount}
              </span>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card/50 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${SEVERITY_COLORS.warning.dot}`} />
              <span className="text-sm text-muted-foreground">Open Alerts</span>
              <span className="ml-auto font-bold text-foreground">
                {loading ? '—' : openCount}
              </span>
            </div>
          </div>
        </div>

        <AlertFilters
          severity={severity}
          onSeverityChange={setSeverity}
          status={status}
          onStatusChange={setStatus}
          camera={camera}
          onCameraChange={setCamera}
          zone={zone}
          onZoneChange={setZone}
        />

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block relative w-10 h-10 mb-3">
                <div className="absolute inset-0 border-4 border-transparent border-t-primary border-r-primary rounded-full animate-spin" />
              </div>
              <p className="text-sm text-muted-foreground">Loading alerts…</p>
            </div>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-border border-dashed bg-card/30 py-12 px-4">
            <AlertCircle className="mb-3 h-8 w-8 text-muted-foreground" />
            <h3 className="mb-1 text-base font-medium text-foreground">No alerts</h3>
            <p className="text-sm text-muted-foreground">
              No alerts match your current filter selection.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {filteredAlerts.length} {filteredAlerts.length === 1 ? 'Alert' : 'Alerts'}
            </div>
            <div className="space-y-2">
              {filteredAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onAcknowledge={handleAcknowledge}
                  onResolve={handleResolve}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
