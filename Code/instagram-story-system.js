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
