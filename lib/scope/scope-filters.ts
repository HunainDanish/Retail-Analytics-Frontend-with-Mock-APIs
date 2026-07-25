import type {
  Camera,
  DataRow,
  HeatmapCamera,
  ScopeCamera,
  StatSummary,
  Store,
  ZoneRow,
} from "@/lib/types";

/** Deterministic scale factor from a scope id (store/camera/zone). */
export function scopeScaleFactor(id: string | null | undefined): number {
  if (!id) return 1;
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash + id.charCodeAt(i) * (i + 1)) % 97;
  }
  return 0.85 + (hash % 30) / 100;
}

export function scaleDataRows(rows: DataRow[], factor: number): DataRow[] {
  return rows.map((row) => ({
    ...row,
    current: Math.round(row.current * factor),
    prior:
      row.prior !== undefined
        ? Math.round(row.prior * factor)
        : undefined,
  }));
}

export function scaleStatSummaries(
  stats: StatSummary[],
  factor: number,
): StatSummary[] {
  return stats.map((stat) => {
    const numeric = Number.parseInt(stat.value.replace(/[^\d]/g, ""), 10);
    if (Number.isNaN(numeric)) return stat;
    const scaled = Math.round(numeric * factor);
    const value = stat.value.includes("%")
      ? `${scaled}%`
      : scaled.toLocaleString();
    return { ...stat, value };
  });
}

export function getStoreCameraIds(store: Store | null): string[] {
  return store?.cameras.map((camera) => camera.id) ?? [];
}

export function filterLiveCameras(
  cameras: Camera[],
  cameraId: string | null,
  storeCameraIds: string[],
): Camera[] {
  if (cameraId) {
    return cameras.filter((camera) => camera.id === cameraId);
  }
  if (storeCameraIds.length > 0) {
    return cameras.filter((camera) => storeCameraIds.includes(camera.id));
  }
  return cameras;
}

const SCOPE_TO_HEATMAP: Record<string, string> = {
  "cam-entrance": "cam-entrance",
  "cam-checkout": "cam-checkout",
  "cam-apparel": "cam-apparel",
  "cam-atrium": "cam-overview",
  "cam-electronics": "cam-aisle3",
  "cam-produce": "cam-overview",
  "cam-deli": "cam-overview",
};

export function heatmapCameraIdsForScope(
  cameraId: string | null,
  storeCameraIds: string[],
): string[] {
  const ids = new Set<string>();
  if (cameraId) {
    ids.add(SCOPE_TO_HEATMAP[cameraId] ?? "cam-overview");
  }
  for (const id of storeCameraIds) {
    ids.add(SCOPE_TO_HEATMAP[id] ?? "cam-overview");
  }
  return [...ids];
}

export function filterHeatmapCameras(
  cameras: HeatmapCamera[],
  cameraId: string | null,
  storeCameraIds: string[],
): HeatmapCamera[] {
  const allowed = heatmapCameraIdsForScope(cameraId, storeCameraIds);
  if (allowed.length === 0) return cameras;
  const filtered = cameras.filter((camera) => allowed.includes(camera.id));
  return filtered.length > 0 ? filtered : cameras;
}

/** Global scope is the outer filter; pageCamera narrows within allowed ids. */
export function resolveEffectiveCameraId(
  globalCameraId: string | null,
  pageCameraId: string | null,
  allowedIds: string[],
): string {
  if (pageCameraId && allowedIds.includes(pageCameraId)) return pageCameraId;
  if (globalCameraId) {
    const mapped = SCOPE_TO_HEATMAP[globalCameraId] ?? globalCameraId;
    if (allowedIds.includes(mapped)) return mapped;
  }
  return allowedIds[0] ?? pageCameraId ?? globalCameraId ?? "";
}

export function resolveZoneId(
  zoneId: string | null,
  camera: ScopeCamera | null,
  store: Store | null,
): string {
  if (zoneId) return zoneId;
  if (camera?.zones[0]?.id) return camera.zones[0].id;
  if (store?.cameras[0]?.zones[0]?.id) return store.cameras[0].zones[0].id;
  return "entrance";
}

export function filterZonePerformanceRows(
  rows: ZoneRow[],
  zoneId: string | null,
  storeId: string | null,
): ZoneRow[] {
  if (zoneId) {
    const match = rows.find(
      (row) =>
        row.id === zoneId ||
        row.zone.toLowerCase().includes(zoneId.split("-").pop()?.toLowerCase() ?? ""),
    );
    return match ? [match] : rows;
  }
  if (storeId) {
    const factor = scopeScaleFactor(storeId);
    return rows.map((row) => ({
      ...row,
      visits: Math.round(row.visits * factor),
      occupancy: Math.min(100, Math.round(row.occupancy * factor)),
    }));
  }
  return rows;
}

export type CustomerFlowCamera = { id: string; label: string };

export const CUSTOMER_FLOW_CAMERAS: CustomerFlowCamera[] = [
  { id: "main", label: "Main Floor" },
  { id: "entrance", label: "Entrance" },
  { id: "retail", label: "Retail Section" },
];

const SCOPE_TO_FLOW_CAMERAS: Record<string, string[]> = {
  "cam-entrance": ["entrance", "main"],
  "cam-checkout": ["retail", "main"],
  "cam-apparel": ["retail", "main"],
  "cam-atrium": ["main", "entrance"],
  "cam-electronics": ["retail", "main"],
  "cam-produce": ["entrance", "main"],
  "cam-deli": ["retail", "main"],
};

const FLOW_CAMERA_TRAJECTORIES: Record<string, string[]> = {
  main: ["path1", "path2", "path3", "path4"],
  entrance: ["path1", "path3"],
  retail: ["path2", "path3", "path4"],
};

export function filterCustomerFlowCameras(
  globalCameraId: string | null,
  storeCameraIds: string[],
): CustomerFlowCamera[] {
  const allowed = new Set<string>();

  if (globalCameraId) {
    for (const id of SCOPE_TO_FLOW_CAMERAS[globalCameraId] ?? ["main"]) {
      allowed.add(id);
    }
  }

  if (storeCameraIds.length > 0 && !globalCameraId) {
    for (const scopeCameraId of storeCameraIds) {
      for (const flowId of SCOPE_TO_FLOW_CAMERAS[scopeCameraId] ?? ["main"]) {
        allowed.add(flowId);
      }
    }
  }

  if (allowed.size === 0) return CUSTOMER_FLOW_CAMERAS;
  return CUSTOMER_FLOW_CAMERAS.filter((camera) => allowed.has(camera.id));
}

export function resolveCustomerFlowCameraId(
  globalCameraId: string | null,
  pageCameraId: string,
  allowedIds: string[],
): string {
  if (allowedIds.includes(pageCameraId)) return pageCameraId;
  if (globalCameraId) {
    const mapped = SCOPE_TO_FLOW_CAMERAS[globalCameraId]?.[0];
    if (mapped && allowedIds.includes(mapped)) return mapped;
  }
  return allowedIds[0] ?? pageCameraId;
}

export function trajectoryIdsForFlowCamera(cameraId: string): string[] {
  return FLOW_CAMERA_TRAJECTORIES[cameraId] ?? FLOW_CAMERA_TRAJECTORIES.main;
}
