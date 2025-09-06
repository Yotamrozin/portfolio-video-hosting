//craft menu system
class CraftCategoryMenu {
  constructor() {
    this.categories = [
      { id: 'motion', name: 'Motion' },
      { id: 'generative-ai', name: 'Generative AI' },
      { id: 'web-brand', name: 'Web+Brand' },
      { id: 'creative-lead', name: 'Creative Lead' },
      { id: 'tools-software', name: 'Tools + Software' }
    ];
    
    this.currentIndex = 0;
    this.slider = document.querySelector('.category-slider');
    this.categoryItems = document.querySelectorAll('.category-item');
    this.storyInterface = document.querySelector('.story-interface');
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.updateSliderPosition();
    this.initializeFinsweet();
  }
  
  setupEventListeners() {
    // Category item clicks
    this.categoryItems.forEach((item, index) => {
      item.addEventListener('click', () => {
        this.selectCategory(index);
      });
    });
    
    // Touch/swipe support for category menu
    this.setupTouchEvents();
    
    // Story swipe support
    this.setupStorySwipe();
  }
  
  selectCategory(index) {
    if (index === this.currentIndex) return;
    
    // Update active states
    this.categoryItems[this.currentIndex].classList.remove('active');
    this.categoryItems[index].classList.add('active');
    
    this.currentIndex = index;
    this.updateSliderPosition();
    this.filterCMSContent();
  }
  
  updateSliderPosition() {
    const containerWidth = this.slider.parentElement.offsetWidth;
    const activeWidth = containerWidth - 160; // Active item width
    const inactiveWidth = 80; // Inactive item width
    
    // Calculate offset to center active item
    let offset = 0;
    for (let i = 0; i < this.currentIndex; i++) {
      offset += inactiveWidth;
    }
    
    // Center the active item
    const centerOffset = (containerWidth - activeWidth) / 2;
    const finalOffset = centerOffset - offset;
    
    this.slider.style.transform = `translateX(${finalOffset}px)`;
  }
  
  filterCMSContent() {
    const activeCategory = this.categories[this.currentIndex].id;
    
    // Filter Finsweet CMS content
    if (window.FsLibrary) {
      const fsInstance = new FsLibrary('.fs-dynamic-feed');
      fsInstance.filter({
        filterBy: 'category', // Your CMS field name
        filterValue: activeCategory
      });
    }
    
    // Trigger custom event for other components
    document.dispatchEvent(new CustomEvent('categoryChanged', {
      detail: { category: activeCategory, index: this.currentIndex }
    }));
  }
  
  setupTouchEvents() {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    
    this.slider.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    }, { passive: true });
    
    this.slider.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
    }, { passive: true });
    
    this.slider.addEventListener('touchend', () => {
      if (!isDragging) return;
      
      const deltaX = currentX - startX;
      const threshold = 50;
      
      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0 && this.currentIndex > 0) {
          this.selectCategory(this.currentIndex - 1);
        } else if (deltaX < 0 && this.currentIndex < this.categories.length - 1) {
          this.selectCategory(this.currentIndex + 1);
        }
      }
      
      isDragging = false;
    });
  }
  
  setupStorySwipe() {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    
    this.storyInterface.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    }, { passive: true });
    
    this.storyInterface.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
    }, { passive: true });
    
    this.storyInterface.addEventListener('touchend', () => {
      if (!isDragging) return;
      
      const deltaX = currentX - startX;
      const threshold = 100; // Larger threshold for category changes
      
      if (Math.abs(deltaX) > threshold) {
        // Swipe changes category (not subcategory)
        if (deltaX > 0 && this.currentIndex > 0) {
          this.selectCategory(this.currentIndex - 1);
        } else if (deltaX < 0 && this.currentIndex < this.categories.length - 1) {
          this.selectCategory(this.currentIndex + 1);
        }
      }
      
      isDragging = false;
    });
  }
  
  initializeFinsweet() {
    // Enhanced Finsweet initialization with filtering
    if (typeof FsLibrary !== 'undefined') {
      const fsTabs = new FsLibrary('.fs-dynamic-feed');
      
      fsTabs.tabs({
        tabComponent: '.fs-tabs',
        tabContent: '.fs-tab-content'
      });
      
      // Initial filter
      this.filterCMSContent();
    }
  }
  
  // Public methods for external control
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
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.craftMenu = new CraftCategoryMenu();
});

// Integration with existing Instagram story system
document.addEventListener('categoryChanged', (e) => {
  console.log('Category changed to:', e.detail.category);
  
  // Reset story to first subcategory when category changes
  const firstTab = document.querySelector('.fs-tabs .w-tab-link');
  if (firstTab) {
    firstTab.click();
  }
  
});

// Updated Finsweet integration
(function() {
  // Wait for category menu to initialize
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      var fsTabs = new FsLibrary('.fs-dynamic-feed');
      
      fsTabs.tabs({
        tabComponent: '.fs-tabs',
        tabContent: '.fs-tab-content'
      });
      
      // Listen for category changes
      document.addEventListener('categoryChanged', (e) => {
        fsTabs.filter({
          filterBy: 'category',
          filterValue: e.detail.category
        });
      });
    }, 100);
  });
})();