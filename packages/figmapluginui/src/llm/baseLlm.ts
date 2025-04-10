import { RawMessage } from "@types";

export abstract class LLM {
  protected maxTokens: number;

  constructor() {
    this.maxTokens = 4096;
  }

  abstract prompt(
    messages: RawMessage[],
    stopSequences: string[]
  ): AsyncIterable<string>;
}
