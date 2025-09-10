class CategoryTabsController {
    constructor() {
        this.categoryTabsPairs = new Map();
        this.categoryButtons = new Map();
        this.currentActiveCategory = null;
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
        
        // Additional fallback: try pairing after a delay
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

        categoryButtons.forEach((button, index) => {
            const category = button.getAttribute('data-category');
            console.log(`CategoryTabsController: Button ${index + 1}: category="${category}", text="${button.textContent.trim()}", element:`, button);
            
            if (category) {
                this.categoryButtons.set(category, button);
                
                // Add click and touch event listeners
                ['click', 'touchend'].forEach(eventType => {
                    button.addEventListener(eventType, (e) => {
                        e.preventDefault();
                        console.log(`CategoryTabsController: ${eventType} on category button "${category}"`);
                        this.showCategory(category);
                    });
                });
            }
        });
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
        
        // Hide all tabs initially
        this.categoryTabsPairs.forEach((pair, category) => {
            this.hideTabsElement(pair.tabsElement);
        });
        
        // Show the first category if available
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
        console.log('CategoryTabsController: 👁 Showing tabs element:', tabsElement);
    }

    hideTabsElement(tabsElement) {
        tabsElement.style.visibility = 'hidden';
        tabsElement.style.position = 'absolute';
        console.log('CategoryTabsController: 🙈 Hiding tabs element:', tabsElement);
    }

    addActiveState(button) {
        button.classList.add('active');
        console.log('CategoryTabsController: ✨ Added active state to button:', button);
    }

    removeActiveState(button) {
        button.classList.remove('active');
        console.log('CategoryTabsController: 💫 Removed active state from button:', button);
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