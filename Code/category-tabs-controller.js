class CategoryTabsController {
    constructor() {
        this.categoryTabsPairs = new Map();
        this.categoryButtons = new Map();
    }

    init() {
        console.log('CategoryTabsController: Initializing...');
        this.setupCategoryButtonListeners();
        
        // Listen for tabs constructor completion
        document.addEventListener('tabsConstructorReady', () => {
            console.log('CategoryTabsController: Tabs constructor ready, starting pairing process');
            this.pairCategoryTabsWithButtons();
        });
        
        // Fallback: if tabs are already ready
        if (window.tabsConstructorComplete) {
            console.log('CategoryTabsController: Tabs already ready, starting pairing process');
            this.pairCategoryTabsWithButtons();
        }
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
                    });
                });
            }
        });
    }

    pairCategoryTabsWithButtons() {
        // Find all .fs-tabs elements
        const tabsElements = document.querySelectorAll('.fs-tabs');
        console.log(`CategoryTabsController: Found ${tabsElements.length} .fs-tabs elements`);

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
                    console.log(`CategoryTabsController: ✓ Paired category "${category}" with tabs and button`);
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
        
        console.log(`CategoryTabsController: Summary:`);
        console.log(`  - Total .fs-tabs found: ${tabsElements.length}`);
        console.log(`  - Total category buttons: ${buttonCategories.length}`);
        console.log(`  - Successfully paired: ${pairedCategories.length}`);
        console.log(`  - Categories with matching buttons: ${pairedCategories}`);
        console.log(`  - Categories without matching buttons: ${orphanedButtons}`);
        
        // Log all pairs
        this.categoryTabsPairs.forEach((pair, category) => {
            console.log(`CategoryTabsController: Pair "${category}":`, {
                button: pair.button,
                tabsElement: pair.tabsElement
            });
        });
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