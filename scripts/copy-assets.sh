#!/bin/bash

# Copy Assets Script
# This script copies necessary dependencies from node_modules to assets directory
# to avoid direct node_modules dependencies in production

echo "Copying assets from node_modules..."

# Create directories
mkdir -p assets/css
mkdir -p assets/js

# Copy Golden Layout CSS
echo "Copying Golden Layout CSS..."
cp node_modules/golden-layout/src/css/goldenlayout-base.css assets/css/
cp node_modules/golden-layout/src/css/goldenlayout-dark-theme.css assets/css/

# Copy JSONEditor files
echo "Copying JSONEditor files..."
cp node_modules/jsoneditor/dist/jsoneditor.min.css assets/css/
cp node_modules/jsoneditor/dist/jsoneditor.min.js assets/js/

# Copy Rive runtime
echo "Copying Rive runtime..."
cp node_modules/@rive-app/webgl2/rive.js assets/js/

echo "Assets copied successfully!"
echo "Files copied:"
echo "  - assets/css/goldenlayout-base.css"
echo "  - assets/css/goldenlayout-dark-theme.css"
echo "  - assets/css/jsoneditor.min.css"
echo "  - assets/js/jsoneditor.min.js"
echo "  - assets/js/rive.js" 