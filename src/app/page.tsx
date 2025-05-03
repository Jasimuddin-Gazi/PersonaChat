"use client";

import * as React from "react";
import { PlusCircle, Bot } from "lucide-react";

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
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

type ChatHistory = Record<string, ChatMessage[]>; // personaId -> messages

export default function Home() {
  const [personas, setPersonas] = useLocalStorage<Persona[]>("personas", []);
  const [chatHistory, setChatHistory] = useLocalStorage<ChatHistory>("chatHistory", {});
  const [selectedPersonaId, setSelectedPersonaId] = React.useState<string | null>(null);
  const [isChatLoading, setIsChatLoading] = React.useState(false);
  const [isCreatingPersona, setIsCreatingPersona] = React.useState(false); // State to control form visibility
  const [isClientHydrated, setIsClientHydrated] = React.useState(false); // State for hydration
  const { toast } = useToast();

  // Ensure client-side state is ready before rendering localStorage-dependent UI
  React.useEffect(() => {
    setIsClientHydrated(true);
  }, []);

  const handlePersonaCreated = (newPersona: Persona) => {
    setPersonas((prevPersonas) => [...prevPersonas, newPersona]);
    setIsCreatingPersona(false); // Hide form after creation
    setSelectedPersonaId(newPersona.id); // Select the newly created persona
  };

  const handleDeletePersona = (idToDelete: string) => {
     setPersonas((prev) => prev.filter(p => p.id !== idToDelete));
     setChatHistory((prev) => {
        const newHistory = {...prev};
        delete newHistory[idToDelete];
        return newHistory;
     });
     // If the deleted persona was selected, deselect it
     if (selectedPersonaId === idToDelete) {
        setSelectedPersonaId(null);
     }
     toast({ title: "Persona Deleted", description: "The persona and its chat history have been removed." });
  };

   const handleClearChat = (personaId: string) => {
      setChatHistory((prev) => ({
        ...prev,
        [personaId]: [] // Set messages for this persona to an empty array
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
    setChatHistory((prev) => ({
      ...prev,
      [personaId]: [...(prev[personaId] || []), userMessage],
    }));
    setIsChatLoading(true);

    try {
       // Prepare chat history string for the AI
       const historyString = (chatHistory[personaId] || [])
         .slice(-10) // Limit history context
         .map(msg => `${msg.sender === 'user' ? 'User' : persona.name}: ${msg.text}`)
         .join('\n');

      const response = await getPersonaResponseAction({
        personaName: persona.name,
        personaDescription: persona.description, // Use stored description
        userMessage: messageText,
        chatHistory: historyString,
      });

      const personaMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'persona',
        text: response.response,
        timestamp: new Date(),
      };

       // Update chat history with persona message
       setChatHistory((prev) => ({
        ...prev,
        [personaId]: [...(prev[personaId] || []), personaMessage],
      }));

    } catch (error) {
       console.error("Error getting persona response:", error);
       toast({
        title: "Error",
        description: "Failed to get response from persona.",
        variant: "destructive",
       });
       // Optionally remove the user's message if the AI failed
       setChatHistory((prev) => ({
           ...prev,
           [personaId]: (prev[personaId] || []).filter(msg => msg.id !== userMessage.id)
       }));
    } finally {
      setIsChatLoading(false);
    }
  };

  const selectedPersona = personas.find(p => p.id === selectedPersonaId) || null;
  const currentMessages = chatHistory[selectedPersonaId ?? ''] || [];

  return (
    <div className="flex h-screen flex-col">
       <header className="border-b p-4">
         <h1 className="text-2xl font-semibold flex items-center gap-2"><Bot size={28}/> PersonaChat</h1>
       </header>
        <ResizablePanelGroup
            direction="horizontal"
            className="flex-1 border-t"
         >
        <ResizablePanel defaultSize={25} minSize={20} maxSize={40} className="flex flex-col h-full">
            <div className="p-4 space-y-4 border-b">
                 <Button
                    onClick={() => setIsCreatingPersona(!isCreatingPersona)}
                    className="w-full"
                    variant={isCreatingPersona ? "secondary" : "default"}
                    >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {isCreatingPersona ? "Cancel Creation" : "Create New Persona"}
                </Button>
                 {isCreatingPersona && (
                    <div className="mt-4">
                        <PersonaForm onPersonaCreated={handlePersonaCreated} />
                    </div>
                )}
            </div>
            <Separator />
             {/* Only render PersonaList after hydration to avoid mismatch */}
            {isClientHydrated ? (
              <PersonaList
                  personas={personas}
                  selectedPersonaId={selectedPersonaId}
                  onSelectPersona={setSelectedPersonaId}
                  onDeletePersona={handleDeletePersona}
              />
            ) : (
              // Render skeletons or a simple loading message before hydration
              <ScrollArea className="h-full flex-1">
                <div className="space-y-4 p-4">
                  <Skeleton className="h-24 w-full rounded-lg" />
                  <Skeleton className="h-24 w-full rounded-lg" />
                  <Skeleton className="h-24 w-full rounded-lg" />
                </div>
              </ScrollArea>
            )}

        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={75}>
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
