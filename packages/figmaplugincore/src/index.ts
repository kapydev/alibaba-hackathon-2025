// import { publicProcedure, router } from "./trpc";
// import { createHTTPServer } from "@trpc/server/adapters/standalone";
// import cors from "cors";
// import { openai } from "./ai/llm";

import { startPluginHandlers } from "./messaging";

// import { aiRouter } from "./routers/llm";
startPluginHandlers()
console.log("HELLO WORLDdd");
figma.showUI(__html__, { width: 800, height: 600 });

// const appRouter = router({
//   ai: aiRouter,
// });

// export type AppRouter = typeof appRouter;

// const server = createHTTPServer({
//   middleware: cors(),
//   router: appRouter,
// });

// server.listen(3000);
// console.log("SERVER RUNNING ON 3000");
