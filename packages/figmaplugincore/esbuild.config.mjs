import * as esbuild from "esbuild";
import { spawn } from "child_process";
import dotenv from "dotenv";
import appRoot from "app-root-path";
import path from "path";

const env = dotenv.config({
  path: path.resolve(appRoot.path, ".env"),
});

const DEFINED_PROCESS_ENVS = {};

Object.entries(env.parsed ?? {}).forEach(([key, val]) => {
  DEFINED_PROCESS_ENVS[`process.env.${key}`] = JSON.stringify(val);
});

const runAfterBuildPlugin = {
  name: "run-after-build",
  setup(build) {
    build.onEnd(() => {
      console.log("Build complete!");
    });
  },
};

const buildOptions = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "browser",
  target: ["es2018"],
  format: "cjs",
  outfile: "dist/main.cjs",
  define: DEFINED_PROCESS_ENVS,
  plugins: [runAfterBuildPlugin],
};

const command = process.argv[2];

if (command === "dev") {
  const ctx = await esbuild.context({
    ...buildOptions,
  });
  await ctx.watch();
  console.log("Watching for changes...");
} else if (command === "build") {
  await esbuild.build({
    ...buildOptions,
    minify: true,
  });
  console.log("Build completed successfully!");
} else {
  console.error("Please specify either 'dev' or 'build' command");
  process.exit(1);
}
