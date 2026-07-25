// MOCK IMPLEMENTATION — swap the function bodies below for real fetch() calls
// to the FastAPI backend when Module 12 is live. Signatures and return types
// must not change.

import {
  MOCK_ALERTS,
  formatAlertTime,
  getAlertLabel,
  getSeverityColor,
  getSeverityDotColor,
  getStatusColor,
} from "@/lib/alerts-data";
import type { Alert, AlertSeverity, AlertStatus } from "@/lib/types";

export {
  formatAlertTime,
  getAlertLabel,
  getSeverityColor,
  getSeverityDotColor,
  getStatusColor,
};

export interface GetAlertsParams {
  status?: AlertStatus;
  severity?: AlertSeverity;
}

export type AlertPatch = Partial<
  Pick<Alert, "status" | "severity" | "message">
>;

export function getAlerts({
  status,
  severity,
}: GetAlertsParams = {}): Promise<Alert[]> {
  let results = [...MOCK_ALERTS];

  if (status) {
    results = results.filter((a) => a.status === status);
  }
  if (severity) {
    results = results.filter((a) => a.severity === severity);
  }

  return Promise.resolve(results);
}

export function updateAlert(
  id: string,
  patch: AlertPatch,
): Promise<Alert | null> {
  const alert = MOCK_ALERTS.find((a) => a.id === id);
  if (!alert) return Promise.resolve(null);

  Object.assign(alert, patch);
  return Promise.resolve({ ...alert });
}
