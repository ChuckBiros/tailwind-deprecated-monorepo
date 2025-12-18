import { describe, it, expect, beforeEach } from 'vitest';

import type { DeprecatedClass } from '../../../types/DeprecatedClass';
import { ClassDetector } from '../ClassDetector';

describe('ClassDetector', () => {
  let detector: ClassDetector;
  let deprecatedClasses: Map<string, DeprecatedClass>;

  beforeEach(() => {
    detector = new ClassDetector();
    deprecatedClasses = new Map();
  });

  const addDeprecatedClass = (className: string, message = 'Deprecated'): void => {
    deprecatedClasses.set(className, {
      className,
      message,
      sourceFile: '/test.css',
    });
  };

  describe('HTML class attribute', () => {
    it('should detect deprecated class in HTML class attribute', () => {
      addDeprecatedClass('old-button');
      const code = '<div class="old-button">Hello</div>';

      const usages = detector.findUsages(code, deprecatedClasses);

      expect(usages).toHaveLength(1);
      expect(usages[0].className).toBe('old-button');
      expect(usages[0].line).toBe(0);
    });

    it('should detect multiple deprecated classes on same element', () => {
      addDeprecatedClass('old-button');
      addDeprecatedClass('legacy-style');
      const code = '<div class="old-button legacy-style">Hello</div>';

      const usages = detector.findUsages(code, deprecatedClasses);

      expect(usages).toHaveLength(2);
      expect(usages.map(u => u.className).sort()).toEqual(['legacy-style', 'old-button']);
    });

    it('should not match non-deprecated classes', () => {
      addDeprecatedClass('old-button');
      const code = '<div class="new-button modern-style">Hello</div>';

      const usages = detector.findUsages(code, deprecatedClasses);

      expect(usages).toHaveLength(0);
    });

    it('should handle single quotes', () => {
      addDeprecatedClass('old-button');
      const code = "<div class='old-button'>Hello</div>";

      const usages = detector.findUsages(code, deprecatedClasses);

      expect(usages).toHaveLength(1);
    });
  });

  describe('React className', () => {
    it('should detect deprecated class in React className', () => {
      addDeprecatedClass('old-button');
      const code = '<Button className="old-button">Click</Button>';

      const usages = detector.findUsages(code, deprecatedClasses);

      expect(usages).toHaveLength(1);
      expect(usages[0].className).toBe('old-button');
    });

    it('should detect deprecated class in template literal', () => {
      addDeprecatedClass('old-button');
      const code = '<Button className={`old-button ${active}`}>Click</Button>';

      const usages = detector.findUsages(code, deprecatedClasses);

      expect(usages).toHaveLength(1);
    });
  });

  describe('Class utility functions', () => {
    it('should detect deprecated class in clsx()', () => {
      addDeprecatedClass('old-button');
      const code = 'className={clsx("old-button", isActive && "active")}';

      const usages = detector.findUsages(code, deprecatedClasses);

      expect(usages).toHaveLength(1);
    });

    it('should detect deprecated class in cn()', () => {
      addDeprecatedClass('old-button');
      const code = 'className={cn("old-button", variant)}';

      const usages = detector.findUsages(code, deprecatedClasses);

      expect(usages).toHaveLength(1);
    });

    it('should detect deprecated class in twMerge()', () => {
      addDeprecatedClass('old-button');
      const code = 'className={twMerge("old-button", props.className)}';

      const usages = detector.findUsages(code, deprecatedClasses);

      expect(usages).toHaveLength(1);
    });
  });

  describe('Tailwind @apply', () => {
    it('should detect deprecated class in @apply directive', () => {
      addDeprecatedClass('old-button');
      const code = '@apply old-button text-white;';

      const usages = detector.findUsages(code, deprecatedClasses);

      expect(usages).toHaveLength(1);
    });

    it('should detect multiple deprecated classes in @apply', () => {
      addDeprecatedClass('old-button');
      addDeprecatedClass('legacy-padding');
      const code = '@apply old-button legacy-padding text-white;';

      const usages = detector.findUsages(code, deprecatedClasses);

      expect(usages).toHaveLength(2);
    });
  });

  describe('Position accuracy', () => {
    it('should correctly report line numbers for multiline code', () => {
      addDeprecatedClass('old-button');
      const code = `<div>
  <span class="modern"></span>
  <button class="old-button">Click</button>
</div>`;

      const usages = detector.findUsages(code, deprecatedClasses);

      expect(usages).toHaveLength(1);
      expect(usages[0].line).toBe(2); // 0-indexed, so line 3 is index 2
    });

    it('should correctly report character positions', () => {
      addDeprecatedClass('old-button');
      const code = '<div class="old-button">Hello</div>';

      const usages = detector.findUsages(code, deprecatedClasses);

      expect(usages).toHaveLength(1);
      expect(usages[0].startChar).toBe(12); // After 'class="'
      expect(usages[0].endChar).toBe(22); // End of 'old-button'
    });
  });

  describe('Edge cases', () => {
    it('should not match partial class names', () => {
      addDeprecatedClass('tw-badges');
      const code = '<div class="tw-badges tw-badges-yellow-300">Hello</div>';

      const usages = detector.findUsages(code, deprecatedClasses);

      // Should only match 'tw-badges', not 'tw-badges' within 'tw-badges-yellow-300'
      expect(usages).toHaveLength(1);
      expect(usages[0].className).toBe('tw-badges');
    });

    it('should handle empty deprecated classes map', () => {
      const code = '<div class="some-class">Hello</div>';

      const usages = detector.findUsages(code, deprecatedClasses);

      expect(usages).toHaveLength(0);
    });

    it('should handle empty code', () => {
      addDeprecatedClass('old-button');

      const usages = detector.findUsages('', deprecatedClasses);

      expect(usages).toHaveLength(0);
    });

    it('should not create duplicate usages', () => {
      addDeprecatedClass('old-button');
      const code = '<div class="old-button">Hello</div>';

      const usages = detector.findUsages(code, deprecatedClasses);

      // Should not have duplicates from pattern matching + direct search
      expect(usages).toHaveLength(1);
    });

    it('should handle class names with numbers', () => {
      addDeprecatedClass('tw-badge-100');
      const code = '<div class="tw-badge-100">Hello</div>';

      const usages = detector.findUsages(code, deprecatedClasses);

      expect(usages).toHaveLength(1);
      expect(usages[0].className).toBe('tw-badge-100');
    });
  });
});


