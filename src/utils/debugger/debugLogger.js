/**
 * @file debugLogger.js
 * Central logging utility that provides granular control over logging levels for different modules.
 */

// Log levels definition
export const LogLevel = {
    NONE: 0,      // No logging
    ERROR: 1,     // Only errors
    WARN: 2,      // Errors and warnings
    INFO: 3,      // General information (default)
    DEBUG: 4,     // Detailed information for debugging
    TRACE: 5      // Extremely detailed tracing information
};

// Module configuration with default levels
const moduleConfig = {
    // Core modules
    'parser': LogLevel.INFO,
    'parserHandler': LogLevel.INFO,
    'controlInterface': LogLevel.INFO,
    'dataConnector': LogLevel.INFO,
    'goldenLayout': LogLevel.INFO,
    
    // Default for any module not specified
    'default': LogLevel.NONE
};

// Global system configuration
const config = {
    enabled: true,                // Master switch to enable/disable all logging
    showTimestamp: true,          // Include timestamp in logs
    showModuleName: true,         // Include module name in logs
    defaultLevel: LogLevel.INFO,  // Default level if not specified
    consoleOutput: true,          // Log to console
    
    // Function to format log messages
    formatMessage: (moduleName, level, message) => {
        const parts = [];
        
        // Add timestamp if enabled
        if (config.showTimestamp) {
            const now = new Date();
            parts.push(`[${now.toISOString()}]`);
        }
        
        // Add module name if enabled
        if (config.showModuleName) {
            parts.push(`[${moduleName}]`);
        }
        
        // Add level name
        const levelName = Object.keys(LogLevel).find(key => LogLevel[key] === level) || 'UNKNOWN';
        parts.push(`[${levelName}]`);
        
        // Combine with message
        return parts.join(' ') + ' ' + message;
    }
};

/**
 * Create a logger instance for a specific module
 * @param {string} moduleName - The name of the module using this logger
 * @returns {Object} Logger object with methods for each log level
 */
export function createLogger(moduleName) {
    // Default level for this module, or fallback to default
    const getModuleLevel = () => moduleConfig[moduleName] || moduleConfig.default || config.defaultLevel;
    
    // Check if logging is enabled for the specified level
    const shouldLog = (level) => config.enabled && level <= getModuleLevel();
    
    // Common log method
    const log = (level, ...args) => {
        if (!shouldLog(level)) return;
        
        // Handle complex objects and multiple arguments
        const processArgs = (argsList) => {
            return argsList.map(arg => {
                if (typeof arg === 'object') {
                    try {
                        return JSON.stringify(arg);
                    } catch (e) {
                        return `[Object: ${typeof arg}]`;
                    }
                }
                return String(arg);
            }).join(' ');
        };
        
        const message = processArgs(args);
        const formattedMessage = config.formatMessage(moduleName, level, message);
        
        // Send to console if enabled
        if (config.consoleOutput) {
            switch (level) {
                case LogLevel.ERROR:
                    console.error(formattedMessage);
                    break;
                case LogLevel.WARN:
                    console.warn(formattedMessage);
                    break;
                case LogLevel.INFO:
                    console.info(formattedMessage);
                    break;
                case LogLevel.DEBUG:
                case LogLevel.TRACE:
                default:
                    console.log(formattedMessage);
                    break;
            }
        }
        
        // Additional log destinations could be added here (file, remote logging, etc.)
    };
    
    // Return logger object with methods for each level
    return {
        trace: (...args) => log(LogLevel.TRACE, ...args),
        debug: (...args) => log(LogLevel.DEBUG, ...args),
        info: (...args) => log(LogLevel.INFO, ...args),
        warn: (...args) => log(LogLevel.WARN, ...args),
        error: (...args) => log(LogLevel.ERROR, ...args),
        
        // Utility to change the log level for this module at runtime
        setLevel: (level) => {
            if (typeof level === 'number' && level >= LogLevel.NONE && level <= LogLevel.TRACE) {
                moduleConfig[moduleName] = level;
                log(LogLevel.INFO, `Log level changed to ${Object.keys(LogLevel).find(key => LogLevel[key] === level)}`);
            } else {
                log(LogLevel.ERROR, `Invalid log level: ${level}`);
            }
        }
    };
}

/**
 * Configure the global logger system
 * @param {Object} options - Configuration options
 */
export function configureLogger(options = {}) {
    // Update config with provided options
    Object.assign(config, options);
    
    // Update module config if provided
    if (options.modules && typeof options.modules === 'object') {
        Object.keys(options.modules).forEach(moduleName => {
            if (typeof options.modules[moduleName] === 'number') {
                moduleConfig[moduleName] = options.modules[moduleName];
            }
        });
    }
    
    const defaultLogger = createLogger('loggerConfig');
    defaultLogger.info('Logger configuration updated');
    
    // Log current config for debugging
    defaultLogger.debug('Current configuration:', config);
    defaultLogger.debug('Module levels:', moduleConfig);
}

// Public API to control logging levels
export const LoggerAPI = {
    // Set level for a specific module
    setModuleLevel: (moduleName, level) => {
        if (typeof level === 'number' && level >= LogLevel.NONE && level <= LogLevel.TRACE) {
            moduleConfig[moduleName] = level;
            
            const defaultLogger = createLogger('loggerAPI');
            defaultLogger.info(`Log level for module '${moduleName}' set to ${Object.keys(LogLevel).find(key => LogLevel[key] === level)}`);
        }
    },
    
    // Set level for all modules
    setAllLevels: (level) => {
        if (typeof level === 'number' && level >= LogLevel.NONE && level <= LogLevel.TRACE) {
            Object.keys(moduleConfig).forEach(moduleName => {
                moduleConfig[moduleName] = level;
            });
            
            // Also set default level
            moduleConfig.default = level;
            
            const defaultLogger = createLogger('loggerAPI');
            defaultLogger.info(`Global log level set to ${Object.keys(LogLevel).find(key => LogLevel[key] === level)}`);
        }
    },
    
    // Enable/disable logging globally
    enable: (enabled = true) => {
        config.enabled = !!enabled;
        
        const defaultLogger = createLogger('loggerAPI');
        defaultLogger.info(`Logging ${enabled ? 'enabled' : 'disabled'}`);
    },
    
    // Configure the logger system
    configure: configureLogger,
    
    // Log levels for reference
    levels: LogLevel
};

// Export a default logger for quick use
export default createLogger('default'); 