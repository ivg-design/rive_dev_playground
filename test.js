import { Rive, Layout, Fit, Alignment } from '@rive-app/canvas';
import chalk from 'chalk';
import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';

// Initialize Express app
const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Serve static files
app.use(express.static('.'));

// Logging utility that sends to both console and browser
const log = {
    info: (message) => {
        console.log(chalk.blue('ℹ INFO:'), message);
        broadcastToBrowsers({ type: 'log', level: 'info', message });
    },
    success: (message) => {
        console.log(chalk.green('✓ SUCCESS:'), message);
        broadcastToBrowsers({ type: 'log', level: 'success', message });
    },
    error: (message) => {
        console.log(chalk.red('✗ ERROR:'), message);
        broadcastToBrowsers({ type: 'log', level: 'error', message });
    },
    debug: (message) => {
        console.log(chalk.gray('🔍 DEBUG:'), message);
        broadcastToBrowsers({ type: 'log', level: 'debug', message });
    }
};

// WebSocket connection handling
wss.on('connection', (ws) => {
    log.info('Browser connected');
    
    ws.on('close', () => {
        log.info('Browser disconnected');
    });
});

// Broadcast to all connected browsers
function broadcastToBrowsers(data) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

// Rive testing utilities
const riveTest = {
    async loadAnimation(riveFile) {
        try {
            log.info(`Loading animation: ${riveFile}`);
            const rive = new Rive({
                src: riveFile,
                canvas: document.createElement('canvas'),
                layout: new Layout({
                    fit: Fit.Contain,
                    alignment: Alignment.Center,
                }),
                onLoad: () => {
                    log.success(`Successfully loaded: ${riveFile}`);
                },
                onError: (error) => {
                    log.error(`Failed to load ${riveFile}: ${error}`);
                }
            });
            return rive;
        } catch (error) {
            log.error(`Error loading animation: ${error.message}`);
            throw error;
        }
    },

    async testAnimation(riveFile) {
        log.info('Starting animation test suite');
        try {
            const rive = await this.loadAnimation(riveFile);
            // Add your specific animation tests here
            log.success('Animation test suite completed');
        } catch (error) {
            log.error('Animation test suite failed');
        }
    }
};

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    log.info(`Server running at http://localhost:${PORT}`);
    log.info('Ready to test Rive animations');
});

// Export for use in other files
export { log, riveTest }; 