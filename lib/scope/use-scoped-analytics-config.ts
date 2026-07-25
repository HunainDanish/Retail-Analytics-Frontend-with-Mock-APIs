"use client";

import { useMemo } from "react";

import {
  fetchDwellTimeData,
  fetchDwellTimeStats,
  fetchIntervalLabel,
  fetchOccupancyData,
  fetchOccupancyStats,
  fetchQueuesData,
  fetchQueuesStats,
  fetchTrafficData,
  fetchTrafficStats,
  fetchZonesData,
  fetchZonesStats,
  getDwell,
  getOccupancy,
  getQueues,
  getTraffic,
  getZones,
} from "@/lib/api/analytics";
import { dateRangeForKey } from "@/lib/scope/date-range";
import {
  resolveZoneId,
  scaleDataRows,
  scaleStatSummaries,
  scopeScaleFactor,
} from "@/lib/scope/scope-filters";
import { useScope } from "@/lib/scope/ScopeContext";
import type { AnalyticsPageConfig } from "@/lib/types";

type ScopedAnalyticsKind = "traffic" | "occupancy" | "zones" | "dwell" | "queues";

type ScopedAnalyticsBase = Omit<
  AnalyticsPageConfig,
  "getData" | "getStats" | "getIntervalLabel"
> & {
  getIntervalLabel?: AnalyticsPageConfig["getIntervalLabel"];
};

function useScopedAnalyticsConfig(
  kind: ScopedAnalyticsKind,
  base: ScopedAnalyticsBase,
): AnalyticsPageConfig {
  const { storeId, cameraId, zoneId, camera, store } = useScope();

  return useMemo(() => {
    const scaleId = zoneId ?? cameraId ?? storeId;
    const factor = scopeScaleFactor(scaleId);
    const resolvedZoneId = resolveZoneId(zoneId, camera, store);

    const getData: AnalyticsPageConfig["getData"] = async (range) => {
      const { from, to } = dateRangeForKey(range);

      switch (kind) {
        case "traffic": {
          if (!storeId) return fetchTrafficData(range);
          const rows = await getTraffic({ store_id: storeId, from, to });
          return scaleDataRows(rows, factor);
        }
        case "occupancy": {
          if (!storeId && !cameraId) return fetchOccupancyData(range);
          const rows = await getOccupancy({
            store_id: storeId ?? undefined,
            camera_id: cameraId ?? undefined,
          });
          return scaleDataRows(rows, factor);
        }
        case "zones": {
          if (!zoneId && !storeId) return fetchZonesData(range);
          const result = await getZones({
            zone_id: resolvedZoneId,
            from,
            to,
          });
          return scaleDataRows(result.rows, factor);
        }
        case "dwell": {
          if (!zoneId && !storeId) return fetchDwellTimeData(range);
          const rows = await getDwell({
            zone_id: resolvedZoneId,
            from,
            to,
          });
          return scaleDataRows(rows, factor);
        }
        case "queues": {
          if (!zoneId && !storeId) return fetchQueuesData(range);
          const rows = await getQueues({
            zone_id: resolvedZoneId,
            from,
            to,
          });
          return scaleDataRows(rows, factor);
        }
      }
    };

    const getStats: AnalyticsPageConfig["getStats"] = async (range) => {
      switch (kind) {
        case "traffic":
          return storeId
            ? scaleStatSummaries(await fetchTrafficStats(range), factor)
            : fetchTrafficStats(range);
        case "occupancy":
          return storeId || cameraId
            ? scaleStatSummaries(await fetchOccupancyStats(range), factor)
            : fetchOccupancyStats(range);
        case "zones":
          return zoneId || storeId
            ? scaleStatSummaries(await fetchZonesStats(range), factor)
            : fetchZonesStats(range);
        case "dwell":
          return zoneId || storeId
            ? scaleStatSummaries(await fetchDwellTimeStats(range), factor)
            : fetchDwellTimeStats(range);
        case "queues":
          return zoneId || storeId
            ? scaleStatSummaries(await fetchQueuesStats(range), factor)
            : fetchQueuesStats(range);
      }
    };

    return {
      ...base,
      getData,
      getStats,
      getIntervalLabel: base.getIntervalLabel ?? fetchIntervalLabel,
    };
  }, [kind, base, storeId, cameraId, zoneId, camera, store]);
}

export function useTrafficAnalyticsConfig(): AnalyticsPageConfig {
  return useScopedAnalyticsConfig("traffic", {
    title: "Traffic",
    description: "Visitor counts across the selected time period.",
    metricLabel: "Visitors",
    chartType: "bar",
    currentSeriesLabel: "Current period",
    priorSeriesLabel: "Prior period",
  });
}

export function useOccupancyAnalyticsConfig(): AnalyticsPageConfig {
  return useScopedAnalyticsConfig("occupancy", {
    title: "Occupancy",
    description: "Space occupancy percentage across the selected time period.",
    metricLabel: "Occupancy %",
    chartType: "line",
    currentSeriesLabel: "Current period",
    priorSeriesLabel: "Prior period",
  });
}

export function useZonesAnalyticsConfig(): AnalyticsPageConfig {
  return useScopedAnalyticsConfig("zones", {
    title: "Zones",
    description: "Visitor distribution across facility zones.",
    metricLabel: "Visitors",
    chartType: "bar",
    getIntervalLabel: () => "Zone",
    currentSeriesLabel: "Current period",
    priorSeriesLabel: "Prior period",
  });
}

export function useDwellAnalyticsConfig(): AnalyticsPageConfig {
  return useScopedAnalyticsConfig("dwell", {
    title: "Dwell Time",
    description: "Distribution of visitor dwell times across duration buckets.",
    metricLabel: "Visitors",
    chartType: "bar",
    getIntervalLabel: () => "Duration",
    currentSeriesLabel: "Current period",
    priorSeriesLabel: "Prior period",
  });
}

export function useQueuesAnalyticsConfig(): AnalyticsPageConfig {
  return useScopedAnalyticsConfig("queues", {
    title: "Queues",
    description: "Queue length trends across the selected time period.",
    metricLabel: "Queue Length",
    chartType: "line",
    currentSeriesLabel: "Current period",
    priorSeriesLabel: "Prior period",
  });
}
