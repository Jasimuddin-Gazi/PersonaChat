// src/ai/tools/utility-tools.ts
'use server';
/**
 * @fileOverview Defines utility tools for AI flows.
 *
 * - getCurrentTime - A tool that returns the current time.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';

export const getCurrentTime = ai.defineTool(
  {
    name: 'getCurrentTime',
    description: 'Returns the current date and time.',
    inputSchema: z.object({}), // No input needed
    outputSchema: z.string().describe('The current date and time as a string.'),
  },
  async () => {
    // This function runs on the server when the tool is called by the AI
    return new Date().toLocaleString();
  }
);
