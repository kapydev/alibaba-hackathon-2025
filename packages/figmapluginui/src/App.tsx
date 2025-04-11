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
import { Skeleton } from "@/components/ui/skeleton";

const SUGGESTIONS = [
  "Tell me more about the selected designs",
  "Change to a darker color palette",
  "Suggest improvements for this design",
];

export default function App() {
  // useHandleSelectionUpdate();
  const { isDarkMode, setIsDarkMode } = useDarkMode();
  const messages = chatStore.use("messages");
  const isLoadingChat = chatStore.use("isLoading");
  const [input, setInput] = useState("");
  const [isAppLoading, setIsAppLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // App loading timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 3000); // 5 seconds

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoadingChat) return;
    await updateChatFull(input);
    continuePrompt("full");
    setInput("");
  };

  const handleSuggestionClick = async (suggestion: string) => {
    if (isLoadingChat) return;
    setInput(suggestion); // Optionally set input for visual feedback
    await updateChatFull(suggestion);
    continuePrompt("full");
    setInput(""); // Clear input after sending
  };

  // Render loading screen if isAppLoading is true
  if (isAppLoading) {
    return (
      <div className="bg-background text-foreground h-screen flex flex-col items-center justify-center border-none rounded-none">
        <Candy className="w-16 h-16 mb-4 animate-pulse" />
        <p className="text-muted-foreground font-medium">Powered by Qwen</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="bg-background text-foreground h-screen flex flex-col">
        {/* TITLEBAR */}
        <div className="space-y-1.5 p-3 border-b border-border/80 flex flex-row justify-between items-center bg-gradient-to-b from-background to-background/90 shadow-sm">
          <div className="font-semibold leading-none tracking-tight flex flex-row items-center gap-1.5">
            <Candy className="ml-1 text-primary" size={20} />
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
        <div className={`flex-1 p-4 overflow-y-auto bg-[url('/grid.svg')] dark:bg-[url('/grid-dark.svg')] bg-repeat`}>
          {messages.length === 1 ? (
            <div className="grid place-items-center h-full">
               <div className="text-center space-y-4 flex flex-col items-center p-4">
                 <p className="text-muted-foreground">Select layers or start with a suggestion:</p>
                 <div className="flex flex-wrap justify-center items-center gap-2 max-w-md">
                    {SUGGESTIONS.map((suggestion) => (
                      <Button
                        key={suggestion}
                        variant="outline"
                        size="sm"
                        className="hover:bg-primary/10 hover:border-primary/50 transition-colors"
                        onClick={() => handleSuggestionClick(suggestion)}
                        disabled={isLoadingChat}
                      >
                        {suggestion}
                      </Button>
                    ))}
                 </div>
               </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) =>
                message instanceof ToolMessage ? (
                  <MessageItem key={message.id} message={message} />
                ) : (
                  <></>
                )
              )}
              {isLoadingChat && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex justify-start my-1">
                  <Skeleton className="h-10 w-48 rounded-lg bg-card dark:bg-secondary shadow-sm" />
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* FOOTER */}
        <div className="flex flex-col border-t border-border/80">
          <SelectionDisplay />
          <form
            onSubmit={handleSubmit}
            className="flex w-full items-center gap-2 px-3 pt-3 pb-4 bg-gradient-to-t from-background to-background/90"
          >
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask Qwen about your design..."
              className="flex-1 bg-background/80 focus:ring-primary/50 focus:border-primary/30"
              disabled={isLoadingChat}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="submit" size="icon" disabled={isLoadingChat} variant="ghost" className="hover:bg-primary/10">
                  <Send className="h-4 w-4 text-primary" />
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
