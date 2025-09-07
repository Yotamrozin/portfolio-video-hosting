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
});// Enhanced story system integration
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
    
    // Wait for DOM and potential CMS content to load
    await this.waitForContent();
    
    // Create instances by pairing arrays sequentially
    this.createInstancesFromArrays();
    
    // Initialize each instance
    this.initializeInstances();
    
    console.log(`✅ Initialized ${this.instances.length} tab instances`);
  }

  createInstancesFromArrays() {
    // Get all elements as arrays
    const tabComponents = Array.from(document.querySelectorAll('.fs-tabs'));
    const collectionLists = Array.from(document.querySelectorAll('.fs-dynamic-feed'));
    const tabContents = Array.from(document.querySelectorAll('.fs-tab-content'));
    
    console.log(`📋 Found elements:`, {
      tabComponents: tabComponents.length,
      collectionLists: collectionLists.length,
      tabContents: tabContents.length
    });
    
    // Determine how many instances we can create
    const maxInstances = Math.min(tabComponents.length, collectionLists.length, tabContents.length);
    
    if (maxInstances === 0) {
      console.warn('⚠️ No complete sets of elements found');
      return;
    }
    
    // Create instances by pairing elements sequentially
    for (let i = 0; i < maxInstances; i++) {
      const tabContent = tabContents[i];
      const category = tabContent.getAttribute('data-category');
      
      // Set the data-category attribute on the tabs component
      if (category) {
        tabComponents[i].setAttribute('data-category', category);
        console.log(`🏷️ Set tabs component ${i} category to: "${category}"`);
      }
      
      this.instances.push({
        id: `tabs-instance-${i}`,
        category: category || `instance-${i}`,
        tabComponent: tabComponents[i],
        collectionList: collectionLists[i],
        tabContent: tabContents[i],
        index: i
      });
      
      console.log(`📋 Created instance ${i}:`, {
        category: category,
        tabComponent: tabComponents[i].className,
        collectionList: collectionLists[i].className,
        tabContent: tabContents[i].className
      });
    }
    
    // Warn if there are unmatched elements
    if (tabComponents.length !== collectionLists.length || collectionLists.length !== tabContents.length) {
      console.warn('⚠️ Unequal number of elements - some may not be paired:', {
        tabComponents: tabComponents.length,
        collectionLists: collectionLists.length,
        tabContents: tabContents.length
      });
    }
  }

  initializeInstances() {
    this.instances.forEach((instance, index) => {
      try {
        console.log(`🔧 Initializing instance ${index}: "${instance.category}"`);
        
        // Create a new FsLibrary instance for this specific collection list
        const fsInstance = new FsLibrary(instance.collectionList);
        
        // Initialize tabs for this specific instance
        fsInstance.tabs({
          tabComponent: instance.tabComponent,
          tabContent: instance.tabContent
        });
        
        // Store the Finsweet instance reference
        instance.fsInstance = fsInstance;
        
        console.log(`✅ Instance ${index} ("${instance.category}") initialized successfully`);
        
      } catch (error) {
        console.error(`❌ Error initializing instance ${index}:`, error);
      }
    });
  }

  // Get specific instance by index
  getInstance(index) {
    return this.instances[index];
  }

  // Get instance by category name
  getInstanceByCategory(category) {
    return this.instances.find(instance => instance.category === category);
  }

  // Get instance by tab component element
  getInstanceByTabComponent(tabComponent) {
    return this.instances.find(instance => instance.tabComponent === tabComponent);
  }

  // Show specific category (hide others)
  showCategory(categoryName) {
    this.instances.forEach(instance => {
      if (instance.category === categoryName) {
        instance.tabComponent.style.display = 'block';
        instance.tabComponent.classList.add('active-category');
        console.log(`👁️ Showing category: "${categoryName}"`);
      } else {
        instance.tabComponent.style.display = 'none';
        instance.tabComponent.classList.remove('active-category');
      }
    });
  }

  // Navigate to specific tab within a category
  navigateToTab(categoryName, tabIndex) {
    const instance = this.getInstanceByCategory(categoryName);
    if (instance && instance.fsInstance) {
      // This would depend on Finsweet's API for programmatic navigation
      const tabLinks = instance.tabComponent.querySelectorAll('.w-tab-link');
      if (tabLinks[tabIndex]) {
        tabLinks[tabIndex].click();
        console.log(`🎯 Navigated to tab ${tabIndex} in category "${categoryName}"`);
      }
    }
  }

  // Refresh all instances (useful if content changes)
  refreshAllInstances() {
    console.log('🔄 Refreshing all tab instances...');
    this.instances.forEach((instance, index) => {
      if (instance.fsInstance && instance.fsInstance.refresh) {
        instance.fsInstance.refresh();
      }
    });
  }

  // Wait for content to load
  waitForContent() {
    return new Promise((resolve) => {
      const checkContent = () => {
        const tabComponents = document.querySelectorAll('.fs-tabs');
        const collectionLists = document.querySelectorAll('.fs-dynamic-feed');
        const tabContents = document.querySelectorAll('.fs-tab-content');
        
        if (tabComponents.length > 0 && collectionLists.length > 0 && tabContents.length > 0) {
          resolve();
        } else {
          setTimeout(checkContent, 100);
        }
      };
      checkContent();
    });
  }

  // Debug method
  debugInstances() {
    console.log('🔍 === MULTI-INSTANCE DEBUG ===');
    console.log(`Total instances: ${this.instances.length}`);
    
    this.instances.forEach((instance, index) => {
      console.log(`\nInstance ${index} ("${instance.category}"):`, {
        id: instance.id,
        category: instance.category,
        tabComponent: instance.tabComponent,
        collectionList: instance.collectionList,
        tabContent: instance.tabContent,
        fsInstance: instance.fsInstance ? '✅ Initialized' : '❌ Not initialized'
      });
    });
    
    // Show current visibility states
    console.log('\n👁️ Visibility States:');
    this.instances.forEach((instance, index) => {
      const isVisible = instance.tabComponent.style.display !== 'none';
      console.log(`  ${instance.category}: ${isVisible ? '✅ Visible' : '❌ Hidden'}`);
    });
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
      setTimeout(initTabs, 100);
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
          setTimeout(initTabs, 100);
        }
      };
      initTabs();
    }
  });
}