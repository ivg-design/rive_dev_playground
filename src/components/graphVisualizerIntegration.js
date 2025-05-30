// Graph Visualizer Integration for Golden Layout
// This file handles the integration of the G6 graph visualizer with the main app

// Import debugger
import { createLogger } from '../utils/debugger/debugLogger.js';
const logger = createLogger('graphVisualizerIntegration');

class GraphVisualizerIntegration {
  constructor() {
    this.visualizer = null;
    this.container = null;
    this.isInitialized = false;
    this.currentData = null;
  }

  async initialize(container) {
    this.container = container;
    
    // Debug container dimensions
    logger.debug('Container element:', container);
    logger.debug('Container dimensions:', {
      offsetWidth: container.offsetWidth,
      offsetHeight: container.offsetHeight,
      clientWidth: container.clientWidth,
      clientHeight: container.clientHeight,
      getBoundingClientRect: container.getBoundingClientRect()
    });
    
    // Validate container has minimum dimensions before proceeding
    if (container.offsetWidth < 10 || container.offsetHeight < 10) {
      logger.warn('Container dimensions too small, showing generate button instead of initializing graph');
      this.showGenerateButton();
      return true; // Don't initialize graph yet, wait for proper sizing
    }
    
    // Ensure container has proper styling for full height
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.minHeight = '400px'; // Fallback minimum height
    container.style.position = 'relative';
    container.style.display = 'block';
    
    // Force container to take up space if it's not sized yet
    if (container.offsetHeight < 50) {
      logger.warn('Container height is too small, forcing minimum height');
      container.style.height = '400px';
    }
    
    try {
      // Wait for G6 to be available
      await this.waitForG6();
      
      // Wait longer for the container to be properly sized by Golden Layout
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check dimensions again after waiting
      logger.debug('Container dimensions after wait:', {
        offsetWidth: container.offsetWidth,
        offsetHeight: container.offsetHeight,
        clientWidth: container.clientWidth,
        clientHeight: container.clientHeight,
        getBoundingClientRect: container.getBoundingClientRect()
      });
      
      // Final validation before creating graph
      if (container.offsetWidth < 10 || container.offsetHeight < 10) {
        logger.warn('Container still has invalid dimensions after wait, showing generate button');
        this.showGenerateButton();
        return true;
      }
      
      // If still no height, force it
      if (container.offsetHeight < 50) {
        logger.warn('Container still has no height after wait, forcing 400px');
        container.style.height = '400px';
        container.style.minHeight = '400px';
        
        // Wait a bit more for the forced height to take effect
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Import the visualizer module
      const { RiveGraphVisualizer } = await import('./riveGraphVisualizer.js');
      
      // Create visualizer instance only if container has valid dimensions
      this.visualizer = new RiveGraphVisualizer(container, {
        includeAssets: true,
        includeEnums: true,
        includeInputs: true
      });
      
      this.isInitialized = true;
      logger.info('Graph visualizer integration initialized successfully');
      
      // Set up event listeners for the main app
      this.setupMainAppIntegration();
      
      // Set up a resize observer on the parent Golden Layout container
      this.setupParentResizeObserver(container);
      
      return true;
      
    } catch (error) {
      logger.error('Failed to initialize graph visualizer integration:', error);
      this.showError(container, 'Failed to initialize graph visualizer: ' + error.message);
      return false;
    }
  }

  waitForG6() {
    return new Promise((resolve, reject) => {
      if (typeof window.G6 !== 'undefined') {
        resolve();
        return;
      }
      
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds
      
      const checkG6 = () => {
        attempts++;
        if (typeof window.G6 !== 'undefined') {
          resolve();
        } else if (attempts >= maxAttempts) {
          reject(new Error('G6 library not available'));
        } else {
          setTimeout(checkG6, 100);
        }
      };
      
      checkG6();
    });
  }

  setupMainAppIntegration() {
    // Listen for parser data updates from the main app
    if (window.riveParserHandler) {
      // Hook into the parser handler's data update events
      const originalUpdateData = window.riveParserHandler.updateData;
      if (originalUpdateData) {
        window.riveParserHandler.updateData = (data) => {
          // Call original method
          originalUpdateData.call(window.riveParserHandler, data);
          
          // Store data but don't auto-generate graph
          this.currentData = data;
          this.showGenerateButton();
        };
      }
    }

    // Listen for custom events from the main app
    document.addEventListener('riveDataUpdated', (event) => {
      if (event.detail && event.detail.data) {
        this.currentData = event.detail.data;
        this.showGenerateButton();
      }
    });

    // Listen for JSON Editor updates (primary data source)
    document.addEventListener('jsonEditorUpdated', (event) => {
      if (event.detail && event.detail.data) {
        logger.debug('Graph visualizer received JSON Editor data:', event.detail.data);
        this.currentData = event.detail.data;
        this.showGenerateButton();
      }
    });

    // Hook into the Golden Layout JSON Editor updates
    const originalUpdateJSONEditor = window.updateJSONEditor;
    if (originalUpdateJSONEditor) {
      window.updateJSONEditor = (data) => {
        // Call original method
        originalUpdateJSONEditor(data);
        
        // Store data but don't auto-generate graph
        if (data && typeof data === 'object' && !data.message) {
          logger.debug('Graph visualizer updating from JSON Editor data:', data);
          this.currentData = data;
          this.showGenerateButton();
        }
      };
    }

    // Also check if there's already parsed data available
    setTimeout(() => {
      this.checkForExistingData();
    }, 500);
  }

  checkForExistingData() {
    // Try to get data from the JSON Editor if it exists
    if (window.jsonEditorInstance && window.jsonEditorInstance.get) {
      try {
        const existingData = window.jsonEditorInstance.get();
        if (existingData && typeof existingData === 'object' && !existingData.message) {
          logger.debug('Graph visualizer found existing JSON Editor data:', existingData);
          this.currentData = existingData;
          this.showGenerateButton();
        }
      } catch (error) {
        logger.warn('Could not get existing data from JSON Editor:', error);
      }
    }

    // Try to get data from global variables if available
    if (window.currentParsedData) {
      logger.debug('Graph visualizer found existing parsed data:', window.currentParsedData);
      this.currentData = window.currentParsedData;
      this.showGenerateButton();
    }
  }

  showGenerateButton() {
    if (!this.container) return;

    // Clear container and show generate button
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

    // Add event listener for generate button
    const generateBtn = this.container.querySelector('#generateGraphBtn');
    if (generateBtn) {
      generateBtn.addEventListener('click', () => {
        this.generateGraph();
      });
    }
  }

  generateGraph() {
    if (!this.currentData) {
      logger.warn('No data available to generate graph');
      this.showError(this.container, 'No data available to generate graph. Please load a Rive file first.');
      return;
    }

    // Show loading state
    this.container.innerHTML = `
      <div class="graph-loading">
        <div class="loading-spinner"></div>
        <p>Generating graph visualization...</p>
      </div>
    `;

    // Generate graph after a short delay to show loading state
    setTimeout(async () => {
      try {
        // If visualizer is not initialized, initialize it now
        if (!this.isInitialized || !this.visualizer) {
          logger.info('Visualizer not initialized, initializing now for graph generation');
          
          // Clear the loading state and prepare container for graph
          this.container.innerHTML = '';
          
          // Ensure container has proper dimensions
          this.container.style.width = '100%';
          this.container.style.height = '100%';
          this.container.style.minHeight = '400px';
          this.container.style.position = 'relative';
          this.container.style.display = 'block';
          
          // Force layout if needed
          if (this.container.offsetHeight < 50) {
            this.container.style.height = '400px';
          }
          
          // Wait for container to be properly sized
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Validate dimensions one more time
          const rect = this.container.getBoundingClientRect();
          if (rect.width < 10 || rect.height < 10) {
            throw new Error(`Container dimensions still too small: ${rect.width}x${rect.height}`);
          }
          
          // Import and create visualizer
          const { RiveGraphVisualizer } = await import('./riveGraphVisualizer.js');
          this.visualizer = new RiveGraphVisualizer(this.container, {
            includeAssets: true,
            includeEnums: true,
            includeInputs: true
          });
          
          this.isInitialized = true;
          logger.info('Graph visualizer initialized successfully for graph generation');
        }
        
        // Now update with data
        await this.updateData(this.currentData);
        
      } catch (error) {
        logger.error('Failed to generate graph:', error);
        this.showError(this.container, 'Failed to generate graph: ' + error.message);
      }
    }, 100);
  }

  async updateData(riveData) {
    if (!this.isInitialized || !this.visualizer) {
      logger.warn('Graph visualizer not initialized, cannot update data');
      return;
    }

    try {
      this.currentData = riveData;
      await this.visualizer.updateData(riveData);
      
      // Update statistics in the main app if available
      this.updateMainAppStatistics();
      
    } catch (error) {
      logger.error('Failed to update graph visualizer data:', error);
      this.showError(this.container, 'Failed to update graph: ' + error.message);
    }
  }

  updateMainAppStatistics() {
    if (!this.visualizer) return;

    try {
      const stats = this.visualizer.getStatistics();
      
      // Update graph statistics in the main app UI if elements exist
      const nodeCountEl = document.getElementById('nodeCount');
      const edgeCountEl = document.getElementById('edgeCount');
      const comboCountEl = document.getElementById('comboCount');
      
      if (nodeCountEl) nodeCountEl.textContent = stats.nodes;
      if (edgeCountEl) edgeCountEl.textContent = stats.edges;
      if (comboCountEl) comboCountEl.textContent = stats.combos;
      
    } catch (error) {
      logger.warn('Failed to update main app statistics:', error);
    }
  }

  async updateOptions(options) {
    if (!this.isInitialized || !this.visualizer) return;

    try {
      this.visualizer.updateOptions(options);
      
      // Reload current data with new options
      if (this.currentData) {
        await this.visualizer.updateData(this.currentData);
      }
      
    } catch (error) {
      logger.error('Failed to update graph visualizer options:', error);
    }
  }

  fitView() {
    if (!this.isInitialized || !this.visualizer || !this.visualizer.graph) return;

    try {
      if (this.visualizer.graph.fitView) {
        this.visualizer.graph.fitView();
      }
    } catch (error) {
      logger.warn('Failed to fit view:', error);
    }
  }

  exportImage(format = 'png') {
    if (!this.isInitialized || !this.visualizer) return false;

    try {
      return this.visualizer.exportImage(format);
    } catch (error) {
      logger.error('Failed to export graph:', error);
      return false;
    }
  }

  refresh() {
    if (!this.isInitialized || !this.visualizer || !this.visualizer.graph) return;

    try {
      if (this.visualizer.graph.render) {
        this.visualizer.graph.render();
      }
    } catch (error) {
      logger.warn('Failed to refresh graph:', error);
    }
  }

  clear() {
    if (!this.isInitialized || !this.visualizer || !this.visualizer.graph) return;

    try {
      if (this.visualizer.graph.clear) {
        this.visualizer.graph.clear();
      } else {
        // Fallback: set empty data
        this.visualizer.graph.setData({ nodes: [], edges: [] });
        this.visualizer.graph.render();
      }
      
      this.currentData = null;
      this.updateMainAppStatistics();
      
    } catch (error) {
      logger.error('Failed to clear graph:', error);
    }
  }

  resize() {
    if (!this.isInitialized || !this.visualizer) return;

    try {
      this.visualizer.resize();
    } catch (error) {
      logger.warn('Failed to resize graph:', error);
    }
  }

  getStatistics() {
    if (!this.isInitialized || !this.visualizer) {
      return { nodes: 0, edges: 0, combos: 0 };
    }

    try {
      return this.visualizer.getStatistics();
    } catch (error) {
      logger.warn('Failed to get graph statistics:', error);
      return { nodes: 0, edges: 0, combos: 0 };
    }
  }

  testMethods() {
    if (!this.isInitialized || !this.visualizer) return {};

    try {
      return this.visualizer.testAllMethods();
    } catch (error) {
      logger.error('Failed to test methods:', error);
      return {};
    }
  }

  getGraphInfo() {
    if (!this.isInitialized || !this.visualizer) return null;

    try {
      return this.visualizer.getGraphInfo();
    } catch (error) {
      logger.error('Failed to get graph info:', error);
      return null;
    }
  }

  showError(container, message) {
    // Clear container
    container.innerHTML = '';
    
    // Create error display
    const errorDiv = document.createElement('div');
    errorDiv.className = 'graph-visualizer-error';
    errorDiv.innerHTML = `
      <div class="error-icon">⚠️</div>
      <div class="error-title">Graph Visualizer Error</div>
      <div class="error-message">${message}</div>
      <button class="error-retry-btn" onclick="window.graphVisualizerIntegration?.initialize(this.closest('.graph-visualizer-container'))">
        Retry
      </button>
    `;
    
    container.appendChild(errorDiv);
  }

  destroy() {
    // Clean up parent resize observer
    if (this.parentResizeObserver) {
      this.parentResizeObserver.disconnect();
      this.parentResizeObserver = null;
    }
    
    if (this.visualizer) {
      try {
        this.visualizer.destroy();
      } catch (error) {
        logger.warn('Error destroying visualizer:', error);
      }
    }
    
    this.visualizer = null;
    this.container = null;
    this.isInitialized = false;
    this.currentData = null;
  }

  setupParentResizeObserver(container) {
    // Find the Golden Layout content container
    let parentContainer = container.parentElement;
    while (parentContainer && !parentContainer.classList.contains('lm_content')) {
      parentContainer = parentContainer.parentElement;
    }
    
    if (parentContainer && window.ResizeObserver) {
      logger.debug('Setting up parent resize observer on:', parentContainer);
      
      this.parentResizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            logger.debug('Parent container resized:', { width, height });
            
            // Update our container to match
            container.style.width = '100%';
            container.style.height = '100%';
            
            // Trigger visualizer resize
            if (this.visualizer && this.visualizer.resize) {
              setTimeout(() => {
                this.visualizer.resize();
              }, 50);
            }
          }
        }
      });
      
      this.parentResizeObserver.observe(parentContainer);
    }
  }
}

// Create global instance for the main app
window.graphVisualizerIntegration = new GraphVisualizerIntegration();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GraphVisualizerIntegration;
} 