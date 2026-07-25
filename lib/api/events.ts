// MOCK IMPLEMENTATION — swap the function bodies below for real fetch() calls
// to the FastAPI backend when Module 12 is live. Signatures and return types
// must not change.

import { CAMERAS } from "@/lib/camera-data";
import { visitorsByHourData } from "@/lib/overview-data";
import type { AnalyticsEvent } from "@/lib/types";

// ─── Params ──────────────────────────────────────────────────────────────────

export interface GetEventsParams {
  camera_id?: string;
  event_type?: AnalyticsEvent["event_type"];
  from?: string;
  to?: string;
}

// ─── Seeded helpers (deterministic — no Math.random) ─────────────────────────

/** Mulberry32 — returns a float in [0, 1) from an integer seed. */
function seededUnit(seed: number): number {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function seededInt(seed: number, min: number, max: number): number {
  return min + Math.floor(seededUnit(seed) * (max - min + 1));
}

function toIso(baseDate: Date, hour: number, minute: number, second: number): string {
  const d = new Date(baseDate);
  d.setHours(hour, minute, second, 0);
  return d.toISOString();
}

// ─── Dwell distribution (mirrors analytics-data bucket weights) ──────────────

const DWELL_BUCKETS = [
  { minSec: 5, maxSec: 30, weight: 234 },
  { minSec: 30, maxSec: 60, weight: 156 },
  { minSec: 60, maxSec: 180, weight: 289 },
  { minSec: 180, maxSec: 600, weight: 412 },
  { minSec: 600, maxSec: 2100, weight: 187 },
] as const;

const DWELL_WEIGHT_TOTAL = DWELL_BUCKETS.reduce((s, b) => s + b.weight, 0);

function pickDwellSeconds(seed: number): number {
  const target = seededInt(seed, 0, DWELL_WEIGHT_TOTAL - 1);
  let cumulative = 0;
  for (const bucket of DWELL_BUCKETS) {
    cumulative += bucket.weight;
    if (target < cumulative) {
      return seededInt(seed + 7, bucket.minSec, bucket.maxSec);
    }
  }
  return DWELL_BUCKETS[0].minSec;
}

// ─── Offline cameras (from camera-data.ts) ───────────────────────────────────

const OFFLINE_CAMERA_EVENTS: {
  camera_id: string;
  hour: number;
  minute: number;
}[] = [
  { camera_id: "cam-stockroom", hour: 10, minute: 47 },
  { camera_id: "cam-aisle3", hour: 14, minute: 23 },
];

// ─── Event generator ─────────────────────────────────────────────────────────

function generateEventsForDay(baseDate: Date): AnalyticsEvent[] {
  const events: AnalyticsEvent[] = [];
  let seed = 1;

  const onlineCameras = CAMERAS.filter((c) => c.status === "online");
  const checkoutCamera =
    CAMERAS.find((c) => c.id === "cam-checkout") ?? onlineCameras[0];

  // Hourly traffic-driven person / entry / exit / zone events
  for (let hour = 0; hour < 24; hour++) {
    const hourData = visitorsByHourData[hour];
    const visitors = hourData?.visitors ?? 0;
    const sessions = Math.max(1, Math.floor(visitors / 5));

    for (let s = 0; s < sessions; s++) {
      const camera = onlineCameras[seed % onlineCameras.length];
      const minute = seededInt(seed, 0, 59);
      const second = seededInt(seed + 1, 0, 59);
      const trackId = `track-${1000 + seed}`;
      const zone = camera.zones[seed % Math.max(camera.zones.length, 1)];
      const zoneId = zone?.id;

      const entryTs = toIso(baseDate, hour, minute, second);

      events.push({
        event_type: "ENTRY",
        camera_id: camera.id,
        track_id: trackId,
        timestamp: entryTs,
        metadata: { confidence: 0.85 + seededUnit(seed + 2) * 0.14 },
      });

      events.push({
        event_type: "PERSON_DETECTED",
        camera_id: camera.id,
        track_id: trackId,
        timestamp: toIso(baseDate, hour, minute, Math.min(second + 2, 59)),
        metadata: {
          confidence: 0.88 + seededUnit(seed + 3) * 0.11,
          label: "person",
        },
      });

      if (zoneId) {
        const dwellSec = pickDwellSeconds(seed + 4);
        const enterMinute = minute;
        const exitTotalSec = enterMinute * 60 + second + dwellSec;
        const exitHour = hour + Math.floor(exitTotalSec / 3600);
        const exitRemainder = exitTotalSec % 3600;
        const exitMinute = Math.floor(exitRemainder / 60);
        const exitSecond = exitRemainder % 60;

        events.push({
          event_type: "ZONE_ENTER",
          camera_id: camera.id,
          zone_id: zoneId,
          track_id: trackId,
          timestamp: toIso(baseDate, hour, enterMinute, second + 5),
          metadata: { zone_label: zone?.label },
        });

        if (dwellSec >= 600) {
          const thresholdMinute = Math.min(enterMinute + Math.floor(dwellSec / 60 / 2), 59);
          events.push({
            event_type: "DWELL_THRESHOLD",
            camera_id: camera.id,
            zone_id: zoneId,
            track_id: trackId,
            timestamp: toIso(baseDate, hour, thresholdMinute, second),
            metadata: { dwell_seconds: dwellSec, threshold_seconds: 600 },
          });
        }

        events.push({
          event_type: "ZONE_EXIT",
          camera_id: camera.id,
          zone_id: zoneId,
          track_id: trackId,
          timestamp: toIso(
            baseDate,
            Math.min(exitHour, 23),
            Math.min(exitMinute, 59),
            exitSecond,
          ),
          metadata: { dwell_seconds: dwellSec },
        });
      }

      events.push({
        event_type: "EXIT",
        camera_id: camera.id,
        track_id: trackId,
        timestamp: toIso(
          baseDate,
          hour,
          Math.min(minute + seededInt(seed + 5, 1, 15), 59),
          second,
        ),
        metadata: {},
      });

      // Queue threshold during peak hours at checkout
      if (visitors >= 500 && s % 7 === 0) {
        events.push({
          event_type: "QUEUE_THRESHOLD",
          camera_id: checkoutCamera.id,
          zone_id: checkoutCamera.zones[0]?.id,
          timestamp: toIso(baseDate, hour, minute, second),
          metadata: {
            queue_length: seededInt(seed + 6, 8, 20),
            threshold: 8,
          },
        });
      }

      seed += 10;
    }
  }

  // Camera offline events for cameras marked offline/error in camera-data.ts
  for (const offline of OFFLINE_CAMERA_EVENTS) {
    events.push({
      event_type: "CAMERA_OFFLINE",
      camera_id: offline.camera_id,
      timestamp: toIso(baseDate, offline.hour, offline.minute, 0),
      metadata: {
        reason:
          offline.camera_id === "cam-aisle3"
            ? "stream_error"
            : "connection_lost",
      },
    });
  }

  return events.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
}

function parseDayStart(from?: string): Date {
  if (from) {
    const d = new Date(from);
    if (!Number.isNaN(d.getTime())) {
      d.setHours(0, 0, 0, 0);
      return d;
    }
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function filterEvents(
  events: AnalyticsEvent[],
  params: GetEventsParams,
): AnalyticsEvent[] {
  let results = events;

  if (params.camera_id) {
    results = results.filter((e) => e.camera_id === params.camera_id);
  }
  if (params.event_type) {
    results = results.filter((e) => e.event_type === params.event_type);
  }
  if (params.from) {
    const fromMs = new Date(params.from).getTime();
    if (!Number.isNaN(fromMs)) {
      results = results.filter((e) => new Date(e.timestamp).getTime() >= fromMs);
    }
  }
  if (params.to) {
    const toMs = new Date(params.to).getTime();
    if (!Number.isNaN(toMs)) {
      results = results.filter((e) => new Date(e.timestamp).getTime() <= toMs);
    }
  }

  return results;
}

export function getEvents(params: GetEventsParams = {}): Promise<AnalyticsEvent[]> {
  const baseDate = parseDayStart(params.from);
  const events = generateEventsForDay(baseDate);
  return Promise.resolve(filterEvents(events, params));
}
