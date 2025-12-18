import * as fs from 'fs';

import fg from 'fast-glob';

import type { DeprecatedClass, DeprecatedClassMap } from '../../types/DeprecatedClass';
import type { Logger } from '../../utils/logger';
import { noopLogger } from '../../utils/logger';

import { parseCss } from './CssParser';

/**
 * Options for scanning CSS files.
 */
export interface CssScannerOptions {
  /** Glob patterns for CSS files */
  readonly patterns: readonly string[];

  /** Directories to ignore */
  readonly ignoreDirs: readonly string[];

  /** Logger instance */
  readonly logger?: Logger;
}

const DEFAULT_OPTIONS: CssScannerOptions = {
  patterns: ['**/*.css', '**/*.scss', '**/*.less'],
  ignoreDirs: ['node_modules', 'dist', 'build', '.git'],
};

/**
 * Scans a workspace for CSS files and extracts deprecated class definitions.
 *
 * @param workspaceRoot - Root directory to scan
 * @param options - Scanner options
 * @returns Map of deprecated classes indexed by class name
 */
export async function scanCssFiles(
  workspaceRoot: string,
  options: Partial<CssScannerOptions> = {}
): Promise<DeprecatedClassMap> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const logger = opts.logger ?? noopLogger;
  const deprecatedMap = new Map<string, DeprecatedClass>();

  try {
    const ignorePatterns = opts.ignoreDirs.map((dir) => `**/${dir}/**`);

    const cssFiles = await fg([...opts.patterns], {
      cwd: workspaceRoot,
      ignore: ignorePatterns,
      absolute: true,
    });

    logger.info(`Found ${cssFiles.length} CSS files to scan`);

    for (const filePath of cssFiles) {
      const classes = parseCssFile(filePath, logger);

      for (const deprecatedClass of classes) {
        deprecatedMap.set(deprecatedClass.className, deprecatedClass);
      }
    }

    logger.info(`Extracted ${deprecatedMap.size} deprecated classes`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to scan CSS files: ${message}`);
  }

  return deprecatedMap;
}

/**
 * Parses a single CSS file and returns deprecated classes.
 *
 * @param filePath - Absolute path to the CSS file
 * @param logger - Logger instance
 * @returns Array of deprecated classes found
 */
export function parseCssFile(filePath: string, logger: Logger = noopLogger): DeprecatedClass[] {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const result = parseCss(content, filePath);

    if (result.errors.length > 0) {
      for (const error of result.errors) {
        logger.warn(error);
      }
    }

    return [...result.classes];
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to read ${filePath}: ${message}`);
    return [];
  }
}

