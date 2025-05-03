// src/ai/flows/create-persona.ts
'use server';

/**
 * @fileOverview AI persona creation flow.
 *
 * This file defines a Genkit flow for creating AI personas based on user descriptions.
 * It exports the `createPersona` function, along with its input and output types.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const CreatePersonaInputSchema = z.object({
  personaDescription: z
    .string()
    .describe(
      'A detailed description of the AI persona, including its role, personality, and any specific skills or knowledge it should possess.'
    ),
});
export type CreatePersonaInput = z.infer<typeof CreatePersonaInputSchema>;

const CreatePersonaOutputSchema = z.object({
  personaName: z.string().describe('The generated name of the AI persona.'),
  personaGreeting: z
    .string()
    .describe('A short greeting or introduction for the AI persona.'),
  personaTone: z.string().describe('The tone of the AI persona.'),
  personaSkills: z.string().describe('The skills of the AI persona.'),
});
export type CreatePersonaOutput = z.infer<typeof CreatePersonaOutputSchema>;

export async function createPersona(input: CreatePersonaInput): Promise<CreatePersonaOutput> {
  return createPersonaFlow(input);
}

const createPersonaPrompt = ai.definePrompt({
  name: 'createPersonaPrompt',
  input: {
    schema: z.object({
      personaDescription: z
        .string()
        .describe(
          'A detailed description of the AI persona, including its role, personality, and any specific skills or knowledge it should possess.'
        ),
    }),
  },
  output: {
    schema: z.object({
      personaName: z.string().describe('The generated name of the AI persona.'),
      personaGreeting: z
        .string()
        .describe('A short greeting or introduction for the AI persona.'),
      personaTone: z.string().describe('The tone of the AI persona.'),
      personaSkills: z.string().describe('The skills of the AI persona.'),
    }),
  },
  prompt: `You are an AI persona creation expert. Generate the name, greeting, tone, and skills of the AI persona based on the description provided by the user.

Description: {{{personaDescription}}}

Name:
Greeting:
Tone:
Skills:`,
});

const createPersonaFlow = ai.defineFlow<typeof CreatePersonaInputSchema, typeof CreatePersonaOutputSchema>(
  {
    name: 'createPersonaFlow',
    inputSchema: CreatePersonaInputSchema,
    outputSchema: CreatePersonaOutputSchema,
  },
  async input => {
    const {output} = await createPersonaPrompt(input);
    return output!;
  }
);
