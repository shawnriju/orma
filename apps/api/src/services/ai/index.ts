/**
 * AI Provider registry — the single import point for all AI functionality.
 *
 * To switch AI backends (e.g. OpenAI → Anthropic), change only this file:
 *   1. Import the new provider class
 *   2. Replace: `const provider: AIProvider = new OpenAIProvider()`
 *
 * All routes import from HERE, never directly from a provider implementation.
 */
import { OpenAIProvider } from './openai.js'
import type { AIProvider } from './types.js'

// Active provider — swap this line to change the entire AI backend
const provider: AIProvider = new OpenAIProvider()

export function getAIProvider(): AIProvider {
  return provider
}

// Re-export types so callers only need one import path
export type { FlashcardDraft, AIProvider } from './types.js'
