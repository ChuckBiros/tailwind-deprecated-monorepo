import { builtinPatterns } from './builtinPatterns';

import type { ClassPattern } from './ClassPattern';

/**
 * Registry for class detection patterns.
 * Allows adding custom patterns and filtering by file category.
 *
 * This follows the Open/Closed Principle: you can extend the detection
 * capabilities without modifying existing code.
 */
export class PatternRegistry {
  private readonly patterns: Map<string, ClassPattern> = new Map();

  /**
   * Creates a new pattern registry.
   *
   * @param includeBuiltins - Whether to include built-in patterns (default: true)
   */
  constructor(includeBuiltins = true) {
    if (includeBuiltins) {
      for (const pattern of builtinPatterns) {
        this.register(pattern);
      }
    }
  }

  /**
   * Registers a new pattern.
   * If a pattern with the same ID already exists, it will be replaced.
   *
   * @param pattern - The pattern to register
   */
  register(pattern: ClassPattern): void {
    this.patterns.set(pattern.id, pattern);
  }

  /**
   * Unregisters a pattern by ID.
   *
   * @param patternId - The ID of the pattern to remove
   * @returns True if the pattern was found and removed
   */
  unregister(patternId: string): boolean {
    return this.patterns.delete(patternId);
  }

  /**
   * Gets a pattern by ID.
   *
   * @param patternId - The ID of the pattern to get
   * @returns The pattern or undefined if not found
   */
  get(patternId: string): ClassPattern | undefined {
    return this.patterns.get(patternId);
  }

  /**
   * Gets all registered patterns.
   *
   * @returns Array of all patterns
   */
  getAll(): ClassPattern[] {
    return Array.from(this.patterns.values());
  }

  /**
   * Gets patterns applicable to a specific file category.
   *
   * @param category - The file category to filter by
   * @returns Array of applicable patterns
   */
  getForCategory(category: string): ClassPattern[] {
    return this.getAll().filter((pattern) => {
      // If no categories specified, pattern applies to all
      if (!pattern.applicableCategories || pattern.applicableCategories.length === 0) {
        return true;
      }
      return pattern.applicableCategories.includes(category);
    });
  }

  /**
   * Gets the number of registered patterns.
   */
  get size(): number {
    return this.patterns.size;
  }
}

/**
 * Default pattern registry with all built-in patterns.
 */
export const defaultPatternRegistry = new PatternRegistry(true);
