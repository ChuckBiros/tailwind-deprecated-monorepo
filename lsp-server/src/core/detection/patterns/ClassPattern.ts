/**
 * Interface for class detection patterns.
 * Each pattern represents a specific syntax for declaring CSS classes
 * in different frameworks/languages.
 */

/**
 * Result of a pattern match.
 */
export interface PatternMatch {
  /** The full matched string (e.g., `class="foo bar"`) */
  readonly fullMatch: string;

  /** The extracted classes string (e.g., `foo bar`) */
  readonly classesString: string;

  /** Start index of the match in the line */
  readonly matchIndex: number;

  /** Start index of the classes string within the full match */
  readonly classesOffset: number;
}

/**
 * A pattern that can detect class declarations in source code.
 * Implement this interface to add support for new frameworks or syntaxes.
 */
export interface ClassPattern {
  /** Unique identifier for this pattern */
  readonly id: string;

  /** Human-readable name for this pattern */
  readonly name: string;

  /** Description of what syntax this pattern matches */
  readonly description: string;

  /** File categories this pattern applies to (empty = all) */
  readonly applicableCategories?: readonly string[];

  /**
   * Finds all class declarations in a line of code.
   *
   * @param line - The source code line to analyze
   * @returns Array of pattern matches found
   */
  findMatches(line: string): PatternMatch[];
}

/**
 * Creates a RegExp-based class pattern.
 * This is a helper to simplify pattern creation for regex-based detection.
 *
 * @param config - Pattern configuration
 * @returns A ClassPattern implementation
 */
export function createRegexPattern(config: {
  id: string;
  name: string;
  description: string;
  regex: RegExp;
  classesGroupIndex?: number;
  applicableCategories?: readonly string[];
}): ClassPattern {
  const classesGroupIndex = config.classesGroupIndex ?? 1;

  return {
    id: config.id,
    name: config.name,
    description: config.description,
    applicableCategories: config.applicableCategories,

    findMatches(line: string): PatternMatch[] {
      const matches: PatternMatch[] = [];
      // Create a new regex instance to avoid lastIndex issues
      const regex = new RegExp(config.regex.source, config.regex.flags);

      let match: RegExpExecArray | null;
      while ((match = regex.exec(line)) !== null) {
        const classesString = match[classesGroupIndex];
        if (!classesString) continue;

        const fullMatch = match[0];
        const classesOffset = fullMatch.indexOf(classesString);

        matches.push({
          fullMatch,
          classesString,
          matchIndex: match.index,
          classesOffset,
        });
      }

      return matches;
    },
  };
}

