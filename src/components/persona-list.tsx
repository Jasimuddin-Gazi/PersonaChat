"use client";

import * as React from "react";
import { Bot, Trash2, Sparkles } from "lucide-react"; // Added Sparkles
import { formatDistanceToNow } from 'date-fns';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Added Tooltip
import type { Persona } from "@/types/persona";

type PersonaListProps = {
  personas: Persona[];
  selectedPersonaId: string | null;
  onSelectPersona: (id: string) => void;
  onDeletePersona: (id: string) => void;
};

export function PersonaList({ personas, selectedPersonaId, onSelectPersona, onDeletePersona }: PersonaListProps) {

  const handleDeleteClick = (e: React.MouseEvent, personaId: string) => {
    e.stopPropagation(); // Prevent card selection when clicking delete
    onDeletePersona(personaId);
  };

  return (
    <ScrollArea className="h-full flex-1">
       <TooltipProvider> {/* Wrap list in TooltipProvider */}
          <div className="space-y-4 p-4">
            {personas.length === 0 && (
              <p className="text-center text-muted-foreground">No personas created yet. Create one above!</p>
            )}
            {personas.map((persona) => (
              <Card
                key={persona.id}
                className={`cursor-pointer transition-colors hover:bg-muted/50 ${selectedPersonaId === persona.id ? 'border-primary ring-2 ring-primary' : ''}`}
                onClick={() => onSelectPersona(persona.id)}
              >
                <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-2">
                  {/* Avatar or Dream Scenario Icon */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                       <Avatar className={`h-10 w-10 border ${persona.isDreamScenario ? 'bg-yellow-100 dark:bg-yellow-900' : ''}`}>
                         <AvatarFallback>
                           {persona.isDreamScenario ? <Sparkles size={20} className="text-yellow-500" /> : <Bot size={20} />}
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
                    <CardTitle>{persona.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                        {persona.isDreamScenario ? persona.skills : persona.greeting} {/* Show summary for dream, greeting for normal */}
                    </CardDescription>
                  </div>
                   <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={(e) => e.stopPropagation()} // Prevent card selection
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
                  Created {formatDistanceToNow(persona.createdAt, { addSuffix: true })}
                </CardFooter>
              </Card>
            ))}
          </div>
       </TooltipProvider>
    </ScrollArea>
  );
}
