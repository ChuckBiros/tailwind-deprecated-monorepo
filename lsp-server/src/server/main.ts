#!/usr/bin/env node
/**
 * Entry point for the LSP server.
 *
 * This file should be kept minimal - it only bootstraps the server.
 * All logic is in LspServer and its dependencies.
 */

import { LspServer } from './LspServer';

// Handle process signals gracefully
process.on('SIGTERM', () => {
  process.exit(0);
});

process.on('SIGINT', () => {
  process.exit(0);
});

// Start the server
const server = new LspServer();
server.start();
