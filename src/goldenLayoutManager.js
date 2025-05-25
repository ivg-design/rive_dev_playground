/**
 * @file goldenLayoutManager.js
 * Manages the Golden Layout configuration and component registration
 */

import { createLogger } from './utils/debugger/debugLogger.js';

// Create a logger for this module
const logger = createLogger('goldenLayout');

let goldenLayout = null;
let jsonEditorInstance = null;

/**
 * Golden Layout configuration for v1.5.9
 */
const layoutConfig = {
    settings: {
        showPopoutIcon: false,
        showMaximiseIcon: true,
        showCloseIcon: false,
        responsiveMode: 'onload',
        tabOverlapAllowance: 0,
        reorderEnabled: true,
        tabControlOffset: 10
    },
    dimensions: {
        borderWidth: 5,
        minItemHeight: 200,
        minItemWidth: 200,
        headerHeight: 30,
        dragProxyWidth: 300,
        dragProxyHeight: 200
    },
    labels: {
        close: 'close',
        maximise: 'maximise',
        minimise: 'minimise',
        popout: 'open in new window',
        popin: 'pop in',
        tabDropdown: 'additional tabs'
    },
    content: [{
        type: 'row',
        content: [{
            type: 'column',
            width: 100,
            content: [{
                type: 'component',
                componentName: 'fileLoader',
                title: 'File Loader',
                height: 15
            }, {
                type: 'component',
                componentName: 'controls',
                title: 'Controls',
                height: 25
            }, {
                type: 'row',
                height: 60,
                content: [{
                    type: 'component',
                    componentName: 'canvas',
                    title: 'Rive Canvas',
                    width: 70
                }, {
                    type: 'stack',
                    width: 30,
                    content: [{
                        type: 'component',
                        componentName: 'dynamicControls',
                        title: 'Dynamic Controls'
                    }, {
                        type: 'component',
                        componentName: 'jsonInspector',
                        title: 'Rive Parser'
                    }]
                }]
            }]
        }]
    }]
};

/**
 * Component factory functions for Golden Layout v1.5.9
 */
const componentFactories = {
    fileLoader: function(container, componentState) {
        try {
            const template = document.getElementById('fileLoaderTemplate');
            if (!template) {
                logger.error('fileLoaderTemplate not found');
                return;
            }
            
            const content = template.cloneNode(true);
            content.style.display = 'block';
            content.id = 'fileLoader';
            
            // Get the DOM element from jQuery wrapper
            const element = container.getElement();
            if (element && element.length > 0) {
                element[0].appendChild(content);
            } else if (element && element.appendChild) {
                element.appendChild(content);
            }
            
            logger.info('File Loader component created');
        } catch (error) {
            logger.error('Error creating fileLoader component:', error);
        }
    },

    controls: function(container, componentState) {
        try {
            const template = document.getElementById('controlsTemplate');
            if (!template) {
                logger.error('controlsTemplate not found');
                return;
            }
            
            const content = template.cloneNode(true);
            content.style.display = 'block';
            content.id = 'controls';
            
            // Get the DOM element from jQuery wrapper
            const element = container.getElement();
            if (element && element.length > 0) {
                element[0].appendChild(content);
            } else if (element && element.appendChild) {
                element.appendChild(content);
            }
            
            logger.info('Controls component created');
        } catch (error) {
            logger.error('Error creating controls component:', error);
        }
    },

    canvas: function(container, componentState) {
        try {
            const template = document.getElementById('canvasTemplate');
            if (!template) {
                logger.error('canvasTemplate not found');
                return;
            }
            
            const content = template.cloneNode(true);
            content.style.display = 'block';
            content.id = 'canvasComponent';
            
            // Get the DOM element from jQuery wrapper
            const element = container.getElement();
            if (element && element.length > 0) {
                element[0].appendChild(content);
            } else if (element && element.appendChild) {
                element.appendChild(content);
            }
            
            // Ensure canvas fills the container
            const canvas = content.querySelector('#rive-canvas');
            if (canvas) {
                canvas.style.width = '100%';
                canvas.style.height = '100%';
            }
            
            logger.info('Canvas component created');
        } catch (error) {
            logger.error('Error creating canvas component:', error);
        }
    },

    dynamicControls: function(container, componentState) {
        try {
            const template = document.getElementById('dynamicControlsTemplate');
            if (!template) {
                logger.error('dynamicControlsTemplate not found');
                return;
            }
            
            const content = template.cloneNode(true);
            content.style.display = 'block';
            content.id = 'dynamicControlsComponent';
            
            // Get the DOM element from jQuery wrapper
            const element = container.getElement();
            if (element && element.length > 0) {
                element[0].appendChild(content);
            } else if (element && element.appendChild) {
                element.appendChild(content);
            }
            
            logger.info('Dynamic Controls component created');
        } catch (error) {
            logger.error('Error creating dynamicControls component:', error);
        }
    },

    jsonInspector: function(container, componentState) {
        try {
            const template = document.getElementById('jsonInspectorTemplate');
            if (!template) {
                logger.error('jsonInspectorTemplate not found');
                return;
            }
            
            const content = template.cloneNode(true);
            content.style.display = 'block';
            content.id = 'jsonInspectorComponent';
            
            // Get the DOM element from jQuery wrapper
            const element = container.getElement();
            if (element && element.length > 0) {
                element[0].appendChild(content);
            } else if (element && element.appendChild) {
                element.appendChild(content);
            }
            
            // Initialize JSONEditor when component is created
            setTimeout(() => {
                const outputElement = content.querySelector('#output');
                if (outputElement) {
                    initializeJSONEditor(outputElement);
                }
            }, 100);
            
            logger.info('JSON Inspector component created');
        } catch (error) {
            logger.error('Error creating jsonInspector component:', error);
        }
    }
};

/**
 * Initialize Golden Layout v1.5.9
 */
export function initializeGoldenLayout() {
    const container = document.getElementById('goldenLayoutContainer');
    if (!container) {
        logger.error('Golden Layout container not found');
        return null;
    }

    // Check if required dependencies are loaded
    if (typeof window.GoldenLayout === 'undefined') {
        logger.error('GoldenLayout not found on window object');
        return null;
    }

    if (typeof $ === 'undefined') {
        logger.error('jQuery not found');
        return null;
    }

    try {
        logger.info('Initializing Golden Layout with config:', layoutConfig);

        // Create Golden Layout instance (v1.5.9 API)
        goldenLayout = new window.GoldenLayout(layoutConfig, $(container));

        // Register component factories (v1.5.9 API)
        goldenLayout.registerComponent('fileLoader', componentFactories.fileLoader);
        goldenLayout.registerComponent('controls', componentFactories.controls);
        goldenLayout.registerComponent('canvas', componentFactories.canvas);
        goldenLayout.registerComponent('dynamicControls', componentFactories.dynamicControls);
        goldenLayout.registerComponent('jsonInspector', componentFactories.jsonInspector);
        
        logger.info('All components registered successfully');

        // Handle resize events
        goldenLayout.on('stateChanged', () => {
            // Trigger canvas resize when layout changes
            setTimeout(() => {
                const canvas = document.getElementById('rive-canvas');
                if (canvas && window.riveInstanceGlobal) {
                    try {
                        window.riveInstanceGlobal.resizeDrawingSurfaceToCanvas();
                    } catch (error) {
                        logger.debug('Canvas resize triggered by layout change');
                    }
                }
            }, 100);
        });

        // Add error handling
        goldenLayout.on('componentCreated', (component) => {
            logger.info('Component created:', component.config.type);
        });

        goldenLayout.on('initialised', () => {
            logger.info('Golden Layout initialized successfully');
        });

        // Initialize the layout
        goldenLayout.init();

        logger.info('Golden Layout v1.5.9 initialization complete');
        return goldenLayout;

    } catch (error) {
        logger.error('Error initializing Golden Layout:', error);
        console.error('Golden Layout error details:', error);
        return null;
    }
}

/**
 * Initialize JSONEditor in the specified container
 */
function initializeJSONEditor(container) {
    if (!container || jsonEditorInstance) {
        return;
    }

    const options = {
        mode: 'tree',
        modes: ['tree', 'view', 'code', 'text', 'preview'],
        search: true,
        enableTransform: false,
        onNodeName: function({path, type, size, value}) {
            if (type === 'object') {
                if (value && typeof value === 'object' && size > 0) {
                    const keys = Object.keys(value);
                    if (keys.length > 0) {
                        const firstKey = keys[0];
                        const firstValue = value[firstKey];
                        if (typeof firstValue === 'string') {
                            const maxLength = 30; 
                            let previewString = firstValue.length > maxLength ? firstValue.substring(0, maxLength) + "..." : firstValue;
                            return `\"${previewString}\"`; 
                        }
                    }
                }
                return undefined; 
            }
            if (type === 'array') {
                return `Array [${size}]`;
            }
            return undefined; 
        },
        onError: function (err) {
            logger.error("JSONEditor Error:", err.toString());
        }
    };

    try {
        jsonEditorInstance = new JSONEditor(container, options, { message: "Please select a Rive file to parse." });
        logger.info('JSONEditor initialized in Golden Layout');
    } catch (error) {
        logger.error('Error initializing JSONEditor:', error);
    }
}

/**
 * Update JSONEditor content
 */
export function updateJSONEditor(data) {
    if (jsonEditorInstance) {
        try {
            jsonEditorInstance.set(data || {});
        } catch (error) {
            logger.error('Error updating JSONEditor:', error);
        }
    }
}

/**
 * Get the current Golden Layout instance
 */
export function getGoldenLayout() {
    return goldenLayout;
}

/**
 * Get the JSONEditor instance
 */
export function getJSONEditor() {
    return jsonEditorInstance;
}

/**
 * Destroy Golden Layout
 */
export function destroyGoldenLayout() {
    if (goldenLayout) {
        try {
            goldenLayout.destroy();
            goldenLayout = null;
            jsonEditorInstance = null;
            logger.info('Golden Layout destroyed');
        } catch (error) {
            logger.error('Error destroying Golden Layout:', error);
        }
    }
} 