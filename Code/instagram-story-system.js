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

  // Get only visible tabs within current category
  function getVisibleTabs() {
    return document.querySelectorAll('.tab-button-demo:not([style*="display: none"])');
  }

  function getCurrentVisibleTabIndex() {
    const visibleTabs = getVisibleTabs();
    for (let i = 0; i < visibleTabs.length; i++) {
      if (visibleTabs[i].classList.contains('w--current')) {
        return i;
      }
    }
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
              newVisibleTabs[newVisibleTabs.length - 1].click();
            }
          }, 100);
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
        visibleTabs[newIndex].click();
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
        
        if (nextIndex >= visibleTabs.length) {
          // Go to next category, first subcategory
          if (window.craftMenu) {
            window.craftMenu.nextCategory();
          }
        } else {
          // Go to next visible tab in same category
          visibleTabs[nextIndex].click();
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
      
      if (nextIndex >= visibleTabs.length) {
        // Auto-advance to next category
        if (window.craftMenu) {
          window.craftMenu.nextCategory();
        }
      } else {
        // Auto-advance to next visible tab
        visibleTabs[nextIndex].click();
      }
    }, 5000);
  }
  
  // Enhanced categoryChanged event listener
  document.addEventListener('categoryChanged', (e) => {
    console.log('📱 Category changed, resetting story navigation');
    
    // Reset story to first visible subcategory when category changes
    setTimeout(() => {
      const firstVisibleTab = document.querySelector('.tab-button-demo:not([style*="display: none"])');
      if (firstVisibleTab) {
        console.log('📱 Activating first visible tab in new category');
        firstVisibleTab.click();
      }
    }, 150); // Small delay to ensure filtering is complete
    
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
          visibleTabs[nextIndex].click();
        }
      }, 5000);
    }
  });
});
