/**
 * @file assetManager.js
 * Manages asset inspection and replacement for Rive animations
 */

import { createLogger } from '../utils/debugger/debugLogger.js';

// Create a logger for this module
const logger = createLogger('assetManager');

let currentRiveInstance = null;
let assetManagerContainer = null;

/**
 * Initialize the asset manager with a Rive instance
 * @param {Object} riveInstance - The active Rive instance
 */
export function initializeAssetManager(riveInstance) {
    currentRiveInstance = riveInstance;
    assetManagerContainer = document.getElementById('assetManagerContainer');
    
    if (!assetManagerContainer) {
        logger.error('Asset manager container not found');
        return;
    }
    
    if (!riveInstance) {
        showNoAssetsMessage();
        return;
    }
    
    buildAssetManagerUI();
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
    if (!currentRiveInstance || !assetManagerContainer) {
        return;
    }
    
    try {
        const assets = currentRiveInstance.assets();
        logger.info(`Found ${assets.length} assets in Rive file`);
        
        if (assets.length === 0) {
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
            <div class="asset-count">${assets.length} asset${assets.length !== 1 ? 's' : ''}</div>
        `;
        
        // Create asset list
        const assetList = document.createElement('div');
        assetList.className = 'asset-list';
        
        assets.forEach((asset, index) => {
            const assetItem = createAssetItem(asset, index);
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
 * @param {number} index - The asset index
 * @returns {HTMLElement} The asset item element
 */
function createAssetItem(asset, index) {
    const assetItem = document.createElement('div');
    assetItem.className = 'asset-item';
    assetItem.setAttribute('data-asset-index', index);
    
    // Determine asset type and icon
    const assetType = getAssetType(asset);
    const assetIcon = getAssetIcon(assetType);
    
    // Get asset details
    const assetName = asset.name || `Asset ${index + 1}`;
    const assetId = asset.uniqueId || asset.id || 'Unknown ID';
    const cdnUuid = asset.cdnUuid || 'No CDN UUID';
    const fileExtension = asset.fileExtension || 'Unknown';
    
    assetItem.innerHTML = `
        <div class="asset-header">
            <div class="asset-icon">${assetIcon}</div>
            <div class="asset-info">
                <div class="asset-name" title="${assetName}">${assetName}</div>
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
                <label>Asset ID:</label>
                <span>${assetId}</span>
            </div>
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
                               data-asset-index="${index}">
                        <label for="file-input-${index}" class="file-input-label">
                            📁 Choose Local File
                        </label>
                    </div>
                    <div class="replacement-option">
                        <input type="url" 
                               class="url-input" 
                               placeholder="Enter URL to asset..."
                               data-asset-index="${index}">
                        <button class="url-apply-btn" data-asset-index="${index}">
                            🔗 Apply URL
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="asset-actions">
                <button class="reset-btn" data-asset-index="${index}" title="Reset to original embedded asset">
                    🔄 Reset
                </button>
                <button class="info-btn" data-asset-index="${index}" title="Show detailed asset information">
                    ℹ️ Info
                </button>
            </div>
        </div>
    `;
    
    // Add event listeners
    setupAssetItemEventListeners(assetItem, asset, index);
    
    return assetItem;
}

/**
 * Set up event listeners for an asset item
 * @param {HTMLElement} assetItem - The asset item element
 * @param {Object} asset - The asset object
 * @param {number} index - The asset index
 */
function setupAssetItemEventListeners(assetItem, asset, index) {
    // File input change
    const fileInput = assetItem.querySelector(`#file-input-${index}`);
    if (fileInput) {
        fileInput.addEventListener('change', (event) => {
            handleFileReplacement(event, asset, index);
        });
    }
    
    // URL apply button
    const urlApplyBtn = assetItem.querySelector('.url-apply-btn');
    if (urlApplyBtn) {
        urlApplyBtn.addEventListener('click', () => {
            const urlInput = assetItem.querySelector('.url-input');
            if (urlInput && urlInput.value.trim()) {
                handleUrlReplacement(urlInput.value.trim(), asset, index);
            }
        });
    }
    
    // URL input enter key
    const urlInput = assetItem.querySelector('.url-input');
    if (urlInput) {
        urlInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter' && urlInput.value.trim()) {
                handleUrlReplacement(urlInput.value.trim(), asset, index);
            }
        });
    }
    
    // Reset button
    const resetBtn = assetItem.querySelector('.reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            handleAssetReset(asset, index);
        });
    }
    
    // Info button
    const infoBtn = assetItem.querySelector('.info-btn');
    if (infoBtn) {
        infoBtn.addEventListener('click', () => {
            showAssetInfo(asset, index);
        });
    }
}

/**
 * Handle file replacement for an asset
 * @param {Event} event - The file input change event
 * @param {Object} asset - The asset object
 * @param {number} index - The asset index
 */
function handleFileReplacement(event, asset, index) {
    const file = event.target.files[0];
    if (!file) return;
    
    logger.info(`Replacing asset "${asset.name}" with local file: ${file.name}`);
    
    try {
        // Create a URL for the file
        const fileUrl = URL.createObjectURL(file);
        
        // Apply the replacement
        replaceAsset(asset, fileUrl, index, 'file', file.name);
        
        // Update UI to show replacement status
        updateAssetStatus(index, 'file', file.name);
        
    } catch (error) {
        logger.error(`Error replacing asset with file:`, error);
        showAssetError(index, 'Failed to load local file');
    }
}

/**
 * Handle URL replacement for an asset
 * @param {string} url - The URL to replace with
 * @param {Object} asset - The asset object
 * @param {number} index - The asset index
 */
function handleUrlReplacement(url, asset, index) {
    logger.info(`Replacing asset "${asset.name}" with URL: ${url}`);
    
    try {
        // Validate URL
        new URL(url);
        
        // Apply the replacement
        replaceAsset(asset, url, index, 'url', url);
        
        // Update UI to show replacement status
        updateAssetStatus(index, 'url', url);
        
    } catch (error) {
        logger.error(`Error replacing asset with URL:`, error);
        showAssetError(index, 'Invalid URL or failed to load');
    }
}

/**
 * Replace an asset in the Rive instance
 * @param {Object} asset - The asset object
 * @param {string} source - The new source (URL or blob URL)
 * @param {number} index - The asset index
 * @param {string} type - The replacement type ('file' or 'url')
 * @param {string} displayName - The display name for the replacement
 */
function replaceAsset(asset, source, index, type, displayName) {
    if (!currentRiveInstance || !asset) {
        logger.error('Cannot replace asset: missing Rive instance or asset');
        return;
    }
    
    try {
        // Fetch the asset data
        fetch(source)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return response.arrayBuffer();
            })
            .then(arrayBuffer => {
                // Decode the image using Rive's decoder
                if (window.rive && window.rive.decodeImage) {
                    const uint8Array = new Uint8Array(arrayBuffer);
                    const decodedImage = window.rive.decodeImage(uint8Array);
                    
                    if (decodedImage && asset.setRenderImage) {
                        // Set the new render image
                        asset.setRenderImage(decodedImage);
                        
                        // Clean up the decoded image reference
                        decodedImage.unref();
                        
                        logger.info(`Successfully replaced asset "${asset.name}"`);
                        updateAssetStatus(index, type, displayName, 'success');
                        
                    } else {
                        throw new Error('Failed to decode image or asset does not support setRenderImage');
                    }
                } else {
                    throw new Error('Rive image decoder not available');
                }
            })
            .catch(error => {
                logger.error(`Failed to replace asset "${asset.name}":`, error);
                showAssetError(index, error.message);
            });
            
    } catch (error) {
        logger.error(`Error in replaceAsset:`, error);
        showAssetError(index, error.message);
    }
}

/**
 * Reset an asset to its original embedded version
 * @param {Object} asset - The asset object
 * @param {number} index - The asset index
 */
function handleAssetReset(asset, index) {
    logger.info(`Resetting asset "${asset.name}" to original`);
    
    try {
        // Reset to original (this might need to be implemented differently based on Rive API)
        if (asset.resetToOriginal) {
            asset.resetToOriginal();
        } else {
            logger.warn('Asset reset not supported by current Rive version');
        }
        
        // Update UI
        updateAssetStatus(index, 'embedded', 'Original');
        
        // Clear input values
        const assetItem = document.querySelector(`[data-asset-index="${index}"]`);
        if (assetItem) {
            const fileInput = assetItem.querySelector('.file-input');
            const urlInput = assetItem.querySelector('.url-input');
            if (fileInput) fileInput.value = '';
            if (urlInput) urlInput.value = '';
        }
        
    } catch (error) {
        logger.error(`Error resetting asset:`, error);
        showAssetError(index, 'Failed to reset asset');
    }
}

/**
 * Show detailed asset information
 * @param {Object} asset - The asset object
 * @param {number} index - The asset index
 */
function showAssetInfo(asset, index) {
    const assetName = asset.name || `Asset ${index + 1}`;
    const assetType = getAssetType(asset);
    
    // Create info modal or expand details
    const details = {
        'Name': assetName,
        'Type': assetType,
        'Unique ID': asset.uniqueId || 'N/A',
        'CDN UUID': asset.cdnUuid || 'N/A',
        'File Extension': asset.fileExtension || 'N/A',
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
    switch (assetType.toLowerCase()) {
        case 'image': return '🖼️';
        case 'font': return '🔤';
        case 'audio': return '🔊';
        case 'video': return '🎥';
        default: return '📄';
    }
}

/**
 * Get the accept types for file input based on asset type
 * @param {string} assetType - The asset type
 * @returns {string} The accept attribute value
 */
function getAcceptTypes(assetType) {
    switch (assetType.toLowerCase()) {
        case 'image': return 'image/*';
        case 'font': return '.ttf,.otf,.woff,.woff2';
        case 'audio': return 'audio/*';
        case 'video': return 'video/*';
        default: return '*/*';
    }
}

/**
 * Clear the asset manager
 */
export function clearAssetManager() {
    currentRiveInstance = null;
    if (assetManagerContainer) {
        showNoAssetsMessage();
    }
}

/**
 * Refresh the asset manager with current Rive instance
 */
export function refreshAssetManager() {
    if (currentRiveInstance) {
        buildAssetManagerUI();
    } else {
        showNoAssetsMessage();
    }
} 