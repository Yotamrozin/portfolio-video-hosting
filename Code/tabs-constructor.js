/**
 * Standalone Tabs Constructor
 * Handles pairing CMS collections with tabs components and Finsweet initialization independently
 * Optimized with promise-based API, enhanced error handling, and performance improvements
 */

class TabsConstructor {
  constructor() {
    this.instances = [];
    this.isInitialized = false;
    this.initPromise = null;
    this.retryCount = 0;
    this.maxRetries = 1;
  }

  async init() {
    // Prevent multiple initializations
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._performInit();
    return this.initPromise;
  }

  async _performInit() {
    const initStartTime = this._startPerformanceTimer('total-init');
    
    try {
      console.log('TabsConstructor: Starting initialization...');
      
      // Enhanced ready check with timeout
      const readyStartTime = this._startPerformanceTimer('webflow-ready');
      await this.waitForWebflowReady();
      this._endPerformanceTimer('webflow-ready', readyStartTime);
      
      const contentStartTime = this._startPerformanceTimer('content-wait');
      await this.waitForContent();
      this._endPerformanceTimer('content-wait', contentStartTime);
      
      const createStartTime = this._startPerformanceTimer('create-instances');
      this.createInstancesFromArrays();
      this._endPerformanceTimer('create-instances', createStartTime);
      
      const initInstancesStartTime = this._startPerformanceTimer('init-instances');
      await this.initializeInstances();
      this._endPerformanceTimer('init-instances', initInstancesStartTime);
      
      // Set global flag and dispatch enhanced event
      window.tabsConstructorComplete = true;
      this.isInitialized = true;
      
      const totalDuration = this._endPerformanceTimer('total-init', initStartTime);
      
      const event = new CustomEvent('tabsConstructorReady', {
        detail: {
          instanceCount: this.instances.length,
          categories: this.instances.map(i => i.category),
          timestamp: Date.now(),
          performanceMetrics: {
            totalDuration,
            hasObserver: typeof MutationObserver !== 'undefined'
          }
        }
      });
      document.dispatchEvent(event);
      
      console.log('TabsConstructor: ✅ Initialization complete!', {
        instances: this.instances.length,
        categories: this.instances.map(i => i.category),
        duration: `${totalDuration}ms`
      });
      
      return true;
    } catch (error) {
      this._endPerformanceTimer('total-init', initStartTime);
      console.error('❌ TabsConstructor initialization failed:', error);
      
      // Single retry with enhanced error handling
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.warn(`🔄 Retrying initialization (attempt ${this.retryCount + 1}/${this.maxRetries + 1})...`);
        
        // Reset state for retry
        this.instances = [];
        this.initPromise = null;
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.init();
      } else {
        console.error('❌ TabsConstructor: Maximum retry attempts reached. Initialization failed.');
        throw error;
      }
    }
  }

  waitForWebflowReady() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout waiting for Webflow ready'));
      }, 10000); // 10 second timeout

      if (document.readyState === 'complete' || window.Webflow) {
        clearTimeout(timeout);
        console.log('TabsConstructor: Page already ready, proceeding immediately');
        resolve();
      } else {
        console.log('TabsConstructor: Waiting for page readiness...');
        
        const onReady = () => {
          clearTimeout(timeout);
          document.removeEventListener('DOMContentLoaded', onReady);
          resolve();
        };
        
        document.addEventListener('DOMContentLoaded', onReady);
      }
    });
  }

  async waitForContent() {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 40; // 6 seconds max (40 * 150ms)
      const timeout = setTimeout(() => {
        reject(new Error('Timeout waiting for content'));
      }, 15000); // 15 second absolute timeout
      
      const checkContent = () => {
        try {
          const tabsComponents = document.querySelectorAll('.fs-tabs');
          const collectionLists = document.querySelectorAll('.fs-dynamic-feed');
          const tabContents = document.querySelectorAll('.fs-tab-content');
          
          if (tabsComponents.length > 0 && collectionLists.length > 0 && tabContents.length > 0) {
            clearTimeout(timeout);
            console.log(`TabsConstructor: ✅ Content ready after ${attempts * 150}ms`);
            resolve();
          } else if (attempts >= maxAttempts) {
            clearTimeout(timeout);
            console.warn('TabsConstructor: ⚠ Timeout waiting for content, proceeding anyway');
            resolve(); // Proceed even if not all content is ready
          } else {
            attempts++;
            setTimeout(checkContent, 150);
          }
        } catch (error) {
          clearTimeout(timeout);
          reject(error);
        }
      };
      
      checkContent();
    });
  }

  createInstancesFromArrays() {
    try {
      // Single query set at the start of method
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
        
        // Validate elements exist and are in DOM
        if (!tabsComponent || !collectionList || !document.contains(tabsComponent) || !document.contains(collectionList)) {
          console.warn(`⚠️ Invalid elements at index ${i}, skipping`);
          continue;
        }
        
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
          fsLibrary: null,
          initialized: false
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
    } catch (error) {
      console.error('❌ Error creating instances:', error);
      throw error;
    }
  }

  async initializeInstances() {
    if (this.instances.length === 0) {
      console.warn('⚠️ No instances to initialize');
      return;
    }

    console.log(`🚀 Initializing ${this.instances.length} Finsweet instances...`);
    
    const initPromises = this.instances.map(async (instance, index) => {
      try {
        // Validate FsLibrary availability
        if (typeof FsLibrary === 'undefined') {
          throw new Error('FsLibrary is not available');
        }

        const collectionListSelector = `[data-tabs-id="${instance.uniqueId}"].fs-dynamic-feed`;
        const tabsComponentSelector = `[data-tabs-id="${instance.uniqueId}"].fs-tabs`;
        
        // Verify elements still exist
        const collectionElement = document.querySelector(collectionListSelector);
        const tabsElement = document.querySelector(tabsComponentSelector);
        
        if (!collectionElement || !tabsElement) {
          throw new Error(`Elements not found for ${instance.category}`);
        }
        
        // Create FsLibrary instance
        instance.fsLibrary = new FsLibrary(collectionListSelector);
        
        // Initialize tabs with promise wrapper
        await new Promise((resolve, reject) => {
          try {
            const result = instance.fsLibrary.tabs({
              tabComponent: tabsComponentSelector,
              tabContent: '.fs-tab-content',
              resetIx: false // Skip expensive Webflow reinitialization
            });
            
            // Handle both sync and async returns
            if (result && typeof result.then === 'function') {
              result.then(resolve).catch(reject);
            } else {
              resolve(result);
            }
          } catch (error) {
            reject(error);
          }
        });
        
        instance.initialized = true;
        console.log(`✅ Initialized Finsweet for: ${instance.category}`);
        return { success: true, category: instance.category };
      } catch (error) {
        console.warn(`⚠️ Failed to initialize tabs for ${instance.category}:`, error);
        return { success: false, category: instance.category, error: error.message };
      }
    });
    
    // Wait for all instances to complete
    const results = await Promise.all(initPromises);
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success);
    
    console.log(`🎯 Finsweet initialization complete: ${successful}/${this.instances.length} successful`);
    
    if (failed.length > 0) {
      console.warn('⚠️ Failed initializations:', failed);
    }
    
    return results;
  }

  // Enhanced utility methods
  getInstance(index) {
    return this.instances[index] || null;
  }

  getInstanceByCategory(category) {
    return this.instances.find(instance => 
      instance.category.toLowerCase() === category.toLowerCase()
    ) || null;
  }

  getAllInstances() {
    return [...this.instances]; // Return copy to prevent external mutation
  }

  getInitializedInstances() {
    return this.instances.filter(instance => instance.initialized);
  }

  async refreshAllInstances() {
    const refreshPromises = this.instances.map(async (instance) => {
      if (instance.fsLibrary && typeof instance.fsLibrary.refresh === 'function') {
        try {
          await instance.fsLibrary.refresh();
          console.log(`🔄 Refreshed: ${instance.category}`);
          return { success: true, category: instance.category };
        } catch (error) {
          console.warn(`⚠️ Failed to refresh ${instance.category}:`, error);
          return { success: false, category: instance.category, error: error.message };
        }
      }
      return { success: false, category: instance.category, error: 'No refresh method available' };
    });
    
    return Promise.all(refreshPromises);
  }

  // Enhanced debugging
  debugInstances() {
    console.group('🔍 Tabs Constructor Debug Info');
    console.log(`Total instances: ${this.instances.length}`);
    console.log(`Initialized: ${this.isInitialized}`);
    console.log(`Retry count: ${this.retryCount}`);
    
    this.instances.forEach((instance, index) => {
      console.group(`Instance ${index + 1}: ${instance.category}`);
      console.log('Initialized:', instance.initialized);
      console.log('Tabs Component:', instance.tabsComponent);
      console.log('Collection List:', instance.collectionList);
      console.log('Tab Contents:', instance.tabContents);
      console.log('FsLibrary:', instance.fsLibrary);
      console.log('Unique ID:', instance.uniqueId);
      console.groupEnd();
    });
    
    console.groupEnd();
  }

  // Health check method
  healthCheck() {
    const health = {
      isInitialized: this.isInitialized,
      totalInstances: this.instances.length,
      initializedInstances: this.instances.filter(i => i.initialized).length,
      errors: [],
      warnings: []
    };

    // Check for common issues
    this.instances.forEach((instance, index) => {
      if (!instance.initialized) {
        health.warnings.push(`Instance ${index + 1} (${instance.category}) not initialized`);
      }
      
      if (!document.contains(instance.tabsComponent)) {
        health.errors.push(`Tabs component for ${instance.category} no longer in DOM`);
      }
      
      if (!document.contains(instance.collectionList)) {
        health.errors.push(`Collection list for ${instance.category} no longer in DOM`);
      }
    });

    return health;
  }
}

// Enhanced initialization with better error handling
(function initializeTabsConstructor() {
  // Prevent multiple initializations
  if (window.tabsConstructor) {
    console.log('TabsConstructor already initialized');
    return;
  }

  let initAttempts = 0;
  const maxAttempts = 10;
  
  const initTabs = async () => {
    initAttempts++;
    
    try {
      if (typeof FsLibrary !== 'undefined') {
        window.tabsConstructor = new TabsConstructor();
        await window.tabsConstructor.init();
        
        // Make utility methods available globally
        window.debugTabsConstructor = () => window.tabsConstructor.debugInstances();
        window.tabsHealthCheck = () => window.tabsConstructor.healthCheck();
        
        console.log('🎉 TabsConstructor initialized and available globally as window.tabsConstructor');
      } else if (initAttempts < maxAttempts) {
        console.log(`⏳ FsLibrary not ready, attempt ${initAttempts}/${maxAttempts}`);
        setTimeout(initTabs, 1000);
      } else {
        throw new Error('FsLibrary not found after maximum attempts');
      }
    } catch (error) {
      console.error('❌ Error initializing TabsConstructor:', error);
      
      // Dispatch error event for external handling
      document.dispatchEvent(new CustomEvent('tabsConstructorError', {
        detail: { error: error.message, attempts: initAttempts }
      }));
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