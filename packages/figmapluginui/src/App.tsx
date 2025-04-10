import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Candy, Moon, Send, SquarePen, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MessageItem } from "./features/Message";
import { SelectionDisplay } from "./features/SelectionDisplay";
import { useDarkMode } from "./hooks/useDarkMode";
// import { useHandleSelectionUpdate } from "./hooks/useHandleSelectionUpdate";
import { ToolMessage } from "./messages/ToolMessage";
import {
  chatStore,
  continuePrompt,
  resetChatStore,
  updateChatFull,
} from "./stores/chatStore";

export default function App() {
  // useHandleSelectionUpdate();
  const { isDarkMode, setIsDarkMode } = useDarkMode();
  const messages = chatStore.use("messages");
  const isLoading = chatStore.use("isLoading");
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    console.log("messages", messages);
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    await updateChatFull(input);
    continuePrompt("full");
    setInput("");
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
                  onClick={() => resetChatStore()}
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
        <div className={`flex-1 p-4 overflow-y-auto`}>
          {messages.length === 1 ? (
            <p className="text-muted-foreground text-center grid place-items-center h-full">
              Select layers to add context
            </p>
          ) : (
            <div className="space-y-4">
              {messages.map((message) =>
                message instanceof ToolMessage ? (
                  <MessageItem key={message.id} message={message} />
                ) : (
                  <></>
                )
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* FOOTER */}
        <div className="flex flex-col">
          <SelectionDisplay />
          <form
            onSubmit={handleSubmit}
            className="flex w-full gap-2 px-4 pt-3.5 pb-5"
          >
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
