// Streamlined category menu for multi-instance tabs system
class CraftCategoryMenu {
  constructor() {
    this.categories = [];
    this.currentIndex = 0;
    this.currentCategory = null;
    this.slider = document.querySelector('.category-slider');
    this.categoryItems = document.querySelectorAll('.category-item');
    
    this.init();
  }
  
  async init() {
    console.log('🚀 Initializing CraftCategoryMenu for multi-instance system...');
    
    try {
      await this.loadCategoriesFromMenu();
      this.setupEventListeners();
      
      // Initialize with first category
      if (this.categories.length > 0) {
        this.selectCategory(0);
      }
      
      // Make debug method available globally
      window.debugCraftMenu = () => this.debugCurrentState();
      console.log('✅ CraftCategoryMenu initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing CraftCategoryMenu:', error);
    }
  }
  
  // Load categories from category menu items
  async loadCategoriesFromMenu() {
    console.log('📚 Loading categories from category menu...');
    
    const categorySet = new Set();
    
    // Extract from category menu items
    this.categoryItems.forEach(item => {
      const categoryName = item.getAttribute('data-category') || 
                          item.querySelector('.category-title')?.textContent.trim();
      if (categoryName) {
        categorySet.add(categoryName);
      }
    });
    
    // Convert to array and create category objects
    this.categories = Array.from(categorySet).map(name => ({
      id: name,
      name: name
    }));
    
    console.log('📚 Loaded categories:', this.categories);
  }
  
  // Select category - works with multi-instance system
  selectCategory(indexOrName) {
    let index;
    let categoryName;
    
    // Handle both index and category name
    if (typeof indexOrName === 'string') {
      categoryName = indexOrName;
      index = this.categories.findIndex(cat => cat.name === categoryName);
      if (index === -1) {
        console.warn(`Category "${categoryName}" not found`);
        return;
      }
    } else {
      index = indexOrName;
      categoryName = this.categories[index]?.name;
      
      if (index === this.currentIndex) return;
      
      console.log(`\n🎯 SELECTING CATEGORY ${index}`);
      console.log(`Previous: ${this.currentIndex} ("${this.categories[this.currentIndex]?.name}")`);
      console.log(`New: ${index} ("${categoryName}")`);
    }
    
    // Update internal state
    this.currentIndex = index;
    this.currentCategory = categoryName;
    
    // Update visual states
    this.updateActiveStates(index);
    this.updateSliderPosition();
    
    // Show the appropriate tabs component via tabsManager
    if (window.tabsManager && categoryName) {
      window.tabsManager.showCategory(categoryName);
      
      // Reset to first tab of the category
      setTimeout(() => {
        window.tabsManager.navigateToTab(categoryName, 0);
      }, 100);
    }
    
    // Update active category UI
    this.updateActiveCategoryUI(categoryName);
    
    // Trigger custom event for instagram story system
    document.dispatchEvent(new CustomEvent('categoryChanged', {
      detail: { 
        category: this.currentCategory,
        index: this.currentIndex
      }
    }));
  }
  
  // Update category menu UI
  updateActiveCategoryUI(categoryName) {
    const categoryButtons = document.querySelectorAll('[data-category-button]');
    categoryButtons.forEach(button => {
      if (button.getAttribute('data-category-button') === categoryName) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  }
  
  // Debug current state
  debugCurrentState() {
    console.log('\n🔍 === MULTI-INSTANCE DEBUG ===');
    
    console.log('\n📚 Categories:');
    this.categories.forEach((cat, index) => {
      console.log(`  ${index}: "${cat.name}"`);
    });
    
    console.log(`\n🎯 Active Category: "${this.currentCategory}" (index: ${this.currentIndex})`);
    
    // Check tabsManager integration
    if (window.tabsManager) {
      const instance = window.tabsManager.getTabsInstance(this.currentCategory);
      console.log(`\n🔗 TabsManager Integration: ${instance ? '✅ Connected' : '❌ No instance found'}`);
    } else {
      console.warn('\n⚠️ TabsManager not found');
    }
  }
  
  setupEventListeners() {
    // Add click listeners to category items
    this.categoryItems.forEach((item, index) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        console.log(`Category ${index} clicked:`, this.categories[index]);
        this.selectCategory(index);
      });
      
      item.style.cursor = 'pointer';
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.previousCategory();
      } else if (e.key === 'ArrowRight') {
        this.nextCategory();
      }
    });
    
    console.log(`🔘 Added click listeners to ${this.categoryItems.length} category items`);
  }
  
  // Visual active states for category menu
  updateActiveStates(index) {
    // Remove active class from all items
    this.categoryItems.forEach(item => {
      item.classList.remove('active');
      item.style.display = 'none';
    });
    
    // Add active class to selected item
    if (this.categoryItems[index]) {
      this.categoryItems[index].classList.add('active');
      this.categoryItems[index].style.display = 'block';
    }
    
    // Show adjacent items for slider effect
    if (this.categoryItems[index - 1]) {
      this.categoryItems[index - 1].style.display = 'block';
    }
    if (this.categoryItems[index + 1]) {
      this.categoryItems[index + 1].style.display = 'block';
    }
  }
  
  // Slider position
  updateSliderPosition() {
    if (!this.slider) return;
    
    const offset = this.currentIndex * -80;
    this.slider.style.transform = `translateX(${offset}px)`;
  }
  
  nextCategory() {
    if (this.currentIndex < this.categories.length - 1) {
      this.selectCategory(this.currentIndex + 1);
    }
  }
  
  previousCategory() {
    if (this.currentIndex > 0) {
      this.selectCategory(this.currentIndex - 1);
    }
  }
  
  getCurrentCategory() {
    return this.categories[this.currentIndex];
  }
  
  // Public method to change category by name
  changeCategoryByName(categoryName) {
    const index = this.categories.findIndex(cat => cat.name === categoryName);
    if (index !== -1) {
      this.selectCategory(index);
    } else {
      console.warn(`Category "${categoryName}" not found`);
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing CraftCategoryMenu for multi-instance system...');
  window.craftMenu = new CraftCategoryMenu();
});