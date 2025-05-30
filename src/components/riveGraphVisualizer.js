// Rive Graph Visualizer using G6 - Following G6 best practices
// Simplified and robust initialization to prevent timing issues

import { createLogger } from '../utils/debugger/debugLogger.js';
const logger = createLogger('riveGraphVisualizer');

// Custom TreeNode class following G6 patterns
class RiveTreeNode extends window.G6.Rect {
  get data() {
    try {
      return this.context.model.getNodeLikeDatum(this.id);
    } catch (error) {
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
      return [];
    }
  }

  getSize(attributes) {
    const data = this.data;
    const isExpanded = attributes.expanded || false;
    
    if (isExpanded) {
      // Larger size for expanded nodes
      return [320, 160];
    } else {
      // Dynamic sizing based on content
      const hasChildren = this.childrenData.length > 0;
      const baseWidth = 240;
      const baseHeight = hasChildren ? 80 : 60;
      
      // Adjust width based on text length
      const textLength = (data?.name || '').length;
      const extraWidth = Math.min(textLength * 2, 80);
      
      return [baseWidth + extraWidth, baseHeight];
    }
  }

  getLabelStyle(attributes) {
    const [width, height] = this.getSize(attributes);
    const data = this.data;
    const isExpanded = attributes.expanded || false;
    
    return {
      x: -width / 2 + 12,
      y: isExpanded ? -height / 2 + 16 : -height / 2 + 20,
      text: data?.name || 'Unknown',
      fontSize: isExpanded ? 14 : 12,
      fontWeight: isExpanded ? 'bold' : 'normal',
      opacity: 0.95,
      fill: '#fff',
      cursor: 'pointer',
      maxWidth: width - 60,
      wordWrap: true,
      wordWrapWidth: width - 60,
    };
  }

  drawLabelShape(attributes, container) {
    const labelStyle = this.getLabelStyle(attributes);
    this.upsert('label', window.G6.Label, labelStyle, container);
  }

  getDetailsStyle(attributes) {
    const [width, height] = this.getSize(attributes);
    const data = this.data;
    const isExpanded = attributes.expanded || false;
    
    if (isExpanded) {
      // In expanded mode, show comprehensive details
    return {
        x: -width / 2 + 12,
        y: -height / 2 + 40,
        text: this.getExpandedDetails(data),
      fontSize: 10,
        fill: '#e5e7eb',
        opacity: 0.9,
        maxWidth: width - 24,
        wordWrap: true,
        wordWrapWidth: width - 24,
      };
    } else {
      // In compact mode, show brief details
      return {
        x: -width / 2 + 12,
        y: height / 2 - 20,
        text: this.getCompactDetails(data),
        fontSize: 10,
        fill: '#d1d5db',
        opacity: 0.8,
        maxWidth: width - 60,
        wordWrap: true,
        wordWrapWidth: width - 60,
      };
    }
  }

  drawDetailsShape(attributes, container) {
    const detailsStyle = this.getDetailsStyle(attributes);
    this.upsert('details', window.G6.Label, detailsStyle, container);
  }

  getTypeIndicatorStyle(attributes) {
    const [width, height] = this.getSize(attributes);
    const data = this.data;
    const nodeType = data?.nodeType || 'default';
    
    return {
      x: width / 2 - 16,
      y: -height / 2 + 16,
      text: this.getTypeIcon(nodeType),
      fontSize: 12,
      fill: '#fff',
      opacity: 0.8,
      textAlign: 'center',
    };
  }

  drawTypeIndicatorShape(attributes, container) {
    const typeStyle = this.getTypeIndicatorStyle(attributes);
    this.upsert('typeIndicator', window.G6.Label, typeStyle, container);
  }

  getChildCountStyle(attributes) {
    const [width, height] = this.getSize(attributes);
    const childCount = this.childrenData.length;
    
    if (childCount === 0) return false;
    
    return {
      x: width / 2 - 32,
      y: height / 2 - 16,
      text: `${childCount}`,
      fontSize: 9,
      fill: '#6b7280',
      opacity: 0.8,
      textAlign: 'center',
      backgroundFill: '#374151',
      backgroundStroke: '#6b7280',
      backgroundLineWidth: 1,
      backgroundRadius: 8,
      backgroundWidth: 16,
      backgroundHeight: 14,
    };
  }

  drawChildCountShape(attributes, container) {
    const countStyle = this.getChildCountStyle(attributes);
    if (!countStyle) return;
    this.upsert('childCount', window.G6.Badge, countStyle, container);
  }

  getCollapseStyle(attributes) {
    if (this.childrenData.length === 0) return false;
    const { collapsed } = attributes;
    const [width, height] = this.getSize(attributes);
    return {
      backgroundFill: '#4b5563',
      backgroundHeight: 18,
      backgroundLineWidth: 1,
      backgroundRadius: 9,
      backgroundStroke: '#9ca3af',
      backgroundWidth: 18,
      cursor: 'pointer',
      fill: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
      text: collapsed ? '+' : '−',
      textAlign: 'center',
      textBaseline: 'middle',
      x: width / 2 - 8,
      y: 0,
    };
  }

  drawCollapseShape(attributes, container) {
    const collapseStyle = this.getCollapseStyle(attributes);
    if (!collapseStyle) return;
    
    const btn = this.upsert('collapse', window.G6.Badge, collapseStyle, container);

    if (btn && !Reflect.has(btn, '__bind__')) {
      Reflect.set(btn, '__bind__', true);
      btn.addEventListener(window.G6.CommonEvent.CLICK, (e) => {
        if (e && typeof e.stopPropagation === 'function') {
          e.stopPropagation(); // Prevent node click event
        }
        
        const { collapsed } = this.attributes;
        const graph = this.context.graph;
        
        if (collapsed) {
          graph.expandElement(this.id);
          setTimeout(() => {
            if (graph && graph.layout) {
              try {
              graph.layout({ preset: { type: 'dagre', rankdir: 'TB', nodesep: 100, ranksep: 120 } });
              } catch (error) {
                logger.debug('Layout application after expand failed:', error);
              }
            }
          }, 100);
        } else {
          graph.collapseElement(this.id);
        }
      });
    }
  }

  getExpandButtonStyle(attributes) {
    const [width, height] = this.getSize(attributes);
    const isExpanded = attributes.expanded || false;
    
    return {
      backgroundFill: '#3b82f6',
      backgroundHeight: 16,
      backgroundLineWidth: 1,
      backgroundRadius: 8,
      backgroundStroke: '#60a5fa',
      backgroundWidth: 16,
      cursor: 'pointer',
      fill: '#fff',
      fontSize: 10,
      fontWeight: 'bold',
      text: isExpanded ? '−' : '+',
      textAlign: 'center',
      textBaseline: 'middle',
      x: -width / 2 + 8,
      y: height / 2 - 8,
    };
  }

  drawExpandButtonShape(attributes, container) {
    const expandStyle = this.getExpandButtonStyle(attributes);
    const btn = this.upsert('expandBtn', window.G6.Badge, expandStyle, container);

    if (btn && !Reflect.has(btn, '__expandBind__')) {
      Reflect.set(btn, '__expandBind__', true);
      btn.addEventListener(window.G6.CommonEvent.CLICK, (e) => {
        if (e && typeof e.stopPropagation === 'function') {
          e.stopPropagation(); // Prevent node click event
        }
        this.toggleExpanded();
      });
    }
  }

  toggleExpanded() {
    const graph = this.context.graph;
    const currentExpanded = this.attributes.expanded || false;
    
    try {
      let allNodes = [];
      
      if (graph.getData && typeof graph.getData === 'function') {
        const graphData = graph.getData();
        allNodes = graphData.nodes || [];
      } else if (graph.getNodes && typeof graph.getNodes === 'function') {
        allNodes = graph.getNodes().map(node => node.getModel());
      } else if (graph.getAllNodesData && typeof graph.getAllNodesData === 'function') {
        allNodes = graph.getAllNodesData();
      } else {
        logger.warn('No compatible method found to get nodes data');
        allNodes = [];
      }
      
      allNodes.forEach(nodeData => {
        if (nodeData.id !== this.id && nodeData.expanded) {
          try {
            if (graph.updateNodeData && typeof graph.updateNodeData === 'function') {
              graph.updateNodeData(nodeData.id, { ...nodeData, expanded: false });
            } else if (graph.updateItem && typeof graph.updateItem === 'function') {
              graph.updateItem(nodeData.id, { ...nodeData, expanded: false });
            }
          } catch (error) {
            logger.debug('Failed to update node data for collapse:', error);
          }
        }
      });
      
      try {
        const currentData = this.context.model.getNodeLikeDatum(this.id);
        const newData = { ...currentData, expanded: !currentExpanded };
        
        if (graph.updateNodeData && typeof graph.updateNodeData === 'function') {
          graph.updateNodeData(this.id, newData);
        } else if (graph.updateItem && typeof graph.updateItem === 'function') {
          graph.updateItem(this.id, newData);
        }
      } catch (error) {
        logger.debug('Failed to update node data for expand:', error);
      }
      
      if (graph.render && typeof graph.render === 'function') {
        graph.render();
      }
    } catch (error) {
      logger.error('Error in toggleExpanded:', error);
    }
  }

  getCompactDetails(data) {
    const details = [];
    
    if (data.type) details.push(`Type: ${data.type}`);
    if (data.value !== undefined && data.value !== null) {
      const valueStr = String(data.value);
      details.push(`Value: ${valueStr.length > 20 ? valueStr.substring(0, 20) + '...' : valueStr}`);
    }
    if (data.fps) details.push(`${data.fps} FPS`);
    if (data.duration) details.push(`${data.duration}s`);
    if (data.instanceName && data.sourceBlueprintName) {
      details.push(`Blueprint: ${data.sourceBlueprintName}`);
    }
    if (data.cdnUuid !== undefined) {
      details.push(data.cdnUuid ? 'Has CDN' : 'No CDN');
    }
    
    return details.length > 0 ? details.join(' • ') : 'No details available';
  }

  getExpandedDetails(data) {
    const sections = [];
    
    // Basic Information
    if (data.type || data.value !== undefined || data.instanceName) {
      const basic = [];
      if (data.type) basic.push(`Type: ${data.type}`);
      if (data.instanceName) basic.push(`Instance: ${data.instanceName}`);
      if (data.sourceBlueprintName) basic.push(`Blueprint: ${data.sourceBlueprintName}`);
      if (data.value !== undefined && data.value !== null) {
        basic.push(`Value: ${String(data.value)}`);
      }
      if (basic.length > 0) sections.push(`📋 ${basic.join(' • ')}`);
    }
    
    // Animation/Timeline Information
    if (data.fps || data.duration || data.workStart !== undefined) {
      const anim = [];
      if (data.fps) anim.push(`${data.fps} FPS`);
      if (data.duration) anim.push(`${data.duration}s duration`);
      if (data.workStart !== undefined && data.workStart !== 4294967295) {
        anim.push(`Work: ${data.workStart}-${data.workEnd || 'end'}`);
      }
      if (anim.length > 0) sections.push(`🎬 ${anim.join(' • ')}`);
    }
    
    // Asset Information
    if (data.cdnUuid !== undefined || data.name) {
      const asset = [];
      if (data.name && data.cdnUuid !== undefined) {
        asset.push(`Asset: ${data.name}`);
        asset.push(data.cdnUuid ? 'Has CDN' : 'Local only');
      }
      if (asset.length > 0) sections.push(`📦 ${asset.join(' • ')}`);
    }
    
    // Enum Information
    if (data.enumTypeName || data.values) {
      const enums = [];
      if (data.enumTypeName) enums.push(`Enum: ${data.enumTypeName}`);
      if (data.values && Array.isArray(data.values)) {
        enums.push(`Values: ${data.values.slice(0, 3).join(', ')}${data.values.length > 3 ? '...' : ''}`);
      }
      if (enums.length > 0) sections.push(`🏷️ ${enums.join(' • ')}`);
    }
    
    // Count Information
    const counts = [];
    if (data.inputs && Array.isArray(data.inputs)) counts.push(`${data.inputs.length} inputs`);
    if (data.animations && Array.isArray(data.animations)) counts.push(`${data.animations.length} animations`);
    if (data.stateMachines && Array.isArray(data.stateMachines)) counts.push(`${data.stateMachines.length} state machines`);
    if (data.viewModels && Array.isArray(data.viewModels)) counts.push(`${data.viewModels.length} view models`);
    if (data.nestedViewModels && Array.isArray(data.nestedViewModels)) counts.push(`${data.nestedViewModels.length} nested VMs`);
    if (counts.length > 0) sections.push(`📊 ${counts.join(' • ')}`);
    
    return sections.length > 0 ? sections.join('\n\n') : 'No detailed information available';
  }

  getTypeIcon(nodeType) {
    const icons = {
      root: '🗂️',
      artboard: '🎨',
      animation: '🎬',
      stateMachine: '⚙️',
      viewModel: '📋',
      viewModelDefinition: '📐',
      asset: '📦',
      property: '🏷️',
      input: '📥',
      trigger: '⚡',
      enumProperty: '🔗',
      booleanProperty: '☑️',
      numberProperty: '🔢',
      stringProperty: '📝',
      colorProperty: '🎨',
      globalEnum: '📚',
      artboardsCollection: '🎨',
      assetsCollection: '📦',
      enumsCollection: '📚',
      viewModelDefinitionsCollection: '📐',
      animationsCollection: '🎬',
      stateMachinesCollection: '⚙️',
      viewModelsCollection: '📋',
      inputsCollection: '📥',
      nestedViewModelsCollection: '🔗',
      defaultElements: '⚙️',
      blueprintProperties: '🛠️',
      instanceNames: '🏷️',
      enumValues: '📋',
      array: '📚',
      object: '📄',
      value: '💎',
      default: '📝'
    };
    return icons[nodeType] || icons.default;
  }

  getKeyStyle(attributes) {
    const keyStyle = super.getKeyStyle(attributes);
    const data = this.data;
    const nodeType = data?.nodeType || 'default';
    const isExpanded = attributes.expanded || false;
    
    const colors = {
      root: { fill: '#1f2937', stroke: '#6b7280', shadow: '#111827' },
      artboard: { fill: '#1e40af', stroke: '#3b82f6', shadow: '#1e3a8a' },
      animation: { fill: '#7c3aed', stroke: '#a855f7', shadow: '#6b21a8' },
      stateMachine: { fill: '#059669', stroke: '#10b981', shadow: '#047857' },
      viewModel: { fill: '#dc2626', stroke: '#ef4444', shadow: '#b91c1c' },
      viewModelDefinition: { fill: '#b91c1c', stroke: '#dc2626', shadow: '#991b1b' },
      asset: { fill: '#65a30d', stroke: '#84cc16', shadow: '#4d7c0f' },
      property: { fill: '#a855f7', stroke: '#c084fc', shadow: '#9333ea' },
      input: { fill: '#0d9488', stroke: '#14b8a6', shadow: '#0f766e' },
      trigger: { fill: '#f59e0b', stroke: '#fbbf24', shadow: '#d97706' },
      enumProperty: { fill: '#8b5cf6', stroke: '#a78bfa', shadow: '#7c3aed' },
      booleanProperty: { fill: '#10b981', stroke: '#34d399', shadow: '#059669' },
      numberProperty: { fill: '#3b82f6', stroke: '#60a5fa', shadow: '#2563eb' },
      stringProperty: { fill: '#f97316', stroke: '#fb923c', shadow: '#ea580c' },
      colorProperty: { fill: '#ec4899', stroke: '#f472b6', shadow: '#db2777' },
      globalEnum: { fill: '#6366f1', stroke: '#818cf8', shadow: '#5b21b6' },
      artboardsCollection: { fill: '#374151', stroke: '#6b7280', shadow: '#1f2937' },
      assetsCollection: { fill: '#4d7c0f', stroke: '#65a30d', shadow: '#365314' },
      enumsCollection: { fill: '#5b21b6', stroke: '#7c3aed', shadow: '#4c1d95' },
      viewModelDefinitionsCollection: { fill: '#991b1b', stroke: '#b91c1c', shadow: '#7f1d1d' },
      animationsCollection: { fill: '#6b21a8', stroke: '#8b5cf6', shadow: '#581c87' },
      stateMachinesCollection: { fill: '#047857', stroke: '#059669', shadow: '#064e3b' },
      viewModelsCollection: { fill: '#b91c1c', stroke: '#dc2626', shadow: '#991b1b' },
      inputsCollection: { fill: '#0f766e', stroke: '#0d9488', shadow: '#134e4a' },
      nestedViewModelsCollection: { fill: '#9f1239', stroke: '#be185d', shadow: '#831843' },
      defaultElements: { fill: '#475569', stroke: '#64748b', shadow: '#334155' },
      blueprintProperties: { fill: '#7e22ce', stroke: '#a855f7', shadow: '#6b21a8' },
      instanceNames: { fill: '#be123c', stroke: '#e11d48', shadow: '#9f1239' },
      enumValues: { fill: '#5b21b6', stroke: '#7c3aed', shadow: '#4c1d95' },
      array: { fill: '#4338ca', stroke: '#6366f1', shadow: '#3730a3' },
      object: { fill: '#059669', stroke: '#10b981', shadow: '#047857' },
      value: { fill: '#dc2626', stroke: '#ef4444', shadow: '#b91c1c' },
      default: { fill: '#6b7280', stroke: '#9ca3af', shadow: '#4b5563' }
    };
    
    const nodeColors = colors[nodeType] || colors.default;
    
    return {
      ...keyStyle,
      fill: nodeColors.fill,
      lineWidth: isExpanded ? 3 : 2,
      stroke: nodeColors.stroke,
      shadowColor: nodeColors.shadow,
      shadowBlur: isExpanded ? 8 : 4,
      shadowOffsetX: 2,
      shadowOffsetY: 2,
      radius: isExpanded ? 12 : 8,
      opacity: isExpanded ? 1 : 0.9,
    };
  }

  render(attributes = this.parsedAttributes, container) {
    super.render(attributes, container);
    this.drawLabelShape(attributes, container);
    this.drawDetailsShape(attributes, container);
    this.drawTypeIndicatorShape(attributes, container);
    this.drawChildCountShape(attributes, container);
    this.drawCollapseShape(attributes, container);
    this.drawExpandButtonShape(attributes, container);
  }
}

// Register the custom node type only once
if (typeof window.G6 !== 'undefined' && !window.G6._riveTreeNodeRegistered) {
window.G6.register(window.G6.ExtensionCategory.NODE, 'rive-tree-node', RiveTreeNode);
  window.G6._riveTreeNodeRegistered = true;
  logger.debug('Registered rive-tree-node component');
}

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
    
    // Validate G6 availability
    if (typeof window.G6 === 'undefined') {
      throw new Error('G6 library not found. Please ensure G6 is loaded before initializing the visualizer.');
    }
    
    // Debug: Log G6 version and available methods for compatibility troubleshooting
    try {
      logger.info('G6 version info:', {
        version: window.G6.version || 'unknown',
        hasTreeToGraphData: typeof window.G6.treeToGraphData === 'function',
        hasGraph: typeof window.G6.Graph === 'function',
        hasCommonEvent: !!window.G6.CommonEvent,
        extensionCategory: !!window.G6.ExtensionCategory
      });
      
      // Test create a temporary graph to check available methods
      if (typeof window.G6.Graph === 'function') {
        const tempDiv = document.createElement('div');
        tempDiv.style.width = '1px';
        tempDiv.style.height = '1px';
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        document.body.appendChild(tempDiv);
        
        try {
          const tempGraph = new window.G6.Graph({
            container: tempDiv,
            width: 100,
            height: 100
          });
          
          logger.debug('Available graph methods:', {
            hasGetAllNodesData: typeof tempGraph.getAllNodesData === 'function',
            hasGetData: typeof tempGraph.getData === 'function',
            hasGetNodes: typeof tempGraph.getNodes === 'function',
            hasUpdateNodeData: typeof tempGraph.updateNodeData === 'function',
            hasUpdateItem: typeof tempGraph.updateItem === 'function',
            hasSetData: typeof tempGraph.setData === 'function',
            hasRender: typeof tempGraph.render === 'function',
            hasPaint: typeof tempGraph.paint === 'function'
          });
          
          tempGraph.destroy();
        } catch (tempError) {
          logger.debug('Could not create temporary graph for API testing:', tempError.message);
        }
        
        document.body.removeChild(tempDiv);
      }
    } catch (error) {
      logger.warn('Error during G6 API diagnostics:', error);
    }
    
    // Don't initialize immediately - wait for explicit call
    this.isReady = false;
  }

  // Synchronous initialization that validates container first
  async initialize() {
    if (this.isReady) {
      logger.debug('Graph visualizer already initialized');
      return true;
    }

    logger.info('Initializing RiveGraphVisualizer...');
    
    // Validate container exists and has proper dimensions
    if (!this.container) {
      throw new Error('Container element is required');
    }

    // Wait for container to have proper dimensions
    const dimensions = await this.waitForValidDimensions();
    if (!dimensions) {
      throw new Error('Container dimensions validation failed');
    }

    logger.info('Container validated with dimensions:', dimensions);

    // Setup container styling
    this.setupContainer();

    // Create G6 graph with validated dimensions
    this.createGraph(dimensions);

    // Setup resize handling
    this.setupResizeHandling();

    this.isReady = true;
    logger.info('RiveGraphVisualizer initialized successfully');
    return true;
  }

  // Wait for container to have valid dimensions with timeout
  waitForValidDimensions() {
      return new Promise((resolve, reject) => {
        let attempts = 0;
      const maxAttempts = 30; // 3 seconds max
        
        const checkDimensions = () => {
          attempts++;
          
        const rect = this.container.getBoundingClientRect();
        const width = rect.width || this.container.offsetWidth;
        const height = rect.height || this.container.offsetHeight;
          
        logger.debug(`Dimension check ${attempts}/${maxAttempts}: ${width}x${height}`);
        
        // Require minimum viable dimensions for WebGL
        if (width >= 300 && height >= 200) {
            resolve({ width, height });
          return;
        }
        
        if (attempts >= maxAttempts) {
          logger.error('Container dimension validation timeout. Final dimensions:', { width, height });
          reject(new Error(`Container dimensions too small after ${maxAttempts} attempts: ${width}x${height}`));
          return;
        }
        
        setTimeout(checkDimensions, 100);
        };
        
        checkDimensions();
      });
  }

  setupContainer() {
    // Ensure container has proper styling
    this.container.style.width = '100%';
    this.container.style.height = '100%';
    this.container.style.position = 'relative';
    this.container.style.display = 'block';
    this.container.style.backgroundColor = '#111827';
    this.container.style.border = '1px solid #374151';
    this.container.style.borderRadius = '8px';
    this.container.innerHTML = ''; // Clear any existing content
  }

  createGraph(dimensions) {
    const { width, height } = dimensions;
    
    // Ensure safe dimensions for WebGL context
      const safeWidth = Math.max(width, 400);
      const safeHeight = Math.max(height, 300);
      
    logger.info('Creating G6 graph with dimensions:', { width: safeWidth, height: safeHeight });
    
    try {
      // Create graph following G6 best practices
        this.graph = new window.G6.Graph({
          container: this.container,
          width: safeWidth,
          height: safeHeight,
          data: { nodes: [], edges: [] },
          
          node: {
            type: 'rive-tree-node',
            style: {
            size: [240, 60], // Default size, will be overridden by getSize()
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
          nodesep: 120,
          ranksep: 140,
          },
          
          behaviors: ['zoom-canvas', 'drag-canvas', 'drag-element'],
        });

      // Add click outside to collapse functionality
      this.setupClickOutsideCollapse();

      logger.info('G6 graph created successfully');
      
    } catch (error) {
      logger.error('Failed to create G6 graph:', error);
      throw new Error(`Graph creation failed: ${error.message}`);
    }
  }

  setupClickOutsideCollapse() {
    // Add event listener to canvas for click outside nodes
    this.graph.on('canvas:click', () => {
      this.collapseAllExpandedNodes();
    });
    
    // Prevent canvas click when clicking on nodes
    this.graph.on('node:click', (event) => {
      if (event && typeof event.stopPropagation === 'function') {
        event.stopPropagation();
      }
      // Don't do anything here - let individual node components handle their own clicks
    });
  }

  collapseAllExpandedNodes() {
    try {
      let allNodes = [];
      
      if (this.graph.getData && typeof this.graph.getData === 'function') {
        const graphData = this.graph.getData();
        allNodes = graphData.nodes || [];
      } else if (this.graph.getNodes && typeof this.graph.getNodes === 'function') {
        allNodes = this.graph.getNodes().map(node => node.getModel());
      } else if (this.graph.getAllNodesData && typeof this.graph.getAllNodesData === 'function') {
        allNodes = this.graph.getAllNodesData();
      } else {
        logger.warn('No compatible method found to get nodes data for collapse');
        return;
      }
      
      let hasExpandedNodes = false;
      
      allNodes.forEach(nodeData => {
        if (nodeData.expanded) {
          try {
            if (this.graph.updateNodeData && typeof this.graph.updateNodeData === 'function') {
              this.graph.updateNodeData(nodeData.id, { ...nodeData, expanded: false });
            } else if (this.graph.updateItem && typeof this.graph.updateItem === 'function') {
              this.graph.updateItem(nodeData.id, { ...nodeData, expanded: false });
            }
            hasExpandedNodes = true;
          } catch (error) {
            logger.debug('Failed to collapse node:', nodeData.id, error);
          }
        }
      });
      
      if (hasExpandedNodes) {
        if (this.graph.render && typeof this.graph.render === 'function') {
          this.graph.render();
        }
        logger.debug('Collapsed all expanded nodes on outside click');
      }
    } catch (error) {
      logger.error('Error in collapseAllExpandedNodes:', error);
    }
  }

  setupResizeHandling() {
    if (!window.ResizeObserver) {
      logger.warn('ResizeObserver not available, manual resize required');
      return;
    }

          this.resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
              const { width, height } = entry.contentRect;
        
        // Only resize if dimensions are reasonable
        if (width >= 100 && height >= 100 && this.graph) {
                logger.debug('Container resized, updating graph:', { width, height });
          
                const safeWidth = Math.max(width, 400);
                const safeHeight = Math.max(height, 300);
          
          if (this.graph.resize) {
                this.graph.resize(safeWidth, safeHeight);
          }
              }
            }
          });
    
          this.resizeObserver.observe(this.container);
    logger.debug('Resize observer setup complete');
  }

  // Simplified node type inference
  inferNodeType(name, data) {
    const nameLower = name.toLowerCase();
    
    // Specific data structure patterns from Rive parsed data
    if (data.name && data.fps && data.duration) return 'animation';
    if (data.name && data.inputs && Array.isArray(data.inputs)) return 'stateMachine';
    if (data.instanceName && data.sourceBlueprintName) return 'viewModel';
    if (data.blueprintName && data.blueprintProperties) return 'viewModelDefinition';
    if (data.name && data.cdnUuid !== undefined) return 'asset';
    if (data._dataEnum && data._dataEnum.values) return 'globalEnum';
    if (data.type && data.value !== undefined) return 'property';
    if (data.type && data.name) return 'input';
    if (data.type === 'trigger') return 'trigger';
    if (data.type === 'enumType') return 'enumProperty';
    if (data.type === 'boolean') return 'booleanProperty';
    if (data.type === 'number') return 'numberProperty';
    if (data.type === 'string') return 'stringProperty';
    if (data.type === 'color') return 'colorProperty';
    
    // Root level structure identification
    if (nameLower === 'rive file' || nameLower === 'root') return 'root';
    if (nameLower === 'artboards' && Array.isArray(data)) return 'artboardsCollection';
    if (nameLower === 'assets' && Array.isArray(data)) return 'assetsCollection';
    if (nameLower === 'globalenums' && Array.isArray(data)) return 'enumsCollection';
    if (nameLower === 'allviewmodeldefinitionsandinstances' && Array.isArray(data)) return 'viewModelDefinitionsCollection';
    if (nameLower === 'defaultelements') return 'defaultElements';
    
    // Artboard content identification
    if (nameLower === 'animations' && Array.isArray(data)) return 'animationsCollection';
    if (nameLower === 'statemachines' && Array.isArray(data)) return 'stateMachinesCollection';
    if (nameLower === 'viewmodels' && Array.isArray(data)) return 'viewModelsCollection';
    if (nameLower === 'inputs' && Array.isArray(data)) return 'inputsCollection';
    if (nameLower === 'nestedviewmodels' && Array.isArray(data)) return 'nestedViewModelsCollection';
    
    // Content within structures
    if (data.name && data.animations && data.stateMachines) return 'artboard';
    if (data.enumTypeName) return 'enumProperty';
    if (data.values && Array.isArray(data.values)) return 'enumValues';
    
    // View Model Definition specific
    if (data.blueprintProperties && Array.isArray(data.blueprintProperties)) return 'blueprintProperties';
    if (data.instanceNamesFromDefinition && Array.isArray(data.instanceNamesFromDefinition)) return 'instanceNames';
    
    // Name-based inference (fallback)
    if (nameLower.includes('artboard')) return 'artboard';
    if (nameLower.includes('animation')) return 'animation';
    if (nameLower.includes('statemachine')) return 'stateMachine';
    if (nameLower.includes('viewmodel')) return 'viewModel';
    if (nameLower.includes('asset')) return 'asset';
    if (nameLower.includes('enum')) return 'globalEnum';
    if (nameLower.includes('input')) return 'input';
    if (nameLower.includes('property') || nameLower.includes('properties')) return 'property';
    
    // Fallback based on data structure
    if (Array.isArray(data)) return 'array';
    if (typeof data === 'object' && data !== null) return 'object';
    return 'value';
  }

  // Enhanced data conversion focused on Rive structure
  convertRiveDataToTree(riveData) {
    logger.debug('Converting Rive data to tree structure');
    
    const convertNode = (data, name = 'Root', parentId = '', index = 0, depth = 0) => {
      const nodeId = parentId ? `${parentId}_${index}` : 'root';
      
      let nodeType = this.inferNodeType(name, data);
      let details = '';
      let displayName = name;
      
      if (typeof data === 'object' && data !== null) {
        if (Array.isArray(data)) {
          details = `${data.length} items`;
          displayName = `${name} (${data.length})`;
        } else {
          // Enhanced display name extraction
          if (data.name) {
            displayName = data.name;
          } else if (data.instanceName) {
            displayName = data.instanceName;
          } else if (data.blueprintName) {
            displayName = data.blueprintName;
          } else if (data._dataEnum && data._dataEnum.name) {
            displayName = data._dataEnum.name;
          }
          
          // Enhanced details extraction based on node type
          details = this.extractNodeDetails(data, nodeType);
        }
      } else {
        nodeType = 'value';
        details = `${typeof data}: ${data}`;
        displayName = `${name}: ${data}`;
      }
      
      const node = {
        id: nodeId,
        name: displayName,
        nodeType: nodeType,
        details: details,
        children: [],
        // Store original data for expanded view
        originalData: data
      };
      
      // Process children with depth limit for performance
      if (typeof data === 'object' && data !== null && depth < 10) {
        if (Array.isArray(data)) {
          data.forEach((item, itemIndex) => {
            if (this.shouldIncludeChild(item, depth)) {
              const childNode = convertNode(item, `Item ${itemIndex + 1}`, nodeId, itemIndex, depth + 1);
            node.children.push(childNode);
            }
          });
        } else {
          // Prioritize important properties first
          const sortedEntries = this.prioritizeProperties(Object.entries(data));
          
          sortedEntries.forEach(([key, value], propIndex) => {
            if (this.shouldIncludeProperty(key, value, depth)) {
              const childNode = convertNode(value, key, nodeId, propIndex, depth + 1);
            node.children.push(childNode);
            }
          });
        }
      }
      
      return node;
    };
    
    const result = convertNode(riveData, 'Rive File');
    logger.debug('Tree conversion complete, nodes:', this.countNodes(result));
    return result;
  }

  extractNodeDetails(data, nodeType) {
    const details = [];
    
    switch (nodeType) {
      case 'animation':
        if (data.fps) details.push(`${data.fps} FPS`);
        if (data.duration) details.push(`${data.duration}s`);
        if (data.workStart !== undefined && data.workStart !== 4294967295) {
          details.push(`Work: ${data.workStart}-${data.workEnd || 'end'}`);
        }
        break;
        
      case 'stateMachine':
        if (data.inputs) details.push(`${data.inputs.length} inputs`);
        break;
        
      case 'viewModel':
        if (data.sourceBlueprintName) details.push(`Blueprint: ${data.sourceBlueprintName}`);
        if (data.inputs) details.push(`${data.inputs.length} inputs`);
        if (data.nestedViewModels) details.push(`${data.nestedViewModels.length} nested VMs`);
        break;
        
      case 'viewModelDefinition':
        if (data.blueprintProperties) details.push(`${data.blueprintProperties.length} properties`);
        if (data.instanceCountFromDefinition) details.push(`${data.instanceCountFromDefinition} instances`);
        break;
        
      case 'asset':
        if (data.cdnUuid !== undefined) {
          details.push(data.cdnUuid ? 'Has CDN' : 'Local only');
        }
        break;
        
      case 'globalEnum':
        if (data._dataEnum && data._dataEnum.values) {
          details.push(`${data._dataEnum.values.length} values`);
        }
        break;
        
      case 'artboard':
        const counts = [];
        if (data.animations) counts.push(`${data.animations.length} animations`);
        if (data.stateMachines) counts.push(`${data.stateMachines.length} state machines`);
        if (data.viewModels) counts.push(`${data.viewModels.length} view models`);
        details.push(...counts);
        break;
        
      case 'enumProperty':
      case 'booleanProperty':
      case 'numberProperty':
      case 'stringProperty':
      case 'colorProperty':
        if (data.type) details.push(`Type: ${data.type}`);
        if (data.value !== undefined && data.value !== null) {
          const valueStr = String(data.value);
          details.push(`Value: ${valueStr.length > 15 ? valueStr.substring(0, 15) + '...' : valueStr}`);
        }
        if (data.enumTypeName) details.push(`Enum: ${data.enumTypeName}`);
        break;
        
      case 'trigger':
        details.push('Trigger input');
        break;
        
      default:
        // Generic details extraction
        if (data.type) details.push(`Type: ${data.type}`);
        if (data.value !== undefined && data.value !== null) {
          const valueStr = String(data.value);
          details.push(`Value: ${valueStr.length > 20 ? valueStr.substring(0, 20) + '...' : valueStr}`);
        }
        
        // Count children for collections
        if (Array.isArray(data)) {
          details.push(`${data.length} items`);
        } else if (typeof data === 'object') {
          const keys = Object.keys(data);
          if (keys.length > 0) {
            details.push(`${keys.length} properties`);
          }
        }
        break;
    }
    
    return details.length > 0 ? details.join(' • ') : 'No details available';
  }

  prioritizeProperties(entries) {
    // Define property priority order for better organization
    const priorityOrder = [
      'name', 'instanceName', 'sourceBlueprintName', 'blueprintName',
      'type', 'value', 'enumTypeName',
      'animations', 'stateMachines', 'viewModels', 'inputs', 'nestedViewModels',
      'blueprintProperties', 'instanceNamesFromDefinition',
      'fps', 'duration', 'workStart', 'workEnd',
      'cdnUuid', 'values', '_dataEnum',
      'artboardName', 'stateMachineNames', 'viewModelName', 'src'
    ];
    
    return entries.sort(([keyA], [keyB]) => {
      const indexA = priorityOrder.indexOf(keyA);
      const indexB = priorityOrder.indexOf(keyB);
      
      // If both keys are in priority list, sort by their order
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      
      // If only one key is in priority list, prioritize it
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      
      // If neither is in priority list, sort alphabetically
      return keyA.localeCompare(keyB);
    });
  }

  // Enhanced filtering with depth awareness
  shouldIncludeProperty(key, value, depth = 0) {
    // Skip null/undefined values
    if (value === null || value === undefined) return false;
    
    // Skip empty arrays and objects at deeper levels
    if (depth > 3) {
      if (Array.isArray(value) && value.length === 0) return false;
      if (typeof value === 'object' && value !== null && Object.keys(value).length === 0) return false;
    }
    
    // Skip technical properties
    const skipKeys = ['__proto__', 'constructor', 'parsedInstances'];
    if (skipKeys.includes(key)) return false;
    
    // Limit depth for very nested structures
    if (depth > 6) return false;
    
    return true;
  }

  shouldIncludeChild(item, depth = 0) {
    if (item === null || item === undefined) return false;
    
    // Limit depth for performance
    if (depth > 6) return false;
    
    return true;
  }

  // Helper to count total nodes for logging
  countNodes(node) {
    let count = 1;
    if (node.children) {
      count += node.children.reduce((sum, child) => sum + this.countNodes(child), 0);
    }
    return count;
  }

  // Main method to load data into the graph
  async loadData(riveData) {
    if (!this.isReady) {
      await this.initialize();
    }

    if (!this.graph || !riveData) {
      logger.warn('Cannot load data: graph not ready or no data provided');
      return;
    }

    logger.info('Loading data into graph...');
    
    try {
      // Convert data to tree structure
    const treeData = this.convertRiveDataToTree(riveData);
      
      // Fix: Convert to G6 graph data with better error handling
      let graphData;
      try {
        if (window.G6.treeToGraphData && typeof window.G6.treeToGraphData === 'function') {
          graphData = window.G6.treeToGraphData(treeData, {
      getNodeData: (datum, depth) => {
              // Auto-collapse deeper levels to keep view manageable
        if (!datum.style) datum.style = {};
              datum.style.collapsed = depth >= 1;
              
        if (!datum.children) return datum;
        const { children, ...restDatum } = datum;
        return { ...restDatum, children: children.map((child) => child.id) };
      },
    });
        } else {
          // Fallback: create graph data manually if treeToGraphData is not available
          logger.warn('G6.treeToGraphData not available, creating graph data manually');
          graphData = this.convertTreeToGraphDataManually(treeData);
        }
      } catch (treeError) {
        logger.warn('Error using G6.treeToGraphData, falling back to manual conversion:', treeError);
        graphData = this.convertTreeToGraphDataManually(treeData);
      }
      
      // Load data into graph
      if (this.graph.setData && typeof this.graph.setData === 'function') {
      this.graph.setData(graphData);
      } else if (this.graph.data && typeof this.graph.data === 'function') {
        this.graph.data(graphData);
      }
      
      // Render with error handling
      try {
        if (this.graph.render && typeof this.graph.render === 'function') {
          await this.graph.render();
        }
      } catch (renderError) {
        logger.error('Error during graph render:', renderError);
        // Try alternative rendering method
        if (this.graph.paint && typeof this.graph.paint === 'function') {
          this.graph.paint();
        }
      }
      
      logger.info('Graph data loaded and rendered successfully');
      
      // Fit view after a brief delay to ensure rendering is complete
        setTimeout(() => {
        if (this.graph && this.graph.fitView) {
            this.graph.fitView();
          logger.debug('Graph fitted to view');
          }
      }, 200);
      
    } catch (error) {
      logger.error('Failed to load data into graph:', error);
      throw error;
    }
  }

  // Fallback method to manually convert tree data to graph data
  convertTreeToGraphDataManually(treeData) {
    const nodes = [];
    const edges = [];
    
    const processNode = (node, parentId = null) => {
      // Add the node
      nodes.push({
        id: node.id,
        data: {
          name: node.name,
          nodeType: node.nodeType,
          details: node.details,
          originalData: node.originalData
        }
      });
      
      // Add edge from parent if exists
      if (parentId) {
        edges.push({
          id: `${parentId}-${node.id}`,
          source: parentId,
          target: node.id
        });
      }
      
      // Process children recursively
      if (node.children && Array.isArray(node.children)) {
        node.children.forEach(child => {
          processNode(child, node.id);
        });
      }
    };
    
    processNode(treeData);
    
    return { nodes, edges };
  }

  // Public methods for external use
  fitView() {
    if (this.graph && this.graph.fitView) {
      this.graph.fitView();
    }
  }

  resize() {
    if (!this.graph || !this.graph.resize) return;
    
    const rect = this.container.getBoundingClientRect();
    const width = Math.max(rect.width || 400, 400);
    const height = Math.max(rect.height || 300, 300);
    
    logger.debug('Manual resize to:', { width, height });
    this.graph.resize(width, height);
  }

  getStatistics() {
    if (!this.graph) return { nodes: 0, edges: 0 };
    
    try {
      const data = this.graph.getData();
      return {
        nodes: data?.nodes?.length || 0,
        edges: data?.edges?.length || 0,
        combos: 0
      };
    } catch (error) {
      logger.warn('Error getting statistics:', error);
      return { nodes: 0, edges: 0 };
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
        logger.info('Graph exported successfully');
        return dataURL;
      }
      return null;
    } catch (error) {
      logger.error('Export failed:', error);
      return null;
    }
  }

  destroy() {
    logger.info('Destroying RiveGraphVisualizer...');
    
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    
    if (this.graph) {
      this.graph.destroy();
      this.graph = null;
    }
    
    this.isReady = false;
    logger.info('RiveGraphVisualizer destroyed');
  }
}

export default RiveGraphVisualizer; 