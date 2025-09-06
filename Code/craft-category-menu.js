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
        filterBy: 'category',
        filterValue: activeCategory
      });
    }
    
    // Filter story indicators
    this.filterStoryIndicators();
    
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
    // Add null check to prevent error
    if (!this.storyInterface) {
      console.warn('Story interface element not found - skipping story swipe setup');
      return;
    }
    
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
  
  // MOVED METHODS INSIDE THE CLASS
  filterStoryIndicators() {
    const activeCategory = this.categories[this.currentIndex].id;
    
    // Get all tab buttons and their corresponding content
    const tabButtons = document.querySelectorAll('.tab-button-demo');
    const tabPanes = document.querySelectorAll('.tab-pane-demo');
    
    let visibleCount = 0;
    
    tabButtons.forEach((button, index) => {
      const tabPane = tabPanes[index];
      
      if (tabPane) {
        // Check if this tab's content matches the active category
        const tabCategory = this.getTabCategory(tabPane);
        
        if (tabCategory === activeCategory || this.shouldShowTab(tabPane, activeCategory)) {
          button.style.display = 'block';
          tabPane.style.display = 'block';
          visibleCount++;
        } else {
          button.style.display = 'none';
          tabPane.style.display = 'none';
        }
      }
    });
    
    // Update story progress indicators
    this.updateStoryProgress(visibleCount);
  }
  
  getTabCategory(tabPane) {
    // Method 1: Check for category data attribute
    const categoryAttr = tabPane.getAttribute('data-category');
    if (categoryAttr) return categoryAttr;
    
    // Method 2: Extract from tab name or content
    const tabName = tabPane.querySelector('.tab-name');
    if (tabName) {
      const name = tabName.textContent.toLowerCase().trim();
      return this.mapTabNameToCategory(name);
    }
    
    // Method 3: Check video source or other identifiers
    const video = tabPane.querySelector('video source');
    if (video) {
      const src = video.getAttribute('src');
      return this.mapVideoToCategory(src);
    }
    
    return null;
  }
  
  mapTabNameToCategory(tabName) {
    // Map tab names to categories
    const categoryMap = {
      'web dev': 'motion',
      'motion branding': 'motion',
      'ui design': 'design',
      'research': 'research',
      // Add more mappings based on your content
    };
    
    return categoryMap[tabName] || null;
  }
  
  mapVideoToCategory(videoSrc) {
    // Map video files to categories based on filename patterns
    if (videoSrc.includes('Payoneer') || videoSrc.includes('motion')) return 'motion';
    if (videoSrc.includes('design') || videoSrc.includes('ui')) return 'design';
    if (videoSrc.includes('research')) return 'research';
    // Add more patterns
    
    return null;
  }
  
  shouldShowTab(tabPane, activeCategory) {
    // Additional logic to determine if tab should be shown
    return false;
  }
  
  updateStoryProgress(visibleTabCount) {
    // Update any story progress indicators or counters
    const progressContainer = document.querySelector('.story-progress');
    if (progressContainer) {
      progressContainer.setAttribute('data-total-stories', visibleTabCount);
    }
  }
} // <- Class ends here

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.craftMenu = new CraftCategoryMenu();
});

// Integration with existing Instagram story system
document.addEventListener('categoryChanged', (e) => {
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