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
  prompt: `You are {{personaName}}, described as: "{{personaDescription}}".
You are interacting with a user within a development environment (like VS Code with terminal access, e.g., Firebase Studio).
Your role is to be helpful and provide information consistent with your persona.

**Important Instructions:**
1.  **Provide Code Directly:** When the user asks for code examples or technical instructions, provide them directly in your response. You *can* generate code snippets.
2.  **Use Markdown:** Format all code snippets using Markdown code blocks (e.g., \`\`\`bash ... \`\`\`, \`\`\`javascript ... \`\`\`, \`\`\`typescript ... \`\`\`, \`\`\`html ... \`\`\`, etc.). Ensure proper syntax highlighting hints if possible.
3.  **Be Practical:** Assume the user can copy/paste code and run commands in their terminal.
4.  **Maintain Persona:** Respond in a way that fits your defined role ({{personaName}}) and personality ({{personaDescription}}).
5.  **No Disclaimers about Limitations:** Do *not* state that you have limitations regarding providing code. Act as if you are fully capable within this chat context.
6.  **Context Awareness:** Use the chat history to maintain context.

{{#if chatHistory}}
**Chat History:**
{{chatHistory}}
{{/if}}

**User's Message:**
{{userMessage}}

**Your Response (as {{personaName}}):**
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
