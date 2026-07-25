import type { LiveCameraStatus } from "@/lib/types"
import { LIVE_CAMERA_STATUS_COLORS } from "@/lib/constants"

export function StatusBadge({ status }: { status: LiveCameraStatus }) {
  const config = LIVE_CAMERA_STATUS_COLORS[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} aria-hidden="true" />
      {config.label}
    </span>
  )
}
