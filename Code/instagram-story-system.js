// Enhanced story system integration
var Webflow = Webflow || [];
Webflow.push(function() {
  // Fix for Safari
  if (navigator.userAgent.includes("Safari")) {
    document.querySelectorAll(".tab-button-demo").forEach((t)=>(t.focus=function(){
      const x=window.scrollX,y=window.scrollY;
      const f=()=>{setTimeout(()=>window.scrollTo(x,y),1);t.removeEventListener("focus",f)};
      t.addEventListener("focus",f);
      HTMLElement.prototype.focus.apply(this,arguments)
    }));
  }

  function nextTab(){
    if (!$(".uui-navbar06_menu-button").hasClass("w--open")) {
      $('.tab_next').trigger("click");
    }
  }

  // Get only visible tabs within current category - improved detection
  function getVisibleTabs() {
    const allTabButtons = document.querySelectorAll('.tab-button-demo');
    const visibleTabs = [];
    
    allTabButtons.forEach(button => {
      const computedStyle = window.getComputedStyle(button);
      const isVisible = computedStyle.display !== 'none' && 
                       computedStyle.opacity !== '0' && 
                       button.style.display !== 'none' &&
                       button.style.opacity !== '0' &&
                       button.style.pointerEvents !== 'none';
      
      if (isVisible) {
        visibleTabs.push(button);
      }
    });
    
    console.log(`📱 Found ${visibleTabs.length} visible tabs:`, visibleTabs.map((tab, i) => `${i}: ${tab.textContent?.trim() || 'No text'}`));
    return visibleTabs;
  }

  function getCurrentVisibleTabIndex() {
    const visibleTabs = getVisibleTabs();
    for (let i = 0; i < visibleTabs.length; i++) {
      if (visibleTabs[i].classList.contains('w--current')) {
        console.log(`📱 Current visible tab index: ${i}`);
        return i;
      }
    }
    console.log('📱 No current tab found, defaulting to 0');
    return 0;
  }

  // Properly activate a tab using Webflow's tab system
  function activateTab(tabButton) {
    if (!tabButton) return false;
    
    console.log('📱 Activating tab:', tabButton.textContent?.trim());
    
    // Method 1: Trigger Webflow's tab click event
    $(tabButton).trigger('click');
    
    // Method 2: If that doesn't work, manually set active states
    setTimeout(() => {
      // Remove w--current from all tabs
      document.querySelectorAll('.tab-button-demo').forEach(btn => {
        btn.classList.remove('w--current');
        btn.setAttribute('aria-selected', 'false');
      });
      
      // Add w--current to target tab
      tabButton.classList.add('w--current');
      tabButton.setAttribute('aria-selected', 'true');
      
      // Show corresponding tab pane
      const tabIndex = Array.from(document.querySelectorAll('.tab-button-demo')).indexOf(tabButton);
      const tabPanes = document.querySelectorAll('.tab-pane-demo');
      
      tabPanes.forEach((pane, index) => {
        if (index === tabIndex) {
          pane.classList.add('w--tab-active');
          pane.style.display = 'block';
        } else {
          pane.classList.remove('w--tab-active');
          pane.style.display = 'none';
        }
      });
    }, 50);
    
    return true;
  }

  // Enhanced navigation with category awareness and filtered tabs
  $('.tab-wrapper').on('click', '.tab_previous, .tab_next', function() {
    if (!$(".uui-navbar06_menu-button").hasClass("w--open")) {
      clearInterval(loop);
      
      const direction = $(this).hasClass('tab_previous') ? -1 : 1;
      const visibleTabs = getVisibleTabs();
      const currentIndex = getCurrentVisibleTabIndex();
      const newIndex = currentIndex + direction;
      
      console.log(`📱 Story Navigation: Current visible tab ${currentIndex}, trying to go to ${newIndex}`);
      console.log(`📱 Total visible tabs in category: ${visibleTabs.length}`);
      
      // Check if we need to change category
      if (newIndex < 0) {
        console.log('📱 Going to previous category (last subcategory)');
        if (window.craftMenu) {
          window.craftMenu.previousCategory();
          setTimeout(() => {
            const newVisibleTabs = getVisibleTabs();
            if (newVisibleTabs.length > 0) {
              console.log(`📱 Selecting last tab in previous category: ${newVisibleTabs.length - 1}`);
              activateTab(newVisibleTabs[newVisibleTabs.length - 1]);
            }
          }, 300);
        }
      } else if (newIndex >= visibleTabs.length) {
        console.log('📱 Going to next category (first subcategory)');
        if (window.craftMenu) {
          window.craftMenu.nextCategory();
        }
      } else {
        console.log(`📱 Staying in category, switching to visible tab ${newIndex}`);
        activateTab(visibleTabs[newIndex]);
      }
      
      loop = setInterval(nextTab, 5000);
    }
  });

  // Handle direct tab wrapper clicks (for touch/swipe)
  $('.tab-wrapper').on('click', function(e) {
    if (e.target === this) {
      if (!$(".uui-navbar06_menu-button").hasClass("w--open")) {
        clearInterval(loop);
        
        const visibleTabs = getVisibleTabs();
        const currentIndex = getCurrentVisibleTabIndex();
        const nextIndex = currentIndex + 1;
        
        console.log(`📱 Wrapper click: Current ${currentIndex}, next ${nextIndex}, total ${visibleTabs.length}`);
        
        if (nextIndex >= visibleTabs.length) {
          console.log('📱 Wrapper click: Going to next category');
          if (window.craftMenu) {
            window.craftMenu.nextCategory();
          }
        } else {
          console.log(`📱 Wrapper click: Going to visible tab ${nextIndex}`);
          activateTab(visibleTabs[nextIndex]);
        }
        
        loop = setInterval(nextTab, 5000);
      }
    }
  });

  // Handle direct tab button clicks
  $(document).on('click', '.tab-button-demo', function(e) {
    if (!$(".uui-navbar06_menu-button").hasClass("w--open")) {
      const visibleTabs = getVisibleTabs();
      const clickedTab = this;
      
      // Check if this tab is visible
      if (visibleTabs.includes(clickedTab)) {
        console.log('📱 Direct tab click:', clickedTab.textContent?.trim());
        clearInterval(loop);
        activateTab(clickedTab);
        loop = setInterval(nextTab, 5000);
      } else {
        console.log('📱 Clicked tab is not visible, ignoring');
        e.preventDefault();
        e.stopPropagation();
      }
    }
  });

  // Auto-advance timer
  if (!$(".uui-navbar06_menu-button").hasClass("w--open")) {
    var loop = setInterval(() => {
      const visibleTabs = getVisibleTabs();
      const currentIndex = getCurrentVisibleTabIndex();
      const nextIndex = currentIndex + 1;
      
      console.log(`📱 Auto-advance: Current ${currentIndex}, next ${nextIndex}, total ${visibleTabs.length}`);
      
      if (nextIndex >= visibleTabs.length) {
        console.log('📱 Auto-advance: Going to next category');
        if (window.craftMenu) {
          window.craftMenu.nextCategory();
        }
      } else {
        console.log(`📱 Auto-advance: Going to visible tab ${nextIndex}`);
        activateTab(visibleTabs[nextIndex]);
      }
    }, 5000);
  }
  
  // Enhanced categoryChanged event listener
  document.addEventListener('categoryChanged', (e) => {
    console.log('📱 Category changed, resetting story navigation');
    
    setTimeout(() => {
      const visibleTabs = getVisibleTabs();
      console.log(`📱 After category change, found ${visibleTabs.length} visible tabs`);
      
      if (visibleTabs.length > 0) {
        console.log('📱 Activating first visible tab in new category');
        activateTab(visibleTabs[0]);
      } else {
        console.warn('📱 No visible tabs found after category change!');
      }
    }, 350);
    
    // Reset story timers
    if (typeof loop !== 'undefined') {
      clearInterval(loop);
      loop = setInterval(() => {
        const visibleTabs = getVisibleTabs();
        const currentIndex = getCurrentVisibleTabIndex();
        const nextIndex = currentIndex + 1;
        
        if (nextIndex >= visibleTabs.length) {
          if (window.craftMenu) {
            window.craftMenu.nextCategory();
          }
        } else {
          activateTab(visibleTabs[nextIndex]);
        }
      }, 5000);
    }
  });
});

// Enhanced multi-instance Finsweet tabs with sequential population
class MultiCategoryTabsManager {
  constructor() {
    this.tabsInstances = new Map();
    this.categoryOrder = [];
    this.initializeSequentialTabs();
  }

  async initializeSequentialTabs() {
    // Wait for DOM and CMS content to load
    await this.waitForCMSContent();
    
    // Find all collection lists and group by category
    const categoryGroups = this.groupCollectionsByCategory();
    
    // Create tabs components sequentially
    this.createSequentialTabsComponents(categoryGroups);
    
    // Initialize Finsweet tabs for each component
    this.initializeFinsweet();
  }

  groupCollectionsByCategory() {
    const collections = document.querySelectorAll('[data-category]');
    const groups = new Map();
    
    collections.forEach(item => {
      const category = item.getAttribute('data-category');
      if (!groups.has(category)) {
        groups.set(category, []);
        this.categoryOrder.push(category);
      }
      groups.get(category).push(item);
    });
    
    return groups;
  }

  createSequentialTabsComponents(categoryGroups) {
    const tabsContainer = document.querySelector('.tabs-container'); // Your container
    
    this.categoryOrder.forEach((category, index) => {
      const items = categoryGroups.get(category);
      
      // Create tabs component wrapper
      const tabsWrapper = this.createTabsWrapper(category, index);
      
      // Populate with collection items
      this.populateTabsComponent(tabsWrapper, items, category);
      
      // Append to container
      tabsContainer.appendChild(tabsWrapper);
      
      // Store reference
      this.tabsInstances.set(category, {
        wrapper: tabsWrapper,
        items: items,
        index: index
      });
    });
  }

  createTabsWrapper(category, index) {
    const wrapper = document.createElement('div');
    wrapper.className = 'fs-tabs w-tabs';
    wrapper.setAttribute('data-category', category);
    wrapper.setAttribute('data-tabs-index', index);
    wrapper.setAttribute('fs-element', 'tabs');
    
    // Create tabs menu
    const tabsMenu = document.createElement('div');
    tabsMenu.className = 'fs-tabs-menu w-tab-menu';
    tabsMenu.setAttribute('role', 'tablist');
    
    // Create tabs content
    const tabsContent = document.createElement('div');
    tabsContent.className = 'fs-tabs-content w-tab-content';
    
    wrapper.appendChild(tabsMenu);
    wrapper.appendChild(tabsContent);
    
    return wrapper;
  }

  populateTabsComponent(wrapper, items, category) {
    const tabsMenu = wrapper.querySelector('.fs-tabs-menu');
    const tabsContent = wrapper.querySelector('.fs-tabs-content');
    
    items.forEach((item, index) => {
      // Create tab link
      const tabLink = document.createElement('a');
      tabLink.className = `tab-button-demo w-inline-block w-tab-link${index === 0 ? ' w--current' : ''}`;
      tabLink.setAttribute('data-w-tab', `${category}-tab-${index}`);
      tabLink.setAttribute('href', '#');
      tabLink.setAttribute('role', 'tab');
      tabLink.setAttribute('aria-controls', `${category}-tab-${index}`);
      tabLink.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
      
      // Clone and append item content to tab link
      const clonedItem = item.cloneNode(true);
      tabLink.appendChild(clonedItem);
      tabsMenu.appendChild(tabLink);
      
      // Create tab pane
      const tabPane = document.createElement('div');
      tabPane.className = `w-tab-pane${index === 0 ? ' w--tab-active' : ''}`;
      tabPane.setAttribute('data-w-tab', `${category}-tab-${index}`);
      tabPane.setAttribute('role', 'tabpanel');
      tabPane.setAttribute('aria-labelledby', `${category}-tab-${index}`);
      
      // Add content to tab pane (you can customize this based on your needs)
      const content = document.createElement('div');
      content.className = 'tab-content';
      content.innerHTML = `<h3>Content for ${category} - Item ${index + 1}</h3>`;
      tabPane.appendChild(content);
      
      tabsContent.appendChild(tabPane);
    });
  }

  initializeFinsweet() {
    this.tabsInstances.forEach((instance, category) => {
      const wrapper = instance.wrapper;
      
      // Initialize Finsweet tabs for this component
      if (window.fsAttributes && window.fsAttributes.tabs) {
        window.fsAttributes.tabs.init(wrapper);
      }
      
      console.log(`Initialized tabs for category: ${category}`);
    });
  }

  // Show specific category tabs
  showCategory(categoryName) {
    this.tabsInstances.forEach((instance, category) => {
      const wrapper = instance.wrapper;
      if (category === categoryName) {
        wrapper.style.display = 'block';
        wrapper.classList.add('active-category');
      } else {
        wrapper.style.display = 'none';
        wrapper.classList.remove('active-category');
      }
    });
  }

  // Get tabs instance by category
  getTabsInstance(category) {
    return this.tabsInstances.get(category);
  }

  // Navigate to specific tab within a category
  navigateToTab(category, tabIndex) {
    const instance = this.tabsInstances.get(category);
    if (instance) {
      const tabLinks = instance.wrapper.querySelectorAll('.w-tab-link');
      if (tabLinks[tabIndex]) {
        tabLinks[tabIndex].click();
      }
    }
  }

  async waitForCMSContent() {
    return new Promise((resolve) => {
      const checkContent = () => {
        const items = document.querySelectorAll('[data-category]');
        if (items.length > 0) {
          resolve();
        } else {
          setTimeout(checkContent, 100);
        }
      };
      checkContent();
    });
  }
}

// Initialize the manager
const tabsManager = new MultiCategoryTabsManager();

// Export for use in other scripts
window.tabsManager = tabsManager;
