import { describe, it, expect } from 'vitest';

import { escapeRegExp, createWholeClassPattern, createWholeClassRegex } from '../regex';

describe('regex utilities', () => {
  describe('escapeRegExp', () => {
    it('should escape special regex characters', () => {
      expect(escapeRegExp('hello.world')).toBe('hello\\.world');
      expect(escapeRegExp('test[0]')).toBe('test\\[0\\]');
      expect(escapeRegExp('a*b+c?')).toBe('a\\*b\\+c\\?');
      expect(escapeRegExp('(group)')).toBe('\\(group\\)');
      expect(escapeRegExp('a|b')).toBe('a\\|b');
      expect(escapeRegExp('start^end$')).toBe('start\\^end\\$');
      expect(escapeRegExp('path\\to')).toBe('path\\\\to');
    });

    it('should not modify strings without special characters', () => {
      expect(escapeRegExp('hello-world')).toBe('hello-world');
      expect(escapeRegExp('class_name')).toBe('class_name');
      expect(escapeRegExp('CamelCase')).toBe('CamelCase');
    });

    it('should handle empty string', () => {
      expect(escapeRegExp('')).toBe('');
    });
  });

  describe('createWholeClassPattern', () => {
    it('should create pattern that matches whole class names', () => {
      const pattern = createWholeClassPattern('tw-badge');
      const regex = new RegExp(pattern, 'g');

      // Should match standalone class
      expect(regex.test('tw-badge')).toBe(true);

      // Reset regex
      regex.lastIndex = 0;
      expect('tw-badge other-class'.match(regex)).toHaveLength(1);
    });

    it('should not match partial class names', () => {
      const pattern = createWholeClassPattern('tw-badge');
      const regex = new RegExp(pattern, 'g');

      // Should NOT match class that starts with 'tw-badge' but has more
      expect('tw-badge-large'.match(regex)).toBeNull();
      expect('tw-badges'.match(regex)).toBeNull();
    });

    it('should handle class names with hyphens correctly', () => {
      const pattern = createWholeClassPattern('tw-badges');
      const regex = new RegExp(pattern, 'g');

      const testString = 'tw-badges tw-badges-yellow-300';
      const matches = testString.match(regex);

      expect(matches).toHaveLength(1);
      expect(matches![0]).toBe('tw-badges');
    });
  });

  describe('createWholeClassRegex', () => {
    it('should create a compiled regex', () => {
      const regex = createWholeClassRegex('test-class');

      expect(regex).toBeInstanceOf(RegExp);
      expect(regex.flags).toBe('g');
    });

    it('should support custom flags', () => {
      const regex = createWholeClassRegex('test-class', 'gi');

      expect(regex.flags).toBe('gi');
    });

    it('should work correctly with exec', () => {
      const regex = createWholeClassRegex('btn');
      const text = 'btn btn-primary btn';
      const matches: string[] = [];
      let match;

      while ((match = regex.exec(text)) !== null) {
        matches.push(match[0]);
      }

      // Should match both standalone 'btn', but not 'btn' in 'btn-primary'
      expect(matches).toEqual(['btn', 'btn']);
    });
  });
});
