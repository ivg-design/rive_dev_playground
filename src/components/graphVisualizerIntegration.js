// Graph Visualizer Integration for Golden Layout
// Simplified integration that properly handles initialization timing

import { createLogger } from '../utils/debugger/debugLogger.js';
const logger = createLogger('graphVisualizerIntegration');

class GraphVisualizerIntegration {
  constructor() {
    this.visualizer = null;
    this.container = null;
    this.currentData = null;
  }

  async initialize(container) {
    this.container = container;
    logger.info('Graph visualizer integration starting...');
    
    // Validate container
    if (!container) {
      throw new Error('Container element is required');
    }

    // Setup container immediately
    this.setupContainer();
    
    // Wait for G6 library
    await this.waitForG6();
    
    // Setup app integration hooks
    this.setupMainAppIntegration();
    
    // Show the generate button initially
    this.showGenerateButton();
    
    logger.info('Graph visualizer integration initialized');
    return true;
  }

  setupContainer() {
    // Ensure container has proper base styling
    this.container.style.width = '100%';
    this.container.style.height = '100%';
    this.container.style.position = 'relative';
    this.container.style.display = 'block';
    this.container.style.backgroundColor = '#111827';
    this.container.style.border = '1px solid #374151';
    this.container.style.borderRadius = '8px';
  }

  waitForG6() {
    return new Promise((resolve, reject) => {
      if (typeof window.G6 !== 'undefined') {
        logger.debug('G6 library already available');
        resolve();
        return;
      }
      
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds
      
      const checkG6 = () => {
        attempts++;
        if (typeof window.G6 !== 'undefined') {
          logger.debug('G6 library became available');
          resolve();
        } else if (attempts >= maxAttempts) {
          reject(new Error('G6 library not available after timeout'));
        } else {
          setTimeout(checkG6, 100);
        }
      };
      
      checkG6();
    });
  }

  setupMainAppIntegration() {
    // Listen for JSON Editor updates (primary data source)
    document.addEventListener('jsonEditorUpdated', (event) => {
      if (event.detail && event.detail.data) {
        logger.debug('Received JSON Editor data update');
        this.currentData = event.detail.data;
        this.showGenerateButton();
      }
    });

    // Hook into Golden Layout JSON Editor updates
    const originalUpdateJSONEditor = window.updateJSONEditor;
    if (originalUpdateJSONEditor) {
      window.updateJSONEditor = (data) => {
        originalUpdateJSONEditor(data);
        
        if (data && typeof data === 'object' && !data.message) {
          logger.debug('Updating data from JSON Editor hook');
          this.currentData = data;
          this.showGenerateButton();
        }
      };
    }

    // Check for existing data after a brief delay
    setTimeout(() => this.checkForExistingData(), 500);
  }

  checkForExistingData() {
    // Try JSON Editor first
    if (window.jsonEditorInstance && window.jsonEditorInstance.get) {
      try {
        const existingData = window.jsonEditorInstance.get();
        if (existingData && typeof existingData === 'object' && !existingData.message) {
          logger.debug('Found existing JSON Editor data');
          this.currentData = existingData;
          this.showGenerateButton();
          return;
        }
      } catch (error) {
        logger.debug('Could not get data from JSON Editor:', error.message);
      }
    }

    // Try global variables
    if (window.currentParsedData) {
      logger.debug('Found existing global parsed data');
      this.currentData = window.currentParsedData;
      this.showGenerateButton();
    }
  }

  showGenerateButton() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="graph-generate-prompt">
        <div class="generate-icon">🌳</div>
        <h3>Generate Graph Visualization</h3>
        <p>Click the button below to generate a graph visualization of your Rive file structure.</p>
        <button class="generate-graph-btn" id="generateGraphBtn">
          <i class="fas fa-project-diagram"></i>
          Generate Graph
        </button>
      </div>
    `;

    const generateBtn = this.container.querySelector('#generateGraphBtn');
    if (generateBtn) {
      generateBtn.addEventListener('click', () => {
        this.generateGraph();
      }, { passive: true });
    }
  }

  async generateGraph() {
    if (!this.currentData) {
      logger.warn('No data available for graph generation');
      this.showError('No data available to generate graph. Please load a Rive file first.');
      return;
    }

    logger.info('Starting graph generation...');
    
    // Show loading state
    this.showLoading();

    try {
      // Create visualizer if needed
      if (!this.visualizer) {
        await this.createVisualizer();
      }
      
      // Load data
      await this.visualizer.loadData(this.currentData);
      
      logger.info('Graph generation completed successfully');
      
    } catch (error) {
      logger.error('Graph generation failed:', error);
      this.showError(`Failed to generate graph: ${error.message}`);
    }
  }

  showLoading() {
    this.container.innerHTML = `
      <div class="graph-loading">
        <div class="loading-spinner"></div>
        <p>Generating graph visualization...</p>
      </div>
    `;
  }

  async createVisualizer() {
    logger.info('Creating graph visualizer...');
    
    // Clear container
    this.container.innerHTML = '';
    
    // Import visualizer class
    const { RiveGraphVisualizer } = await import('./riveGraphVisualizer.js');
    
    // Create visualizer instance
    this.visualizer = new RiveGraphVisualizer(this.container, {
      includeAssets: true,
      includeEnums: true,
      includeInputs: true
    });
    
    // Initialize it - this handles all the timing and validation
    await this.visualizer.initialize();
    
    logger.info('Graph visualizer created and initialized');
  }

  showError(message) {
    this.container.innerHTML = `
      <div class="graph-visualizer-error">
        <div class="error-icon">⚠️</div>
        <div class="error-title">Graph Visualizer Error</div>
        <div class="error-message">${message}</div>
        <button class="error-retry-btn" id="retryBtn">
          Retry
        </button>
      </div>
    `;
    
    const retryBtn = this.container.querySelector('#retryBtn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        this.generateGraph();
      }, { passive: true });
    }
  }

  // Public API methods
  async updateData(riveData) {
    this.currentData = riveData;
    
    if (this.visualizer) {
      try {
        await this.visualizer.loadData(riveData);
        this.updateMainAppStatistics();
      } catch (error) {
        logger.error('Failed to update graph data:', error);
        this.showError(`Failed to update graph: ${error.message}`);
      }
    } else {
      // Just show the generate button if visualizer not created yet
      this.showGenerateButton();
    }
  }

  updateMainAppStatistics() {
    if (!this.visualizer) return;

    try {
      const stats = this.visualizer.getStatistics();
      
      const nodeCountEl = document.getElementById('nodeCount');
      const edgeCountEl = document.getElementById('edgeCount');
      
      if (nodeCountEl) nodeCountEl.textContent = stats.nodes;
      if (edgeCountEl) edgeCountEl.textContent = stats.edges;
      
    } catch (error) {
      logger.debug('Could not update statistics:', error.message);
    }
  }

  fitView() {
    if (this.visualizer) {
      this.visualizer.fitView();
    }
  }

  exportImage(format = 'png') {
    if (this.visualizer) {
      return this.visualizer.exportImage(format);
    }
    return null;
  }

  resize() {
    if (this.visualizer) {
      this.visualizer.resize();
    }
  }

  getStatistics() {
    if (this.visualizer) {
      return this.visualizer.getStatistics();
    }
    return { nodes: 0, edges: 0 };
  }

  clear() {
    this.currentData = null;
    
    if (this.visualizer) {
      this.visualizer.destroy();
      this.visualizer = null;
    }
    
    this.showGenerateButton();
  }

  destroy() {
    logger.info('Destroying graph visualizer integration...');
    
    if (this.visualizer) {
      this.visualizer.destroy();
      this.visualizer = null;
    }
    
    this.container = null;
    this.currentData = null;
    
    logger.info('Graph visualizer integration destroyed');
  }

  // Test function to load JSON data directly
  async loadTestData(jsonUrl = '/assets/reference/diagram_v5_parsed-data_2025-05-30T14-03-10.json') {
    logger.info('Loading test data from:', jsonUrl);
    
    try {
      // Show loading message
      this.showMessage('Loading test data...', 'info');
      
      // Fetch the JSON data
      const response = await fetch(jsonUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch test data: ${response.statusText}`);
      }
      
      const testData = await response.json();
      logger.info('Test data loaded successfully, size:', Object.keys(testData).length);
      
      // Load into visualizer
      await this.updateData(testData);
      
      this.showMessage('Test data loaded successfully! Click nodes to expand/collapse them.', 'success');
      
    } catch (error) {
      logger.error('Failed to load test data:', error);
      this.showError(`Failed to load test data: ${error.message}`);
    }
  }

  // Helper method to show different types of messages
  showMessage(message, type = 'info') {
    if (this.container) {
      const messageEl = document.createElement('div');
      messageEl.className = `graph-message graph-message-${type}`;
      messageEl.innerHTML = `
        <div class="message-content">
          <span class="message-icon">${this.getMessageIcon(type)}</span>
          <span class="message-text">${message}</span>
        </div>
      `;
      
      // Style the message
      messageEl.style.cssText = `
        position: absolute;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1000;
        background: ${type === 'error' ? '#dc2626' : type === 'success' ? '#059669' : '#3b82f6'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        font-size: 14px;
        max-width: 400px;
        text-align: center;
      `;
      
      this.container.appendChild(messageEl);
      
      // Auto-remove after delay
      setTimeout(() => {
        if (messageEl.parentNode) {
          messageEl.parentNode.removeChild(messageEl);
        }
      }, type === 'error' ? 8000 : 4000);
    }
  }

  getMessageIcon(type) {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    };
    return icons[type] || icons.info;
  }
}

// Create global instance
window.graphVisualizerIntegration = new GraphVisualizerIntegration();

export default GraphVisualizerIntegration; 