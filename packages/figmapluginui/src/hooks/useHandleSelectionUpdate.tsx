import { handleEvent, useEvent } from "../api/createEventListener";
import { ToolMessage } from "../messages/ToolMessage";
import { toolToToolString } from "../messages/tools";
import { chatStore } from "../stores/chatStore";
import type { updateSelectedLayers } from "@figmaplugincore-types/handlerFuncs/updateSelectedLayer";

export function useHandleSelectionUpdate() {
  useEvent(
    "updateSelectedLayers",
    (layers: Awaited<ReturnType<typeof updateSelectedLayers>>) => {
      const curMessages = chatStore.get("messages");
      while (true) {
        //Remove all current Figma node contents
        const latestMsg = curMessages.at(-1);
        if (
          latestMsg instanceof ToolMessage &&
          latestMsg.type === "USER_FIGMA_NODE_CONTENTS"
        ) {
          //Completely replace the message
          curMessages.pop();
          continue;
        }
        break;
      }
      chatStore.set("messages", [
        ...chatStore.get("messages"),
        ...layers.map(
          (layer) =>
            new ToolMessage(
              toolToToolString("USER_FIGMA_NODE_CONTENTS", {
                body: JSON.stringify(layer.json, undefined, 2),
                props: {
                  nodeName: layer.name,
                  nodeId: layer.id,
                },
              })
            )
        ),
      ]);
    }
  );
}
