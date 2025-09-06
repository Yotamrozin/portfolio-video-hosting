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
  
  // Add these debugging methods to the CraftCategoryMenu class
  
  // Enhanced debugging method
  debugCategoryStructure() {
    console.log('\n=== CATEGORY STRUCTURE DEBUG ===');
    
    // Debug all available categories
    console.log('Available categories:', this.categories);
    console.log('Current category index:', this.currentIndex);
    console.log('Current active category:', this.categories[this.currentIndex]);
    
    // Debug different data attribute types
    const categoryRows = document.querySelectorAll('[data-category-row]');
    const categoryExamples = document.querySelectorAll('[data-category-example]');
    const categoryLogos = document.querySelectorAll('[data-category-logo]');
    const oldDataCategory = document.querySelectorAll('[data-category]');
    const storyTabs = document.querySelectorAll('.tab-button-demo');
    const progressBars = document.querySelectorAll('.story-progress, .progress-bar, [class*="progress"]');
    
    console.log('\n--- ELEMENT COUNTS ---');
    console.log('Category rows [data-category-row]:', categoryRows.length);
    console.log('Category examples [data-category-example]:', categoryExamples.length);
    console.log('Category logos [data-category-logo]:', categoryLogos.length);
    console.log('Old data-category elements:', oldDataCategory.length);
    console.log('Story tabs (.tab-button-demo):', storyTabs.length);
    console.log('Progress bars found:', progressBars.length);
    
    // Debug each category's subcategories
    console.log('\n--- CATEGORY BREAKDOWN ---');
    this.categories.forEach((category, index) => {
      console.log(`\n📁 Category ${index}: "${category.name}"`);
      
      // Count subcategories for this category
      const subcategoriesInRows = Array.from(categoryRows).filter(row => 
        row.getAttribute('data-category-row') === category.id
      );
      const subcategoriesInExamples = Array.from(categoryExamples).filter(example => 
        example.getAttribute('data-category-example') === category.id
      );
      const subcategoriesInLogos = Array.from(categoryLogos).filter(logo => 
        logo.getAttribute('data-category-logo') === category.id || 
        logo.getAttribute('data-category-logo-2') === category.id
      );
      
      console.log(`  📄 Rows: ${subcategoriesInRows.length}`);
      console.log(`  🎯 Examples: ${subcategoriesInExamples.length}`);
      console.log(`  🏢 Logos: ${subcategoriesInLogos.length}`);
      console.log(`  📊 Total subcategories: ${subcategoriesInRows.length + subcategoriesInExamples.length + subcategoriesInLogos.length}`);
    });
  }
  
  // Enhanced filtering with detailed logging
  filterStoryIndicators() {
    const activeCategory = this.categories[this.currentIndex]?.id;
    if (!activeCategory) {
      console.warn('No active category found!');
      return;
    }
    
    console.log(`\n🔍 FILTERING FOR CATEGORY: "${activeCategory}"`);
    
    let totalVisibleSections = 0;
    let visibleRows = 0;
    let visibleExamples = 0;
    let visibleLogos = 0;
    let visibleStoryTabs = 0;
    
    // Filter category rows
    const categoryRows = document.querySelectorAll('[data-category-row]');
    console.log(`\n📄 Processing ${categoryRows.length} category rows...`);
    
    categoryRows.forEach((row, index) => {
      const rowCategory = row.getAttribute('data-category-row');
      const isVisible = rowCategory === activeCategory;
      
      if (isVisible) {
        row.style.display = 'block';
        row.classList.add('active-category');
        visibleRows++;
        console.log(`  ✅ Row ${index}: "${rowCategory}" - VISIBLE`);
        
        // Check for subcategories within this row
        const subcategories = row.querySelectorAll('[data-subcategory-label], .subcategory-group > *');
        if (subcategories.length > 0) {
          console.log(`    📋 Found ${subcategories.length} subcategories in this row`);
        }
      } else {
        row.style.display = 'none';
        row.classList.remove('active-category');
        console.log(`  ❌ Row ${index}: "${rowCategory}" - HIDDEN`);
      }
    });
    
    // Filter category examples
    const categoryExamples = document.querySelectorAll('[data-category-example]');
    console.log(`\n🎯 Processing ${categoryExamples.length} category examples...`);
    
    categoryExamples.forEach((example, index) => {
      const exampleCategory = example.getAttribute('data-category-example');
      const isVisible = exampleCategory === activeCategory;
      
      if (isVisible) {
        example.style.display = 'block';
        example.classList.add('fade-in');
        visibleExamples++;
        console.log(`  ✅ Example ${index}: "${exampleCategory}" - VISIBLE`);
      } else {
        example.style.display = 'none';
        example.classList.remove('fade-in');
        console.log(`  ❌ Example ${index}: "${exampleCategory}" - HIDDEN`);
      }
    });
    
    // Filter category logos
    const categoryLogos = document.querySelectorAll('[data-category-logo]');
    console.log(`\n🏢 Processing ${categoryLogos.length} category logos...`);
    
    categoryLogos.forEach((logo, index) => {
      const logoCategory = logo.getAttribute('data-category-logo');
      const logoCategory2 = logo.getAttribute('data-category-logo-2');
      const isVisible = logoCategory === activeCategory || logoCategory2 === activeCategory;
      
      if (isVisible) {
        logo.style.display = 'block';
        visibleLogos++;
        console.log(`  ✅ Logo ${index}: "${logoCategory}${logoCategory2 ? '/' + logoCategory2 : ''}" - VISIBLE`);
      } else {
        logo.style.display = 'none';
        console.log(`  ❌ Logo ${index}: "${logoCategory}${logoCategory2 ? '/' + logoCategory2 : ''}" - HIDDEN`);
      }
    });
    
    // Check story tabs (for Instagram story system)
    const storyTabs = document.querySelectorAll('.tab-button-demo');
    console.log(`\n📱 Processing ${storyTabs.length} story tabs...`);
    
    storyTabs.forEach((tab, index) => {
      const tabParent = tab.closest('[data-category], [data-category-row], [data-category-example]');
      if (tabParent) {
        const tabCategory = tabParent.getAttribute('data-category') || 
                         tabParent.getAttribute('data-category-row') || 
                         tabParent.getAttribute('data-category-example');
        const isVisible = tabCategory === activeCategory;
        
        if (isVisible) {
          tab.style.display = 'block';
          visibleStoryTabs++;
          console.log(`  ✅ Story tab ${index}: "${tabCategory}" - VISIBLE`);
        } else {
          tab.style.display = 'none';
          console.log(`  ❌ Story tab ${index}: "${tabCategory}" - HIDDEN`);
        }
      }
    });
    
    // Count progress bars
    const progressBars = document.querySelectorAll('.story-progress, .progress-bar, [class*="progress"]');
    const visibleProgressBars = Array.from(progressBars).filter(bar => {
      const style = window.getComputedStyle(bar);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
    
    totalVisibleSections = visibleRows + visibleExamples + visibleLogos;
    
    console.log(`\n📊 FILTERING RESULTS:`);
    console.log(`  📄 Visible rows: ${visibleRows}`);
    console.log(`  🎯 Visible examples: ${visibleExamples}`);
    console.log(`  🏢 Visible logos: ${visibleLogos}`);
    console.log(`  📱 Visible story tabs: ${visibleStoryTabs}`);
    console.log(`  📊 Total visible sections: ${totalVisibleSections}`);
    console.log(`  🎚️ Progress bars found: ${progressBars.length}`);
    console.log(`  🎚️ Visible progress bars: ${visibleProgressBars.length}`);
    
    // Check if numbers match
    if (totalVisibleSections !== visibleProgressBars.length) {
      console.warn(`⚠️  MISMATCH: ${totalVisibleSections} visible sections but ${visibleProgressBars.length} progress bars!`);
    } else {
      console.log(`✅ MATCH: ${totalVisibleSections} sections = ${visibleProgressBars.length} progress bars`);
    }
    
    this.updateStoryProgress(totalVisibleSections);
    
    // Return debug info
    return {
      activeCategory,
      visibleRows,
      visibleExamples,
      visibleLogos,
      visibleStoryTabs,
      totalVisibleSections,
      progressBarsFound: progressBars.length,
      visibleProgressBars: visibleProgressBars.length,
      match: totalVisibleSections === visibleProgressBars.length
    };
  }
  
  // Enhanced story progress update with debugging
  updateStoryProgress(visibleTabCount) {
    console.log(`\n🎚️ UPDATING STORY PROGRESS: ${visibleTabCount} visible sections`);
    
    // Update any story progress indicators or counters
    const progressContainer = document.querySelector('.story-progress');
    if (progressContainer) {
      progressContainer.setAttribute('data-total-stories', visibleTabCount);
      console.log(`  ✅ Updated .story-progress container with ${visibleTabCount} stories`);
    } else {
      console.log(`  ❌ No .story-progress container found`);
    }
    
    // Look for other progress indicators
    const progressBars = document.querySelectorAll('.progress-bar, [class*="progress"]');
    progressBars.forEach((bar, index) => {
      console.log(`  📊 Progress bar ${index}:`, bar.className);
      // You can add specific updates here based on your progress bar structure
    });
  }
  
  // Add method to manually trigger debug from console
  debugCurrentState() {
    console.log('\n🔍 MANUAL DEBUG TRIGGER');
    this.debugCategoryStructure();
    const filterResults = this.filterStoryIndicators();
    return filterResults;
  }
  
  // Update the selectCategory method to include debugging
  selectCategory(index) {
    if (index === this.currentIndex) return;
    
    console.log(`\n🎯 SELECTING CATEGORY ${index}`);
    console.log(`Previous: ${this.currentIndex} ("${this.categories[this.currentIndex]?.name}")`);
    console.log(`New: ${index} ("${this.categories[index]?.name}")`);
    
    // Update active states immediately
    this.updateActiveStates(index);
    this.currentIndex = index;
    this.updateSliderPosition();
    this.filterCMSContent();
  }
  
  // Update the init method to include initial debugging
  async init() {
    console.log('🚀 Initializing CraftCategoryMenu...');
    
    await this.loadCategoriesFromDOM();
    this.debugCategoryStructure(); // Add initial debug
    this.setupEventListeners();
    this.updateSliderPosition();
    this.initializeFinsweet();
    
    // Trigger initial filtering debug
    console.log('\n🔍 Initial filtering...');
    this.filterStoryIndicators();
    
    // Make debug method available globally
    window.debugCraftMenu = () => this.debugCurrentState();
    console.log('\n💡 TIP: Use debugCraftMenu() in console for manual debugging');
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