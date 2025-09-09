// Enhanced story system integration with comprehensive debugging
var Webflow = Webflow || [];
Webflow.push(function() {
  // Debug: Check initial state
  console.group('🔍 Instagram Story System Debug - Initial State');
  console.log('DOM Ready State:', document.readyState);
  console.log('Webflow object:', typeof Webflow);
  console.log('jQuery available:', typeof $ !== 'undefined');
  
  // Debug: Check for tabs components and buttons
  const allTabsComponents = document.querySelectorAll('.fs-tabs');
  console.log('Total .fs-tabs components found:', allTabsComponents.length);
  
  allTabsComponents.forEach((component, index) => {
    const category = component.getAttribute('data-category') || 'Unknown';
    const isVisible = component.classList.contains('tabs-visible');
    const prevButtons = component.querySelectorAll('.tab_previous');
    const nextButtons = component.querySelectorAll('.tab_next');
    const tabLinks = component.querySelectorAll('.w-tab-link');
    const tabMenu = component.querySelector('.w-tab-menu');
    
    console.log(`📋 Tabs Component ${index + 1}:`, {
      category,
      isVisible,
      prevButtons: prevButtons.length,
      nextButtons: nextButtons.length,
      tabLinks: tabLinks.length,
      hasTabMenu: !!tabMenu,
      element: component
    });
    
    // Debug each button
    prevButtons.forEach((btn, btnIndex) => {
      console.log(`  ⬅️ Previous Button ${btnIndex + 1}:`, {
        visible: btn.offsetParent !== null,
        disabled: btn.disabled,
        classes: btn.className,
        element: btn
      });
    });
    
    nextButtons.forEach((btn, btnIndex) => {
      console.log(`  ➡️ Next Button ${btnIndex + 1}:`, {
        visible: btn.offsetParent !== null,
        disabled: btn.disabled,
        classes: btn.className,
        element: btn
      });
    });
    
    // Debug tab structure
    if (tabMenu) {
      const currentTab = tabMenu.querySelector('.w--current');
      const currentIndex = currentTab ? Array.from(tabMenu.children).indexOf(currentTab) : -1;
      console.log(`  📑 Tab Structure:`, {
        totalTabs: tabMenu.children.length,
        currentIndex,
        currentTab: currentTab ? currentTab.textContent.trim() : 'None'
      });
    }
  });
  
  console.groupEnd();
  
  // Debug: Check craftMenu availability
  console.log('🎛️ CraftMenu Status:', {
    available: !!window.craftMenu,
    hasNextCategory: window.craftMenu && typeof window.craftMenu.nextCategory === 'function',
    hasPreviousCategory: window.craftMenu && typeof window.craftMenu.previousCategory === 'function',
    craftMenu: window.craftMenu
  });
  
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
      console.log('⏭️ Auto nextTab triggered');
      // Only trigger next button in the visible tabs component
      $('.fs-tabs.tabs-visible .tab_next').trigger("click");
    }
  }
  
  // Debug: Test button selection
  console.group('🔍 Button Selection Debug');
  const allPrevButtons = document.querySelectorAll('.tab_previous');
  const allNextButtons = document.querySelectorAll('.tab_next');
  const visiblePrevButtons = document.querySelectorAll('.fs-tabs.tabs-visible .tab_previous');
  const visibleNextButtons = document.querySelectorAll('.fs-tabs.tabs-visible .tab_next');
  
  console.log('Button counts:', {
    allPrevButtons: allPrevButtons.length,
    allNextButtons: allNextButtons.length,
    visiblePrevButtons: visiblePrevButtons.length,
    visibleNextButtons: visibleNextButtons.length
  });
  console.groupEnd();
  
  // Navigation with comprehensive debugging
  $(document).on('click', '.tab_previous, .tab_next', function(e) {
    console.group('🎯 Button Click Debug');
    console.log('Button clicked:', {
      element: this,
      classes: this.className,
      isPrevious: $(this).hasClass('tab_previous'),
      isNext: $(this).hasClass('tab_next'),
      event: e
    });
    
    const closestTabsComponent = $(this).closest('.fs-tabs');
    console.log('Closest tabs component:', {
      found: closestTabsComponent.length > 0,
      isVisible: closestTabsComponent.hasClass('tabs-visible'),
      category: closestTabsComponent.attr('data-category'),
      element: closestTabsComponent[0]
    });
    
    if (!$(".uui-navbar06_menu-button").hasClass("w--open")) {
      clearInterval(loop);
      
      // Only proceed if this is the visible tabs component
      if (!closestTabsComponent.hasClass('tabs-visible')) {
        console.log('⚠️ Ignoring click on hidden tabs component');
        console.groupEnd();
        return;
      }
      
      var direction = $(this).hasClass('tab_previous') ? -1 : 1;
      var tablinks = closestTabsComponent.find('.w-tab-menu');
      var currentTab = tablinks.find('.w--current');
      var currentIndex = currentTab.index();
      var newIndex = currentIndex + direction;
      var totalTabs = tablinks.children().length;
      
      console.log('🎯 Navigation calculation:', {
        direction: direction > 0 ? 'next' : 'previous',
        currentIndex,
        newIndex,
        totalTabs,
        category: closestTabsComponent.attr('data-category'),
        currentTab: currentTab.length > 0 ? currentTab[0].textContent.trim() : 'None'
      });
      
      // Check if we need to change category
      if (newIndex < 0) {
        console.log('📱 Reached first tab - attempting category switch');
        console.log('CraftMenu check:', {
          available: !!window.craftMenu,
          hasPreviousCategory: window.craftMenu && typeof window.craftMenu.previousCategory === 'function'
        });
        
        if (window.craftMenu && typeof window.craftMenu.previousCategory === 'function') {
          console.log('🔄 Calling previousCategory()');
          window.craftMenu.previousCategory();
          
          setTimeout(() => {
            const visibleTablinks = $('.fs-tabs.tabs-visible .w-tab-menu');
            console.log('After category change - visible tabs:', {
              found: visibleTablinks.length > 0,
              totalTabs: visibleTablinks.length > 0 ? visibleTablinks.children().length : 0
            });
            
            if (visibleTablinks.length > 0) {
              const lastTabIndex = visibleTablinks.children().length - 1;
              const lastTab = visibleTablinks.find('.w-tab-link').eq(lastTabIndex);
              console.log('Clicking last tab:', { index: lastTabIndex, element: lastTab[0] });
              lastTab.trigger('click');
            }
          }, 200);
        } else {
          console.error('❌ CraftMenu previousCategory method not available');
        }
      } else if (newIndex >= totalTabs) {
        console.log('📱 Reached last tab - attempting category switch');
        console.log('CraftMenu check:', {
          available: !!window.craftMenu,
          hasNextCategory: window.craftMenu && typeof window.craftMenu.nextCategory === 'function'
        });
        
        if (window.craftMenu && typeof window.craftMenu.nextCategory === 'function') {
          console.log('🔄 Calling nextCategory()');
          window.craftMenu.nextCategory();
          
          setTimeout(() => {
            const visibleTablinks = $('.fs-tabs.tabs-visible .w-tab-menu');
            console.log('After category change - visible tabs:', {
              found: visibleTablinks.length > 0,
              totalTabs: visibleTablinks.length > 0 ? visibleTablinks.children().length : 0
            });
            
            if (visibleTablinks.length > 0) {
              const firstTab = visibleTablinks.find('.w-tab-link').eq(0);
              console.log('Clicking first tab:', { element: firstTab[0] });
              firstTab.trigger('click');
            }
          }, 200);
        } else {
          console.error('❌ CraftMenu nextCategory method not available');
        }
      } else {
        console.log('🎯 Staying in same category - changing tab');
        const targetTab = tablinks.find('.w-tab-link').eq(newIndex);
        console.log('Target tab:', {
          index: newIndex,
          element: targetTab[0],
          text: targetTab.length > 0 ? targetTab[0].textContent.trim() : 'None'
        });
        targetTab.trigger('click');
      }
      
      loop = setInterval(nextTab, 5000);
    }
    
    console.groupEnd();
  });
  
  if (!$(".uui-navbar06_menu-button").hasClass("w--open")) {
    var loop = setInterval(nextTab, 5000);
  }
  
  // Enhanced category change event listener
  // Category change event listener with better timing
  document.addEventListener('categoryChanged', (e) => {
    console.log('📂 Category changed event received:', e.detail);
    
    // Reset story to first visible subcategory when category changes
    setTimeout(() => {
      const firstVisibleTab = document.querySelector('.fs-tabs.tabs-visible .w-tab-link');
      if (firstVisibleTab) {
        firstVisibleTab.click();
        console.log('🎯 Reset to first tab of new category');
      }
    }, 100);
    
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
    this.isInitialized = false;
    this.init();
  }

  async init() {
    // Wait for content to load
    await this.waitForContent();
    
    // Create instances from arrays
    this.createInstancesFromArrays();
    
    // Initialize all instances
    this.initializeInstances();
    
    // Set initial state - hide all tabs except first active category
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
        console.log(`🎯 Initial state: Showing tabs for category "${firstInstance.category}"`);
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
      
      console.log(`🔄 Category switched: Showing tabs for "${categoryName}"`);
      return true;
    } else {
      console.warn(`⚠️ No tabs component found for category: "${categoryName}"`);
      return false;
    }
  }

  createInstancesFromArrays() {
    const tabsComponents = Array.from(document.querySelectorAll('.fs-tabs'));
    const collectionLists = Array.from(document.querySelectorAll('.fs-dynamic-feed'));
    const allTabContents = Array.from(document.querySelectorAll('.fs-tab-content'));
    
    const minLength = Math.min(tabsComponents.length, collectionLists.length);
    
    if (minLength === 0) {
      console.warn('⚠️ No matching tabs components and collection lists found');
      return;
    }
    
    // Track which tabs components get paired
    const pairedTabsComponents = new Set();
    
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
        console.warn('🔍 Orphaned tabs component found (hiding):', tabsComponent);
        tabsComponent.style.display = 'none';
      }
    });
    
    console.log(`✅ Created ${this.instances.length} tabs instances`);
    this.instances.forEach(instance => {
      console.log(`   📂 Category: "${instance.category}" (${instance.tabContents.length} tab contents)`);
    });
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
  const maxAttempts = 10;
  
  const initTabs = () => {
    initAttempts++;
    
    if (typeof FsLibrary !== 'undefined') {
      try {
        window.tabsManager = new MultiInstanceTabsManager();
        
        // Make debug method available globally
        window.debugMultiTabs = () => window.tabsManager.debugInstances();
        
        console.log('🎉 TabsManager initialized and available globally as window.tabsManager');
      } catch (error) {
        console.error('❌ Error initializing TabsManager:', error);
      }
    } else if (initAttempts < maxAttempts) {
      setTimeout(initTabs, 1000);
    } else {
      console.error('❌ Failed to initialize TabsManager: FsLibrary not found after maximum attempts');
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

// Navigation with proper DOM structure detection
$(document).on('click', '.tab_previous, .tab_next', function(e) {
  console.log('🎯 Button clicked:', this.className);
  
  if (!$(".uui-navbar06_menu-button").hasClass("w--open")) {
    clearInterval(loop);
    
    // Find the visible tabs component (not necessarily a parent)
    var visibleTabsComponent = $('.fs-tabs.tabs-visible');
    
    if (visibleTabsComponent.length === 0) {
      console.log('⚠️ No visible tabs component found');
      return;
    }
    
    var direction = $(this).hasClass('tab_previous') ? -1 : 1;
    var tablinks = visibleTabsComponent.find('.w-tab-menu');
    var currentTab = tablinks.find('.w--current');
    var currentIndex = currentTab.index();
    var newIndex = currentIndex + direction;
    var totalTabs = tablinks.children().length;
    
    console.log('🎯 Navigation:', {
      direction: direction > 0 ? 'next' : 'previous',
      currentIndex,
      newIndex,
      totalTabs,
      category: visibleTabsComponent.attr('data-category')
    });
    
    // Check if we need to change category
    if (newIndex < 0) {
      console.log('📱 Switching to previous category');
      if (window.craftMenu && typeof window.craftMenu.previousCategory === 'function') {
        window.craftMenu.previousCategory();
        
        setTimeout(() => {
          const newVisibleTablinks = $('.fs-tabs.tabs-visible .w-tab-menu');
          if (newVisibleTablinks.length > 0) {
            const lastTabIndex = newVisibleTablinks.children().length - 1;
            newVisibleTablinks.find('.w-tab-link').eq(lastTabIndex).trigger('click');
            console.log(`🎯 Navigated to last tab (${lastTabIndex})`);
          }
        }, 200);
      }
    } else if (newIndex >= totalTabs) {
      console.log('📱 Switching to next category');
      if (window.craftMenu && typeof window.craftMenu.nextCategory === 'function') {
        window.craftMenu.nextCategory();
        
        setTimeout(() => {
          const newVisibleTablinks = $('.fs-tabs.tabs-visible .w-tab-menu');
          if (newVisibleTablinks.length > 0) {
            newVisibleTablinks.find('.w-tab-link').eq(0).trigger('click');
            console.log('🎯 Navigated to first tab');
          }
        }, 200);
      }
    } else {
      console.log('🎯 Staying in same category');
      const targetTab = tablinks.find('.w-tab-link').eq(newIndex);
      targetTab.trigger('click');
      console.log(`🎯 Navigated to tab ${newIndex}`);
    }
    
    loop = setInterval(nextTab, 5000);
  }
});

// Add this at the end of the file, before the closing })();
window.debugTabSystem = function() {
  console.group('🔍 Complete Tab System Debug');
  
  // Check tabs manager
  console.log('TabsManager:', {
    available: !!window.tabsManager,
    initialized: window.tabsManager ? window.tabsManager.isInitialized : false,
    instances: window.tabsManager ? window.tabsManager.instances.length : 0
  });
  
  // Check craft menu
  console.log('CraftMenu:', {
    available: !!window.craftMenu,
    hasNextCategory: window.craftMenu && typeof window.craftMenu.nextCategory === 'function',
    hasPreviousCategory: window.craftMenu && typeof window.craftMenu.previousCategory === 'function'
  });
  
  // Check all tabs components
  const allTabs = document.querySelectorAll('.fs-tabs');
  allTabs.forEach((tab, index) => {
    const buttons = {
      prev: tab.querySelectorAll('.tab_previous').length,
      next: tab.querySelectorAll('.tab_next').length
    };
    
    console.log(`Tabs Component ${index + 1}:`, {
      category: tab.getAttribute('data-category'),
      visible: tab.classList.contains('tabs-visible'),
      buttons,
      tabCount: tab.querySelectorAll('.w-tab-link').length
    });
  });
  
  // Check button locations
  const allPrevButtons = document.querySelectorAll('.tab_previous');
  const allNextButtons = document.querySelectorAll('.tab_next');
  console.log('Button locations:', {
    prevButtons: allPrevButtons.length,
    nextButtons: allNextButtons.length
  });
  
  console.groupEnd();
};
