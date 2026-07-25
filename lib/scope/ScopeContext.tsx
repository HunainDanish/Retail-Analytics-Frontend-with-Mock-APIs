"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getOrganizations } from "@/lib/api/stores";
import { getStoreCameraIds } from "@/lib/scope/scope-filters";
import type {
  Organization,
  ScopeCamera,
  ScopeZone,
  Store,
} from "@/lib/types";

export type ScopeContextValue = {
  organizations: Organization[];
  isLoading: boolean;
  orgId: string;
  storeId: string | null;
  cameraId: string | null;
  zoneId: string | null;
  organization: Organization | null;
  store: Store | null;
  camera: ScopeCamera | null;
  zone: ScopeZone | null;
  storeCameraIds: string[];
  setOrgId: (id: string) => void;
  setStoreId: (id: string) => void;
  setCameraId: (id: string | null) => void;
  setZoneId: (id: string | null) => void;
};

const ScopeContext = createContext<ScopeContextValue | null>(null);

export function ScopeProvider({ children }: { children: ReactNode }) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orgId, setOrgIdState] = useState("");
  const [storeId, setStoreIdState] = useState<string | null>(null);
  const [cameraId, setCameraIdState] = useState<string | null>(null);
  const [zoneId, setZoneIdState] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const orgs = await getOrganizations();
      if (cancelled) return;

      setOrganizations(orgs);
      if (orgs.length > 0) {
        setOrgIdState(orgs[0].id);
        setStoreIdState(orgs[0].stores[0]?.id ?? null);
        setCameraIdState(null);
        setZoneIdState(null);
      }
      setIsLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const organization = useMemo(
    () => organizations.find((org) => org.id === orgId) ?? null,
    [organizations, orgId],
  );

  const store = useMemo(
    () => organization?.stores.find((item) => item.id === storeId) ?? null,
    [organization, storeId],
  );

  const camera = useMemo(
    () => store?.cameras.find((item) => item.id === cameraId) ?? null,
    [store, cameraId],
  );

  const zone = useMemo(
    () => camera?.zones.find((item) => item.id === zoneId) ?? null,
    [camera, zoneId],
  );

  const storeCameraIds = useMemo(() => getStoreCameraIds(store), [store]);

  const setOrgId = useCallback(
    (id: string) => {
      setOrgIdState(id);
      const nextOrg = organizations.find((org) => org.id === id) ?? null;
      setStoreIdState(nextOrg?.stores[0]?.id ?? null);
      setCameraIdState(null);
      setZoneIdState(null);
    },
    [organizations],
  );

  const setStoreId = useCallback((id: string) => {
    setStoreIdState(id);
    setCameraIdState(null);
    setZoneIdState(null);
  }, []);

  const setCameraId = useCallback((id: string | null) => {
    setCameraIdState(id);
    setZoneIdState(null);
  }, []);

  const setZoneId = useCallback((id: string | null) => {
    setZoneIdState(id);
  }, []);

  const value = useMemo<ScopeContextValue>(
    () => ({
      organizations,
      isLoading,
      orgId,
      storeId,
      cameraId,
      zoneId,
      organization,
      store,
      camera,
      zone,
      storeCameraIds,
      setOrgId,
      setStoreId,
      setCameraId,
      setZoneId,
    }),
    [
      organizations,
      isLoading,
      orgId,
      storeId,
      cameraId,
      zoneId,
      organization,
      store,
      camera,
      zone,
      storeCameraIds,
      setOrgId,
      setStoreId,
      setCameraId,
      setZoneId,
    ],
  );

  return (
    <ScopeContext.Provider value={value}>{children}</ScopeContext.Provider>
  );
}

export function useScope(): ScopeContextValue {
  const context = useContext(ScopeContext);
  if (!context) {
    throw new Error("useScope must be used within a ScopeProvider");
  }
  return context;
}
