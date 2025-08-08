import { useCallback, useState } from "react";
import { apiClient } from "../lib/APIClient";
import type { AIMissionRequest, AIMissionResponse } from "../lib/types";

export function useAIMission() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AIMissionResponse | null>(null);

  const runMission = useCallback(async (payload: AIMissionRequest) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.runAIMission(payload);
      setResult(res);
      return res;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Mission failed";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { runMission, loading, error, result };
}
