import * as fs from 'fs';
import * as path from 'path';

import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  InitializeParams,
  InitializeResult,
  TextDocumentSyncKind,
  DidChangeConfigurationNotification,
  DidChangeWatchedFilesNotification,
  FileChangeType as LspFileChangeType,
  Connection,
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { URI } from 'vscode-uri';

import { shouldScanFile, isCssFile, getFileCategory } from '../config/FileExtensions';
import { Settings, validateSettings } from '../config/Settings';
import { toDiagnostics } from './adapters/DiagnosticAdapter';
import { createLspLogger } from './adapters/LspLogger';
import { DeprecatedClassCache } from '../core/cache/DeprecatedClassCache';
import { scanCssFiles } from '../core/css/CssScanner';
import { ClassDetector } from '../core/detection/ClassDetector';

import type { FileChangeType } from '../types/FileChange';
import type { Logger } from '../utils/logger';

/**
 * The main LSP server class.
 * Orchestrates the connection, document management, and diagnostics.
 */
export class LspServer {
  private readonly connection: Connection;
  private readonly documents: TextDocuments<TextDocument>;
  private readonly cache: DeprecatedClassCache;
  private readonly detector: ClassDetector;
  private readonly logger: Logger;

  private settings: Settings;
  private workspaceRoot: string | null = null;
  private hasConfigurationCapability = false;

  constructor() {
    // Create the LSP connection
    this.connection = createConnection(ProposedFeatures.all);
    this.logger = createLspLogger(this.connection);

    // Initialize components
    this.documents = new TextDocuments(TextDocument);
    this.cache = new DeprecatedClassCache(this.logger);
    this.detector = new ClassDetector();
    this.settings = validateSettings(undefined);

    // Set up event handlers
    this.setupConnectionHandlers();
    this.setupDocumentHandlers();
    this.setupCacheHandlers();
  }

  /**
   * Starts the LSP server.
   */
  start(): void {
    // Listen for documents
    this.documents.listen(this.connection);

    // Start the connection
    this.connection.listen();

    this.logger.info('Tailwind Deprecated LSP server started');
  }

  /**
   * Sets up connection-level event handlers.
   */
  private setupConnectionHandlers(): void {
    // Initialize
    this.connection.onInitialize((params: InitializeParams): InitializeResult => {
      return this.handleInitialize(params);
    });

    // Initialized
    this.connection.onInitialized(() => {
      void this.handleInitialized();
    });

    // Configuration change
    this.connection.onDidChangeConfiguration((change) => {
      this.handleConfigurationChange(change.settings as Partial<Settings> | undefined);
    });

    // File watcher
    this.connection.onDidChangeWatchedFiles((params) => {
      void this.handleWatchedFilesChange(params.changes);
    });

    // Shutdown
    this.connection.onShutdown(() => {
      this.handleShutdown();
    });

    // Exit
    this.connection.onExit(() => {
      process.exit(0);
    });
  }

  /**
   * Sets up document-level event handlers.
   */
  private setupDocumentHandlers(): void {
    this.documents.onDidChangeContent((change) => {
      void this.validateDocument(change.document);
    });
  }

  /**
   * Sets up cache event handlers.
   */
  private setupCacheHandlers(): void {
    this.cache.onUpdate(() => {
      // Re-validate all open documents when cache updates
      for (const document of this.documents.all()) {
        void this.validateDocument(document);
      }
    });
  }

  /**
   * Handles the initialize request.
   */
  private handleInitialize(params: InitializeParams): InitializeResult {
    const capabilities = params.capabilities;

    this.hasConfigurationCapability = !!(
      capabilities.workspace && !!capabilities.workspace.configuration
    );

    // Get workspace root
    let initialRoot: string | null = null;
    if (params.workspaceFolders && params.workspaceFolders.length > 0) {
      initialRoot = URI.parse(params.workspaceFolders[0].uri).fsPath;
    } else if (params.rootUri) {
      initialRoot = URI.parse(params.rootUri).fsPath;
    } else if (params.rootPath) {
      initialRoot = params.rootPath;
    }

    // Find the actual project root (with tailwind.config.js or package.json)
    this.workspaceRoot = initialRoot ? this.findProjectRoot(initialRoot) : null;

    this.logger.info(`Initialized. Initial path: ${initialRoot ?? 'none'}`);
    this.logger.info(`Resolved workspace: ${this.workspaceRoot ?? 'none'}`);

    return {
      capabilities: {
        textDocumentSync: TextDocumentSyncKind.Incremental,
        workspace: {
          workspaceFolders: {
            supported: true,
            changeNotifications: true,
          },
        },
      },
    };
  }

  /**
   * Handles the initialized notification.
   */
  private async handleInitialized(): Promise<void> {
    if (this.hasConfigurationCapability) {
      await this.connection.client.register(DidChangeConfigurationNotification.type, undefined);
    }

    // Register file watchers for CSS files
    await this.connection.client.register(DidChangeWatchedFilesNotification.type, {
      watchers: [
        { globPattern: '**/*.css' },
        { globPattern: '**/*.scss' },
        { globPattern: '**/*.less' },
      ],
    });

    // Initial scan
    await this.refreshCache();

    // Validate all open documents
    for (const document of this.documents.all()) {
      await this.validateDocument(document);
    }
  }

  /**
   * Handles configuration changes.
   */
  private handleConfigurationChange(newSettings: Partial<Settings> | undefined): void {
    this.settings = validateSettings(newSettings);
    this.logger.info('Configuration updated');

    // Re-validate all documents
    for (const document of this.documents.all()) {
      void this.validateDocument(document);
    }
  }

  /**
   * Handles file watcher events.
   */
  private async handleWatchedFilesChange(
    changes: Array<{ uri: string; type: LspFileChangeType }>
  ): Promise<void> {
    for (const change of changes) {
      const filePath = URI.parse(change.uri).fsPath;

      if (!isCssFile(filePath)) {
        continue;
      }

      const changeType = this.mapFileChangeType(change.type);
      this.cache.handleFileChange({ filePath, type: changeType });
    }

    this.logger.info(`Cache updated: ${this.cache.size} deprecated classes`);
  }

  /**
   * Maps LSP file change type to our internal type.
   */
  private mapFileChangeType(lspType: LspFileChangeType): FileChangeType {
    switch (lspType) {
      case LspFileChangeType.Created:
        return 'created';
      case LspFileChangeType.Changed:
        return 'changed';
      case LspFileChangeType.Deleted:
        return 'deleted';
      default:
        return 'changed';
    }
  }

  /**
   * Finds the actual project root by looking for tailwind.config.js or package.json.
   * Traverses up the directory tree from the initial path.
   */
  private findProjectRoot(initialPath: string): string {
    const indicators = [
      'tailwind.config.js',
      'tailwind.config.ts',
      'tailwind.config.cjs',
      'tailwind.config.mjs',
      'package.json',
    ];

    let currentPath = initialPath;
    const root = path.parse(currentPath).root;

    // Try current path and parent directories
    while (currentPath !== root) {
      for (const indicator of indicators) {
        const indicatorPath = path.join(currentPath, indicator);
        if (fs.existsSync(indicatorPath)) {
          this.logger.debug(`Found project indicator: ${indicatorPath}`);
          return currentPath;
        }
      }

      // Also check if this directory has CSS files in common locations
      const cssLocations = ['assets', 'styles', 'css', 'src'];
      for (const loc of cssLocations) {
        const cssDir = path.join(currentPath, loc);
        if (fs.existsSync(cssDir) && fs.statSync(cssDir).isDirectory()) {
          const files = fs
            .readdirSync(cssDir)
            .filter((f) => f.endsWith('.css') || f.endsWith('.scss'));
          if (files.length > 0) {
            this.logger.debug(`Found CSS files in: ${cssDir}`);
            return currentPath;
          }
        }
      }

      // Move up one level
      const parentPath = path.dirname(currentPath);
      if (parentPath === currentPath) {
        break;
      }
      currentPath = parentPath;
    }

    // Fallback to initial path
    return initialPath;
  }

  /**
   * Handles shutdown request.
   */
  private handleShutdown(): void {
    this.logger.info('Shutdown requested');
    this.cache.clear();
  }

  /**
   * Refreshes the deprecated classes cache.
   */
  private async refreshCache(): Promise<void> {
    if (!this.workspaceRoot) {
      this.logger.warn('No workspace root, cannot scan CSS files');
      return;
    }

    this.logger.info(`Scanning CSS files in ${this.workspaceRoot}...`);

    const classes = await scanCssFiles(this.workspaceRoot, {
      patterns: [...this.settings.tailwindDeprecated.cssGlob],
      ignoreDirs: [...this.settings.tailwindDeprecated.excludeDirs],
      logger: this.logger,
    });

    // Clear and repopulate cache
    this.cache.clear();
    this.cache.add(Array.from(classes.values()));

    this.logger.info(`Found ${this.cache.size} deprecated classes`);

    // Log found classes for debugging
    for (const [className, info] of classes) {
      this.logger.debug(`  - .${className}: ${info.message}`);
    }
  }

  /**
   * Validates a document and sends diagnostics.
   */
  private async validateDocument(document: TextDocument): Promise<void> {
    if (!this.settings.tailwindDeprecated.enable) {
      this.connection.sendDiagnostics({ uri: document.uri, diagnostics: [] });
      return;
    }

    const filePath = URI.parse(document.uri).fsPath;

    if (!shouldScanFile(filePath)) {
      return;
    }

    const text = document.getText();
    const fileCategory = getFileCategory(filePath);

    // Detect deprecated class usages
    const usages = this.detector.findUsages(text, this.cache.getClasses(), fileCategory);

    // Convert to LSP diagnostics
    const diagnostics = toDiagnostics(usages, this.settings.tailwindDeprecated.severity);

    // Send diagnostics
    this.connection.sendDiagnostics({ uri: document.uri, diagnostics });
  }
}
