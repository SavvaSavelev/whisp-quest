import { useEffect } from "react";
import { preloadAllTextures } from "../lib/preloadAllAssets";
import { useAssetsReadyStore } from "../store/useAssetsReadyStore";

export function useInitAssets() {
  const ready = useAssetsReadyStore((s) => s.ready);
  useEffect(() => {
    preloadAllTextures();
    useAssetsReadyStore.getState().setReady(true);
  }, []);
  return ready;
}
