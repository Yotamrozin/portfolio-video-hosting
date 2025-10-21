/**
 * Lazy Loading System for Mobile/Desktop Sections
 * 
 * This system prevents unnecessary HTML from loading on different devices,
 * improving performance by only loading content relevant to the current device.
 * 
 * Usage:
 * 1. Add data-lazy-load="mobile" or data-lazy-load="desktop" to sections
 * 2. Add data-lazy-source="/path/to/content.html" for external content
 * 3. The system will automatically load appropriate content based on device type
 */

class LazyLoadingSystem {
    constructor() {
        this.loadedSections = new Set();
        this.observer = null;
        this.config = {
            mobileBreakpoint: 768,
            loadDelay: 100, // ms delay before loading content
            placeholderClass: 'lazy-placeholder',
            loadingClass: 'lazy-loading',
            loadedClass: 'lazy-loaded',
            errorClass: 'lazy-error'
        };
        
        this.isMobile = this.detectMobile();
        this.init();
    }

    /**
     * Detect if the current device is mobile
     */
    detectMobile() {
        // Check multiple conditions for mobile detection
        const isMobileWidth = window.innerWidth <= this.config.mobileBreakpoint;
        const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        return isMobileWidth || (isMobileUserAgent && isTouchDevice);
    }

    /**
     * Initialize the lazy loading system
     */
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupLazyLoading());
        } else {
            this.setupLazyLoading();
        }

        // Handle window resize to re-evaluate device type
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const wasMobile = this.isMobile;
                this.isMobile = this.detectMobile();
                
                // If device type changed, reload sections
                if (wasMobile !== this.isMobile) {
                    this.reloadSections();
                }
            }, 250);
        });
    }

    /**
     * Setup lazy loading for all sections
     */
    setupLazyLoading() {
        const sections = document.querySelectorAll('[data-lazy-load]');
        
        if (sections.length === 0) {
            console.log('LazyLoadingSystem: No sections with data-lazy-load found');
            return;
        }

        // Process each section
        sections.forEach(section => {
            this.processSection(section);
        });

        // Setup intersection observer for scroll-based loading
        this.setupIntersectionObserver();
    }

    /**
     * Process a single section for lazy loading
     */
    processSection(section) {
        const loadType = section.getAttribute('data-lazy-load');
        const source = section.getAttribute('data-lazy-source');
        const sectionId = section.id || `section-${Math.random().toString(36).substr(2, 9)}`;
        
        // Add placeholder if not already present
        if (!section.querySelector(`.${this.config.placeholderClass}`)) {
            this.addPlaceholder(section);
        }

        // Determine if this section should load based on device type
        const shouldLoad = this.shouldLoadSection(loadType);
        
        if (shouldLoad) {
            // Load content immediately or on scroll
            const loadOnScroll = section.hasAttribute('data-lazy-scroll');
            
            if (loadOnScroll) {
                this.addToObserver(section);
            } else {
                this.loadSectionContent(section, source);
            }
        } else {
            // Hide section for this device type
            this.hideSection(section);
        }
    }

    /**
     * Determine if a section should load based on device type
     */
    shouldLoadSection(loadType) {
        switch (loadType) {
            case 'mobile':
                return this.isMobile;
            case 'desktop':
                return !this.isMobile;
            case 'both':
                return true;
            default:
                console.warn(`LazyLoadingSystem: Unknown load type "${loadType}"`);
                return true;
        }
    }

    /**
     * Add placeholder content to a section
     */
    addPlaceholder(section) {
        const placeholder = document.createElement('div');
        placeholder.className = this.config.placeholderClass;
        placeholder.innerHTML = `
            <div class="lazy-skeleton">
                <div class="skeleton-line skeleton-title"></div>
                <div class="skeleton-line skeleton-text"></div>
                <div class="skeleton-line skeleton-text"></div>
                <div class="skeleton-line skeleton-short"></div>
            </div>
        `;
        
        // Add skeleton styles if not already present
        this.addSkeletonStyles();
        
        section.appendChild(placeholder);
    }

    /**
     * Add skeleton loading styles
     */
    addSkeletonStyles() {
        if (document.getElementById('lazy-skeleton-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'lazy-skeleton-styles';
        styles.textContent = `
            .lazy-placeholder {
                opacity: 0.7;
                transition: opacity 0.3s ease;
            }
            
            .lazy-skeleton {
                padding: 20px;
            }
            
            .skeleton-line {
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: skeleton-loading 1.5s infinite;
                border-radius: 4px;
                margin-bottom: 10px;
                height: 20px;
            }
            
            .skeleton-title {
                width: 60%;
                height: 24px;
            }
            
            .skeleton-text {
                width: 100%;
            }
            
            .skeleton-short {
                width: 40%;
            }
            
            @keyframes skeleton-loading {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
            
            .lazy-loading .lazy-placeholder {
                opacity: 1;
            }
            
            .lazy-loaded .lazy-placeholder {
                opacity: 0;
                pointer-events: none;
            }
            
            .lazy-error {
                padding: 20px;
                text-align: center;
                color: #666;
                font-style: italic;
            }
        `;
        
        document.head.appendChild(styles);
    }

    /**
     * Load content for a section
     */
    async loadSectionContent(section, source) {
        if (this.loadedSections.has(section)) return;
        
        section.classList.add(this.config.loadingClass);
        this.loadedSections.add(section);
        
        try {
            let content;
            
            if (source) {
                // Load external content
                content = await this.fetchExternalContent(source);
            } else {
                // Use inline content (already in HTML)
                content = this.extractInlineContent(section);
            }
            
            // Add delay for better UX
            await this.delay(this.config.loadDelay);
            
            // Replace placeholder with actual content
            this.replacePlaceholder(section, content);
            
            section.classList.remove(this.config.loadingClass);
            section.classList.add(this.config.loadedClass);
            
            // Dispatch custom event
            section.dispatchEvent(new CustomEvent('lazyLoaded', {
                detail: { section, content, source }
            }));
            
        } catch (error) {
            console.error('LazyLoadingSystem: Error loading section content:', error);
            this.showError(section, error);
        }
    }

    /**
     * Fetch external content
     */
    async fetchExternalContent(source) {
        const response = await fetch(source);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch content: ${response.status} ${response.statusText}`);
        }
        
        return await response.text();
    }

    /**
     * Extract inline content from section
     */
    extractInlineContent(section) {
        // Look for content within the section that's not the placeholder
        const contentElements = section.querySelectorAll(':not(.lazy-placeholder)');
        return Array.from(contentElements).map(el => el.outerHTML).join('');
    }

    /**
     * Replace placeholder with actual content
     */
    replacePlaceholder(section, content) {
        const placeholder = section.querySelector(`.${this.config.placeholderClass}`);
        
        if (placeholder) {
            placeholder.style.opacity = '0';
            
            setTimeout(() => {
                placeholder.innerHTML = content;
                placeholder.style.opacity = '1';
            }, 150);
        } else {
            section.innerHTML = content;
        }
    }

    /**
     * Show error state
     */
    showError(section, error) {
        section.classList.remove(this.config.loadingClass);
        section.classList.add(this.config.errorClass);
        
        const placeholder = section.querySelector(`.${this.config.placeholderClass}`);
        if (placeholder) {
            placeholder.innerHTML = `
                <div class="lazy-error">
                    <p>Content failed to load</p>
                    <small>${error.message}</small>
                </div>
            `;
        }
    }

    /**
     * Hide section for current device type
     */
    hideSection(section) {
        section.style.display = 'none';
        section.setAttribute('data-lazy-hidden', 'true');
    }

    /**
     * Setup intersection observer for scroll-based loading
     */
    setupIntersectionObserver() {
        if (this.observer) return;
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const section = entry.target;
                    const source = section.getAttribute('data-lazy-source');
                    this.loadSectionContent(section, source);
                    this.observer.unobserve(section);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });
    }

    /**
     * Add section to intersection observer
     */
    addToObserver(section) {
        if (this.observer) {
            this.observer.observe(section);
        }
    }

    /**
     * Reload sections when device type changes
     */
    reloadSections() {
        const sections = document.querySelectorAll('[data-lazy-load]');
        
        sections.forEach(section => {
            // Reset section state
            section.classList.remove(this.config.loadingClass, this.config.loadedClass, this.config.errorClass);
            section.removeAttribute('data-lazy-hidden');
            section.style.display = '';
            
            // Remove from loaded sections
            this.loadedSections.delete(section);
            
            // Re-process section
            this.processSection(section);
        });
    }

    /**
     * Utility function for delays
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Public method to manually load a section
     */
    loadSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section && section.hasAttribute('data-lazy-load')) {
            const source = section.getAttribute('data-lazy-source');
            this.loadSectionContent(section, source);
        }
    }

    /**
     * Public method to reload all sections
     */
    reload() {
        this.reloadSections();
    }

    /**
     * Get current device type
     */
    getDeviceType() {
        return this.isMobile ? 'mobile' : 'desktop';
    }
}

// Auto-initialize the system
const lazyLoadingSystem = new LazyLoadingSystem();

// Export for manual use
window.LazyLoadingSystem = LazyLoadingSystem;
window.lazyLoadingSystem = lazyLoadingSystem;

// Example usage and documentation
console.log(`
LazyLoadingSystem initialized!

Usage Examples:

1. Mobile-only section:
   <div id="mobileProjects" data-lazy-load="mobile">
     <!-- Mobile content here -->
   </div>

2. Desktop-only section:
   <div id="craftMobile" data-lazy-load="desktop">
     <!-- Desktop content here -->
   </div>

3. External content loading:
   <div data-lazy-load="mobile" data-lazy-source="/mobile-content.html">
     <!-- Placeholder content -->
   </div>

4. Scroll-based loading:
   <div data-lazy-load="desktop" data-lazy-scroll>
     <!-- Content loads when scrolled into view -->
   </div>

Current device type: ${lazyLoadingSystem.getDeviceType()}
`);
