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

/**
 * Tehcnically not a config file, its named like this to make it look nicer
 */

let nodeProcess;

const runAfterBuildPlugin = {
  name: "run-after-build",
  setup(build) {
    build.onEnd(() => {
      if (nodeProcess) nodeProcess.kill();
      nodeProcess = spawn("node", ["dist/main.js"], {
        stdio: "inherit",
      });
    });
  },
};

const buildOptions = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  target: ["node20.14.0"],
  outfile: "dist/main.js",
  define: DEFINED_PROCESS_ENVS,
};

const command = process.argv[2];

if (command === "dev") {
  const ctx = await esbuild.context({
    ...buildOptions,
    plugins: [runAfterBuildPlugin],
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
