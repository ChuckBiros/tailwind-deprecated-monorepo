/**
 * Configuration exports.
 */

export { validateSettings, type Settings, type PluginSettings } from './Settings';
export {
  FILE_EXTENSIONS,
  getAllSupportedExtensions,
  shouldScanFile,
  isCssFile,
  getFileCategory,
  type FileCategory,
} from './FileExtensions';

