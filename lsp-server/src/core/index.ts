/**
 * Core module exports.
 * This module contains the pure business logic, independent of the LSP layer.
 */

// CSS parsing
export { parseCss, scanCssFiles, parseCssFile, type CssParseResult } from './css';

// Class detection
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
} from './detection';

// Cache
export {
  DeprecatedClassCache,
  type CacheUpdateEvent,
  type CacheUpdateListener,
} from './cache';

