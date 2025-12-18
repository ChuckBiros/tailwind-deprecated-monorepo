/**
 * Utility functions for regex operations.
 */

/**
 * Escapes special regex characters in a string.
 * Use this when creating a regex from a user-provided string.
 *
 * @param text - The string to escape
 * @returns The escaped string safe for use in a RegExp
 *
 * @example
 * ```ts
 * const className = 'tw-badge[hover]';
 * const regex = new RegExp(escapeRegExp(className), 'g');
 * // regex will match literal "tw-badge[hover]"
 * ```
 */
export function escapeRegExp(text: string): string {
  return text.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Creates a regex pattern that matches a class name as a whole word,
 * considering that class names can contain hyphens.
 *
 * Uses negative lookbehind/lookahead to ensure we don't match
 * partial class names (e.g., "tw-badge" should not match in "tw-badge-large").
 *
 * @param className - The class name to create a pattern for
 * @returns A regex pattern string
 */
export function createWholeClassPattern(className: string): string {
  const escaped = escapeRegExp(className);
  // Negative lookbehind for word chars or hyphen, negative lookahead for word chars or hyphen
  return `(?<![\\w-])${escaped}(?![\\w-])`;
}

/**
 * Creates a compiled RegExp for matching a class name as a whole word.
 *
 * @param className - The class name to match
 * @param flags - RegExp flags (default: 'g' for global matching)
 * @returns A compiled RegExp
 */
export function createWholeClassRegex(className: string, flags = 'g'): RegExp {
  return new RegExp(createWholeClassPattern(className), flags);
}

