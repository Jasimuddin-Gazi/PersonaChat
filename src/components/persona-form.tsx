"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Sparkles } from "lucide-react"; // Added Sparkles for Dream Mode

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
import { Checkbox } from "@/components/ui/checkbox"; // Import Checkbox
import { useToast } from "@/hooks/use-toast";
import { createPersonaAction, CreatePersonaInput } from "@/app/actions"; // Import CreatePersonaInput type
import type { Persona } from "@/types/persona";

const formSchema = z.object({
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }).max(500, {
    message: "Description cannot exceed 500 characters.",
  }),
  isDreamScenario: z.boolean().default(false).optional(), // Add checkbox schema field
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
      isDreamScenario: false, // Default to false
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      // Pass the isDreamScenario value to the action
      const actionInput: CreatePersonaInput = {
         personaDescription: values.description,
         isDreamScenario: values.isDreamScenario
      };
      const createdDetails = await createPersonaAction(actionInput);

      const newPersona: Persona = {
        id: crypto.randomUUID(), // Generate a simple unique ID
        name: createdDetails.personaName,
        description: values.description, // Use the user's input description
        greeting: createdDetails.personaGreeting,
        tone: createdDetails.personaTone,
        skills: createdDetails.personaSkills, // This holds skills or scenario summary
        createdAt: new Date(),
        isDreamScenario: createdDetails.isDreamScenario, // Store the flag
      };

      onPersonaCreated(newPersona);
      toast({
        title: newPersona.isDreamScenario ? "Dream Scenario Created!" : "Persona Created!",
        description: `Say hello to ${newPersona.name}.`,
      });
      form.reset(); // Reset form after successful creation
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Persona Description / Scenario</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the AI persona OR the Dream Scenario (e.g., 'A council of philosophers discussing ethics', 'A helpful coding assistant specializing in Python...')"
                  className="resize-none"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>
                For personas: role, personality, skills. For Dream Scenarios: the scene and characters.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

         <FormField
          control={form.control}
          name="isDreamScenario"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
               <FormControl>
                 <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                 />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="flex items-center gap-1.5">
                    <Sparkles size={16} className="text-yellow-500"/> Dream Scenario Mode
                </FormLabel>
                <FormDescription>
                  Check this to create a chatroom with simulated characters based on your description.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
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
