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
            const tabChangeListener = (e) => {
                // Find which tab is now active
                const activeTab = instanceData.tabsElement.querySelector('.w-tab-link.w--current');
                if (activeTab) {
                    const activeIndex = Array.from(tabLinks).indexOf(activeTab);
                    if (activeIndex !== -1) {
                        instanceData.currentIndex = activeIndex;
                        console.log(`🎯 Tab changed to: ${activeIndex + 1} of ${instanceData.totalTabs}`);
                        
                        // MODIFIED: Only pause timer on manual clicks, don't auto-restart
                        // The category controller will handle resuming
                        this.pauseAutoAdvance(wrapper);
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
                this.handleSwipeGesture(wrapper);
            };

            // Initialize as null - let category controller manage it
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
                    // Pause current timer before category switch
                    this.pauseAutoAdvance(wrapper);
                    window.mySwiper.slideNext(300, true);
                    return;
                }
                return;
            }

            const nextIndex = instance.currentIndex + 1;
            this.navigateToTab(wrapper, nextIndex);
            
            // REMOVED: Don't automatically reset timer here
            // Let the category controller manage timer lifecycle
        }

        navigatePrevious(wrapper) {
            const instance = this.tabInstances.get(wrapper);
            if (!instance) return;

            // Check if we can go to previous tab
            if (instance.currentIndex <= 0) {
                // At first tab - trigger Swiper previous slide
                if (window.mySwiper && typeof window.mySwiper.slidePrev === 'function') {
                    console.log('🎯 At first tab, moving to previous Swiper slide');
                    // Pause current timer before category switch
                    this.pauseAutoAdvance(wrapper);
                    window.mySwiper.slidePrev(300, true);
                    return;
                }
                return;
            }

            const prevIndex = instance.currentIndex - 1;
            this.navigateToTab(wrapper, prevIndex);
            
            // REMOVED: Don't automatically reset timer here
            // Let the category controller manage timer lifecycle
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
            }, 50);
        }

        // Cleanup method for defensive programming
        destroy(wrapper) {
            const instance = this.tabInstances.get(wrapper);
            if (!instance) return;

            // Clear auto-advance timer
            if (instance.autoAdvanceTimer) {
                clearInterval(instance.autoAdvanceTimer);
                instance.autoAdvanceTimer = null;
            }

            // Remove all event listeners
            instance.listeners.forEach(({ element, event, listener }) => {
                element.removeEventListener(event, listener);
            });

            // Remove from instances map
            this.tabInstances.delete(wrapper);

            console.log('🧹 Tab navigation instance cleaned up');
        }

        // Destroy all instances
        destroyAll() {
            const wrappers = Array.from(this.tabInstances.keys());
            wrappers.forEach(wrapper => this.destroy(wrapper));
            console.log('🧹 All tab navigation instances cleaned up');
        }

        // Public method to get current tab info for debugging
        getCurrentTabInfo(wrapperIndex = 0) {
            const wrappers = Array.from(this.tabInstances.keys());
            const wrapper = wrappers[wrapperIndex];
            const instance = this.tabInstances.get(wrapper);
            
            if (!instance) {
                return null;
            }

            return {
                currentIndex: instance.currentIndex,
                totalTabs: instance.totalTabs,
                currentTab: instance.currentIndex + 1,
                canGoNext: instance.currentIndex < instance.totalTabs - 1,
                canGoPrevious: instance.currentIndex > 0
            };
        }

        // Basic timer methods (without visualization)
        // Add timer visualization methods
        // Fixed timer visualization methods
        startTimerVisualization(wrapper) {
            const instance = this.tabInstances.get(wrapper);
            if (!instance) return;

            // Clear any existing visualization first
            this.clearTimerVisualization(wrapper);

            const currentTabLink = wrapper.querySelector('.w-tab-link.w--current');
            if (!currentTabLink) return;

            const indicator = currentTabLink.querySelector('div');
            if (!indicator) return;

            console.log('🎬 Starting timer visualization for tab:', currentTabLink);

            // Store original width and set up animation
            const computedStyle = getComputedStyle(indicator);
            const originalWidth = computedStyle.width;
            
            // Store original width for restoration
            indicator.dataset.originalWidth = originalWidth;
            
            // IMPORTANT: Reset to 0% first, then set up transition
            indicator.style.transition = '';
            indicator.style.width = '0%';
            indicator.style.backgroundColor = 'white';
            
            // Force reflow before starting animation
            indicator.offsetHeight;
            
            // Now set transition and animate to 100%
            indicator.style.transition = `width ${AUTO_ADVANCE_DURATION}ms linear`;
            indicator.style.width = '100%';

            console.log('✅ Timer visualization started - animating to 100% over', AUTO_ADVANCE_DURATION, 'ms');
        }

        clearTimerVisualization(wrapper) {
            // Reset all tab indicators in this wrapper
            const allTabLinks = wrapper.querySelectorAll('.w-tab-link');
            
            allTabLinks.forEach((tabLink) => {
                const indicator = tabLink.querySelector('div');
                if (!indicator) return;

                // Restore original width if stored
                if (indicator.dataset.originalWidth) {
                    indicator.style.width = indicator.dataset.originalWidth;
                    indicator.style.backgroundColor = ''; // Remove white background
                    indicator.style.transition = '';
                    delete indicator.dataset.originalWidth;
                }
            });

            console.log('🧹 Timer visualization cleared for wrapper');
        }

        // Fixed timer methods with proper cleanup
        resumeAutoAdvance(wrapper) {
            const instance = this.tabInstances.get(wrapper);
            if (!instance) return;

            console.log('▶️ Resuming auto advance...');

            // CRITICAL: Always clear existing timer first
            this.pauseAutoAdvance(wrapper);
            
            // Start timer visualization
            this.startTimerVisualization(wrapper);
            
            // Start fresh timer
            instance.autoAdvanceTimer = setInterval(() => {
                console.log('⏭️ Auto advance timer triggered');
                this.navigateNext(wrapper);
            }, AUTO_ADVANCE_DURATION);
        }

        resetAutoAdvanceTimer(wrapper) {
            const instance = this.tabInstances.get(wrapper);
            if (!instance) return;

            console.log('🔄 Resetting auto advance timer...');

            // CRITICAL: Completely pause first to avoid multiple timers
            this.pauseAutoAdvance(wrapper);

            // Only restart if auto-advance should be active
            // Don't automatically restart - let category controller manage this
            console.log('⏸️ Timer reset complete - waiting for category controller to resume');
        }

        pauseAutoAdvance(wrapper) {
            const instance = this.tabInstances.get(wrapper);
            if (!instance) return;

            console.log('⏸️ Pausing auto advance...');

            if (instance.autoAdvanceTimer) {
                clearInterval(instance.autoAdvanceTimer);
                instance.autoAdvanceTimer = null;
                
                // Clear visualization when pausing
                this.clearTimerVisualization(wrapper);
                console.log('✅ Timer and visualization cleared');
            } else {
                console.log('ℹ️ No timer to pause');
            }
        }

        // Modified navigation methods to prevent timer cascade
        navigateNext(wrapper) {
            const instance = this.tabInstances.get(wrapper);
            if (!instance) return;

            if (instance.currentIndex >= instance.totalTabs - 1) {
                // At last tab - trigger Swiper next slide
                if (window.mySwiper && typeof window.mySwiper.slideNext === 'function') {
                    console.log('🎯 At last tab, moving to next Swiper slide');
                    // Pause current timer before category switch
                    this.pauseAutoAdvance(wrapper);
                    window.mySwiper.slideNext(300, true);
                    return;
                }
                return;
            }

            const nextIndex = instance.currentIndex + 1;
            this.navigateToTab(wrapper, nextIndex);
            
            // REMOVED: Don't automatically reset timer here
            // Let the category controller manage timer lifecycle
        }

        navigatePrevious(wrapper) {
            const instance = this.tabInstances.get(wrapper);
            if (!instance) return;

            // Check if we can go to previous tab
            if (instance.currentIndex <= 0) {
                // At first tab - trigger Swiper previous slide
                if (window.mySwiper && typeof window.mySwiper.slidePrev === 'function') {
                    console.log('🎯 At first tab, moving to previous Swiper slide');
                    // Pause current timer before category switch
                    this.pauseAutoAdvance(wrapper);
                    window.mySwiper.slidePrev(300, true);
                    return;
                }
                return;
            }

            const prevIndex = instance.currentIndex - 1;
            this.navigateToTab(wrapper, prevIndex);
            
            // REMOVED: Don't automatically reset timer here
            // Let the category controller manage timer lifecycle
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
    }

    // Create global instance
    const navigationManager = new TabNavigationManager();
    
    // Make it globally accessible for debugging
    window.navigationManager = navigationManager;
    
    console.log('📱 Tab Navigation script loaded');
})();