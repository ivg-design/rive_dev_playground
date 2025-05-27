#!/bin/bash

# Build Rive Tester Documentation for VS Code Live Server
echo "🔨 Building Rive Tester Documentation..."

# Build the documentation using the local config
python3 -m mkdocs build -f mkdocs-local.yml --quiet

echo "✅ Documentation built successfully!"
echo "📁 Static files are in the 'site/' directory"
echo ""
echo "🚀 To use with VS Code Live Server:"
echo "   1. Start Live Server from your project root (right-click index.html)"
echo "   2. Navigate to: http://127.0.0.1:5501/site/"
echo "   3. Or directly open: http://127.0.0.1:5501/site/index.html"
echo ""
echo "🔄 To rebuild after changes, run: ./build-docs.sh" 