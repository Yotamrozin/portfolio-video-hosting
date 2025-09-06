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
