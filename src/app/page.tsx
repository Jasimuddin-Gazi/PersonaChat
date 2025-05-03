
"use client";

import * as React from "react";
import { PlusCircle, Bot, Settings, Palette, MessageSquareText, CalendarClock, Sun, Moon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PersonaForm } from "@/components/persona-form";
import { PersonaList } from "@/components/persona-list";
import { ChatInterface, type ChatMessage } from "@/components/chat-interface";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { getPersonaResponseAction } from "@/app/actions";
import type { Persona } from "@/types/persona";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuPortal
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes"; // Import useTheme hook
import { cn } from "@/lib/utils"; // Ensure cn is imported

type ChatHistory = Record<string, ChatMessage[]>; // personaId -> messages

export default function Home() {
  const [personas, setPersonas] = useLocalStorage<Persona[]>("personas", []);
  const [chatHistory, setChatHistory] = useLocalStorage<ChatHistory>("chatHistory", {});
  const [selectedPersonaId, setSelectedPersonaId] = React.useState<string | null>(null);
  const [isChatLoading, setIsChatLoading] = React.useState(false);
  const [isCreatingPersona, setIsCreatingPersona] = React.useState(false);
  const [isClientHydrated, setIsClientHydrated] = React.useState(false);
  const { toast } = useToast();
  const { setTheme, theme } = useTheme(); // Get theme functions

  React.useEffect(() => {
    setIsClientHydrated(true);
  }, []);

  const handlePersonaCreated = (newPersona: Persona) => {
    setPersonas((prevPersonas) => [...prevPersonas, newPersona]);
    setIsCreatingPersona(false);
    setSelectedPersonaId(newPersona.id);
  };

  const handleDeletePersona = (idToDelete: string) => {
     setPersonas((prev) => prev.filter(p => p.id !== idToDelete));
     setChatHistory((prev) => {
        const newHistory = {...prev};
        delete newHistory[idToDelete];
        return newHistory;
     });
     if (selectedPersonaId === idToDelete) {
        setSelectedPersonaId(null);
     }
     toast({ title: "Persona Deleted", description: "The persona and its chat history have been removed." });
  };

   const handleClearChat = (personaId: string) => {
      setChatHistory((prev) => ({
        ...prev,
        [personaId]: []
      }));
      toast({ title: "Chat Cleared", description: `Chat history with the selected persona has been cleared.` });
  };

  const handleSendMessage = async (personaId: string, messageText: string) => {
    const persona = personas.find(p => p.id === personaId);
    if (!persona) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      text: messageText,
      timestamp: new Date(),
    };

    // Update chat history immediately with user message
     // Use functional update for reliable state transitions
     setChatHistory((prev) => {
        const currentMessages = prev[personaId] || [];
        return {
            ...prev,
            [personaId]: [...currentMessages, userMessage],
        };
    });

    setIsChatLoading(true);

    try {
       const historyString = (chatHistory[personaId] || [])
         .slice(-10) // Limit history context
         .map(msg => `${msg.sender === 'user' ? 'User' : persona.name}: ${msg.text}`)
         .join('\n');

      const response = await getPersonaResponseAction({
        personaName: persona.name,
        personaDescription: persona.description, // Use full description
        userMessage: messageText,
        chatHistory: historyString,
        isDreamScenario: persona.isDreamScenario,
      });

      const personaMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'persona',
        text: response.response,
        timestamp: new Date(),
      };

       // Update chat history with persona message
       // Use functional update for reliable state transitions
       setChatHistory((prev) => {
            const currentMessages = prev[personaId] || [];
            // Find the index of the user's message to insert the AI response after it
            const userMessageIndex = currentMessages.findIndex(msg => msg.id === userMessage.id);

            // If user message exists, insert AI message right after
            if (userMessageIndex !== -1) {
              const newMessages = [...currentMessages];
              newMessages.splice(userMessageIndex + 1, 0, personaMessage);
              return {
                  ...prev,
                  [personaId]: newMessages,
              };
            } else {
              // Fallback: add both messages if user message wasn't found (should not happen ideally)
               console.warn("User message not found in history, appending both messages.");
               return {
                 ...prev,
                 [personaId]: [...currentMessages, userMessage, personaMessage],
               };
            }
        });

    } catch (error) {
       console.error("Error getting persona response:", error);
       toast({
        title: "Error",
        description: "Failed to get response from persona.",
        variant: "destructive",
       });
       // Optionally remove the user's message if the AI failed
        setChatHistory((prev) => {
            const currentMessages = prev[personaId] || [];
            return {
                ...prev,
                [personaId]: currentMessages.filter(msg => msg.id !== userMessage.id)
            };
        });
    } finally {
      setIsChatLoading(false);
    }
  };

  const selectedPersona = personas.find(p => p.id === selectedPersonaId) || null;
  // Ensure currentMessages reflects the latest state after updates
  const currentMessages = React.useMemo(() => chatHistory[selectedPersonaId ?? ''] || [], [chatHistory, selectedPersonaId]);


  // Placeholder functions for new features
  const handleCustomizeChatSkin = () => {
      toast({ title: "Coming Soon!", description: "Personalized Chat Skins are under development." });
  }
  const handleAIScheduler = () => {
      toast({ title: "Coming Soon!", description: "AI Meeting Scheduler integration is planned." });
  }
  const handleContextAssistant = () => {
      toast({ title: "Coming Soon!", description: "Context-Aware AI Assistant features are in the pipeline." });
  }

  return (
    <div className={cn(
        "flex h-screen flex-col",
         // Gradient is now applied via main layout
         )}>
       <header className="app-header"> {/* Apply header class */}
         {/* Apply heading font */}
         <h1 className="text-2xl font-heading font-bold flex items-center gap-2 animate-fade-in"><Bot size={28} className="animate-float"/> PersonaChat</h1> {/* Bold heading, float animation */}
         <DropdownMenu>
             <DropdownMenuTrigger asChild>
                 <Button variant="ghost" size="icon" className="rounded-full"> {/* Rounded button */}
                     <Settings className="h-5 w-5 animate-spin [animation-duration:5s]" /> {/* Slow spin */}
                     <span className="sr-only">Settings & Features</span>
                 </Button>
             </DropdownMenuTrigger>
             <DropdownMenuContent align="end" className="animate-fade-in"> {/* Animate dropdown */}
                 <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                 <DropdownMenuSeparator />
                  <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                          {theme === 'light' ? <Sun className="mr-2 h-4 w-4 text-yellow-500" /> : <Moon className="mr-2 h-4 w-4 text-blue-400" />}
                          <span>Theme</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                          <DropdownMenuSubContent>
                              <DropdownMenuItem onClick={() => setTheme('light')}>
                                  <Sun className="mr-2 h-4 w-4" /> Light
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setTheme('dark')}>
                                  <Moon className="mr-2 h-4 w-4" /> Dark
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setTheme('system')}>
                                   <Settings className="mr-2 h-4 w-4" /> System
                              </DropdownMenuItem>
                          </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                  </DropdownMenuSub>
                 <DropdownMenuSeparator />
                 <DropdownMenuLabel>Features (Coming Soon)</DropdownMenuLabel>
                 <DropdownMenuItem onClick={handleCustomizeChatSkin} disabled>
                     <Palette className="mr-2 h-4 w-4" />
                     <span>Chat Skins</span>
                 </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleAIScheduler} disabled>
                     <CalendarClock className="mr-2 h-4 w-4" />
                     <span>AI Scheduler</span>
                 </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleContextAssistant} disabled>
                     <MessageSquareText className="mr-2 h-4 w-4" />
                     <span>AI Assistant</span>
                 </DropdownMenuItem>
             </DropdownMenuContent>
         </DropdownMenu>
       </header>
        <ResizablePanelGroup
            direction="horizontal"
            className="flex-1 border-t border-border/50" // Lighter border
            style={{ opacity: isClientHydrated ? 1 : 0 }}
         >
        <ResizablePanel defaultSize={25} minSize={20} maxSize={40} className="flex flex-col h-full bg-card/80 backdrop-blur-sm shadow-lg"> {/* Blurred bg, shadow */}
            <div className="p-4 space-y-4 border-b border-border/50"> {/* Lighter border */}
                 <Button
                    onClick={() => setIsCreatingPersona(!isCreatingPersona)}
                    className="w-full button-fancy" // Apply fancy button style
                    variant={isCreatingPersona ? "secondary" : "default"}
                    >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {isCreatingPersona ? "Cancel Creation" : "Create New Persona"}
                </Button>
                 {isCreatingPersona && (
                    <div className="mt-4 animate-accordion-down">
                        <PersonaForm onPersonaCreated={handlePersonaCreated} />
                    </div>
                )}
            </div>
            <Separator className="bg-border/30"/> {/* Even lighter separator */}
            {isClientHydrated ? (
              <PersonaList
                  personas={personas}
                  selectedPersonaId={selectedPersonaId}
                  onSelectPersona={setSelectedPersonaId}
                  onDeletePersona={handleDeletePersona}
              />
            ) : (
              // Enhanced Skeleton Loading
              <ScrollArea className="h-full flex-1">
                <div className="space-y-4 p-4">
                  {[1, 2, 3].map(i => (
                     <div key={i} className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg animate-pulse">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-3/4 rounded" />
                          <Skeleton className="h-3 w-1/2 rounded" />
                        </div>
                      </div>
                  ))}
                </div>
              </ScrollArea>
            )}

        </ResizablePanel>
        <ResizableHandle withHandle className="transition-colors duration-200 hover:bg-primary/20 active:bg-primary/30" /> {/* Adjusted hover/active */}
        <ResizablePanel defaultSize={75} className="bg-transparent"> {/* Transparent panel to show gradient */}
           <ChatInterface
                persona={selectedPersona}
                messages={currentMessages}
                onSendMessage={handleSendMessage}
                isLoading={isChatLoading}
                onClearChat={handleClearChat}
            />
        </ResizablePanel>
        </ResizablePanelGroup>
    </div>
  );
}
