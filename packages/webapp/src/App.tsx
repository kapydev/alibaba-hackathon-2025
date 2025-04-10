import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Moon, Send, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { trpc } from "./trpc/trpc";
import OpenAI from "openai";
import { Switch } from "@/components/ui/switch";
import toast from "react-hot-toast";

type Message = OpenAI.ChatCompletionMessageParam;
type MessageWithID = { id: string; content: string } & Message;

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
    if (isDarkMode) {
      toast.success("Switched to dark mode!");
    } else {
      toast.success("Switched to light mode!");
    }
  }, [isDarkMode]);

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
    <div className="flex items-center justify-center min-h-screen bg-muted p-4 place-items-center relative">
      <div className="absolute top-5 right-5">
        <div className="flex items-center space-x-2">
          <Switch
            id="dark-mode-switch"
            checked={isDarkMode}
            onCheckedChange={setIsDarkMode}
          />
          {isDarkMode ? <Moon size={20} /> : <Sun size={19} />}
        </div>
      </div>
      <Card className="w-full max-w-2xl h-[80vh] flex flex-col">
        <CardHeader className="border-b flex flex-row justify-between items-center">
          <CardTitle>AI Chatbot</CardTitle>
        </CardHeader>

        <CardContent
          className={`flex-1 m-1 p-4 space-y-4 ${
            messages.length > 0 && "overflow-y-auto"
          }`}
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              Send a message to start the conversation
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : message.role === "system"
                      ? "bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      : "bg-muted dark:bg-muted/50"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        <CardFooter className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex w-full gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
