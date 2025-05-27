/**
 * @file goldenLayoutManager.js
 * Manages the Golden Layout configuration and component registration
 */

import { createLogger } from "../utils/debugger/debugLogger.js";

// Create a logger for this module
const logger = createLogger("goldenLayout");

let goldenLayout = null;
let jsonEditorInstance = null;
let restoreMenuUpdateTimeout = null;
let layoutCheckTimeout = null;

/**
 * Default Golden Layout configuration for v1.5.9
 */
const defaultLayoutConfig = {
	settings: {
		showPopoutIcon: false,
		showMaximiseIcon: true,
		showCloseIcon: false,
		responsiveMode: "onload",
		tabOverlapAllowance: 0,
		reorderEnabled: true,
		tabControlOffset: 10,
	},
	dimensions: {
		borderWidth: 5,
		minItemHeight: 200,
		minItemWidth: 350, // Minimum width to prevent controls clipping
		headerHeight: 30,
		dragProxyWidth: 300,
		dragProxyHeight: 200,
	},
	labels: {
		close: "close",
		maximise: "maximise",
		minimise: "minimise",
		popout: "open in new window",
		popin: "pop in",
		tabDropdown: "additional tabs",
	},
	content: [
		{
			type: "column",
			content: [
				{
					type: "row",
					height: 30,
					content: [
						{
							type: "component",
							componentName: "controls",
							title: "Controls",
							width: 50,
						},
						{
							type: "component",
							componentName: "jsonInspector",
							title: "Rive Parser",
							width: 50,
						},
					],
				},
				{
					type: "row",
					height: 70,
					content: [
						{
							type: "component",
							componentName: "canvas",
							title: "Rive Canvas",
							width: 60,
						},
						{
							type: "component",
							componentName: "dynamicControls",
							title: "Dynamic Controls",
							width: 20,
						},
						{
							type: "component",
							componentName: "assetManager",
							title: "Asset Manager",
							width: 20,
						},
					],
				},
			],
		},
	],
};

/**
 * Load layout configuration from localStorage or use default
 */
function getLayoutConfig() {
	try {
		const savedConfig = localStorage.getItem("goldenLayoutConfig");
		if (savedConfig) {
			const parsed = JSON.parse(savedConfig);
			logger.info("Loaded layout configuration from localStorage");
			return parsed;
		}
	} catch (error) {
		logger.warn("Error loading layout from localStorage:", error);
	}

	logger.info("Using default layout configuration");
	return defaultLayoutConfig;
}

/**
 * Save layout configuration to localStorage
 */
function saveLayoutConfig(config) {
	try {
		localStorage.setItem("goldenLayoutConfig", JSON.stringify(config));
		logger.debug("Layout configuration saved to localStorage");
	} catch (error) {
		logger.error("Error saving layout to localStorage:", error);
	}
}

/**
 * Component factory functions for Golden Layout v1.5.9
 */
const componentFactories = {
	controls: function (container, componentState) {
		try {
			const template = document.getElementById("controlsTemplate");
			if (!template) {
				logger.error("controlsTemplate not found");
				return;
			}

			const content = template.cloneNode(true);
			content.style.display = "block";
			content.id = "fileControls";

			// Get the DOM element from jQuery wrapper
			const element = container.getElement();
			if (element && element.length > 0) {
				element[0].appendChild(content);
				element[0].id = "fileControls";
				logger.info(
					"Controls component created and appended to element[0]",
				);
			} else if (element && element.appendChild) {
				element.appendChild(content);
				element.id = "fileControls";
				logger.info(
					"Controls component created and appended to element",
				);
			} else {
				logger.error("No valid element found to append controls to");
			}

			logger.info("Controls component created");
		} catch (error) {
			logger.error("Error creating controls component:", error);
		}
	},

	canvas: function (container, componentState) {
		try {
			const template = document.getElementById("canvasTemplate");
			if (!template) {
				logger.error("canvasTemplate not found");
				return;
			}

			const content = template.cloneNode(true);
			content.style.display = "block";
			content.id = "canvasComponent";

			// Get the DOM element from jQuery wrapper
			const element = container.getElement();
			if (element && element.length > 0) {
				element[0].appendChild(content);
			} else if (element && element.appendChild) {
				element.appendChild(content);
			}

			// Ensure canvas fills the container and set initial background
			const canvas = content.querySelector("#rive-canvas");
			if (canvas) {
				canvas.style.width = "100%";
				canvas.style.height = "100%";
				// Set initial background color
				canvas.style.backgroundColor = "#252525";
			}

			logger.info("Canvas component created");
		} catch (error) {
			logger.error("Error creating canvas component:", error);
		}
	},

	dynamicControls: function (container, componentState) {
		try {
			const template = document.getElementById("dynamicControlsTemplate");
			if (!template) {
				logger.error("dynamicControlsTemplate not found");
				return;
			}

			const content = template.cloneNode(true);
			content.style.display = "block";
			content.id = "dynamicControlsComponent";

			// Get the DOM element from jQuery wrapper
			const element = container.getElement();
			if (element && element.length > 0) {
				element[0].appendChild(content);
			} else if (element && element.appendChild) {
				element.appendChild(content);
			}

			logger.info("Dynamic Controls component created");
		} catch (error) {
			logger.error("Error creating dynamicControls component:", error);
		}
	},

	jsonInspector: function (container, componentState) {
		try {
			const template = document.getElementById("jsonInspectorTemplate");
			if (!template) {
				logger.error("jsonInspectorTemplate not found");
				return;
			}

			const content = template.cloneNode(true);
			content.style.display = "block";
			content.id = "jsonInspectorComponent";

			// Get the DOM element from jQuery wrapper
			const element = container.getElement();
			if (element && element.length > 0) {
				element[0].appendChild(content);
			} else if (element && element.appendChild) {
				element.appendChild(content);
			}

			// Initialize JSONEditor when component is created
			setTimeout(() => {
				const outputElement = content.querySelector("#output");
				if (outputElement) {
					initializeJSONEditor(outputElement);
				}
			}, 100);

			logger.info("JSON Inspector component created");
		} catch (error) {
			logger.error("Error creating jsonInspector component:", error);
		}
	},

	assetManager: function (container, componentState) {
		try {
			const template = document.getElementById("assetManagerTemplate");
			if (!template) {
				logger.error("assetManagerTemplate not found");
				return;
			}

			const content = template.cloneNode(true);
			content.style.display = "block";
			content.id = "assetManagerComponent";

			// Get the DOM element from jQuery wrapper
			const element = container.getElement();
			if (element && element.length > 0) {
				element[0].appendChild(content);
				// Allow Golden Layout's lm_content to scroll if our component overflows
				element[0].style.overflow = "auto";
			} else if (element && element.appendChild) {
				element.appendChild(content);
				// Allow Golden Layout's lm_content to scroll
				element.style.overflow = "auto";
			}

			logger.info(
				"Asset Manager component created and configured for scrolling",
			);
		} catch (error) {
			logger.error("Error creating assetManager component:", error);
		}
	},
};

/**
 * Initialize Golden Layout v1.5.9
 */
export function initializeGoldenLayout() {
	const container = document.getElementById("goldenLayoutContainer");
	if (!container) {
		logger.error("Golden Layout container not found");
		return null;
	}

	// Check if required dependencies are loaded
	if (typeof window.GoldenLayout === "undefined") {
		logger.error("GoldenLayout not found on window object");
		return null;
	}

	if (typeof $ === "undefined") {
		logger.error("jQuery not found");
		return null;
	}

	try {
		const layoutConfig = getLayoutConfig();
		logger.info("Initializing Golden Layout with config:", layoutConfig);

		// Create Golden Layout instance (v1.5.9 API)
		goldenLayout = new window.GoldenLayout(layoutConfig, $(container));

		// Register component factories (v1.5.9 API)
		goldenLayout.registerComponent("controls", componentFactories.controls);
		goldenLayout.registerComponent("canvas", componentFactories.canvas);
		goldenLayout.registerComponent(
			"dynamicControls",
			componentFactories.dynamicControls,
		);
		goldenLayout.registerComponent(
			"jsonInspector",
			componentFactories.jsonInspector,
		);
		goldenLayout.registerComponent(
			"assetManager",
			componentFactories.assetManager,
		);

		logger.info("All components registered successfully");

		// Handle resize events and save layout changes
		goldenLayout.on("stateChanged", () => {
			logger.debug("🔄 Golden Layout stateChanged event triggered");

			// Save layout configuration to localStorage
			if (goldenLayout.isInitialised) {
				saveLayoutConfig(goldenLayout.toConfig());
			}

			// Check if controls panel layout state changed
			debouncedCheckControlsLayoutState("stateChanged");

			// Trigger canvas resize when layout changes
			setTimeout(() => {
				// Trigger the aspect ratio aware resize
				if (window.resizeCanvasToAnimationAspectRatio) {
					window.resizeCanvasToAnimationAspectRatio();
				} else {
					// Fallback
					const canvas = document.getElementById("rive-canvas");
					if (canvas && window.riveInstanceGlobal) {
						try {
							window.riveInstanceGlobal.resizeDrawingSurfaceToCanvas();
						} catch (error) {
							logger.debug(
								"Canvas resize triggered by layout change",
							);
						}
					}
				}
			}, 100);
		});

		goldenLayout.on("initialised", () => {
			logger.info("Golden Layout initialized successfully");
			addRestoreMenu();

			// Check initial controls layout state
			setTimeout(
				() => debouncedCheckControlsLayoutState("initialization"),
				100,
			);

			// Set up window resize handler for Golden Layout
			let resizeTimeout;
			const handleResize = () => {
				logger.debug("🪟 Window resize event triggered");
				clearTimeout(resizeTimeout);
				resizeTimeout = setTimeout(() => {
					if (goldenLayout && goldenLayout.updateSize) {
						goldenLayout.updateSize();
						logger.debug(
							"Golden Layout size updated on window resize",
						);
						// Check if controls panel layout state changed
						debouncedCheckControlsLayoutState("windowResize");
					}
				}, 100);
			};

			window.addEventListener("resize", handleResize);

			// Store the resize handler for cleanup
			goldenLayout._resizeHandler = handleResize;

			// Set up constraints for controls panel
			setupControlsConstraints();

			// Note: Restore menu updates are handled by event listeners below
			// No periodic sync needed as events should catch all changes
		});

		// Handle item destruction and creation to update restore menu
		goldenLayout.on("itemDestroyed", (item) => {
			logger.trace("Item destroyed:", item.config);
			debouncedAddRestoreMenu();
			// Check if controls panel layout state changed
			debouncedCheckControlsLayoutState("itemDestroyed");
		});

		// Handle component creation to update restore menu
		goldenLayout.on("componentCreated", (component) => {
			logger.info("Component created:", component.config.componentName);
			debouncedAddRestoreMenu();
			// Check if controls panel layout state changed
			debouncedCheckControlsLayoutState("componentCreated");
		});

		// Handle tab creation (when panels are restored)
		goldenLayout.on("tabCreated", (tab) => {
			logger.trace("Tab created:", tab.contentItem.config);
			debouncedAddRestoreMenu();
			// Check if controls panel layout state changed
			debouncedCheckControlsLayoutState("tabCreated");
		});

		// Handle stack creation (when new panel containers are created)
		goldenLayout.on("stackCreated", (stack) => {
			logger.trace("Stack created");
			debouncedAddRestoreMenu();
			// Check if controls panel layout state changed
			debouncedCheckControlsLayoutState("stackCreated");
		});

		// Handle item added events (broader than just components)
		goldenLayout.on("itemCreated", (item) => {
			if (item.config && item.config.componentName) {
				logger.trace(
					"Item created with component:",
					item.config.componentName,
				);
				debouncedAddRestoreMenu();
				// Check if controls panel layout state changed
				debouncedCheckControlsLayoutState("itemCreated");
			}
		});

		// Initialize the layout
		goldenLayout.init();

		logger.info("Golden Layout v1.5.9 initialization complete");
		return goldenLayout;
	} catch (error) {
		logger.error("Error initializing Golden Layout:", error);
		console.error("Golden Layout error details:", error);
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

	// Ensure container has proper dimensions
	container.style.width = "100%";
	container.style.height = "100%";
	container.style.minHeight = "300px";

	const options = {
		mode: "tree",
		modes: ["tree", "view", "code", "text", "preview"],
		search: true,
		enableTransform: false,
		onNodeName: function ({ path, type, size, value }) {
			if (type === "object") {
				if (value && typeof value === "object" && size > 0) {
					const keys = Object.keys(value);
					if (keys.length > 0) {
						const firstKey = keys[0];
						const firstValue = value[firstKey];
						if (typeof firstValue === "string") {
							const maxLength = 30;
							let previewString =
								firstValue.length > maxLength
									? firstValue.substring(0, maxLength) + "..."
									: firstValue;
							return `\"${previewString}\"`;
						}
					}
				}
				return undefined;
			}
			if (type === "array") {
				return `Array [${size}]`;
			}
			return undefined;
		},
		onError: function (err) {
			logger.error("JSONEditor Error:", err.toString());
		},
	};

	try {
		jsonEditorInstance = new JSONEditor(container, options, {
			message: "Please select a Rive file to parse.",
		});

		// Force resize after initialization
		setTimeout(() => {
			if (
				jsonEditorInstance &&
				typeof jsonEditorInstance.resize === "function"
			) {
				jsonEditorInstance.resize();
			}
		}, 100);

		logger.info("JSONEditor initialized in Golden Layout");
	} catch (error) {
		logger.error("Error initializing JSONEditor:", error);
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
			logger.error("Error updating JSONEditor:", error);
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
 * Debounced version of addRestoreMenu to prevent excessive updates
 */
function debouncedAddRestoreMenu() {
	if (restoreMenuUpdateTimeout) {
		clearTimeout(restoreMenuUpdateTimeout);
	}
	restoreMenuUpdateTimeout = setTimeout(addRestoreMenu, 150);
}

/**
 * Add restore bar for closed panels
 */
function addRestoreMenu() {
	// Remove existing restore bar
	const existingBar = document.getElementById("restoreBar");
	if (existingBar) {
		existingBar.remove();
	}

	if (!goldenLayout || !goldenLayout.isInitialised) {
		logger.debug("Golden Layout not ready for restore menu");
		return;
	}

	const allComponents = [
		"controls",
		"canvas",
		"dynamicControls",
		"jsonInspector",
		"assetManager",
	];
	const missingComponents = [];
	const foundComponents = [];

	// Check which components are missing
	allComponents.forEach((componentName) => {
		const found = findComponentInLayout(goldenLayout.root, componentName);
		if (!found) {
			missingComponents.push(componentName);
			logger.debug(`Component ${componentName} is missing from layout`);
		} else {
			foundComponents.push(componentName);
			logger.trace(`Component ${componentName} found in layout`);
		}
	});

	logger.trace(
		`Restore menu update: Found ${foundComponents.length} components, Missing ${missingComponents.length} components`,
		{
			found: foundComponents,
			missing: missingComponents,
		},
	);

	// Always show the bar, but collapse it if no missing components
	const bar = document.createElement("div");
	bar.id = "restoreBar";
	bar.className = `restore-bar ${missingComponents.length === 0 ? "collapsed" : ""}`;

	if (missingComponents.length === 0) {
		bar.innerHTML = `
            <div class="restore-bar-collapsed">
                <span>All panels open</span>
                <div class="restore-bar-buttons">
                    <button class="docs-btn" id="docsBtn" title="View Documentation">
                        📚 Docs
                    </button>
                    <button class="layout-reset-btn" id="layoutResetBtn" title="Reset Layout to Default">
                        🔄 Reset Layout
                    </button>
                </div>
            </div>
        `;
	} else {
		bar.innerHTML = `
            <div class="restore-bar-content">
                <span class="restore-label">Restore:</span>
                ${missingComponents
					.map(
						(comp) => `
                    <button class="restore-btn" data-component="${comp}">
                        ${getComponentDisplayName(comp)}
                    </button>
                `,
					)
					.join("")}
            </div>
        `;

		// Add event listeners
		bar.querySelectorAll(".restore-btn").forEach((btn) => {
			btn.addEventListener("click", (e) => {
				const componentName = e.target.dataset.component;
				restoreComponent(componentName);
			});
		});
	}

	// Add event listener for documentation button
	const docsBtn = bar.querySelector("#docsBtn");
	if (docsBtn) {
		docsBtn.addEventListener("click", () => {
			openDocumentation();
		});
	}

	// Add event listener for layout reset button
	const resetBtn = bar.querySelector("#layoutResetBtn");
	if (resetBtn) {
		resetBtn.addEventListener("click", () => {
			resetLayoutToDefault();
		});
	}

	// Insert into the dedicated restore bar container
	const restoreBarContainer = document.getElementById("restoreBarContainer");
	if (restoreBarContainer) {
		restoreBarContainer.appendChild(bar);
	} else {
		// Fallback: insert at the top of the golden layout container
		const container = document.getElementById("goldenLayoutContainer");
		if (container) {
			container.insertBefore(bar, container.firstChild);
		}
	}
}

/**
 * Find component in layout recursively
 */
function findComponentInLayout(item, componentName) {
	// Check if this item is the component we're looking for
	if (item.config && item.config.componentName === componentName) {
		logger.trace(`Found component ${componentName} in layout`);
		return true;
	}

	// Check if this item has the component type directly
	if (
		item.config &&
		item.config.type === "component" &&
		item.config.componentName === componentName
	) {
		logger.trace(
			`Found component ${componentName} as direct component type`,
		);
		return true;
	}

	// Recursively search in content items
	if (item.contentItems && Array.isArray(item.contentItems)) {
		for (let child of item.contentItems) {
			if (findComponentInLayout(child, componentName)) {
				return true;
			}
		}
	}

	// Also check if the item has a componentName property directly (for some Golden Layout versions)
	if (item.componentName === componentName) {
		logger.trace(
			`Found component ${componentName} via direct componentName property`,
		);
		return true;
	}

	return false;
}

/**
 * Get display name for component
 */
function getComponentDisplayName(componentName) {
	const names = {
		controls: "Controls",
		canvas: "Canvas",
		dynamicControls: "Dynamic Controls",
		jsonInspector: "Rive Parser",
		assetManager: "Asset Manager",
	};
	return names[componentName] || componentName;
}

/**
 * Restore a missing component
 */
function restoreComponent(componentName) {
	if (!goldenLayout || !goldenLayout.isInitialised) {
		logger.error("Cannot restore component: Golden Layout not ready");
		return;
	}

	// Check if component already exists
	if (findComponentInLayout(goldenLayout.root, componentName)) {
		logger.warn(`Component ${componentName} already exists in layout`);
		debouncedAddRestoreMenu(); // Update menu to reflect current state
		return;
	}

	const newItemConfig = {
		type: "component",
		componentName: componentName,
		title: getComponentDisplayName(componentName),
	};

	logger.info(`Attempting to restore component: ${componentName}`);

	try {
		// Find the best place to add the component
		let targetContainer = null;

		// Try to find a suitable container (stack, row, or column)
		const findSuitableContainer = (item) => {
			if (item.type === "stack" && item.addChild) {
				return item;
			}
			if (
				(item.type === "row" || item.type === "column") &&
				item.addChild
			) {
				return item;
			}
			if (item.contentItems) {
				for (let child of item.contentItems) {
					const found = findSuitableContainer(child);
					if (found) return found;
				}
			}
			return null;
		};

		targetContainer = findSuitableContainer(goldenLayout.root);

		if (targetContainer) {
			logger.debug(
				`Adding component ${componentName} to container type: ${targetContainer.type}`,
			);
			targetContainer.addChild(newItemConfig);
			logger.info(`Successfully restored component: ${componentName}`);
		} else {
			// Fallback: try to add to root if it supports it
			if (goldenLayout.root.addChild) {
				goldenLayout.root.addChild(newItemConfig);
				logger.info(`Restored component ${componentName} to root`);
			} else {
				throw new Error(
					"No suitable container found for component restoration",
				);
			}
		}

		// Update menu after a delay to ensure the component is fully created
		setTimeout(debouncedAddRestoreMenu, 200);
	} catch (error) {
		logger.error(`Error restoring component ${componentName}:`, error);
		// Still update the menu in case of partial success
		debouncedAddRestoreMenu();
	}
}

/**
 * Set up constraints for the controls panel to prevent clipping
 */
function setupControlsConstraints() {
	if (!goldenLayout) return;

	try {
		// Find the controls component
		const findControlsComponent = (item) => {
			if (item.config && item.config.componentName === "controls") {
				return item;
			}
			if (item.contentItems) {
				for (let child of item.contentItems) {
					const found = findControlsComponent(child);
					if (found) return found;
				}
			}
			return null;
		};

		const controlsComponent = findControlsComponent(goldenLayout.root);
		if (controlsComponent && controlsComponent.element) {
			// Set minimum width constraint only
			const element =
				controlsComponent.element[0] || controlsComponent.element;
			if (element) {
				element.style.minWidth = "300px";
				// Let CSS handle all width responsiveness
				logger.debug("Controls minimum width constraint applied");
			}
		}
	} catch (error) {
		logger.error("Error setting up controls constraints:", error);
	}
}

/**
 * Open documentation in a new tab
 */
function openDocumentation() {
	try {
		// Determine the documentation URL based on current location
		const currentUrl = window.location.href;
		let docsUrl;

		if (
			currentUrl.includes("localhost") ||
			currentUrl.includes("127.0.0.1")
		) {
			// Local development - serve MkDocs on different port
			const baseUrl = currentUrl.split("/").slice(0, 3).join("/");
			docsUrl = `${baseUrl.replace("8000", "8001")}/`;
		} else if (currentUrl.includes("github.io")) {
			// GitHub Pages - docs are deployed to /docs/ path from root
			if (currentUrl.includes("/rive-playground/")) {
				// We're in the app, go up to root then to docs
				docsUrl = "../docs/";
			} else {
				// We're at root level
				docsUrl = "./docs/";
			}
		} else {
			// Fallback to relative docs path
			docsUrl = "../docs/";
		}

		logger.info("Opening documentation:", docsUrl);
		window.open(docsUrl, "_blank", "noopener,noreferrer");
	} catch (error) {
		logger.error("Error opening documentation:", error);
		// Fallback: try relative path
		docsUrl = "../docs/";
		window.open(docsUrl, "_blank", "noopener,noreferrer");
	}
}

/**
 * Reset layout to default configuration
 */
export function resetLayoutToDefault() {
	try {
		localStorage.removeItem("goldenLayoutConfig");
		logger.info("Layout configuration reset to default");

		// Reload the page to apply default layout
		window.location.reload();
	} catch (error) {
		logger.error("Error resetting layout:", error);
	}
}

/**
 * Manually refresh the restore menu (useful for debugging or if events are missed)
 */
export function refreshRestoreMenu() {
	logger.debug("Manually refreshing restore menu");
	debouncedAddRestoreMenu();
}

/**
 * Destroy Golden Layout
 */
export function destroyGoldenLayout() {
	// Remove restore bar
	const existingBar = document.getElementById("restoreBar");
	if (existingBar) {
		existingBar.remove();
	}

	if (goldenLayout) {
		try {
			// Remove resize handler
			if (goldenLayout._resizeHandler) {
				window.removeEventListener(
					"resize",
					goldenLayout._resizeHandler,
				);
			}

			// Note: No sync interval to clear (removed for performance)

			// Clear any pending restore menu updates
			if (restoreMenuUpdateTimeout) {
				clearTimeout(restoreMenuUpdateTimeout);
				restoreMenuUpdateTimeout = null;
			}

			// Clear any pending layout checks
			if (layoutCheckTimeout) {
				clearTimeout(layoutCheckTimeout);
				layoutCheckTimeout = null;
			}

			goldenLayout.destroy();
			goldenLayout = null;
			jsonEditorInstance = null;
			logger.info("Golden Layout destroyed");
		} catch (error) {
			logger.error("Error destroying Golden Layout:", error);
		}
	}
}

/**
 * Find component object in layout recursively (returns the actual component, not boolean)
 */
function findComponentObjectInLayout(item, componentName) {
	// Check if this item is the component we're looking for
	if (item.config && item.config.componentName === componentName) {
		return item;
	}

	// Check if this item has the component type directly
	if (
		item.config &&
		item.config.type === "component" &&
		item.config.componentName === componentName
	) {
		return item;
	}

	// Recursively search in content items
	if (item.contentItems && Array.isArray(item.contentItems)) {
		for (let child of item.contentItems) {
			const found = findComponentObjectInLayout(child, componentName);
			if (found) {
				return found;
			}
		}
	}

	// Also check if the item has a componentName property directly
	if (item.componentName === componentName) {
		return item;
	}

	return null;
}

/**
 * Debug function to log the entire layout tree structure
 */
function debugLayoutTree(item, depth = 0) {
	if (!item) {
		logger.trace("  ".repeat(depth) + "null/undefined item");
		return;
	}

	const indent = "  ".repeat(depth);
	const itemInfo = {
		type: item.type || "unknown",
		componentName: item.config?.componentName || "none",
		title: item.config?.title || "none",
		contentItemsCount: item.contentItems?.length || 0,
	};

	logger.trace(
		`${indent}${item.type || "unknown"}${item.config?.componentName ? ` (${item.config.componentName})` : ""} - ${item.contentItems?.length || 0} children`,
	);

	if (
		item.contentItems &&
		Array.isArray(item.contentItems) &&
		item.contentItems.length > 0
	) {
		item.contentItems.forEach((child, index) => {
			try {
				debugLayoutTree(child, depth + 1);
			} catch (error) {
				logger.trace(
					`${indent}  [${index}] Error traversing child: ${error.message}`,
				);
			}
		});
	}
}

/**
 * Adjust height constraints for the controls panel based on layout mode
 * @param {boolean} isFullWidth - Whether controls is in full width mode
 */
function adjustControlsHeightConstraints(isFullWidth) {
	if (!goldenLayout || !goldenLayout.isInitialised) {
		return;
	}

	try {
		const controlsComponent = findComponentObjectInLayout(
			goldenLayout.root,
			"controls",
		);
		if (!controlsComponent) {
			logger.debug(
				"Controls component not found for height constraint adjustment",
			);
			return;
		}

		// Find the stack containing the controls
		const controlsStack = controlsComponent.parent;
		if (!controlsStack || controlsStack.type !== "stack") {
			logger.debug(
				"Controls stack not found for height constraint adjustment",
			);
			return;
		}

		if (isFullWidth) {
			// In full width mode (single row), allow very small heights
			const minHeight = 50; // Minimum for single row layout

			// Set minimum height on the stack
			if (controlsStack.config) {
				controlsStack.config.minItemHeight = minHeight;
			}

			// Also set it on the Golden Layout configuration for future items
			if (goldenLayout.config && goldenLayout.config.dimensions) {
				goldenLayout.config.dimensions.minItemHeight = minHeight;
			}

			logger.debug(
				`Adjusted controls height constraints for full width mode: minHeight = ${minHeight}px`,
			);
		} else {
			// In normal mode, restore standard minimum height
			const minHeight = 200; // Standard minimum height

			// Restore minimum height on the stack
			if (controlsStack.config) {
				controlsStack.config.minItemHeight = minHeight;
			}

			// Also restore it on the Golden Layout configuration
			if (goldenLayout.config && goldenLayout.config.dimensions) {
				goldenLayout.config.dimensions.minItemHeight = minHeight;
			}

			logger.debug(
				`Restored controls height constraints for normal mode: minHeight = ${minHeight}px`,
			);
		}
	} catch (error) {
		logger.error("Error adjusting controls height constraints:", error);
	}
}

/**
 * Debounced version of checkControlsLayoutState to prevent excessive calls
 */
function debouncedCheckControlsLayoutState(reason = "unknown") {
	if (layoutCheckTimeout) {
		clearTimeout(layoutCheckTimeout);
	}
	layoutCheckTimeout = setTimeout(() => {
		logger.debug(`🔍 Debounced layout check triggered by: ${reason}`);
		checkControlsLayoutState();
	}, 100);
}

/**
 * Check if the controls panel is alone in its row and apply appropriate CSS class
 */
function checkControlsLayoutState() {
	logger.debug("=== Starting controls layout state check ===");

	// Add call stack trace to see what triggered this check
	if (logger.trace) {
		const stack = new Error().stack;
		const callerLine = stack.split("\n")[2]; // Get the caller
		logger.trace("Called from:", callerLine?.trim());
	}

	if (!goldenLayout || !goldenLayout.isInitialised) {
		logger.debug("Golden Layout not ready - skipping check");
		return;
	}

	if (!goldenLayout.root) {
		logger.debug("Golden Layout root not available - skipping check");
		return;
	}

	try {
		// Debug: Log the entire layout tree
		logger.trace("Current layout tree:");
		debugLayoutTree(goldenLayout.root);

		const controlsComponent = findComponentObjectInLayout(
			goldenLayout.root,
			"controls",
		);
		if (!controlsComponent) {
			logger.debug("Controls component not found in layout");
			return;
		}

		logger.debug("Found controls component:", {
			type: controlsComponent.type,
			componentName: controlsComponent.config?.componentName,
			hasParent: !!controlsComponent.parent,
		});

		// Get the controls panel element
		const controlsElement = document.getElementById("fileControls");
		if (!controlsElement) {
			logger.debug("Controls element not found in DOM");
			return;
		}

		logger.debug(
			"Found controls DOM element, current classes:",
			controlsElement.className,
		);

		// Find the parent container and determine if controls is "alone"
		let currentItem = controlsComponent;
		let parentContainer = null;
		let traversalPath = [];
		let isAloneInContainer = false;

		// Traverse up to find the immediate parent container (stack, row, or column)
		while (currentItem && currentItem.parent) {
			traversalPath.push({
				type: currentItem.type,
				componentName: currentItem.config?.componentName,
				parentType: currentItem.parent?.type,
			});

			// Check if we found a meaningful parent container
			if (
				currentItem.parent.type === "row" ||
				currentItem.parent.type === "column"
			) {
				parentContainer = currentItem.parent;
				logger.debug("Found parent container:", {
					type: parentContainer.type,
					contentItemsCount: parentContainer.contentItems.length,
					contentItems: parentContainer.contentItems.map((item) => ({
						type: item.type,
						componentName: item.config?.componentName,
						title: item.config?.title,
					})),
				});
				break;
			}
			currentItem = currentItem.parent;
		}

		logger.debug("Traversal path to find container:", traversalPath);

		if (parentContainer) {
			if (parentContainer.type === "row") {
				// Controls is in a row - check if it's alone in that row
				isAloneInContainer = parentContainer.contentItems.length === 1;
				logger.info(`Controls in ROW - alone: ${isAloneInContainer}`);
			} else if (parentContainer.type === "column") {
				// Controls is in a column - check if it's the only "significant" item
				// In this case, if controls is in its own stack and there are other items,
				// we need to determine if it should be considered "alone"

				// Find the stack containing controls
				const controlsStack = controlsComponent.parent;
				if (controlsStack && controlsStack.type === "stack") {
					// Check if controls is the only component in its stack
					const aloneInStack =
						controlsStack.contentItems.length === 1;

					// Check if this stack takes up significant space in the column
					// For now, we'll consider it "alone" if it's in its own stack
					// and the stack is a direct child of the column
					isAloneInContainer =
						aloneInStack &&
						controlsStack.parent === parentContainer;

					logger.info(
						`Controls in COLUMN via STACK - alone in stack: ${aloneInStack}, stack is direct child: ${controlsStack.parent === parentContainer}, considered alone: ${isAloneInContainer}`,
					);
				}
			}

			logger.info(`Controls layout analysis:`, {
				parentContainerType: parentContainer.type,
				siblingCount: parentContainer.contentItems.length,
				isAloneInContainer: isAloneInContainer,
				siblings: parentContainer.contentItems.map((item) => ({
					type: item.type,
					componentName: item.config?.componentName,
					title: item.config?.title,
				})),
			});

			if (isAloneInContainer) {
				// Controls panel is alone - apply full width mode
				if (
					controlsElement &&
					controlsElement.classList &&
					!controlsElement.classList.contains("ctrl-full-width-mode")
				) {
					logger.info(
						"✅ APPLYING full width mode - controls is alone in container",
					);
					logger.debug("Container details:", {
						type: parentContainer.type,
						siblingCount: parentContainer.contentItems.length,
						containerDimensions: parentContainer.element
							? {
									width:
										parentContainer.element[0]
											?.offsetWidth || "unknown",
									height:
										parentContainer.element[0]
											?.offsetHeight || "unknown",
								}
							: "no element",
					});
					controlsElement.classList.add("ctrl-full-width-mode");

					// Also add class to Golden Layout item for CSS targeting
					const controlsGLItem =
						controlsComponent.element?.closest(".lm_item");
					if (controlsGLItem && controlsGLItem.classList) {
						controlsGLItem.classList.add("ctrl-gl-full-width");
						logger.debug(
							"Added ctrl-gl-full-width class to Golden Layout item",
						);
					}

					// Let CSS handle width in full width mode
				} else {
					logger.debug(
						"Controls panel already has full width mode applied",
					);
				}

				// Remove height constraints for full width mode (single row layout)
				adjustControlsHeightConstraints(true);
			} else {
				// Controls panel shares the container - remove full width mode
				if (
					controlsElement &&
					controlsElement.classList &&
					controlsElement.classList.contains("ctrl-full-width-mode")
				) {
					logger.warn(
						"❌ REMOVING full width mode - controls shares container",
					);
					logger.debug("Container details:", {
						type: parentContainer.type,
						siblingCount: parentContainer.contentItems.length,
						siblings: parentContainer.contentItems.map((item) => ({
							type: item.type,
							componentName: item.config?.componentName,
							title: item.config?.title,
							dimensions: item.element
								? {
										width:
											item.element[0]?.offsetWidth ||
											"unknown",
										height:
											item.element[0]?.offsetHeight ||
											"unknown",
									}
								: "no element",
						})),
						containerDimensions: parentContainer.element
							? {
									width:
										parentContainer.element[0]
											?.offsetWidth || "unknown",
									height:
										parentContainer.element[0]
											?.offsetHeight || "unknown",
								}
							: "no element",
					});
					controlsElement.classList.remove("ctrl-full-width-mode");

					// Also remove class from Golden Layout item
					const controlsGLItem =
						controlsComponent.element?.closest(".lm_item");
					if (controlsGLItem && controlsGLItem.classList) {
						controlsGLItem.classList.remove("ctrl-gl-full-width");
						logger.debug(
							"Removed ctrl-gl-full-width class from Golden Layout item",
						);
					}

					// Restore width constraints for normal mode
					const element =
						controlsComponent.element?.[0] ||
						controlsComponent.element;
					if (element) {
						element.style.maxWidth = "40vw";
						element.style.width = "";
						logger.debug(
							"Restored width constraints for normal mode on element:",
							element,
						);

						// Also restore constraints on parent elements
						const parentItem = element.closest(".lm_item");
						if (parentItem) {
							parentItem.style.maxWidth = "40vw";
							parentItem.style.width = "";
							logger.debug(
								"Restored width constraints on parent lm_item",
							);
						}

						// Restore constraints on lm_content wrapper
						const contentWrapper = element.closest(".lm_content");
						if (contentWrapper && contentWrapper !== element) {
							contentWrapper.style.maxWidth = "40vw";
							contentWrapper.style.width = "";
							logger.debug(
								"Restored width constraints on lm_content wrapper",
							);
						}
					}
				} else {
					logger.debug(
						"Controls panel already in shared container mode",
					);
				}

				// Restore height constraints for normal mode
				adjustControlsHeightConstraints(false);
			}
		} else {
			logger.warn(
				"No parent container found for controls component - this might indicate an unexpected layout structure",
			);
			// If no parent container found, remove full width mode
			if (
				controlsElement &&
				controlsElement.classList &&
				controlsElement.classList.contains("ctrl-full-width-mode")
			) {
				controlsElement.classList.remove("ctrl-full-width-mode");
				logger.debug("No parent container - removed full width mode");
			}
		}

		logger.debug("=== Completed controls layout state check ===");
	} catch (error) {
		logger.error("Error checking controls layout state:", {
			message: error.message,
			stack: error.stack,
			name: error.name,
			goldenLayoutReady: !!(goldenLayout && goldenLayout.isInitialised),
			goldenLayoutRoot: !!goldenLayout?.root,
		});
	}
}
