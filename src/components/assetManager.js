/**
 * @file assetManager.js
 * Manages asset inspection and replacement for Rive animations
 */

import { createLogger } from '../utils/debugger/debugLogger.js';

// Create a logger for this module with debug levels
const logger = createLogger('assetManager');

// Debug levels for this module
const DEBUG_LEVELS = {
    ERROR: 0,   // Critical errors only
    WARN: 1,    // Warnings and errors
    INFO: 2,    // General information, warnings, and errors
    DEBUG: 3,   // Detailed debugging information
    TRACE: 4    // Very detailed tracing
};

let currentRiveInstance = null;
let assetManagerContainer = null;
let assetMap = new Map(); // Store assets captured during loading

/**
 * Initialize the asset manager with a Rive instance
 * @param {Object} riveInstance - The active Rive instance
 */
export function initializeAssetManager(riveInstance) {
    logger.debug('[INIT] Initializing Asset Manager', { riveInstance: !!riveInstance });
    
    currentRiveInstance = riveInstance;
    assetManagerContainer = document.getElementById('assetManagerContainer');
    
    if (!assetManagerContainer) {
        logger.error('[INIT] Asset manager container not found');
        return;
    }
    
    if (!riveInstance) {
        logger.info('[INIT] No Rive instance provided, showing empty state');
        showNoAssetsMessage();
        return;
    }
    
    logger.debug('[INIT] Building Asset Manager UI');
    buildAssetManagerUI();
}

/**
 * Set the asset map from the assetLoader callback
 * @param {Map} assets - Map of asset name to asset object
 */
export function setAssetMap(assets) {
    logger.debug('[ASSET_MAP] Setting asset map', { assetCount: assets.size });
    
    assetMap = assets;
    logger.info(`[ASSET_MAP] Asset map updated with ${assetMap.size} assets`);
    
    // Log asset details at trace level
    if (assetMap.size > 0) {
        logger.trace('[ASSET_MAP] Asset details:', Array.from(assetMap.entries()).map(([name, asset]) => ({
            name,
            isImage: asset.isImage,
            isFont: asset.isFont,
            fileExtension: asset.fileExtension
        })));
    }
    
    // Rebuild UI if container exists
    if (assetManagerContainer) {
        logger.debug('[ASSET_MAP] Rebuilding UI with new asset map');
        buildAssetManagerUI();
    }
}

/**
 * Get the current asset map
 * @returns {Map} The current asset map
 */
export function getAssetMap() {
    return assetMap;
}

/**
 * Show message when no Rive instance is loaded
 */
function showNoAssetsMessage() {
    if (!assetManagerContainer) return;
    
    assetManagerContainer.innerHTML = `
        <div class="asset-manager-empty">
            <div class="empty-icon">📦</div>
            <h3>No Assets Available</h3>
            <p>Load a Rive file to view and manage embedded assets</p>
        </div>
    `;
}

/**
 * Build the asset manager UI
 */
function buildAssetManagerUI() {
    if (!assetManagerContainer) {
        logger.warn('[UI] Asset manager container not available for UI build');
        return;
    }
    
    try {
        const assetCount = assetMap.size;
        logger.info(`[UI] Building Asset Manager UI with ${assetCount} assets`);
        
        if (assetCount === 0) {
            logger.debug('[UI] No assets to display, showing empty state');
            assetManagerContainer.innerHTML = `
                <div class="asset-manager-empty">
                    <div class="empty-icon">📦</div>
                    <h3>No Assets Found</h3>
                    <p>This Rive file doesn't contain any embedded assets</p>
                </div>
            `;
            return;
        }
        
        // Create header
        const header = document.createElement('div');
        header.className = 'asset-manager-header';
        header.innerHTML = `
            <h3>Asset Manager</h3>
            <div class="asset-count">${assetCount} asset${assetCount !== 1 ? 's' : ''}</div>
        `;
        
        // Create asset list
        const assetList = document.createElement('div');
        assetList.className = 'asset-list';
        
        // Sort assets alphabetically by name
        const sortedAssets = Array.from(assetMap.entries()).sort(([nameA], [nameB]) => {
            return nameA.localeCompare(nameB, undefined, { 
                numeric: true, 
                sensitivity: 'base' 
            });
        });
        
        logger.debug(`[UI] Sorted ${sortedAssets.length} assets alphabetically`);
        
        sortedAssets.forEach(([assetName, asset], index) => {
            const assetItem = createAssetItem(asset, assetName, index);
            assetList.appendChild(assetItem);
        });
        
        // Clear container and add new content
        assetManagerContainer.innerHTML = '';
        assetManagerContainer.appendChild(header);
        assetManagerContainer.appendChild(assetList);
        
    } catch (error) {
        logger.error('Error building asset manager UI:', error);
        assetManagerContainer.innerHTML = `
            <div class="asset-manager-error">
                <div class="error-icon">⚠️</div>
                <h3>Error Loading Assets</h3>
                <p>Unable to retrieve asset information from Rive file</p>
            </div>
        `;
    }
}

/**
 * Create an asset item element
 * @param {Object} asset - The asset object from Rive
 * @param {string} assetName - The asset name
 * @param {number} index - The asset index
 * @returns {HTMLElement} The asset item element
 */
function createAssetItem(asset, assetName, index) {
    const assetItem = document.createElement('div');
    assetItem.className = 'asset-item';
    assetItem.setAttribute('data-asset-name', assetName);
    assetItem.setAttribute('data-asset-index', index);
    
    // Determine asset type and icon
    const assetType = getAssetType(asset);
    const assetIcon = getAssetIcon(assetType);
    
    // Get asset details
    const displayName = assetName || `Asset ${index + 1}`;
    const assetId = asset.uniqueId || asset.id || 'Unknown ID';
    const cdnUuid = asset.cdnUuid || 'No CDN UUID';
    const fileExtension = asset.fileExtension || getExtensionFromName(assetName);
    
    assetItem.innerHTML = `
        <div class="asset-header">
            <div class="asset-icon">${assetIcon}</div>
            <div class="asset-info">
                <div class="asset-name" title="${displayName}">${displayName}</div>
                <div class="asset-details">
                    <span class="asset-type">${assetType}</span>
                    ${fileExtension !== 'Unknown' ? `<span class="asset-extension">.${fileExtension}</span>` : ''}
                </div>
            </div>
            <div class="asset-status">
                <span class="status-indicator embedded" title="Embedded in Rive file">📎</span>
            </div>
        </div>
        
        <div class="asset-metadata">
            <div class="metadata-item">
                <label>Asset Name:</label>
                <span>${assetName}</span>
            </div>
            ${assetId !== 'Unknown ID' ? `
                <div class="metadata-item">
                    <label>Asset ID:</label>
                    <span>${assetId}</span>
                </div>
            ` : ''}
            ${cdnUuid !== 'No CDN UUID' ? `
                <div class="metadata-item">
                    <label>CDN UUID:</label>
                    <span class="uuid">${cdnUuid}</span>
                </div>
            ` : ''}
        </div>
        
        <div class="asset-controls">
            <div class="replacement-section">
                <label class="replacement-label">Replace Asset:</label>
                <div class="replacement-options">
                    <div class="replacement-option">
                        <input type="file" 
                               id="file-input-${index}" 
                               class="file-input" 
                               accept="${getAcceptTypes(assetType)}"
                               data-asset-name="${assetName}"
                               data-asset-index="${index}">
                        <label for="file-input-${index}" class="asset-file-input-label">
                            📁 Choose Local File
                        </label>
                    </div>
                    <div class="replacement-option">
                        <input type="url" 
                               class="url-input" 
                               placeholder="Enter URL to asset..."
                               data-asset-name="${assetName}"
                               data-asset-index="${index}">
                        <button class="url-apply-btn" 
                                data-asset-name="${assetName}" 
                                data-asset-index="${index}">
                            🔗 Apply URL
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="asset-actions">
                <button class="reset-btn" 
                        data-asset-name="${assetName}" 
                        data-asset-index="${index}" 
                        title="Reset to original embedded asset">
                    🔄 Reset
                </button>
                <button class="info-btn" 
                        data-asset-name="${assetName}" 
                        data-asset-index="${index}" 
                        title="Show detailed asset information">
                    ℹ️ Info
                </button>
            </div>
        </div>
    `;
    
    // Add event listeners
    setupAssetItemEventListeners(assetItem, asset, assetName, index);
    
    // Add click-to-expand functionality
    const assetHeader = assetItem.querySelector('.asset-header');
    if (assetHeader) {
        assetHeader.addEventListener('click', (event) => {
            // Don't expand if clicking on status indicator
            if (event.target.closest('.status-indicator')) {
                return;
            }
            
            const isExpanded = assetItem.classList.contains('expanded');
            logger.debug(`[UI] Asset item ${isExpanded ? 'collapsing' : 'expanding'}:`, assetName);
            
            if (isExpanded) {
                assetItem.classList.remove('expanded');
            } else {
                assetItem.classList.add('expanded');
            }
        });
    }
    
    return assetItem;
}

/**
 * Set up event listeners for an asset item
 * @param {HTMLElement} assetItem - The asset item element
 * @param {Object} asset - The asset object
 * @param {string} assetName - The asset name
 * @param {number} index - The asset index
 */
function setupAssetItemEventListeners(assetItem, asset, assetName, index) {
    // File input change
    const fileInput = assetItem.querySelector(`#file-input-${index}`);
    if (fileInput) {
        fileInput.addEventListener('change', (event) => {
            handleFileReplacement(event, asset, assetName, index);
        });
    }
    
    // URL apply button
    const urlApplyBtn = assetItem.querySelector('.url-apply-btn');
    if (urlApplyBtn) {
        urlApplyBtn.addEventListener('click', () => {
            const urlInput = assetItem.querySelector('.url-input');
            if (urlInput && urlInput.value.trim()) {
                handleUrlReplacement(urlInput.value.trim(), asset, assetName, index);
            }
        });
    }
    
    // URL input enter key
    const urlInput = assetItem.querySelector('.url-input');
    if (urlInput) {
        urlInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter' && urlInput.value.trim()) {
                handleUrlReplacement(urlInput.value.trim(), asset, assetName, index);
            }
        });
    }
    
    // Reset button
    const resetBtn = assetItem.querySelector('.reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            handleAssetReset(asset, assetName, index);
        });
    }
    
    // Info button
    const infoBtn = assetItem.querySelector('.info-btn');
    if (infoBtn) {
        infoBtn.addEventListener('click', () => {
            showAssetInfo(asset, assetName, index);
        });
    }
}

/**
 * Handle file replacement for an asset
 * @param {Event} event - The file input change event
 * @param {Object} asset - The asset object
 * @param {string} assetName - The asset name
 * @param {number} index - The asset index
 */
function handleFileReplacement(event, asset, assetName, index) {
    const file = event.target.files[0];
    if (!file) {
        logger.debug('[FILE_REPLACE] No file selected');
        return;
    }
    
    logger.info(`[FILE_REPLACE] Replacing asset "${assetName}" with local file: ${file.name}`);
    logger.debug('[FILE_REPLACE] File details:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
    });
    
    try {
        // Create a URL for the file
        const fileUrl = URL.createObjectURL(file);
        logger.trace('[FILE_REPLACE] Created blob URL:', fileUrl);
        
        // Apply the replacement using the pattern from the user's example
        substituteImage(assetName, fileUrl);
        
        // Update UI to show replacement status
        updateAssetStatus(index, 'file', file.name);
        
    } catch (error) {
        logger.error(`[FILE_REPLACE] Error replacing asset with file:`, error);
        showAssetError(index, 'Failed to load local file');
    }
}

/**
 * Handle URL replacement for an asset
 * @param {string} url - The URL to replace with
 * @param {Object} asset - The asset object
 * @param {string} assetName - The asset name
 * @param {number} index - The asset index
 */
function handleUrlReplacement(url, asset, assetName, index) {
    logger.info(`[URL_REPLACE] Replacing asset "${assetName}" with URL: ${url}`);
    
    try {
        // Validate URL
        const urlObj = new URL(url);
        logger.debug('[URL_REPLACE] URL validation passed:', {
            protocol: urlObj.protocol,
            hostname: urlObj.hostname,
            pathname: urlObj.pathname
        });
        
        // Apply the replacement using the pattern from the user's example
        substituteImage(assetName, url);
        
        // Update UI to show replacement status
        updateAssetStatus(index, 'url', url);
        
    } catch (error) {
        logger.error(`[URL_REPLACE] Error replacing asset with URL:`, error);
        showAssetError(index, 'Invalid URL or failed to load');
    }
}

/**
 * Substitute an image asset (following the user's example pattern)
 * @param {string} name - The asset name
 * @param {string} url - The URL or blob URL to load
 */
function substituteImage(name, url) {
    const asset = assetMap.get(name);
    if (!asset || !url) {
        logger.error(`[SUBSTITUTE] Cannot substitute image: asset "${name}" not found or no URL provided`);
        return;
    }
    
    logger.debug(`[SUBSTITUTE] Starting image substitution for "${name}" from URL: ${url}`);
    
    fetch(url)
        .then((response) => {
            logger.trace(`[SUBSTITUTE] Fetch response for "${name}":`, {
                status: response.status,
                statusText: response.statusText,
                contentType: response.headers.get('content-type'),
                contentLength: response.headers.get('content-length')
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return response.arrayBuffer();
        })
        .then((buf) => {
            logger.debug(`[SUBSTITUTE] Received ${buf.byteLength} bytes for "${name}"`);
            
            if (window.rive && window.rive.decodeImage) {
                logger.trace(`[SUBSTITUTE] Decoding image for "${name}"`);
                return window.rive.decodeImage(new Uint8Array(buf));
            } else {
                throw new Error('Rive decodeImage not available');
            }
        })
        .then((img) => {
            if (asset.setRenderImage) {
                logger.debug(`[SUBSTITUTE] Setting render image for "${name}"`);
                asset.setRenderImage(img);
                img.unref(); // Clean up the decoded image reference
                logger.info(`[SUBSTITUTE] Successfully replaced asset "${name}"`);
            } else {
                throw new Error('Asset does not support setRenderImage');
            }
        })
        .catch((error) => {
            logger.error(`[SUBSTITUTE] Image decode/replacement error for "${name}":`, error);
            // Find the asset index for error display
            let index = 0;
            for (const [mapName] of assetMap) {
                if (mapName === name) break;
                index++;
            }
            showAssetError(index, error.message);
        });
}

/**
 * Reset an asset to its original embedded version
 * @param {Object} asset - The asset object
 * @param {string} assetName - The asset name
 * @param {number} index - The asset index
 */
function handleAssetReset(asset, assetName, index) {
    logger.info(`[RESET] Resetting asset "${assetName}" to original`);
    
    try {
        // For now, we don't have a direct reset method in the Rive API
        // This would need to be implemented by reloading the original asset
        logger.warn('[RESET] Asset reset functionality not yet implemented - would require reloading the Rive file');
        
        // Update UI
        updateAssetStatus(index, 'embedded', 'Original');
        
        // Clear input values
        const assetItem = document.querySelector(`[data-asset-index="${index}"]`);
        if (assetItem) {
            const fileInput = assetItem.querySelector('.file-input');
            const urlInput = assetItem.querySelector('.url-input');
            if (fileInput) {
                fileInput.value = '';
                logger.debug('[RESET] Cleared file input');
            }
            if (urlInput) {
                urlInput.value = '';
                logger.debug('[RESET] Cleared URL input');
            }
        }
        
    } catch (error) {
        logger.error(`[RESET] Error resetting asset:`, error);
        showAssetError(index, 'Failed to reset asset');
    }
}

/**
 * Show detailed asset information
 * @param {Object} asset - The asset object
 * @param {string} assetName - The asset name
 * @param {number} index - The asset index
 */
function showAssetInfo(asset, assetName, index) {
    const assetType = getAssetType(asset);
    
    // Create info modal or expand details
    const details = {
        'Name': assetName,
        'Type': assetType,
        'Unique ID': asset.uniqueId || 'N/A',
        'CDN UUID': asset.cdnUuid || 'N/A',
        'File Extension': asset.fileExtension || getExtensionFromName(assetName),
        'Is Image': asset.isImage ? 'Yes' : 'No',
        'Is Font': asset.isFont ? 'Yes' : 'No'
    };
    
    let detailsText = `Asset Information for "${assetName}":\n\n`;
    Object.entries(details).forEach(([key, value]) => {
        detailsText += `${key}: ${value}\n`;
    });
    
    // For now, use alert - could be enhanced with a proper modal
    alert(detailsText);
    
    logger.info(`Asset info for "${assetName}":`, details);
}

/**
 * Update the status indicator for an asset
 * @param {number} index - The asset index
 * @param {string} type - The status type ('embedded', 'file', 'url')
 * @param {string} displayName - The display name
 * @param {string} status - The status ('success', 'error', etc.)
 */
function updateAssetStatus(index, type, displayName, status = 'success') {
    const assetItem = document.querySelector(`[data-asset-index="${index}"]`);
    if (!assetItem) return;
    
    const statusIndicator = assetItem.querySelector('.status-indicator');
    if (!statusIndicator) return;
    
    // Remove existing classes
    statusIndicator.classList.remove('embedded', 'file', 'url', 'success', 'error');
    
    // Add new classes
    statusIndicator.classList.add(type, status);
    
    // Update content and title
    switch (type) {
        case 'embedded':
            statusIndicator.textContent = '📎';
            statusIndicator.title = 'Embedded in Rive file';
            break;
        case 'file':
            statusIndicator.textContent = '📁';
            statusIndicator.title = `Replaced with local file: ${displayName}`;
            break;
        case 'url':
            statusIndicator.textContent = '🔗';
            statusIndicator.title = `Replaced with URL: ${displayName}`;
            break;
    }
}

/**
 * Show an error for an asset
 * @param {number} index - The asset index
 * @param {string} message - The error message
 */
function showAssetError(index, message) {
    const assetItem = document.querySelector(`[data-asset-index="${index}"]`);
    if (!assetItem) return;
    
    // Update status to error
    updateAssetStatus(index, 'error', message, 'error');
    
    // Could also show a temporary error message in the UI
    logger.error(`Asset ${index} error: ${message}`);
}

/**
 * Determine the asset type from the asset object
 * @param {Object} asset - The asset object
 * @returns {string} The asset type
 */
function getAssetType(asset) {
    if (asset.isImage) return 'Image';
    if (asset.isFont) return 'Font';
    if (asset.fileExtension) {
        const ext = asset.fileExtension.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'Image';
        if (['ttf', 'otf', 'woff', 'woff2'].includes(ext)) return 'Font';
        if (['mp3', 'wav', 'ogg'].includes(ext)) return 'Audio';
        if (['mp4', 'webm', 'mov'].includes(ext)) return 'Video';
    }
    return 'Unknown';
}

/**
 * Get the icon for an asset type
 * @param {string} assetType - The asset type
 * @returns {string} The icon emoji
 */
function getAssetIcon(assetType) {
    switch (assetType) {
        case 'Image': return '🖼️';
        case 'Font': return '🔤';
        case 'Audio': return '🔊';
        case 'Video': return '🎥';
        default: return '📄';
    }
}

/**
 * Get file extension from asset name
 * @param {string} assetName - The asset name
 * @returns {string} The file extension
 */
function getExtensionFromName(assetName) {
    if (!assetName || typeof assetName !== 'string') return 'Unknown';
    const parts = assetName.split('.');
    return parts.length > 1 ? parts[parts.length - 1] : 'Unknown';
}

/**
 * Get accept types for file input based on asset type
 * @param {string} assetType - The asset type
 * @returns {string} The accept attribute value
 */
function getAcceptTypes(assetType) {
    switch (assetType) {
        case 'Image': return 'image/*';
        case 'Font': return '.ttf,.otf,.woff,.woff2';
        case 'Audio': return 'audio/*';
        case 'Video': return 'video/*';
        default: return '*/*';
    }
}

/**
 * Clear the asset manager
 */
export function clearAssetManager() {
    logger.debug('[CLEAR] Clearing Asset Manager');
    
    const previousAssetCount = assetMap.size;
    assetMap.clear();
    currentRiveInstance = null;
    showNoAssetsMessage();
    
    logger.info(`[CLEAR] Asset manager cleared (removed ${previousAssetCount} assets)`);
}

/**
 * Refresh the asset manager UI
 */
export function refreshAssetManager() {
    if (currentRiveInstance) {
        buildAssetManagerUI();
    }
} 