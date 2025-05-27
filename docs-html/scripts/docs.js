/**
 * Documentation Site JavaScript
 * Handles navigation, smooth scrolling, and interactive features
 */

document.addEventListener("DOMContentLoaded", function () {
	// Initialize all features
	initSmoothScrolling();
	initSidebarNavigation();
	initActiveNavigation();
	initMobileMenu();

	console.log("📚 Rive Tester Documentation loaded");
});

/**
 * Initialize smooth scrolling for anchor links
 */
function initSmoothScrolling() {
	const anchorLinks = document.querySelectorAll('a[href^="#"]');

	anchorLinks.forEach((link) => {
		link.addEventListener("click", function (e) {
			const href = this.getAttribute("href");

			// Skip if it's just "#"
			if (href === "#") return;

			const targetId = href.substring(1);
			const targetElement = document.getElementById(targetId);

			if (targetElement) {
				e.preventDefault();

				// Calculate offset for sticky navbar
				const navbarHeight =
					document.querySelector(".navbar").offsetHeight;
				const targetPosition =
					targetElement.offsetTop - navbarHeight - 20;

				window.scrollTo({
					top: targetPosition,
					behavior: "smooth",
				});

				// Update URL without jumping
				history.pushState(null, null, href);
			}
		});
	});
}

/**
 * Initialize sidebar navigation highlighting
 */
function initSidebarNavigation() {
	const sidebarLinks = document.querySelectorAll(".sidebar-link");

	// Handle clicks on sidebar links
	sidebarLinks.forEach((link) => {
		link.addEventListener("click", function () {
			// Remove active class from all links
			sidebarLinks.forEach((l) => l.classList.remove("active"));

			// Add active class to clicked link
			this.classList.add("active");
		});
	});
}

/**
 * Initialize active navigation based on scroll position
 */
function initActiveNavigation() {
	const sections = document.querySelectorAll(
		"section[id], h1[id], h2[id], h3[id]",
	);
	const sidebarLinks = document.querySelectorAll('.sidebar-link[href^="#"]');

	if (sections.length === 0 || sidebarLinks.length === 0) return;

	function updateActiveNavigation() {
		const scrollPosition = window.scrollY + 150; // Offset for navbar

		let currentSection = "";

		sections.forEach((section) => {
			const sectionTop = section.offsetTop;
			const sectionHeight = section.offsetHeight;

			if (
				scrollPosition >= sectionTop &&
				scrollPosition < sectionTop + sectionHeight
			) {
				currentSection = section.id;
			}
		});

		// Update sidebar active states
		sidebarLinks.forEach((link) => {
			link.classList.remove("active");

			const href = link.getAttribute("href");
			if (href === `#${currentSection}`) {
				link.classList.add("active");
			}
		});
	}

	// Throttled scroll listener
	let ticking = false;

	function onScroll() {
		if (!ticking) {
			requestAnimationFrame(() => {
				updateActiveNavigation();
				ticking = false;
			});
			ticking = true;
		}
	}

	window.addEventListener("scroll", onScroll);

	// Initial call
	updateActiveNavigation();
}

/**
 * Initialize mobile menu functionality
 */
function initMobileMenu() {
	// Add mobile menu toggle if needed
	const navbar = document.querySelector(".navbar");
	const navLinks = document.querySelector(".nav-links");

	// Create mobile menu button
	const mobileMenuBtn = document.createElement("button");
	mobileMenuBtn.className = "mobile-menu-btn";
	mobileMenuBtn.innerHTML = "☰";
	mobileMenuBtn.style.display = "none";

	// Add mobile styles
	const style = document.createElement("style");
	style.textContent = `
        @media (max-width: 768px) {
            .mobile-menu-btn {
                display: block !important;
                background: none;
                border: none;
                color: var(--text-primary);
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0.5rem;
            }
            
            .nav-links.mobile-hidden {
                display: none !important;
            }
            
            .nav-links.mobile-visible {
                display: flex !important;
                flex-direction: column;
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background-color: var(--surface-color);
                border-top: 1px solid var(--border-color);
                padding: 1rem;
                box-shadow: var(--shadow);
            }
        }
    `;
	document.head.appendChild(style);

	// Add button to navbar
	const navContainer = document.querySelector(".nav-container");
	navContainer.appendChild(mobileMenuBtn);

	// Toggle mobile menu
	mobileMenuBtn.addEventListener("click", function () {
		navLinks.classList.toggle("mobile-hidden");
		navLinks.classList.toggle("mobile-visible");
	});

	// Close mobile menu when clicking outside
	document.addEventListener("click", function (e) {
		if (!navbar.contains(e.target)) {
			navLinks.classList.remove("mobile-visible");
			navLinks.classList.add("mobile-hidden");
		}
	});

	// Handle window resize
	window.addEventListener("resize", function () {
		if (window.innerWidth > 768) {
			navLinks.classList.remove("mobile-hidden", "mobile-visible");
		}
	});
}

/**
 * Utility function to copy text to clipboard
 */
function copyToClipboard(text) {
	if (navigator.clipboard && window.isSecureContext) {
		return navigator.clipboard.writeText(text);
	} else {
		// Fallback for older browsers
		const textArea = document.createElement("textarea");
		textArea.value = text;
		textArea.style.position = "fixed";
		textArea.style.left = "-999999px";
		textArea.style.top = "-999999px";
		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();

		return new Promise((resolve, reject) => {
			document.execCommand("copy") ? resolve() : reject();
			textArea.remove();
		});
	}
}

/**
 * Add copy buttons to code blocks
 */
function initCodeCopyButtons() {
	const codeBlocks = document.querySelectorAll('pre[class*="language-"]');

	codeBlocks.forEach((block) => {
		const button = document.createElement("button");
		button.className = "copy-code-btn";
		button.textContent = "Copy";
		button.style.cssText = `
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            background: var(--primary-color);
            color: white;
            border: none;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.2s ease;
        `;

		block.style.position = "relative";
		block.appendChild(button);

		// Show button on hover
		block.addEventListener("mouseenter", () => {
			button.style.opacity = "1";
		});

		block.addEventListener("mouseleave", () => {
			button.style.opacity = "0";
		});

		// Copy functionality
		button.addEventListener("click", async () => {
			const code = block.querySelector("code");
			const text = code ? code.textContent : block.textContent;

			try {
				await copyToClipboard(text);
				button.textContent = "Copied!";
				setTimeout(() => {
					button.textContent = "Copy";
				}, 2000);
			} catch (err) {
				console.error("Failed to copy code:", err);
				button.textContent = "Error";
				setTimeout(() => {
					button.textContent = "Copy";
				}, 2000);
			}
		});
	});
}

/**
 * Initialize search functionality (if search input exists)
 */
function initSearch() {
	const searchInput = document.querySelector("#search-input");
	if (!searchInput) return;

	const searchResults = document.querySelector("#search-results");
	const allContent = document.querySelectorAll("h1, h2, h3, h4, p, li");

	let searchIndex = [];

	// Build search index
	allContent.forEach((element, index) => {
		const text = element.textContent.toLowerCase();
		const heading =
			element.closest("section")?.querySelector("h1, h2, h3")
				?.textContent || "";

		searchIndex.push({
			element,
			text,
			heading,
			index,
		});
	});

	function performSearch(query) {
		if (!query || query.length < 2) {
			searchResults.innerHTML = "";
			searchResults.style.display = "none";
			return;
		}

		const results = searchIndex
			.filter((item) => item.text.includes(query.toLowerCase()))
			.slice(0, 10);

		if (results.length === 0) {
			searchResults.innerHTML =
				'<div class="search-no-results">No results found</div>';
		} else {
			searchResults.innerHTML = results
				.map((result) => {
					const snippet = result.text.substring(0, 100) + "...";
					return `
                    <div class="search-result" data-index="${result.index}">
                        <div class="search-result-heading">${result.heading}</div>
                        <div class="search-result-snippet">${snippet}</div>
                    </div>
                `;
				})
				.join("");
		}

		searchResults.style.display = "block";
	}

	// Debounced search
	let searchTimeout;
	searchInput.addEventListener("input", function () {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			performSearch(this.value);
		}, 300);
	});

	// Handle search result clicks
	searchResults.addEventListener("click", function (e) {
		const resultElement = e.target.closest(".search-result");
		if (resultElement) {
			const index = parseInt(resultElement.dataset.index);
			const targetElement = searchIndex[index].element;

			targetElement.scrollIntoView({
				behavior: "smooth",
				block: "center",
			});

			searchResults.style.display = "none";
			searchInput.value = "";
		}
	});

	// Hide search results when clicking outside
	document.addEventListener("click", function (e) {
		if (
			!searchInput.contains(e.target) &&
			!searchResults.contains(e.target)
		) {
			searchResults.style.display = "none";
		}
	});
}

/**
 * Initialize theme toggle (if theme toggle exists)
 */
function initThemeToggle() {
	const themeToggle = document.querySelector("#theme-toggle");
	if (!themeToggle) return;

	const currentTheme = localStorage.getItem("docs-theme") || "dark";
	document.documentElement.setAttribute("data-theme", currentTheme);

	themeToggle.addEventListener("click", function () {
		const currentTheme =
			document.documentElement.getAttribute("data-theme");
		const newTheme = currentTheme === "dark" ? "light" : "dark";

		document.documentElement.setAttribute("data-theme", newTheme);
		localStorage.setItem("docs-theme", newTheme);
	});
}

// Initialize additional features when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
	// Wait for Prism to load before adding copy buttons
	setTimeout(initCodeCopyButtons, 100);
	initSearch();
	initThemeToggle();
});

// Export functions for potential external use
window.DocsJS = {
	copyToClipboard,
	initCodeCopyButtons,
	initSearch,
	initThemeToggle,
};
