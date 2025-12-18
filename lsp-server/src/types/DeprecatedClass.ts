/**
 * Represents a CSS class marked as deprecated.
 * Contains the deprecation metadata extracted from CSS files.
 */
export interface DeprecatedClass {
  /** The CSS class name (without the leading dot) */
  readonly className: string;

  /** The deprecation message defined in --deprecated property */
  readonly message: string;

  /** Absolute path to the source CSS file */
  readonly sourceFile: string;

  /** Line number where the class is defined (1-based) */
  readonly line?: number;
}

/**
 * A map of deprecated classes indexed by class name for O(1) lookup.
 */
export type DeprecatedClassMap = ReadonlyMap<string, DeprecatedClass>;

