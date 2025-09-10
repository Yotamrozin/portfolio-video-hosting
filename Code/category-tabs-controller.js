class CategoryTabsController {
    constructor() {
        this.categoryMapping = new Map();
        this.init();
    }

    init() {
        this.createCategoryMapping();
        this.hideAllTabs();
        this.showInitialCategory();
    }

    createCategoryMapping() {
        // Find all tabs components
        const tabsComponents = document.querySelectorAll('.fs-tabs');
        
        tabsComponents.forEach(tabsComponent => {
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
                console.log(`Mapped category "${category}" to tabs component`);
            } else {
                console.warn('Tabs component found without category:', tabsComponent);
            }
        });
    }

    showCategory(categoryName) {
        const tabsComponent = this.categoryMapping.get(categoryName);
        
        if (!tabsComponent) {
            console.warn(`No tabs component found for category: '${categoryName}'`);
            return;
        }

        // Hide all tabs components
        this.hideAllTabs();
        
        // Show the target tabs component
        this.showTabsComponent(tabsComponent);
        
        console.log(`Showing category: ${categoryName}`);
    }

    hideAllTabs() {
        this.categoryMapping.forEach(tabsComponent => {
            this.hideTabsComponent(tabsComponent);
        });
    }

    showTabsComponent(tabsComponent) {
        tabsComponent.style.visibility = 'visible';
        tabsComponent.style.pointerEvents = 'auto';
        tabsComponent.style.position = 'relative';
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
window.tabsManager = categoryTabsController; // For compatibility with craft-category-menu.js