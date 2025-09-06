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

   if (!$(".uui-navbar06_menu-button").hasClass("w--open")) {
     var loop = setInterval(nextTab,5000);
   }

   $('.tab-wrapper').on('click', '.tab_previous, .tab_next', function() {
     if (!$(".uui-navbar06_menu-button").hasClass("w--open")) {
       clearInterval(loop);
       var direction = $(this).hasClass('tab_previous') ? -1 : 1;
       var tablinks = $(this).parent().find('.w-tab-menu');
       var index = tablinks.find('.w--current').index() + direction;
       index = index >= tablinks.children().length ? 0 : index;
       tablinks.find('.w-tab-link').eq(index).trigger('click');
       loop = setInterval(nextTab,5000);
     }
   });
 });
