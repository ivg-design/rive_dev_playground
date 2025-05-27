#!/usr/bin/env node

/**
 * Local deployment test script
 * This script creates a local version of what will be deployed to GitHub Pages
 * to help test the deployment structure before pushing.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

console.log("🚀 Testing deployment structure locally...");

// Create test deployment directory
const testDir = path.join(projectRoot, "_test-deployment");
const riveTestDir = path.join(testDir, "rive-tester");

// Clean and create directories
if (fs.existsSync(testDir)) {
	fs.rmSync(testDir, { recursive: true });
}
fs.mkdirSync(testDir, { recursive: true });
fs.mkdirSync(riveTestDir, { recursive: true });

console.log("📁 Created test directories");

// Copy files (same as GitHub Actions workflow)
const filesToCopy = ["index.html", "style.css", "package.json", "README.md"];

filesToCopy.forEach((file) => {
	const src = path.join(projectRoot, file);
	const dest = path.join(riveTestDir, file);
	if (fs.existsSync(src)) {
		fs.copyFileSync(src, dest);
		console.log(`✅ Copied ${file}`);
	} else {
		console.log(`⚠️  Warning: ${file} not found`);
	}
});

// Copy src directory
const srcDir = path.join(projectRoot, "src");
const destSrcDir = path.join(riveTestDir, "src");
if (fs.existsSync(srcDir)) {
	fs.cpSync(srcDir, destSrcDir, { recursive: true });
	console.log("✅ Copied src directory");
}

// Copy animations directory if it exists
const animationsDir = path.join(projectRoot, "animations");
const destAnimationsDir = path.join(riveTestDir, "animations");
if (fs.existsSync(animationsDir)) {
	fs.cpSync(animationsDir, destAnimationsDir, { recursive: true });
	console.log("✅ Copied animations directory");
}

// Copy .riv files
const files = fs.readdirSync(projectRoot);
const rivFiles = files.filter((file) => file.endsWith(".riv"));
rivFiles.forEach((file) => {
	const src = path.join(projectRoot, file);
	const dest = path.join(riveTestDir, file);
	fs.copyFileSync(src, dest);
	console.log(`✅ Copied ${file}`);
});

// Install dependencies in test directory
console.log("📦 Installing dependencies...");
try {
	process.chdir(riveTestDir);
	execSync("npm install --production", { stdio: "inherit" });
	console.log("✅ Dependencies installed");
} catch (error) {
	console.error("❌ Error installing dependencies:", error.message);
	process.exit(1);
}

// Create landing page
const landingPageContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IVG Design Tools - Local Test</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            background: #0f0f0f;
            color: #e0e0e0;
        }
        .container {
            text-align: center;
        }
        h1 {
            color: #ffffff;
            margin-bottom: 2rem;
        }
        .tool-card {
            background: #1a1a1a;
            border: 1px solid #333;
            border-radius: 8px;
            padding: 2rem;
            margin: 1rem 0;
            transition: transform 0.2s, border-color 0.2s;
        }
        .tool-card:hover {
            transform: translateY(-2px);
            border-color: #555;
        }
        .tool-card h2 {
            color: #ffffff;
            margin-top: 0;
        }
        .tool-card p {
            color: #b0b0b0;
            margin-bottom: 1.5rem;
        }
        .btn {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            background: #6366f1;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            transition: background 0.2s;
        }
        .btn:hover {
            background: #5855eb;
        }
        .test-notice {
            background: #fbbf24;
            color: #000;
            padding: 1rem;
            border-radius: 6px;
            margin-bottom: 2rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="test-notice">
            <strong>🧪 Local Deployment Test</strong><br>
            This is a local test of the GitHub Pages deployment structure.
        </div>
        
        <h1>IVG Design Tools</h1>
        
        <div class="tool-card">
            <h2>Rive File Parser & Inspector</h2>
            <p>Interactive tool for parsing and inspecting Rive animation files. Load .riv files, explore their structure, and test animations with dynamic controls.</p>
            <a href="./rive-tester/" class="btn">Launch Rive Tester</a>
        </div>
    </div>
</body>
</html>`;

fs.writeFileSync(path.join(testDir, "index.html"), landingPageContent);
console.log("✅ Created landing page");

// Return to project root
process.chdir(projectRoot);

console.log("\n🎉 Test deployment created successfully!");
console.log(`📂 Test directory: ${testDir}`);
console.log("\n🌐 To test locally:");
console.log("1. Start a local server in the test directory:");
console.log(`   cd "${testDir}"`);
console.log("   npx http-server -p 8080");
console.log("2. Open http://localhost:8080 in your browser");
console.log('3. Click "Launch Rive Tester" to test the app');
console.log("\n🗑️  To clean up: rm -rf _test-deployment");
