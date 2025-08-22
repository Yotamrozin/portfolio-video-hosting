// Navbar Scroll Animation and Color Management System - Fixed Version 4
class NavbarScrollManager {
    constructor() {
        this.navbar = document.querySelector('.nav_1_component');
        this.scrollThreshold = window.innerHeight * 0.9;
        this.isScrolled = false;
        this.currentThemeColor = null;
        this.originalVariant = null;
        this.originalBackground = null;
        this.background2Color = null;
        
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
        
        // Store the original variant and background
        this.originalVariant = this.navbar.getAttribute('data-wf--nav--variant') || 'base';
        this.originalBackground = this.getComputedBackground();
        
        // Get the actual background-2 color from the div
        this.background2Color = this.getBackground2Color();
        

        
        // Set up event listeners for all variants (height/logo animations)
        this.setupEventListeners();
        
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
        const navWrap = this.navbar.querySelector('.nav_1_wrap');
        if (navWrap) {
            const computedStyle = window.getComputedStyle(navWrap);
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
            
            // Always toggle the scrolled class for height/logo animations
            this.navbar.classList.toggle('is-scrolled', this.isScrolled);
            
            // Only apply color changes for Base variant
            if (this.originalVariant === 'base') {
                this.applyProjectColors(true);
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
        const textColor = this.isScrolled ? '#ffffff' : color;
        const borderColor = this.isScrolled ? '#ffffff' : color;
        
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
        
        // Update navbar background
        this.updateNavbarBackground();
    }
    
    updateNavbarBackground() {
        const navWrap = this.navbar.querySelector('.nav_1_wrap');
        if (!navWrap) return;
        
        if (this.isScrolled) {
            // Use the actual background-2 color we extracted
            if (this.background2Color) {
                navWrap.style.backgroundColor = this.background2Color;
            } else {
                // Fallback to a dark color
                navWrap.style.backgroundColor = '#1a1a1a';
            }
        } else {
            // Restore original background
            navWrap.style.backgroundColor = this.originalBackground || '';
        }
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
        
        this.navbar.classList.remove('is-scrolled');
    }
    
    getState() {
        return {
            isScrolled: this.isScrolled,
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