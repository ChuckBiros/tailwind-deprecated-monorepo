import type { DeprecatedClass } from './DeprecatedClass';

/**
 * Represents a single usage of a deprecated class in a source file.
 * Contains position information for diagnostic highlighting.
 */
export interface ClassUsage {
  /** The deprecated class name found */
  readonly className: string;

  /** Line number where the usage occurs (0-based for LSP) */
  readonly line: number;

  /** Start character position in the line (0-based) */
  readonly startChar: number;

  /** End character position in the line (0-based, exclusive) */
  readonly endChar: number;

  /** The deprecation metadata for this class */
  readonly deprecatedInfo: DeprecatedClass;
}
