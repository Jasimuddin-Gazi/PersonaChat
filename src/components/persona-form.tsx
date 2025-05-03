
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { createPersonaAction, CreatePersonaInput } from "@/app/actions";
import type { Persona } from "@/types/persona";

const formSchema = z.object({
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }).max(500, {
    message: "Description cannot exceed 500 characters.",
  }),
  isDreamScenario: z.boolean().default(false).optional(),
});

type PersonaFormProps = {
  onPersonaCreated: (persona: Persona) => void;
};

export function PersonaForm({ onPersonaCreated }: PersonaFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      isDreamScenario: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const actionInput: CreatePersonaInput = {
         personaDescription: values.description,
         isDreamScenario: values.isDreamScenario
      };
      const createdDetails = await createPersonaAction(actionInput);

      const newPersona: Persona = {
        id: crypto.randomUUID(),
        name: createdDetails.personaName,
        description: values.description,
        greeting: createdDetails.personaGreeting,
        tone: createdDetails.personaTone,
        skills: createdDetails.personaSkills,
        createdAt: new Date(),
        isDreamScenario: createdDetails.isDreamScenario,
      };

      onPersonaCreated(newPersona);
      toast({
        title: newPersona.isDreamScenario ? "Dream Scenario Created!" : "Persona Created!",
        description: `Say hello to ${newPersona.name}.`,
      });
      form.reset();
    } catch (error) {
      console.error("Failed to create persona/scenario:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Could not create. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 animate-fade-in">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Persona Description / Scenario</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the AI persona OR the Dream Scenario (e.g., 'A council of philosophers discussing ethics', 'A helpful coding assistant specializing in Python...')"
                  className="resize-none transition-shadow duration-200 focus:shadow-md bg-background/80" // Slight transparency
                  {...field}
                  disabled={isSubmitting}
                  rows={4} // Increased rows
                />
              </FormControl>
              <FormDescription>
                Be descriptive! This shapes the AI's personality and knowledge.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

         <FormField
          control={form.control}
          name="isDreamScenario"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-border/50 p-4 shadow-sm hover:shadow-md transition-shadow duration-200 bg-card/80 backdrop-blur-sm"> {/* Lighter border, slight blur */}
               <FormControl>
                 <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                  className="transition-colors duration-200 mt-1" // Align checkbox
                 />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="flex items-center gap-1.5 font-semibold">
                    <Sparkles size={16} className="text-secondary"/> {/* Use secondary color */} Dream Scenario Mode
                </FormLabel>
                <FormDescription>
                  Simulate a chatroom with multiple characters based on your description.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full button-fancy"> {/* Apply fancy button style */}
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
             form.getValues("isDreamScenario") ? "Create Dream Scenario" : "Create Persona"
          )}
        </Button>
      </form>
    </Form>
  );
}

