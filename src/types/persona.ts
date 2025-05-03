export interface Persona {
  id: string; // Unique identifier
  name: string;
  description: string; // The original description provided by the user
  greeting: string;
  tone: string;
  skills: string;
  createdAt: Date;
  isDreamScenario?: boolean; // Flag for Dream Chat Mode
}

