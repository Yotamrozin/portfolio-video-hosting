var Webflow = Webflow || [];
Webflow.push(function () {
  'use strict';

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

  // Simple navigation functions (from original working code)
  var loop;
  
  function nextTab() {
    if (!$(".uui-navbar06_menu-button").hasClass("w--open")) {
      $('.fs-tabs.tabs-visible .tab_next').trigger("click");
    }
  }

  // Start auto-advance only if menu is closed
  if (!$(".uui-navbar06_menu-button").hasClass("w--open")) {
    loop = setInterval(nextTab, 5000);
  }

  // Button navigation (based on original working code)
  $(document).on('click', '.tab_previous, .tab_next', function() {
    if (!$(".uui-navbar06_menu-button").hasClass("w--open")) {
      clearInterval(loop);
      
      // Only work with visible tabs component
      var tabsComponent = $(this).closest('.fs-tabs.tabs-visible');
      if (tabsComponent.length === 0) return;
      
      var direction = $(this).hasClass('tab_previous') ? -1 : 1;
      var tablinks = tabsComponent.find('.w-tab-menu');
      var currentIndex = tablinks.find('.w--current').index();
      var newIndex = currentIndex + direction;
      var totalTabs = tablinks.children().length;
      
      // Handle category switching at boundaries
      if (newIndex < 0) {
        // Go to previous category, last tab
        if (window.craftMenu && typeof window.craftMenu.previousCategory === 'function') {
          window.craftMenu.previousCategory();
          setTimeout(() => {
            const visibleTablinks = $('.fs-tabs.tabs-visible .w-tab-menu');
            if (visibleTablinks.length > 0) {
              const lastIndex = visibleTablinks.children().length - 1;
              visibleTablinks.find('.w-tab-link').eq(lastIndex).trigger('click');
            }
          }, 200);
        }
      } else if (newIndex >= totalTabs) {
        // Go to next category, first tab
        if (window.craftMenu && typeof window.craftMenu.nextCategory === 'function') {
          window.craftMenu.nextCategory();
          setTimeout(() => {
            const visibleTablinks = $('.fs-tabs.tabs-visible .w-tab-menu');
            if (visibleTablinks.length > 0) {
              visibleTablinks.find('.w-tab-link').eq(0).trigger('click');
            }
          }, 200);
        }
      } else {
        // Stay in same category
        tablinks.find('.w-tab-link').eq(newIndex).trigger('click');
      }
      
      // Restart auto-advance
      loop = setInterval(nextTab, 5000);
    }
  });

  // Category change handler
  document.addEventListener('categoryChanged', () => {
    clearInterval(loop);
    setTimeout(() => {
      const firstVisibleTab = document.querySelector('.fs-tabs.tabs-visible .w-tab-link');
      if (firstVisibleTab) {
        firstVisibleTab.click();
      }
      loop = setInterval(nextTab, 5000);
    }, 100);
  });
});

// Multi-instance Finsweet tabs script (from old working system)
class MultiInstanceTabsManager {
  constructor() {
    this.instances = [];
    this.isInitialized = false;
    this.init();
  }

  async init() {
    await this.waitForContent();
    this.createInstancesFromArrays();
    this.initializeInstances();
    this.setInitialVisibilityState();
    this.isInitialized = true;
  }

  setInitialVisibilityState() {
    // Hide all tabs components initially
    this.instances.forEach(instance => {
      if (instance.tabsComponent) {
        instance.tabsComponent.classList.remove('tabs-visible');
      }
    });
    
    // Show the first category's tabs component
    if (this.instances.length > 0) {
      const firstInstance = this.instances[0];
      if (firstInstance.tabsComponent) {
        firstInstance.tabsComponent.classList.add('tabs-visible');
      }
    }
  }

  showCategory(categoryName) {
    const instance = this.getInstanceByCategory(categoryName);
    if (instance && instance.tabsComponent) {
      // Hide all tabs components
      this.instances.forEach(otherInstance => {
        if (otherInstance.tabsComponent) {
          otherInstance.tabsComponent.classList.remove('tabs-visible');
        }
      });
      
      // Show the target tabs component
      instance.tabsComponent.classList.add('tabs-visible');
      return true;
    }
    return false;
  }

  createInstancesFromArrays() {
    const tabsComponents = Array.from(document.querySelectorAll('.fs-tabs'));
    const collectionLists = Array.from(document.querySelectorAll('.fs-dynamic-feed'));
    const allTabContents = Array.from(document.querySelectorAll('.fs-tab-content'));
    
    const minLength = Math.min(tabsComponents.length, collectionLists.length);
    if (minLength === 0) return;
    
    const pairedTabsComponents = new Set();
    
    for (let i = 0; i < minLength; i++) {
      const tabsComponent = tabsComponents[i];
      const collectionList = collectionLists[i];
      
      const uniqueId = `tabs-instance-${i + 1}`;
      tabsComponent.setAttribute('data-tabs-id', uniqueId);
      collectionList.setAttribute('data-tabs-id', uniqueId);
      
      const tabContentsForThisList = allTabContents.filter(content => {
        return collectionList.contains(content);
      });
      
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
      pairedTabsComponents.add(tabsComponent);
      
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
    
    // Handle orphaned tabs components
    tabsComponents.forEach(tabsComponent => {
      if (!pairedTabsComponents.has(tabsComponent)) {
        tabsComponent.style.display = 'none';
      }
    });
  }

  initializeInstances() {
    this.instances.forEach((instance) => {
      try {
        const collectionListSelector = `[data-tabs-id="${instance.uniqueId}"].fs-dynamic-feed`;
        const tabsComponentSelector = `[data-tabs-id="${instance.uniqueId}"].fs-tabs`;
        
        instance.fsLibrary = new FsLibrary(collectionListSelector);
        instance.fsLibrary.tabs({
          tabComponent: tabsComponentSelector,
          tabContent: '.fs-tab-content'
        });
      } catch (error) {
        // Silent error handling
      }
    });
  }

  getInstanceByCategory(category) {
    return this.instances.find(instance => instance.category === category) || null;
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
}

// Initialize tabs manager (from old working system)
(function initializeTabsManager() {
  if (window.tabsManager) return;
  
  let initAttempts = 0;
  const maxAttempts = 10;
  
  const initTabs = () => {
    initAttempts++;
    
    if (typeof FsLibrary !== 'undefined') {
      try {
        window.tabsManager = new MultiInstanceTabsManager();
      } catch (error) {
        console.error('Error initializing TabsManager:', error);
      }
    } else if (initAttempts < maxAttempts) {
      setTimeout(initTabs, 1000);
    }
  };
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTabs);
  } else {
    initTabs();
  }
  
  if (typeof Webflow !== 'undefined') {
    Webflow.push(() => {
      if (!window.tabsManager) {
        initTabs();
      }
    });
  }
})();
