import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const riveFilePath = path.join('animations', 'diagram_v3.riv');

function logBoth(message, data) {
    console.log(chalk.blue('ℹ RIVE PARSER:'), message, data || '');
}

// Initialize Express app
const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Serve static files from the current directory and animations directory
app.use(express.static('.'));
app.use('/animations', express.static('animations'));
app.use('/node_modules', express.static('node_modules'));

// WebSocket connection handling
wss.on('connection', (ws) => {
    logBoth('Browser connected');
    
    ws.on('message', (message) => {
        logBoth('Browser console output:', message.toString());
    });
    
    ws.on('close', () => {
        logBoth('Browser disconnected');
    });
});

async function parseRiveFile(filePath) {
    const startTime = Date.now();
    try {
        logBoth('Reading file', filePath);
        
        // Start the server
        const PORT = process.env.PORT || 3000;
        server.listen(PORT, () => {
            logBoth(`Server running at http://localhost:${PORT}`);
            logBoth('Open this URL in your browser to parse the Rive file');
        });
        
        const endTime = Date.now();
        const loadTime = endTime - startTime;
        logBoth('Performance:', `Load time: ${loadTime}ms`);
    } catch (err) {
        logBoth('Failed to read or parse file', err);
    }
}

parseRiveFile(riveFilePath); 