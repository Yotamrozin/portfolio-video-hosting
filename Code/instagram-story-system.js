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
    const tabContents = Array.from(document.querySelectorAll('.fs-tab-content'));
    
    console.log(`Found ${tabsComponents.length} tabs, ${collectionLists.length} lists, ${tabContents.length} contents`);
    
    // Ensure we have matching numbers
    const minLength = Math.min(tabsComponents.length, collectionLists.length, tabContents.length);
    
    if (minLength === 0) {
      console.warn('⚠️ No matching tab components found');
      return;
    }
    
    // Create instances by pairing elements sequentially
    for (let i = 0; i < minLength; i++) {
      const tabsComponent = tabsComponents[i];
      const collectionList = collectionLists[i];
      const tabContent = tabContents[i];
      
      // Get category from tab content's data-category attribute
      const category = tabContent.getAttribute('data-category');
      
      if (category) {
        // Assign the same category to the tabs component
        tabsComponent.setAttribute('data-category', category);
        console.log(`📋 Assigned category "${category}" to tabs component ${i + 1}`);
      }
      
      // Create instance object
      const instance = {
        index: i,
        category: category || `category-${i + 1}`,
        tabsComponent,
        collectionList,
        tabContent,
        fsLibrary: null
      };
      
      this.instances.push(instance);
      console.log(`📦 Created instance ${i + 1}: ${instance.category}`);
    }
  }

  initializeInstances() {
    this.instances.forEach((instance, index) => {
      try {
        // Initialize FsLibrary for this instance
        instance.fsLibrary = new FsLibrary({
          feed: instance.collectionList,
          tabs: instance.tabsComponent,
          tabContent: instance.tabContent
        });
        
        console.log(`✅ Initialized FsLibrary for instance ${index + 1}: ${instance.category}`);
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Wait for Finsweet library to load
  const initTabs = () => {
    if (typeof FsLibrary !== 'undefined') {
      window.tabsManager = new MultiInstanceTabsManager();
      
      // Make debug method available globally
      window.debugMultiTabs = () => window.tabsManager.debugInstances();
      console.log('💡 TIP: Use debugMultiTabs() in console for debugging');
    } else {
      console.log('⏳ Waiting for Finsweet library...');
      setTimeout(initTabs, 1000); // Increased timeout to reduce console spam
    }
  };
  
  initTabs();
});

// Also initialize on Webflow ready (for Webflow-specific timing)
if (typeof Webflow !== 'undefined') {
  Webflow.push(() => {
    if (!window.tabsManager) {
      const initTabs = () => {
        if (typeof FsLibrary !== 'undefined') {
          window.tabsManager = new MultiInstanceTabsManager();
        } else {
          setTimeout(initTabs, 1000); // Increased timeout to reduce console spam
        }
      };
      initTabs();
    }
  });
}