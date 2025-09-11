class CategoryTabsController {
    constructor() {
        this.categoryTabsPairs = new Map();
        this.categoryButtons = new Map();
        this.currentActiveCategory = null;
        this.categoryOrder = []; // Track button order for Swiper sync
    }

    init() {
        console.log('CategoryTabsController: Initializing...');
        this.setupCategoryButtonListeners();
        
        // Listen for tabs constructor completion
        document.addEventListener('tabsConstructorReady', () => {
            console.log('CategoryTabsController: 🎯 Received tabsConstructorReady event!');
            this.pairCategoryTabsWithButtons();
            this.initializeVisibility();
        });
        
        // Fallback: if tabs are already ready
        if (window.tabsConstructorComplete) {
            console.log('CategoryTabsController: 🎯 Tabs already ready, starting pairing process');
            this.pairCategoryTabsWithButtons();
            this.initializeVisibility();
        } else {
            console.log('CategoryTabsController: ⏳ Waiting for tabsConstructorReady event...');
        }
        
        // Enhanced fallback with retry mechanism
        setTimeout(() => {
            if (this.categoryTabsPairs.size === 0) {
                console.log('CategoryTabsController: 🔄 No pairs found, trying fallback pairing...');
                this.pairCategoryTabsWithButtons();
                this.initializeVisibility();
            }
        }, 2000);
    }

    setupCategoryButtonListeners() {
        const menuContainer = document.querySelector('[data-category="menu"]');
        if (!menuContainer) {
            console.error('CategoryTabsController: Menu container with data-category="menu" not found');
            return;
        }

        const categoryButtons = menuContainer.querySelectorAll('.category-item');
        console.log(`CategoryTabsController: Found ${categoryButtons.length} category buttons in menu`);

        // Build category order array for Swiper synchronization
        this.categoryOrder = [];
        
        categoryButtons.forEach((button, index) => {
            const category = button.getAttribute('data-category');
            console.log(`CategoryTabsController: Button ${index + 1}: category="${category}", text="${button.textContent.trim()}", element:`, button);
            
            if (category) {
                this.categoryButtons.set(category, button);
                this.categoryOrder.push(category); // Track order for Swiper sync
                
                // Use only click events to avoid touch conflicts
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`CategoryTabsController: click on category button "${category}"`);
                    
                    // Find the slide index for this category using our order array
                    const slideIndex = this.categoryOrder.indexOf(category);
                    
                    // Move Swiper to this slide
                    if (window.mySwiper && slideIndex !== -1) {
                        console.log(`CategoryTabsController: Moving Swiper to slide ${slideIndex} for category "${category}"`);
                        window.mySwiper.slideTo(slideIndex);
                    }
                    
                    this.showCategory(category);
                });
                
                // Add passive touch listeners for better performance
                button.addEventListener('touchstart', (e) => {
                    // Just track touch start, don't prevent default
                    console.log(`CategoryTabsController: touchstart on category button "${category}"`);
                }, { passive: true });
            }
        });
        
        console.log('CategoryTabsController: Category order for Swiper sync:', this.categoryOrder);
    }

    // Method to be called by Swiper slideChange event
    handleSwiperSlideChange(realIndex) {
        console.log(`CategoryTabsController: Swiper slide changed to realIndex ${realIndex}`);
        
        if (realIndex >= 0 && realIndex < this.categoryOrder.length) {
            const category = this.categoryOrder[realIndex];
            console.log(`CategoryTabsController: Swiper realIndex ${realIndex} maps to category "${category}"`);
            
            if (category && this.categoryTabsPairs.has(category)) {
                this.showCategory(category);
            } else {
                console.warn(`CategoryTabsController: Category "${category}" not found in pairs`);
            }
        } else {
            console.warn(`CategoryTabsController: Invalid realIndex ${realIndex}, categoryOrder length: ${this.categoryOrder.length}`);
        }
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
            // Read data-category directly from .fs-tabs element
            const category = tabsElement.getAttribute('data-category');
            console.log(`CategoryTabsController: .fs-tabs ${index + 1}: category="${category}", element:`, tabsElement);
            
            if (category) {
                // Find matching category button
                const matchingButton = this.categoryButtons.get(category);
                
                if (matchingButton) {
                    this.categoryTabsPairs.set(category, {
                        tabsElement: tabsElement,
                        button: matchingButton
                    });
                    console.log(`CategoryTabsController: ✅ Paired category "${category}" with tabs and button`);
                } else {
                    console.warn(`CategoryTabsController: ⚠ No matching button found for tabs category "${category}"`);
                }
            } else {
                console.warn(`CategoryTabsController: ⚠ .fs-tabs element has no data-category attribute:`, tabsElement);
            }
        });

        // Summary
        const pairedCategories = Array.from(this.categoryTabsPairs.keys());
        const buttonCategories = Array.from(this.categoryButtons.keys());
        const orphanedButtons = buttonCategories.filter(cat => !this.categoryTabsPairs.has(cat));
        
        console.log(`CategoryTabsController: 📊 Pairing Summary:`);
        console.log(`  - Total .fs-tabs found: ${tabsElements.length}`);
        console.log(`  - Total category buttons: ${buttonCategories.length}`);
        console.log(`  - Successfully paired: ${pairedCategories.length}`);
        console.log(`  - Paired categories: [${pairedCategories.join(', ')}]`);
        console.log(`  - Button categories: [${buttonCategories.join(', ')}]`);
        console.log(`  - Orphaned buttons: [${orphanedButtons.join(', ')}]`);
        
        // Log all pairs
        this.categoryTabsPairs.forEach((pair, category) => {
            console.log(`CategoryTabsController: 🔗 Pair "${category}":`, {
                button: pair.button,
                tabsElement: pair.tabsElement
            });
        });
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
        
        // Show the first category if available (this will resume its auto-advance)
        const firstCategory = this.categoryTabsPairs.keys().next().value;
        if (firstCategory) {
            this.showCategory(firstCategory);
            console.log(`CategoryTabsController: ✅ Initialized with first category "${firstCategory}" visible`);
        }
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
        
        // Resume auto-advance for this tabs element
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
        button.classList.add('active', 'w--current');
    }

    removeActiveState(button) {
        button.classList.remove('active', 'w--current');
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