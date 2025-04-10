import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import appRoot from "app-root-path";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  envDir: appRoot.path,
  resolve: {
    alias: {
      "@": path.resolve(appRoot.path, "packages/shadcn/src"),
    },
  },
});
