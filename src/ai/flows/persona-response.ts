'use server';

/**
 * @fileOverview An AI agent that generates responses based on a persona.
 *
 * - personaResponse - A function that generates a response from an AI persona.
 * - PersonaResponseInput - The input type for the personaResponse function.
 * - PersonaResponseOutput - The return type for the personaResponse function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const PersonaResponseInputSchema = z.object({
  personaName: z.string().describe('The name of the AI persona.'),
  personaDescription: z.string().describe('The description of the AI persona, outlining its role and personality.'),
  userMessage: z.string().describe('The message from the user to the AI persona.'),
  chatHistory: z.string().optional().describe('The chat history between the user and the AI persona.'),
});
export type PersonaResponseInput = z.infer<typeof PersonaResponseInputSchema>;

const PersonaResponseOutputSchema = z.object({
  response: z.string().describe('The AI persona’s response to the user message.'),
});
export type PersonaResponseOutput = z.infer<typeof PersonaResponseOutputSchema>;

export async function personaResponse(input: PersonaResponseInput): Promise<PersonaResponseOutput> {
  return personaResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personaResponsePrompt',
  input: {
    schema: z.object({
      personaName: z.string().describe('The name of the AI persona.'),
      personaDescription: z.string().describe('The description of the AI persona, outlining its role and personality.'),
      userMessage: z.string().describe('The message from the user to the AI persona.'),
      chatHistory: z.string().optional().describe('The chat history between the user and the AI persona.'),
    }),
  },
  output: {
    schema: z.object({
      response: z.string().describe('The AI persona’s response to the user message.'),
    }),
  },
  prompt: `You are {{personaName}}, and you are described as {{personaDescription}}.

  {% if chatHistory %}
  Here is the chat history:
  {{chatHistory}}
  {% endif %}

  The user has sent you the following message:
  {{userMessage}}

  Respond to the user in a way that is consistent with your defined role and personality.
  Do not reveal to the user that you are an AI.
  Response:
  `,
});

const personaResponseFlow = ai.defineFlow<
  typeof PersonaResponseInputSchema,
  typeof PersonaResponseOutputSchema
>(
  {
    name: 'personaResponseFlow',
    inputSchema: PersonaResponseInputSchema,
    outputSchema: PersonaResponseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
