
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
      }, 150); // Slightly longer timeout for potentially complex animations
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
      <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground p-8 animate-fade-in">
        <Bot size={64} className="mb-6 text-primary animate-float"/> {/* Bigger icon, float animation */}
        <p className="text-xl font-semibold">Select a Persona</p>
        <p className="text-sm mt-1">Choose a persona from the list or create a new one to begin chatting!</p>
      </div>
    );
  }


  return (
    <TooltipProvider>
        <div className="flex h-full flex-col bg-gradient-animation"> {/* Apply gradient animation */}
         <div className="flex items-center justify-between p-4 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10 shadow-md"> {/* Blurred background + sticky */}
          <div className="flex items-center gap-3">
             <Tooltip>
               <TooltipTrigger asChild>
                 <Avatar className={cn(
                    "h-10 w-10 border-2 transition-all duration-300 hover:scale-110 hover:shadow-lg", // Added hover shadow
                    persona.isDreamScenario ? 'border-secondary' : 'border-primary' // Use secondary for dream scenario
                 )}>
                   <AvatarFallback className={cn(
                     "font-semibold",
                     persona.isDreamScenario ? 'text-secondary' : 'text-primary'
                   )}>
                     {persona.isDreamScenario ? <Sparkles size={20} /> : <Bot size={20} />}
                   </AvatarFallback>
                 </Avatar>
               </TooltipTrigger>
               <TooltipContent side="bottom">
                   {persona.isDreamScenario ? <p>Dream Scenario Active</p> : <p>Persona: {persona.name}</p>}
               </TooltipContent>
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
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive transition-colors rounded-full"> {/* Rounded button */}
                <Trash2 className="h-5 w-5" />
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
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 button-fancy" // Apply fancy button style
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
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground animate-fade-in-delay"> {/* Added delay */}
                   <Sparkles size={48} className="mb-4 text-secondary animate-pulse-glow"/> {/* Secondary color, pulse glow */}
                  <p className="text-lg">Conversation starts here...</p>
                  <p className="text-sm mt-1">Send a message to {persona.name}.</p>
              </div>
          ) : (
              messages.map((msg) => (
              <div
                  key={msg.id}
                  className={cn(
                      "flex items-end gap-2 chat-message", // Removed mb-6, handled by chat-message in globals.css
                      msg.sender === 'user' ? 'justify-end user-message' : 'justify-start persona-message'
                  )}
              >
                  {msg.sender === 'persona' && (
                      <Tooltip>
                          <TooltipTrigger asChild>
                              <Avatar className={cn(
                                  "h-8 w-8 border-2 self-start transition-transform duration-300 hover:scale-110",
                                   persona.isDreamScenario ? 'border-secondary' : 'border-primary' // Use secondary for dream scenario
                                )}>
                                <AvatarFallback className={cn(
                                    "font-medium text-xs", // Smaller font
                                    persona.isDreamScenario ? 'text-secondary' : 'text-primary'
                                )}>
                                    {persona.isDreamScenario ? <Sparkles size={16} /> : <Bot size={16} />}
                                </AvatarFallback>
                              </Avatar>
                          </TooltipTrigger>
                           <TooltipContent side="right">
                                  {persona.isDreamScenario ? <p>Scenario Response</p> : <p>{persona.name}</p>}
                            </TooltipContent>
                      </Tooltip>
                  )}
                  <div className="chat-bubble"> {/* Apply bubble class */}
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      <p className="chat-timestamp"> {/* Apply timestamp class */}
                          {format(new Date(msg.timestamp), 'p')}
                      </p>
                  </div>
                  {msg.sender === 'user' && (
                      <Tooltip>
                         <TooltipTrigger asChild>
                            <Avatar className="h-8 w-8 border-2 self-start transition-transform duration-300 hover:scale-110 border-muted-foreground/50"> {/* Muted border */}
                                <AvatarFallback className="text-muted-foreground"><User size={16} /></AvatarFallback>
                            </Avatar>
                         </TooltipTrigger>
                         <TooltipContent side="left">
                            <p>You</p>
                         </TooltipContent>
                      </Tooltip>
                  )}
              </div>
              ))
          )}
          {/* Enhanced Loading indicator */}
          {isLoading && (
              <div className="flex items-end gap-2 justify-start mb-6 animate-fade-in">
                   <Avatar className={cn(
                      "h-8 w-8 border-2 self-start",
                      persona.isDreamScenario ? 'border-secondary' : 'border-primary'
                    )}>
                      <AvatarFallback className={cn(
                         "font-medium text-xs",
                         persona.isDreamScenario ? 'text-secondary' : 'text-primary'
                      )}>
                          {persona.isDreamScenario ? <Sparkles size={16} /> : <Bot size={16} />}
                      </AvatarFallback>
                  </Avatar>
                  <div className="chat-bubble bg-card text-card-foreground"> {/* Use bubble style */}
                      <Loader2 className="loading-spinner" /> {/* Use spinner class */}
                  </div>
              </div>
          )}
        </ScrollArea>

        {/* Chat Input Area */}
        <Separator className="bg-border/50"/>
        <div className="chat-input-area"> {/* Apply input area class */}
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
              className="flex-1 transition-shadow duration-200 focus:shadow-md rounded-full px-4" // Rounded input
              disabled={isLoading}
              autoComplete="off"
            />
            <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()} className="rounded-full button-fancy"> {/* Rounded button + fancy style */}
              {isLoading ? (
                <Loader2 className="loading-spinner" />
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
