(function() {
    'use strict';
    
    // Configuration - Easy to adjust timer duration
    const AUTO_ADVANCE_DURATION = 5000; // 5 seconds (adjust this value as needed)
    
    class TabNavigationManager {
        constructor() {
            this.tabInstances = new Map();
            this.init();
        }

        init() {
            console.log('🎯 Tab Navigation Manager initializing...');
            
            // Wait for Webflow and Finsweet to be ready
            if (typeof Webflow !== 'undefined') {
                Webflow.push(() => {
                    this.setupNavigation();
                });
            } else {
                // Fallback if Webflow is not available
                document.addEventListener('DOMContentLoaded', () => {
                    this.setupNavigation();
                });
            }
        }

        setupNavigation() {
            // Find all tab-wrapper elements
            const tabWrappers = document.querySelectorAll('[data-tabs="wrapper"]');
            
            if (tabWrappers.length === 0) {
                console.warn('⚠️ No tab-wrapper elements found');
                return;
            }

            tabWrappers.forEach((wrapper, index) => {
                this.initializeTabWrapper(wrapper, index);
            });

            console.log('✅ Tab Navigation Manager initialized successfully!');
        }

        initializeTabWrapper(wrapper, index) {
            const tabsElement = wrapper.querySelector('[data-tabs="tabs"]');
            const nextButton = wrapper.querySelector('[data-tabs="next"]');
            const prevButton = wrapper.querySelector('[data-tabs="previous"]');
            const middleButton = wrapper.querySelector('[data-tabs="middle"]');

            if (!tabsElement) {
                console.warn(`⚠️ No tabs element found in wrapper ${index}`);
                return;
            }

            if (!nextButton || !prevButton) {
                console.warn(`⚠️ Navigation buttons not found in wrapper ${index}`);
                console.warn(`   Next button: ${nextButton ? 'found' : 'missing'}`);
                console.warn(`   Previous button: ${prevButton ? 'found' : 'missing'}`);
                console.warn(`   Middle button: ${middleButton ? 'found' : 'missing'}`);
                return;
            }

            // Store instance data with event listeners for cleanup
            const instanceData = {
                wrapper,
                tabsElement,
                nextButton,
                prevButton,
                middleButton,
                currentIndex: 0,
                totalTabs: 0,
                listeners: [], // Store listeners for cleanup
                autoAdvanceTimer: null, // Store timer for cleanup
                // Touch/swipe properties
                touchStartX: 0,
                touchStartY: 0,
                touchEndX: 0,
                touchEndY: 0,
                minSwipeDistance: 50, // Minimum distance for a swipe
                maxVerticalDistance: 100 // Maximum vertical movement to still count as horizontal swipe
            };

            // Get total number of tabs
            const tabLinks = tabsElement.querySelectorAll('.w-tab-link');
            instanceData.totalTabs = tabLinks.length;

            if (instanceData.totalTabs === 0) {
                console.warn(`⚠️ No tab links found in wrapper ${index}`);
                return;
            }

            // Find currently active tab
            this.updateCurrentIndex(instanceData);

            this.tabInstances.set(wrapper, instanceData);

            // Event listener for tab clicks (to sync currentIndex)
            // Listen for Webflow's tab change events instead of raw clicks
            const tabChangeListener = (e) => {
                // Find which tab is now active
                const activeTab = instanceData.tabsElement.querySelector('.w-tab-link.w--current');
                if (activeTab) {
                    const activeIndex = Array.from(tabLinks).indexOf(activeTab);
                    if (activeIndex !== -1) {
                        instanceData.currentIndex = activeIndex;
                        console.log(`🎯 Tab changed to: ${activeIndex + 1} of ${instanceData.totalTabs}`);
                        
                        // Reset auto-advance timer when user manually clicks tabs
                        this.resetAutoAdvanceTimer(wrapper);
                    }
                }
            };

            // Navigation button listeners
            const nextClickListener = (e) => {
                e.preventDefault();
                this.navigateNext(wrapper);
            };

            const prevClickListener = (e) => {
                e.preventDefault();
                this.navigatePrevious(wrapper);
            };

            const middleClickListener = (e) => {
                e.preventDefault();
                this.navigateNext(wrapper); // Same functionality as Next button
            };

            // Touch/swipe event listeners
            const touchStartListener = (e) => {
                console.log('🔍 Touch detected on:', e.target.tagName, e.target.className);
                instanceData.touchStartX = e.touches[0].clientX;
                instanceData.touchStartY = e.touches[0].clientY;
            };

            const touchEndListener = (e) => {
                instanceData.touchEndX = e.changedTouches[0].clientX;
                instanceData.touchEndY = e.changedTouches[0].clientY;
                // Removed: console.log('🔍 Touch end detected:', instanceData.touchEndX, instanceData.touchEndY);
                // Removed: console.log('🔍 Calling handleSwipeGesture...');
                this.handleSwipeGesture(wrapper);
            };

            instanceData.autoAdvanceTimer = null;

            // Add event listeners
            tabsElement.addEventListener('w-tab-change', tabChangeListener);
            nextButton.addEventListener('click', nextClickListener);
            prevButton.addEventListener('click', prevClickListener);
            
            // Add touch/swipe listeners to the wrapper element
            wrapper.addEventListener('touchstart', touchStartListener, { passive: true });
            wrapper.addEventListener('touchend', touchEndListener, { passive: true });
            
            // Store listeners for cleanup
            const listeners = [
                { element: tabsElement, event: 'w-tab-change', listener: tabChangeListener },
                { element: nextButton, event: 'click', listener: nextClickListener },
                { element: prevButton, event: 'click', listener: prevClickListener },
                { element: wrapper, event: 'touchstart', listener: touchStartListener },
                { element: wrapper, event: 'touchend', listener: touchEndListener }
            ];
            
            if (middleButton) {
                middleButton.addEventListener('click', middleClickListener);
                listeners.push(
                    { element: middleButton, event: 'click', listener: middleClickListener }
                );
            }
            
            instanceData.listeners = listeners;


        }

        updateCurrentIndex(instanceData) {
            const tabLinks = instanceData.tabsElement.querySelectorAll('.w-tab-link');
            const activeTab = instanceData.tabsElement.querySelector('.w-tab-link.w--current');
            
            if (activeTab) {
                const activeIndex = Array.from(tabLinks).indexOf(activeTab);
                if (activeIndex !== -1) {
                    instanceData.currentIndex = activeIndex;
                }
            }
        }

        navigateNext(wrapper) {
            const instance = this.tabInstances.get(wrapper);
            if (!instance) return;



            if (instance.currentIndex >= instance.totalTabs - 1) {
                // At last tab - trigger Swiper next slide
                if (window.mySwiper && typeof window.mySwiper.slideNext === 'function') {
                    console.log('🎯 At last tab, moving to next Swiper slide');
                    window.mySwiper.slideNext(300, true); // 300ms transition with callbacks
                    return;
                }

                return;
            }

            const nextIndex = instance.currentIndex + 1;
            this.navigateToTab(wrapper, nextIndex);
            
            // Reset auto-advance timer after navigation
            this.resetAutoAdvanceTimer(wrapper);
        }

        navigatePrevious(wrapper) {
            const instance = this.tabInstances.get(wrapper);
            if (!instance) return;



            // Check if we can go to previous tab
            if (instance.currentIndex <= 0) {
                // At first tab - trigger Swiper previous slide
                if (window.mySwiper && typeof window.mySwiper.slidePrev === 'function') {
                    console.log('🎯 At first tab, moving to previous Swiper slide');
                    window.mySwiper.slidePrev(300, true); // 300ms transition with callbacks
                    return;
                }
                return;
            }

            const prevIndex = instance.currentIndex - 1;
            this.navigateToTab(wrapper, prevIndex);
            
            // Reset auto-advance timer after navigation
            this.resetAutoAdvanceTimer(wrapper);
        }

        navigateToTab(wrapper, targetIndex) {
            const instance = this.tabInstances.get(wrapper);
            if (!instance) return;

            const tabLinks = instance.tabsElement.querySelectorAll('.w-tab-link');
            const targetTab = tabLinks[targetIndex];

            if (!targetTab) {
                console.warn(`⚠️ Target tab at index ${targetIndex} not found`);
                return;
            }

            // Trigger the click
            targetTab.click();

            // Fallback: Update index after a short delay if w-tab-change doesn't fire
            setTimeout(() => {
                const activeTab = instance.tabsElement.querySelector('.w-tab-link.w--current');
                if (activeTab) {
                    const activeIndex = Array.from(tabLinks).indexOf(activeTab);
                    if (activeIndex !== -1 && activeIndex !== instance.currentIndex) {
                        instance.currentIndex = activeIndex;
                    }
                }
            }, 100);


        }


        // Simple indicator animation methods (independent of timer)
        startIndicatorAnimation(wrapper) {
            const instance = this.tabInstances.get(wrapper);
            if (!instance) return;

            const currentTabLink = wrapper.querySelector('.w-tab-link.w--current');
            if (!currentTabLink) return;

            const indicator = currentTabLink.querySelector('div');
            if (!indicator) return;

            console.log('🎬 Starting indicator animation for tab:', currentTabLink);

            // Store original styles for restoration
            if (!indicator.dataset.originalWidth) {
                const computedStyle = getComputedStyle(indicator);
                indicator.dataset.originalWidth = computedStyle.width;
                indicator.dataset.originalBackground = computedStyle.backgroundColor;
            }

            // Step 1: Immediately set white background and 0% width
            indicator.style.backgroundColor = 'white';
            indicator.style.width = '0%';
            indicator.style.transition = 'none'; // No transition for immediate change

            // Step 2: Force reflow, then animate to 100% over AUTO_ADVANCE_DURATION
            indicator.offsetHeight; // Force reflow
            
            indicator.style.transition = `width ${AUTO_ADVANCE_DURATION}ms linear`;
            indicator.style.width = '100%';

            console.log('✅ Indicator animation started - animating to 100% over', AUTO_ADVANCE_DURATION, 'ms');
        }

        clearIndicatorAnimation(wrapper) {
            // Reset all tab indicators in this wrapper to original state
            const allTabLinks = wrapper.querySelectorAll('.w-tab-link');
            
            allTabLinks.forEach((tabLink) => {
                const indicator = tabLink.querySelector('div');
                if (!indicator) return;

                // Restore original styles if stored
                if (indicator.dataset.originalWidth) {
                    indicator.style.width = indicator.dataset.originalWidth;
                    indicator.style.backgroundColor = indicator.dataset.originalBackground || '';
                    indicator.style.transition = '';
                    
                    // Clean up stored data
                    delete indicator.dataset.originalWidth;
                    delete indicator.dataset.originalBackground;
                }
            });

            console.log('🧹 Indicator animation cleared for wrapper');
        }

        // Modified auto-advance methods to include indicator animation
        resumeAutoAdvance(wrapper) {
            const instance = this.tabInstances.get(wrapper);
            if (!instance) return;

            console.log('▶️ Resuming auto advance...');

            // Clear existing timer
            if (instance.autoAdvanceTimer) {
                clearInterval(instance.autoAdvanceTimer);
            }
            
            // Start indicator animation immediately
            this.startIndicatorAnimation(wrapper);
            
            // Start auto-advance timer (independent of animation)
            instance.autoAdvanceTimer = setInterval(() => {
                console.log('⏭️ Auto advance timer triggered');
                this.navigateNext(wrapper);
            }, AUTO_ADVANCE_DURATION);
        }

        resetAutoAdvanceTimer(wrapper) {
            const instance = this.tabInstances.get(wrapper);
            if (!instance) return;

            console.log('🔄 Resetting auto advance timer...');

            // Clear existing timer and animation
            if (instance.autoAdvanceTimer) {
                clearInterval(instance.autoAdvanceTimer);
                instance.autoAdvanceTimer = null;
            }
            
            this.clearIndicatorAnimation(wrapper);

            // Start new timer and animation
            this.startIndicatorAnimation(wrapper);
            
            instance.autoAdvanceTimer = setInterval(() => {
                console.log('⏭️ Auto advance timer triggered (after reset)');
                this.navigateNext(wrapper);
            }, AUTO_ADVANCE_DURATION);
        }

        pauseAutoAdvance(wrapper) {
            const instance = this.tabInstances.get(wrapper);
            if (!instance) return;

            console.log('⏸️ Pausing auto advance...');

            if (instance.autoAdvanceTimer) {
                clearInterval(instance.autoAdvanceTimer);
                instance.autoAdvanceTimer = null;
                
                // Clear animation when pausing
                this.clearIndicatorAnimation(wrapper);
            } else {
                console.log('ℹ️ No timer to pause');
            }
        }

        // Pause all auto-advance timers
        pauseAllAutoAdvance() {
            this.tabInstances.forEach((instance, wrapper) => {
                this.pauseAutoAdvance(wrapper);
            });
            console.log('⏸️ All auto-advance timers paused');
        }

        // Resume all auto-advance timers
        resumeAllAutoAdvance() {
            this.tabInstances.forEach((instance, wrapper) => {
                this.resumeAutoAdvance(wrapper);
            });
            console.log('▶️ All auto-advance timers resumed');
        }

        // Pause auto-advance for specific tabs element
        pauseAutoAdvanceForTabsElement(tabsElement) {
            // Find the wrapper that contains this tabs element
            for (const [wrapper, instance] of this.tabInstances) {
                if (instance.tabsElement === tabsElement) {
                    this.pauseAutoAdvance(wrapper);
                    return;
                }
            }
        }

        // Resume auto-advance for specific tabs element
        resumeAutoAdvanceForTabsElement(tabsElement) {
            // Find the wrapper that contains this tabs element
            for (const [wrapper, instance] of this.tabInstances) {
                if (instance.tabsElement === tabsElement) {
                    this.resumeAutoAdvance(wrapper);
                    return;
                }
            }
        }

        // Handle swipe gestures for category navigation
        handleSwipeGesture(wrapper) {
            const instance = this.tabInstances.get(wrapper);
            if (!instance) return;

            const deltaX = instance.touchEndX - instance.touchStartX;
            const deltaY = Math.abs(instance.touchEndY - instance.touchStartY);

            // Check if this is a horizontal swipe (not too much vertical movement)
            if (deltaY > instance.maxVerticalDistance) {
                return; // Too much vertical movement, ignore
            }

            // Check if swipe distance is sufficient
            if (Math.abs(deltaX) < instance.minSwipeDistance) {
                return; // Swipe distance too small
            }

            // Determine swipe direction and navigate
            if (deltaX > 0) {
                // Swipe right - go to previous
                this.navigatePrevious(wrapper);
            } else {
                // Swipe left - go to next
                this.navigateNext(wrapper);
            }
        }

        // Get current state for debugging
        getCurrentState(wrapper) {
            const instance = this.tabInstances.get(wrapper);
            if (!instance) {
                return { error: 'No instance found for wrapper' };
            }

            return {
                currentIndex: instance.currentIndex,
                totalTabs: instance.totalTabs,
                hasTimer: !!instance.autoAdvanceTimer,
                canGoNext: instance.currentIndex < instance.totalTabs - 1,
                canGoPrevious: instance.currentIndex > 0
            };
        }
    }

    // Create global instance
    const navigationManager = new TabNavigationManager();
    
    // Make it globally accessible for debugging
    window.navigationManager = navigationManager;
    
    console.log('📱 Tab Navigation script loaded');
})();