export const EXPERIMENT_HISTORY_KEY = "evolex_experiment_history";

export type ExperimentHistoryRecord = {
  experimentId: string;
  concept?: string;
  opportunity?: string;
  audience?: string;
  format?: string;
  angle?: string;
  hypothesis?: string;
  hook?: string;
  value?: string;
  clarity?: string;
  confidence?: string;
  platform?: string;
  goal?: string;
  prePublishAnalysis?: string;
  postAnalysis?: string;
  metrics?: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    saves?: number;
    follows?: number;
    retention?: number;
  };
  engagementRate?: string | number;
  status: "in_progress" | "completed";
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  analyzedAt?: string;
  [key: string]: unknown;
};

function readHistory(): ExperimentHistoryRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(EXPERIMENT_HISTORY_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? (parsed.filter(
          (item): item is ExperimentHistoryRecord =>
            Boolean(item) &&
            typeof item === "object" &&
            typeof (item as ExperimentHistoryRecord).experimentId === "string",
        ))
      : [];
  } catch (error) {
    console.error("Could not read EVOLEX experiment history:", error);
    return [];
  }
}

/**
 * Inserts a new experiment or merges updates into the existing record with
 * the same experimentId. Existing post-publish metrics are preserved unless
 * the update explicitly supplies replacement values.
 */
export function upsertExperimentHistory(
  record: ExperimentHistoryRecord,
): ExperimentHistoryRecord[] {
  if (typeof window === "undefined") return [];

  const history = readHistory();
  const index = history.findIndex(
    (item) => item.experimentId === record.experimentId,
  );

  let next: ExperimentHistoryRecord[];

  if (index >= 0) {
    const previous = history[index];
    next = [...history];
    next[index] = {
      ...previous,
      ...record,
      metrics: {
        ...(previous.metrics ?? {}),
        ...(record.metrics ?? {}),
      },
      createdAt: previous.createdAt || record.createdAt,
      updatedAt: new Date().toISOString(),
    };
  } else {
    next = [
      {
        ...record,
        createdAt: record.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      ...history,
    ];
  }

  try {
    window.localStorage.setItem(EXPERIMENT_HISTORY_KEY, JSON.stringify(next));
    return next;
  } catch (error) {
    console.error("Could not save EVOLEX experiment history:", error);
    return history;
  }
}

export function getExperimentHistory(): ExperimentHistoryRecord[] {
  return readHistory();
}
