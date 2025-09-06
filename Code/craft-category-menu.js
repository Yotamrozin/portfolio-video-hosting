//craft menu system
class CraftCategoryMenu {
  constructor() {
    // Remove hard-coded categories
    this.categories = [];
    this.currentIndex = 0;
    this.slider = document.querySelector('.category-slider');
    this.categoryItems = document.querySelectorAll('.category-item');
    this.storyInterface = document.querySelector('.story-interface');
    this.categoryChangeTimeout = null;
    
    this.init();
  }
  
  async init() {
    await this.loadCategoriesFromDOM();
    this.setupEventListeners();
    this.updateSliderPosition();
    this.initializeFinsweet();
  }
  
  // Load categories from existing DOM elements
  loadCategoriesFromDOM() {
    // Method 1: Extract from story sections data-category attributes
    const storyTabs = document.querySelectorAll('[data-category]');
    const categorySet = new Set();
    
    storyTabs.forEach(tab => {
      const category = tab.getAttribute('data-category');
      if (category && category.trim()) {
        categorySet.add(category.trim());
      }
    });
    
    // Method 2: If no data-category found, extract from category menu items
    if (categorySet.size === 0) {
      this.categoryItems.forEach(item => {
        const categoryName = item.textContent.trim();
        if (categoryName) {
          categorySet.add(categoryName);
        }
      });
    }
    
    // Convert to array and create category objects
    this.categories = Array.from(categorySet).map(name => ({
      id: name, // Use actual CMS name as ID
      name: name
    }));
    
    console.log('Loaded categories:', this.categories);
  }
  
  setupEventListeners() {
    // Category item clicks - use direct event listeners for reliability
    this.categoryItems.forEach((item, index) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        console.log(`Category ${index} clicked:`, this.categories[index]);
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
    
    console.log(`Selecting category ${index}`);
    
    // Update active states immediately
    this.updateActiveStates(index);
    this.currentIndex = index;
    this.updateSliderPosition();
    this.filterCMSContent();
  }
  
  updateActiveStates(index) {
    // Remove active class from all items
    this.categoryItems.forEach(item => {
      item.classList.remove('active');
    });
    
    // Add active class to selected item
    if (this.categoryItems[index]) {
      this.categoryItems[index].classList.add('active');
    }
  }
  
  updateSliderPosition() {
    if (!this.slider || !this.slider.parentElement) return;
    
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
    console.log(`Slider moved to position: ${finalOffset}px`);
  }
  
  filterCMSContent() {
    const activeCategory = this.categories[this.currentIndex]?.id;
    if (!activeCategory) return;
    
    console.log(`Filtering content for category: ${activeCategory}`);
    
    // Filter Finsweet CMS content
    if (window.FsLibrary) {
      try {
        const fsInstance = new FsLibrary('.fs-dynamic-feed');
        fsInstance.filter({
          filterBy: 'category',
          filterValue: activeCategory
        });
      } catch (error) {
        console.warn('Finsweet filtering failed:', error);
      }
    }
    
    // Filter story indicators
    this.filterStoryIndicators();
    
    // Trigger custom event for other components
    document.dispatchEvent(new CustomEvent('categoryChanged', {
      detail: { 
        category: activeCategory,
        index: this.currentIndex
      }
    }));
  }
  
  setupTouchEvents() {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    
    if (this.slider) {
      this.slider.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
      });
      
      this.slider.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        currentX = e.touches[0].clientX;
        const diffX = startX - currentX;
        
        if (Math.abs(diffX) > 50) {
          if (diffX > 0 && this.currentIndex < this.categories.length - 1) {
            this.selectCategory(this.currentIndex + 1);
          } else if (diffX < 0 && this.currentIndex > 0) {
            this.selectCategory(this.currentIndex - 1);
          }
          isDragging = false;
        }
      });
      
      this.slider.addEventListener('touchend', () => {
        isDragging = false;
      });
    }
  }
  
  setupStorySwipe() {
    // Story swipe functionality
    const storyContainer = document.querySelector('.story-interface');
    if (storyContainer) {
      let startX = 0;
      let isDragging = false;
      
      storyContainer.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
      });
      
      storyContainer.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const currentX = e.touches[0].clientX;
        const diffX = startX - currentX;
        
        if (Math.abs(diffX) > 100) {
          if (diffX > 0) {
            // Swipe left - next story/category
            this.nextCategory();
          } else {
            // Swipe right - previous story/category
            this.previousCategory();
          }
          isDragging = false;
        }
      });
      
      storyContainer.addEventListener('touchend', () => {
        isDragging = false;
      });
    }
  }
  
  initializeFinsweet() {
    // Initialize Finsweet CMS filtering
    if (typeof FsLibrary !== 'undefined') {
      try {
        const fsInstance = new FsLibrary('.fs-dynamic-feed');
        fsInstance.init();
        console.log('Finsweet initialized successfully');
      } catch (error) {
        console.warn('Finsweet initialization failed:', error);
      }
    } else {
      console.warn('FsLibrary not found');
    }
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
  
  filterStoryIndicators() {
    const activeCategory = this.categories[this.currentIndex]?.id;
    if (!activeCategory) return;
    
    // Get all story tabs with data-category attributes
    const storyTabs = document.querySelectorAll('[data-category]');
    let visibleCount = 0;
    
    storyTabs.forEach(tab => {
      const tabCategory = tab.getAttribute('data-category');
      
      if (tabCategory === activeCategory) {
        // Show this story section
        tab.style.display = 'block';
        
        // Also show corresponding tab button if it exists
        const tabButton = tab.querySelector('.tab-button-demo') || 
                         document.querySelector(`[data-tab-target="${tab.id}"]`);
        if (tabButton) {
          tabButton.style.display = 'block';
        }
        
        visibleCount++;
      } else {
        // Hide this story section
        tab.style.display = 'none';
        
        // Also hide corresponding tab button
        const tabButton = tab.querySelector('.tab-button-demo') || 
                         document.querySelector(`[data-tab-target="${tab.id}"]`);
        if (tabButton) {
          tabButton.style.display = 'none';
        }
      }
    });
    
    this.updateStoryProgress(visibleCount);
    
    // Debug: Log filtering results
    console.log(`Filtered for category "${activeCategory}": ${visibleCount} stories visible`);
  }
  
  getTabCategory(tabPane) {
    // Simply return the data-category attribute
    return tabPane.getAttribute('data-category');
  }
  
  updateStoryProgress(visibleTabCount) {
    // Update any story progress indicators or counters
    const progressContainer = document.querySelector('.story-progress');
    if (progressContainer) {
      progressContainer.setAttribute('data-total-stories', visibleTabCount);
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing CraftCategoryMenu...');
  window.craftMenu = new CraftCategoryMenu();
});

// Integration with existing Instagram story system
document.addEventListener('categoryChanged', (e) => {
  console.log('Category changed event:', e.detail);
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
      if (typeof FsLibrary !== 'undefined') {
        try {
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
        } catch (error) {
          console.warn('Finsweet tabs initialization failed:', error);
        }
      }
    }, 100);
  });
})();