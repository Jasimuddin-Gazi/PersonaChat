
"use client";

import * as React from "react";
import { Bot, Trash2, Sparkles } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"; // Adjusted imports
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar"; // Removed AvatarImage as it's unused
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
import { cn } from "@/lib/utils"; // Import cn utility

type PersonaListProps = {
  personas: Persona[];
  selectedPersonaId: string | null;
  onSelectPersona: (id: string) => void;
  onDeletePersona: (id: string) => void;
};

export function PersonaList({ personas, selectedPersonaId, onSelectPersona, onDeletePersona }: PersonaListProps) {

  const handleDeleteClick = (e: React.MouseEvent, personaId: string) => {
    e.stopPropagation(); // Prevent card selection when clicking delete
    // Find the persona being deleted to show its name in the confirmation
    const personaToDelete = personas.find(p => p.id === personaId);
    if (personaToDelete) {
        // The AlertDialog will handle the actual deletion call via its action button
        // This function is now primarily for stopping propagation
    }
  };

  return (
    <ScrollArea className="h-full flex-1">
       <TooltipProvider delayDuration={100}> {/* Shorter delay */}
          <div className="space-y-3 p-3"> {/* Reduced spacing and padding */}
            {personas.length === 0 && (
              <p className="text-center text-muted-foreground p-6 animate-fade-in-delay"> {/* Added delay */}
                No personas yet. <br/> Create one to start chatting!
              </p>
            )}
            {personas.map((persona) => (
              <Card
                key={persona.id}
                className={cn(
                  "cursor-pointer transition-all duration-300 ease-out persona-card border-2 bg-card/80 backdrop-blur-sm", // Use persona-card class, blur effect
                  selectedPersonaId === persona.id
                    ? 'border-primary ring-2 ring-primary/50 shadow-lg' // Enhanced selection style
                    : 'border-transparent hover:border-primary/30' // Transparent base border, subtle hover
                )}
                onClick={() => onSelectPersona(persona.id)}
              >
                <CardHeader className="flex flex-row items-center gap-3 space-y-0 p-3"> {/* Reduced padding */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                       <Avatar className={cn(
                           "h-10 w-10 border-2 transition-transform duration-300 hover:scale-110",
                           persona.isDreamScenario ? 'border-secondary' : 'border-primary' // Use secondary for dream
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

                  <div className="grid gap-0.5 flex-1"> {/* Reduced gap */}
                    <CardTitle className="text-card-foreground text-base font-semibold line-clamp-1">{persona.name}</CardTitle> {/* Adjusted size/weight */}
                    <CardDescription className="line-clamp-1 text-muted-foreground text-xs"> {/* Adjusted size */}
                        {persona.isDreamScenario ? persona.skills : persona.greeting}
                    </CardDescription>
                  </div>
                   <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive transition-colors rounded-full opacity-70 hover:opacity-100" // Smaller, rounded, opacity transition
                          onClick={(e) => e.stopPropagation()} // Stop propagation here too
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
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90 button-fancy" // Apply fancy button style
                          onClick={() => onDeletePersona(persona.id)}> {/* Actual delete call */}
                          Delete Permanently
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardHeader>
                {/* Removed Footer for cleaner look, creation time might not be essential */}
                {/*
                <CardFooter className="text-xs text-muted-foreground pt-2 pb-3 px-3">
                  Created {formatDistanceToNow(new Date(persona.createdAt), { addSuffix: true })}
                </CardFooter>
                */}
              </Card>
            ))}
          </div>
       </TooltipProvider>
    </ScrollArea>
  );
}
