import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver/node';

import type { DiagnosticSeverity as ConfigSeverity } from '../../types/DiagnosticResult';
import type { ClassUsage } from '../../types/ClassUsage';

/**
 * Source identifier for diagnostics produced by this extension.
 */
export const DIAGNOSTIC_SOURCE = 'tailwind-deprecated';

/**
 * Converts a severity string to LSP DiagnosticSeverity.
 *
 * @param severity - The severity string from configuration
 * @returns The corresponding LSP DiagnosticSeverity
 */
export function toLspSeverity(severity: ConfigSeverity): DiagnosticSeverity {
  switch (severity) {
    case 'error':
      return DiagnosticSeverity.Error;
    case 'warning':
      return DiagnosticSeverity.Warning;
    case 'information':
      return DiagnosticSeverity.Information;
    case 'hint':
      return DiagnosticSeverity.Hint;
    default:
      return DiagnosticSeverity.Warning;
  }
}

/**
 * Converts a ClassUsage to an LSP Diagnostic.
 *
 * @param usage - The class usage to convert
 * @param severity - The severity level to use
 * @returns An LSP Diagnostic
 */
export function toDiagnostic(usage: ClassUsage, severity: ConfigSeverity): Diagnostic {
  return {
    severity: toLspSeverity(severity),
    range: {
      start: { line: usage.line, character: usage.startChar },
      end: { line: usage.line, character: usage.endChar },
    },
    message: `⚠️ Deprecated: ${usage.deprecatedInfo.message}`,
    source: DIAGNOSTIC_SOURCE,
    code: usage.className,
    data: {
      className: usage.className,
      sourceFile: usage.deprecatedInfo.sourceFile,
    },
  };
}

/**
 * Converts an array of ClassUsages to LSP Diagnostics.
 *
 * @param usages - The class usages to convert
 * @param severity - The severity level to use
 * @returns Array of LSP Diagnostics
 */
export function toDiagnostics(usages: readonly ClassUsage[], severity: ConfigSeverity): Diagnostic[] {
  return usages.map((usage) => toDiagnostic(usage, severity));
}

