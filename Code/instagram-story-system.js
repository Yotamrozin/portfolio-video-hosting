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
    // Wait for content to load
    await this.waitForContent();
    
    // Create instances from arrays
    this.createInstancesFromArrays();
    
    // Initialize all instances
    this.initializeInstances();
  }

  createInstancesFromArrays() {
    const tabsComponents = Array.from(document.querySelectorAll('.fs-tabs'));
    const collectionLists = Array.from(document.querySelectorAll('.fs-dynamic-feed'));
    const allTabContents = Array.from(document.querySelectorAll('.fs-tab-content'));
    
    const minLength = Math.min(tabsComponents.length, collectionLists.length);
    
    if (minLength === 0) {
      return;
    }
    
    for (let i = 0; i < minLength; i++) {
      const tabsComponent = tabsComponents[i];
      const collectionList = collectionLists[i];
      
      // Add unique IDs for reliable targeting
      const uniqueId = `tabs-instance-${i + 1}`;
      tabsComponent.setAttribute('data-tabs-id', uniqueId);
      collectionList.setAttribute('data-tabs-id', uniqueId);
      
      // Find all tab contents that belong to this collection list
      const tabContentsForThisList = allTabContents.filter(content => {
        return collectionList.contains(content);
      });
      
      // Get category logic (same as before)
      let category = collectionList.getAttribute('data-category');
      if (!category && tabContentsForThisList.length > 0) {
        category = tabContentsForThisList[0].getAttribute('data-category');
      }
      if (!category) {
        const classList = Array.from(collectionList.classList);
        const categoryClass = classList.find(cls => cls.includes('category-') || cls.includes('cat-'));
        if (categoryClass) {
          category = categoryClass.replace(/^(category-|cat-)/, '').replace(/-/g, ' ');
        }
      }
      if (!category) {
        category = `Category ${i + 1}`;
      }
      
      tabsComponent.setAttribute('data-category', category);
      
      const instance = {
        index: i,
        category: category,
        uniqueId: uniqueId,
        tabsComponent,
        collectionList,
        tabContents: tabContentsForThisList,
        fsLibrary: null
      };
      
      this.instances.push(instance);
    }
  }

  initializeInstances() {
    this.instances.forEach((instance, index) => {
      try {
        // Use unique ID selectors for reliable targeting
        const collectionListSelector = `[data-tabs-id="${instance.uniqueId}"].fs-dynamic-feed`;
        const tabsComponentSelector = `[data-tabs-id="${instance.uniqueId}"].fs-tabs`;
        
        // Create FsLibrary instance with CSS selector string
        instance.fsLibrary = new FsLibrary(collectionListSelector);
        
        // Call tabs method with CSS selectors
        instance.fsLibrary.tabs({
          tabComponent: tabsComponentSelector,
          tabContent: '.fs-tab-content'
        });
      } catch (error) {
        // Silent error handling
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
          return true;
        }
      } catch (error) {
        // Silent error handling
      }
    }
    return false;
  }

  refreshAllInstances() {
    this.instances.forEach((instance, index) => {
      if (instance.fsLibrary && typeof instance.fsLibrary.refresh === 'function') {
        try {
          instance.fsLibrary.refresh();
        } catch (error) {
          // Silent error handling
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
          resolve();
        } else {
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
      } catch (error) {
        // Silent error handling
      }
    } else if (initAttempts < maxAttempts) {
      setTimeout(initTabs, 1000);
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