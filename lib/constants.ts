import type {
  AlertSeverity,
  AlertStatus,
  CameraStatus,
  LiveCameraStatus,
  UserStatus,
} from "@/lib/types";

// ─── Alert severity ────────────────────────────────────────────────────────────

export type SeverityColorTokens = {
  hex: string;
  badge: string;
  dot: string;
};

export const SEVERITY_COLORS: Record<AlertSeverity, SeverityColorTokens> = {
  critical: {
    hex: "#ff4444",
    badge: "bg-red-900/20 text-red-400 border-red-800",
    dot: "bg-red-500",
  },
  warning: {
    hex: "#fbbf24",
    badge: "bg-amber-900/20 text-amber-400 border-amber-800",
    dot: "bg-amber-500",
  },
  info: {
    hex: "#3b82f6",
    badge: "bg-blue-900/20 text-blue-400 border-blue-800",
    dot: "bg-blue-500",
  },
};

// ─── Status colors (keyed by domain union types) ───────────────────────────────

export const ALERT_STATUS_COLORS: Record<AlertStatus, string> = {
  open: "bg-gray-800/40 text-gray-300 border-gray-700",
  acknowledged: "bg-blue-900/20 text-blue-400 border-blue-800",
  resolved: "bg-green-900/20 text-green-400 border-green-800",
};

export type LiveCameraStatusTokens = {
  label: string;
  dot: string;
  text: string;
  bg: string;
};

export const LIVE_CAMERA_STATUS_COLORS: Record<
  LiveCameraStatus,
  LiveCameraStatusTokens
> = {
  online: {
    label: "Online",
    dot: "bg-green-500",
    text: "text-green-700 dark:text-green-400",
    bg: "bg-green-500/10",
  },
  offline: {
    label: "Offline",
    dot: "bg-muted-foreground",
    text: "text-muted-foreground",
    bg: "bg-muted",
  },
  error: {
    label: "Error",
    dot: "bg-red-500",
    text: "text-red-700 dark:text-red-400",
    bg: "bg-red-500/10",
  },
};

export const CAMERA_STATUS_COLORS: Record<CameraStatus, string> = {
  online: "bg-green-500/10 text-green-700 dark:text-green-400",
  offline: "bg-red-500/10 text-red-700 dark:text-red-400",
  error: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  disabled: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
};

export const USER_STATUS_COLORS: Record<UserStatus, string> = {
  Active: "bg-green-500/10 text-green-700 dark:text-green-400",
  Disabled: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
};

/** Grouped status color maps keyed by their domain union types. */
export const STATUS_COLORS = {
  alert: ALERT_STATUS_COLORS,
  camera: CAMERA_STATUS_COLORS,
  liveCamera: LIVE_CAMERA_STATUS_COLORS,
  user: USER_STATUS_COLORS,
} as const;

/** Shared positive/negative action styling used by admin tables. */
export const ACTION_STATUS_COLORS = {
  positive: "hover:bg-green-500/10 text-green-600 dark:text-green-400",
  negative: "hover:bg-red-500/10 text-red-600 dark:text-red-400",
  positiveIcon: "text-green-500",
  negativeIcon: "text-red-500",
  negativePanel: "bg-red-500/10 border border-red-500/20",
} as const;

// ─── Zone Performance occupancy thresholds ───────────────────────────────────

/** Percentage breakpoints used by occupancy bar coloring in Zone Performance. */
export const OCCUPANCY_THRESHOLDS = {
  high: 75,
  medium: 50,
  low: 30,
} as const;

export const OCCUPANCY_THRESHOLD_COLORS = {
  high: "#ef4444",
  medium: "#f97316",
  elevated: "#38bdf8",
  low: "#3b82f6",
} as const;

export function getOccupancyThresholdColor(value: number): string {
  if (value >= OCCUPANCY_THRESHOLDS.high) return OCCUPANCY_THRESHOLD_COLORS.high;
  if (value >= OCCUPANCY_THRESHOLDS.medium) return OCCUPANCY_THRESHOLD_COLORS.medium;
  if (value >= OCCUPANCY_THRESHOLDS.low) return OCCUPANCY_THRESHOLD_COLORS.elevated;
  return OCCUPANCY_THRESHOLD_COLORS.low;
}

export function getRatioThresholdColor(ratio: number): string {
  if (ratio >= 0.75) return OCCUPANCY_THRESHOLD_COLORS.high;
  if (ratio >= 0.5) return OCCUPANCY_THRESHOLD_COLORS.medium;
  if (ratio >= 0.3) return OCCUPANCY_THRESHOLD_COLORS.elevated;
  return OCCUPANCY_THRESHOLD_COLORS.low;
}
