/**
 * Utilities for extracting plain text from ProseMirror / Tiptap JSON documents.
 *
 * Moved here from routes/flashcards.ts — content transformation logic has no
 * business being in an HTTP route handler, and may be needed by other modules
 * (e.g. search indexing, word count, email previews).
 */

/**
 * Extracts plain text from a ProseMirror document.
 * Accepts either a parsed JSON object or a raw JSON string.
 * Returns an empty string if the document is empty, null, or unparseable.
 */
export function extractTextFromProseMirror(doc: any): string {
  if (!doc) return ''
  if (typeof doc === 'string') {
    try {
      doc = JSON.parse(doc)
    } catch {
      // If it's already a plain string (not a JSON doc), return it as-is
      return doc
    }
  }
  if (!doc?.content) return ''
  return doc.content
    .flatMap((node: any) => extractNodeText(node))
    .join('\n')
}

function extractNodeText(node: any): string[] {
  if (node.type === 'text') return [node.text ?? '']
  if (node.content) return node.content.flatMap(extractNodeText)
  return []
}
