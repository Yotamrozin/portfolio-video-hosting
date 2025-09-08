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
    
    // Get dimensions using offsetLeft/offsetWidth for more accurate positioning
    const wrapperWidth = this.wrapper.offsetWidth;
    const sliderWidth = this.slider.offsetWidth;
    
    // Calculate active item position relative to slider
    const activeItemLeft = activeItem.offsetLeft;
    const activeItemWidth = activeItem.offsetWidth;
    const activeItemCenter = activeItemLeft + (activeItemWidth / 2);
    
    // Calculate wrapper center
    const wrapperCenter = wrapperWidth / 2;
    
    // Calculate required translation to center the active item
    const translateX = wrapperCenter - activeItemCenter;
    
    // Ensure we don't slide too far (optional bounds checking)
    const maxTranslate = 0; // Don't slide past the start
    const minTranslate = wrapperWidth - sliderWidth; // Don't slide past the end
    
    const boundedTranslateX = Math.max(minTranslate, Math.min(maxTranslate, translateX));
    
    // Apply smooth translation
    this.slider.style.transform = `translateX(${boundedTranslateX}px)`;
    this.slider.style.transition = 'transform 0.3s ease';
  }

  // === DEBUG METHODS ===
  
  // Comprehensive debug method
  debugCentering() {
    const activeItem = this.items[this.currentIndex];
    if (!activeItem) {
      console.log('❌ No active item found');
      return;
    }
    
    // Get all measurements
    const wrapperRect = this.wrapper.getBoundingClientRect();
    const sliderRect = this.slider.getBoundingClientRect();
    const itemRect = activeItem.getBoundingClientRect();
    
    const wrapperWidth = this.wrapper.offsetWidth;
    const sliderWidth = this.slider.offsetWidth;
    const activeItemLeft = activeItem.offsetLeft;
    const activeItemWidth = activeItem.offsetWidth;
    const activeItemCenter = activeItemLeft + (activeItemWidth / 2);
    const wrapperCenter = wrapperWidth / 2;
    const translateX = wrapperCenter - activeItemCenter;
    
    const maxTranslate = 0;
    const minTranslate = wrapperWidth - sliderWidth;
    const boundedTranslateX = Math.max(minTranslate, Math.min(maxTranslate, translateX));
    
    console.group('🔍 Category Menu Debug Info');
    console.log('📏 Container Measurements:', {
      wrapperWidth,
      wrapperHeight: this.wrapper.offsetHeight,
      wrapperCenter,
      sliderWidth,
      sliderHeight: this.slider.offsetHeight
    });
    
    console.log('🎯 Active Item Info:', {
      currentIndex: this.currentIndex,
      itemText: activeItem.textContent.trim(),
      activeItemLeft,
      activeItemWidth,
      activeItemCenter,
      itemDataColor: activeItem.dataset.color || 'none'
    });
    
    console.log('📐 Positioning Calculations:', {
      translateX,
      boundedTranslateX,
      maxTranslate,
      minTranslate,
      currentTransform: this.slider.style.transform
    });
    
    console.log('📍 Bounding Rectangles:', {
      wrapper: { x: wrapperRect.x, y: wrapperRect.y, width: wrapperRect.width, height: wrapperRect.height },
      slider: { x: sliderRect.x, y: sliderRect.y, width: sliderRect.width, height: sliderRect.height },
      activeItem: { x: itemRect.x, y: itemRect.y, width: itemRect.width, height: itemRect.height }
    });
    
    console.log('🎨 CSS Styles:', {
      wrapperPosition: getComputedStyle(this.wrapper).position,
      wrapperOverflow: getComputedStyle(this.wrapper).overflow,
      sliderPosition: getComputedStyle(this.slider).position,
      sliderTransform: getComputedStyle(this.slider).transform,
      itemPosition: getComputedStyle(activeItem).position
    });
    
    console.groupEnd();
  }
  
  // Visual debug overlay
  showVisualDebug() {
    // Remove existing debug overlay
    this.hideVisualDebug();
    
    const activeItem = this.items[this.currentIndex];
    if (!activeItem) return;
    
    // Create debug overlay
    const overlay = document.createElement('div');
    overlay.id = 'category-debug-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      font-family: monospace;
      font-size: 12px;
    `;
    
    // Get positions
    const wrapperRect = this.wrapper.getBoundingClientRect();
    const itemRect = activeItem.getBoundingClientRect();
    const wrapperCenter = wrapperRect.left + (wrapperRect.width / 2);
    const itemCenter = itemRect.left + (itemRect.width / 2);
    
    // Wrapper center line
    const wrapperCenterLine = document.createElement('div');
    wrapperCenterLine.style.cssText = `
      position: absolute;
      left: ${wrapperCenter}px;
      top: ${wrapperRect.top}px;
      width: 2px;
      height: ${wrapperRect.height}px;
      background: red;
      opacity: 0.8;
    `;
    
    // Item center line
    const itemCenterLine = document.createElement('div');
    itemCenterLine.style.cssText = `
      position: absolute;
      left: ${itemCenter}px;
      top: ${itemRect.top}px;
      width: 2px;
      height: ${itemRect.height}px;
      background: blue;
      opacity: 0.8;
    `;
    
    // Info box
    const infoBox = document.createElement('div');
    infoBox.style.cssText = `
      position: absolute;
      top: ${wrapperRect.bottom + 10}px;
      left: ${wrapperRect.left}px;
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 10px;
      border-radius: 4px;
      white-space: pre-line;
    `;
    
    const offset = Math.abs(wrapperCenter - itemCenter);
    infoBox.textContent = `Debug Info:
Red line: Wrapper center (${wrapperCenter.toFixed(1)}px)
Blue line: Item center (${itemCenter.toFixed(1)}px)
Offset: ${offset.toFixed(1)}px
Current transform: ${this.slider.style.transform}
Click anywhere to hide`;
    
    overlay.appendChild(wrapperCenterLine);
    overlay.appendChild(itemCenterLine);
    overlay.appendChild(infoBox);
    
    document.body.appendChild(overlay);
    
    // Hide on click
    setTimeout(() => {
      overlay.style.pointerEvents = 'auto';
      overlay.addEventListener('click', () => this.hideVisualDebug());
    }, 100);
  }
  
  hideVisualDebug() {
    const existing = document.getElementById('category-debug-overlay');
    if (existing) {
      existing.remove();
    }
  }
  
  // Debug all items positions
  debugAllItems() {
    console.group('📋 All Items Debug');
    this.items.forEach((item, index) => {
      const rect = item.getBoundingClientRect();
      console.log(`Item ${index}:`, {
        text: item.textContent.trim(),
        offsetLeft: item.offsetLeft,
        offsetWidth: item.offsetWidth,
        center: item.offsetLeft + (item.offsetWidth / 2),
        boundingRect: { x: rect.x, width: rect.width },
        isActive: item.classList.contains('active')
      });
    });
    console.groupEnd();
  }
  
  // Test centering with different items
  testCentering() {
    console.log('🧪 Testing centering for all items...');
    this.items.forEach((item, index) => {
      setTimeout(() => {
        console.log(`Testing item ${index}: ${item.textContent.trim()}`);
        this.setActiveItem(index);
        setTimeout(() => this.debugCentering(), 100);
      }, index * 1000);
    });
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