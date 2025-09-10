class CategoryTabsController {
    constructor() {
        this.init();
    }

    init() {
        this.setupCategoryButtonListeners();
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
                    e.preventDefault();
                });
                
                button.addEventListener('touchstart', (e) => {
                    console.log(`\n=== Category button tapped: "${category}" ===`);
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
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.CategoryTabsController = new CategoryTabsController();
    });
} else {
    window.CategoryTabsController = new CategoryTabsController();
}