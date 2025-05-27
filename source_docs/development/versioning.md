# Semantic Versioning System

The Rive Playground uses an automated semantic versioning system that creates releases based on commit message flags. This prevents automatic versioning on every commit while providing controlled release management.

## Overview

- **No auto-versioning**: Regular commits don't trigger version bumps
- **Flag-based releases**: Only commits with specific flags create new versions
- **Automated workflow**: GitHub Actions handles version bumping, changelog generation, and deployment
- **Semantic versioning**: Follows [SemVer](https://semver.org/) (MAJOR.MINOR.PATCH)

## Version Types

| Type      | When to Use                        | Examples                                |
| --------- | ---------------------------------- | --------------------------------------- |
| **PATCH** | Bug fixes, small improvements      | `fix: canvas clearing issue [patch]`    |
| **MINOR** | New features, non-breaking changes | `feat: add new control panel [minor]`   |
| **MAJOR** | Breaking changes, major updates    | `feat!: redesign API structure [major]` |

## How to Create a Release

### Method 1: Using the Helper Script (Recommended)

```bash
# Make the script executable (first time only)
chmod +x scripts/version.sh

# Create a patch release (bug fixes)
./scripts/version.sh patch "fix: canvas clearing issue"

# Create a minor release (new features)
./scripts/version.sh minor "feat: add asset manager panel"

# Create a major release (breaking changes)
./scripts/version.sh major "feat!: redesign control interface"

# Push to trigger the release
git push origin main
```

### Method 2: Manual Commit with Flags

Add one of these flags to your commit message:

```bash
# Patch release
git commit -m "fix: resolve status bar layout issue [patch]"

# Minor release
git commit -m "feat: add semantic versioning system [minor]"

# Major release
git commit -m "feat!: breaking API changes [major]"

# Push to trigger
git push origin main
```

### Method 3: GitHub Actions Manual Trigger

1. Go to **Actions** tab in GitHub
2. Select **Semantic Release** workflow
3. Click **Run workflow**
4. Choose version type (patch/minor/major)
5. Click **Run workflow**

## Supported Commit Flags

The system recognizes these patterns in commit messages:

### Patch Flags

- `[patch]` or `[PATCH]`
- `[fix]` or `[FIX]`
- `--patch` or `--fix`

### Minor Flags

- `[minor]` or `[MINOR]`
- `--minor`

### Major Flags

- `[major]` or `[MAJOR]`
- `--major`

## What Happens During a Release

When a versioned commit is pushed, the GitHub Action automatically:

1. **Detects the version flag** in the commit message
2. **Bumps the version** in `package.json`
3. **Generates changelog** from commits since last release
4. **Creates version file** (`src/version.js`) with build info
5. **Updates UI** to display version number
6. **Commits changes** with `[skip ci]` flag
7. **Creates Git tag** (e.g., `v1.2.3`)
8. **Creates GitHub Release** with changelog and links
9. **Triggers deployment** to GitHub Pages

## Version Display

The current version is displayed in multiple places:

- **Top-right corner** of the app (small version badge)
- **Browser console** on app load
- **GitHub Releases** page
- **CHANGELOG.md** file

## Package.json Scripts

Add these convenient scripts to your workflow:

```bash
# Quick version releases
npm run version:patch "fix: your bug fix message"
npm run version:minor "feat: your new feature"
npm run version:major "feat!: your breaking change"

# Check current version
npm run version:check
```

## Best Practices

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <description> [version-flag]

Examples:
fix(canvas): resolve clearing issue [patch]
feat(controls): add new panel layout [minor]
feat!(api): redesign parser interface [major]
```

### When to Version

- **PATCH**: Bug fixes, typos, small improvements
- **MINOR**: New features, UI improvements, new components
- **MAJOR**: Breaking changes, major redesigns, API changes

### Development Workflow

1. **Regular development**: Commit normally without flags
2. **Ready for release**: Use version script or add flag
3. **Push to main**: Triggers automated release process
4. **Verify release**: Check GitHub Releases page

## Troubleshooting

### Version Not Created

Check that your commit message contains a valid flag:

```bash
# ❌ Won't trigger version
git commit -m "fix canvas issue"

# ✅ Will trigger patch version
git commit -m "fix canvas issue [patch]"
```

### Failed Release

1. Check the **Actions** tab for error details
2. Ensure you have proper permissions
3. Verify the commit message format
4. Check that `package.json` exists and is valid

### Manual Version Bump

If you need to manually set a version:

```bash
# Set specific version
npm version 2.1.0 --no-git-tag-version

# Commit with skip ci to avoid double-processing
git commit -m "chore: manual version bump to 2.1.0 [skip ci]"
```

## Configuration

The versioning system is configured in:

- **`.github/workflows/semantic-release.yml`** - Main workflow
- **`scripts/version.sh`** - Helper script
- **`package.json`** - Version storage

### Customizing Version Patterns

To add new version trigger patterns, edit the workflow file:

```yaml
# Add new patterns here
if echo "$COMMIT_MSG" | grep -qE "\[patch\]|\[PATCH\]|\[fix\]|\[FIX\]|--patch|--fix|\[hotfix\]"; then
```

## Examples

### Bug Fix Release (1.0.0 → 1.0.1)

```bash
./scripts/version.sh patch "fix: resolve canvas clearing issue"
git push origin main
```

### Feature Release (1.0.1 → 1.1.0)

```bash
./scripts/version.sh minor "feat: add asset manager with drag-drop support"
git push origin main
```

### Breaking Change (1.1.0 → 2.0.0)

```bash
./scripts/version.sh major "feat!: redesign control interface with new API"
git push origin main
```

## Integration with Deployment

The versioning system is integrated with the existing deployment workflow:

1. **Version created** → Triggers semantic release
2. **Files updated** → Version info added to app
3. **Release published** → GitHub Release created
4. **Deployment triggered** → App deployed with new version

This ensures that every release is properly versioned, documented, and deployed automatically.
