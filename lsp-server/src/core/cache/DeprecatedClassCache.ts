import { noopLogger } from '../../utils/logger';
import { parseCssFile } from '../css/CssScanner';

import type { DeprecatedClass, DeprecatedClassMap } from '../../types/DeprecatedClass';
import type { FileChangeEvent } from '../../types/FileChange';
import type { Logger } from '../../utils/logger';

/**
 * Event emitted when the cache is updated.
 */
export interface CacheUpdateEvent {
  /** Number of deprecated classes in the cache */
  readonly size: number;

  /** Files that were modified */
  readonly modifiedFiles: readonly string[];
}

/**
 * Listener for cache update events.
 */
export type CacheUpdateListener = (event: CacheUpdateEvent) => void;

/**
 * Cache for deprecated CSS classes with file-based invalidation.
 *
 * Maintains a map of deprecated classes and tracks which file each class
 * comes from, allowing efficient invalidation when files change.
 */
export class DeprecatedClassCache {
  /** Map of class name -> deprecated class info */
  private readonly classMap: Map<string, DeprecatedClass> = new Map();

  /** Map of source file -> set of class names from that file */
  private readonly fileToClasses: Map<string, Set<string>> = new Map();

  /** Listeners for cache update events */
  private readonly listeners: Set<CacheUpdateListener> = new Set();

  private readonly logger: Logger;

  constructor(logger: Logger = noopLogger) {
    this.logger = logger;
  }

  /**
   * Gets the current deprecated classes map (immutable view).
   */
  getClasses(): DeprecatedClassMap {
    return this.classMap;
  }

  /**
   * Gets the number of cached classes.
   */
  get size(): number {
    return this.classMap.size;
  }

  /**
   * Checks if a class is in the cache.
   */
  has(className: string): boolean {
    return this.classMap.has(className);
  }

  /**
   * Gets a deprecated class by name.
   */
  get(className: string): DeprecatedClass | undefined {
    return this.classMap.get(className);
  }

  /**
   * Adds deprecated classes to the cache.
   *
   * @param classes - Classes to add
   */
  add(classes: readonly DeprecatedClass[]): void {
    const modifiedFiles = new Set<string>();

    for (const deprecatedClass of classes) {
      this.classMap.set(deprecatedClass.className, deprecatedClass);

      // Track which file this class came from
      let fileClasses = this.fileToClasses.get(deprecatedClass.sourceFile);
      if (!fileClasses) {
        fileClasses = new Set();
        this.fileToClasses.set(deprecatedClass.sourceFile, fileClasses);
      }
      fileClasses.add(deprecatedClass.className);

      modifiedFiles.add(deprecatedClass.sourceFile);
    }

    if (modifiedFiles.size > 0) {
      this.notifyListeners([...modifiedFiles]);
    }
  }

  /**
   * Removes all classes from a specific file.
   *
   * @param filePath - The source file path
   * @returns Number of classes removed
   */
  removeByFile(filePath: string): number {
    const fileClasses = this.fileToClasses.get(filePath);
    if (!fileClasses) {
      return 0;
    }

    let removed = 0;
    for (const className of fileClasses) {
      if (this.classMap.delete(className)) {
        removed++;
      }
    }

    this.fileToClasses.delete(filePath);

    if (removed > 0) {
      this.notifyListeners([filePath]);
    }

    return removed;
  }

  /**
   * Handles a file change event and updates the cache accordingly.
   *
   * @param event - The file change event
   */
  handleFileChange(event: FileChangeEvent): void {
    this.logger.debug(`Handling file change: ${event.type} ${event.filePath}`);

    switch (event.type) {
      case 'deleted':
        this.removeByFile(event.filePath);
        break;

      case 'created':
      case 'changed':
        this.refreshFile(event.filePath);
        break;
    }
  }

  /**
   * Refreshes the cache for a specific file.
   *
   * @param filePath - The file to refresh
   */
  refreshFile(filePath: string): void {
    // Remove old entries from this file
    this.removeByFile(filePath);

    // Parse the file and add new entries
    const classes = parseCssFile(filePath, this.logger);
    this.add(classes);

    this.logger.debug(`Refreshed ${filePath}: ${classes.length} classes`);
  }

  /**
   * Clears all cached classes.
   */
  clear(): void {
    const hadClasses = this.classMap.size > 0;
    this.classMap.clear();
    this.fileToClasses.clear();

    if (hadClasses) {
      this.notifyListeners([]);
    }
  }

  /**
   * Registers a listener for cache update events.
   *
   * @param listener - The listener function
   * @returns A function to unregister the listener
   */
  onUpdate(listener: CacheUpdateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notifies all listeners of a cache update.
   */
  private notifyListeners(modifiedFiles: readonly string[]): void {
    const event: CacheUpdateEvent = {
      size: this.classMap.size,
      modifiedFiles,
    };

    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (error) {
        this.logger.error('Cache update listener error:', error);
      }
    }
  }
}
