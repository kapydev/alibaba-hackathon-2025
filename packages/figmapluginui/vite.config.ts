// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// import tailwindcss from "@tailwindcss/vite";
// import appRoot from "app-root-path";
// import path from "path";

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [tailwindcss(), react()],
//   envDir: appRoot.path,
//   resolve: {
//     alias: {
//       "@": path.resolve(appRoot.path, "packages/shadcn/src"),
//     },
//   },
// });

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, Plugin, UserConfig } from "vite";
import requireTransform from "vite-plugin-require-transform";
import { viteSingleFile } from "vite-plugin-singlefile";
import fs from "fs/promises";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import path from "path";
import checker from "vite-plugin-checker";
import { fileURLToPath } from "url";
import appRoot from "app-root-path";
import dotenv from "dotenv";

const CUR_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = appRoot.path;
// Load environment variables from .env file
dotenv.config({ path: path.resolve(ROOT_DIR, ".env") });

const DEFINED_PROCESS_ENVS = Object.fromEntries(
  Object.entries({ ...process.env })
    .filter(([key, _]) => key.startsWith("VITE"))
    .flatMap(([key, val]) => {
      return [[`process.env.${key}`, JSON.stringify(val)]];
    })
);

const indexHtmlSpoofPlugin = (): Plugin => {
  let config: UserConfig;
  const getOutDirPath = (config: UserConfig, pathName: string) => {
    const relativeOutDir = config.build?.outDir;
    const rootDir = config.root;
    if (!rootDir) {
      throw new Error("MISSING_ROOT_DIR");
    }
    if (!relativeOutDir) {
      throw new Error("MISSING_OUTPUT_DIR");
    }
    const outDir = path.resolve(rootDir, relativeOutDir);
    const indexOutputPath = path.resolve(outDir, pathName);
    return { outDir, indexOutputPath };
  };

  const writeFile = async (
    path: string,
    contents: string,
    config: UserConfig
  ) => {
    const { outDir, indexOutputPath } = getOutDirPath(config, path);
    await fs.mkdir(outDir, { recursive: true });
    await fs.writeFile(indexOutputPath, contents);
  };

  return {
    name: "index-html-spoof-plugin",
    configResolved: async (resolvedConfig) => {
      config = resolvedConfig as any;
      const nonNullOriginSpoof = `<script>
          window.location.href = "${process.env.VITE_PLUGIN_URL}"
        </script>
        `;
      await writeFile("index-spoof.html", nonNullOriginSpoof, config);
      // await writeFile(
      //   "../deploy-manifest.json",
      //   JSON.stringify(DEPLOY_MANIFEST, undefined, 2),
      //   config
      // );
    },
    transformIndexHtml: {
      order: "post",
      handler(html) {
        return html;
      },
    },
    buildStart: () => {
      const attemptFetch = () => {
        //We need to try this fetch to do the inital file population
        fetch(process.env.NX_PLUGIN_URL!)
          .then((response) => {
            if (!response.ok) {
              setTimeout(attemptFetch, 200);
            }
          })
          .catch((error) => {
            setTimeout(attemptFetch, 200);
          });
      };

      attemptFetch();
    },
  };
};

async function hardRefreshPlugin() {
  const manifestLocation = path.join(ROOT_DIR, "manifest.json");
  const manifest = await fs.readFile(manifestLocation);
  //Temporary disable because it seems to be constantly refreshing the plugin incorrectly
  // await fs.writeFile(manifestLocation, manifest);
}

const handleHardRefreshPlugin = (): Plugin => {
  return {
    name: "hard-refresh-plugin",
    configureServer(server) {
      const noop = () => {};
      server.watcher.on("change", (file) => {
        if (file.includes("nodebox")) {
          hardRefreshPlugin();
        }
      });
      server.hot.addChannel({
        name: "handle-full-reload",
        send: (data: any) => {
          const fullReloadTypes = ["full-reload", "error"];
          if (!fullReloadTypes.includes(data.type)) return;
          hardRefreshPlugin();
        },
        on: noop,
        off: noop,
        listen: noop,
        close: noop,
      });
    },
  };
};

// const IGNORE_PACKAGES = [
//   "ai",
//   "ai-2",
//   "backend",
//   "backend-helpers",
//   "cli",
//   "contenx",
//   "nx-firejet",
//   "scrape-aidata",
//   "uied",
//   "engine-two/autofixer-deterministic",
//   "engine-two/scene-node-to-code-meta",
//   "engine-two/snapshot-comparison",
//   "engine-two/tests",
// ];
// const IGNORE_GLOBS = IGNORE_PACKAGES.map((pkg) => `**/packages/${pkg}/**`);

// // FIXME: for some reason just setting IGNORE_GLOBS on watch.ignored is not working
// const unwatchNonPluginFiles = (): Plugin => {
//   return {
//     name: "unwatch-non-plugin-files",
//     configureServer(server) {
//       // Ensure that the watcher unwatch the specific files or directories
//       server.watcher.unwatch(IGNORE_GLOBS);
//     },
//   };
// };

const finalConfig = defineConfig(({ command }) => {
  return {
    root: CUR_DIR,
    cacheDir: "../../../node_modules/.vite/packages/figma-plugin/ui",
    base: process.env.VITE_PLUGIN_URL,
    server: {
      port: process.env.VITE_PLUGIN_LOCAL_DEV_PORT,
      host: "localhost",
      warmup: {
        clientFiles: ["./src/App.tsx"],
      },
      // watch: {
      //   ignored: IGNORE_GLOBS,
      // },
    },
    define: { ...DEFINED_PROCESS_ENVS },
    resolve: {
      alias: {
        "@": path.resolve(appRoot.path, "packages/shadcn/src"),
        "@shared": path.resolve(appRoot.path, "packages/shared/src"),
      },
    },
    plugins: [
      nodePolyfills({
        include: ["path", "buffer", "crypto", "vm", "os", "assert", "util"],
      }),
      react(),
      requireTransform(),
      // command === "serve" &&
      //   checker({
      //     overlay: {
      //       position: "tr",
      //       panelStyle: `
      // 	left: 1rem;
      // 	bottom: 1rem;
      // 	width: calc(100vw - 2rem);
      // 	max-height: 90vh;
      // 	height: auto;
      // 	border-radius: 10px;
      // 	background: #450a0a55;
      //   backdrop-filter: blur(8px);
      // }`,
      //     },
      //     root: CUR_DIR,
      //     typescript: {
      //       tsconfigPath: "./tsconfig.app.json",
      //     },
      //   }),
      tailwindcss(),
      indexHtmlSpoofPlugin(),
      handleHardRefreshPlugin(),
      viteSingleFile(),
      // unwatchNonPluginFiles(),
    ],

    // Uncomment this if you are using workers.
    // worker: {
    //  plugins: [ nxViteTsPaths() ],
    // },
    build: {
      outDir: "./dist",
      minify: false,
      reportCompressedSize: true,
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name].js`,
          chunkFileNames: `assets/[name].js`,
          assetFileNames: `assets/[name].[ext]`,
        },
      },
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
  };
});

export default finalConfig;
