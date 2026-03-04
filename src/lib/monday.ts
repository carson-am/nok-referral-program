const MONDAY_API_URL = process.env.MONDAY_API_URL ?? "https://api.monday.com/v2";
const MONDAY_API_TOKEN = process.env.MONDAY_API_KEY ?? process.env.MONDAY_API_TOKEN;

type FetchOptions = {
  query: string;
  variables?: Record<string, any>;
};

export function createMondayClient() {
  async function mondayFetch<T>({ query, variables }: FetchOptions): Promise<T | null> {
    if (!MONDAY_API_URL) {
      console.error("MONDAY_API_URL is not set; skipping Monday sync.");
      return null;
    }

    if (!MONDAY_API_TOKEN) {
      console.error("MONDAY_API_KEY/TOKEN is not set; skipping Monday sync.");
      return null;
    }

    const response = await fetch(MONDAY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: MONDAY_API_TOKEN,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Monday API error: ${response.status} ${text}`);
    }

    const json = (await response.json()) as { data?: T; errors?: Array<{ message?: string }> };

    if (json.errors && json.errors.length > 0) {
      throw new Error(json.errors.map((e) => e.message).join("; "));
    }

    return (json.data ?? null) as T | null;
  }

  return {
    mondayFetch,
  };
}

export type MondayStageKey =
  | "scheduling_initial_call"
  | "scheduling_demo"
  | "demo_scheduled"
  | "getting_3pl_rate_card"
  | "getting_refurb_lines_set"
  | "need_to_follow_up"
  | "on_hold"
  | "stuck"
  | "done";

export interface MondayItemBase {
  id: string;
  name: string;
  created_at?: string | null;
  statusLabel?: string | null;
}

function normalizeStatusLabel(label?: string | null): string {
  return (label ?? "").trim().toLowerCase();
}

export function getStageFromStatus(label?: string | null): MondayStageKey {
  const normalized = normalizeStatusLabel(label);

  // If there is no status yet, treat it as "Scheduling Initial Call"
  if (!normalized) return "scheduling_initial_call";

  if (normalized.includes("scheduling initial")) return "scheduling_initial_call";
  if (normalized.includes("scheduling demo")) return "scheduling_demo";
  if (normalized.includes("demo scheduled")) return "demo_scheduled";
  if (normalized.includes("3pl") || normalized.includes("rate card")) return "getting_3pl_rate_card";
  if (normalized.includes("refurb")) return "getting_refurb_lines_set";
  if (normalized.includes("follow up") || normalized.includes("follow-up"))
    return "need_to_follow_up";
  if (normalized.includes("on hold")) return "on_hold";
  if (normalized.includes("stuck")) return "stuck";
  if (normalized.includes("done") || normalized.includes("complete")) return "done";

  // Fallback for any unmapped label – treat as initial scheduling.
  return "scheduling_initial_call";
}

export function groupItemsByStage<T extends MondayItemBase>(
  items: T[]
): Record<MondayStageKey, T[]> {
  const result: Record<MondayStageKey, T[]> = {
    scheduling_initial_call: [],
    scheduling_demo: [],
    demo_scheduled: [],
    getting_3pl_rate_card: [],
    getting_refurb_lines_set: [],
    need_to_follow_up: [],
    on_hold: [],
    stuck: [],
    done: [],
  };

  for (const item of items) {
    const stage = getStageFromStatus(item.statusLabel);
    result[stage].push(item);
  }

  return result;
}

