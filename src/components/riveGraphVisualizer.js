// Browser-compatible Rive Graph Visualizer using G6 UMD build
// Following the g6_example.js pattern exactly with tree data structure

// Import debugger
import { createLogger } from '../utils/debugger/debugLogger.js';
const logger = createLogger('riveGraphVisualizer');

// Custom TreeNode class - simplified version of the G6 example
class RiveTreeNode extends window.G6.Rect {
  get data() {
    try {
      return this.context.model.getNodeLikeDatum(this.id);
    } catch (error) {
      // Return default data if node not found (happens during collapse/expand)
      logger.warn('Node data not found for id:', this.id, 'using default data');
      return {
        name: 'Unknown',
        nodeType: 'default',
        details: ''
      };
    }
  }

  get childrenData() {
    try {
      return this.context.model.getChildrenData(this.id);
    } catch (error) {
      // Return empty array if children data not found
      return [];
    }
  }

  getLabelStyle(attributes) {
    const [width, height] = this.getSize(attributes);
    const data = this.data;
    return {
      x: -width / 2 + 8,
      y: -height / 2 + 16,
      text: data?.name || 'Unknown',
      fontSize: 12,
      opacity: 0.85,
      fill: '#fff',
      cursor: 'pointer',
    };
  }

  drawLabelShape(attributes, container) {
    const labelStyle = this.getLabelStyle(attributes);
    this.upsert('label', window.G6.Label, labelStyle, container);
  }

  getDetailsStyle(attributes) {
    const [width, height] = this.getSize(attributes);
    const data = this.data;
    return {
      x: -width / 2 + 8,
      y: height / 2 - 8,
      text: data?.details || '',
      fontSize: 10,
      fill: '#fff',
      opacity: 0.75,
    };
  }

  drawDetailsShape(attributes, container) {
    const detailsStyle = this.getDetailsStyle(attributes);
    this.upsert('details', window.G6.Label, detailsStyle, container);
  }

  getTypeStyle(attributes) {
    const [width, height] = this.getSize(attributes);
    const data = this.data;
    return {
      x: width / 2 - 8,
      y: -height / 2 + 16,
      text: data?.nodeType || '',
      fontSize: 10,
      textAlign: 'right',
      fill: '#fff',
      opacity: 0.6,
    };
  }

  drawTypeShape(attributes, container) {
    const typeStyle = this.getTypeStyle(attributes);
    this.upsert('type', window.G6.Label, typeStyle, container);
  }

  getCollapseStyle(attributes) {
    if (this.childrenData.length === 0) return false;
    const { collapsed } = attributes;
    const [width, height] = this.getSize(attributes);
    return {
      backgroundFill: '#fff',
      backgroundHeight: 16,
      backgroundLineWidth: 1,
      backgroundRadius: 0,
      backgroundStroke: '#666',
      backgroundWidth: 16,
      cursor: 'pointer',
      fill: '#666',
      fontSize: 16,
      text: collapsed ? '+' : '-',
      textAlign: 'center',
      textBaseline: 'middle',
      x: width / 2,
      y: 0,
    };
  }

  drawCollapseShape(attributes, container) {
    const collapseStyle = this.getCollapseStyle(attributes);
    if (!collapseStyle) return;
    
    const btn = this.upsert('collapse', window.G6.Badge, collapseStyle, container);

    if (btn && !Reflect.has(btn, '__bind__')) {
      Reflect.set(btn, '__bind__', true);
      btn.addEventListener(window.G6.CommonEvent.CLICK, () => {
        const { collapsed } = this.attributes;
        const graph = this.context.graph;
        
        if (collapsed) {
          graph.expandElement(this.id);
          // Gentle layout adjustment for expand
          setTimeout(() => {
            if (graph.layout) {
              graph.layout({ preset: { type: 'dagre', rankdir: 'TB', nodesep: 100, ranksep: 120 } });
            }
          }, 100);
        } else {
          graph.collapseElement(this.id);
          // No layout update needed for collapse - it looks fine
        }
      });
    }
  }

  getKeyStyle(attributes) {
    const keyStyle = super.getKeyStyle(attributes);
    const data = this.data;
    const nodeType = data?.nodeType || 'default';
    
    // Color scheme based on node type
    const colors = {
      // Root
      root: { fill: '#1f2937', stroke: '#6b7280' },
      
      // Main category nodes (auto-detected from root level)
      artboardsRoot: { fill: '#1e3a8a', stroke: '#3b82f6' },
      assetsRoot: { fill: '#365314', stroke: '#65a30d' },
      viewModelDefsRoot: { fill: '#be185d', stroke: '#ec4899' },
      globalEnumsRoot: { fill: '#d97706', stroke: '#f59e0b' },
      defaultElementsRoot: { fill: '#374151', stroke: '#9ca3af' },
      
      // Artboard related
      artboard: { fill: '#1e40af', stroke: '#3b82f6' },
      animationsGroup: { fill: '#7c2d92', stroke: '#a855f7' },
      animation: { fill: '#8b5cf6', stroke: '#a78bfa' },
      stateMachinesGroup: { fill: '#166534', stroke: '#22c55e' },
      stateMachine: { fill: '#16a34a', stroke: '#4ade80' },
      viewModelsGroup: { fill: '#be185d', stroke: '#ec4899' },
      viewModel: { fill: '#c2410c', stroke: '#ea580c' },
      nestedViewModel: { fill: '#be185d', stroke: '#ec4899' },
      
      // Inputs and Properties
      inputsGroup: { fill: '#0f766e', stroke: '#14b8a6' },
      input: { fill: '#0d9488', stroke: '#2dd4bf' },
      propertiesGroup: { fill: '#9333ea', stroke: '#a855f7' },
      property: { fill: '#a855f7', stroke: '#c084fc' },
      nestedVMsGroup: { fill: '#7c3aed', stroke: '#8b5cf6' },
      
      // Assets
      asset: { fill: '#65a30d', stroke: '#84cc16' },
      
      // View Model Definitions
      viewModelDefinition: { fill: '#be185d', stroke: '#ec4899' },
      blueprintPropsGroup: { fill: '#c2410c', stroke: '#ea580c' },
      blueprintProperty: { fill: '#ea580c', stroke: '#f97316' },
      instancesGroup: { fill: '#a21caf', stroke: '#c084fc' },
      viewModelInstance: { fill: '#c084fc', stroke: '#ddd6fe' },
      
      // Global Enums
      globalEnum: { fill: '#d97706', stroke: '#f59e0b' },
      enumValue: { fill: '#f59e0b', stroke: '#fbbf24' },
      valuesGroup: { fill: '#ca8a04', stroke: '#eab308' },
      
      // Default Elements
      defaultArtboard: { fill: '#6b7280', stroke: '#9ca3af' },
      defaultStateMachines: { fill: '#6b7280', stroke: '#9ca3af' },
      defaultStateMachine: { fill: '#9ca3af', stroke: '#d1d5db' },
      defaultViewModel: { fill: '#6b7280', stroke: '#9ca3af' },
      defaultSource: { fill: '#6b7280', stroke: '#9ca3af' },
      
      // Generic types (for future extensibility)
      array: { fill: '#4338ca', stroke: '#6366f1' },
      object: { fill: '#059669', stroke: '#10b981' },
      value: { fill: '#dc2626', stroke: '#ef4444' },
      
      // Fallback
      default: { fill: '#6b7280', stroke: '#9ca3af' }
    };
    
    const nodeColors = colors[nodeType] || colors.default;
    
    return {
      ...keyStyle,
      fill: nodeColors.fill,
      lineWidth: 2,
      stroke: nodeColors.stroke,
    };
  }

  render(attributes = this.parsedAttributes, container) {
    super.render(attributes, container);
    this.drawLabelShape(attributes, container);
    this.drawDetailsShape(attributes, container);
    this.drawTypeShape(attributes, container);
    this.drawCollapseShape(attributes, container);
  }
}

// Register the custom node type
window.G6.register(window.G6.ExtensionCategory.NODE, 'rive-tree-node', RiveTreeNode);

export class RiveGraphVisualizer {
  constructor(container, options = {}) {
    this.container = container;
    this.graph = null;
    this.options = {
      includeAssets: true,
      includeEnums: true,
      includeInputs: true,
      darkMode: true,
      ...options
    };
    
    if (typeof window.G6 === 'undefined') {
      throw new Error('G6 library not found. Please ensure G6 is loaded before initializing the visualizer.');
    }
    
    // Initialize asynchronously and handle errors
    this.initPromise = this.init().catch(error => {
      logger.error('Failed to initialize graph visualizer:', error);
      throw error;
    });
  }

  init() {
    this.container.innerHTML = '';
    this.container.style.backgroundColor = '#111827';
    this.container.style.border = '1px solid #374151';
    this.container.style.borderRadius = '8px';
    
    // Ensure container has proper styling
    this.container.style.width = '100%';
    this.container.style.height = '100%';
    this.container.style.position = 'relative';
    this.container.style.display = 'block';
    
    // Wait for container to be properly sized by the layout system
    const waitForDimensions = () => {
      return new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 20; // 2 seconds max wait
        
        const checkDimensions = () => {
          attempts++;
          const containerRect = this.container.getBoundingClientRect();
          const width = containerRect.width || this.container.offsetWidth;
          const height = containerRect.height || this.container.offsetHeight;
          
          logger.debug(`Dimension check attempt ${attempts}:`, { width, height });
          
          if (width >= 100 && height >= 100) {
            resolve({ width, height });
          } else if (attempts >= maxAttempts) {
            // Force minimum dimensions as fallback
            this.container.style.width = '800px';
            this.container.style.height = '600px';
            this.container.style.minWidth = '800px';
            this.container.style.minHeight = '600px';
            
            // Wait a bit for forced dimensions to take effect
            setTimeout(() => {
              const finalRect = this.container.getBoundingClientRect();
              const finalWidth = Math.max(finalRect.width || 800, 800);
              const finalHeight = Math.max(finalRect.height || 600, 600);
              logger.warn('Forced container dimensions:', { width: finalWidth, height: finalHeight });
              resolve({ width: finalWidth, height: finalHeight });
            }, 100);
          } else {
            setTimeout(checkDimensions, 100);
          }
        };
        
        checkDimensions();
      });
    };
    
    // Wait for proper dimensions before creating graph
    return waitForDimensions().then(({ width, height }) => {
      logger.info('Initializing graph with validated dimensions:', { width, height });
      
      // Ensure minimum viable dimensions for WebGL
      const safeWidth = Math.max(width, 400);
      const safeHeight = Math.max(height, 300);
      
      if (safeWidth !== width || safeHeight !== height) {
        logger.warn('Adjusting dimensions for WebGL safety:', { 
          original: { width, height }, 
          adjusted: { width: safeWidth, height: safeHeight } 
        });
      }
      
      try {
        // Create graph exactly like the G6 example
        this.graph = new window.G6.Graph({
          container: this.container,
          width: safeWidth,
          height: safeHeight,
          data: { nodes: [], edges: [] },
          
          node: {
            type: 'rive-tree-node',
            style: {
              size: [200, 60],
              radius: 8,
            },
          },
          
          edge: {
            type: 'cubic-vertical',
            style: {
              stroke: '#666',
              lineWidth: 1.5,
            },
          },
          
          layout: {
            type: 'dagre',
            rankdir: 'TB',
            nodesep: 100,
            ranksep: 120,
          },
          
          behaviors: ['zoom-canvas', 'drag-canvas', 'drag-element'],
        });

        // Set up resize observer to automatically handle container size changes
        if (window.ResizeObserver) {
          this.resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
              const { width, height } = entry.contentRect;
              if (width > 100 && height > 100 && this.graph && this.graph.resize) {
                logger.debug('Container resized, updating graph:', { width, height });
                // Ensure safe dimensions for WebGL
                const safeWidth = Math.max(width, 400);
                const safeHeight = Math.max(height, 300);
                this.graph.resize(safeWidth, safeHeight);
              }
            }
          });
          this.resizeObserver.observe(this.container);
        }

        logger.info('Graph created successfully with tree structure');
        return true;
        
      } catch (error) {
        logger.error('Failed to create G6 graph:', error);
        throw new Error(`Failed to initialize graph: ${error.message}`);
      }
    });
  }

  convertRiveDataToTree(riveData) {
    // Generic recursive function to convert any JSON structure to tree
    const convertToTreeNode = (data, name = 'Root', parentId = '', index = 0) => {
      const nodeId = parentId ? `${parentId}_${index}` : 'root';
      
      // Determine node type and details based on data structure
      let nodeType = 'default';
      let details = '';
      let displayName = name;
      
      if (typeof data === 'object' && data !== null) {
        if (Array.isArray(data)) {
          nodeType = 'array';
          details = `${data.length} item(s)`;
          displayName = `${name} (Array)`;
        } else {
          // Object - determine type from context and properties
          const keys = Object.keys(data);
          nodeType = this.inferNodeType(name, data, parentId);
          
          // Generate meaningful details
          if (keys.length === 0) {
            details = 'Empty object';
          } else if (keys.length <= 3) {
            details = `Properties: ${keys.join(', ')}`;
          } else {
            details = `${keys.length} properties`;
          }
          
          // Add specific details for known structures
          if (data.name) displayName = data.name;
          if (data.instanceName) displayName = data.instanceName;
          if (data.blueprintName) displayName = data.blueprintName;
          
          // Add type/value info to details if available
          const typeInfo = [];
          if (data.type) typeInfo.push(`Type: ${data.type}`);
          if (data.value !== undefined) typeInfo.push(`Value: ${data.value}`);
          if (data.fps) typeInfo.push(`FPS: ${data.fps}`);
          if (data.duration) typeInfo.push(`Duration: ${data.duration}`);
          if (data.cdnUuid) typeInfo.push(`CDN: ${data.cdnUuid || 'None'}`);
          if (data.sourceBlueprintName) typeInfo.push(`Blueprint: ${data.sourceBlueprintName}`);
          if (data.enumTypeName) typeInfo.push(`Enum: ${data.enumTypeName}`);
          
          if (typeInfo.length > 0) {
            details = typeInfo.join(', ');
          }
        }
      } else {
        // Primitive value
        nodeType = 'value';
        details = `${typeof data}: ${data}`;
        displayName = `${name}: ${data}`;
      }
      
      const node = {
        id: nodeId,
        name: displayName,
        nodeType: nodeType,
        details: details,
        children: []
      };
      
      // Recursively process children
      if (typeof data === 'object' && data !== null) {
        if (Array.isArray(data)) {
          // Process array items
          data.forEach((item, itemIndex) => {
            const childNode = convertToTreeNode(item, `Item ${itemIndex + 1}`, nodeId, itemIndex);
            node.children.push(childNode);
          });
        } else {
          // Process object properties
          Object.entries(data).forEach(([key, value], propIndex) => {
            // Skip certain internal properties that aren't useful to display
            if (this.shouldSkipProperty(key, value)) {
              return;
            }
            
            const childNode = convertToTreeNode(value, key, nodeId, propIndex);
            node.children.push(childNode);
          });
        }
      }
      
      return node;
    };
    
    // Start conversion from root
    return convertToTreeNode(riveData, 'Rive File');
  }
  
  // Helper method to infer node type from context
  inferNodeType(name, data, parentId) {
    const nameLower = name.toLowerCase();
    const parentLower = parentId.toLowerCase();
    
    // Root level categories
    if (parentId === 'root') {
      if (nameLower.includes('artboard')) return 'artboardsRoot';
      if (nameLower.includes('asset')) return 'assetsRoot';
      if (nameLower.includes('viewmodel') || nameLower.includes('view_model')) return 'viewModelDefsRoot';
      if (nameLower.includes('enum')) return 'globalEnumsRoot';
      if (nameLower.includes('default')) return 'defaultElementsRoot';
    }
    
    // Artboard related
    if (parentLower.includes('artboard')) {
      if (nameLower.includes('animation')) return 'animationsGroup';
      if (nameLower.includes('statemachine') || nameLower.includes('state_machine')) return 'stateMachinesGroup';
      if (nameLower.includes('viewmodel') || nameLower.includes('view_model')) return 'viewModelsGroup';
      if (data.name && data.animations) return 'artboard';
    }
    
    // Specific item types
    if (data.name && data.fps && data.duration) return 'animation';
    if (data.name && data.inputs && Array.isArray(data.inputs)) return 'stateMachine';
    if (data.instanceName && data.sourceBlueprintName) return 'viewModel';
    if (data.instanceName && data.inputs) return 'nestedViewModel';
    if (data.name && data.cdnUuid !== undefined) return 'asset';
    if (data.blueprintName && data.blueprintProperties) return 'viewModelDefinition';
    if (data._dataEnum || (data.name && data.values)) return 'globalEnum';
    if (data.type && data.name && parentLower.includes('input')) return 'input';
    if (data.type && data.value !== undefined) return 'property';
    
    // Group types
    if (nameLower.includes('input') && Array.isArray(data)) return 'inputsGroup';
    if (nameLower.includes('animation') && Array.isArray(data)) return 'animationsGroup';
    if (nameLower.includes('nested') && Array.isArray(data)) return 'nestedVMsGroup';
    if (nameLower.includes('properties') && Array.isArray(data)) return 'propertiesGroup';
    if (nameLower.includes('values') && Array.isArray(data)) return 'valuesGroup';
    
    // Default based on data structure
    if (Array.isArray(data)) return 'array';
    if (typeof data === 'object' && data !== null) return 'object';
    return 'value';
  }
  
  // Helper method to determine if a property should be skipped
  shouldSkipProperty(key, value) {
    // Skip empty arrays and objects that don't add value
    if (Array.isArray(value) && value.length === 0) return true;
    if (typeof value === 'object' && value !== null && Object.keys(value).length === 0) return true;
    
    // Skip certain technical properties that clutter the view
    const skipKeys = ['__proto__', 'constructor', 'toString'];
    if (skipKeys.includes(key)) return true;
    
    // Skip null or undefined values
    if (value === null || value === undefined) return true;
    
    return false;
  }

  async updateData(riveData) {
    // Wait for initialization to complete
    if (this.initPromise) {
      try {
        await this.initPromise;
      } catch (error) {
        logger.error('Graph initialization failed, cannot update data:', error);
        return;
      }
    }
    
    if (!this.graph || !riveData) return;

    const treeData = this.convertRiveDataToTree(riveData);
    logger.debug('Converted to tree data:', treeData);
    
    // Use G6's treeToGraphData like the example
    const graphData = window.G6.treeToGraphData(treeData, {
      getNodeData: (datum, depth) => {
        if (!datum.style) datum.style = {};
        datum.style.collapsed = depth >= 1; // Auto-collapse artboards and deeper levels
        if (!datum.children) return datum;
        const { children, ...restDatum } = datum;
        return { ...restDatum, children: children.map((child) => child.id) };
      },
    });
    
    try {
      this.graph.setData(graphData);
      logger.info('Tree data loaded successfully');
      
      this.graph.render().then(() => {
        logger.info('Graph rendered successfully');
        setTimeout(() => {
          if (this.graph.fitView) {
            this.graph.fitView();
          }
        }, 100);
      });
      
    } catch (error) {
      logger.error('Error loading tree data:', error);
    }
  }

  // Keep the existing utility methods
  updateOptions(options) {
    this.options = { ...this.options, ...options };
  }

  resize() {
    if (this.graph && this.graph.resize) {
      // Get current container dimensions
      const containerRect = this.container.getBoundingClientRect();
      const width = containerRect.width || this.container.offsetWidth || 800;
      const height = containerRect.height || this.container.offsetHeight || 600;
      
      // Ensure safe dimensions for WebGL
      const safeWidth = Math.max(width, 100);
      const safeHeight = Math.max(height, 100);
      
      logger.debug('Resizing graph to dimensions:', { 
        original: { width, height }, 
        safe: { width: safeWidth, height: safeHeight } 
      });
      
      this.graph.resize(safeWidth, safeHeight);
    }
  }

  fitView() {
    if (this.graph && this.graph.fitView) {
      this.graph.fitView();
    }
  }

  getStatistics() {
    if (!this.graph) return { nodes: 0, edges: 0, combos: 0 };
    
    try {
      const data = this.graph.getData();
      return {
        nodes: data?.nodes?.length || 0,
        edges: data?.edges?.length || 0,
        combos: 0
      };
    } catch (error) {
      logger.warn('Error getting graph statistics:', error);
      return { nodes: 0, edges: 0, combos: 0 };
    }
  }

  getZoom() {
    try {
      return this.graph.getZoom ? this.graph.getZoom() : 1;
    } catch (error) {
      return 1;
    }
  }

  exportImage(format = 'png') {
    if (!this.graph) return null;
    
    try {
      if (this.graph.toDataURL) {
        const dataURL = this.graph.toDataURL('image/' + format);
        const link = document.createElement('a');
        link.download = `rive-graph-${Date.now()}.${format}`;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        logger.info('Export successful using toDataURL');
        return dataURL;
      }
      
      logger.warn('No export methods available');
      return false;
      
    } catch (error) {
      logger.error('Export failed:', error);
      return false;
    }
  }

  destroy() {
    // Clean up resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    
    if (this.graph) {
      this.graph.destroy();
      this.graph = null;
    }
  }
}

export default RiveGraphVisualizer; 