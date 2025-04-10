import { publicProcedure, router } from "./trpc";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import cors from "cors";
import { openai } from "./ai/llm";
import { aiRouter } from "./routers/llm";

const appRouter = router({
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;

const server = createHTTPServer({
  middleware: cors(),
  router: appRouter,
});

server.listen(3000);
console.log("SERVER RUNNING ON 3000");
