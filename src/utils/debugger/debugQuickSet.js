/**
 * @file debugQuickSet.js
 * Provides shortcuts for debug level configuration in the console
 */

import { LoggerAPI, LogLevel } from './debugLogger.js';

// Attach to window
window.debugHelper = {
    // Easy functions to change log levels from the browser console
    verbose: () => {
        LoggerAPI.setAllLevels(LogLevel.TRACE);
        console.log('All modules set to TRACE level');
    },
    debug: () => {
        LoggerAPI.setAllLevels(LogLevel.DEBUG);
        console.log('All modules set to DEBUG level');
    },
    normal: () => {
        LoggerAPI.setAllLevels(LogLevel.INFO);
        console.log('All modules set to INFO level');
    },
    quiet: () => {
        LoggerAPI.setAllLevels(LogLevel.WARN);
        console.log('All modules set to WARN level');
    },
    silent: () => {
        LoggerAPI.setAllLevels(LogLevel.ERROR);
        console.log('All modules set to ERROR level (silent)');
    },
    off: () => {
        LoggerAPI.setAllLevels(LogLevel.NONE);
        console.log('All logging disabled');
    },
    traceSingle: (module) => {
        LoggerAPI.setModuleLevel(module, LogLevel.TRACE);
        console.log(`Module '${module}' set to TRACE level`);
    },
    
    // Helper for toggling Pills Active state directly
    togglePills: () => {
        if (window.vm && typeof window.vm.boolean === 'function') {
            try {
                const pillsActive = window.vm.boolean('Pills Active');
                const newValue = !pillsActive.value;
                pillsActive.value = newValue;
                console.log(`Pills Active toggled to: ${newValue}`);
                return newValue;
            } catch (e) {
                console.error('Error toggling Pills Active:', e);
                return null;
            }
        } else {
            console.warn('VM not available or missing boolean method');
            return null;
        }
    },
    
    // Helper to check state of key properties
    checkState: () => {
        if (window.vm) {
            try {
                const props = {};
                if (typeof window.vm.boolean === 'function') {
                    try { props['Pills Active'] = window.vm.boolean('Pills Active').value; } catch (e) {}
                    try { props['Pills In'] = window.vm.boolean('Pills In').value; } catch (e) {}
                }
                console.table(props);
                return props;
            } catch (e) {
                console.error('Error checking state:', e);
                return null;
            }
        } else {
            console.warn('VM not available');
            return null;
        }
    }
};

// Log that debug helpers are ready
console.log('Debug helpers attached to window.debugHelper - Try window.debugHelper.verbose() in console'); 