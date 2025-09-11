
  const swiper = new Swiper('.swiper-menu', {
    slidesPerView: 1.4,
    spaceBetween: 20,
    speed: 300,
    centeredSlides: true,
    loop: true,
    allowTouchMove: true,
    slideToClickedSlide: true,
    createElements: true,
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
    autoplay: false,
    breakpoints: {
      640: {
        slidesPerView: 2,
      },
    },
  });
