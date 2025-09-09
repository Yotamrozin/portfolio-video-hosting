/**
 * Infinite Category Slider
 * Professional infinite loop slider with proper centering
 */

class InfiniteCategorySlider {
  constructor(wrapperSelector = '.category-slider-wrapper') {
    this.wrapper = document.querySelector(wrapperSelector);
    
    if (!this.wrapper) {
      console.warn(`Category menu wrapper not found: ${wrapperSelector}`);
      return;
    }
    
    this.originalSlider = this.wrapper.querySelector('.category-slider');
    this.originalItems = this.wrapper.querySelectorAll('.category-item');
    
    if (!this.originalSlider || this.originalItems.length === 0) {
      console.warn('Category menu elements not found within wrapper');
      return;
    }
    
    this.currentIndex = 0;
    this.isAnimating = false;
    this.cloneCount = Math.ceil(this.wrapper.offsetWidth / 200) + 2; // Adaptive clone count
    
    this.init();
  }
  
  init() {
    this.createInfiniteSlider();
    this.setActiveItem(0);
    this.setupEventListeners();
    this.centerActiveItem();
  }
  
  createInfiniteSlider() {
    // Store original items data
    this.itemsData = Array.from(this.originalItems).map(item => ({
      text: item.textContent.trim(),
      category: item.dataset.category || item.textContent.trim(),
      color: item.dataset.color || '',
      html: item.outerHTML
    }));
    
    // Create new slider structure
    this.slider = document.createElement('div');
    this.slider.className = this.originalSlider.className;
    this.slider.style.display = 'flex';
    this.slider.style.transition = 'none';
    this.slider.style.willChange = 'transform';
    
    // Create infinite loop: [clones] + [original] + [clones]
    this.allItems = [];
    this.totalItems = this.itemsData.length;
    
    // Left clones (for seamless loop)
    for (let i = 0; i < this.cloneCount; i++) {
      const dataIndex = (this.totalItems - this.cloneCount + i) % this.totalItems;
      const clone = this.createItem(this.itemsData[dataIndex], `clone-left-${i}`);
      this.slider.appendChild(clone);
      this.allItems.push(clone);
    }
    
    // Original items
    this.itemsData.forEach((itemData, index) => {
      const item = this.createItem(itemData, `original-${index}`);
      this.slider.appendChild(item);
      this.allItems.push(item);
    });
    
    // Right clones (for seamless loop)
    for (let i = 0; i < this.cloneCount; i++) {
      const dataIndex = i % this.totalItems;
      const clone = this.createItem(this.itemsData[dataIndex], `clone-right-${i}`);
      this.slider.appendChild(clone);
      this.allItems.push(clone);
    }
    
    // Replace original slider
    this.originalSlider.parentNode.replaceChild(this.slider, this.originalSlider);
    
    // Set initial position to first original item
    this.realIndex = this.cloneCount;
    this.setPosition(this.realIndex);
    
    console.log('🔧 Infinite slider created:', {
      totalOriginalItems: this.totalItems,
      cloneCount: this.cloneCount,
      totalVisualItems: this.allItems.length,
      startPosition: this.realIndex
    });
  }
  
  createItem(itemData, id) {
    const item = document.createElement('div');
    item.className = 'category-item';
    item.textContent = itemData.text;
    item.dataset.category = itemData.category;
    item.dataset.itemId = id;
    if (itemData.color) item.dataset.color = itemData.color;
    
    // Copy styles from original
    const originalItem = this.originalItems[0];
    if (originalItem) {
      const computedStyles = window.getComputedStyle(originalItem);
      item.style.padding = computedStyles.padding;
      item.style.margin = computedStyles.margin;
      item.style.fontSize = computedStyles.fontSize;
      item.style.fontWeight = computedStyles.fontWeight;
      item.style.borderRadius = computedStyles.borderRadius;
      item.style.backgroundColor = computedStyles.backgroundColor;
      item.style.color = computedStyles.color;
      item.style.flexShrink = '0';
      item.style.cursor = 'pointer';
      item.style.whiteSpace = 'nowrap';
    }
    
    return item;
  }
  
  setupEventListeners() {
    // Click handlers
    this.allItems.forEach((item, visualIndex) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleItemClick(visualIndex);
      });
    });
    
    // Resize handler
    this.resizeHandler = this.debounce(() => {
      this.centerActiveItem();
    }, 100);
    
    window.addEventListener('resize', this.resizeHandler);
  }
  
  handleItemClick(visualIndex) {
    if (this.isAnimating) return;
    
    // Calculate the logical index (0 to totalItems-1)
    const logicalIndex = this.getLogicalIndex(visualIndex);
    
    // Move to clicked item
    this.goToItem(logicalIndex);
    
    // Integrate with existing tabs system
    const category = this.itemsData[logicalIndex].category;
    if (window.MultiInstanceTabsManager) {
      window.MultiInstanceTabsManager.showCategory(category);
    }
  }
  
  goToItem(logicalIndex, animate = true) {
    if (this.isAnimating && animate) return;
    
    this.currentIndex = logicalIndex;
    
    // Find the best visual position for this logical index
    const targetVisualIndex = this.findBestVisualIndex(logicalIndex);
    
    if (animate) {
      this.animateToPosition(targetVisualIndex);
    } else {
      this.setPosition(targetVisualIndex);
      this.updateActiveStates();
    }
  }
  
  findBestVisualIndex(logicalIndex) {
    // Find all visual indices that represent this logical index
    const candidates = [];
    
    this.allItems.forEach((item, visualIndex) => {
      const itemLogicalIndex = this.getLogicalIndex(visualIndex);
      if (itemLogicalIndex === logicalIndex) {
        candidates.push(visualIndex);
      }
    });
    
    // Choose the candidate closest to center
    const centerPosition = this.allItems.length / 2;
    return candidates.reduce((best, current) => {
      return Math.abs(current - centerPosition) < Math.abs(best - centerPosition) ? current : best;
    });
  }
  
  getLogicalIndex(visualIndex) {
    if (visualIndex < this.cloneCount) {
      // Left clones
      return (this.totalItems - this.cloneCount + visualIndex) % this.totalItems;
    } else if (visualIndex >= this.cloneCount + this.totalItems) {
      // Right clones
      return (visualIndex - this.cloneCount - this.totalItems) % this.totalItems;
    } else {
      // Original items
      return visualIndex - this.cloneCount;
    }
  }
  
  setPosition(visualIndex) {
    this.realIndex = visualIndex;
    const item = this.allItems[visualIndex];
    if (!item) return;
    
    const wrapperWidth = this.wrapper.offsetWidth;
    const itemLeft = item.offsetLeft;
    const itemWidth = item.offsetWidth;
    const itemCenter = itemLeft + (itemWidth / 2);
    const wrapperCenter = wrapperWidth / 2;
    
    const translateX = wrapperCenter - itemCenter;
    this.slider.style.transform = `translateX(${translateX}px)`;
    
    console.log('📍 Position set:', {
      visualIndex,
      logicalIndex: this.getLogicalIndex(visualIndex),
      itemText: item.textContent.trim(),
      translateX
    });
  }
  
  animateToPosition(targetVisualIndex) {
    this.isAnimating = true;
    this.slider.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    
    this.setPosition(targetVisualIndex);
    this.updateActiveStates();
    
    setTimeout(() => {
      this.isAnimating = false;
      this.slider.style.transition = 'none';
      this.checkLoopReset();
    }, 400);
  }
  
  checkLoopReset() {
    // If we're too far left or right, jump to equivalent position
    if (this.realIndex < this.cloneCount / 2) {
      const equivalentIndex = this.realIndex + this.totalItems;
      this.setPosition(equivalentIndex);
    } else if (this.realIndex >= this.allItems.length - this.cloneCount / 2) {
      const equivalentIndex = this.realIndex - this.totalItems;
      this.setPosition(equivalentIndex);
    }
  }
  
  setActiveItem(logicalIndex) {
    this.currentIndex = logicalIndex;
    this.goToItem(logicalIndex, false);
    this.updateActiveStates();
  }
  
  updateActiveStates() {
    // Remove active from all items
    this.allItems.forEach(item => {
      item.classList.remove('active');
      item.style.backgroundColor = '';
    });
    
    // Add active to all items representing current logical index
    this.allItems.forEach((item, visualIndex) => {
      const itemLogicalIndex = this.getLogicalIndex(visualIndex);
      if (itemLogicalIndex === this.currentIndex) {
        item.classList.add('active');
        const customColor = item.dataset.color;
        if (customColor) {
          item.style.backgroundColor = customColor;
        }
      }
    });
  }
  
  centerActiveItem() {
    if (this.realIndex !== undefined) {
      this.setPosition(this.realIndex);
    }
  }
  
  // Navigation methods
  next() {
    const nextIndex = (this.currentIndex + 1) % this.totalItems;
    this.goToItem(nextIndex);
  }
  
  prev() {
    const prevIndex = (this.currentIndex - 1 + this.totalItems) % this.totalItems;
    this.goToItem(prevIndex);
  }
  
  // Public API methods
  setActiveCategory(category) {
    const targetIndex = this.itemsData.findIndex(item => 
      item.category.toLowerCase() === category.toLowerCase()
    );
    
    if (targetIndex !== -1) {
      this.goToItem(targetIndex);
    }
  }
  
  getCurrentCategory() {
    return this.itemsData[this.currentIndex]?.category || null;
  }
  
  // Debug methods
  debug() {
    console.group('🔍 Infinite Slider Debug');
    console.log('Current State:', {
      logicalIndex: this.currentIndex,
      visualIndex: this.realIndex,
      currentCategory: this.getCurrentCategory(),
      totalOriginalItems: this.totalItems,
      totalVisualItems: this.allItems.length
    });
    console.log('Transform:', this.slider.style.transform);
    console.groupEnd();
  }
  
  // Utility methods
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
  
  destroy() {
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.categoryMenuSlider = new InfiniteCategorySlider();
  });
} else {
  window.categoryMenuSlider = new InfiniteCategorySlider();
}

// Export for external access
window.InfiniteCategorySlider = InfiniteCategorySlider;