// MOCK IMPLEMENTATION — swap the function bodies below for real fetch() calls
// to the FastAPI backend when Module 12 is live. Signatures and return types
// must not change.

import {
  getDwellTimeData,
  getDwellTimeStats,
  getIntervalLabel,
  getOccupancyData,
  getOccupancyStats,
  getQueuesData,
  getQueuesStats,
  getTrafficData,
  getTrafficStats,
  getZonesData,
  getZonesStats,
} from "@/lib/analytics-data";
import {
  FLOOR_ZONES,
  HEAT_BLOBS,
  HEATMAP_CAMERAS,
  ZONE_PERFORMANCE,
} from "@/lib/heatmap-data";
import {
  entriesExitsData,
  kpiData,
  occupancyTrendData,
  visitorsByHourData,
} from "@/lib/overview-data";
import type {
  DataRow,
  DateRangeKey,
  FloorZone,
  HeatBlob,
  HeatmapCamera,
  StatSummary,
  ZoneRow,
} from "@/lib/types";
import {
  scaleDataRows,
  scopeScaleFactor,
  filterZonePerformanceRows,
} from "@/lib/scope/scope-filters";

export type OverviewKpiData = typeof kpiData;
export type VisitorsByHourRow = (typeof visitorsByHourData)[number];
export type EntriesExitsRow = (typeof entriesExitsData)[number];
export type OccupancyTrendRow = (typeof occupancyTrendData)[number];

export interface OverviewScopeParams {
  store_id?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function inferDateRangeKey(from: string, to: string): DateRangeKey {
  const start = new Date(from).getTime();
  const end = new Date(to).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return "day";

  const diffMs = Math.abs(end - start);
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffHours <= 1.5) return "hour";
  if (diffDays <= 1.5) return "day";
  if (diffDays <= 8) return "week";
  return "month";
}

export interface DateRangeParams {
  from: string;
  to: string;
}

export interface TrafficParams extends DateRangeParams {
  store_id: string;
}

export interface OccupancyParams {
  camera_id?: string;
  store_id?: string;
}

export interface ZonesParams extends DateRangeParams {
  zone_id: string;
}

export interface DwellParams extends DateRangeParams {
  zone_id: string;
}

export interface HeatmapParams {
  camera_id: string;
  date: string;
  from_time: string;
  to_time: string;
}

export interface QueuesParams extends DateRangeParams {
  zone_id: string;
}

export interface HeatmapResult {
  camera_id: string;
  date: string;
  from_time: string;
  to_time: string;
  blobs: HeatBlob[];
  floor_zones: FloorZone[];
}

export interface ZonesResult {
  zone_id: string;
  from: string;
  to: string;
  rows: DataRow[];
  performance: ZoneRow | undefined;
}

// ─── API functions ───────────────────────────────────────────────────────────

export function getTraffic({
  store_id: _store_id,
  from,
  to,
}: TrafficParams): Promise<DataRow[]> {
  const range = inferDateRangeKey(from, to);
  return Promise.resolve(getTrafficData(range));
}

export function getOccupancy({
  camera_id: _camera_id,
  store_id: _store_id,
}: OccupancyParams = {}): Promise<DataRow[]> {
  return Promise.resolve(getOccupancyData("day"));
}

export function getZones({
  zone_id,
  from,
  to,
}: ZonesParams): Promise<ZonesResult> {
  const range = inferDateRangeKey(from, to);
  const rows = getZonesData(range);
  const performance = ZONE_PERFORMANCE.find((z) => z.id === zone_id);

  return Promise.resolve({
    zone_id,
    from,
    to,
    rows,
    performance,
  });
}

export function getDwell({
  zone_id: _zone_id,
  from,
  to,
}: DwellParams): Promise<DataRow[]> {
  const range = inferDateRangeKey(from, to);
  return Promise.resolve(getDwellTimeData(range));
}

export function getHeatmap({
  camera_id,
  date,
  from_time,
  to_time,
}: HeatmapParams): Promise<HeatmapResult> {
  const blobs = HEAT_BLOBS[camera_id] ?? HEAT_BLOBS["cam-overview"] ?? [];

  return Promise.resolve({
    camera_id,
    date,
    from_time,
    to_time,
    blobs,
    floor_zones: FLOOR_ZONES,
  });
}

export function getQueues({
  zone_id: _zone_id,
  from,
  to,
}: QueuesParams): Promise<DataRow[]> {
  const range = inferDateRangeKey(from, to);
  return Promise.resolve(getQueuesData(range));
}

// ─── Overview dashboard ──────────────────────────────────────────────────────

function scaleOverviewKpis(
  data: OverviewKpiData,
  factor: number,
): OverviewKpiData {
  return {
    ...data,
    visitorsToday: {
      ...data.visitorsToday,
      value: Math.round(data.visitorsToday.value * factor),
    },
    occupancy: {
      ...data.occupancy,
      value: Math.min(100, Math.round(data.occupancy.value * factor)),
    },
    peakOccupancy: {
      ...data.peakOccupancy,
      value: Math.min(100, Math.round(data.peakOccupancy.value * factor)),
    },
    queueLength: {
      ...data.queueLength,
      value: Math.round(data.queueLength.value * factor),
    },
  };
}

export function getOverviewKpis(
  params: OverviewScopeParams = {},
): Promise<OverviewKpiData> {
  if (!params.store_id) return Promise.resolve(kpiData);
  return Promise.resolve(
    scaleOverviewKpis(kpiData, scopeScaleFactor(params.store_id)),
  );
}

export function getVisitorsByHour(
  params: OverviewScopeParams = {},
): Promise<VisitorsByHourRow[]> {
  if (!params.store_id) return Promise.resolve(visitorsByHourData);
  const factor = scopeScaleFactor(params.store_id);
  return Promise.resolve(
    visitorsByHourData.map((row) => ({
      ...row,
      visitors: Math.round(row.visitors * factor),
    })),
  );
}

export function getEntriesExits(
  params: OverviewScopeParams = {},
): Promise<EntriesExitsRow[]> {
  if (!params.store_id) return Promise.resolve(entriesExitsData);
  const factor = scopeScaleFactor(params.store_id);
  return Promise.resolve(
    entriesExitsData.map((row) => ({
      ...row,
      entries: Math.round(row.entries * factor),
      exits: Math.round(row.exits * factor),
    })),
  );
}

export function getOccupancyTrend(
  params: OverviewScopeParams = {},
): Promise<OccupancyTrendRow[]> {
  if (!params.store_id) return Promise.resolve(occupancyTrendData);
  const factor = scopeScaleFactor(params.store_id);
  return Promise.resolve(
    occupancyTrendData.map((row) => ({
      ...row,
      occupancy: Math.min(100, Math.round(row.occupancy * factor)),
    })),
  );
}

// ─── Analytics page helpers (by DateRangeKey) ────────────────────────────────

export function fetchTrafficData(range: DateRangeKey): Promise<DataRow[]> {
  return Promise.resolve(getTrafficData(range));
}

export function fetchTrafficStats(range: DateRangeKey): Promise<StatSummary[]> {
  return Promise.resolve(getTrafficStats(range));
}

export function fetchOccupancyData(range: DateRangeKey): Promise<DataRow[]> {
  return Promise.resolve(getOccupancyData(range));
}

export function fetchOccupancyStats(
  range: DateRangeKey,
): Promise<StatSummary[]> {
  return Promise.resolve(getOccupancyStats(range));
}

export function fetchZonesData(range: DateRangeKey): Promise<DataRow[]> {
  return Promise.resolve(getZonesData(range));
}

export function fetchZonesStats(range: DateRangeKey): Promise<StatSummary[]> {
  return Promise.resolve(getZonesStats(range));
}

export function fetchDwellTimeData(range: DateRangeKey): Promise<DataRow[]> {
  return Promise.resolve(getDwellTimeData(range));
}

export function fetchDwellTimeStats(
  range: DateRangeKey,
): Promise<StatSummary[]> {
  return Promise.resolve(getDwellTimeStats(range));
}

export function fetchQueuesData(range: DateRangeKey): Promise<DataRow[]> {
  return Promise.resolve(getQueuesData(range));
}

export function fetchQueuesStats(range: DateRangeKey): Promise<StatSummary[]> {
  return Promise.resolve(getQueuesStats(range));
}

export function fetchIntervalLabel(range: DateRangeKey): string {
  return getIntervalLabel(range);
}

// ─── Heatmap / zone performance ─────────────────────────────────────────────

export function getHeatmapCameras(): Promise<HeatmapCamera[]> {
  return Promise.resolve(HEATMAP_CAMERAS);
}

export function getZonePerformance(
  params: { store_id?: string; zone_id?: string } = {},
): Promise<ZoneRow[]> {
  if (!params.store_id && !params.zone_id) {
    return Promise.resolve(ZONE_PERFORMANCE);
  }
  return Promise.resolve(
    filterZonePerformanceRows(
      ZONE_PERFORMANCE,
      params.zone_id ?? null,
      params.store_id ?? null,
    ),
  );
}
