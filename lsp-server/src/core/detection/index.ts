/**
 * Class detection module exports.
 */

export { ClassDetector, defaultClassDetector, type ClassDetectorOptions } from './ClassDetector';

export {
  createRegexPattern,
  PatternRegistry,
  defaultPatternRegistry,
  builtinPatterns,
  type ClassPattern,
  type PatternMatch,
} from './patterns';
