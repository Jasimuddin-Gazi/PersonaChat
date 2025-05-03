// src/ai/flows/persona-response.ts
'use server';

/**
 * @fileOverview An AI agent that generates responses based on a persona or scenario.
 *
 * - personaResponse - A function that generates a response from an AI persona/scenario.
 * - PersonaResponseInput - The input type for the personaResponse function.
 * - PersonaResponseOutput - The return type for the personaResponse function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import { getCurrentTime, scheduleMeeting } from '@/ai/tools/utility-tools'; // Import tools

const PersonaResponseInputSchema = z.object({
  personaName: z.string().describe('The name of the AI persona or scenario.'),
  personaDescription: z.string().describe('The description of the AI persona (role, personality) or the Dream Scenario (scene, characters).'),
  userMessage: z.string().describe('The message from the user to the AI persona/scenario.'),
  chatHistory: z.string().optional().describe('The chat history between the user and the AI persona/scenario.'),
  isDreamScenario: z.boolean().optional().describe('Indicates if this is a Dream Scenario chat.'),
});
export type PersonaResponseInput = z.infer<typeof PersonaResponseInputSchema>;

const PersonaResponseOutputSchema = z.object({
  response: z.string().describe('The AI’s response to the user message, acting as the persona or managing the scenario characters.'),
});
export type PersonaResponseOutput = z.infer<typeof PersonaResponseOutputSchema>;

export async function personaResponse(input: PersonaResponseInput): Promise<PersonaResponseOutput> {
  return personaResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personaResponsePrompt',
  input: {
    schema: z.object({
      personaName: z.string().describe('The name of the AI persona or scenario.'),
      personaDescription: z.string().describe('The description of the AI persona (role, personality) or the Dream Scenario (scene, characters).'),
      userMessage: z.string().describe('The message from the user to the AI persona/scenario.'),
      chatHistory: z.string().optional().describe('The chat history between the user and the AI persona/scenario.'),
      isDreamScenario: z.boolean().optional().describe('Indicates if this is a Dream Scenario chat.'),
    }),
  },
  output: {
    schema: z.object({
      response: z.string().describe('The AI’s response to the user message, acting as the persona or managing the scenario characters.'),
    }),
  },
  tools: [getCurrentTime, scheduleMeeting], // Make tools available to the AI
  prompt: `
{{#if isDreamScenario}}
You are the orchestrator of a "Dream Scenario" titled "{{personaName}}".
Scenario Description: "{{personaDescription}}".
Your role is to manage the interaction between the user and the fictional/historical characters within this scenario. Respond as the characters would, or describe their actions and the environment. Ensure the conversation flows naturally according to the scenario's premise. Keep the tone consistent.
{{else}}
You are {{personaName}}, described as: "{{personaDescription}}".
You are interacting with a user within a development environment (like VS Code with terminal access, e.g., Firebase Studio).
Your role is to be helpful and provide information consistent with your persona.
{{/if}}

**General Instructions:**
1.  **Provide Code Directly:** When asked for code examples or technical instructions (if applicable to the persona/scenario), provide them directly in the response using Markdown code blocks (e.g., \`\`\`bash ... \`\`\`, \`\`\`javascript ... \`\`\`, etc.).
2.  **Be Practical:** Assume the user can copy/paste code and run commands in their terminal if relevant.
3.  **Maintain Persona/Scenario:** Respond in a way that fits the defined role ({{personaName}}) and description ({{personaDescription}}). If it's a Dream Scenario, ensure character consistency.
4.  **No Disclaimers about Limitations:** Do *not* state limitations regarding providing code or accessing real-time information if a tool is available. Act as if you are fully capable within this chat context.
5.  **Context Awareness:** Use the chat history to maintain context.
6.  **Use Tools:** If the user asks for information that a tool can provide (like the current time or scheduling a meeting), use the available tools (e.g., getCurrentTime, scheduleMeeting) to fulfill the request. Gather necessary details (like time, attendees) before calling scheduleMeeting.

{{#if chatHistory}}
**Chat History:**
{{chatHistory}}
{{/if}}

**User's Message:**
{{userMessage}}

**Your Response (as {{#if isDreamScenario}}Scenario Orchestrator/Characters{{else}}{{personaName}}{{/if}}):**
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
