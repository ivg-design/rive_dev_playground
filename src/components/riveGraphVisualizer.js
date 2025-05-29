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
      artboard: { fill: '#1e3a8a', stroke: '#3b82f6' },
      animation: { fill: '#7c2d92', stroke: '#a855f7' },
      stateMachine: { fill: '#166534', stroke: '#22c55e' },
      state: { fill: '#ea580c', stroke: '#f97316' },
      viewModel: { fill: '#be185d', stroke: '#ec4899' },
      assetsRoot: { fill: '#365314', stroke: '#65a30d' },
      asset: { fill: '#365314', stroke: '#65a30d' },
      enumsRoot: { fill: '#d97706', stroke: '#f59e0b' },
      enum: { fill: '#d97706', stroke: '#f59e0b' },
      default: { fill: '#374151', stroke: '#9ca3af' }
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
    
    this.init();
  }

  init() {
    this.container.innerHTML = '';
    this.container.style.backgroundColor = '#111827';
    this.container.style.border = '1px solid #374151';
    this.container.style.borderRadius = '8px';
    
    // Get container dimensions
    const containerRect = this.container.getBoundingClientRect();
    const width = containerRect.width || this.container.offsetWidth || 800;
    const height = containerRect.height || this.container.offsetHeight || 600;
    
    logger.info('Initializing graph with dimensions:', { width, height });
    
    // Validate dimensions to prevent WebGL framebuffer errors
    if (width < 10 || height < 10) {
      logger.error('Container dimensions too small for WebGL context:', { width, height });
      throw new Error(`Container dimensions too small: ${width}x${height}. Minimum required: 10x10`);
    }
    
    // Ensure minimum viable dimensions for WebGL
    const safeWidth = Math.max(width, 100);
    const safeHeight = Math.max(height, 100);
    
    if (safeWidth !== width || safeHeight !== height) {
      logger.warn('Adjusting dimensions for WebGL safety:', { 
        original: { width, height }, 
        adjusted: { width: safeWidth, height: safeHeight } 
      });
    }
    
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
          if (width > 10 && height > 10 && this.graph && this.graph.resize) {
            logger.debug('Container resized, updating graph:', { width, height });
            // Ensure safe dimensions for WebGL
            const safeWidth = Math.max(width, 100);
            const safeHeight = Math.max(height, 100);
            this.graph.resize(safeWidth, safeHeight);
          }
        }
      });
      this.resizeObserver.observe(this.container);
    }

    logger.info('Graph created with tree structure');
  }

  convertRiveDataToTree(riveData) {
    // Convert to hierarchical tree structure like the G6 example
    const treeData = {
      id: 'root',
      name: 'Rive File',
      nodeType: 'root',
      details: 'Root',
      children: []
    };

    // Add artboards as top-level children
    if (riveData.artboards && riveData.artboards.length > 0) {
      riveData.artboards.forEach((artboard, index) => {
        const artboardNode = {
          id: `artboard_${index}`,
          name: artboard.name || `Artboard ${index + 1}`,
          nodeType: 'artboard',
          details: `${(artboard.animations?.length || 0) + (artboard.stateMachines?.length || 0)} components`,
          children: []
        };

        // Add animations
        if (artboard.animations && artboard.animations.length > 0) {
          artboard.animations.forEach((animation, animIndex) => {
            artboardNode.children.push({
              id: `animation_${index}_${animIndex}`,
              name: animation.name || `Animation ${animIndex + 1}`,
              nodeType: 'animation',
              details: animation.duration ? `${animation.duration}s` : 'Timeline'
            });
          });
        }

        // Add state machines
        if (artboard.stateMachines && artboard.stateMachines.length > 0) {
          artboard.stateMachines.forEach((sm, smIndex) => {
            const smNode = {
              id: `sm_${index}_${smIndex}`,
              name: sm.name || `State Machine ${smIndex + 1}`,
              nodeType: 'stateMachine',
              details: `${sm.states?.length || 0} states`,
              children: []
            };

            // Add states
            if (sm.states && sm.states.length > 0) {
              sm.states.forEach((state, stateIndex) => {
                smNode.children.push({
                  id: `state_${index}_${smIndex}_${stateIndex}`,
                  name: state.name || `State ${stateIndex + 1}`,
                  nodeType: 'state',
                  details: 'State'
                });
              });
            }

            artboardNode.children.push(smNode);
          });
        }

        treeData.children.push(artboardNode);
      });
    }

    // Add assets if enabled
    if (this.options.includeAssets && riveData.assets && riveData.assets.length > 0) {
      const assetsNode = {
        id: 'assets_root',
        name: 'Assets',
        nodeType: 'assetsRoot',
        details: 'Asset Library',
        children: riveData.assets.map((asset, index) => ({
          id: `asset_${index}`,
          name: asset.name || `Asset ${index + 1}`,
          nodeType: 'asset',
          details: asset.type || 'Asset'
        }))
      };
      treeData.children.push(assetsNode);
    }

    // Add enums if enabled
    if (this.options.includeEnums && riveData.enums && riveData.enums.length > 0) {
      const enumsNode = {
        id: 'enums_root',
        name: 'Enums',
        nodeType: 'enumsRoot',
        details: 'Enumerations',
        children: riveData.enums.map((enumItem, index) => ({
          id: `enum_${index}`,
          name: enumItem.name || `Enum ${index + 1}`,
          nodeType: 'enum',
          details: 'Enum'
        }))
      };
      treeData.children.push(enumsNode);
    }

    return treeData;
  }

  updateData(riveData) {
    if (!this.graph || !riveData) return;

    const treeData = this.convertRiveDataToTree(riveData);
    logger.debug('Converted to tree data:', treeData);
    
    // Use G6's treeToGraphData like the example
    const graphData = window.G6.treeToGraphData(treeData, {
      getNodeData: (datum, depth) => {
        if (!datum.style) datum.style = {};
        datum.style.collapsed = depth >= 2; // Auto-collapse deep levels
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