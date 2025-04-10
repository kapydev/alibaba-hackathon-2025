import { RawMessage } from "@types";
import { LLM } from "./baseLlm";
import { trpc } from "../trpc/trpc";

export class Qwen extends LLM {
  async *prompt(
    messages: RawMessage[],
    stopSequences: string[]
  ): AsyncIterable<string> {
    const stream = await trpc.ai.chat.mutate({ messages, stopSequences });
    for await (const chunk of stream) {
      if ("error" in chunk) break;
      yield chunk.content;
    }
  }
}
