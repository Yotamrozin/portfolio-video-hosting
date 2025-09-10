(function() {
    'use strict';

    class CategoryTabsController {
        constructor() {
            this.categoryItems = [];
            this.tabsComponents = [];
            this.categoryMapping = new Map();
            this.currentActiveCategory = null;
            this.init();
        }

        init() {
            console.log('🎯 Category Tabs Controller initializing...');
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.setupController();
                });
            } else {
                this.setupController();
            }
        }

        setupController() {
            this.findElements();
            this.createCategoryMapping();
            this.setupEventListeners();
            this.setInitialState();
            
            console.log('✅ Category Tabs Controller initialized successfully!');
        }

        findElements() {
            // Find all category items
            this.categoryItems = Array.from(document.querySelectorAll('.category-item'));
            
            // Find all tabs components
            this.tabsComponents = Array.from(document.querySelectorAll('.fs-tabs'));
            
            console.log(`📋 Found ${this.categoryItems.length} category items and ${this.tabsComponents.length} tabs components`);
        }

        createCategoryMapping() {
            // Map each tabs component to its category
            this.tabsComponents.forEach((tabsComponent, index) => {
                // Find the first tab content to get the category
                const firstTabContent = tabsComponent.querySelector('.fs-tab-content');
                
                if (firstTabContent) {
                    const category = firstTabContent.getAttribute('data-category');
                    
                    if (category) {
                        this.categoryMapping.set(category, {
                            tabsComponent,
                            index,
                            category
                        });
                        
                        // Add data attribute to tabs component for easier identification
                        tabsComponent.setAttribute('data-tabs-category', category);
                        
                        console.log(`🔗 Mapped category "${category}" to tabs component ${index}`);
                    } else {
                        console.warn(`⚠️ No data-category found for tabs component ${index}`);
                    }
                } else {
                    console.warn(`⚠️ No .fs-tab-content found in tabs component ${index}`);
                }
            });
            
            console.log(`✅ Created ${this.categoryMapping.size} category mappings`);
        }

        setupEventListeners() {
            // Add click listeners to category items
            this.categoryItems.forEach((categoryItem, index) => {
                const category = categoryItem.getAttribute('data-category');
                
                if (category) {
                    categoryItem.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.showCategory(category);
                    });
                    
                    console.log(`🎯 Added click listener for category "${category}"`);
                } else {
                    console.warn(`⚠️ No data-category found for category item ${index}`);
                }
            });
        }

        setInitialState() {
            // Hide all tabs components initially
            this.tabsComponents.forEach(tabsComponent => {
                tabsComponent.style.display = 'none';
                tabsComponent.classList.remove('tabs-visible');
            });
            
            // Show the first category if available
            if (this.categoryItems.length > 0) {
                const firstCategory = this.categoryItems[0].getAttribute('data-category');
                if (firstCategory) {
                    this.showCategory(firstCategory);
                    console.log(`🎯 Initial state: Showing category "${firstCategory}"`);
                }
            }
        }

        showCategory(categoryName) {
            const categoryData = this.categoryMapping.get(categoryName);
            
            if (!categoryData) {
                console.warn(`⚠️ No tabs component found for category: "${categoryName}"`);
                return false;
            }
            
            // Hide all tabs components
            this.tabsComponents.forEach(tabsComponent => {
                tabsComponent.style.display = 'none';
                tabsComponent.classList.remove('tabs-visible');
            });
            
            // Show the target tabs component
            categoryData.tabsComponent.style.display = 'block';
            categoryData.tabsComponent.classList.add('tabs-visible');
            
            // Update active states on category items
            this.updateCategoryActiveStates(categoryName);
            
            // Update current active category
            this.currentActiveCategory = categoryName;
            
            console.log(`🔄 Category switched: Showing tabs for "${categoryName}"`);
            
            // Dispatch custom event for other systems to listen to
            document.dispatchEvent(new CustomEvent('categoryChanged', {
                detail: {
                    category: categoryName,
                    tabsComponent: categoryData.tabsComponent
                }
            }));
            
            return true;
        }

        updateCategoryActiveStates(activeCategory) {
            // Remove active class from all category items
            this.categoryItems.forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to the selected category item
            this.categoryItems.forEach(item => {
                const category = item.getAttribute('data-category');
                if (category === activeCategory) {
                    item.classList.add('active');
                }
            });
        }

        // Public API methods
        getCurrentCategory() {
            return this.currentActiveCategory;
        }

        getAvailableCategories() {
            return Array.from(this.categoryMapping.keys());
        }

        getCategoryData(categoryName) {
            return this.categoryMapping.get(categoryName) || null;
        }

        // Debug method
        debug() {
            console.group('🔍 Category Tabs Controller Debug');
            console.log('Current Active Category:', this.currentActiveCategory);
            console.log('Available Categories:', this.getAvailableCategories());
            console.log('Category Mapping:', this.categoryMapping);
            console.log('Category Items:', this.categoryItems);
            console.log('Tabs Components:', this.tabsComponents);
            console.groupEnd();
        }

        // Cleanup method
        destroy() {
            // Remove event listeners
            this.categoryItems.forEach(item => {
                const newItem = item.cloneNode(true);
                item.parentNode.replaceChild(newItem, item);
            });
            
            // Clear references
            this.categoryItems = [];
            this.tabsComponents = [];
            this.categoryMapping.clear();
            this.currentActiveCategory = null;
            
            console.log('🧹 Category Tabs Controller cleaned up');
        }
    }

    // Initialize the controller
    const categoryTabsController = new CategoryTabsController();

    // Make it globally accessible
    window.CategoryTabsController = categoryTabsController;

    console.log('📱 Category Tabs Controller script loaded');
})();