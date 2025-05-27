# Installation

Set up Rive Tester for local development on your machine.

## :computer: Prerequisites

Before you begin, ensure you have the following installed:

- **Modern Web Browser** with WebGL2 support (Chrome, Firefox, Safari, Edge)
- **Node.js** 16+ (for package management)
- **Python** 3.8+ (for documentation development)
- **Git** (for version control)

## :rocket: Quick Setup

### 1. Clone the Repository

```bash
git clone https://github.com/ivg-design/rive_dev_playground.git
cd rive_dev_playground
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

=== "Using npm"

    ```bash
    npm run dev
    ```

=== "Using http-server"

    ```bash
    npx http-server . -p 8080
    ```

=== "Using Python"

    ```bash
    python -m http.server 8080
    ```

### 4. Open in Browser

Navigate to `http://localhost:8080` to access Rive Tester.

## :books: Documentation Development

To work on the documentation locally:

### 1. Install Documentation Dependencies

```bash
pip install -r requirements.txt
```

### 2. Serve Documentation

```bash
mkdocs serve
```

The documentation will be available at `http://localhost:8001`.

### 3. Build Documentation

```bash
mkdocs build
```

This creates a `site/` directory with the built documentation.

## :gear: Development Environment

### Recommended Setup

- **Code Editor**: VS Code with extensions:
  - ES6 modules support
  - Live Server
  - Prettier for code formatting
- **Browser**: Chrome with Developer Tools
- **Terminal**: Integrated terminal in VS Code

### Project Structure

```
rive_dev_playground/
├── index.html              # Main application
├── src/                    # Source code
│   ├── components/         # Core components
│   ├── styles/            # Modular CSS
│   └── utils/             # Utility functions
├── docs/                  # MkDocs documentation
├── node_modules/          # Dependencies
├── package.json           # Node.js configuration
├── mkdocs.yml            # Documentation configuration
└── requirements.txt       # Python dependencies
```

## :warning: Troubleshooting

### Common Issues

| Problem | Solution |
|---------|----------|
| Port already in use | Change port number or kill existing process |
| Module not found | Run `npm install` to install dependencies |
| CORS errors | Use a proper HTTP server, not file:// protocol |
| WebGL2 not supported | Use a modern browser or update graphics drivers |

### Port Conflicts

If port 8080 is already in use:

```bash
# Use a different port
npx http-server . -p 3000

# Or find and kill the process using the port
lsof -ti:8080 | xargs kill -9
```

### Browser Compatibility

Rive Tester requires WebGL2 support. Check compatibility:

```javascript
// Test WebGL2 support in browser console
const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl2');
console.log('WebGL2 supported:', !!gl);
```

## :building_construction: Building for Production

### 1. Optimize Assets

```bash
# Minify CSS and JavaScript (if build tools are configured)
npm run build
```

### 2. Test Production Build

```bash
# Serve the built files
npx http-server dist/ -p 8080
```

### 3. Deploy

The application is a static site and can be deployed to:

- **GitHub Pages** (recommended)
- **Netlify**
- **Vercel**
- **Any static hosting service**

## :globe_with_meridians: Environment Variables

For different deployment environments, you may need to configure:

| Variable | Description | Default |
|----------|-------------|---------|
| `BASE_URL` | Base URL for the application | `/` |
| `DOCS_URL` | Documentation URL | Auto-detected |
| `API_URL` | API endpoint (if applicable) | N/A |

## :package: Dependencies

### Runtime Dependencies

- **@rive-app/webgl2** - Rive runtime
- **jsoneditor** - JSON tree viewer
- **golden-layout** - Panel system

### Development Dependencies

- **http-server** - Local development server
- **mkdocs-material** - Documentation theme

### Optional Dependencies

- **prettier** - Code formatting
- **eslint** - Code linting

## :test_tube: Testing

### Manual Testing

1. **Load a Rive file** and verify all panels work
2. **Test asset replacement** with local files and URLs
3. **Verify responsive design** on different screen sizes
4. **Check browser compatibility** across different browsers

### Automated Testing

Currently, the project uses manual testing. Automated tests can be added using:

- **Jest** for unit tests
- **Cypress** for end-to-end tests
- **Playwright** for cross-browser testing

---

**Next Steps**: [Quick Start](quick-start.md) | [First Steps](first-steps.md) 