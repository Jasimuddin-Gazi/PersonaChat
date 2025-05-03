"use server";

import { createPersona as createPersonaFlow, CreatePersonaInput, CreatePersonaOutput } from "@/ai/flows/create-persona";
import { personaResponse as personaResponseFlow, PersonaResponseInput, PersonaResponseOutput } from "@/ai/flows/persona-response";
import type { Persona } from "@/types/persona";

/**
 * Creates a new AI persona or Dream Scenario using the createPersonaFlow.
 * @param input - The input containing the description and type (standard/dream).
 * @returns The details of the created persona/scenario.
 * @throws Will throw an error if the AI flow fails.
 */
export async function createPersonaAction(input: CreatePersonaInput): Promise<CreatePersonaOutput> {
  try {
    console.log("Calling createPersonaFlow with input:", input);
    const result = await createPersonaFlow(input);
    console.log("createPersonaFlow returned:", result);
    if (!result?.personaName || !result?.personaGreeting || !result?.personaTone || !result?.personaSkills) {
      throw new Error("AI failed to generate complete persona details.");
    }
    // Ensure the output flag matches the input for consistency client-side
    return { ...result, isDreamScenario: !!input.isDreamScenario };
  } catch (error) {
    console.error("Error in createPersonaAction:", error);
    // Consider more specific error handling or logging
    throw new Error("Failed to create persona. Please try again.");
  }
}

/**
 * Generates a response from an AI persona or Dream Scenario using the personaResponseFlow.
 * @param input - The input containing persona/scenario details, user message, and chat history.
 * @returns The AI's response.
 * @throws Will throw an error if the AI flow fails.
 */
export async function getPersonaResponseAction(input: PersonaResponseInput): Promise<PersonaResponseOutput> {
  try {
    console.log("Calling personaResponseFlow with input:", {
      ...input,
      chatHistory: input.chatHistory ? '[history present]' : '[no history]' // Avoid logging potentially large history
    });
    const result = await personaResponseFlow(input);
    console.log("personaResponseFlow returned:", result);
     if (!result?.response) {
      throw new Error("AI failed to generate a response.");
    }
    return result;
  } catch (error) {
    console.error("Error in getPersonaResponseAction:", error);
    // Consider more specific error handling or logging
    throw new Error("Failed to get persona response. Please try again.");
  }
}
