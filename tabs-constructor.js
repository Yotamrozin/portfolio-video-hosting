/**
 * Standalone Tabs Constructor
 * Handles pairing CMS collections with tabs components and Finsweet initialization
 */

class TabsConstructor {
  constructor() {
    this.instances = [];
    this.isInitialized = false;
  }

  async init() {
    // Wait for content to load
    await this.waitForContent();
    
    // Create instances from CMS collections and tabs components
    this.createInstancesFromArrays();
    
    // Initialize Finsweet for all instances
    this.initializeInstances();
    
    this.isInitialized = true;
    console.log('✅ Tabs Constructor initialized');
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
      
      // Extract category from data attributes or class names
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
      
      // Set category attribute on tabs component
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
        
        console.log(`✅ Initialized Finsweet for: ${instance.category}`);
      } catch (error) {
        console.warn(`⚠️ Failed to initialize tabs for ${instance.category}:`, error);
      }
    });
  }

  // Utility methods for external access
  getInstance(index) {
    return this.instances[index] || null;
  }

  getInstanceByCategory(category) {
    return this.instances.find(instance => instance.category === category) || null;
  }

  getAllInstances() {
    return this.instances;
  }

  refreshAllInstances() {
    this.instances.forEach((instance, index) => {
      if (instance.fsLibrary && typeof instance.fsLibrary.refresh === 'function') {
        try {
          instance.fsLibrary.refresh();
          console.log(`🔄 Refreshed: ${instance.category}`);
        } catch (error) {
          console.warn(`⚠️ Failed to refresh ${instance.category}:`, error);
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
    console.group('🔍 Tabs Constructor Debug Info');
    console.log(`Total instances: ${this.instances.length}`);
    
    this.instances.forEach((instance, index) => {
      console.group(`Instance ${index + 1}: ${instance.category}`);
      console.log('Tabs Component:', instance.tabsComponent);
      console.log('Collection List:', instance.collectionList);
      console.log('Tab Contents:', instance.tabContents);
      console.log('FsLibrary:', instance.fsLibrary);
      console.log('Unique ID:', instance.uniqueId);
      console.groupEnd();
    });
    
    console.groupEnd();
  }
}

// Initialize the tabs constructor
(function initializeTabsConstructor() {
  // Prevent multiple initializations
  if (window.tabsConstructor) {
    return;
  }

  let initAttempts = 0;
  const maxAttempts = 10;
  
  const initTabs = () => {
    initAttempts++;
    
    if (typeof FsLibrary !== 'undefined') {
      try {
        window.tabsConstructor = new TabsConstructor();
        window.tabsConstructor.init();
        
        // Make debug method available globally
        window.debugTabsConstructor = () => window.tabsConstructor.debugInstances();
        
        console.log('🎉 TabsConstructor initialized and available globally as window.tabsConstructor');
      } catch (error) {
        console.error('❌ Error initializing TabsConstructor:', error);
      }
    } else if (initAttempts < maxAttempts) {
      setTimeout(initTabs, 1000);
    } else {
      console.error('❌ Failed to initialize TabsConstructor: FsLibrary not found after maximum attempts');
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
      if (!window.tabsConstructor) {
        initTabs();
      }
    });
  }
})();