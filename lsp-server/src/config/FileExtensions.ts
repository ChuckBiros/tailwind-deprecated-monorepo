/**
 * File extension configuration for scanning.
 */

/**
 * Supported file categories for scanning.
 */
export type FileCategory =
  | 'html'
  | 'react'
  | 'vue'
  | 'angular'
  | 'svelte'
  | 'astro'
  | 'template'
  | 'css'
  | 'dotnet';

/**
 * Mapping of file categories to their extensions.
 */
export const FILE_EXTENSIONS: Readonly<Record<FileCategory, readonly string[]>> = {
  html: ['.html', '.htm'],
  react: ['.jsx', '.tsx', '.js', '.ts'],
  vue: ['.vue'],
  angular: ['.component.ts', '.component.html'],
  svelte: ['.svelte'],
  astro: ['.astro'],
  template: ['.php', '.blade.php', '.erb', '.twig', '.mdx'],
  css: ['.css', '.scss', '.less'],
  dotnet: ['.cshtml', '.razor', '.aspx'],
};

/**
 * Gets all supported file extensions as a flat array.
 *
 * @returns Array of all supported file extensions
 */
export function getAllSupportedExtensions(): readonly string[] {
  return Object.values(FILE_EXTENSIONS).flat();
}

/**
 * Checks if a file should be scanned based on its extension.
 *
 * @param filePath - Path to the file
 * @returns True if the file should be scanned
 */
export function shouldScanFile(filePath: string): boolean {
  const extensions = getAllSupportedExtensions();
  return extensions.some((ext) => filePath.endsWith(ext));
}

/**
 * Checks if a file is a CSS file that may contain deprecation definitions.
 *
 * @param filePath - Path to the file
 * @returns True if the file is a CSS file
 */
export function isCssFile(filePath: string): boolean {
  return FILE_EXTENSIONS.css.some((ext) => filePath.endsWith(ext));
}

/**
 * Gets the file category for a given file path.
 *
 * @param filePath - Path to the file
 * @returns The file category or undefined if not supported
 */
export function getFileCategory(filePath: string): FileCategory | undefined {
  for (const [category, extensions] of Object.entries(FILE_EXTENSIONS)) {
    if (extensions.some((ext) => filePath.endsWith(ext))) {
      return category as FileCategory;
    }
  }
  return undefined;
}
