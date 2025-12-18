import type { DiagnosticSeverity } from '../types/DiagnosticResult';

/**
 * Plugin settings configuration.
 */
export interface PluginSettings {
  /** Whether the plugin is enabled */
  readonly enable: boolean;

  /** Glob patterns for CSS files to scan */
  readonly cssGlob: readonly string[];

  /** Severity level for deprecation diagnostics */
  readonly severity: DiagnosticSeverity;

  /** Directories to exclude from scanning */
  readonly excludeDirs: readonly string[];
}

/**
 * Root settings object as received from the IDE.
 */
export interface Settings {
  readonly tailwindDeprecated: PluginSettings;
}

/**
 * Validates and normalizes plugin settings.
 * Returns default values for missing or invalid settings.
 *
 * @param settings - Partial settings object
 * @returns Validated and complete settings
 */
export function validateSettings(settings: Partial<Settings> | undefined): Settings {
  const pluginSettings = settings?.tailwindDeprecated;

  return {
    tailwindDeprecated: {
      enable: pluginSettings?.enable ?? true,
      cssGlob: validateCssGlob(pluginSettings?.cssGlob),
      severity: validateSeverity(pluginSettings?.severity),
      excludeDirs: validateExcludeDirs(pluginSettings?.excludeDirs),
    },
  };
}

function validateCssGlob(glob: readonly string[] | undefined): readonly string[] {
  if (!glob || !Array.isArray(glob) || glob.length === 0) {
    return ['**/*.css', '**/*.scss'];
  }
  return glob.filter((g) => typeof g === 'string' && g.length > 0);
}

function validateSeverity(severity: string | undefined): DiagnosticSeverity {
  const validSeverities: DiagnosticSeverity[] = ['error', 'warning', 'information', 'hint'];
  if (severity && validSeverities.includes(severity as DiagnosticSeverity)) {
    return severity as DiagnosticSeverity;
  }
  return 'warning';
}

function validateExcludeDirs(dirs: readonly string[] | undefined): readonly string[] {
  if (!dirs || !Array.isArray(dirs)) {
    return ['node_modules', 'dist', 'build', '.git'];
  }
  return dirs.filter((d) => typeof d === 'string' && d.length > 0);
}
