import { useCallback, useEffect, useRef, useState } from "react";
import { spiritChatStream } from "../lib/api";
import type { SpiritChatRequest } from "../lib/types";

/**
 * Хук для стриминга ответа духа (SSE-like через POST).
 * Возвращает: text (накапливается), isStreaming, error, start(payload), cancel()
 */
export function useChatStream() {
  const [text, setText] = useState("");
  const [isStreaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreaming(false);
  }, []);

  const start = useCallback(
    async (payload: SpiritChatRequest) => {
      setText("");
      setError(null);
      setStreaming(true);

      const ctrl = new AbortController();
      abortRef.current = ctrl;

      try {
        const res = await spiritChatStream(payload, { signal: ctrl.signal });

        // парсим text/event-stream
        const reader = res.body!.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        const flush = () => {
          // делим по пустой строке между событиями
          let idx: number;
          while ((idx = buffer.indexOf("\n\n")) !== -1) {
            const raw = buffer.slice(0, idx).trim();
            buffer = buffer.slice(idx + 2);
            if (!raw) continue;

            // поддержим multi-line data:
            let event = "message";
            const dataLines: string[] = [];
            for (const line of raw.split("\n")) {
              if (line.startsWith("event:")) event = line.slice(6).trim();
              else if (line.startsWith("data:"))
                dataLines.push(line.slice(5).trim());
            }
            const dataStr = dataLines.join("\n") || "";

            if (event === "end") {
              cancel();
              return;
            }
            if (event === "error") {
              setError(dataStr || "stream_error");
              cancel();
              return;
            }
            if (dataStr) {
              try {
                const json = JSON.parse(dataStr);
                if (typeof json.delta === "string") {
                  setText((prev) => prev + json.delta);
                }
              } catch {
                // иногда может прилететь сырой текст
                setText((prev) => prev + dataStr);
              }
            }
          }
        };

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          flush();
        }
        // финальный flush (если сервер закрыл без event:end)
        flush();
        setStreaming(false);
      } catch (e: unknown) {
        if ((e as Error)?.name === "AbortError") return; // отменили — и тишина
        setError((e as Error)?.message || "stream_failed");
        setStreaming(false);
      } finally {
        abortRef.current = null;
      }
    },
    [cancel]
  );

  // автоклин при размонтировании
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    text,
    isStreaming,
    error,
    start,
    cancel,
    setText,
  };
}
