import OpenAI from "openai";
import {
  NON_RENDERED_TOOLS,
  TOOL_RENDER_TEMPLATES,
  ToolType,
} from "../messages/tools";
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
  if (!message.type || NON_RENDERED_TOOLS.includes(message.type)) return <></>;

  const renderTemplate = TOOL_RENDER_TEMPLATES[message.type];
  const messageClasses = `max-w-[80%] rounded-lg px-4 py-2 shadow-sm ${
    message.role === "user"
      ? "bg-primary text-primary-foreground ml-auto"
      : message.role === "system"
      ? "bg-muted text-muted-foreground text-xs italic mx-auto my-2"
      : "bg-card text-card-foreground dark:bg-secondary"
  }`;

  const alignmentClass = message.role === "user" ? "justify-end" : "justify-start";
  if (message.role === 'system') {
      return (
         <div className="flex justify-center my-2">
             <div className={messageClasses}>
                 {renderTemplate.body(message)}
             </div>
         </div>
      )
  }

  return (
    <div
      className={`flex ${alignmentClass} my-1`}
    >
      <div className={messageClasses}>
        {/* <div className="text-sm">{renderTemplate.title(message)}</div> */}
        {renderTemplate.body(message)}
      </div>
    </div>
  );
}
