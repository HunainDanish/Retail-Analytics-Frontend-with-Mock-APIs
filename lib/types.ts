// ─── Analytics ───────────────────────────────────────────────────────────────

export interface AnalyticsEvent {
  event_type:
    | "PERSON_DETECTED"
    | "ENTRY"
    | "EXIT"
    | "ZONE_ENTER"
    | "ZONE_EXIT"
    | "DWELL_THRESHOLD"
    | "QUEUE_THRESHOLD"
    | "CAMERA_OFFLINE";
  camera_id: string;
  zone_id?: string;
  track_id?: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}

export type DateRangeKey = "hour" | "day" | "week" | "month" | "custom";

export type ComparisonKey =
  | "today-yesterday"
  | "week-last-week"
  | "month-last-month"
  | "none";

export type SortDirection = "asc" | "desc";

export interface DataRow {
  label: string;
  current: number;
  prior?: number;
}

export interface StatSummary {
  label: string;
  value: string;
  subtext?: string;
}

export type ChartType = "bar" | "line" | "area";

export interface AnalyticsPageConfig {
  /** Page heading and breadcrumb label */
  title: string;
  /** Short description shown under the title */
  description?: string;
  /** What the metric is called (e.g. "Visitors", "Occupancy (%)") */
  metricLabel: string;
  /** Optional unit appended in tooltips (e.g. "%", "min") */
  unit?: string;
  /** Chart style */
  chartType: ChartType;
  /** Called whenever range/comparison changes — returns the rows to display */
  getData: (range: DateRangeKey) => Promise<DataRow[]>;
  /** Called whenever range changes — returns the 3 stat summary cards */
  getStats: (range: DateRangeKey) => Promise<StatSummary[]>;
  /** Column header for the interval column in the data table */
  getIntervalLabel: (range: DateRangeKey) => string;
  /** Labels for current / prior in legend & table header */
  currentSeriesLabel?: string;
  priorSeriesLabel?: string;
}

// ─── Live cameras ────────────────────────────────────────────────────────────

export type LiveCameraStatus = "online" | "offline" | "error";

export type BoundingBox = {
  /** All coordinates are percentages (0-100) of the frame, so overlays scale with any size. */
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  trackId: number;
  label: string;
};

export type Zone = {
  id: string;
  label: string;
  /** Polygon points as "x,y" pairs in percentage units. */
  points: string;
  /** Which themed color to use. */
  variant: "accent" | "warm" | "cool";
};

export type CountingLine = {
  id: string;
  label: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type Camera = {
  id: string;
  name: string;
  location: string;
  status: LiveCameraStatus;
  /** Structured as a prop so a real MJPEG/HLS stream URL can be dropped in later. */
  frameUrl: string | null;
  occupancy: number;
  entriesToday: number;
  exitsToday: number;
  boundingBoxes: BoundingBox[];
  zones: Zone[];
  countingLines: CountingLine[];
};

export type OverlayState = {
  boundingBoxes: boolean;
  trackIds: boolean;
  zones: boolean;
  countingLines: boolean;
};

// ─── Heatmap ─────────────────────────────────────────────────────────────────

export type HeatmapCamera = {
  id: string;
  label: string;
};

/**
 * Each blob represents a radial heat concentration.
 *   cx, cy : centre as % of container (0–100)
 *   r      : radius as % of container width
 *   intensity: 0–1 (maps to opacity of the heat gradient)
 */
export type HeatBlob = {
  id: string;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  intensity: number;
  /** Colour stop for innermost ring */
  color: string;
};

export type FloorZone = {
  id: string;
  label: string;
  /** 0–100 percentage coords inside the floor plan container */
  x: number;
  y: number;
  w: number;
  h: number;
};

export type ZoneRow = {
  id: string;
  zone: string;
  visits: number;
  dwellSec: number; // avg dwell time in seconds
  occupancy: number; // 0–100 %
  trend: "up" | "down" | "flat";
  trendPct: number;
};

// ─── Alerts ──────────────────────────────────────────────────────────────────

export type AlertSeverity = "critical" | "warning" | "info";
export type AlertStatus = "open" | "acknowledged" | "resolved";
export type AlertType =
  | "high_occupancy"
  | "long_queue"
  | "high_dwell_time"
  | "camera_offline";

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  camera: string;
  zone: string;
  timestamp: Date;
  status: AlertStatus;
  message: string;
}

// ─── Admin cameras ───────────────────────────────────────────────────────────

export type CameraStatus = "online" | "offline" | "error" | "disabled";
export type AnalyticsModule =
  | "entry-exit"
  | "occupancy"
  | "zones"
  | "dwell"
  | "heatmap"
  | "queue";
export type Resolution = "1080p" | "2k" | "4k";

export interface AdminCamera {
  id: string;
  name: string;
  store: string;
  location: string;
  status: CameraStatus;
  resolution: Resolution;
  fps: number;
  rtspUrl: string;
  cameraType: "fixed" | "ptz";
  analyticsModules: AnalyticsModule[];
  enabled: boolean;
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export type ReportType =
  | "traffic"
  | "occupancy"
  | "zones"
  | "dwell-time"
  | "queues";

export interface ReportFormData {
  reportType: ReportType;
  dateFrom: string;
  dateTo: string;
  store: string;
  camera: string;
}

export interface ReportKPI {
  label: string;
  value: string;
  change?: number;
}

export interface ReportData {
  title: string;
  storeName: string;
  dateRange: string;
  kpis: ReportKPI[];
  chartData: Array<{ [key: string]: any }>;
  tableData: Array<{ [key: string]: any }>;
  tableColumns: string[];
}

// ─── Scope selector ──────────────────────────────────────────────────────────

export type ScopeZone = { id: string; name: string };
export type ScopeCamera = { id: string; name: string; zones: ScopeZone[] };
export type Store = { id: string; name: string; cameras: ScopeCamera[] };
export type Organization = { id: string; name: string; stores: Store[] };

// ─── Zones & lines editor ────────────────────────────────────────────────────

export type ZoneType = "entrance" | "checkout" | "general";

/** A single point in canvas-space (percentage of canvas width/height). */
export interface Point {
  x: number;
  y: number;
}

export interface ZoneShape {
  kind: "zone";
  id: string;
  name: string;
  type: ZoneType;
  /** Polygon vertices as percentage coords (0–100). */
  points: Point[];
  color: string;
  cameraId: string;
}

export interface LineShape {
  kind: "line";
  id: string;
  name: string;
  /** Exactly two points (percentage coords). */
  points: [Point, Point];
  /** Which side counts as "inside". 'left' means left of the direction vector. */
  insideSide: "left" | "right";
  color: string;
  cameraId: string;
}

export type Shape = ZoneShape | LineShape;

export type DrawMode = "select" | "zone" | "line";

// ─── Users & auth ──────────────────────────────────────────────────────────────

export type UserRole =
  | "Store Manager"
  | "Operations Manager"
  | "Retail Analyst"
  | "System Administrator";
export type UserStatus = "Active" | "Disabled";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  assignedStore: string;
  status: UserStatus;
}

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthSession {
  user: MockUser;
  isAuthenticated: boolean;
}
