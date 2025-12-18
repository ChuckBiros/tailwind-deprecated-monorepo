/**
 * Main exports for the Tailwind Deprecated LSP Server.
 *
 * This module exports the core functionality that can be used
 * programmatically or by the LSP server.
 */

// Types
export type {
  DeprecatedClass,
  DeprecatedClassMap,
  ClassUsage,
  DiagnosticResult,
  FileChangeEvent,
  FileChangeType,
} from './types';

export type { DiagnosticSeverity } from './types/DiagnosticResult';

// Configuration
export {
  validateSettings,
  shouldScanFile,
  isCssFile,
  getFileCategory,
  getAllSupportedExtensions,
  FILE_EXTENSIONS,
  type Settings,
  type PluginSettings,
  type FileCategory,
} from './config';

// Core - CSS parsing
export { parseCss, scanCssFiles, parseCssFile, type CssParseResult } from './core/css';

// Core - Class detection
export {
  ClassDetector,
  defaultClassDetector,
  PatternRegistry,
  defaultPatternRegistry,
  createRegexPattern,
  builtinPatterns,
  type ClassDetectorOptions,
  type ClassPattern,
  type PatternMatch,
} from './core/detection';

// Core - Cache
export {
  DeprecatedClassCache,
  type CacheUpdateEvent,
  type CacheUpdateListener,
} from './core/cache';

// Utilities
export {
  escapeRegExp,
  createWholeClassPattern,
  createWholeClassRegex,
  noopLogger,
  consoleLogger,
  createPrefixedLogger,
  type Logger,
  type LogLevel,
} from './utils';
