// src/ai/flows/create-persona.ts
'use server';

/**
 * @fileOverview AI persona creation flow.
 *
 * This file defines a Genkit flow for creating AI personas based on user descriptions.
 * It supports standard personas and "Dream Scenario" personas.
 * It exports the `createPersona` function, along with its input and output types.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const CreatePersonaInputSchema = z.object({
  personaDescription: z
    .string()
    .describe(
      'A detailed description of the AI persona, including its role, personality, and any specific skills or knowledge it should possess. For Dream Scenarios, describe the overall scene and the characters involved.'
    ),
  isDreamScenario: z
    .boolean()
    .optional()
    .describe('Whether this persona represents a Dream Scenario involving multiple characters.'),
});
export type CreatePersonaInput = z.infer<typeof CreatePersonaInputSchema>;

const CreatePersonaOutputSchema = z.object({
  personaName: z.string().describe('The generated name of the AI persona or scenario.'),
  personaGreeting: z
    .string()
    .describe('A short greeting or introduction for the AI persona or scenario.'),
  personaTone: z.string().describe('The overall tone of the AI persona or scenario.'),
  personaSkills: z.string().describe('The skills of the AI persona or a summary of the characters/scenario.'),
  isDreamScenario: z.boolean().optional().describe('Indicates if this is a Dream Scenario.'),
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
          'A detailed description of the AI persona, including its role, personality, and any specific skills or knowledge it should possess. For Dream Scenarios, describe the overall scene and the characters involved.'
        ),
      isDreamScenario: z
        .boolean()
        .optional()
        .describe('Whether this persona represents a Dream Scenario involving multiple characters.'),
    }),
  },
  output: {
    schema: z.object({
      personaName: z.string().describe('The generated name of the AI persona or scenario (e.g., "Philosophers Council", "Marvel Heroes Meeting").'),
      personaGreeting: z
        .string()
        .describe('A short greeting or introduction fitting the persona or scenario (e.g., "Welcome seeker of wisdom!", "Avengers assemble! What\'s the situation?").'),
      personaTone: z.string().describe('The overall tone (e.g., "Philosophical, inquisitive", "Heroic, urgent", "Friendly, helpful").'),
      personaSkills: z.string().describe('For a single persona: its skills. For a Dream Scenario: a brief summary of the characters present or the scenario theme (e.g., "Discussing ethics", "Planning the next mission", "Business mentoring").'),
      isDreamScenario: z.boolean().optional().describe('Set to true if this is a Dream Scenario based on the input flag.'),
    }),
  },
  prompt: `You are an AI persona creation expert. Generate the name, greeting, tone, and skills/summary for an AI interaction based on the description provided.

{{#if isDreamScenario}}
This is a "Dream Scenario". The user wants to simulate a chatroom with fictional or historical characters. The name should reflect the scenario (e.g., "Council of Philosophers", "Marvel Heroes Meeting"). The greeting should set the scene. The tone should match the scenario. The skills field should briefly summarize the scenario or characters involved. Set 'isDreamScenario' to true in the output.
{{else}}
This is a standard single AI persona. Generate a suitable name, greeting, tone, and list its key skills based on the description. Set 'isDreamScenario' to false or omit it.
{{/if}}

Description: {{{personaDescription}}}

Generate the following details:
Name:
Greeting:
Tone:
Skills/Summary:
isDreamScenario: (true or false/omit)
`,
});

const createPersonaFlow = ai.defineFlow<typeof CreatePersonaInputSchema, typeof CreatePersonaOutputSchema>(
  {
    name: 'createPersonaFlow',
    inputSchema: CreatePersonaInputSchema,
    outputSchema: CreatePersonaOutputSchema,
  },
  async input => {
    const {output} = await createPersonaPrompt(input);
    // Ensure the output reflects the input flag, even if the LLM forgets
    return { ...output!, isDreamScenario: !!input.isDreamScenario };
  }
);
