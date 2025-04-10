import OpenAI from "openai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export type Message = OpenAI.ChatCompletionMessageParam;
export type MessageWithID = { id: string; content: string } & Message;

export type MessageItemProps = {
  message: MessageWithID;
};

export function MessageItem({ message }: MessageItemProps) {
  const messageClasses = `max-w-[80%] rounded-lg px-4 py-3 ${
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
      <div className={messageClasses}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            hr: ({ node, ...props }) => (
              <hr style={{ marginTop: "12px", marginBottom: "12px" }} {...props} />
            ),
            pre: ({ node, ...props }) => (
              <pre
                {...props}
                style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}
              />
            ),
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  );
};
