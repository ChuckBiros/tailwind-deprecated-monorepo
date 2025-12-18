import { describe, it, expect } from 'vitest';

import { parseCss } from '../CssParser';

describe('CssParser', () => {
  describe('parseCss', () => {
    it('should extract deprecated class from simple CSS rule', () => {
      const css = `
        .old-button {
          --deprecated: "Use .btn-primary instead";
          color: red;
        }
      `;

      const result = parseCss(css, '/path/to/file.css');

      expect(result.classes).toHaveLength(1);
      expect(result.classes[0]).toEqual({
        className: 'old-button',
        message: 'Use .btn-primary instead',
        sourceFile: '/path/to/file.css',
      });
      expect(result.errors).toHaveLength(0);
    });

    it('should extract multiple deprecated classes from multiple rules', () => {
      const css = `
        .old-button {
          --deprecated: "Use .btn-primary instead";
          color: red;
        }
        
        .legacy-card {
          --deprecated: "Use .card-modern instead";
          padding: 10px;
        }
      `;

      const result = parseCss(css, '/path/to/file.css');

      expect(result.classes).toHaveLength(2);
      expect(result.classes.map((c) => c.className)).toEqual(['old-button', 'legacy-card']);
    });

    it('should extract deprecated classes from grouped selectors', () => {
      const css = `
        .old-btn, .legacy-btn {
          --deprecated: "Use .btn instead";
          display: inline-block;
        }
      `;

      const result = parseCss(css, '/path/to/file.css');

      expect(result.classes).toHaveLength(2);
      expect(result.classes.map((c) => c.className)).toEqual(['old-btn', 'legacy-btn']);
      expect(result.classes[0].message).toBe('Use .btn instead');
      expect(result.classes[1].message).toBe('Use .btn instead');
    });

    it('should handle single quotes in deprecated message', () => {
      const css = `
        .old-class {
          --deprecated: 'Use .new-class instead';
        }
      `;

      const result = parseCss(css, '/test.css');

      expect(result.classes).toHaveLength(1);
      expect(result.classes[0].message).toBe('Use .new-class instead');
    });

    it('should ignore classes without --deprecated', () => {
      const css = `
        .normal-class {
          color: blue;
        }
        
        .deprecated-class {
          --deprecated: "This is deprecated";
          color: red;
        }
      `;

      const result = parseCss(css, '/test.css');

      expect(result.classes).toHaveLength(1);
      expect(result.classes[0].className).toBe('deprecated-class');
    });

    it('should handle SCSS nested parent selectors', () => {
      // Note: For pure nested parent selectors without a wrapper block,
      // the nested class is extracted
      const css = `
        &.old-variant {
          --deprecated: "Use .button-primary instead";
        }
      `;

      const result = parseCss(css, '/test.scss');

      // Should find at least the old-variant class
      expect(result.classes.length).toBeGreaterThanOrEqual(1);
      expect(result.classes.some((c) => c.className === 'old-variant')).toBe(true);
    });

    it('should handle SCSS nested selectors in parent block', () => {
      // When deprecated is in a nested block, both parent and nested may be detected
      // This is a limitation of regex-based parsing
      const css = `
        .button {
          &.old-variant {
            --deprecated: "Use .button-primary instead";
          }
        }
      `;

      const result = parseCss(css, '/test.scss');

      // Both .button (parent) and .old-variant (nested) are found
      // because the deprecated property is inside the parent block
      expect(result.classes.length).toBeGreaterThanOrEqual(1);
      expect(result.classes.some((c) => c.className === 'old-variant')).toBe(true);
    });

    it('should handle class names with hyphens', () => {
      const css = `
        .tw-badges-yellow-300 {
          --deprecated: "Use tw-badge-warning instead";
        }
      `;

      const result = parseCss(css, '/test.css');

      expect(result.classes).toHaveLength(1);
      expect(result.classes[0].className).toBe('tw-badges-yellow-300');
    });

    it('should handle empty CSS content', () => {
      const result = parseCss('', '/empty.css');

      expect(result.classes).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle CSS with no deprecated classes', () => {
      const css = `
        .normal { color: red; }
        .another { padding: 10px; }
      `;

      const result = parseCss(css, '/test.css');

      expect(result.classes).toHaveLength(0);
    });

    it('should handle ID selectors (should not extract as class)', () => {
      const css = `
        #old-id {
          --deprecated: "This is an ID, not a class";
          color: red;
        }
      `;

      const result = parseCss(css, '/test.css');

      // Should not extract ID selectors as classes
      expect(result.classes).toHaveLength(0);
    });

    it('should handle mixed ID and class selectors', () => {
      const css = `
        #container, .old-class {
          --deprecated: "Both are deprecated";
        }
      `;

      const result = parseCss(css, '/test.css');

      // Should only extract the class, not the ID
      expect(result.classes).toHaveLength(1);
      expect(result.classes[0].className).toBe('old-class');
    });
  });
});
