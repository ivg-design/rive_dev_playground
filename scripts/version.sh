#!/bin/bash

# Semantic Versioning Helper Script
# Usage: ./scripts/version.sh [patch|minor|major] "commit message"

set -e

VERSION_TYPE=${1:-patch}
COMMIT_MSG=${2:-""}

if [ -z "$COMMIT_MSG" ]; then
    echo "❌ Error: Commit message is required"
    echo "Usage: ./scripts/version.sh [patch|minor|major] \"commit message\""
    echo ""
    echo "Examples:"
    echo "  ./scripts/version.sh patch \"fix: canvas clearing issue\""
    echo "  ./scripts/version.sh minor \"feat: add new control panel\""
    echo "  ./scripts/version.sh major \"feat!: breaking API changes\""
    exit 1
fi

# Validate version type
case $VERSION_TYPE in
    patch|fix)
        VERSION_FLAG="[patch]"
        ;;
    minor|feat)
        VERSION_FLAG="[minor]"
        ;;
    major|breaking)
        VERSION_FLAG="[major]"
        ;;
    *)
        echo "❌ Error: Invalid version type '$VERSION_TYPE'"
        echo "Valid types: patch, minor, major (or fix, feat, breaking)"
        exit 1
        ;;
esac

# Create the commit message with version flag
FULL_COMMIT_MSG="$COMMIT_MSG $VERSION_FLAG"

echo "🚀 Creating semantic version commit..."
echo "📝 Type: $VERSION_TYPE"
echo "💬 Message: $FULL_COMMIT_MSG"
echo ""

# Add all changes
git add .

# Commit with the version flag
git commit -m "$FULL_COMMIT_MSG"

echo "✅ Commit created successfully!"
echo "📤 Push to trigger version release:"
echo "   git push origin main"
echo ""
echo "🔍 The GitHub Action will:"
echo "   - Detect the $VERSION_FLAG flag"
echo "   - Bump the $VERSION_TYPE version"
echo "   - Create a new release"
echo "   - Deploy the updated app" 