// Enhanced story system integration
var Webflow = Webflow || [];
Webflow.push(function() {
  // Fix for Safari
  if (navigator.userAgent.includes("Safari")) {
    document.querySelectorAll(".tab-button-demo").forEach((t) => (t.focus = function() {
      const x = window.scrollX, y = window.scrollY;
      const f = () => {
        setTimeout(() => window.scrollTo(x, y), 1);
        t.removeEventListener("focus", f);
      };
      t.addEventListener("focus", f);
      HTMLElement.prototype.focus.apply(this, arguments);
    }));
  }
  
  function nextTab() {
    if (!$(".uui-navbar06_menu-button").hasClass("w--open")) {
      $('.tab_next').trigger("click");
    }
  }
  
  // Enhanced navigation with category awareness
  $('.tab-wrapper').on('click', '.tab_previous, .tab_next', function() {
    if (!$(".uui-navbar06_menu-button").hasClass("w--open")) {
      clearInterval(loop);
      var direction = $(this).hasClass('tab_previous') ? -1 : 1;
      var tablinks = $(this).parent().find('.w-tab-menu');
      var currentIndex = tablinks.find('.w--current').index();
      var newIndex = currentIndex + direction;
      
      // Check if we need to change category
      if (newIndex < 0) {
        // Go to previous category, last subcategory
        if (window.craftMenu) {
          window.craftMenu.previousCategory();
        }
      } else if (newIndex >= tablinks.children().length) {
        // Go to next category, first subcategory
        if (window.craftMenu) {
          window.craftMenu.nextCategory();
        }
      } else {
        // Stay in same category, change subcategory
        tablinks.find('.w-tab-link').eq(newIndex).trigger('click');
      }
      
      loop = setInterval(nextTab, 5000);
    }
  });
  
  if (!$(".uui-navbar06_menu-button").hasClass("w--open")) {
    var loop = setInterval(nextTab, 5000);
  }
  
  // Add this to the categoryChanged event listener
  document.addEventListener('categoryChanged', (e) => {
    // Reset story to first visible subcategory when category changes
    const firstVisibleTab = document.querySelector('.tab-button-demo:not([style*="display: none"])');
    if (firstVisibleTab) {
      firstVisibleTab.click();
    }
    
    // Reset any story timers
    if (typeof loop !== 'undefined') {
      clearInterval(loop);
      loop = setInterval(nextTab, 5000);
    }
  });
});

// Simplified Multi-instance Finsweet tabs script
class MultiInstanceTabsManager {
  constructor() {
    this.instances = [];
    this.init();
  }

  async init() {
    console.log('🚀 Initializing Multi-Instance Tabs Manager...');
    
    // Wait for content to load
    await this.waitForContent();
    
    // Create instances from arrays
    this.createInstancesFromArrays();
    
    // Initialize all instances
    this.initializeInstances();
    
    console.log(`✅ Initialized ${this.instances.length} tab instances`);
  }

  createInstancesFromArrays() {
    const tabsComponents = Array.from(document.querySelectorAll('.fs-tabs'));
    const collectionLists = Array.from(document.querySelectorAll('.fs-dynamic-feed'));
    const allTabContents = Array.from(document.querySelectorAll('.fs-tab-content'));
    
    console.log(`Found ${tabsComponents.length} tabs, ${collectionLists.length} lists, ${allTabContents.length} contents`);
    
    // Ensure we have matching numbers of tabs and lists
    const minLength = Math.min(tabsComponents.length, collectionLists.length);
    
    if (minLength === 0) {
      console.warn('⚠️ No matching tab components found');
      return;
    }
    
    // Group tab contents by their parent collection list
    for (let i = 0; i < minLength; i++) {
      const tabsComponent = tabsComponents[i];
      const collectionList = collectionLists[i];
      
      // Find all tab contents that belong to this collection list
      const tabContentsForThisList = allTabContents.filter(content => {
        // Check if the tab content is a child of this collection list
        return collectionList.contains(content);
      });
      
      console.log(`📋 Found ${tabContentsForThisList.length} tab contents for collection list ${i + 1}`);
      
      // Get category from the collection list or first tab content
      let category = collectionList.getAttribute('data-category');
      if (!category && tabContentsForThisList.length > 0) {
        category = tabContentsForThisList[0].getAttribute('data-category');
      }
      
      // If still no category, try to infer from collection list class or nearby elements
      if (!category) {
        // Look for category in collection list classes
        const classList = Array.from(collectionList.classList);
        const categoryClass = classList.find(cls => cls.includes('category-') || cls.includes('cat-'));
        if (categoryClass) {
          category = categoryClass.replace(/^(category-|cat-)/, '').replace(/-/g, ' ');
        }
      }
      
      // Fallback category
      if (!category) {
        category = `Category ${i + 1}`;
      }
      
      // Assign the category to the tabs component
      tabsComponent.setAttribute('data-category', category);
      console.log(`📋 Assigned category "${category}" to tabs component ${i + 1}`);
      
      // Create instance object with all tab contents for this collection
      const instance = {
        index: i,
        category: category,
        tabsComponent,
        collectionList,
        tabContents: tabContentsForThisList, // Array of all tab contents
        fsLibrary: null
      };
      
      this.instances.push(instance);
      console.log(`📦 Created instance ${i + 1}: ${instance.category} (${tabContentsForThisList.length} tab contents)`);
    }
  }

  initializeInstances() {
    this.instances.forEach((instance, index) => {
      try {
        // Initialize FsLibrary for this instance with all tab contents
        instance.fsLibrary = new FsLibrary({
          feed: instance.collectionList,
          tabs: instance.tabsComponent,
          tabContent: instance.tabContents // Pass the array of tab contents
        });
        
        console.log(`✅ Initialized FsLibrary for instance ${index + 1}: ${instance.category} with ${instance.tabContents.length} tab contents`);
      } catch (error) {
        console.error(`❌ Failed to initialize instance ${index + 1}:`, error);
      }
    });
  }

  // Utility methods
  getInstance(index) {
    return this.instances[index] || null;
  }

  getInstanceByCategory(category) {
    return this.instances.find(instance => instance.category === category) || null;
  }

  getInstanceByTabComponent(tabComponent) {
    return this.instances.find(instance => instance.tabsComponent === tabComponent) || null;
  }

  showCategory(categoryName) {
    const instance = this.getInstanceByCategory(categoryName);
    if (instance && instance.tabsComponent) {
      // Show the tabs component for this category
      instance.tabsComponent.style.display = 'block';
      
      // Hide other categories
      this.instances.forEach(otherInstance => {
        if (otherInstance !== instance && otherInstance.tabsComponent) {
          otherInstance.tabsComponent.style.display = 'none';
        }
      });
      
      console.log(`👁️ Showing category: ${categoryName}`);
      return true;
    }
    return false;
  }

  navigateToTab(categoryName, tabIndex) {
    const instance = this.getInstanceByCategory(categoryName);
    if (instance && instance.fsLibrary) {
      try {
        // Show the category first
        this.showCategory(categoryName);
        
        // Navigate to specific tab within that category
        const tabLinks = instance.tabsComponent.querySelectorAll('.w-tab-link');
        if (tabLinks[tabIndex]) {
          tabLinks[tabIndex].click();
          console.log(`🎯 Navigated to tab ${tabIndex} in category ${categoryName}`);
          return true;
        }
      } catch (error) {
        console.error(`❌ Failed to navigate to tab:`, error);
      }
    }
    return false;
  }

  refreshAllInstances() {
    this.instances.forEach((instance, index) => {
      if (instance.fsLibrary && typeof instance.fsLibrary.refresh === 'function') {
        try {
          instance.fsLibrary.refresh();
          console.log(`🔄 Refreshed instance ${index + 1}`);
        } catch (error) {
          console.error(`❌ Failed to refresh instance ${index + 1}:`, error);
        }
      }
    });
  }

  async waitForContent() {
    return new Promise((resolve) => {
      const checkContent = () => {
        const tabsComponents = document.querySelectorAll('.fs-tabs');
        const collectionLists = document.querySelectorAll('.fs-dynamic-feed');
        const tabContents = document.querySelectorAll('.fs-tab-content');
        
        if (tabsComponents.length > 0 && collectionLists.length > 0 && tabContents.length > 0) {
          console.log('📄 Content loaded, proceeding with initialization');
          resolve();
        } else {
          console.log('⏳ Waiting for content to load...');
          setTimeout(checkContent, 100);
        }
      };
      
      checkContent();
    });
  }

  debugInstances() {
    console.group('🔍 Multi-Instance Tabs Debug Info');
    console.log(`Total instances: ${this.instances.length}`);
    
    this.instances.forEach((instance, index) => {
      console.group(`Instance ${index + 1}: ${instance.category}`);
      console.log('Tabs Component:', instance.tabsComponent);
      console.log('Collection List:', instance.collectionList);
      console.log('Tab Content:', instance.tabContent);
      console.log('FsLibrary:', instance.fsLibrary);
      console.log('Category:', instance.category);
      console.groupEnd();
    });
    
    console.groupEnd();
  }
}

// Single initialization point with proper checks
(function initializeTabsManager() {
  // Prevent multiple initializations
  if (window.tabsManager) {
    console.log('📋 Tabs manager already initialized');
    return;
  }

  let initAttempts = 0;
  const maxAttempts = 30; // Maximum 30 seconds
  
  const initTabs = () => {
    initAttempts++;
    
    if (typeof FsLibrary !== 'undefined') {
      try {
        window.tabsManager = new MultiInstanceTabsManager();
        
        // Make debug method available globally
        window.debugMultiTabs = () => window.tabsManager.debugInstances();
        console.log('💡 TIP: Use debugMultiTabs() in console for debugging');
        console.log('✅ Tabs manager successfully initialized');
      } catch (error) {
        console.error('❌ Failed to initialize tabs manager:', error);
      }
    } else if (initAttempts < maxAttempts) {
      console.log(`⏳ Waiting for Finsweet library... (attempt ${initAttempts}/${maxAttempts})`);
      setTimeout(initTabs, 1000);
    } else {
      console.error('❌ Failed to load Finsweet library after 30 seconds. Please check if the library is properly loaded.');
    }
  };
  
  // Initialize immediately if DOM is ready, otherwise wait
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTabs);
  } else {
    initTabs();
  }
  
  // Also try on Webflow ready as backup
  if (typeof Webflow !== 'undefined') {
    Webflow.push(() => {
      if (!window.tabsManager) {
        initTabs();
      }
    });
  }
})();