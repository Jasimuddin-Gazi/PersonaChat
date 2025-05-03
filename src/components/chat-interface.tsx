
"use client";

import * as React from "react";
import { Send, Loader2, Bot, User, Trash2, Sparkles } from "lucide-react";
import { format } from 'date-fns';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import type { Persona } from "@/types/persona";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";


export interface ChatMessage {
  id: string;
  sender: 'user' | 'persona';
  text: string;
  timestamp: Date;
}

type ChatInterfaceProps = {
  persona: Persona | null;
  messages: ChatMessage[];
  onSendMessage: (personaId: string, messageText: string) => Promise<void>;
  isLoading: boolean;
  onClearChat: (personaId: string) => void;
};

export function ChatInterface({ persona, messages, onSendMessage, isLoading, onClearChat }: ChatInterfaceProps) {
  const { toast } = useToast();
  const [inputValue, setInputValue] = React.useState("");
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change or persona is selected
  React.useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector<HTMLDivElement>('[data-radix-scroll-area-viewport]');
    if (viewport) {
      const timer = setTimeout(() => {
         viewport.scrollTop = viewport.scrollHeight;
      }, 100); // Increased timeout slightly for animation settling
      return () => clearTimeout(timer);
    }
    if(persona && inputRef.current){
        inputRef.current.focus();
    }
  }, [messages, persona]);


  const handleSend = async () => {
    if (!persona || !inputValue.trim() || isLoading) return;

    const messageText = inputValue.trim();
    setInputValue("");

    try {
      await onSendMessage(persona.id, messageText);
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Could not send message.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

   if (!persona) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground p-8 animate-fade-in"> {/* Added animation */}
        <Bot size={48} className="mb-4 text-primary animate-pulse"/> {/* Pulse animation */}
        <p className="text-lg">Select a persona to start chatting</p>
        <p className="text-sm">Or create a new persona using the form.</p>
      </div>
    );
  }


  return (
    <TooltipProvider>
        <div className="flex h-full flex-col bg-background"> {/* Ensure background */}
         <div className="flex items-center justify-between p-4 border-b bg-card"> {/* Apply card styles */}
          <div className="flex items-center gap-3">
             <Tooltip>
               <TooltipTrigger asChild>
                 <Avatar className={cn(
                    "h-10 w-10 border transition-transform duration-300 hover:scale-110",
                    persona.isDreamScenario ? 'bg-accent/20 border-accent' : 'border-primary'
                 )}>
                   <AvatarFallback className={cn(
                     persona.isDreamScenario ? 'text-accent' : 'text-primary'
                   )}>
                     {persona.isDreamScenario ? <Sparkles size={20} /> : <Bot size={20} />}
                   </AvatarFallback>
                 </Avatar>
               </TooltipTrigger>
               {persona.isDreamScenario && (
                 <TooltipContent>
                   <p>Dream Scenario</p>
                 </TooltipContent>
               )}
             </Tooltip>
             <div>
               <h2 className="text-lg font-semibold text-card-foreground">{persona.name}</h2>
               <p className="text-sm text-muted-foreground line-clamp-1">
                 {persona.isDreamScenario ? persona.skills : persona.greeting}
               </p>
             </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Clear Chat</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear chat history?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all messages in the chat with "{persona.name}". This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => onClearChat(persona.id)}>
                  Clear Chat
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Chat Messages */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground animate-fade-in">
                  <p>No messages yet. Start the conversation!</p>
              </div>
          ) : (
              messages.map((msg) => (
              <div
                  key={msg.id}
                  className={cn(
                      "flex items-end gap-2 mb-6 chat-message", // Added chat-message class and increased margin-bottom
                      msg.sender === 'user' ? 'justify-end user-message' : 'justify-start persona-message'
                  )}
              >
                  {msg.sender === 'persona' && (
                      <Tooltip>
                          <TooltipTrigger asChild>
                              <Avatar className={cn(
                                  "h-8 w-8 border self-start transition-transform duration-300 hover:scale-110",
                                   persona.isDreamScenario ? 'bg-accent/20 border-accent' : 'border-primary'
                                )}>
                                <AvatarFallback className={cn(
                                    persona.isDreamScenario ? 'text-accent' : 'text-primary'
                                )}>
                                    {persona.isDreamScenario ? <Sparkles size={16} /> : <Bot size={16} />}
                                </AvatarFallback>
                              </Avatar>
                          </TooltipTrigger>
                          {persona.isDreamScenario && (
                              <TooltipContent side="right">
                                  <p>Scenario Response</p>
                              </TooltipContent>
                          )}
                      </Tooltip>
                  )}
                  <div
                      className={cn(
                        "max-w-[75%] rounded-lg p-3 shadow-md transition-all duration-300 hover:shadow-lg", // Added transition & hover shadow
                        msg.sender === 'user'
                            ? 'bg-primary/90 text-primary-foreground animate-slide-in-right' // Adjusted user bg, added animation
                            : 'bg-muted text-muted-foreground animate-slide-in-left' // Adjusted persona bg, added animation
                      )}
                  >
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground/80 text-left'}`}>
                          {format(new Date(msg.timestamp), 'p')}
                      </p>
                  </div>
                  {msg.sender === 'user' && (
                      <Avatar className="h-8 w-8 border self-start transition-transform duration-300 hover:scale-110">
                          <AvatarFallback><User size={16} /></AvatarFallback>
                      </Avatar>
                  )}
              </div>
              ))
          )}
          {/* Loading indicator shown only when AI is generating a response */}
          {isLoading && (
              <div className="flex items-end gap-2 justify-start mb-6 animate-fade-in">
                   <Avatar className={cn(
                      "h-8 w-8 border self-start",
                      persona.isDreamScenario ? 'bg-accent/20 border-accent' : 'border-primary'
                    )}>
                      <AvatarFallback className={cn(
                         persona.isDreamScenario ? 'text-accent' : 'text-primary'
                      )}>
                          {persona.isDreamScenario ? <Sparkles size={16} /> : <Bot size={16} />}
                      </AvatarFallback>
                  </Avatar>
                  <div className="max-w-[75%] rounded-lg p-3 shadow-sm bg-muted text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
              </div>
          )}
        </ScrollArea>

        {/* Chat Input */}
        <Separator />
        <div className="p-4 bg-card"> {/* Apply card styles */}
          <form
              onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
              }}
              className="flex items-center gap-2"
              >
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${persona.name}...`}
              className="flex-1 transition-shadow duration-200 focus:shadow-md" // Added transition
              disabled={isLoading}
              autoComplete="off"
            />
            <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()} className="transition-transform duration-200 hover:scale-110 active:scale-95"> {/* Added animations */}
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </div>
      </div>
    </TooltipProvider>
  );
}
