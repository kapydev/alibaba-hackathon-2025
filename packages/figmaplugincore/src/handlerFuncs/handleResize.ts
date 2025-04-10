import { MIN_WINDOW_WIDTH, MIN_WINDOW_HEIGHT } from "../constants";

export function handleResize(data: { w: number; h: number }) {
  const restrictedSize = {
    w: Math.max(data.w, MIN_WINDOW_WIDTH),
    h: Math.max(data.h, MIN_WINDOW_HEIGHT),
  };

  figma.ui.resize(restrictedSize.w, restrictedSize.h);
  figma.clientStorage.setAsync("size", restrictedSize).catch((err) => {});
}
