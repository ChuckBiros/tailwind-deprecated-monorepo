import { createRegexPattern, type ClassPattern } from './ClassPattern';

/**
 * HTML class attribute pattern.
 * Matches: class="foo bar" and class='foo bar'
 */
export const htmlClassPattern: ClassPattern = createRegexPattern({
  id: 'html-class',
  name: 'HTML class',
  description: 'HTML class attribute: class="..."',
  regex: /class\s*=\s*["']([^"']+)["']/gi,
  applicableCategories: ['html', 'template', 'dotnet', 'vue', 'svelte', 'astro'],
});

/**
 * React/JSX className attribute pattern.
 * Matches: className="foo bar" and className='foo bar'
 */
export const reactClassNamePattern: ClassPattern = createRegexPattern({
  id: 'react-classname',
  name: 'React className',
  description: 'React className attribute: className="..."',
  regex: /className\s*=\s*["']([^"']+)["']/gi,
  applicableCategories: ['react'],
});

/**
 * React/JSX template literal className pattern.
 * Matches: className={`foo bar`}
 */
export const reactTemplateLiteralPattern: ClassPattern = createRegexPattern({
  id: 'react-template-literal',
  name: 'React template literal',
  description: 'React className with template literal: className={`...`}',
  regex: /className\s*=\s*\{`([^`]+)`\}/gi,
  applicableCategories: ['react'],
});

/**
 * Class utility functions pattern.
 * Matches: clsx('foo', 'bar'), classNames('foo'), cn('foo'), twMerge('foo'), cva('foo')
 */
export const classUtilsPattern: ClassPattern = createRegexPattern({
  id: 'class-utils',
  name: 'Class utilities',
  description: 'Class utility functions: clsx(), classNames(), cn(), twMerge(), cva()',
  regex: /(?:clsx|classNames|cn|twMerge|cva)\s*\(\s*["']([^"']+)["']/gi,
  applicableCategories: ['react'],
});

/**
 * Vue dynamic class binding pattern.
 * Matches: :class="foo bar" and :class='foo bar'
 */
export const vueClassBindingPattern: ClassPattern = createRegexPattern({
  id: 'vue-class-binding',
  name: 'Vue class binding',
  description: 'Vue class binding: :class="..."',
  regex: /:class\s*=\s*["']([^"']+)["']/gi,
  applicableCategories: ['vue'],
});

/**
 * Angular class binding pattern.
 * Matches: [class]="foo bar"
 */
export const angularClassBindingPattern: ClassPattern = createRegexPattern({
  id: 'angular-class-binding',
  name: 'Angular class binding',
  description: 'Angular class binding: [class]="..."',
  regex: /\[class\]\s*=\s*["']([^"']+)["']/gi,
  applicableCategories: ['angular'],
});

/**
 * Angular ngClass binding pattern.
 * Matches: [ngClass]="{ 'foo': condition }"
 */
export const angularNgClassPattern: ClassPattern = createRegexPattern({
  id: 'angular-ngclass',
  name: 'Angular ngClass',
  description: 'Angular ngClass binding: [ngClass]="{...}"',
  regex: /\[ngClass\]\s*=\s*["']\{([^}]+)\}["']/gi,
  applicableCategories: ['angular'],
});

/**
 * Tailwind @apply directive pattern.
 * Matches: @apply foo bar;
 */
export const tailwindApplyPattern: ClassPattern = createRegexPattern({
  id: 'tailwind-apply',
  name: 'Tailwind @apply',
  description: 'Tailwind @apply directive: @apply foo bar;',
  regex: /@apply\s+([^;]+);/gi,
  applicableCategories: ['css'],
});

/**
 * All built-in patterns in order of precedence.
 */
export const builtinPatterns: readonly ClassPattern[] = [
  htmlClassPattern,
  reactClassNamePattern,
  reactTemplateLiteralPattern,
  classUtilsPattern,
  vueClassBindingPattern,
  angularClassBindingPattern,
  angularNgClassPattern,
  tailwindApplyPattern,
];

