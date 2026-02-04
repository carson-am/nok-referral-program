const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffMs < TWENTY_FOUR_HOURS_MS) {
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    return `${diffHours}h ago`;
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
