"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";

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
import { useToast } from "@/hooks/use-toast";
import { createPersonaAction } from "@/app/actions";
import type { Persona } from "@/types/persona";

const formSchema = z.object({
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }).max(500, {
    message: "Description cannot exceed 500 characters.",
  }),
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
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const createdDetails = await createPersonaAction({ personaDescription: values.description });

      const newPersona: Persona = {
        id: crypto.randomUUID(), // Generate a simple unique ID
        name: createdDetails.personaName,
        description: values.description, // Use the user's input description
        greeting: createdDetails.personaGreeting,
        tone: createdDetails.personaTone,
        skills: createdDetails.personaSkills,
        createdAt: new Date(),
      };

      onPersonaCreated(newPersona);
      toast({
        title: "Persona Created!",
        description: `Say hello to ${newPersona.name}.`,
      });
      form.reset(); // Reset form after successful creation
    } catch (error) {
      console.error("Failed to create persona:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Could not create persona. Please try again.",
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
              <FormLabel>Persona Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the AI persona you want to create (e.g., 'A friendly and helpful business mentor specializing in marketing...')"
                  className="resize-none"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>
                Provide details about the persona's role, personality, skills, etc.
              </FormDescription>
              <FormMessage />
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
            "Create Persona"
          )}
        </Button>
      </form>
    </Form>
  );
}
