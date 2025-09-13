(function() {
    'use strict';

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

            // Removed: console.log(`📋 Found ${tabWrappers.length} tab wrapper(s)`);

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
                // Removed: console.log('🔍 Touch start detected:', e.touches[0].clientX, e.touches[0].clientY);
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

            // Don't start auto-advance immediately - let category controller manage it
            // instanceData.autoAdvanceTimer = setInterval(() => {
            //     this.navigateNext(wrapper);
            // }, 5000); // 5 seconds
            instanceData.autoAdvanceTimer = null; // Initialize as null

            // Add event listeners
            tabsElement.addEventListener('w-tab-change', tabChangeListener);
            nextButton.addEventListener('click', nextClickListener);
            prevButton.addEventListener('click', prevClickListener);
            
            // Add touch/swipe listeners to the tabs element
            tabsElement.addEventListener('touchstart', touchStartListener, { passive: true });
            tabsElement.addEventListener('touchend', touchEndListener, { passive: true });
            
            if (middleButton) {
                middleButton.addEventListener('click', middleClickListener);
            }

            // Store listeners for cleanup
            const listeners = [
                { element: tabsElement, event: 'w-tab-change', listener: tabChangeListener },
                { element: nextButton, event: 'click', listener: nextClickListener },
                { element: prevButton, event: 'click', listener: prevClickListener },
                { element: tabsElement, event: 'touchstart', listener: touchStartListener },
                { element: tabsElement, event: 'touchend', listener: touchEndListener }
            ];
            
            if (middleButton) {
                listeners.push(
                    { element: middleButton, event: 'click', listener: middleClickListener }
                );
            }
            
            instanceData.listeners = listeners;

            // Removed: console.log(`✅ Initialized tab wrapper ${index} with ${instanceData.totalTabs} tabs`);
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

            // Remove excessive debugging
            // console.log('🔍 Current index before next:', instance.currentIndex, 'total:', instance.totalTabs);

            if (instance.currentIndex >= instance.totalTabs - 1) {
                // At last tab - trigger Swiper next slide
                if (window.mySwiper && typeof window.mySwiper.slideNext === 'function') {
                    console.log('🎯 At last tab, moving to next Swiper slide');
                    window.mySwiper.slideNext(300, true); // 300ms transition with callbacks
                    return;
                }
                // Remove this log as it's too frequent
                // console.log('🚫 Already at last tab, cannot go next');
                return;
            }

            const nextIndex = instance.currentIndex + 1;
            this.navigateToTab(wrapper, nextIndex);
        }

        navigatePrevious(wrapper) {
            const instance = this.tabInstances.get(wrapper);
            if (!instance) return;

            // Removed: console.log(`🔍 Current index before previous: ${instance.currentIndex}, total: ${instance.totalTabs}`);

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

            // Removed: console.log(`🎯 Navigated from tab ${oldIndex + 1} to tab ${targetIndex + 1} of ${instance.totalTabs}`);
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

        // New methods for pausing/resuming auto-advance
        pauseAutoAdvance(wrapper) {
            const instance = this.tabInstances.get(wrapper);
            if (!instance) return;

            if (instance.autoAdvanceTimer) {
                clearInterval(instance.autoAdvanceTimer);
                instance.autoAdvanceTimer = null;
                // Remove excessive logging
                // console.log('⏸️ Auto-advance paused for tab wrapper');
            }
        }

        resumeAutoAdvance(wrapper) {
            const instance = this.tabInstances.get(wrapper);
            if (!instance) return;

            // Only resume if not already running
            if (!instance.autoAdvanceTimer) {
                instance.autoAdvanceTimer = setInterval(() => {
                    this.navigateNext(wrapper);
                }, 5000); // 5 seconds
                // Remove excessive logging
                // console.log('▶️ Auto-advance resumed for tab wrapper');
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
            if (!instance) {
                console.log('🚫 No instance found for wrapper');
                return;
            }

            const deltaX = instance.touchEndX - instance.touchStartX;
            const deltaY = Math.abs(instance.touchEndY - instance.touchStartY);
            const absDeltaX = Math.abs(deltaX);

            console.log('🔍 Swipe analysis:', {
                deltaX,
                deltaY,
                absDeltaX,
                minSwipeDistance: instance.minSwipeDistance,
                maxVerticalDistance: instance.maxVerticalDistance,
                swiperAvailable: !!window.mySwiper
            });

            // Check if this is a valid horizontal swipe
            if (absDeltaX >= instance.minSwipeDistance && deltaY <= instance.maxVerticalDistance) {
                if (deltaX > 0) {
                    // Swipe right - go to previous Swiper category
                    if (window.mySwiper && typeof window.mySwiper.slidePrev === 'function') {
                        console.log('👆 Swipe right detected - moving to previous Swiper category');
                        window.mySwiper.slidePrev(300, true);
                    } else {
                        console.log('🚫 Swiper not available for slidePrev');
                    }
                } else {
                    // Swipe left - go to next Swiper category
                    if (window.mySwiper && typeof window.mySwiper.slideNext === 'function') {
                        console.log('👆 Swipe left detected - moving to next Swiper category');
                        window.mySwiper.slideNext(300, true);
                    } else {
                        console.log('🚫 Swiper not available for slideNext');
                    }
                }
            } else {
                console.log('🚫 Swipe did not meet criteria for horizontal swipe');
            }
        }
    }

    // Initialize the navigation manager
    const navigationManager = new TabNavigationManager();

    // Make it globally accessible for debugging and cleanup
    window.TabNavigationManager = navigationManager;

    console.log('📱 Tab Navigation script loaded');
})();