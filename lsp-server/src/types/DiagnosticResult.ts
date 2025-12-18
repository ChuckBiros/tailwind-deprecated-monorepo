import type { ClassUsage } from './ClassUsage';

/**
 * Severity levels for diagnostics, matching LSP DiagnosticSeverity.
 */
export type DiagnosticSeverity = 'error' | 'warning' | 'information' | 'hint';

/**
 * Result of analyzing a document for deprecated class usages.
 */
export interface DiagnosticResult {
  /** URI of the analyzed document */
  readonly uri: string;

  /** List of deprecated class usages found */
  readonly usages: readonly ClassUsage[];

  /** Time taken to analyze the document in milliseconds */
  readonly analysisTimeMs?: number;
}
