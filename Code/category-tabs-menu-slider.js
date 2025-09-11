 var swiperNodes = "";
  var pagination = '<div class=swiper-pagination></div>';
  var next_prev_buttons = '<div class="swiper-button-prev"></div><div class="swiper-button-next"></div>'; 
  var scrollbar = '<div class="swiper-scrollbar"></div>';
  var swiperNodes = swiperNodes.concat(pagination, next_prev_buttons);
  /* loop throw all swipers on the page */
  $('.swiper').each(function( index ) {
    $( this ).append(swiperNodes);
  });

// swiper JS Initialize
  var mySwiper = new Swiper ('.first-swiper', {
  	mousewheel: {
    invert: true,
  	},
  // Optional parameters
    slidesPerView: 3,
    spaceBetween: 30,
    loop: true,
    speed: 1000,
    centeredSlides: true,
    // Enable lazy loading
    lazy: true,
    navigation: {
      nextEl: '.arrow-next',
      prevEl: '.arrow-previous',
    },
    keyboard: {
      enabled: true,
    },
    breakpoints: {
      0: { /* when window >=0px - webflow mobile portriat */
        slidesPerView: 1.5,
        spaceBetween: 15,
      },
      478: { /* when window >= 478px - webflow mobile landscape */
        slidesPerView: 3,
        spaceBetween: 15,
      },
      767: { /* when window >= 767px - webflow tablet */
        slidesPerView: 2.25,
        spaceBetween: 30,
      },
      988: { /* when window >= 988px - webflow desktop */
        slidesPerView: 4.25,
        spaceBetween: 50,
      },
      1920: { /* when window >= 988px - webflow desktop */
        slidesPerView: 6.25,
        spaceBetween: 50,
      }
    },
    /* uncomment if you want autoplay slider
    autoplay: {
      delay: 3000,
    },
    */
    /* uncomment if you want scrollbar
     scrollbar: {
        el: '.swiper-scrollbar',
        hide: true,
      },
    */
  })