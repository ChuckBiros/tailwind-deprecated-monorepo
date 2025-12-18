import type { DeprecatedClass } from '../../types/DeprecatedClass';

/**
 * Result of parsing a CSS file for deprecated classes.
 */
export interface CssParseResult {
  /** List of deprecated classes found */
  readonly classes: readonly DeprecatedClass[];

  /** Any errors encountered during parsing */
  readonly errors: readonly string[];
}

/**
 * Parses CSS/SCSS content and extracts classes marked with --deprecated.
 *
 * Supports:
 * - Standard CSS class definitions: `.class-name { --deprecated: "message"; }`
 * - Multiple selectors: `.class1, .class2 { --deprecated: "message"; }`
 * - SCSS nested parent selectors: `&.modifier { --deprecated: "message"; }`
 *
 * @param cssContent - The CSS/SCSS file content
 * @param sourceFile - Absolute path to the source file
 * @returns Parse result with deprecated classes and any errors
 *
 * @example
 * ```ts
 * const result = parseCss(`
 *   .old-button {
 *     --deprecated: "Use .btn-primary instead";
 *     color: red;
 *   }
 * `, '/path/to/file.css');
 *
 * // result.classes = [{ className: 'old-button', message: 'Use .btn-primary instead', ... }]
 * ```
 */
export function parseCss(cssContent: string, sourceFile: string): CssParseResult {
  const classes: DeprecatedClass[] = [];
  const errors: string[] = [];

  try {
    // Parse standard CSS rule blocks
    const standardClasses = parseStandardRuleBlocks(cssContent, sourceFile);
    classes.push(...standardClasses);

    // Parse SCSS nested parent selectors
    const nestedClasses = parseNestedParentSelectors(cssContent, sourceFile);
    classes.push(...nestedClasses);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(`Failed to parse ${sourceFile}: ${message}`);
  }

  return { classes, errors };
}

/**
 * Regex for matching CSS rule blocks with selectors and body.
 * Matches: .class { content } and .class1, .class2 { content }
 */
const RULE_BLOCK_REGEX = /([.#][\w-]+(?:\s*,\s*[.#][\w-]+)*)\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g;

/**
 * Regex for extracting --deprecated property value.
 */
const DEPRECATED_PROPERTY_REGEX = /--deprecated\s*:\s*["']([^"']+)["']/;

/**
 * Regex for extracting class names from a selector.
 */
const CLASS_NAME_REGEX = /\.([a-zA-Z_][\w-]*)/g;

/**
 * Parses standard CSS rule blocks for deprecated classes.
 */
function parseStandardRuleBlocks(cssContent: string, sourceFile: string): DeprecatedClass[] {
  const result: DeprecatedClass[] = [];
  let match: RegExpExecArray | null;

  // Reset regex state
  RULE_BLOCK_REGEX.lastIndex = 0;

  while ((match = RULE_BLOCK_REGEX.exec(cssContent)) !== null) {
    const selectorPart = match[1];
    const blockContent = match[2];

    // Check for --deprecated in the block
    const deprecatedMatch = DEPRECATED_PROPERTY_REGEX.exec(blockContent);
    if (!deprecatedMatch) {
      continue;
    }

    const message = deprecatedMatch[1];

    // Extract all class names from the selector
    const classMatches = selectorPart.matchAll(CLASS_NAME_REGEX);

    for (const classMatch of classMatches) {
      const className = classMatch[1];
      result.push({
        className,
        message,
        sourceFile,
      });
    }
  }

  return result;
}

/**
 * Regex for SCSS nested parent selectors: &.modifier { ... }
 */
const NESTED_PARENT_REGEX = /&(\.[\w-]+)\s*\{([^{}]*)\}/g;

/**
 * Parses SCSS nested parent selectors for deprecated classes.
 */
function parseNestedParentSelectors(cssContent: string, sourceFile: string): DeprecatedClass[] {
  const result: DeprecatedClass[] = [];
  let match: RegExpExecArray | null;

  // Reset regex state
  NESTED_PARENT_REGEX.lastIndex = 0;

  while ((match = NESTED_PARENT_REGEX.exec(cssContent)) !== null) {
    const classSelector = match[1];
    const blockContent = match[2];

    const deprecatedMatch = DEPRECATED_PROPERTY_REGEX.exec(blockContent);
    if (!deprecatedMatch) {
      continue;
    }

    // Remove the leading dot from the class selector
    const className = classSelector.slice(1);

    result.push({
      className,
      message: deprecatedMatch[1],
      sourceFile,
    });
  }

  return result;
}
