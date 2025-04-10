import type { PluginCoreHandlers } from "@figmaplugincore-types/messaging/pluginCoreHandlers";
import { handleEvent } from "./createEventListener";

// type PluginCoreHandlers = any;

let reqId = 0;

export function makeDropDataPopulater(
  dropEventName: string,
  dropEventData: object
) {
  return (e: React.DragEvent<Element> | undefined) => {
    e?.dataTransfer.setData(
      `fj_drop/${dropEventName}`,
      JSON.stringify(dropEventData)
    );
  };
}

export async function sendMidEnd<
  Type extends keyof PluginCoreHandlers,
  Data extends Parameters<PluginCoreHandlers[Type]>
>(type: Type, ...data: Data) {
  reqId += 1;

  console.log("SENDING MIDEND", type, data);

  parent.postMessage(
    {
      pluginMessage: {
        type,
        data: data[0],
        reqId,
      },
      //TODO: Should probably not hard code this but I think it won't change
      pluginId: "1492040236290118921",
    },
    "*"
  );

  let res: (data: any /*ReturnType<PluginCoreHandlers[Type]>*/) => void;
  let rej; //TODO: Handle rejections, just like in real life

  const result = new Promise<ReturnType<PluginCoreHandlers[Type]>>(
    (resolve, reject) => {
      res = resolve;
      rej = reject;
    }
  );

  const cleanup = handleEvent(
    type as string,
    (data) => {
      cleanup();
      res(data);
    },
    rej,
    reqId
  );

  return result;
}

// import { handleEvent } from './create-event-listener';

// let reqId = 0;

// export async function sendMidEnd<
//   Type extends keyof PluginCoreHandlers,
//   Data extends Parameters<PluginCoreHandlers[Type]>
// >(type: Type, ...params: Data) {
//   reqId += 1;

//   parent.postMessage(
//     {
//       pluginMessage: {
//         type,
//         data: params[0],
//         reqId,
//       },
//     },
//     '*'
//   );

//   let res: (data: ReturnType<PluginCoreHandlers[Type]>) => void;
//   let rej; //TODO: Handle rejections, just like in real life

//   const result = new Promise<ReturnType<PluginCoreHandlers[Type]>>(
//     (resolve, reject) => {
//       res = resolve;
//       rej = reject;
//     }
//   );

//   const cleanup = handleEvent(
//     type,
//     (data) => {
//       cleanup();
//       res(data);
//     },
//     reqId
//   );

//   return result;
// }
