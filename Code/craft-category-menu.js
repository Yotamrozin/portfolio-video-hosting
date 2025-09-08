/**
 * Category Menu Slider - Scroll-Based Approach
 * Uses scrollIntoView for natural horizontal navigation
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
    // Ensure wrapper can scroll
    this.wrapper.style.overflowX = 'hidden'; // Still hidden for transform approach
    
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
    
    // If slider fits within wrapper, center it naturally
    if (sliderWidth <= wrapperWidth) {
      this.applyTransform(0);
      return;
    }
    
    // Calculate positions
    let itemLeft = 0;
    for (let i = 0; i < this.currentIndex; i++) {
      itemLeft += this.items[i].offsetWidth;
    }
    
    const itemWidth = activeItem.offsetWidth;
    const itemCenter = itemLeft + (itemWidth / 2);
    const wrapperCenter = wrapperWidth / 2;
    
    // NEW APPROACH: Progressive positioning based on item location
    let targetTransform;
    
    const maxScroll = sliderWidth - wrapperWidth;
    const itemProgress = itemCenter / sliderWidth; // 0 to 1
    
    if (itemProgress <= 0.2) {
      // First 20% of items - stay at beginning
      targetTransform = 0;
    } else if (itemProgress >= 0.8) {
      // Last 20% of items - show the end
      targetTransform = -maxScroll;
    } else {
      // Middle items - use proportional scrolling
      const scrollProgress = (itemProgress - 0.2) / 0.6; // Normalize to 0-1
      targetTransform = -scrollProgress * maxScroll;
    }
    
    console.log('🎯 Progressive centering:', {
      activeItem: activeItem.textContent?.trim(),
      wrapperWidth,
      sliderWidth,
      itemCenter,
      itemProgress: (itemProgress * 100).toFixed(1) + '%',
      targetTransform,
      maxScroll: -maxScroll
    });
    
    this.applyTransform(targetTransform);
  }
  
  applyTransform(translateX) {
    // Smooth CSS transition
    this.slider.style.transition = 'transform 0.4s ease-out';
    this.slider.style.transform = `translateX(${translateX}px)`;
    
    // Remove transition after animation completes
    setTimeout(() => {
      this.slider.style.transition = '';
    }, 400);
  }
  
  // Alternative method: Try scroll-based approach
  centerActiveItemScroll() {
    const activeItem = this.items[this.currentIndex];
    if (!activeItem) return;
    
    // Temporarily enable scrolling
    this.wrapper.style.overflowX = 'auto';
    
    // Use scrollIntoView for natural centering
    activeItem.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    });
    
    // Re-hide scrollbar after animation
    setTimeout(() => {
      this.wrapper.style.overflowX = 'hidden';
    }, 500);
  }
  
  // Public method to set active category
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
  
  // Switch between transform and scroll approaches
  useScrollMethod() {
    console.log('🔄 Switching to scroll-based centering');
    this.centerActiveItem = this.centerActiveItemScroll;
    this.centerActiveItem();
  }
  
  // Debug method
  debug() {
    const activeItem = this.items[this.currentIndex];
    if (!activeItem) return;
    
    console.group('🔍 Category Menu Debug');
    console.log('Container:', { 
      wrapperWidth: this.wrapper.offsetWidth, 
      sliderWidth: this.slider.scrollWidth 
    });
    console.log('Active Item:', {
      index: this.currentIndex,
      text: activeItem.textContent.trim(),
      offsetLeft: activeItem.offsetLeft,
      offsetWidth: activeItem.offsetWidth
    });
    console.log('Current Transform:', this.slider.style.transform);
    console.groupEnd();
  }
  
  // Test both methods
  testBothMethods() {
    console.log('🧪 Testing transform method...');
    this.centerActiveItem();
    
    setTimeout(() => {
      console.log('🧪 Testing scroll method...');
      this.useScrollMethod();
    }, 2000);
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