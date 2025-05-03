"use client";

import * as React from "react";
import { Send, Loader2, Bot, User, Trash2 } from "lucide-react";
import { format } from 'date-fns';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { getPersonaResponseAction } from "@/app/actions";
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
    if (scrollAreaRef.current) {
      // Need to access the underlying viewport element to scroll
       const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
       if (viewport) {
           viewport.scrollTop = viewport.scrollHeight;
       }
    }
    // Focus input when a persona is selected
    if(persona && inputRef.current){
        inputRef.current.focus();
    }
  }, [messages, persona]);

  const handleSend = async () => {
    if (!persona || !inputValue.trim() || isLoading) return;

    const messageText = inputValue.trim();
    setInputValue(""); // Clear input immediately

    try {
      await onSendMessage(persona.id, messageText);
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Could not send message.",
        variant: "destructive",
      });
      // Optionally restore input value if sending failed
      // setInputValue(messageText);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent newline in input
      handleSend();
    }
  };

   if (!persona) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground p-8">
        <Bot size={48} className="mb-4"/>
        <p className="text-lg">Select a persona to start chatting</p>
        <p className="text-sm">Or create a new persona using the form.</p>
      </div>
    );
  }


  return (
    <div className="flex h-full flex-col">
      {/* Chat Header */}
       <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
           <Avatar className="h-10 w-10 border">
                <AvatarFallback><Bot size={20} /></AvatarFallback>
           </Avatar>
           <div>
             <h2 className="text-lg font-semibold">{persona.name}</h2>
             <p className="text-sm text-muted-foreground line-clamp-1">{persona.greeting}</p>
           </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
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
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 space-y-4">
         {messages.length === 0 ? (
             <div className="flex items-center justify-center h-full text-muted-foreground">
                 <p>No messages yet. Start the conversation!</p>
             </div>
         ) : (
            messages.map((msg) => (
            <div
                key={msg.id}
                className={`flex items-end gap-2 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
            >
                {msg.sender === 'persona' && (
                    <Avatar className="h-8 w-8 border self-start">
                    <AvatarFallback><Bot size={16} /></AvatarFallback>
                    </Avatar>
                )}
                <div
                    className={`max-w-[75%] rounded-lg p-3 shadow-sm ${
                    msg.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                >
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-primary-foreground/70 text-right' : 'text-secondary-foreground/70 text-left'}`}>
                        {format(msg.timestamp, 'p')}
                    </p>
                </div>
                 {msg.sender === 'user' && (
                    <Avatar className="h-8 w-8 border self-start">
                    <AvatarFallback><User size={16} /></AvatarFallback>
                    </Avatar>
                )}
            </div>
            ))
         )}
         {/* Optional: Show typing indicator */}
         {isLoading && messages.length > 0 && messages[messages.length - 1].sender === 'user' && (
            <div className="flex items-end gap-2 justify-start">
                 <Avatar className="h-8 w-8 border self-start">
                    <AvatarFallback><Bot size={16} /></AvatarFallback>
                 </Avatar>
                 <div className="max-w-[75%] rounded-lg p-3 shadow-sm bg-secondary text-secondary-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                 </div>
            </div>
         )}
      </ScrollArea>

      {/* Chat Input */}
      <Separator />
      <div className="p-4">
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
            className="flex-1"
            disabled={isLoading}
            autoComplete="off"
          />
          <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()}>
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
  );
}
