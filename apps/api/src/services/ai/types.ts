/**
 * Shared types for the AI provider abstraction layer.
 * Any AI backend (OpenAI, Anthropic, etc.) must implement AIProvider.
 */

export interface FlashcardDraft {
  question: string
  answer: string
}

export interface AIProvider {
  generateFlashcards(content: string): Promise<FlashcardDraft[]>
}
