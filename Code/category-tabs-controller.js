class CategoryTabsController {
    constructor() {
        this.categoryTabsPairs = new Map();
        this.isTabsConstructorReady = false;
        this.init();
    }

    init() {
        this.setupCategoryButtonListeners();
        this.waitForTabsConstructor();
    }

    waitForTabsConstructor() {
        // Check if tabs constructor is already ready
        if (window.tabsConstructor && window.tabsConstructor.isInitialized) {
            console.log('🎯 Tabs constructor already ready, proceeding with pairing');
            this.onTabsConstructorReady();
            return;
        }

        // Listen for the custom event
        document.addEventListener('tabsConstructorReady', (event) => {
            console.log('🎯 Received tabsConstructorReady event:', event.detail);
            this.isTabsConstructorReady = true;
            this.onTabsConstructorReady();
        }, { once: true }); // Use once: true to automatically remove listener

        console.log('⏳ Waiting for tabs constructor to finish...');
    }

    onTabsConstructorReady() {
        console.log('🚀 Tabs constructor is ready, starting category-tabs pairing');
        this.findAndPairTabsWithCategories();
    }

    setupCategoryButtonListeners() {
        // First, find the menu container
        const menuContainer = document.querySelector('[data-category="menu"]');
        
        if (!menuContainer) {
            console.error('Menu container with data-category="menu" not found!');
            return;
        }
        
        console.log('Found menu container:', menuContainer);
        
        // Now search for category buttons only within the menu
        const categoryButtons = menuContainer.querySelectorAll('.category-item');
        
        console.log(`Found ${categoryButtons.length} category buttons within menu:`, categoryButtons);
        
        categoryButtons.forEach((button, index) => {
            const category = button.getAttribute('data-category');
            
            console.log(`Button #${index} in menu:`, {
                element: button,
                category: category,
                textContent: button.textContent.trim()
            });
            
            if (category) {
                button.addEventListener('click', (e) => {
                    console.log(`\n=== Category button clicked: "${category}" ===`);
                    this.showCategory(category);
                    e.preventDefault();
                });
                
                button.addEventListener('touchstart', (e) => {
                    console.log(`\n=== Category button tapped: "${category}" ===`);
                    this.showCategory(category);
                });
            } else {
                console.warn(`Button #${index} in menu has no data-category attribute:`, button);
            }
        });
        
        if (categoryButtons.length === 0) {
            console.warn('No .category-item elements found within the menu container');
            console.log('Menu container contents:', menuContainer.innerHTML);
        }
    }

    findAndPairTabsWithCategories() {
        console.log('\n=== Finding and pairing tabs with categories ===');
        
        // Find all .fs-tabs elements
        const allTabsElements = document.querySelectorAll('.fs-tabs');
        console.log(`Found ${allTabsElements.length} .fs-tabs elements:`, allTabsElements);
        
        allTabsElements.forEach((tabsElement, index) => {
            console.log(`\nProcessing .fs-tabs #${index}:`, tabsElement);
            
            // Look for the first .fs-tab-content within this .fs-tabs
            const firstTabContent = tabsElement.querySelector('.fs-tab-content');
            
            if (firstTabContent) {
                const category = firstTabContent.getAttribute('data-category');
                console.log(`  First .fs-tab-content found with category: "${category}"`, firstTabContent);
                
                if (category) {
                    // Give the parent .fs-tabs the same data-category attribute
                    tabsElement.setAttribute('data-category', category);
                    console.log(`  ✓ Assigned data-category="${category}" to .fs-tabs #${index}`);
                    
                    // Store the pair
                    this.categoryTabsPairs.set(category, {
                        categoryButton: null, // Will be filled when we find matching button
                        tabsElement: tabsElement,
                        tabContent: firstTabContent
                    });
                } else {
                    console.warn(`  ⚠ First .fs-tab-content has no data-category attribute`);
                }
            } else {
                console.warn(`  ⚠ No .fs-tab-content found in .fs-tabs #${index}`);
            }
        });
        
        // Now match category buttons with tabs
        const menuContainer = document.querySelector('[data-category="menu"]');
        if (menuContainer) {
            const categoryButtons = menuContainer.querySelectorAll('.category-item');
            
            categoryButtons.forEach(button => {
                const category = button.getAttribute('data-category');
                if (category && this.categoryTabsPairs.has(category)) {
                    const pair = this.categoryTabsPairs.get(category);
                    pair.categoryButton = button;
                    console.log(`  ✓ Matched category button "${category}" with tabs element`);
                }
            });
        }
        
        // Log all pairs found
        console.log('\n=== All Category-Tabs Pairs Found ===');
        console.log(`Total pairs: ${this.categoryTabsPairs.size}`);
        
        this.categoryTabsPairs.forEach((pair, category) => {
            console.log(`\nCategory: "${category}"`, {
                categoryButton: pair.categoryButton,
                tabsElement: pair.tabsElement,
                tabContent: pair.tabContent,
                hasMatchingButton: !!pair.categoryButton
            });
        });
        
        // Log summary
        const categoriesWithButtons = Array.from(this.categoryTabsPairs.values()).filter(pair => pair.categoryButton).length;
        const categoriesWithoutButtons = this.categoryTabsPairs.size - categoriesWithButtons;
        
        console.log(`\n=== Summary ===`);
        console.log(`Categories with matching buttons: ${categoriesWithButtons}`);
        console.log(`Categories without matching buttons: ${categoriesWithoutButtons}`);
        
        if (categoriesWithoutButtons > 0) {
            console.warn('Some tabs have no matching category buttons:');
            this.categoryTabsPairs.forEach((pair, category) => {
                if (!pair.categoryButton) {
                    console.warn(`  - "${category}"`);
                }
            });
        }
    }

    showCategory(category) {
        if (!this.isTabsConstructorReady) {
            console.warn(`Cannot show category "${category}" - tabs constructor not ready yet`);
            return;
        }

        const pair = this.categoryTabsPairs.get(category);
        if (pair && pair.tabsElement) {
            console.log(`🎯 Showing category: "${category}"`);
            // Add your visibility logic here
        } else {
            console.warn(`No tabs found for category: "${category}"`);
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.CategoryTabsController = new CategoryTabsController();
    });
} else {
    window.CategoryTabsController = new CategoryTabsController();
}