import OpenAI from "openai";
import { publicProcedure, router } from "../trpc";
import { openai } from "../ai/llm";

export const aiRouter = router({
  chat: publicProcedure
    .input((data: unknown) => {
      return data as {
        messages: OpenAI.ChatCompletionMessageParam[];
        stopSequences: string[];
      };
    })
    .mutation(async function* ({ input }) {
      console.log(input);
      try {
        const stream = await openai.chat.completions.create({
          model: "qwen-plus",
          messages: input.messages,
          stop: input.stopSequences,
          stream: true,
        });

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          process.stdout.write(content);
          yield { content };
        }
      } catch (error) {
        console.error(`Error in chat stream: ${error}`);
        yield { error: `Failed to generate response: ${error}` };
      }
    }),
});
