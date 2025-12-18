import { defaultPatternRegistry, PatternRegistry } from './patterns/PatternRegistry';
import { createWholeClassRegex } from '../../utils/regex';

import type { ClassPattern, PatternMatch } from './patterns/ClassPattern';
import type { ClassUsage } from '../../types/ClassUsage';
import type { DeprecatedClassMap } from '../../types/DeprecatedClass';

/**
 * Options for the class detector.
 */
export interface ClassDetectorOptions {
  /** Pattern registry to use (defaults to built-in patterns) */
  readonly patternRegistry?: PatternRegistry;

  /** Whether to perform fallback direct search (default: true) */
  readonly enableFallbackSearch?: boolean;
}

/**
 * Detects usages of deprecated CSS classes in source code.
 *
 * Uses a two-phase approach:
 * 1. Pattern-based detection for known syntaxes (class="...", className=..., etc.)
 * 2. Fallback direct search for edge cases
 *
 * @example
 * ```ts
 * const detector = new ClassDetector();
 * const deprecatedClasses = new Map([['old-class', { className: 'old-class', message: '...' }]]);
 * const usages = detector.findUsages(sourceCode, deprecatedClasses);
 * ```
 */
export class ClassDetector {
  private readonly patternRegistry: PatternRegistry;
  private readonly enableFallbackSearch: boolean;

  constructor(options: ClassDetectorOptions = {}) {
    this.patternRegistry = options.patternRegistry ?? defaultPatternRegistry;
    this.enableFallbackSearch = options.enableFallbackSearch ?? true;
  }

  /**
   * Finds all usages of deprecated classes in the given text.
   *
   * @param text - The source code to analyze
   * @param deprecatedClasses - Map of deprecated classes to look for
   * @param fileCategory - Optional file category to filter applicable patterns
   * @returns Array of deprecated class usages found
   */
  findUsages(
    text: string,
    deprecatedClasses: DeprecatedClassMap,
    fileCategory?: string
  ): ClassUsage[] {
    if (deprecatedClasses.size === 0) {
      return [];
    }

    const usages: ClassUsage[] = [];
    const lines = text.split('\n');

    // Get applicable patterns
    const patterns = fileCategory
      ? this.patternRegistry.getForCategory(fileCategory)
      : this.patternRegistry.getAll();

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];

      // Phase 1: Pattern-based detection
      this.findPatternMatches(line, lineIndex, patterns, deprecatedClasses, usages);

      // Phase 2: Fallback direct search
      if (this.enableFallbackSearch) {
        this.findDirectMatches(line, lineIndex, deprecatedClasses, usages);
      }
    }

    return usages;
  }

  /**
   * Finds deprecated class usages using registered patterns.
   */
  private findPatternMatches(
    line: string,
    lineIndex: number,
    patterns: ClassPattern[],
    deprecatedClasses: DeprecatedClassMap,
    usages: ClassUsage[]
  ): void {
    for (const pattern of patterns) {
      const matches = pattern.findMatches(line);

      for (const match of matches) {
        this.extractClassesFromMatch(match, lineIndex, deprecatedClasses, usages);
      }
    }
  }

  /**
   * Extracts individual classes from a pattern match and checks if they're deprecated.
   */
  private extractClassesFromMatch(
    match: PatternMatch,
    lineIndex: number,
    deprecatedClasses: DeprecatedClassMap,
    usages: ClassUsage[]
  ): void {
    const individualClasses = this.splitClasses(match.classesString);

    for (const className of individualClasses) {
      const deprecatedInfo = deprecatedClasses.get(className);
      if (!deprecatedInfo) continue;

      // Find the exact position of this class in the classes string
      const positions = this.findClassPositions(match.classesString, className);

      for (const posInClasses of positions) {
        const startChar = match.matchIndex + match.classesOffset + posInClasses;

        // Avoid duplicates
        if (this.isDuplicate(usages, lineIndex, startChar, className)) {
          continue;
        }

        usages.push({
          className,
          line: lineIndex,
          startChar,
          endChar: startChar + className.length,
          deprecatedInfo,
        });
      }
    }
  }

  /**
   * Finds deprecated classes using direct regex search (fallback).
   */
  private findDirectMatches(
    line: string,
    lineIndex: number,
    deprecatedClasses: DeprecatedClassMap,
    usages: ClassUsage[]
  ): void {
    for (const [className, deprecatedInfo] of deprecatedClasses) {
      const regex = createWholeClassRegex(className);
      let match: RegExpExecArray | null;

      while ((match = regex.exec(line)) !== null) {
        const startChar = match.index;

        // Check if already found and if in class context
        if (
          this.isDuplicate(usages, lineIndex, startChar, className) ||
          !this.isInClassContext(line, startChar)
        ) {
          continue;
        }

        usages.push({
          className,
          line: lineIndex,
          startChar,
          endChar: startChar + className.length,
          deprecatedInfo,
        });
      }
    }
  }

  /**
   * Splits a classes string into individual class names.
   */
  private splitClasses(classesString: string): string[] {
    return classesString
      .split(/\s+/)
      .map((c) => c.trim())
      .filter((c) => c.length > 0 && !c.includes('${') && !c.includes('{'));
  }

  /**
   * Finds all positions of a class name in a classes string (as whole words).
   */
  private findClassPositions(classesString: string, className: string): number[] {
    const positions: number[] = [];
    const regex = createWholeClassRegex(className);
    let match: RegExpExecArray | null;

    while ((match = regex.exec(classesString)) !== null) {
      positions.push(match.index);
    }

    return positions;
  }

  /**
   * Checks if a usage has already been recorded.
   */
  private isDuplicate(
    usages: ClassUsage[],
    lineIndex: number,
    startChar: number,
    className: string
  ): boolean {
    return usages.some(
      (u) => u.line === lineIndex && u.startChar === startChar && u.className === className
    );
  }

  /**
   * Checks if a position in a line is within a class context.
   */
  private isInClassContext(line: string, position: number): boolean {
    const beforePosition = line.substring(0, position);

    const contextPatterns = [
      /class\s*=\s*["'][^"']*$/i,
      /className\s*=\s*["'][^"']*$/i,
      /className\s*=\s*\{`[^`]*$/i,
      /:class\s*=\s*["'][^"']*$/i,
      /\[class\]\s*=\s*["'][^"']*$/i,
      /@apply\s+[^;]*$/i,
      /(?:clsx|classNames|cn|twMerge|cva)\s*\([^)]*["'][^"']*$/i,
    ];

    return contextPatterns.some((pattern) => pattern.test(beforePosition));
  }
}

/**
 * Default class detector instance with built-in patterns.
 */
export const defaultClassDetector = new ClassDetector();
