/**
 * @file riveInstanceFormatter.js
 * Enhanced Object Formatting Service for Rive Animation Engine
 * 
 * This module provides enhanced object formatting and analysis capabilities
 * that integrate with the main debug control system.
 * 
 * Key Services:
 * - Enhanced object formatting with Rive detection
 * - Deep asset map exploration with closure access attempts
 * - View model and state machine input discovery
 * - Manual search tools for hard-to-find data
 */

// Centralized styles configuration
const FORMATTER_STYLES = {
    container: 'font-family: monospace; font-size: 12px; padding: 8px; background: #1a202c; border-radius: 6px; margin: 4px 0; color: #e2e8f0;',
    sectionContainer: 'margin: 8px 0; border: 1px solid #4a5568; border-radius: 6px; background: #2d3748; overflow: hidden;',
    sectionHeader: 'padding: 10px 14px; background: #4a5568; font-weight: bold; color: #e2e8f0; font-size: 12px; cursor: pointer; border-bottom: 1px solid #2d3748;',
    sectionContent: 'padding: 12px 14px; background: #2d3748; color: #e2e8f0;',
    
    dataRow: 'display: flex; border-bottom: 1px solid #4a5568; padding: 2px 0; align-items: center;',
    dataLabel: 'flex: 0 0 35%; padding: 2px 4px; font-weight: bold; color: #a0aec0; font-size: 10px;',
    dataValue: 'flex: 1; padding: 2px 4px; font-family: monospace; font-size: 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;',
    
    valueNull: '#718096',
    valueBoolean: '#68d391',
    valueBooleanFalse: '#fc8181',
    valueNumber: '#63b3ed',
    valueString: '#f6ad55',
    valueDefault: '#e2e8f0',
    
    error: 'color: #fc8181; font-family: monospace; padding: 4px;',
    italic: 'color: #718096; font-style: italic;',
    bold: 'font-weight: bold; color: #e2e8f0;'
};

// Core utility functions
const FormatterUtils = {
    safeGet(obj, path, defaultValue = null) {
        try {
            const keys = path.split('.');
            let current = obj;
            for (const key of keys) {
                if (current == null) return defaultValue;
                current = current[key];
            }
            return current !== undefined ? current : defaultValue;
        } catch (error) {
            return defaultValue;
        }
    },

    formatValue(value) {
        try {
            if (value === null) return 'null';
            if (value === undefined) return 'undefined';
            if (typeof value === 'boolean') return value.toString();
            if (typeof value === 'number') {
                if (isNaN(value)) return 'NaN';
                if (!isFinite(value)) return value > 0 ? 'Infinity' : '-Infinity';
                return value.toString();
            }
            if (typeof value === 'string') {
                const truncated = value.length > 60 ? value.substring(0, 60) + '...' : value;
                return `"${truncated}"`;
            }
            if (typeof value === 'function') return 'function()';
            if (Array.isArray(value)) {
                try {
                    return `Array(${value.length})`;
                } catch (error) {
                    return 'Array(?)';
                }
            }
            if (typeof value === 'object') {
                try {
                    const constructor = value.constructor?.name || 'Object';
                    return constructor;
                } catch (error) {
                    return 'Object';
                }
            }
            return String(value);
        } catch (error) {
            return '[Format Error]';
        }
    },

    getValueColor(value) {
        if (value === null || value === undefined) return FORMATTER_STYLES.valueNull;
        if (typeof value === 'boolean') return value ? FORMATTER_STYLES.valueBoolean : FORMATTER_STYLES.valueBooleanFalse;
        if (typeof value === 'number') return FORMATTER_STYLES.valueNumber;
        if (typeof value === 'string') return FORMATTER_STYLES.valueString;
        return FORMATTER_STYLES.valueDefault;
    },

    isRiveInstance(obj) {
        if (!obj || typeof obj !== 'object') return false;
        
        const riveIndicators = ['canvas', 'loaded', 'destroyed', 'artboard', 'animator', 'readyForPlaying'];
        const foundProperties = riveIndicators.filter(prop => prop in obj);
        const hasMinimumProperties = foundProperties.length >= 4;
        const riveMethods = ['play', 'pause', 'stop', 'cleanup'];
        const hasRiveMethods = riveMethods.some(method => typeof obj[method] === 'function');
        const hasRiveConstructor = obj.constructor?.name === 'Rive';
        
        return hasMinimumProperties && (hasRiveMethods || hasRiveConstructor);
    },

    formatTiming(ms) {
        if (ms === null || ms === undefined || typeof ms !== 'number' || isNaN(ms)) {
            return 'N/A';
        }
        if (ms < 1) return `${(ms * 1000).toFixed(2)}μs`;
        if (ms < 1000) return `${ms.toFixed(2)}ms`;
        return `${(ms / 1000).toFixed(2)}s`;
    }
};

// Enhanced Asset Detection Service
const AssetDetectionService = {
    // Try multiple approaches to find asset maps
    findAssetMap(obj) {
        // Method 1: Direct paths
        const directPaths = [
            'assetloader.scopes.0.assetMap',
            'assetLoader.scopes.0.assetMap', 
            '_assetMap',
            'assetMap',
            'file.assetMap',
            'runtime.assetMap'
        ];

        for (const path of directPaths) {
            const assetMap = FormatterUtils.safeGet(obj, path);
            if (assetMap instanceof Map && this.looksLikeAssetMap(assetMap)) {
                return assetMap;
            }
        }

        // Method 2: Deep search
        const deepAssetMap = this.deepSearchForAssetMap(obj);
        if (deepAssetMap instanceof Map) {
            return deepAssetMap;
        }

        return null;
    },

    // Deep search through object hierarchy for asset maps
    deepSearchForAssetMap(obj, depth = 0, maxDepth = 3, visited = new WeakSet()) {
        if (depth > maxDepth || !obj || typeof obj !== 'object' || visited.has(obj)) {
            return null;
        }

        visited.add(obj);

        if (obj instanceof Map && this.looksLikeAssetMap(obj)) {
            return obj;
        }

        try {
            const keys = Object.getOwnPropertyNames(obj);
            for (const key of keys) {
                if (key.includes('asset') || key.includes('Asset') || key.includes('map') || key.includes('Map')) {
                    try {
                        const value = obj[key];
                        if (value instanceof Map && this.looksLikeAssetMap(value)) {
                            return value;
                        } else if (value && typeof value === 'object') {
                            const nestedMap = this.deepSearchForAssetMap(value, depth + 1, maxDepth, visited);
                            if (nestedMap) {
                                return nestedMap;
                            }
                        }
                    } catch (error) {
                        // Skip inaccessible properties
                    }
                }
            }
        } catch (error) {
            // Skip if we can't enumerate properties
        }

        return null;
    },

    // Check if a Map looks like an asset map
    looksLikeAssetMap(map) {
        if (!(map instanceof Map) || map.size === 0) {
            return false;
        }

        let assetLikeEntries = 0;
        let totalChecked = 0;
        const maxCheck = Math.min(5, map.size);

        for (const [key, value] of map.entries()) {
            if (totalChecked >= maxCheck) break;
            
            totalChecked++;
            
            if (value && typeof value === 'object') {
                const hasAssetProps = ['fileExtension', 'isImage', 'isFont', 'isAudio', 'uniqueFilename', 'name'].some(prop => prop in value);
                if (hasAssetProps) {
                    assetLikeEntries++;
                }
            }
        }

        return assetLikeEntries > totalChecked / 2;
    },

    // Extract asset information from asset map
    extractAssets(assetMap) {
        const assets = {
            images: [],
            fonts: [],
            audio: [],
            others: []
        };

        if (!(assetMap instanceof Map)) {
            return assets;
        }

        assetMap.forEach((assetWrapper, assetName) => {
            const assetInfo = {
                name: assetName,
                fileExtension: FormatterUtils.safeGet(assetWrapper, 'fileExtension', 'unknown'),
                uniqueFilename: FormatterUtils.safeGet(assetWrapper, 'uniqueFilename', ''),
                cdnUuid: FormatterUtils.safeGet(assetWrapper, 'cdnUuid', ''),
                hasNativeAsset: !!FormatterUtils.safeGet(assetWrapper, '_nativeFileAsset'),
                isImage: FormatterUtils.safeGet(assetWrapper, 'isImage', false),
                isFont: FormatterUtils.safeGet(assetWrapper, 'isFont', false),
                isAudio: FormatterUtils.safeGet(assetWrapper, 'isAudio', false),
                wrapper: assetWrapper
            };

            if (assetInfo.isImage) {
                assets.images.push(assetInfo);
            } else if (assetInfo.isFont) {
                assets.fonts.push(assetInfo);
            } else if (assetInfo.isAudio) {
                assets.audio.push(assetInfo);
            } else {
                assets.others.push(assetInfo);
            }
        });

        return assets;
    }
};

// Enhanced Input Discovery Service
const InputDiscoveryService = {
    // Discover all types of inputs from a Rive instance
    discoverAllInputs(riveInstance) {
        const discovered = {
            viewModelInputs: [],
            stateMachineInputs: [],
            totalCount: 0
        };

        // Discover view model inputs
        discovered.viewModelInputs = this.discoverViewModelInputs(riveInstance);
        
        // Discover state machine inputs
        discovered.stateMachineInputs = this.discoverStateMachineInputs(riveInstance);
        
        discovered.totalCount = discovered.viewModelInputs.length + discovered.stateMachineInputs.length;
        
        return discovered;
    },

    // Discover view model inputs using multiple paths
    discoverViewModelInputs(rive) {
        const inputs = [];
        
        const vmPaths = [
            '_viewmodelInstance._viewmodelInstances',
            '_viewmodelInstance.viewmodelInstances', 
            'viewmodelInstance._viewmodelInstances',
            'viewModel._viewmodelInstances',
            '_viewModel._instances'
        ];
        
        for (const path of vmPaths) {
            const vmInstances = FormatterUtils.safeGet(rive, path);
            if (vmInstances) {
                let instanceArray = [];
                if (Array.isArray(vmInstances)) {
                    instanceArray = vmInstances;
                } else if (typeof vmInstances === 'object') {
                    instanceArray = Object.values(vmInstances);
                }
                
                instanceArray.forEach((vmInstance, index) => {
                    const vmInputs = this.extractViewModelInputs(vmInstance, index);
                    inputs.push(...vmInputs);
                });
                
                if (inputs.length > 0) break;
            }
        }
        
        return inputs;
    },

    // Extract inputs from a view model instance
    extractViewModelInputs(vmInstance, index = 0) {
        const inputs = [];
        
        if (!vmInstance || typeof vmInstance !== 'object') return inputs;
        
        const inputProperties = ['triggers', 'booleans', 'numbers', 'enums', 'inputs', '_inputs'];
        
        inputProperties.forEach(prop => {
            const inputData = FormatterUtils.safeGet(vmInstance, prop);
            if (inputData) {
                if (Array.isArray(inputData)) {
                    inputData.forEach((input, inputIndex) => {
                        inputs.push({
                            type: prop,
                            name: input.name || `${prop}_${inputIndex}`,
                            input: input,
                            vmIndex: index,
                            source: 'viewModel'
                        });
                    });
                } else if (typeof inputData === 'object') {
                    Object.entries(inputData).forEach(([key, input]) => {
                        inputs.push({
                            type: prop,
                            name: key,
                            input: input,
                            vmIndex: index,
                            source: 'viewModel'
                        });
                    });
                }
            }
        });
        
        // Check direct properties that might be inputs
        try {
            const keys = Object.keys(vmInstance);
            keys.forEach(key => {
                const value = vmInstance[key];
                if (value && typeof value === 'object') {
                    if (typeof value.trigger === 'function' || 
                        typeof value.fire === 'function' || 
                        'value' in value) {
                        inputs.push({
                            type: 'detected',
                            name: key,
                            input: value,
                            vmIndex: index,
                            source: 'viewModel'
                        });
                    }
                }
            });
        } catch (error) {
            // Silent error handling
        }
        
        return inputs;
    },

    // Discover state machine inputs
    discoverStateMachineInputs(rive) {
        const inputs = [];
        
        const animator = FormatterUtils.safeGet(rive, 'animator');
        const stateMachines = FormatterUtils.safeGet(animator, 'stateMachines', []);
        
        if (Array.isArray(stateMachines)) {
            stateMachines.forEach((sm, smIndex) => {
                const smInputs = this.extractStateMachineInputs(sm, smIndex);
                inputs.push(...smInputs);
            });
        }
        
        const stateMachine = FormatterUtils.safeGet(animator, 'stateMachine');
        if (stateMachine) {
            const smInputs = this.extractStateMachineInputs(stateMachine, 0);
            inputs.push(...smInputs);
        }
        
        return inputs;
    },

    // Extract inputs from a state machine
    extractStateMachineInputs(stateMachine, smIndex = 0) {
        const inputs = [];
        
        if (!stateMachine || typeof stateMachine !== 'object') return inputs;
        
        const inputTypes = ['inputs', '_inputs', 'triggers', 'booleans', 'numbers'];
        
        inputTypes.forEach(inputType => {
            const inputArray = FormatterUtils.safeGet(stateMachine, inputType, []);
            if (Array.isArray(inputArray)) {
                inputArray.forEach((input, inputIndex) => {
                    inputs.push({
                        type: inputType,
                        name: input.name || `sm_${inputType}_${inputIndex}`,
                        input: input,
                        smIndex: smIndex,
                        source: 'stateMachine'
                    });
                });
            }
        });
        
        return inputs;
    }
};

// Main Object Formatter
const RiveObjectFormatter = {
    // Format any object with enhanced Rive detection
    formatObject(obj) {
        console.group('%c🔍 Enhanced Object Inspector', 'color: #4CAF50; font-weight: bold; font-size: 14px; background: #1a1a1a; padding: 4px 8px; border-radius: 4px;');
        
        try {
            const objectType = this.getObjectType(obj);
            console.log(`%cObject Type: ${objectType}`, 'color: #64b5f6; font-size: 12px;');
            
            if (FormatterUtils.isRiveInstance(obj)) {
                this.formatRiveInstance(obj);
            } else {
                this.formatGenericObject(obj);
            }
            
        } catch (error) {
            console.error('Error formatting object:', error);
        }
        
        console.groupEnd();
    },

    getObjectType(obj) {
        if (obj === null) return 'null';
        if (obj === undefined) return 'undefined';
        if (Array.isArray(obj)) return 'Array';
        if (FormatterUtils.isRiveInstance(obj)) return 'Rive Instance';
        if (typeof obj === 'object') return obj.constructor?.name || 'Object';
        return typeof obj;
    },

    formatRiveInstance(obj) {
        console.log('%c🎯 Rive Instance Detected', 'color: #4ecdc4; font-weight: bold;');
        
        this.logSection('🎯 Core Instance', this.getRiveCore(obj));
        this.logSection('⚙️ Runtime Components', this.getRiveRuntime(obj));
        this.logSection('🎬 Animations & State Machines', this.getRiveAnimations(obj));
        this.logSection('📊 Performance Metrics', this.getRivePerformance(obj));
        this.logSection('📡 Event Management', this.getRiveEvents(obj));
        this.logSection('🖼️ Layout & Rendering', this.getRiveLayout(obj));
        this.logSection('🔗 View Models & Data', this.getRiveViewModels(obj));
        this.logSection('📦 Asset Management', this.getRiveAssets(obj));
        this.logSection('🎨 Asset Explorer', this.getRiveAssetExplorer(obj));
        this.logSection('🛠️ Methods & API', this.getRiveMethods(obj));
        this.logSection('🐛 Debug Information', this.getRiveDebug(obj));
        
        console.log('%c' + '─'.repeat(60), 'color: #4a5568;');
        this.logSection('🔍 Full Object Explorer', this.getObjectExplorer(obj));
    },

    formatGenericObject(obj) {
        console.log('%c📦 Generic Object Analysis', 'color: #f6ad55; font-weight: bold;');
        
        this.logSection('ℹ️ Object Information', this.getObjectInfo(obj));
        this.logSection('🔍 Object Explorer', this.getObjectExplorer(obj));
    },

    logSection(title, data, collapsed = true) {
        const groupMethod = collapsed ? 'groupCollapsed' : 'group';
        console[groupMethod](`%c${title}`, 'color: #ffb74d; font-weight: bold; font-size: 13px;');
        
        if (Array.isArray(data)) {
            data.forEach(item => {
                if (typeof item === 'object' && item.label && item.value !== undefined) {
                    const valueColor = FormatterUtils.getValueColor(item.value);
                    console.log(`%c${item.label}:%c ${FormatterUtils.formatValue(item.value)}`, 
                               'color: #90a4ae; font-weight: bold;', 
                               `color: ${valueColor};`);
                } else {
                    console.log(item);
                }
            });
        } else if (typeof data === 'object') {
            Object.entries(data).forEach(([key, value]) => {
                const valueColor = FormatterUtils.getValueColor(value);
                console.log(`%c${key}:%c ${FormatterUtils.formatValue(value)}`, 
                           'color: #90a4ae; font-weight: bold;', 
                           `color: ${valueColor};`);
            });
        } else {
            console.log(data);
        }
        
        console.groupEnd();
    },

    // Rive-specific data extractors (simplified versions)
    getRiveCore(obj) {
        return [
            { label: 'Loaded', value: FormatterUtils.safeGet(obj, 'loaded', false) },
            { label: 'Destroyed', value: FormatterUtils.safeGet(obj, 'destroyed', false) },
            { label: 'Ready for Playing', value: FormatterUtils.safeGet(obj, 'readyForPlaying', false) },
            { label: 'Source URL', value: FormatterUtils.safeGet(obj, 'src', 'N/A') },
            { label: 'Has Buffer', value: !!FormatterUtils.safeGet(obj, 'buffer') },
            { label: 'Canvas Element', value: FormatterUtils.safeGet(obj, 'canvas.tagName', 'N/A') }
        ];
    },

    getRiveRuntime(obj) {
        const artboard = FormatterUtils.safeGet(obj, 'artboard');
        return [
            { label: 'Runtime Available', value: !!FormatterUtils.safeGet(obj, 'runtime') },
            { label: 'Renderer Available', value: !!FormatterUtils.safeGet(obj, 'renderer') },
            { label: 'Artboard Available', value: !!artboard },
            { label: 'Artboard Name', value: FormatterUtils.safeGet(artboard, 'name', 'N/A') },
            { label: 'Animation Count', value: FormatterUtils.safeGet(artboard, 'animationCount', 'N/A') },
            { label: 'State Machine Count', value: FormatterUtils.safeGet(artboard, 'stateMachineCount', 'N/A') }
        ];
    },

    getRiveAnimations(obj) {
        const animator = FormatterUtils.safeGet(obj, 'animator');
        const animations = FormatterUtils.safeGet(animator, 'animations', []);
        const stateMachines = FormatterUtils.safeGet(animator, 'stateMachines', []);

        return [
            { label: 'Total Animations', value: animations.length },
            { label: 'Total State Machines', value: stateMachines.length },
            { label: 'Is Playing', value: FormatterUtils.safeGet(animator, 'isPlaying', false) },
            { label: 'Is Paused', value: FormatterUtils.safeGet(animator, 'isPaused', false) },
            { label: 'Is Stopped', value: FormatterUtils.safeGet(animator, 'isStopped', true) }
        ];
    },

    getRivePerformance(obj) {
        const durations = FormatterUtils.safeGet(obj, 'durations', []);
        const frameCount = FormatterUtils.safeGet(obj, 'frameCount', 0);
        const fps = FormatterUtils.safeGet(obj, 'fps', 0);

        const validDurations = Array.isArray(durations) ? durations.filter(d => typeof d === 'number' && !isNaN(d)) : [];
        const avgDuration = validDurations.length > 0 ? validDurations.reduce((a, b) => a + b, 0) / validDurations.length : 0;

        return [
            { label: 'Current FPS', value: typeof fps === 'number' ? fps.toFixed(2) : 'N/A' },
            { label: 'Frame Count', value: frameCount },
            { label: 'Avg Frame Duration', value: FormatterUtils.formatTiming(avgDuration) },
            { label: 'Duration Samples', value: validDurations.length }
        ];
    },

    getRiveEvents(obj) {
        const eventManager = FormatterUtils.safeGet(obj, 'eventManager');
        const listeners = FormatterUtils.safeGet(eventManager, 'listeners', []);

        return [
            { label: 'Event Manager Available', value: !!eventManager },
            { label: 'Active Listeners', value: listeners.length },
            { label: 'Should Disable Listeners', value: FormatterUtils.safeGet(obj, 'shouldDisableRiveListeners', false) }
        ];
    },

    getRiveLayout(obj) {
        const layout = FormatterUtils.safeGet(obj, '_layout');
        
        return [
            { label: 'Layout Available', value: !!layout },
            { label: 'Fit Mode', value: FormatterUtils.safeGet(layout, 'fit', 'N/A') },
            { label: 'Alignment', value: FormatterUtils.safeGet(layout, 'alignment', 'N/A') },
            { label: 'Layout Scale Factor', value: FormatterUtils.safeGet(layout, 'layoutScaleFactor', 1) }
        ];
    },

    getRiveViewModels(obj) {
        const discovered = InputDiscoveryService.discoverViewModelInputs(obj);
        return [
            { label: 'View Model Instance', value: !!FormatterUtils.safeGet(obj, '_viewmodelInstance') },
            { label: 'View Model Inputs Found', value: discovered.length },
            { label: 'View Model Count', value: FormatterUtils.safeGet(obj, 'viewModelCount', 0) }
        ];
    },

    getRiveAssets(obj) {
        const assetMap = AssetDetectionService.findAssetMap(obj);
        
        return [
            { label: 'Asset Loader Available', value: !!FormatterUtils.safeGet(obj, 'assetloader') },
            { label: 'Asset Map Found', value: !!(assetMap instanceof Map) },
            { label: 'Total Assets', value: assetMap instanceof Map ? assetMap.size : 0 },
            { label: 'CDN Enabled', value: FormatterUtils.safeGet(obj, 'enableRiveAssetCDN', true) }
        ];
    },

    getRiveAssetExplorer(obj) {
        const assetMap = AssetDetectionService.findAssetMap(obj);
        const assets = AssetDetectionService.extractAssets(assetMap);

        const data = [
            { label: 'Asset Map Found', value: !!(assetMap instanceof Map) },
            { label: 'Images Found', value: assets.images.length },
            { label: 'Fonts Found', value: assets.fonts.length },
            { label: 'Audio Found', value: assets.audio.length },
            { label: 'Other Assets Found', value: assets.others.length }
        ];

        if (assets.images.length > 0) data.push({ label: 'Image Assets', value: assets.images });
        if (assets.fonts.length > 0) data.push({ label: 'Font Assets', value: assets.fonts });
        if (assets.audio.length > 0) data.push({ label: 'Audio Assets', value: assets.audio });
        if (assets.others.length > 0) data.push({ label: 'Other Assets', value: assets.others });

        return data;
    },

    getRiveMethods(obj) {
        const methods = ['play', 'pause', 'stop', 'reset', 'load', 'cleanup', 'resizeToCanvas', 'on', 'off', 'fire'];
        const availableMethods = methods.filter(method => typeof obj[method] === 'function');

        return [
            { label: 'Available Methods', value: `${availableMethods.length}/${methods.length}` },
            { label: 'Method Names', value: availableMethods.join(', ') }
        ];
    },

    getRiveDebug(obj) {
        return [
            { label: 'Constructor Name', value: obj.constructor?.name || 'Unknown' },
            { label: 'Object Keys Count', value: Object.keys(obj).length },
            { label: 'Object Type', value: typeof obj }
        ];
    },

    // Generic object analysis
    getObjectInfo(obj) {
        const info = [
            { label: 'Type', value: typeof obj },
            { label: 'Constructor', value: obj?.constructor?.name || 'Unknown' }
        ];

        if (obj && typeof obj === 'object') {
            try {
                info.push({ label: 'Keys Count', value: Object.keys(obj).length });
            } catch (error) {
                info.push({ label: 'Keys Count', value: 'Error accessing keys' });
            }
        }

        if (Array.isArray(obj)) {
            info.push({ label: 'Array Length', value: obj.length });
        }

        return info;
    },

    getObjectExplorer(obj) {
        if (!obj || typeof obj !== 'object') {
            return [{ label: 'Value', value: obj }];
        }

        let keys;
        try {
            keys = Object.getOwnPropertyNames(obj).sort();
        } catch (error) {
            try {
                keys = Object.keys(obj).sort();
            } catch (innerError) {
                return [{ label: 'Error', value: 'Cannot access object properties' }];
            }
        }

        const primitives = [];
        const objects = [];
        const functions = [];

        keys.forEach(key => {
            try {
                const value = obj[key];
                const type = typeof value;
                
                if (type === 'function') {
                    functions.push(key);
                } else if (type === 'object' && value !== null) {
                    let summary = value.constructor?.name || 'Object';
                    
                    if (Array.isArray(value)) {
                        summary = `Array(${value.length})`;
                    } else if (value instanceof Map) {
                        summary = `Map(${value.size})`;
                    } else if (value instanceof Set) {
                        summary = `Set(${value.size})`;
                    }
                    
                    objects.push({ label: key, value: summary });
                } else {
                    primitives.push({ label: key, value: value });
                }
            } catch (error) {
                primitives.push({ label: key, value: '[Access Error]' });
            }
        });

        const result = [];
        
        if (primitives.length > 0) {
            result.push({ label: `Primitive Properties`, value: `(${primitives.length} items)` });
            primitives.slice(0, 20).forEach(item => result.push(item));
            if (primitives.length > 20) {
                result.push({ label: '...', value: `+${primitives.length - 20} more primitives` });
            }
        }
        
        if (objects.length > 0) {
            result.push({ label: `Object Properties`, value: `(${objects.length} items)` });
            objects.slice(0, 15).forEach(item => result.push(item));
            if (objects.length > 15) {
                result.push({ label: '...', value: `+${objects.length - 15} more objects` });
            }
        }
        
        if (functions.length > 0) {
            result.push({ label: `Methods`, value: `(${functions.length} methods)` });
            result.push({ label: 'Method Names', value: functions.slice(0, 20).join(', ') });
        }

        return result;
    }
};

// Simple service API for debugControl.js to use
const RiveFormatterService = {
    // Main formatting function
    formatObject(obj) {
        return RiveObjectFormatter.formatObject(obj);
    },

    // Asset discovery service
    findAssets(riveInstance) {
        const assetMap = AssetDetectionService.findAssetMap(riveInstance);
        return AssetDetectionService.extractAssets(assetMap);
    },

    // Input discovery service
    findInputs(riveInstance) {
        return InputDiscoveryService.discoverAllInputs(riveInstance);
    },

    // Manual asset search for troubleshooting
    manualAssetSearch(riveInstance) {
        if (!riveInstance) {
            console.log('❌ No Rive instance provided');
            return null;
        }

        const assetMap = AssetDetectionService.findAssetMap(riveInstance);
        const assets = AssetDetectionService.extractAssets(assetMap);
        
        console.group('🔧 Manual Asset Search Results');
        console.log('Asset Map Found:', !!(assetMap instanceof Map));
        console.log('Total Assets:', assetMap instanceof Map ? assetMap.size : 0);
        console.log('Images:', assets.images.length);
        console.log('Fonts:', assets.fonts.length);
        console.log('Audio:', assets.audio.length);
        console.log('Others:', assets.others.length);
        
        if (assetMap instanceof Map) {
            console.log('Asset Map:', assetMap);
        }
        
        console.groupEnd();
        
        return { assetMap, assets };
    },

    // Check if object is a Rive instance
    isRiveInstance(obj) {
        return FormatterUtils.isRiveInstance(obj);
    }
};

// Simple initialization - only expose the service
(function initialize() {
    if (typeof window !== 'undefined') {
        // Expose service for debugControl.js to use
        window.RiveFormatterService = RiveFormatterService;
        
        // Simple objectFormatter method for direct use
        if (!window.debugHelper) {
            window.debugHelper = {};
        }
        window.debugHelper.objectFormatter = RiveFormatterService.formatObject;
    }
})();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RiveFormatterService;
}

// ES6 exports for modern module systems
export default RiveFormatterService;
export { RiveFormatterService };