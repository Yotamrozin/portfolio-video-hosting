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
    // Get all tab buttons that are not hidden by display:none
    const allTabButtons = document.querySelectorAll('.tab-button-demo');
    const visibleTabs = [];
    
    allTabButtons.forEach(button => {
      const computedStyle = window.getComputedStyle(button);
      const isVisible = computedStyle.display !== 'none' && 
                       computedStyle.opacity !== '0' && 
                       button.style.display !== 'none' &&
                       button.style.opacity !== '0';
      
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
    return 0; // Default to first visible tab
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
        // Go to previous category, last subcategory
        console.log('📱 Going to previous category (last subcategory)');
        if (window.craftMenu) {
          window.craftMenu.previousCategory();
          // The categoryChanged event will handle selecting the last visible tab
          setTimeout(() => {
            const newVisibleTabs = getVisibleTabs();
            if (newVisibleTabs.length > 0) {
              console.log(`📱 Selecting last tab in previous category: ${newVisibleTabs.length - 1}`);
              newVisibleTabs[newVisibleTabs.length - 1].click();
            }
          }, 200); // Increased delay
        }
      } else if (newIndex >= visibleTabs.length) {
        // Go to next category, first subcategory
        console.log('📱 Going to next category (first subcategory)');
        if (window.craftMenu) {
          window.craftMenu.nextCategory();
          // The categoryChanged event will handle selecting the first visible tab
        }
      } else {
        // Stay in same category, change subcategory
        console.log(`📱 Staying in category, switching to visible tab ${newIndex}`);
        if (visibleTabs[newIndex]) {
          visibleTabs[newIndex].click();
        } else {
          console.warn(`📱 Visible tab ${newIndex} not found!`);
        }
      }
      
      loop = setInterval(nextTab, 5000);
    }
  });

  // Handle direct tab wrapper clicks (for touch/swipe)
  $('.tab-wrapper').on('click', function(e) {
    // Only handle clicks on the wrapper itself, not on buttons
    if (e.target === this) {
      if (!$(".uui-navbar06_menu-button").hasClass("w--open")) {
        clearInterval(loop);
        
        const visibleTabs = getVisibleTabs();
        const currentIndex = getCurrentVisibleTabIndex();
        const nextIndex = currentIndex + 1;
        
        console.log(`📱 Wrapper click: Current ${currentIndex}, next ${nextIndex}, total ${visibleTabs.length}`);
        
        if (nextIndex >= visibleTabs.length) {
          // Go to next category, first subcategory
          console.log('📱 Wrapper click: Going to next category');
          if (window.craftMenu) {
            window.craftMenu.nextCategory();
          }
        } else {
          // Go to next visible tab in same category
          console.log(`📱 Wrapper click: Going to visible tab ${nextIndex}`);
          if (visibleTabs[nextIndex]) {
            visibleTabs[nextIndex].click();
          }
        }
        
        loop = setInterval(nextTab, 5000);
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
        // Auto-advance to next category
        console.log('📱 Auto-advance: Going to next category');
        if (window.craftMenu) {
          window.craftMenu.nextCategory();
        }
      } else {
        // Auto-advance to next visible tab
        console.log(`📱 Auto-advance: Going to visible tab ${nextIndex}`);
        if (visibleTabs[nextIndex]) {
          visibleTabs[nextIndex].click();
        }
      }
    }, 5000);
  }
  
  // Enhanced categoryChanged event listener
  document.addEventListener('categoryChanged', (e) => {
    console.log('📱 Category changed, resetting story navigation');
    
    // Reset story to first visible subcategory when category changes
    setTimeout(() => {
      const visibleTabs = getVisibleTabs();
      console.log(`📱 After category change, found ${visibleTabs.length} visible tabs`);
      
      if (visibleTabs.length > 0) {
        console.log('📱 Activating first visible tab in new category');
        visibleTabs[0].click();
      } else {
        console.warn('📱 No visible tabs found after category change!');
      }
    }, 250); // Increased delay to ensure filtering is complete
    
    // Reset any story timers
    if (typeof loop !== 'undefined') {
      clearInterval(loop);
      loop = setInterval(() => {
        const visibleTabs = getVisibleTabs();
        const currentIndex = getCurrentVisibleTabIndex();
        const nextIndex = currentIndex + 1;
        
        if (nextIndex >= visibleTabs.length) {
          // Auto-advance to next category
          if (window.craftMenu) {
            window.craftMenu.nextCategory();
          }
        } else {
          // Auto-advance to next visible tab
          if (visibleTabs[nextIndex]) {
            visibleTabs[nextIndex].click();
          }
        }
      }, 5000);
    }
  });
});
