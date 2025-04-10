import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Candy, Moon, Send, SquarePen, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { trpc } from "./trpc/trpc";
import { useEvent } from "./api/createEventListener";
import { Message, MessageItem, MessageWithID } from "./features/Message";
import { SelectionDisplay } from "./features/SelectionDisplay";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function App() {
  const [messages, setMessages] = useState<MessageWithID[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode ? JSON.parse(savedMode) : false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("darkMode", JSON.stringify(true));
    } else {
      root.classList.remove("dark");
      localStorage.setItem("darkMode", JSON.stringify(false));
    }
  }, [isDarkMode]);

  useEvent("updateSelectedLayers", (layers) => {
    console.log(layers);
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message
    const userMessage: MessageWithID = {
      id: Date.now().toString(),
      role: "user" as const,
      content: input.trim(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Prepare messages for API
      const apiMessages: Message[] = [
        { role: "system", content: "You are a helpful assistant." },
        ...messages,
        { role: userMessage.role, content: userMessage.content },
      ];

      // Create a temporary message for streaming
      const assistantMessageId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        { id: assistantMessageId, role: "assistant", content: "" },
      ]);

      // Stream the response
      const stream = await trpc.ai.chat.mutate(apiMessages);
      let fullContent = "";

      for await (const chunk of stream) {
        if ("error" in chunk) {
          console.error(chunk.error);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: "Error: Failed to generate response." }
                : msg
            )
          );
          break;
        } else {
          fullContent += chunk.content;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: fullContent }
                : msg
            )
          );
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="bg-background text-foreground h-screen flex flex-col">
        {/* TITLEBAR */}
        <div className="space-y-1.5 p-4 border-b flex flex-row justify-between items-center">
          <div className="font-semibold leading-none tracking-tight flex flex-row items-center gap-1.5">
            <Candy className="ml-1" size={20} />
          </div>
          <div className="flex items-center space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMessages([])}
                >
                  <SquarePen />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>New chat</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                >
                  {isDarkMode ? <Moon /> : <Sun />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle dark mode</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* MESSAGE AREA */}
        <div
          className={`flex-1 p-4 overflow-y-auto ${
            messages.length === 0
              ? "flex items-center justify-center"
              : "space-y-4"
          }`}
        >
          {messages.length === 0 ? (
            <p className="text-muted-foreground text-center">
              Select layers to add context
            </p>
          ) : (
            messages.map((message) => (
              <MessageItem key={message.id} message={message} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* FOOTER */}
        <div className="flex flex-col">
          <SelectionDisplay />
          <form onSubmit={handleSubmit} className="flex w-full gap-2 px-4 pt-3.5 pb-5">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Send a message to start the conversation..."
              className="flex-1"
              disabled={isLoading}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="submit" size="icon" disabled={isLoading}>
                  <Send className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Send message</p>
              </TooltipContent>
            </Tooltip>
          </form>
        </div>
      </div>
    </TooltipProvider>
  );
}
