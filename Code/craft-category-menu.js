class CraftCategoryMenu {
  constructor() {
    this.categories = [];
    this.currentIndex = 0;
    this.slider = document.querySelector('.category-slider');
    this.categoryItems = document.querySelectorAll('.category-item');
    this.storyInterface = document.querySelector('.story-interface');
    this.categoryChangeTimeout = null;
    this.finsweetInstance = null;
    
    this.init();
  }
  
  async init() {
    console.log('🚀 Initializing CraftCategoryMenu...');
    
    try {
      await this.loadCategoriesFromCMS();
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
  
  // Load categories from CMS (Crafts collection)
  async loadCategoriesFromCMS() {
    console.log('📚 Loading categories from CMS...');
    
    // Method 1: Extract from category menu items (if they match CMS)
    const categorySet = new Set();
    
    this.categoryItems.forEach(item => {
      const categoryName = item.textContent.trim();
      if (categoryName) {
        categorySet.add(categoryName);
      }
    });
    
    // Method 2: If Finsweet is available, get categories from CMS
    if (window.FsLibrary) {
      try {
        // Wait for Finsweet to load CMS data
        await this.waitForCMSData();
        
        // Get all subcategory items to extract their linked categories
        const subcategoryItems = document.querySelectorAll('.fs-tab-content');
        
        subcategoryItems.forEach(item => {
          // Look for category reference field data
          const categoryRef = item.querySelector('[data-category-ref]') || 
                            item.querySelector('[data-craft-category]') ||
                            item.querySelector('[data-category]');
          
          if (categoryRef) {
            const categoryName = categoryRef.textContent.trim() || 
                               categoryRef.getAttribute('data-category-ref') ||
                               categoryRef.getAttribute('data-craft-category') ||
                               categoryRef.getAttribute('data-category');
            
            if (categoryName) {
              categorySet.add(categoryName);
            }
          }
        });
      } catch (error) {
        console.warn('Could not load from CMS, using menu items:', error);
      }
    }
    
    // Convert to array and create category objects
    this.categories = Array.from(categorySet).map(name => ({
      id: name,
      name: name
    }));
    
    console.log('📚 Loaded categories from CMS:', this.categories);
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
          console.log('⏳ Waiting for CMS data...');
          setTimeout(checkCMSData, 100);
        }
      };
      checkCMSData();
    });
  }
  
  // Initialize Finsweet and get instance
  async initializeFinsweet() {
    if (typeof FsLibrary !== 'undefined') {
      try {
        // Create Finsweet instance
        this.finsweetInstance = new FsLibrary('.fs-dynamic-feed');
        
        // Initialize tabs
        this.finsweetInstance.tabs({
          tabComponent: '.fs-tabs',
          tabContent: '.fs-tab-content'
        });
        
        console.log('✅ Finsweet initialized successfully');
        
        // Wait a bit for tabs to be created
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.warn('❌ Finsweet initialization failed:', error);
      }
    } else {
      console.warn('❌ FsLibrary not found');
    }
  }
  
  // Filter subcategory tabs based on selected category
  filterSubcategoryTabs(activeCategory) {
    console.log(`\n🎯 Filtering subcategory tabs for: "${activeCategory}"`);
    
    // Get all tab content items (subcategories)
    const allTabContents = document.querySelectorAll('.fs-tab-content');
    const allTabButtons = document.querySelectorAll('.tab-button-demo, .w-tab-link');
    
    let visibleCount = 0;
    const visibleTabs = [];
    
    allTabContents.forEach((tabContent, index) => {
      // Find the category reference in this subcategory
      const categoryRef = tabContent.querySelector('[data-category-ref]') || 
                        tabContent.querySelector('[data-craft-category]') ||
                        tabContent.querySelector('[data-category]') ||
                        tabContent;
      
      let tabCategory = null;
      
      if (categoryRef) {
        // Try different ways to get the category name
        tabCategory = categoryRef.textContent.trim() || 
                     categoryRef.getAttribute('data-category-ref') ||
                     categoryRef.getAttribute('data-craft-category') ||
                     categoryRef.getAttribute('data-category');
        
        // If still no category, look for it in child elements
        if (!tabCategory) {
          const categoryElement = categoryRef.querySelector('[class*="category"], [class*="craft"]');
          if (categoryElement) {
            tabCategory = categoryElement.textContent.trim();
          }
        }
      }
      
      const shouldShow = tabCategory === activeCategory;
      
      // Show/hide tab content
      if (shouldShow) {
        tabContent.style.display = 'block';
        tabContent.style.opacity = '1';
        visibleCount++;
        visibleTabs.push(index);
        console.log(`  ✅ Tab ${index}: "${tabCategory}" - VISIBLE`);
      } else {
        tabContent.style.display = 'none';
        tabContent.style.opacity = '0';
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
    this.updateSliderPosition();
    
    // Filter subcategory tabs
    const activeCategory = this.categories[index]?.name;
    if (activeCategory) {
      this.filterSubcategoryTabs(activeCategory);
    }
    
    // Trigger custom event
    document.dispatchEvent(new CustomEvent('categoryChanged', {
      detail: { 
        category: activeCategory,
        index: this.currentIndex
      }
    }));
  }
  
  // Debug current state
  debugCurrentState() {
    console.log('\n🔍 === CMS-DRIVEN DEBUG ===');
    
    // Show categories
    console.log('\n📚 Categories from CMS:');
    this.categories.forEach((cat, index) => {
      console.log(`  ${index}: "${cat.name}"`);
    });
    
    // Show subcategories and their categories
    console.log('\n📄 Subcategories and their linked categories:');
    const allTabContents = document.querySelectorAll('.fs-tab-content');
    
    allTabContents.forEach((tabContent, index) => {
      const categoryRef = tabContent.querySelector('[data-category-ref]') || 
                        tabContent.querySelector('[data-craft-category]') ||
                        tabContent.querySelector('[data-category]');
      
      let linkedCategory = 'Unknown';
      if (categoryRef) {
        linkedCategory = categoryRef.textContent.trim() || 
                        categoryRef.getAttribute('data-category-ref') ||
                        categoryRef.getAttribute('data-craft-category') ||
                        categoryRef.getAttribute('data-category') || 'Unknown';
      }
      
      const isVisible = tabContent.style.display !== 'none';
      console.log(`  Tab ${index}: Linked to "${linkedCategory}" - ${isVisible ? 'VISIBLE' : 'HIDDEN'}`);
    });
    
    // Current active category
    const activeCategory = this.categories[this.currentIndex];
    console.log(`\n🎯 Active Category: "${activeCategory?.name}" (index: ${this.currentIndex})`);
    
    // Count visible elements
    const visibleTabs = document.querySelectorAll('.fs-tab-content:not([style*="display: none"])');
    const visibleButtons = document.querySelectorAll('.tab-button-demo:not([style*="display: none"]), .w-tab-link:not([style*="display: none"])');
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
  
  // ... (keep existing methods: setupEventListeners, updateActiveStates, updateSliderPosition, setupTouchEvents, etc.)
  
  setupEventListeners() {
    this.categoryItems.forEach((item, index) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        console.log(`Category ${index} clicked:`, this.categories[index]);
        this.selectCategory(index);
      });
    });
    
    this.setupTouchEvents();
  }
  
  updateActiveStates(index) {
    this.categoryItems.forEach(item => {
      item.classList.remove('active');
    });
    
    if (this.categoryItems[index]) {
      this.categoryItems[index].classList.add('active');
    }
  }
  
  updateSliderPosition() {
    if (!this.slider || !this.slider.parentElement) return;
    
    const containerWidth = this.slider.parentElement.offsetWidth;
    const activeWidth = containerWidth - 160;
    const inactiveWidth = 80;
    
    let offset = 0;
    for (let i = 0; i < this.currentIndex; i++) {
      offset += inactiveWidth;
    }
    
    const centerOffset = (containerWidth - activeWidth) / 2;
    const finalOffset = centerOffset - offset;
    
    this.slider.style.transform = `translateX(${finalOffset}px)`;
  }
  
  setupTouchEvents() {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    
    if (this.slider) {
      this.slider.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
      }, { passive: true });
      
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
      }, { passive: false });
      
      this.slider.addEventListener('touchend', () => {
        isDragging = false;
      }, { passive: true });
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