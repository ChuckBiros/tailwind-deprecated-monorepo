# Tailwind Deprecated Plugin

[![CI](https://github.com/ChuckBiros/tailwind-deprecated/actions/workflows/ci.yml/badge.svg)](https://github.com/ChuckBiros/tailwind-deprecated/actions/workflows/ci.yml)
[![JetBrains Plugin](https://img.shields.io/jetbrains/plugin/v/PLUGIN_ID.svg)](https://plugins.jetbrains.com/plugin/PLUGIN_ID)

A JetBrains plugin that detects and highlights deprecated Tailwind CSS custom classes in your code. Perfect for teams migrating from legacy CSS classes to new design system components.

## ✨ Features

- 🔍 **Automatic Detection** - Scans your CSS files for classes marked as deprecated
- ⚠️ **Real-time Highlighting** - Deprecated classes are underlined in your editor
- 💬 **Custom Messages** - Shows the deprecation message on hover
- 🌐 **Multi-framework** - Supports HTML, React, Vue, Angular, Svelte, and more

## 📦 Installation

### From JetBrains Marketplace (Recommended)

1. Open Rider → Settings → Plugins
2. Search for "Tailwind Deprecated"
3. Click Install
4. Restart the IDE

### Manual Installation

1. Download the latest `.zip` from [Releases](https://github.com/ChuckBiros/tailwind-deprecated/releases)
2. Open Rider → Settings → Plugins → ⚙️ → Install Plugin from Disk
3. Select the downloaded `.zip` file
4. Restart the IDE

## 🚀 Usage

### 1. Mark Classes as Deprecated

In your CSS/SCSS file, add the `--deprecated` custom property:

```css
.old-button {
  --deprecated: "Use .btn-primary instead";
  display: inline-flex;
  padding: 0.5rem 1rem;
  /* existing styles */
}

/* Multiple classes can be deprecated together */
.legacy-card, .old-card {
  --deprecated: "Use .card-modern instead";
}
```

### 2. See Warnings in Your Code

The plugin will highlight deprecated classes in:

```html
<!-- HTML -->
<div class="old-button">Click me</div>

<!-- React/JSX -->
<Button className="old-button">Click me</Button>

<!-- Vue -->
<div :class="'old-button'">Click me</div>

<!-- Tailwind @apply -->
@apply old-button text-white;
```

## 📁 Project Structure

This is a monorepo containing:

```
tailwind-deprecated/
├── lsp-server/           # TypeScript LSP server
│   ├── src/
│   │   ├── core/         # Pure business logic
│   │   ├── server/       # LSP layer
│   │   ├── config/       # Configuration
│   │   ├── types/        # TypeScript types
│   │   └── utils/        # Utilities
│   └── package.json
│
├── plugin/               # JetBrains/Rider plugin (Kotlin)
│   ├── src/main/kotlin/
│   └── build.gradle.kts
│
└── .github/workflows/    # CI/CD pipelines
```

## 🔧 Configuration

Access settings via: **Settings → Tools → Tailwind Deprecated**

| Option | Default | Description |
|--------|---------|-------------|
| Enable | `true` | Enable/disable the plugin |
| Severity | `warning` | Diagnostic severity: `error`, `warning`, `information`, `hint` |
| CSS Patterns | `**/*.css,**/*.scss` | Glob patterns for CSS files |
| Exclude Dirs | `node_modules,dist,build,.git` | Directories to exclude |

## 🛠️ Development

### Prerequisites

- Node.js 18+
- Java 17+
- Gradle 8+

### Setup

```bash
# Clone the repository
git clone https://github.com/ChuckBiros/tailwind-deprecated.git
cd tailwind-deprecated

# Install LSP server dependencies
cd lsp-server
npm install

# Build LSP server
npm run build

# Run tests
npm test
```

### Building the Plugin

```bash
cd plugin
./gradlew buildPlugin
```

The plugin ZIP will be in `plugin/build/distributions/`.

### Running Tests

```bash
# LSP server tests
cd lsp-server
npm test                 # Run once
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage
```

## 🏗️ Architecture

The project follows clean architecture principles:

- **Core Layer** (`lsp-server/src/core/`) - Pure business logic, framework-agnostic
- **Server Layer** (`lsp-server/src/server/`) - LSP protocol implementation
- **Plugin Layer** (`plugin/`) - JetBrains IDE integration

Key design decisions:
- **Pattern Registry** - Extensible pattern matching for different frameworks
- **Cache with Invalidation** - Efficient file watching and incremental updates
- **Dependency Injection** - Testable components with clear interfaces

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- [LSP4IJ](https://github.com/redhat-developer/lsp4ij) - LSP support for JetBrains IDEs
- [Tailwind CSS](https://tailwindcss.com/) - The utility-first CSS framework
