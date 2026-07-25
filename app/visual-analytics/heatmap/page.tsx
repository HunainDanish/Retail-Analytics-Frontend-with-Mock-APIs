'use client';

import { useEffect, useMemo, useState } from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { HeatmapCanvas } from '@/components/heatmap/heatmap-canvas';
import { HeatmapControls } from '@/components/heatmap/heatmap-controls';
import { HeatmapLegend } from '@/components/heatmap/heatmap-legend';
import { ZonePerformance } from '@/components/heatmap/zone-performance';
import {
  getHeatmap,
  getHeatmapCameras,
  getZonePerformance,
} from '@/lib/api/analytics';
import {
  filterHeatmapCameras,
  resolveEffectiveCameraId,
} from '@/lib/scope/scope-filters';
import { useScope } from '@/lib/scope/ScopeContext';
import type { FloorZone, HeatBlob, HeatmapCamera, ZoneRow } from '@/lib/types';

export default function HeatmapPage() {
  const { storeId, cameraId, zoneId, storeCameraIds } = useScope();
  const today = new Date().toISOString().slice(0, 10);

  const [allCameras, setAllCameras] = useState<HeatmapCamera[]>([]);
  const [zoneRows, setZoneRows] = useState<ZoneRow[]>([]);
  const [pageCamera, setPageCamera] = useState('');
  const [date, setDate] = useState(today);
  const [timeFrom, setTimeFrom] = useState('09:00');
  const [timeTo, setTimeTo] = useState('18:00');
  const [opacity, setOpacity] = useState(0.72);
  const [blobs, setBlobs] = useState<HeatBlob[]>([]);
  const [floorZones, setFloorZones] = useState<FloorZone[]>([]);
  const [loading, setLoading] = useState(true);

  const scopedCameras = useMemo(
    () => filterHeatmapCameras(allCameras, cameraId, storeCameraIds),
    [allCameras, cameraId, storeCameraIds],
  );

  const allowedCameraIds = useMemo(
    () => scopedCameras.map((camera) => camera.id),
    [scopedCameras],
  );

  const effectiveCamera = useMemo(
    () =>
      resolveEffectiveCameraId(
        cameraId,
        pageCamera || null,
        allowedCameraIds,
      ),
    [cameraId, pageCamera, allowedCameraIds],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadMeta() {
      const [cameraList, performance] = await Promise.all([
        getHeatmapCameras(),
        getZonePerformance({
          store_id: storeId ?? undefined,
          zone_id: zoneId ?? undefined,
        }),
      ]);
      if (!cancelled) {
        setAllCameras(cameraList);
        setZoneRows(performance);
      }
    }

    loadMeta();
    return () => {
      cancelled = true;
    };
  }, [storeId, zoneId]);

  useEffect(() => {
    if (!effectiveCamera) return;

    let cancelled = false;

    async function loadHeatmap() {
      setLoading(true);
      const result = await getHeatmap({
        camera_id: effectiveCamera,
        date,
        from_time: timeFrom,
        to_time: timeTo,
      });
      if (!cancelled) {
        setBlobs(result.blobs);
        setFloorZones(result.floor_zones);
        setLoading(false);
      }
    }

    loadHeatmap();
    return () => {
      cancelled = true;
    };
  }, [effectiveCamera, date, timeFrom, timeTo]);

  return (
    <DashboardShell>
      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground text-balance">Store Heatmap</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Visitor density across the floor plan — select a camera, date, and time range.
            </p>
          </div>
          <div className="shrink-0 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            Updated just now
          </div>
        </div>

        <HeatmapControls
          cameras={scopedCameras}
          selectedCamera={effectiveCamera}
          onCameraChange={setPageCamera}
          date={date}
          onDateChange={setDate}
          timeFrom={timeFrom}
          onTimeFromChange={setTimeFrom}
          timeTo={timeTo}
          onTimeToChange={setTimeTo}
          opacity={opacity}
          onOpacityChange={setOpacity}
        />

        {loading ? (
          <div className="flex aspect-[16/9] items-center justify-center rounded-lg border border-border bg-card">
            <div className="text-center">
              <div className="inline-block relative w-10 h-10 mb-3">
                <div className="absolute inset-0 border-4 border-transparent border-t-primary border-r-primary rounded-full animate-spin" />
              </div>
              <p className="text-sm text-muted-foreground">Loading heatmap…</p>
            </div>
          </div>
        ) : (
          <HeatmapCanvas blobs={blobs} zones={floorZones} opacity={opacity} />
        )}

        <HeatmapLegend />

        <ZonePerformance rows={zoneRows} />
      </div>
    </DashboardShell>
  );
}
