# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project structure with monorepo architecture
- LSP server in TypeScript with clean architecture
- JetBrains/Rider plugin with Kotlin
- Pattern-based class detection for multiple frameworks
- CSS parsing with `--deprecated` property support
- Real-time diagnostics in editor
- Configurable severity levels
- File watching with cache invalidation
- CI/CD with GitHub Actions
- Comprehensive test suite

### Supported Frameworks
- HTML (`class="..."`)
- React/JSX (`className="..."`, `className={\`...\`}`)
- Vue (`:class="..."`)
- Angular (`[class]="..."`, `[ngClass]="..."`)
- Svelte
- Astro
- Tailwind CSS (`@apply`)
- Class utilities (`clsx()`, `cn()`, `twMerge()`, `cva()`)

## [1.0.0] - TBD

### Added
- First stable release
- JetBrains Marketplace publication


