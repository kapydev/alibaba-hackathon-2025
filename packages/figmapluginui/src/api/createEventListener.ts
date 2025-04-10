import { useEffect } from "react";

export function handleEvent<T = any>(
  eventType: string,
  handler: (data: T) => void,
  rejHandler?: (error: any) => void,
  reqId?: number
) {
  const controller = new AbortController();
  const signal = controller.signal;
  const handleResponseOnly = reqId !== undefined;

  const cleanup = () => {
    controller.abort();
  };
  /*eslint-disable no-restricted-globals*/
  addEventListener(
    "message",
    (e) => {
      if (e.data.pluginMessage === undefined) return;
      const { type, data, reqId: returnReqId, isErr } = e.data.pluginMessage;
      if (type !== eventType) return;
      if (reqId !== returnReqId && handleResponseOnly) return;
      if (isErr) {
        rejHandler?.(data);
      } else {
        handler(data);
      }
    },
    { signal }
  );

  return cleanup;
}

export function useEvent<T = any>(
  eventType: string,
  handler: (data: T) => void,
  dependencies?: Array<any>
) {
  useEffect(() => {
    const cleanup = handleEvent(eventType, handler);
    return cleanup;
  }, dependencies);
}
