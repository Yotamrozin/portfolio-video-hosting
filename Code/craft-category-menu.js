/**
 * Category Menu Slider with Centering Animation
 * Integrates with MultiInstanceTabsManager for seamless category switching
 */

class CategoryMenuSlider {
  constructor(wrapperSelector = '.category-slider-wrapper') {
    // Scope all queries to the specific wrapper
    this.wrapper = document.querySelector(wrapperSelector);
    
    if (!this.wrapper) {
      console.warn(`Category menu wrapper not found: ${wrapperSelector}`);
      return;
    }
    
    // All subsequent queries are scoped to this.wrapper
    this.slider = this.wrapper.querySelector('.category-slider');
    this.items = this.wrapper.querySelectorAll('.category-item');
    this.currentIndex = 0;
    
    if (!this.slider || this.items.length === 0) {
      console.warn('Category menu elements not found within wrapper');
      return;
    }
    
    this.init();
  }
  
  init() {
    // Set initial active state (first item)
    this.setActiveItem(0);
    
    // Add click listeners (scoped to this instance)
    this.items.forEach((item, index) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleCategoryClick(index, item);
      });
    });
    
    // Handle window resize with debouncing
    this.resizeHandler = this.debounce(() => {
      this.centerActiveItem();
    }, 100);
    
    window.addEventListener('resize', this.resizeHandler);
  }
  
  handleCategoryClick(index, item) {
    // Update active state
    this.setActiveItem(index);
    
    // Get category from data attribute or text content
    const category = item.dataset.category || item.textContent.trim();
    
    // Integrate with existing tabs system
    if (window.MultiInstanceTabsManager) {
      window.MultiInstanceTabsManager.showCategory(category);
    }
  }
  
  setActiveItem(index) {
    // Remove active from all items (scoped to this instance)
    this.items.forEach(item => {
      item.classList.remove('active');
      // Reset to default background
      item.style.backgroundColor = '';
    });
    
    // Set new active item
    const activeItem = this.items[index];
    activeItem.classList.add('active');
    
    // Apply custom color if available
    const customColor = activeItem.dataset.color;
    if (customColor) {
      activeItem.style.backgroundColor = customColor;
    }
    
    this.currentIndex = index;
    this.centerActiveItem();
  }
  
  centerActiveItem() {
    const activeItem = this.items[this.currentIndex];
    if (!activeItem) return;
    
    // Get dimensions
    const wrapperRect = this.wrapper.getBoundingClientRect();
    const activeRect = activeItem.getBoundingClientRect();
    const sliderRect = this.slider.getBoundingClientRect();
    
    // Calculate center positions
    const wrapperCenter = wrapperRect.width / 2;
    const activeCenter = activeRect.left - sliderRect.left + activeRect.width / 2;
    
    // Calculate required translation
    const translateX = wrapperCenter - activeCenter;
    
    // Apply smooth translation
    this.slider.style.transform = `translateX(${translateX}px)`;
  }
  
  // Public method to set active category from external code
  setActiveCategory(category) {
    const targetItem = Array.from(this.items).find(item => {
      const itemCategory = item.dataset.category || item.textContent.trim();
      return itemCategory.toLowerCase() === category.toLowerCase();
    });
    
    if (targetItem) {
      const index = Array.from(this.items).indexOf(targetItem);
      this.setActiveItem(index);
    }
  }
  
  // Get current active category
  getCurrentCategory() {
    const activeItem = this.items[this.currentIndex];
    return activeItem ? (activeItem.dataset.category || activeItem.textContent.trim()) : null;
  }
  
  // Utility: Debounce function for resize handler
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  // Cleanup method
  destroy() {
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.categoryMenuSlider = new CategoryMenuSlider();
  });
} else {
  window.categoryMenuSlider = new CategoryMenuSlider();
}

// Export for external access
window.CategoryMenuSlider = CategoryMenuSlider;