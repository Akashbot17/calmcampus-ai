export interface User {
  id: string;
  name: string;
  email: string;
  course?: string | null;
  year?: string | null;
  studyPreferences?: string | null;
  onboarded: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export type MoodValue = "calm" | "okay" | "neutral" | "stressed" | "overwhelmed";

export interface MoodEntry {
  id: string;
  mood: MoodValue;
  note?: string | null;
  createdAt: string;
}

export interface FlashcardDeck {
  id: string;
  subject: string;
  title: string;
  cardCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  box: number;
  lastReviewed?: string | null;
  createdAt: string;
}

export type Priority = "Low" | "Medium" | "High";

export interface StudyTask {
  id: string;
  subject: string;
  task: string;
  examDate?: string | null;
  priority: Priority;
  estimatedHours?: number | null;
  completed: boolean;
  createdAt: string;
}
