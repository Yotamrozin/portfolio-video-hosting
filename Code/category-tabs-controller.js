class CategoryTabsController {
    constructor() {
        this.categoryTabsPairs = new Map();
        this.categoryButtons = new Map();
        this.currentActiveCategory = null;
        this.swiperObserver = null;
    }

    init() {
        console.log('CategoryTabsController: Initializing...');
        this.setupCategoryButtons();
        
        // Listen for tabs constructor completion
        document.addEventListener('tabsConstructorReady', () => {
            console.log('CategoryTabsController: 🎯 Received tabsConstructorReady event!');
            this.pairCategoryTabsWithButtons();
            this.initializeVisibility();
            this.setupSwiperActiveObserver();
        });
        
        // Fallback: if tabs are already ready
        if (window.tabsConstructorComplete) {
            console.log('CategoryTabsController: 🎯 Tabs already ready, starting pairing process');
            this.pairCategoryTabsWithButtons();
            this.initializeVisibility();
            this.setupSwiperActiveObserver();
        } else {
            console.log('CategoryTabsController: ⏳ Waiting for tabsConstructorReady event...');
        }
        
        // Fallback timeout
        setTimeout(() => {
            if (this.categoryTabsPairs.size === 0) {
                console.log('CategoryTabsController: 🔄 No pairs found, trying fallback pairing...');
                this.pairCategoryTabsWithButtons();
                this.initializeVisibility();
                this.setupSwiperActiveObserver();
            }
        }, 2000);
    }

    setupCategoryButtons() {
        const menuContainer = document.querySelector('[data-category="menu"]');
        if (!menuContainer) {
            console.error('CategoryTabsController: Menu container with data-category="menu" not found');
            return;
        }

        const categoryButtons = menuContainer.querySelectorAll('.category-item');
        console.log(`CategoryTabsController: Found ${categoryButtons.length} category buttons in menu`);

        categoryButtons.forEach((button, index) => {
            const category = button.getAttribute('data-category');
            // Removed: console.log(`CategoryTabsController: Button ${index + 1}: category="${category}", text="${button.textContent.trim()}", element:`, button);
            
            if (category) {
                this.categoryButtons.set(category, button);
            }
        });
    }

    setupSwiperActiveObserver() {
        console.log('CategoryTabsController: 🔍 Setting up Swiper active slide observer...');
        
        const swiperContainer = document.querySelector('.swiper-menu');
        if (!swiperContainer) {
            console.warn('CategoryTabsController: ⚠ Swiper container not found');
            return;
        }

        // Create MutationObserver to watch for class changes on slides
        this.swiperObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const slide = mutation.target;
                    
                    // Check if this slide became active
                    if (slide.classList.contains('swiper-slide-active')) {
                        const category = slide.getAttribute('data-category');
                        if (category && category !== this.currentActiveCategory) {
                            console.log(`CategoryTabsController: 🎯 Swiper active slide changed to category "${category}"`);
                            this.showCategory(category);
                            
                            // NEW: Apply color changes based on data-color attribute
                            this.applyMenuColors(slide);
                        }
                    }
                }
            });
        });

        // Observe all slides for class changes
        const slides = swiperContainer.querySelectorAll('.swiper-slide');
        slides.forEach(slide => {
            this.swiperObserver.observe(slide, {
                attributes: true,
                attributeFilter: ['class']
            });
        });

        console.log(`CategoryTabsController: ✅ Observing ${slides.length} slides for active state changes`);
        
        // Also check current active slide on setup
        this.checkCurrentActiveSlide();
    }

    checkCurrentActiveSlide() {
        const activeSlide = document.querySelector('.swiper-slide-active');
        if (activeSlide) {
            const category = activeSlide.getAttribute('data-category');
            if (category) {
                console.log(`CategoryTabsController: 🎯 Initial active slide category: "${category}"`);
                this.showCategory(category);
                
                // NEW: Apply initial colors
                this.applyMenuColors(activeSlide);
            }
        }
    }
    
    applyMenuColors(activeSlide) {
        const colorAttribute = activeSlide.getAttribute('data-color');
        
        if (!colorAttribute || !this.isValidHexColor(colorAttribute)) {
            console.warn(`CategoryTabsController: ⚠ Invalid or missing data-color: ${colorAttribute}`);
            return;
        }

        // Get the single .swiper-menu container
        const swiperMenu = document.querySelector('.swiper-menu');
        if (!swiperMenu) {
            console.warn('CategoryTabsController: ⚠ .swiper-menu not found');
            return;
        }

        // Apply border and font color to .swiper-menu
        swiperMenu.style.borderColor = colorAttribute;
        swiperMenu.style.color = colorAttribute;

        // Directly target the category button within the active slide
        const categoryButton = activeSlide.querySelector('.category-button');
        
        if (categoryButton) {
            // Reset all category buttons first
            const allCategoryButtons = swiperMenu.querySelectorAll('.category-button');
            allCategoryButtons.forEach(button => {
                button.style.backgroundColor = '';
                button.style.color = '';
            });
            
            // Apply background color and font color to the active category button
            categoryButton.style.backgroundColor = colorAttribute;
            categoryButton.style.color = '#272727';
            
            console.log(`CategoryTabsController: 🎨 Applied color ${colorAttribute} to swiper menu and active category button with #272727 font color`);
        } else {
            console.warn(`CategoryTabsController: ⚠ Category button not found within active slide`);
        }
    }
    
    isValidHexColor(hex) {
        // Check if it's a valid hex color (with or without #)
        const hexRegex = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        return hexRegex.test(hex);
    }

    pairCategoryTabsWithButtons() {
        console.log('CategoryTabsController: 🔍 Starting pairing process...');
        
        // Find all .fs-tabs elements
        const tabsElements = document.querySelectorAll('.fs-tabs');
        console.log(`CategoryTabsController: Found ${tabsElements.length} .fs-tabs elements`);
        
        if (tabsElements.length === 0) {
            console.warn('CategoryTabsController: ⚠ No .fs-tabs elements found! Checking for alternatives...');
            
            // Try alternative selectors
            const alternatives = [
                '[data-category]:not([data-category="menu"])',
                '.tabs-component',
                '.tab-container',
                '[class*="tab"]'
            ];
            
            alternatives.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                console.log(`CategoryTabsController: Found ${elements.length} elements with selector "${selector}"`);
                if (elements.length > 0) {
                    console.log('CategoryTabsController: Sample elements:', Array.from(elements).slice(0, 3));
                }
            });
            
            return;
        }

        tabsElements.forEach((tabsElement, index) => {
            const category = tabsElement.getAttribute('data-category');
            
            if (category) {
                const matchingButton = this.categoryButtons.get(category);
                
                if (matchingButton) {
                    this.categoryTabsPairs.set(category, {
                        tabsElement: tabsElement,
                        button: matchingButton
                    });
                } else {
                    console.warn(`CategoryTabsController: ⚠ No matching button found for tabs category "${category}"`);
                }
            } else {
                console.warn(`CategoryTabsController: ⚠ .fs-tabs element has no data-category attribute:`, tabsElement);
            }
        });

        // Simplified summary - keeping only essential info
        const pairedCategories = Array.from(this.categoryTabsPairs.keys());
        const buttonCategories = Array.from(this.categoryButtons.keys());
        const orphanedButtons = buttonCategories.filter(cat => !this.categoryTabsPairs.has(cat));
        
        console.log(`CategoryTabsController: 📊 Successfully paired ${pairedCategories.length}/${buttonCategories.length} categories`);
        if (orphanedButtons.length > 0) {
            console.warn(`CategoryTabsController: ⚠ Orphaned buttons: [${orphanedButtons.join(', ')}]`);
        }
    }

    initializeVisibility() {
        console.log('CategoryTabsController: 🎨 Initializing visibility...');
        
        if (this.categoryTabsPairs.size === 0) {
            console.warn('CategoryTabsController: ⚠ No pairs available for visibility initialization');
            return;
        }
        
        // Hide all tabs initially (this will pause their auto-advance)
        this.categoryTabsPairs.forEach((pair, category) => {
            this.hideTabsElement(pair.tabsElement);
        });
        
        console.log(`CategoryTabsController: ✅ Initialized visibility system`);
    }

    showCategory(category) {
        console.log(`CategoryTabsController: Showing category "${category}"`);
        
        if (!this.categoryTabsPairs.has(category)) {
            console.warn(`CategoryTabsController: ⚠ Category "${category}" not found in pairs`);
            console.log('CategoryTabsController: Available categories:', Array.from(this.categoryTabsPairs.keys()));
            return;
        }
        
        // Hide current active category
        if (this.currentActiveCategory && this.categoryTabsPairs.has(this.currentActiveCategory)) {
            const currentPair = this.categoryTabsPairs.get(this.currentActiveCategory);
            this.hideTabsElement(currentPair.tabsElement);
            this.removeActiveState(currentPair.button);
        }
        
        // Show new category
        const pair = this.categoryTabsPairs.get(category);
        this.showTabsElement(pair.tabsElement);
        this.addActiveState(pair.button);
        this.currentActiveCategory = category;
        console.log(`CategoryTabsController: ✅ Successfully switched to category "${category}"`);
    }

    showTabsElement(tabsElement) {
        tabsElement.style.visibility = 'visible';
        tabsElement.style.position = 'static';
        
        // Resume auto-advance for this tabs element with state reset
        if (window.TabNavigationManager) {
            window.TabNavigationManager.resumeAutoAdvanceForTabsElement(tabsElement);
        }
    }

    hideTabsElement(tabsElement) {
        tabsElement.style.visibility = 'hidden';
        tabsElement.style.position = 'absolute';
        
        // Pause auto-advance for this tabs element
        if (window.TabNavigationManager) {
            window.TabNavigationManager.pauseAutoAdvanceForTabsElement(tabsElement);
        }
    }

    addActiveState(button) {
        button.classList.add('active');
        // Removed: console.log('CategoryTabsController: ✨ Added active state to button:', button);
    }

    removeActiveState(button) {
        button.classList.remove('active');
        // Removed: console.log('CategoryTabsController: 💫 Removed active state from button:', button);
    }

    destroy() {
        if (this.swiperObserver) {
            this.swiperObserver.disconnect();
            console.log('CategoryTabsController: 🧹 Cleaned up Swiper observer');
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.CategoryTabsController = new CategoryTabsController();
        window.CategoryTabsController.init();
    });
} else {
    window.CategoryTabsController = new CategoryTabsController();
    window.CategoryTabsController.init();
}