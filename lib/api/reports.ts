// MOCK IMPLEMENTATION — swap the function bodies below for real fetch() calls
// to the FastAPI backend when Module 12 is live. Signatures and return types
// must not change.

import {
  CAMERAS,
  REPORT_TYPES,
  STORES,
  generateReport,
} from "@/lib/reports-data";
import type { ReportData, ReportType } from "@/lib/types";

export type ReportStoreOption = { id: string; name: string };
export type ReportCameraOption = { id: string; name: string };

export { CAMERAS, REPORT_TYPES, STORES };

export type ReportFormat = "json" | "csv" | "pdf";

export interface GetReportParams {
  format: ReportFormat;
  from: string;
  to: string;
  store_id: string;
}

export interface ReportResult extends ReportData {
  format: ReportFormat;
  store_id: string;
}

export function getReport(
  type: ReportType,
  { format, from, to, store_id }: GetReportParams,
): Promise<ReportResult> {
  const report = generateReport({
    reportType: type,
    dateFrom: from,
    dateTo: to,
    store: store_id,
    camera: "all",
  });

  return Promise.resolve({
    ...report,
    format,
    store_id,
  });
}
