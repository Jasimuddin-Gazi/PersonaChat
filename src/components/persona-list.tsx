
"use client";

import * as React from "react";
import { Bot, Trash2, Sparkles, Pencil } from "lucide-react"; // Added Pencil icon
import { formatDistanceToNow } from 'date-fns';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Removed CardFooter as it's not used
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import type { Persona } from "@/types/persona";
import { cn } from "@/lib/utils";

type PersonaListProps = {
  personas: Persona[];
  selectedPersonaId: string | null;
  onSelectPersona: (id: string) => void;
  onDeletePersona: (id: string) => void;
  onEditPersona: (id: string) => void; // Added prop for editing
};

export function PersonaList({ personas, selectedPersonaId, onSelectPersona, onDeletePersona, onEditPersona }: PersonaListProps) {

  const handleEditClick = (e: React.MouseEvent, personaId: string) => {
    e.stopPropagation(); // Prevent card selection when clicking edit
    onEditPersona(personaId);
  };

  return (
    <ScrollArea className="h-full flex-1">
       <TooltipProvider delayDuration={100}>
          <div className="space-y-3 p-3">
            {personas.length === 0 && (
              <p className="text-center text-muted-foreground p-6 animate-fade-in-delay">
                No personas yet. <br/> Create one to start chatting!
              </p>
            )}
            {personas.map((persona) => (
              <Card
                key={persona.id}
                className={cn(
                  "cursor-pointer transition-all duration-300 ease-out persona-card border-2 bg-card/80 backdrop-blur-sm",
                  selectedPersonaId === persona.id
                    ? 'border-primary ring-2 ring-primary/50 shadow-lg'
                    : 'border-transparent hover:border-primary/30'
                )}
                onClick={() => onSelectPersona(persona.id)}
              >
                <CardHeader className="flex flex-row items-center gap-3 space-y-0 p-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                       <Avatar className={cn(
                           "h-10 w-10 border-2 transition-transform duration-300 hover:scale-110",
                           persona.isDreamScenario ? 'border-secondary' : 'border-primary'
                         )}>
                         <AvatarFallback className={cn(
                            "font-semibold",
                            persona.isDreamScenario ? 'text-secondary' : 'text-primary'
                          )}>
                           {persona.isDreamScenario ? <Sparkles size={20} /> : <Bot size={20} />}
                         </AvatarFallback>
                       </Avatar>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {persona.isDreamScenario ? <p>Dream Scenario</p> : <p>Persona</p>}
                    </TooltipContent>
                  </Tooltip>

                  <div className="grid gap-0.5 flex-1">
                    <CardTitle className="text-card-foreground text-base font-semibold line-clamp-1">{persona.name}</CardTitle>
                    <CardDescription className="line-clamp-1 text-muted-foreground text-xs">
                        {persona.isDreamScenario ? persona.skills : persona.greeting}
                    </CardDescription>
                  </div>

                   {/* Edit Button */}
                   <Tooltip>
                        <TooltipTrigger asChild>
                           <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-primary transition-colors rounded-full opacity-70 hover:opacity-100" // Use primary color for edit hover
                              onClick={(e) => handleEditClick(e, persona.id)}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit Persona</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <p>Edit {persona.name}</p>
                        </TooltipContent>
                    </Tooltip>


                   {/* Delete Button */}
                   <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive transition-colors rounded-full opacity-70 hover:opacity-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete Persona</span>
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete "{persona.name}"?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. All chat history associated with this persona will be permanently lost.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90 button-fancy"
                          onClick={() => onDeletePersona(persona.id)}>
                          Delete Permanently
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardHeader>
              </Card>
            ))}
          </div>
       </TooltipProvider>
    </ScrollArea>
  );
}
