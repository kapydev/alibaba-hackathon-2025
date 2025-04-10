import { PluginCoreHandlers, pluginCoreHandlers } from "./pluginCoreHandlers";

interface Message<K = string> {
  type: K;
  data: any;
  reqId: number;
}

export function startPluginHandlers() {
  figma.ui.onmessage = async <K extends keyof PluginCoreHandlers>(
    msg: Message<K>
  ) => {
    //This condition is because we are using the enterprise API
    //See https://www.firejet.io/docs/enterprise/api-documentation#things-to-note
    if ("firejetMessage" in msg) return;
    let result: any;
    let isErr = false;
    try {
      result = await pluginCoreHandlers[msg.type](msg.data);
    } catch (e) {
      result = e;
      isErr = true;
      console.error(e);
    }
    sendFrontend(msg.type, result, msg.reqId, isErr);
  };
}

export function handleEventOnce(type: string, handler: (data: any) => void) {
  const listener = (msg: Message) => {
    if (msg.type !== type) return;
    handler(msg.data);
    figma.ui.off("message", listener);
  };

  figma.ui.on("message", listener);
}

export function sendFrontend(
  type: string,
  data?: any,
  reqId?: number,
  isErr?: boolean
) {
  const payload: Record<string, any> = {
    type,
  };

  if (data !== undefined) {
    payload.data = data;
  }

  if (reqId !== undefined) {
    payload.reqId = reqId;
  }

  if (isErr) {
    payload.isErr = true;
  } else {
    payload.isErr = false;
  }

  figma.ui.postMessage(payload);
}
