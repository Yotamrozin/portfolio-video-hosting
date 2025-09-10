class CategoryTabsController {
    constructor() {
        this.categoryMapping = new Map();
        this.init();
    }

    init() {
        this.createCategoryMapping();
        this.setupCategoryButtonListeners();
        this.hideAllTabs();
        this.showInitialCategory();
    }

    createCategoryMapping() {
        // Find all tabs components
        const tabsComponents = document.querySelectorAll('.fs-tabs');
        console.log(`Found ${tabsComponents.length} tabs components:`, tabsComponents);
        
        tabsComponents.forEach((tabsComponent, index) => {
            // Get category from data attribute or tab content
            let category = tabsComponent.getAttribute('data-category');
            
            if (!category) {
                const tabContent = tabsComponent.querySelector('.fs-tab-content');
                if (tabContent) {
                    category = tabContent.getAttribute('data-category');
                }
            }
            
            if (category) {
                this.categoryMapping.set(category, tabsComponent);
                console.log(`Mapped category "${category}" to tabs component #${index}:`, {
                    element: tabsComponent,
                    id: tabsComponent.id || 'no-id',
                    classes: tabsComponent.className
                });
            } else {
                console.warn(`Tabs component #${index} found without category:`, tabsComponent);
            }
        });
        
        console.log('Final category mapping:', this.categoryMapping);
    }

    setupCategoryButtonListeners() {
        // Find all category buttons/slides in the slider
        const categorySlides = document.querySelectorAll('.category-slider-wrapper .swiper-slide, .category-slider-wrapper .category-slide');
        
        console.log(`Found ${categorySlides.length} category buttons:`, categorySlides);
        
        categorySlides.forEach((slide, index) => {
            // Try to get category from various possible attributes
            let category = slide.getAttribute('data-category') || 
                          slide.textContent.trim() ||
                          slide.querySelector('[data-category]')?.getAttribute('data-category');
            
            console.log(`Category button #${index}:`, {
                element: slide,
                category: category,
                textContent: slide.textContent.trim()
            });
            
            if (category) {
                slide.addEventListener('click', (e) => {
                    console.log(`\n=== Category button clicked: "${category}" ===`);
                    e.preventDefault();
                    this.showCategory(category);
                });
            }
        });
    }

    showCategory(categoryName) {
        console.log(`\n=== showCategory called with: "${categoryName}" ===`);
        const tabsComponent = this.categoryMapping.get(categoryName);
        
        if (!tabsComponent) {
            console.warn(`No tabs component found for category: '${categoryName}'`);
            console.log('Available categories:', Array.from(this.categoryMapping.keys()));
            return;
        }

        console.log('Found tabs component for category:', {
            category: categoryName,
            element: tabsComponent
        });

        // Hide all tabs components
        this.hideAllTabs();
        
        // Show the target tabs component
        this.showTabsComponent(tabsComponent);
        
        console.log(`=== End showCategory for "${categoryName}" ===\n`);
    }

    hideAllTabs() {
        console.log('Hiding all tabs components...');
        this.categoryMapping.forEach((tabsComponent, category) => {
            this.hideTabsComponent(tabsComponent);
        });
    }

    showTabsComponent(tabsComponent) {
        tabsComponent.style.visibility = 'visible';
        tabsComponent.style.pointerEvents = 'auto';
        tabsComponent.style.position = 'relative';
        console.log('Applied show styles to tabs component');
    }

    hideTabsComponent(tabsComponent) {
        tabsComponent.style.visibility = 'hidden';
        tabsComponent.style.pointerEvents = 'none';
        tabsComponent.style.position = 'absolute';
    }

    showInitialCategory() {
        // Show the first category by default
        const firstCategory = this.categoryMapping.keys().next().value;
        if (firstCategory) {
            console.log(`Setting initial category to: "${firstCategory}"`);
            this.showCategory(firstCategory);
        }
    }

    getAvailableCategories() {
        return Array.from(this.categoryMapping.keys());
    }

    destroy() {
        this.categoryMapping.clear();
        console.log('CategoryTabsController destroyed');
    }
}

// Initialize and expose globally
const categoryTabsController = new CategoryTabsController();
window.CategoryTabsController = categoryTabsController;
window.tabsManager = categoryTabsController;
window.MultiInstanceTabsManager = categoryTabsController;

// Add debug function to test manually
window.debugShowCategory = (categoryName) => {
    console.log(`\n=== Manual Debug Test for "${categoryName}" ===`);
    categoryTabsController.showCategory(categoryName);
};
