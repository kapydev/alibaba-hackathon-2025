import { createTRPCClient, httpBatchStreamLink } from "@trpc/client";
import type { AppRouter } from "@backend";
//     👆 **type-only** import
// Pass AppRouter as generic here. 👇 This lets the `trpc` object know
// what procedures are available on the server and their input/output types.
export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchStreamLink({
      url: "http://localhost:3000",
    }),
  ],
});
