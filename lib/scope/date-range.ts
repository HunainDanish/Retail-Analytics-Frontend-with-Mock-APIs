import type { DateRangeKey } from "@/lib/types";

/** Maps an analytics DateRangeKey pill to ISO date strings for scoped API calls. */
export function dateRangeForKey(range: DateRangeKey): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to);

  switch (range) {
    case "hour":
      from.setHours(from.getHours() - 1);
      break;
    case "day":
      from.setDate(from.getDate() - 1);
      break;
    case "week":
      from.setDate(from.getDate() - 7);
      break;
    case "month":
      from.setDate(from.getDate() - 30);
      break;
    default:
      from.setDate(from.getDate() - 1);
  }

  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}
