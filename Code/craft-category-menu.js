class CraftCategoryMenu {
  constructor() {
    this.categories = [];
    this.currentIndex = 0;
    this.currentCategory = null;
    this.slider = document.querySelector('.category-slider');
    this.categoryItems = document.querySelectorAll('.category-item');
    this.tabWrapper = document.querySelector('.tab-wrapper');
    this.finsweetTabs = document.querySelector('.fs-tabs');
    this.tabMenu = document.querySelector('.tabs-menu-demo');
    this.categoryChangeTimeout = null;
    this.finsweetInstance = null;
    
    this.init();
  }
  
  async init() {
    console.log('🚀 Initializing CraftCategoryMenu...');
    
    try {
      await this.loadCategoriesFromTabs();
      await this.initializeFinsweet();
      this.setupEventListeners();
      this.debugCategoryStructure();
      
      // Initialize with first category
      if (this.categories.length > 0) {
        this.selectCategory(0);
      }
      
      // Make debug method available globally
      window.debugCraftMenu = () => this.debugCurrentState();
      console.log('\n💡 TIP: Use debugCraftMenu() in console for manual debugging');
      
      console.log('✅ CraftCategoryMenu initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing CraftCategoryMenu:', error);
    }
  }
  
  // Load categories from existing tab content
  // Load categories from category menu items
  async loadCategoriesFromTabs() {
    console.log('📚 Loading categories from category menu...');
    
    const categorySet = new Set();
    
    // Method 1: Extract from category menu items
    this.categoryItems.forEach(item => {
      const categoryName = item.getAttribute('data-category') || 
                          item.querySelector('.category-title')?.textContent.trim();
      if (categoryName) {
        categorySet.add(categoryName);
      }
    });
    
    // Method 2: Also check tab content for consistency
    const tabContents = document.querySelectorAll('.fs-tab-content[data-category]');
    tabContents.forEach(content => {
      const category = content.getAttribute('data-category');
      if (category) {
        categorySet.add(category);
      }
    });
    
    // Convert to array and create category objects
    this.categories = Array.from(categorySet).map(name => ({
      id: name,
      name: name
    }));
    
    console.log('📚 Loaded categories:', this.categories);
  }
  
  // Wait for CMS data to be loaded by Finsweet
  waitForCMSData() {
    return new Promise((resolve) => {
      const checkCMSData = () => {
        const cmsItems = document.querySelectorAll('.fs-tab-content');
        if (cmsItems.length > 0) {
          console.log('✅ CMS data loaded');
          resolve();
        } else {
          setTimeout(checkCMSData, 100);
        }
      };
      checkCMSData();
    });
  }
  
  async initializeFinsweet() {
    console.log('🔧 Initializing Finsweet integration...');
    
    try {
      if (window.FsLibrary) {
        await this.waitForCMSData();
        console.log('✅ Finsweet initialized');
      } else {
        console.warn('⚠️ Finsweet library not found');
      }
    } catch (error) {
      console.error('❌ Error initializing Finsweet:', error);
    }
  }
  
  filterSubcategoryTabs(activeCategory) {
    console.log(`\n🎯 Filtering subcategory tabs for: "${activeCategory}"`);
    
    // Get all tab content items and corresponding buttons
    const allTabContents = document.querySelectorAll('.fs-tab-content[data-category]');
    const allTabButtons = document.querySelectorAll('.tab-button-demo');
    
    let visibleCount = 0;
    const visibleTabs = [];
    
    allTabContents.forEach((tabContent, index) => {
      const tabCategory = tabContent.getAttribute('data-category');
      const shouldShow = tabCategory === activeCategory;
      
      // Find corresponding tab pane
      const tabPane = tabContent.closest('.tab-pane-demo');
      
      if (shouldShow) {
        // Show tab content
        tabContent.style.display = 'block';
        tabContent.style.opacity = '1';
        if (tabPane) {
          tabPane.style.display = 'block';
          tabPane.style.opacity = '1';
        }
        
        visibleCount++;
        visibleTabs.push(index);
        console.log(`  ✅ Tab ${index}: "${tabCategory}" - VISIBLE`);
      } else {
        // Hide tab content
        tabContent.style.display = 'none';
        tabContent.style.opacity = '0';
        if (tabPane) {
          tabPane.style.display = 'none';
          tabPane.style.opacity = '0';
        }
        console.log(`  ❌ Tab ${index}: "${tabCategory}" - HIDDEN`);
      }
      
      // Show/hide corresponding tab button
      if (allTabButtons[index]) {
        if (shouldShow) {
          allTabButtons[index].style.display = 'block';
          allTabButtons[index].style.opacity = '1';
          allTabButtons[index].style.pointerEvents = 'auto';
        } else {
          allTabButtons[index].style.display = 'none';
          allTabButtons[index].style.opacity = '0';
          allTabButtons[index].style.pointerEvents = 'none';
        }
      }
    });
    
    console.log(`📊 Result: ${visibleCount} subcategory tabs visible for "${activeCategory}"`);
    
    // Update Instagram Stories progress bars
    this.updateStoryProgress(visibleCount);
    
    // Activate first visible tab
    if (visibleTabs.length > 0) {
      const firstVisibleButton = allTabButtons[visibleTabs[0]];
      if (firstVisibleButton && firstVisibleButton.click) {
        setTimeout(() => {
          firstVisibleButton.click();
          console.log(`🎯 Activated first visible tab: ${visibleTabs[0]}`);
        }, 100);
      }
    }
    
    return visibleCount;
  }
  
  // Update story progress bars to match visible tabs
  updateStoryProgress(visibleTabCount) {
    console.log(`📈 Updating Instagram Stories for ${visibleTabCount} subcategories`);
    
    // Find all story progress elements
    const progressBars = document.querySelectorAll('.story-progress, .progress-bar, [class*="progress"]');
    const storyCounters = document.querySelectorAll('.story-counter, [class*="counter"]');
    
    // Update progress bar count
    progressBars.forEach((bar, index) => {
      if (index < visibleTabCount) {
        bar.style.display = 'block';
        bar.style.opacity = '1';
        // Reset progress
        const fill = bar.querySelector('.progress-fill, [class*="fill"]');
        if (fill) {
          fill.style.width = '0%';
        }
      } else {
        bar.style.display = 'none';
        bar.style.opacity = '0';
      }
    });
    
    // Update story counters
    storyCounters.forEach(counter => {
      counter.textContent = `1 / ${visibleTabCount}`;
    });
    
    console.log(`✅ Updated ${progressBars.length} progress bars and ${storyCounters.length} counters`);
  }
  
  // Select category and filter content
  selectCategory(index) {
    if (index === this.currentIndex) return;
    
    console.log(`\n🎯 SELECTING CATEGORY ${index}`);
    console.log(`Previous: ${this.currentIndex} ("${this.categories[this.currentIndex]?.name}")`);
    console.log(`New: ${index} ("${this.categories[index]?.name}")`);
    
    // Update active states
    this.updateActiveStates(index);
    this.currentIndex = index;
    this.currentCategory = this.categories[index]?.name;
    
    // Update slider position if needed
    this.updateSliderPosition();
    
    // Filter subcategory tabs
    if (this.currentCategory) {
      this.filterSubcategoryTabs(this.currentCategory);
    }
    
    // Trigger custom event
    document.dispatchEvent(new CustomEvent('categoryChanged', {
      detail: { 
        category: this.currentCategory,
        index: this.currentIndex
      }
    }));
  }
  
  // Debug current state
  debugCurrentState() {
    console.log('\n🔍 === CMS-DRIVEN DEBUG ===');
    
    // Show categories
    console.log('\n📚 Categories from tabs:');
    this.categories.forEach((cat, index) => {
      console.log(`  ${index}: "${cat.name}"`);
    });
    
    // Show subcategories and their categories
    console.log('\n📄 Subcategories and their linked categories:');
    const allTabContents = document.querySelectorAll('.fs-tab-content[data-category]');
    
    allTabContents.forEach((tabContent, index) => {
      const linkedCategory = tabContent.getAttribute('data-category') || 'Unknown';
      const isVisible = tabContent.style.display !== 'none';
      console.log(`  Tab ${index}: Linked to "${linkedCategory}" - ${isVisible ? 'VISIBLE' : 'HIDDEN'}`);
    });
    
    // Current active category
    console.log(`\n🎯 Active Category: "${this.currentCategory}" (index: ${this.currentIndex})`);
    
    // Count visible elements
    const visibleTabs = document.querySelectorAll('.fs-tab-content:not([style*="display: none"])');
    const visibleButtons = document.querySelectorAll('.tab-button-demo:not([style*="display: none"])');
    const progressBars = document.querySelectorAll('.story-progress:not([style*="display: none"])');
    
    console.log(`\n📊 Current Counts:`);
    console.log(`  Visible tab contents: ${visibleTabs.length}`);
    console.log(`  Visible tab buttons: ${visibleButtons.length}`);
    console.log(`  Visible progress bars: ${progressBars.length}`);
    
    if (visibleTabs.length === visibleButtons.length && visibleButtons.length === progressBars.length) {
      console.log(`✅ PERFECT MATCH: All counts align!`);
    } else {
      console.warn(`⚠️ MISMATCH: Counts don't align`);
    }
  }
  
  debugCategoryStructure() {
    console.log('\n🏗️ === CATEGORY STRUCTURE DEBUG ===');
    console.log('Tab wrapper:', this.tabWrapper ? '✅ Found' : '❌ Missing');
    console.log('Finsweet tabs:', this.finsweetTabs ? '✅ Found' : '❌ Missing');
    console.log('Tab menu:', this.tabMenu ? '✅ Found' : '❌ Missing');
    
    const tabContents = document.querySelectorAll('.fs-tab-content[data-category]');
    const tabButtons = document.querySelectorAll('.tab-button-demo');
    
    console.log(`Tab contents with data-category: ${tabContents.length}`);
    console.log(`Tab buttons: ${tabButtons.length}`);
  }
  
  setupEventListeners() {
    // Add click listeners to category items
    this.categoryItems.forEach((item, index) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        console.log(`Category ${index} clicked:`, this.categories[index]);
        this.selectCategory(index);
      });
      
      // Add visual feedback
      item.style.cursor = 'pointer';
    });
    
    // Also add keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.previousCategory();
      } else if (e.key === 'ArrowRight') {
        this.nextCategory();
      }
    });
    
    console.log(`🔘 Added click listeners to ${this.categoryItems.length} category items`);
  }
  
  // Method to handle visual active states
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
  
  // Method to handle slider transform
  updateSliderPosition() {
    if (!this.slider) return;
    
    // Calculate transform based on current index
    const offset = this.currentIndex * -80; // Adjust based on your item width
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
  console.log('Initializing CraftCategoryMenu...');
  window.craftMenu = new CraftCategoryMenu();
});

// Integration with Instagram story system
document.addEventListener('categoryChanged', (e) => {
  console.log('Category changed event:', e.detail);
  // The filtering is now handled in selectCategory method
});