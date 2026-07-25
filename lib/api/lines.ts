// MOCK IMPLEMENTATION — swap the function bodies below for real fetch() calls
// to the FastAPI backend when Module 12 is live. Signatures and return types
// must not change.

import { SHAPE_COLORS } from "@/lib/zones-lines-data";
import type { LineShape, Point } from "@/lib/types";
import { __getShapes, __setShapes } from "@/lib/api/zones";

// ─── ID helper ───────────────────────────────────────────────────────────────

let lineCounter = 1;

function nextLineId(): string {
  const id = `l-api-${String(lineCounter).padStart(3, "0")}`;
  lineCounter += 1;
  return id;
}

function clonePoint(p: Point): Point {
  return { x: p.x, y: p.y };
}

function cloneLine(line: LineShape): LineShape {
  return {
    ...line,
    points: [clonePoint(line.points[0]), clonePoint(line.points[1])],
  };
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type CreateCountingLineData = Omit<LineShape, "kind" | "id" | "color"> & {
  id?: string;
  color?: string;
};

export type UpdateCountingLineData = Partial<
  Pick<LineShape, "name" | "points" | "insideSide" | "color" | "cameraId">
>;

// ─── API functions ───────────────────────────────────────────────────────────

export function getCountingLines(camera_id: string): Promise<LineShape[]> {
  const lines = __getShapes().filter(
    (s): s is LineShape => s.kind === "line" && s.cameraId === camera_id,
  );
  return Promise.resolve(lines.map(cloneLine));
}

export function createCountingLine(
  data: CreateCountingLineData,
): Promise<LineShape> {
  const line: LineShape = {
    kind: "line",
    id: data.id ?? nextLineId(),
    name: data.name,
    points: [clonePoint(data.points[0]), clonePoint(data.points[1])],
    insideSide: data.insideSide,
    color: data.color ?? SHAPE_COLORS[3],
    cameraId: data.cameraId,
  };
  __setShapes([...__getShapes(), line]);
  return Promise.resolve(cloneLine(line));
}

export function updateCountingLine(
  id: string,
  data: UpdateCountingLineData,
): Promise<LineShape | null> {
  const shapes = __getShapes();
  const existing = shapes.find(
    (s): s is LineShape => s.id === id && s.kind === "line",
  );
  if (!existing) return Promise.resolve(null);

  const updated: LineShape = {
    ...existing,
    ...data,
    kind: "line",
    id,
    points: data.points
      ? [clonePoint(data.points[0]), clonePoint(data.points[1])]
      : [clonePoint(existing.points[0]), clonePoint(existing.points[1])],
  };

  __setShapes(shapes.map((s) => (s.id === id ? updated : s)));
  return Promise.resolve(cloneLine(updated));
}

export function deleteCountingLine(id: string): Promise<boolean> {
  const shapes = __getShapes();
  const before = shapes.length;
  __setShapes(shapes.filter((s) => !(s.id === id && s.kind === "line")));
  return Promise.resolve(__getShapes().length < before);
}
