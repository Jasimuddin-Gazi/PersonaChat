
"use client";

import * as React from "react";
import { PlusCircle, Bot, Settings, Palette, MessageSquareText, CalendarClock, Sun, Moon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PersonaForm } from "@/components/persona-form";
import { PersonaList } from "@/components/persona-list";
import { ChatInterface, type ChatMessage } from "@/components/chat-interface";
import { PersonaEditDialog } from "@/components/persona-edit-dialog"; // Import the new component
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
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

type ChatHistory = Record<string, ChatMessage[]>; // personaId -> messages

export default function Home() {
  const [personas, setPersonas] = useLocalStorage<Persona[]>("personas", []);
  const [chatHistory, setChatHistory] = useLocalStorage<ChatHistory>("chatHistory", {});
  const [selectedPersonaId, setSelectedPersonaId] = React.useState<string | null>(null);
  const [isChatLoading, setIsChatLoading] = React.useState(false);
  const [isCreatingPersona, setIsCreatingPersona] = React.useState(false);
  const [isEditingPersona, setIsEditingPersona] = React.useState(false); // State for edit dialog
  const [editingPersonaId, setEditingPersonaId] = React.useState<string | null>(null); // ID of persona being edited
  const [isClientHydrated, setIsClientHydrated] = React.useState(false);
  const { toast } = useToast();
  const { setTheme, theme } = useTheme();

  React.useEffect(() => {
    setIsClientHydrated(true);
  }, []);

  const handlePersonaCreated = (newPersona: Persona) => {
    setPersonas((prevPersonas) => [...prevPersonas, newPersona]);
    setIsCreatingPersona(false);
    setSelectedPersonaId(newPersona.id); // Select the newly created persona
  };

   const handleEditPersona = (idToEdit: string) => {
    setEditingPersonaId(idToEdit);
    setIsEditingPersona(true);
  };

  const handlePersonaUpdated = (updatedPersona: Persona) => {
    setPersonas((prev) =>
      prev.map((p) => (p.id === updatedPersona.id ? updatedPersona : p))
    );
    setIsEditingPersona(false);
    setEditingPersonaId(null);
    // If the currently selected persona was edited, ensure it reflects updates
    if (selectedPersonaId === updatedPersona.id) {
        // The selectedPersona object will update automatically due to state change
    }
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

       setChatHistory((prev) => {
            const currentMessages = prev[personaId] || [];
            // Ensure messages are added sequentially if AI responds quickly
            const latestMessages = [...currentMessages];
             // Check if user message is already there before adding AI message
            if (latestMessages.some(msg => msg.id === userMessage.id)) {
                 latestMessages.push(personaMessage);
            } else {
                 // This case shouldn't ideally happen with sequential updates
                 latestMessages.push(userMessage, personaMessage);
            }
            return {
                ...prev,
                [personaId]: latestMessages,
            };
        });

    } catch (error) {
       console.error("Error getting persona response:", error);
       toast({
        title: "Error",
        description: "Failed to get response from persona.",
        variant: "destructive",
       });
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
  const personaBeingEdited = personas.find(p => p.id === editingPersonaId) || null;
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
         )}>
       <header className="app-header">
         <h1 className="text-2xl font-heading font-bold flex items-center gap-2 animate-fade-in"><Bot size={28} className="animate-float"/> PersonaChat</h1>
         <DropdownMenu>
             <DropdownMenuTrigger asChild>
                 <Button variant="ghost" size="icon" className="rounded-full">
                     <Settings className="h-5 w-5 animate-spin [animation-duration:5s]" />
                     <span className="sr-only">Settings & Features</span>
                 </Button>
             </DropdownMenuTrigger>
             <DropdownMenuContent align="end" className="animate-fade-in">
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
            className="flex-1 border-t border-border/50"
            style={{ opacity: isClientHydrated ? 1 : 0 }}
         >
        <ResizablePanel defaultSize={25} minSize={20} maxSize={40} className="flex flex-col h-full bg-card/80 backdrop-blur-sm shadow-lg">
            <div className="p-4 space-y-4 border-b border-border/50">
                 <Button
                    onClick={() => setIsCreatingPersona(!isCreatingPersona)}
                    className="w-full button-fancy"
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
            <Separator className="bg-border/30"/>
            {isClientHydrated ? (
              <PersonaList
                  personas={personas}
                  selectedPersonaId={selectedPersonaId}
                  onSelectPersona={setSelectedPersonaId}
                  onDeletePersona={handleDeletePersona}
                  onEditPersona={handleEditPersona} // Pass the edit handler
              />
            ) : (
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
        <ResizableHandle withHandle className="transition-colors duration-200 hover:bg-primary/20 active:bg-primary/30" />
        <ResizablePanel defaultSize={75} className="bg-transparent">
           <ChatInterface
                persona={selectedPersona}
                messages={currentMessages}
                onSendMessage={handleSendMessage}
                isLoading={isChatLoading}
                onClearChat={handleClearChat}
            />
        </ResizablePanel>
        </ResizablePanelGroup>

        {/* Render Edit Dialog */}
        {personaBeingEdited && (
            <PersonaEditDialog
                isOpen={isEditingPersona}
                onClose={() => {
                    setIsEditingPersona(false);
                    setEditingPersonaId(null);
                }}
                persona={personaBeingEdited}
                onPersonaUpdated={handlePersonaUpdated}
            />
        )}
    </div>
  );
}

