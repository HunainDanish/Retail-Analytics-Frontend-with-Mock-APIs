// MOCK IMPLEMENTATION — swap the function bodies below for real fetch() calls
// to the FastAPI backend when Module 12 is live. Signatures and return types
// must not change.

import {
  CAMERAS_LIST,
  INITIAL_SHAPES,
  SHAPE_COLORS,
  ZONE_TYPE_COLORS,
  ZONE_TYPES,
} from "@/lib/zones-lines-data";
import type { Point, Shape, ZoneShape } from "@/lib/types";

export { CAMERAS_LIST, SHAPE_COLORS, ZONE_TYPE_COLORS, ZONE_TYPES };

export type ZonesLinesCameraOption = { id: string; label: string };

// ─── Shared in-memory shape store (used by lines.ts too) ─────────────────────

function clonePoint(p: Point): Point {
  return { x: p.x, y: p.y };
}

function cloneShape(shape: Shape): Shape {
  if (shape.kind === "zone") {
    return { ...shape, points: shape.points.map(clonePoint) };
  }
  return {
    ...shape,
    points: [clonePoint(shape.points[0]), clonePoint(shape.points[1])],
  };
}

let shapes: Shape[] = INITIAL_SHAPES.map(cloneShape);

let shapeCounter = shapes.length + 1;

function nextZoneId(): string {
  const id = `z-api-${String(shapeCounter).padStart(3, "0")}`;
  shapeCounter += 1;
  return id;
}

/** @internal Shared shape store for lib/api/lines.ts */
export function __getShapes(): Shape[] {
  return shapes;
}

/** @internal */
export function __setShapes(next: Shape[]): void {
  shapes = next;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type CreateZoneData = Omit<ZoneShape, "kind" | "id" | "color"> & {
  id?: string;
  color?: string;
};

export type UpdateZoneData = Partial<
  Pick<ZoneShape, "name" | "type" | "points" | "color" | "cameraId">
>;

// ─── API functions ───────────────────────────────────────────────────────────

export function getAllShapes(): Promise<Shape[]> {
  return Promise.resolve(shapes.map(cloneShape));
}

export function getCamerasList(): Promise<ZonesLinesCameraOption[]> {
  return Promise.resolve(CAMERAS_LIST);
}

export function getZoneShapes(camera_id: string): Promise<ZoneShape[]> {
  const zones = shapes.filter(
    (s): s is ZoneShape => s.kind === "zone" && s.cameraId === camera_id,
  );
  return Promise.resolve(zones.map((z) => cloneShape(z) as ZoneShape));
}

export function createZone(data: CreateZoneData): Promise<ZoneShape> {
  const zone: ZoneShape = {
    kind: "zone",
    id: data.id ?? nextZoneId(),
    name: data.name,
    type: data.type,
    points: data.points.map(clonePoint),
    color: data.color ?? ZONE_TYPE_COLORS[data.type],
    cameraId: data.cameraId,
  };
  shapes = [...shapes, zone];
  return Promise.resolve(cloneShape(zone) as ZoneShape);
}

export function updateZone(
  id: string,
  data: UpdateZoneData,
): Promise<ZoneShape | null> {
  const index = shapes.findIndex((s) => s.id === id && s.kind === "zone");
  if (index === -1) return Promise.resolve(null);

  const existing = shapes[index] as ZoneShape;
  const updated: ZoneShape = {
    ...existing,
    ...data,
    kind: "zone",
    id,
    points: data.points
      ? data.points.map(clonePoint)
      : existing.points.map(clonePoint),
    color:
      data.color ??
      (data.type ? ZONE_TYPE_COLORS[data.type] : existing.color),
  };

  shapes = shapes.map((s) => (s.id === id ? updated : s));
  return Promise.resolve(cloneShape(updated) as ZoneShape);
}

export function deleteZone(id: string): Promise<boolean> {
  const before = shapes.length;
  shapes = shapes.filter((s) => !(s.id === id && s.kind === "zone"));
  return Promise.resolve(shapes.length < before);
}
