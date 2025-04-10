import OpenAI from "openai";
import { publicProcedure, router } from "../trpc";
import { openai } from "../ai/llm";

export const aiRouter = router({
  chat: publicProcedure
    .input((val: unknown) => {
      if (!Array.isArray(val)) {
        throw new Error("Input must be an array of messages");
      }
      return val as OpenAI.ChatCompletionMessageParam[];
    })
    .mutation(async function* ({ input }) {
      console.log(input);
      try {
        const stream = await openai.chat.completions.create({
          model: "qwen-plus",
          messages: input,
          stream: true,
        });

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          yield { content };
        }
      } catch (error) {
        console.error(`Error in chat stream: ${error}`);
        yield { error: `Failed to generate response: ${error}` };
      }
    }),
});
