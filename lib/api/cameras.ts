// MOCK IMPLEMENTATION — swap the function bodies below for real fetch() calls
// to the FastAPI backend when Module 12 is live. Signatures and return types
// must not change.

import {
  ANALYTICS_MODULES_LABELS,
  MOCK_CAMERAS,
  STORES,
  getStatusColor,
  getStatusLabel,
} from "@/lib/admin-cameras-data";
import { CAMERAS as LIVE_CAMERAS } from "@/lib/camera-data";
import type { AdminCamera, Camera, CameraStatus, Resolution } from "@/lib/types";

export {
  ANALYTICS_MODULES_LABELS,
  STORES,
  getStatusColor,
  getStatusLabel,
};

// ─── In-memory store (persists for the session) ──────────────────────────────

let cameras: AdminCamera[] = MOCK_CAMERAS.map((c) => ({ ...c }));

// ─── Types ───────────────────────────────────────────────────────────────────

export type CreateCameraData = AdminCamera;
export type UpdateCameraData = Partial<AdminCamera>;

export type TestCameraSuccess = {
  status: "success";
  camera_id: string;
  resolution: Resolution;
  fps: number;
  latency_ms: number;
};

export type TestCameraError = {
  status: "error";
  camera_id: string;
  error: string;
};

export type TestCameraResult = TestCameraSuccess | TestCameraError;

// ─── Read ────────────────────────────────────────────────────────────────────

export function getCameras(): Promise<AdminCamera[]> {
  return Promise.resolve(cameras.map((c) => ({ ...c })));
}

export function getLiveCameras(): Promise<Camera[]> {
  return Promise.resolve(LIVE_CAMERAS.map((c) => ({ ...c })));
}

export function getCameraStatus(id: string): Promise<CameraStatus | null> {
  const camera = cameras.find((c) => c.id === id);
  return Promise.resolve(camera?.status ?? null);
}

// ─── Write ───────────────────────────────────────────────────────────────────

export function createCamera(data: CreateCameraData): Promise<AdminCamera> {
  const camera = { ...data };
  cameras = [...cameras, camera];
  return Promise.resolve({ ...camera });
}

export function updateCamera(
  id: string,
  data: UpdateCameraData,
): Promise<AdminCamera | null> {
  const index = cameras.findIndex((c) => c.id === id);
  if (index === -1) return Promise.resolve(null);

  const updated = { ...cameras[index], ...data, id };
  cameras = cameras.map((c) => (c.id === id ? updated : c));
  return Promise.resolve({ ...updated });
}

export function deleteCamera(id: string): Promise<boolean> {
  const before = cameras.length;
  cameras = cameras.filter((c) => c.id !== id);
  return Promise.resolve(cameras.length < before);
}

// ─── Test (deterministic — mirrors TestCameraModal logic) ────────────────────

export function testCamera(id: string): Promise<TestCameraResult> {
  const camera = cameras.find((c) => c.id === id);
  if (!camera) {
    return Promise.resolve({
      status: "error",
      camera_id: id,
      error: "Camera not found",
    });
  }

  if (camera.status === "error") {
    return Promise.resolve({
      status: "error",
      camera_id: camera.id,
      error:
        "Connection timeout: Camera at " +
        camera.rtspUrl +
        " did not respond within 30 seconds.",
    });
  }

  if (camera.status === "offline") {
    return Promise.resolve({
      status: "error",
      camera_id: camera.id,
      error:
        "Camera is currently offline. Please check the power and network connection.",
    });
  }

  return Promise.resolve({
    status: "success",
    camera_id: camera.id,
    resolution: camera.resolution,
    fps: camera.fps,
    latency_ms: 45,
  });
}
