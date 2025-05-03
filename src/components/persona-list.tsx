
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
    e.stopPropagation();
    onDeletePersona(personaId);
  };

  return (
    <ScrollArea className="h-full flex-1">
       <TooltipProvider>
          <div className="space-y-4 p-4">
            {personas.length === 0 && (
              <p className="text-center text-muted-foreground animate-fade-in">No personas created yet. Create one above!</p> // Added animation
            )}
            {personas.map((persona) => (
              <Card
                key={persona.id}
                className={cn(
                  "cursor-pointer transition-all duration-300 ease-in-out hover:shadow-lg hover:border-primary/50 persona-card", // Added persona-card class and hover effects
                  selectedPersonaId === persona.id ? 'border-primary ring-2 ring-primary shadow-md' : 'border-border' // Simplified selection style
                )}
                onClick={() => onSelectPersona(persona.id)}
              >
                <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                       <Avatar className={`h-10 w-10 border transition-transform duration-300 hover:scale-110 ${persona.isDreamScenario ? 'bg-accent/20 border-accent' : 'border-primary'}`}> {/* Style tweaks */}
                         <AvatarFallback className={`${persona.isDreamScenario ? 'text-accent' : 'text-primary'}`}>
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

                  <div className="grid gap-1 flex-1">
                    <CardTitle className="text-card-foreground">{persona.name}</CardTitle> {/* Ensure foreground color */}
                    <CardDescription className="line-clamp-2 text-muted-foreground"> {/* Ensure muted foreground color */}
                        {persona.isDreamScenario ? persona.skills : persona.greeting}
                    </CardDescription>
                  </div>
                   <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors" // Added transition
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete Persona</span>
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete "{persona.name}" and all associated chat history.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={(e) => handleDeleteClick(e, persona.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardHeader>
                <CardFooter className="text-xs text-muted-foreground pt-2">
                  Created {formatDistanceToNow(new Date(persona.createdAt), { addSuffix: true })} {/* Ensure Date object */}
                </CardFooter>
              </Card>
            ))}
          </div>
       </TooltipProvider>
    </ScrollArea>
  );
}
