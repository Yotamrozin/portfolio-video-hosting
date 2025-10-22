/**
 * Simple Lazy Loading System
 * 
 * A lightweight system that loads mobile/desktop content based on scroll position
 * and device type, following the recommended pattern.
 */

class SimpleLazyLoader {
    constructor() {
        this.isMobile = window.innerWidth <= 768;
        this.loadedSections = new Set();
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupScrollListener());
        } else {
            this.setupScrollListener();
        }

        // Handle window resize
        window.addEventListener('resize', () => {
            this.isMobile = window.innerWidth <= 768;
        });
    }

    setupScrollListener() {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                this.loadSections();
            }
        });
    }

    loadSections() {
        // Find all sections with data-lazy-load attribute
        const sections = document.querySelectorAll('[data-lazy-load]');
        
        sections.forEach(section => {
            const loadType = section.getAttribute('data-lazy-load');
            const sectionId = section.id || `section-${Math.random().toString(36).substr(2, 9)}`;
            
            // Only load if it matches current device type and hasn't been loaded yet
            if (this.shouldLoadSection(loadType) && !this.loadedSections.has(sectionId)) {
                this.loadSection(section, loadType);
            }
        });
    }

    shouldLoadSection(loadType) {
        switch (loadType) {
            case 'mobile':
                return this.isMobile;
            case 'desktop':
                return !this.isMobile;
            case 'both':
                return true;
            default:
                return false;
        }
    }

    loadSection(element, type) {
        const sectionId = element.id;
        this.loadedSections.add(sectionId);
        
        // Add loading class
        element.classList.add('loading');
        
        // Simulate content loading (replace with actual content source)
        const contentSource = this.getContentSource(type);
        
        if (contentSource) {
            // Load external content
            fetch(contentSource)
                .then(response => response.text())
                .then(html => {
                    element.innerHTML = html;
                    element.classList.remove('loading');
                    element.classList.add('loaded');
                })
                .catch(error => {
                    console.error(`Failed to load ${type} content:`, error);
                    element.innerHTML = `<p>Content failed to load</p>`;
                    element.classList.remove('loading');
                    element.classList.add('error');
                });
        } else {
            // Use inline content (already in HTML)
            element.classList.remove('loading');
            element.classList.add('loaded');
        }
    }

    getContentSource(type) {
        // Return the path to your content files
        // Return null to use inline content instead
        switch (type) {
            case 'mobile':
                return '/mobile-projects-content.html'; // Replace with your actual path
            case 'desktop':
                return '/craft-mobile-content.html'; // Replace with your actual path
            default:
                return null;
        }
    }
}

// Auto-initialize
const simpleLazyLoader = new SimpleLazyLoader();

// Export for manual use
window.SimpleLazyLoader = SimpleLazyLoader;
window.simpleLazyLoader = simpleLazyLoader;

console.log('Simple Lazy Loader initialized!');
console.log('Current device:', simpleLazyLoader.isMobile ? 'mobile' : 'desktop');
