# Rive Tester - GitHub Pages Deployment

This document explains how the Rive Tester app is deployed to GitHub Pages and how to access it.

## Live Demo

🚀 **Access the live app**: [https://ivg-design.github.io/rive-tester/rive-tester/](https://ivg-design.github.io/rive-tester/rive-tester/)

## Deployment Structure

The deployment creates the following structure:

```
https://ivg-design.github.io/rive-tester/
├── index.html                    # Landing page with tool links
└── rive-tester/                  # Rive Tester application
    ├── index.html                # Main app interface
    ├── style.css                 # App styling
    ├── src/                      # Source code modules
    ├── node_modules/             # Dependencies (Rive runtime, etc.)
    ├── *.riv                     # Sample Rive files
    └── README.md                 # App documentation
```

## How It Works

1. **Automatic Deployment**: The GitHub Actions workflow (`.github/workflows/deploy-rive-tester.yml`) automatically deploys the app when changes are pushed to the main branch.

2. **Dependencies**: The workflow installs all npm dependencies including the Rive WebGL2 runtime, ensuring the app works in the browser environment.

3. **Static Hosting**: All files are served statically from GitHub Pages, making the app accessible without a backend server.

## Features Available in Deployed Version

✅ **File Upload**: Upload and parse local .riv files  
✅ **Animation Playback**: Control timeline and state machine animations  
✅ **ViewModel Controls**: Interactive controls for ViewModel properties  
✅ **JSON Inspector**: Detailed view of parsed Rive file structure  
✅ **Debug System**: Built-in debugging with persistent settings  
✅ **Responsive Design**: Works on desktop and mobile devices  

## Local Development vs Deployed Version

| Feature | Local Development | Deployed Version |
|---------|------------------|------------------|
| File Access | Direct file system | Upload only |
| Dependencies | npm install required | Pre-installed |
| Hot Reload | Available with dev server | Static files |
| Debugging | Full console access | Browser dev tools |

## Updating the Deployment

To update the deployed version:

1. Make changes to the code locally
2. Test thoroughly using a local server
3. Commit and push changes to the main branch
4. GitHub Actions will automatically rebuild and deploy

## Troubleshooting

### App Not Loading
- Check browser console for errors
- Ensure JavaScript is enabled
- Try a hard refresh (Ctrl+F5 or Cmd+Shift+R)

### File Upload Issues
- Ensure the file is a valid .riv file
- Check file size (GitHub Pages has limits)
- Try with a different browser

### Animation Not Playing
- Check that the Rive file contains animations
- Verify ViewModel properties are correctly configured
- Use the debug panel to inspect the loaded data

## Repository Structure

This deployment is part of the larger IVG Design tools ecosystem:

- **Main Repository**: Contains the Rive Tester source code
- **CEP Documentation**: Separate documentation site at `ivg-design.github.io/cep`
- **Landing Page**: Unified access point for all tools

## Contributing

To contribute to the Rive Tester:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

The deployment will automatically update once changes are merged to main. 