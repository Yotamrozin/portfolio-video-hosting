/**
 * Swiper.js-Inspired Infinite Category Slider
 * Based on Swiper's loop implementation with proper clone management
 */

class SwiperInspiredCategorySlider {
  constructor(wrapperSelector = '.category-slider-wrapper') {
    this.wrapper = document.querySelector(wrapperSelector);
    
    if (!this.wrapper) {
      console.warn(`Category menu wrapper not found: ${wrapperSelector}`);
      return;
    }
    
    this.originalSlider = this.wrapper.querySelector('.category-slider');
    this.originalItems = this.wrapper.querySelectorAll('.category-item');
    
    if (!this.originalSlider || this.originalItems.length === 0) {
      console.warn('Category menu elements not found within wrapper');
      return;
    }
    
    // Swiper-inspired properties
    this.slides = [];
    this.realIndex = 0; // Actual logical index (0 to originalItems.length - 1)
    this.activeIndex = 0; // Visual index in the slides array
    this.isTransitioning = false;
    this.loopedSlides = this.originalItems.length; // Number of clones on each side
    
    // Touch/swipe properties
    this.touchStartX = 0;
    this.touchEndX = 0;
    this.touchStartY = 0;
    this.touchEndY = 0;
    this.isSwiping = false;
    this.minSwipeDistance = 50; // Minimum distance for swipe
    this.maxVerticalDistance = 100; // Max vertical movement to still count as horizontal swipe
    
    this.init();
  }
  
  init() {
    this.createLoopedSlides();
    this.setupEventListeners();
    this.setInitialPosition();
    this.updateActiveStates();
  }
  
  createLoopedSlides() {
    // Store original slide data
    this.originalSlides = Array.from(this.originalItems).map((item, index) => ({
      index: index,
      element: item,
      text: item.textContent.trim(),
      category: item.dataset.category || item.textContent.trim(),
      color: item.dataset.color || '',
      width: 0 // Will be calculated
    }));
    
    // Create new slider container
    this.slider = document.createElement('div');
    this.slider.className = this.originalSlider.className;
    this.slider.style.cssText = `
      display: flex;
      transition: none;
      will-change: transform;
      transform: translateX(0px);
    `;
    
    this.slides = [];
    
    // Left clones (exact copy of Swiper's approach)
    for (let i = 0; i < this.loopedSlides; i++) {
      const originalIndex = this.originalSlides.length - this.loopedSlides + i;
      const slideData = this.originalSlides[originalIndex];
      const clone = this.createSlide(slideData, `clone-before-${i}`, true);
      this.slider.appendChild(clone);
      this.slides.push({
        ...slideData,
        element: clone,
        realIndex: slideData.index,
        isClone: true,
        clonePosition: 'before'
      });
    }
    
    // Original slides
    this.originalSlides.forEach((slideData, index) => {
      const slide = this.createSlide(slideData, `original-${index}`, false);
      this.slider.appendChild(slide);
      this.slides.push({
        ...slideData,
        element: slide,
        realIndex: slideData.index,
        isClone: false
      });
    });
    
    // Right clones
    for (let i = 0; i < this.loopedSlides; i++) {
      const originalIndex = i;
      const slideData = this.originalSlides[originalIndex];
      const clone = this.createSlide(slideData, `clone-after-${i}`, true);
      this.slider.appendChild(clone);
      this.slides.push({
        ...slideData,
        element: clone,
        realIndex: slideData.index,
        isClone: true,
        clonePosition: 'after'
      });
    }
    
    // Replace original slider
    this.originalSlider.parentNode.replaceChild(this.slider, this.originalSlider);
    
    console.log('🔧 Swiper-style loop created:', {
      originalSlides: this.originalSlides.length,
      loopedSlides: this.loopedSlides,
      totalSlides: this.slides.length,
      structure: `${this.loopedSlides} clones + ${this.originalSlides.length} originals + ${this.loopedSlides} clones`
    });
  }
  
  createSlide(slideData, id, isClone) {
    const slide = document.createElement('div');
    slide.className = 'category-item';
    slide.textContent = slideData.text;
    slide.dataset.category = slideData.category;
    slide.dataset.slideId = id;
    slide.dataset.realIndex = slideData.index;
    if (slideData.color) slide.dataset.color = slideData.color;
    if (isClone) slide.dataset.isClone = 'true';
    
    // Copy styles from original
    const originalItem = slideData.element;
    const computedStyles = window.getComputedStyle(originalItem);
    slide.style.cssText = `
      flex-shrink: 0;
      cursor: pointer;
      white-space: nowrap;
      padding: ${computedStyles.padding};
      margin: ${computedStyles.margin};
      font-size: ${computedStyles.fontSize};
      font-weight: ${computedStyles.fontWeight};
      border-radius: ${computedStyles.borderRadius};
      background-color: ${computedStyles.backgroundColor};
      color: ${computedStyles.color};
    `;
    
    return slide;
  }
  
  setupEventListeners() {
    this.slides.forEach((slideInfo, index) => {
      slideInfo.element.addEventListener('click', (e) => {
        e.preventDefault();
        if (this.isTransitioning) return;
        
        this.slideTo(slideInfo.realIndex);
        
        // Integrate with existing tabs system
        if (window.MultiInstanceTabsManager) {
          window.MultiInstanceTabsManager.showCategory(slideInfo.category);
        }
      });
    });
    
    // Resize handler
    this.resizeHandler = this.debounce(() => {
      this.updateSlidePositions();
    }, 100);
    
    window.addEventListener('resize', this.resizeHandler);
    
    // Add mobile swipe listeners
    this.setupSwipeListeners();
  }
  
  setupSwipeListeners() {
    // Touch start
    this.slider.addEventListener('touchstart', (e) => {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
      this.isSwiping = true;
      
      console.log('👆 Touch start:', {
        x: this.touchStartX,
        y: this.touchStartY
      });
    }, { passive: true });
    
    // Touch move (optional - for visual feedback)
    this.slider.addEventListener('touchmove', (e) => {
      if (!this.isSwiping) return;
      
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const deltaX = currentX - this.touchStartX;
      const deltaY = Math.abs(currentY - this.touchStartY);
      
      // Prevent default if it's a horizontal swipe
      if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > 10) {
        e.preventDefault();
      }
    }, { passive: false });
    
    // Touch end
    this.slider.addEventListener('touchend', (e) => {
      if (!this.isSwiping) return;
      
      this.touchEndX = e.changedTouches[0].clientX;
      this.touchEndY = e.changedTouches[0].clientY;
      
      this.handleSwipe();
      this.isSwiping = false;
      
      console.log('👆 Touch end:', {
        startX: this.touchStartX,
        endX: this.touchEndX,
        deltaX: this.touchEndX - this.touchStartX
      });
    }, { passive: true });
    
    // Touch cancel
    this.slider.addEventListener('touchcancel', () => {
      this.isSwiping = false;
      console.log('👆 Touch cancelled');
    }, { passive: true });
  }
  
  handleSwipe() {
    const deltaX = this.touchEndX - this.touchStartX;
    const deltaY = Math.abs(this.touchEndY - this.touchStartY);
    const absDeltaX = Math.abs(deltaX);
    
    console.log('🔄 Swipe analysis:', {
      deltaX,
      deltaY,
      absDeltaX,
      minDistance: this.minSwipeDistance,
      maxVertical: this.maxVerticalDistance,
      isHorizontal: deltaY < this.maxVerticalDistance,
      isLongEnough: absDeltaX > this.minSwipeDistance
    });
    
    // Check if it's a valid horizontal swipe
    if (deltaY < this.maxVerticalDistance && absDeltaX > this.minSwipeDistance) {
      if (deltaX > 0) {
        // Swipe right - go to previous category
        console.log('👈 Swipe right detected - going to previous category');
        this.slidePrev();
      } else {
        // Swipe left - go to next category
        console.log('👉 Swipe left detected - going to next category');
        this.slideNext();
      }
    } else {
      console.log('❌ Swipe not recognized - insufficient distance or too vertical');
    }
  }
  
  setInitialPosition() {
    // Start at the first original slide (after the clones)
    this.activeIndex = this.loopedSlides;
    this.realIndex = 0; // This ensures first category (index 0) is active
    this.updateSlidePositions();
    
    // Explicitly ensure first category has active class
    console.log('🎯 Setting first category as active by default:', {
      realIndex: this.realIndex,
      activeIndex: this.activeIndex,
      firstCategory: this.originalSlides[0]?.category
    });
  }
  
  slideTo(targetRealIndex, animate = true) {
    if (this.isTransitioning && animate) return;
    
    const oldRealIndex = this.realIndex;
    this.realIndex = targetRealIndex;
    
    // Find the best slide to transition to
    const targetSlideIndex = this.findBestSlideIndex(targetRealIndex);
    
    if (animate) {
      this.transitionTo(targetSlideIndex);
    } else {
      this.activeIndex = targetSlideIndex;
      this.updateSlidePositions();
      this.updateActiveStates();
    }
    
    console.log('🎯 Slide transition:', {
      from: { realIndex: oldRealIndex, activeIndex: this.activeIndex },
      to: { realIndex: targetRealIndex, activeIndex: targetSlideIndex },
      category: this.slides[targetSlideIndex]?.category
    });
  }
  
  findBestSlideIndex(targetRealIndex) {
    // Find all slides that match this realIndex
    const candidates = this.slides
      .map((slide, index) => ({ slide, index }))
      .filter(({ slide }) => slide.realIndex === targetRealIndex);
    
    if (candidates.length === 0) return this.activeIndex;
    
    // Prefer non-clones if possible
    const nonCloneCandidate = candidates.find(({ slide }) => !slide.isClone);
    if (nonCloneCandidate) {
      return nonCloneCandidate.index;
    }
    
    // Otherwise, find the closest candidate to current position
    return candidates.reduce((best, current) => {
      const currentDistance = Math.abs(current.index - this.activeIndex);
      const bestDistance = Math.abs(best.index - this.activeIndex);
      return currentDistance < bestDistance ? current : best;
    }).index;
  }
  
  transitionTo(targetIndex) {
    this.isTransitioning = true;
    this.activeIndex = targetIndex;
    
    // Apply smooth transition
    this.slider.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    this.updateSlidePositions();
    this.updateActiveStates();
    
    // Handle transition end
    setTimeout(() => {
      this.isTransitioning = false;
      this.slider.style.transition = 'none';
      this.checkLoopFix();
    }, 400);
  }
  
  checkLoopFix() {
    // Swiper's loop fix logic - jump to equivalent position if needed
    let needsLoopFix = false;
    let newActiveIndex = this.activeIndex;
    
    if (this.activeIndex < this.loopedSlides / 2) {
      // Too far left, jump to equivalent position on the right
      newActiveIndex = this.activeIndex + this.originalSlides.length;
      needsLoopFix = true;
    } else if (this.activeIndex >= this.slides.length - this.loopedSlides / 2) {
      // Too far right, jump to equivalent position on the left
      newActiveIndex = this.activeIndex - this.originalSlides.length;
      needsLoopFix = true;
    }
    
    if (needsLoopFix) {
      console.log('🔄 Loop fix applied:', {
        from: this.activeIndex,
        to: newActiveIndex,
        realIndex: this.realIndex
      });
      
      this.activeIndex = newActiveIndex;
      this.updateSlidePositions();
    }
  }
  
  updateSlidePositions() {
    const wrapperWidth = this.wrapper.offsetWidth;
    const activeSlide = this.slides[this.activeIndex];
    
    if (!activeSlide) return;
    
    // Calculate slide positions
    let currentLeft = 0;
    this.slides.forEach((slide, index) => {
      const slideWidth = slide.element.offsetWidth || 200; // Fallback width
      slide.left = currentLeft;
      slide.width = slideWidth;
      currentLeft += slideWidth;
    });
    
    // Center the active slide
    const activeSlideCenter = activeSlide.left + (activeSlide.width / 2);
    const wrapperCenter = wrapperWidth / 2;
    const translateX = wrapperCenter - activeSlideCenter;
    
    this.slider.style.transform = `translateX(${translateX}px)`;
    
    console.log('📐 Position update:', {
      activeIndex: this.activeIndex,
      realIndex: this.realIndex,
      activeSlideCenter,
      wrapperCenter,
      translateX,
      category: activeSlide.category
    });
  }
  
  updateActiveStates() {
    // Remove active from all slides
    this.slides.forEach(slide => {
      slide.element.classList.remove('active');
      slide.element.style.backgroundColor = '';
    });
    
    // Add active to all slides with current realIndex
    this.slides.forEach(slide => {
      if (slide.realIndex === this.realIndex) {
        slide.element.classList.add('active');
        if (slide.color) {
          slide.element.style.backgroundColor = slide.color;
        }
      }
    });
    
    // NEW: Integrate with Instagram Story System
    const currentCategory = this.getCurrentCategory();
    if (currentCategory && window.tabsManager) {
      console.log(`🔄 Category changed to: "${currentCategory}" - updating tabs visibility`);
      window.tabsManager.showCategory(currentCategory);
    }
  }
  
  // Navigation methods (Swiper-style)
  slideNext() {
    const nextRealIndex = (this.realIndex + 1) % this.originalSlides.length;
    this.slideTo(nextRealIndex);
  }
  
  slidePrev() {
    const prevRealIndex = (this.realIndex - 1 + this.originalSlides.length) % this.originalSlides.length;
    this.slideTo(prevRealIndex);
  }
  
  // Public API methods
  setActiveCategory(category) {
    const targetSlide = this.originalSlides.find(slide => 
      slide.category.toLowerCase() === category.toLowerCase()
    );
    
    if (targetSlide) {
      this.slideTo(targetSlide.index);
    }
  }
  
  getCurrentCategory() {
    const currentSlide = this.originalSlides[this.realIndex];
    return currentSlide ? currentSlide.category : null;
  }
  
  // Debug methods
  debug() {
    console.group('🔍 Swiper-Style Slider Debug');
    console.log('Current State:', {
      realIndex: this.realIndex,
      activeIndex: this.activeIndex,
      currentCategory: this.getCurrentCategory(),
      isTransitioning: this.isTransitioning
    });
    console.log('Slide Structure:', {
      totalSlides: this.slides.length,
      originalSlides: this.originalSlides.length,
      loopedSlides: this.loopedSlides
    });
    console.log('Current Transform:', this.slider.style.transform);
    console.log('Active Slide:', this.slides[this.activeIndex]);
    console.groupEnd();
  }
  
  // Utility methods
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  destroy() {
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
    
    // Clean up swipe listeners
    this.slider.removeEventListener('touchstart', this.handleTouchStart);
    this.slider.removeEventListener('touchmove', this.handleTouchMove);
    this.slider.removeEventListener('touchend', this.handleTouchEnd);
    this.slider.removeEventListener('touchcancel', this.handleTouchCancel);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.categoryMenuSlider = new SwiperInspiredCategorySlider();
    // NEW: Also expose as craftMenu for story navigation compatibility
    window.craftMenu = window.categoryMenuSlider;
  });
} else {
  window.categoryMenuSlider = new SwiperInspiredCategorySlider();
  // NEW: Also expose as craftMenu for story navigation compatibility
  window.craftMenu = window.categoryMenuSlider;
}

window.SwiperInspiredCategorySlider = SwiperInspiredCategorySlider;