/**
 * Simplified Category Menu Slider
 * Robust centering without off-screen sliding issues
 */

class CategoryMenuSlider {
  constructor(wrapperSelector = '.category-slider-wrapper') {
    this.wrapper = document.querySelector(wrapperSelector);
    
    if (!this.wrapper) {
      console.warn(`Category menu wrapper not found: ${wrapperSelector}`);
      return;
    }
    
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
    // Set initial active state
    this.setActiveItem(0);
    
    // Add click listeners
    this.items.forEach((item, index) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleCategoryClick(index, item);
      });
    });
    
    // Handle resize with debouncing
    this.resizeHandler = this.debounce(() => {
      this.centerActiveItem();
    }, 100);
    
    window.addEventListener('resize', this.resizeHandler);
  }
  
  handleCategoryClick(index, item) {
    this.setActiveItem(index);
    
    // Get category from data attribute or text content
    const category = item.dataset.category || item.textContent.trim();
    
    // Integrate with existing tabs system
    if (window.MultiInstanceTabsManager) {
      window.MultiInstanceTabsManager.showCategory(category);
    }
  }
  
  setActiveItem(index) {
    // Remove active from all items
    this.items.forEach(item => {
      item.classList.remove('active');
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

    const wrapperWidth = this.wrapper.offsetWidth;
    const sliderWidth = this.slider.scrollWidth;
    
    // If slider fits within wrapper, no need to move
    if (sliderWidth <= wrapperWidth) {
      this.applyTransform(0);
      return;
    }
    
    // Calculate item's center position
    const itemLeft = activeItem.offsetLeft;
    const itemWidth = activeItem.offsetWidth;
    const itemCenter = itemLeft + (itemWidth / 2);
    
    // Calculate ideal centering position
    const wrapperCenter = wrapperWidth / 2;
    const idealTranslateX = wrapperCenter - itemCenter;
    
    // Calculate bounds - keep some content visible at edges
    const maxTranslateX = 0; // Don't move past the start
    const minTranslateX = wrapperWidth - sliderWidth; // Don't move past the end
    
    // Apply smart bounds checking
    let finalTranslateX;
    
    if (idealTranslateX > maxTranslateX) {
      // Item is near the beginning, stick to start
      finalTranslateX = maxTranslateX;
    } else if (idealTranslateX < minTranslateX) {
      // Item is near the end, stick to end
      finalTranslateX = minTranslateX;
    } else {
      // Item can be centered
      finalTranslateX = idealTranslateX;
    }
    
    console.log('🎯 Centering calculation:', {
      activeItem: activeItem.textContent?.trim(),
      wrapperWidth,
      sliderWidth,
      itemCenter,
      idealTranslateX,
      finalTranslateX,
      bounds: { min: minTranslateX, max: maxTranslateX }
    });
    
    this.applyTransform(finalTranslateX);
  }
  
  applyTransform(translateX) {
    // Smooth CSS transition
    this.slider.style.transition = 'transform 0.3s ease-out';
    this.slider.style.transform = `translateX(${translateX}px)`;
    
    // Remove transition after animation completes to prevent interference
    setTimeout(() => {
      this.slider.style.transition = '';
    }, 300);
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
  
  // Debug method
  debug() {
    const activeItem = this.items[this.currentIndex];
    if (!activeItem) return;
    
    const wrapperWidth = this.wrapper.offsetWidth;
    const sliderWidth = this.slider.scrollWidth;
    const currentTransform = this.slider.style.transform;
    
    console.group('🔍 Category Menu Debug');
    console.log('Container:', { wrapperWidth, sliderWidth });
    console.log('Active Item:', {
      index: this.currentIndex,
      text: activeItem.textContent.trim(),
      offsetLeft: activeItem.offsetLeft,
      offsetWidth: activeItem.offsetWidth
    });
    console.log('Current Transform:', currentTransform);
    console.groupEnd();
  }
  
  // Utility: Debounce function
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