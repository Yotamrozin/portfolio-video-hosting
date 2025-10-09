// Navbar Scroll Animation and Color Management System - Fixed Version 5
class NavbarScrollManager {
    constructor() {
        this.navbar = document.querySelector('.nav_1_component');
        this.navWraps = null; // Will store both desktop and mobile nav wraps
        this.mobileMenuButton = null; // Mobile hamburger button
        this.scrollThreshold = window.innerHeight * 0.9;
        this.isScrolled = false;
        this.isMobileMenuOpen = false; // Track mobile menu state
        this.currentThemeColor = null;
        this.originalVariant = null;
        this.originalBackground = null;
        this.background2Color = null;
        this.storedColorsBeforeMenu = null; // Store colors before mobile menu opens
        
        // Performance optimizations
        this.scrollHandler = this.throttledScrollHandler.bind(this);
        this.resizeHandler = this.debouncedResizeHandler.bind(this);
        
        // Color cache to prevent unnecessary updates
        this.lastAppliedColors = {
            font: null,
            bg: null,
            border: null
        };
        
        this.init();
    }
    
    init() {
        if (!this.navbar) {
            return;
        }
        
        // Store ALL nav wraps (both desktop and mobile)
        this.navWraps = this.navbar.querySelectorAll('.nav_1_wrap');
        if (this.navWraps.length === 0) {
            return;
        }
        
        // Store the mobile menu button
        this.mobileMenuButton = this.navbar.querySelector('.w-nav-button');
        
        // Store the original variant and background
        this.originalVariant = this.navbar.getAttribute('data-wf--nav--variant') || 'base';
        this.originalBackground = this.getComputedBackground();
        
        // Get the actual background-2 color from the div
        this.background2Color = this.getBackground2Color();
        

        
        // Set up event listeners for all variants (height/logo animations)
        this.setupEventListeners();
        
        // Set up mobile menu observer
        this.setupMobileMenuObserver();
        
        // Only set up color for Base variant (one-time read, no live listeners)
        if (this.originalVariant === 'base') {
            this.loadInitialThemeColor();

            // Initial color application
            this.applyProjectColors(false);
        }
        
        // Initial state check
        this.updateNavbarState();
    }
    
    getBackground2Color() {
        // Find the div with background-2 and get its computed background color
        const bgDiv = document.querySelector('[data-wf--background-color--background-color="background-2"]');
        if (bgDiv) {
            const computedStyle = window.getComputedStyle(bgDiv);
            return computedStyle.backgroundColor;
        }
        return null;
    }
    
    getComputedBackground() {
        // Get background from first nav wrap (they should have the same original background)
        if (this.navWraps && this.navWraps.length > 0) {
            const computedStyle = window.getComputedStyle(this.navWraps[0]);
            return computedStyle.backgroundColor;
        }
        return null;
    }
    
    setupEventListeners() {
        window.addEventListener('scroll', this.scrollHandler, { passive: true });
        window.addEventListener('resize', this.resizeHandler, { passive: true });
        
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.updateNavbarState();
            }
        });
    }
    
    setupMobileMenuObserver() {
        if (!this.mobileMenuButton) return;
        
        // Create a MutationObserver to watch for class changes on the mobile menu button
        this.menuObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const isOpen = this.mobileMenuButton.classList.contains('w--open');
                    
                    if (isOpen !== this.isMobileMenuOpen) {
                        this.isMobileMenuOpen = isOpen;
                        this.handleMobileMenuToggle(isOpen);
                    }
                }
            });
        });
        
        // Start observing the mobile menu button
        this.menuObserver.observe(this.mobileMenuButton, {
            attributes: true,
            attributeFilter: ['class']
        });
    }
    
    handleMobileMenuToggle(isOpen) {
        if (isOpen) {
            // Store current colors before changing them
            this.storeCurrentColors();
            
            // Mobile menu opened - force remove scrolled state
            this.navbar.classList.remove('is-scrolled');
            this.updateNavbarBackground();
            
            // Apply colors based on variant
            if (this.originalVariant === 'base') {
                this.applyProjectColors(true);
            } else if (this.originalVariant === 'project-dark') {
                // For dark variant, apply dark text color when menu opens
                this.applyDarkMobileMenuColors();
            }
        } else {
            // Mobile menu closed - restore previous colors
            if (this.originalVariant === 'project-dark' && this.storedColorsBeforeMenu) {
                this.restoreStoredColors();
            }
            // Restore normal scroll behavior
            this.updateNavbarState();
        }
    }
    
    storeCurrentColors() {
        // Store the current colors before mobile menu opens
        if (!this.cachedElements) {
            this.cachedElements = {
                font: document.querySelectorAll('[project-font-color="true"]'),
                bg: document.querySelectorAll('[project-bg-color="true"]'),
                border: document.querySelectorAll('[project-border-color="true"]')
            };
        }
        
        this.storedColorsBeforeMenu = {
            font: [],
            border: []
        };
        
        // Store font colors
        this.cachedElements.font.forEach(element => {
            this.storedColorsBeforeMenu.font.push({
                element: element,
                color: window.getComputedStyle(element).color
            });
        });
        
        // Store border colors
        this.cachedElements.border.forEach(element => {
            this.storedColorsBeforeMenu.border.push({
                element: element,
                color: window.getComputedStyle(element).borderColor
            });
        });
    }
    
    restoreStoredColors() {
        // Restore the colors that were active before menu opened
        if (!this.storedColorsBeforeMenu) return;
        
        // Restore font colors
        this.storedColorsBeforeMenu.font.forEach(item => {
            item.element.style.color = item.color;
        });
        
        // Restore border colors
        this.storedColorsBeforeMenu.border.forEach(item => {
            item.element.style.borderColor = item.color;
        });
    }
    
    applyDarkMobileMenuColors() {
        // Apply dark text color (#272727) for dark variant mobile menu
        const darkColor = '#272727';
        
        // Cache selectors for better performance
        if (!this.cachedElements) {
            this.cachedElements = {
                font: document.querySelectorAll('[project-font-color="true"]'),
                bg: document.querySelectorAll('[project-bg-color="true"]'),
                border: document.querySelectorAll('[project-border-color="true"]')
            };
        }
        
        // Apply dark text color
        this.cachedElements.font.forEach(element => {
            element.style.color = darkColor;
        });
        
        // Apply dark border color
        this.cachedElements.border.forEach(element => {
            element.style.borderColor = darkColor;
        });
    }
    
    throttledScrollHandler() {
        if (!this.scrollTicking) {
            this.scrollTicking = true;
            requestAnimationFrame(() => {
                this.updateNavbarState();
                this.scrollTicking = false;
            });
        }
    }
    
    debouncedResizeHandler() {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.scrollThreshold = window.innerHeight * 0.9;
            this.updateNavbarState();
        }, 150);
    }
    
    updateNavbarState() {
        const scrollY = window.scrollY;
        const shouldBeScrolled = scrollY > this.scrollThreshold;
        
        if (shouldBeScrolled !== this.isScrolled) {
            this.isScrolled = shouldBeScrolled;
            
            // Only apply scroll animations if mobile menu is NOT open
            if (!this.isMobileMenuOpen) {
                // Always toggle the scrolled class for height/logo/width/margin/border-radius animations
                this.navbar.classList.toggle('is-scrolled', this.isScrolled);
                
                // Always update navbar background for all variants
                this.updateNavbarBackground();
                
                // Only apply color changes for Base variant
                if (this.originalVariant === 'base') {
                    this.applyProjectColors(true);
                }
            }
            
            this.dispatchNavbarStateChange();
        }
    }
    
    loadInitialThemeColor() {
        const colorHelper = document.getElementById('projectColor');
        if (!colorHelper) return;
        this.currentThemeColor = colorHelper.dataset.color;
    }
    
    applyProjectColors(forceUpdate = false) {
        if (!this.currentThemeColor || this.originalVariant !== 'base') {
            return;
        }
        
        const color = this.currentThemeColor;
        // If mobile menu is open, always use theme colors (not white)
        const shouldUseScrolledColors = this.isScrolled && !this.isMobileMenuOpen;
        const textColor = shouldUseScrolledColors ? '#ffffff' : color;
        const borderColor = shouldUseScrolledColors ? '#ffffff' : color;
        
        // Only update if colors actually changed (prevents flickering)
        if (forceUpdate || this.hasColorsChanged(textColor, borderColor)) {
            this.applyColorsToElements(color, textColor, borderColor);
            this.updateLastAppliedColors(textColor, borderColor);
        }
    }
    
    hasColorsChanged(textColor, borderColor) {
        return (
            this.lastAppliedColors.font !== textColor ||
            this.lastAppliedColors.border !== borderColor
        );
    }
    
    updateLastAppliedColors(textColor, borderColor) {
        this.lastAppliedColors.font = textColor;
        this.lastAppliedColors.border = borderColor;
    }
    
    applyColorsToElements(themeColor, textColor, borderColor) {
        // Cache selectors for better performance
        if (!this.cachedElements) {
            this.cachedElements = {
                font: document.querySelectorAll('[project-font-color="true"]'),
                bg: document.querySelectorAll('[project-bg-color="true"]'),
                border: document.querySelectorAll('[project-border-color="true"]')
            };
        }
        
        // Apply font colors
        this.cachedElements.font.forEach(element => {
            element.style.color = textColor;
        });
        
        // Apply background colors
        this.cachedElements.bg.forEach(element => {
            element.style.backgroundColor = themeColor;
        });
        
        // Apply border colors - FIXED: Don't override existing styles
        this.cachedElements.border.forEach(element => {
            // Only change the border-color property, preserve everything else
            element.style.borderColor = borderColor;
        });
        
        // Update placeholder styles
        this.updatePlaceholderStyles(textColor);
    }
    
    updateNavbarBackground() {
        if (!this.navWraps || this.navWraps.length === 0) return;
        
        // Apply background to ALL nav wraps (both desktop and mobile)
        this.navWraps.forEach(navWrap => {
            if (this.isScrolled) {
                // Use the actual background-2 color we extracted
                if (this.background2Color) {
                    navWrap.style.backgroundColor = this.background2Color;
                } else {
                    // Fallback to a dark color
                    navWrap.style.backgroundColor = '#272727';
                }
            } else {
                // Restore original background
                navWrap.style.backgroundColor = this.originalBackground || '';
            }
        });
    }
    
    updatePlaceholderStyles(color) {
        let styleElement = document.getElementById('project-placeholder-styles');
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'project-placeholder-styles';
            document.head.appendChild(styleElement);
        }
        
        if (styleElement.dataset.currentColor !== color) {
            styleElement.dataset.currentColor = color;
            styleElement.textContent = `
                [project-placeholder-color="true"]::placeholder { color: ${color} !important; }
                [project-placeholder-color="true"]::-webkit-input-placeholder { color: ${color} !important; }
            `;
        }
    }
    
    dispatchNavbarStateChange() {
        const event = new CustomEvent('navbarStateChange', {
            detail: {
                isScrolled: this.isScrolled,
                variant: this.navbar.getAttribute('data-wf--nav--variant'),
                scrollY: window.scrollY
            }
        });
        window.dispatchEvent(event);
    }
    
    destroy() {
        window.removeEventListener('scroll', this.scrollHandler);
        window.removeEventListener('resize', this.resizeHandler);
        
        // Disconnect mobile menu observer
        if (this.menuObserver) {
            this.menuObserver.disconnect();
        }
        
        this.navbar.classList.remove('is-scrolled');
    }
    
    getState() {
        return {
            isScrolled: this.isScrolled,
            isMobileMenuOpen: this.isMobileMenuOpen,
            variant: this.navbar.getAttribute('data-wf--nav--variant'),
            scrollY: window.scrollY,
            threshold: this.scrollThreshold
        };
    }
    
    setScrollThreshold(threshold) {
        this.scrollThreshold = threshold;
        this.updateNavbarState();
    }
}

// Initialization
function initializeNavbar() {
    if (window.navbarManager) {
        return;
    }
    
    try {
        window.navbarManager = new NavbarScrollManager();
    } catch (error) {
        // Silent error handling
    }
}



if (document.readyState === 'complete') {
    initializeNavbar();
} else {
    document.addEventListener('DOMContentLoaded', initializeNavbar);
}

setTimeout(initializeNavbar, 100);
window.addEventListener('load', initializeNavbar);
