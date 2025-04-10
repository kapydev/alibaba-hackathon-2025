import OpenAI from "openai";
import { CustomMessage } from "../messages/Messages";
import { TOOL_RENDER_TEMPLATES, ToolType } from "../messages/tools";
import { SystemPromptMessage } from "../messages/SystemPromptMessage";
import { ToolMessage } from "../messages/ToolMessage";

export type Message = OpenAI.ChatCompletionMessageParam;
export type MessageWithID = { id: string; content: string } & Message;

export type MessageItemProps = {
  message: MessageWithID;
};

export function MessageItem<T extends ToolType>({
  message,
}: {
  message: ToolMessage<T>;
}) {
  if (!message.type) return <></>;

  const renderTemplate = TOOL_RENDER_TEMPLATES[message.type];
  const messageClasses = `max-w-[80%] rounded-lg px-4 py-2 ${
    message.role === "user"
      ? "bg-primary text-primary-foreground"
      : message.role === "system"
      ? "bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
      : "bg-background dark:bg-background/50" // Assistant message
  }`;

  return (
    <div
      className={`flex ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div className={messageClasses}>{renderTemplate.body(message)}</div>
    </div>
  );
}
