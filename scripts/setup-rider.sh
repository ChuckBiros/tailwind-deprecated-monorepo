#!/bin/bash

# Script de configuration pour Rider/JetBrains IDEs
# Ce script compile le serveur LSP et affiche les instructions d'installation

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🚀 Configuration de Tailwind Deprecated LSP pour Rider"
echo "======================================================="
echo ""

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Installez Node.js >= 18.0.0"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version $NODE_VERSION détectée. Version 18+ requise."
    exit 1
fi

echo "✅ Node.js $(node --version) détecté"

# Installer les dépendances
echo ""
echo "📦 Installation des dépendances..."
cd "$PROJECT_DIR"
npm install

# Compiler le projet
echo ""
echo "🔨 Compilation du projet..."
npm run build

# Vérifier la compilation
if [ ! -f "$PROJECT_DIR/dist/server.js" ]; then
    echo "❌ Erreur de compilation : dist/server.js non trouvé"
    exit 1
fi

echo "✅ Compilation réussie"

# Afficher les instructions
SERVER_PATH="$PROJECT_DIR/dist/server.js"

echo ""
echo "======================================================="
echo "✅ Installation terminée !"
echo "======================================================="
echo ""
echo "📝 Pour configurer Rider :"
echo ""
echo "1. Installez le plugin 'LSP4IJ' depuis :"
echo "   Settings → Plugins → Marketplace → Rechercher 'LSP4IJ'"
echo ""
echo "2. Configurez le serveur LSP :"
echo "   Settings → Languages & Frameworks → Language Servers"
echo "   Cliquez sur '+' et ajoutez :"
echo ""
echo "   Name: Tailwind Deprecated"
echo "   Server: Raw command"
echo "   Command: node $SERVER_PATH --stdio"
echo ""
echo "   Dans l'onglet 'Mappings', ajoutez les patterns de fichiers :"
echo "   - File name pattern: *.html;*.jsx;*.tsx;*.vue;*.svelte;*.astro"
echo ""
echo "3. Redémarrez Rider"
echo ""
echo "📋 Commande à copier :"
echo "   node $SERVER_PATH --stdio"
echo ""

