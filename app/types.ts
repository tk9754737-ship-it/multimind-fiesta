import { ReactNode } from "react";

export interface ChatMessage {
  role: "user" | "assistant";
  model?: string;
  content: string;
  timestamp: number;
}

export interface ChatSession {
  firstMessage: ReactNode;
  id: string;
  title: string;
  messages: ChatMessage[];
  date: string;
}
// In your types.ts, add search functionality
export interface SearchResult {
  id: string;
  type: 'session' | 'message';
  title: string;
  content: string;
  sessionId?: string;
  timestamp: string;
}