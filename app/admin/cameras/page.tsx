'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { CameraTable } from '@/components/admin/camera-table';
import { CameraModal } from '@/components/admin/camera-modal';
import { TestCameraModal } from '@/components/admin/test-camera-modal';
import {
  createCamera,
  deleteCamera,
  getCameras,
  updateCamera,
} from '@/lib/api/cameras';
import type { AdminCamera } from '@/lib/types';

export default function AdminCamerasPage() {
  const [cameras, setCameras] = useState<AdminCamera[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCamera, setEditingCamera] = useState<AdminCamera | undefined>();
  const [showAddModal, setShowAddModal] = useState(false);
  const [testingCamera, setTestingCamera] = useState<AdminCamera | undefined>();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const data = await getCameras();
      if (!cancelled) {
        setCameras(data);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAddCamera = () => {
    setEditingCamera(undefined);
    setShowAddModal(true);
  };

  const handleEditCamera = (camera: AdminCamera) => {
    setEditingCamera(camera);
    setShowAddModal(true);
  };

  const handleSaveCamera = async (camera: AdminCamera) => {
    if (editingCamera) {
      const updated = await updateCamera(camera.id, camera);
      if (updated) {
        setCameras((prev) => prev.map((c) => (c.id === camera.id ? updated : c)));
      }
    } else {
      const created = await createCamera(camera);
      setCameras((prev) => [...prev, created]);
    }
    setShowAddModal(false);
  };

  const handleDeleteCamera = async (cameraId: string) => {
    if (confirm('Are you sure you want to delete this camera?')) {
      const removed = await deleteCamera(cameraId);
      if (removed) {
        setCameras((prev) => prev.filter((c) => c.id !== cameraId));
      }
    }
  };

  const handleToggleEnabled = async (cameraId: string, enabled: boolean) => {
    const updated = await updateCamera(cameraId, { enabled });
    if (updated) {
      setCameras((prev) =>
        prev.map((c) => (c.id === cameraId ? updated : c)),
      );
    }
  };

  const handleTestCamera = (camera: AdminCamera) => {
    setTestingCamera(camera);
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Cameras</h1>
            <p className="text-muted-foreground mt-1">Manage retail store cameras and analytics</p>
          </div>
          <button
            onClick={handleAddCamera}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Camera
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Cameras', value: loading ? '—' : cameras.length },
            {
              label: 'Online',
              value: loading ? '—' : cameras.filter((c) => c.status === 'online').length,
              className: 'text-green-600 dark:text-green-400',
            },
            {
              label: 'Offline',
              value: loading ? '—' : cameras.filter((c) => c.status === 'offline').length,
              className: 'text-red-600 dark:text-red-400',
            },
            {
              label: 'Errors',
              value: loading ? '—' : cameras.filter((c) => c.status === 'error').length,
              className: 'text-amber-600 dark:text-amber-400',
            },
          ].map((card) => (
            <div key={card.label} className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className={`text-2xl font-bold text-foreground ${card.className ?? ''}`}>
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block relative w-10 h-10 mb-3">
                <div className="absolute inset-0 border-4 border-transparent border-t-primary border-r-primary rounded-full animate-spin" />
              </div>
              <p className="text-sm text-muted-foreground">Loading cameras…</p>
            </div>
          </div>
        ) : (
          <CameraTable
            cameras={cameras}
            onEdit={handleEditCamera}
            onDelete={handleDeleteCamera}
            onToggleEnabled={handleToggleEnabled}
            onTestCamera={handleTestCamera}
          />
        )}
      </div>

      <CameraModal
        camera={editingCamera}
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveCamera}
      />
      <TestCameraModal
        camera={testingCamera}
        isOpen={!!testingCamera}
        onClose={() => setTestingCamera(undefined)}
      />
    </DashboardShell>
  );
}
