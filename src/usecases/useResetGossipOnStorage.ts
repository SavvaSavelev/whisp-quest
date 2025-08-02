import { useEffect } from "react";
import { useSpiritGossipStore } from "../store/useSpiritGossipStore";

export function useResetGossipOnStorage(showStorage: boolean) {
  const setGossip = useSpiritGossipStore((s) => s.setGossip);
  useEffect(() => {
    if (showStorage) {
      setGossip(null);
    }
  }, [showStorage, setGossip]);
}
