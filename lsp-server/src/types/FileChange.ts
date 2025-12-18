/**
 * Type of file change event.
 */
export type FileChangeType = 'created' | 'changed' | 'deleted';

/**
 * Represents a file change event from the file watcher.
 */
export interface FileChangeEvent {
  /** Absolute path to the changed file */
  readonly filePath: string;

  /** Type of change */
  readonly type: FileChangeType;
}

