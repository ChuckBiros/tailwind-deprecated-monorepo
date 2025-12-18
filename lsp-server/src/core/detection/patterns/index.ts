/**
 * Pattern detection module exports.
 */

export { createRegexPattern, type ClassPattern, type PatternMatch } from './ClassPattern';

export {
  builtinPatterns,
  htmlClassPattern,
  reactClassNamePattern,
  reactTemplateLiteralPattern,
  classUtilsPattern,
  vueClassBindingPattern,
  angularClassBindingPattern,
  angularNgClassPattern,
  tailwindApplyPattern,
} from './builtinPatterns';

export { PatternRegistry, defaultPatternRegistry } from './PatternRegistry';

