import path from "path";
import appRoot from "app-root-path";

console.log("NDOIWQNDOIWQNOIDWQNQ");

export default {
  content: [
    path.join(appRoot.path, "packages/**/*.{js,ts,jsx,tsx}"),
    // or relative paths like:
    // "../../packages/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
