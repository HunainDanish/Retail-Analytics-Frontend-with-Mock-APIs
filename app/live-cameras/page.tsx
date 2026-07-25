'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { CameraTile } from '@/components/cameras/camera-tile';
import { getLiveCameras } from '@/lib/api/cameras';
import { filterLiveCameras } from '@/lib/scope/scope-filters';
import { useScope } from '@/lib/scope/ScopeContext';
import type { Camera } from '@/lib/types';

export default function LiveCamerasPage() {
  const { cameraId, storeCameraIds } = useScope();
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const data = await getLiveCameras();
      if (!cancelled) {
        setCameras(filterLiveCameras(data, cameraId, storeCameraIds));
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [cameraId, storeCameraIds]);

  const onlineCount = cameras.filter((c) => c.status === 'online').length;

  return (
    <DashboardShell>
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Live Cameras
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Real-time detection feeds across the selected scope.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            {loading ? (
              <span className="inline-block h-4 w-24 animate-pulse rounded bg-muted" />
            ) : (
              <>
                <span className="font-medium text-foreground">{onlineCount}</span> /{' '}
                {cameras.length} online
              </>
            )}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-video animate-pulse rounded-lg border border-border bg-muted"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {cameras.map((camera) => (
              <CameraTile key={camera.id} camera={camera} />
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
