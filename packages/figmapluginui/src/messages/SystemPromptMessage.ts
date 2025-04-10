import { RawMessage } from "@types";
import { BaseMessage } from "./BaseMessage";
import { TOOL_TEMPLATES, toolToLLMDescription } from "./tools";

export class SystemPromptMessage extends BaseMessage {
  role: "user" | "assistant" | "system" = "system";
  prompt: string;

  constructor() {
    super();
    this.prompt = [
      this.addTitle("PERSONA", this.getPersona()),
      this.addTitle("TOOL TUTORIAL", this.getToolTutorial()),
    ].join("\n\n");
  }

  getPersona(): string {
    return `You are an senior uiux designer. Keep your answers concise. If the user asks for changes to be made to their design, the changes NEED to be in the appropriate tool blocks so their design can be updated. DO NOT use backticks AT ALL.`;
  }

  getToolTutorial(): string {
    return [
      `There are several tools available to you to use where necessary.

CRITICAL RULES - MUST BE FOLLOWED AT ALL TIMES:

1. The entire conversation should be in tools. This is very important because the UI the user sees is parsed from tool blocks, so the formatting must be correct.
2. You are ONLY allowed to use tools labelled 'assistant'. The other tools are for the user to respond to your query.
3. Strictly follow the tool formats an examples. Take note of where there are spaces, and where there are underscores.

Below are the tools available to you and instructions on how to use them.`,
      ...Object.entries(TOOL_TEMPLATES)
        .filter(([_, template]) => !("DISABLED" in template))
        .map(([toolName, toolTemplate]) =>
          toolToLLMDescription(toolName as any, toolTemplate)
        ),
    ].join("\n\n");
  }

  toRawMessages(): RawMessage[] {
    return [
      {
        role: "system",
        content: this.prompt,
      },
    ];
  }
}
