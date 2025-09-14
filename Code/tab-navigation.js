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
                return;
            }

            // Store instance data
            const instanceData = {
                wrapper,
                tabsElement,
                nextButton,
                prevButton,
                middleButton,
                currentIndex: 0,
                totalTabs: 0,
                listeners: [],
                autoAdvanceTimer: null,
                // Touch/swipe properties
                touchStartX: 0,
                touchStartY: 0,
                touchEndX: 0,
                touchEndY: 0,
                minSwipeDistance: 50,
                maxVerticalDistance: 100
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
            let debounceTimer = null;
            const tabChangeListener = (e) => {
                if (debounceTimer) {
                    clearTimeout(debounceTimer);
                }
                
                debounceTimer = setTimeout(() => {
                    const activeTab = instanceData.tabsElement.querySelector('.w-tab-link.w--current');
                    if (activeTab) {
                        const activeIndex = Array.from(tabLinks).indexOf(activeTab);
                        if (activeIndex !== -1) {
                            const oldIndex = instanceData.currentIndex;
                            instanceData.currentIndex = activeIndex;
                            console.log(`🎯 Tab changed: ${oldIndex} → ${activeIndex} (${activeIndex + 1} of ${instanceData.totalTabs})`);
                        }
                    }
                    debounceTimer = null;
                }, 5);
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
                this.navigateNext(wrapper);
            };

            // Touch/swipe event listeners
            const touchStartListener = (e) => {
                instanceData.touchStartX = e.touches[0].clientX;
                instanceData.touchStartY = e.touches[0].clientY;
            };

            const touchEndListener = (e) => {
                instanceData.touchEndX = e.changedTouches[0].clientX;
                instanceData.touchEndY = e.changedTouches[0].clientY;
                this.handleSwipeGesture(wrapper);
            };

            // Add event listeners
            tabsElement.addEventListener('w-tab-change', tabChangeListener);
            nextButton.addEventListener('click', nextClickListener);
            prevButton.addEventListener('click', prevClickListener);
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
                listeners.push({ element: middleButton, event: 'click', listener: middleClickListener });
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
            
            console.log(`🔍 NavigateNext - currentIndex: ${instance.currentIndex}, totalTabs: ${instance.totalTabs}`);

            if (instance.currentIndex >= instance.totalTabs - 1) {
                // At last tab - trigger Swiper next slide
                if (window.mySwiper && typeof window.mySwiper.slideNext === 'function') {
                    console.log('🎯 At last tab, moving to next Swiper slide');
                    window.mySwiper.slideNext(300, true);
                    return;
                }
                return;
            }

            const nextIndex = instance.currentIndex + 1;
            this.navigateToTab(wrapper, nextIndex);
        }

        navigatePrevious(wrapper) {
            const instance = this.tabInstances.get(wrapper);
            if (!instance) return;
            
            console.log(`🔍 NavigatePrevious - currentIndex: ${instance.currentIndex}, totalTabs: ${instance.totalTabs}`);

            if (instance.currentIndex <= 0) {
                // At first tab - trigger Swiper previous slide
                if (window.mySwiper && typeof window.mySwiper.slidePrev === 'function') {
                    console.log('🎯 At first tab, moving to previous Swiper slide');
                    window.mySwiper.slidePrev(300, true);
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

            console.log(`🎯 Navigating from tab ${instance.currentIndex} to tab ${targetIndex}`);
            
            const oldIndex = instance.currentIndex;
            instance.currentIndex = targetIndex;
            
            // Trigger the click
            targetTab.click();
            
            // Start indicator animation
            this.startIndicatorAnimation(wrapper);
        }

                // New methods for pausing/resuming auto-advance
        pauseAutoAdvance(wrapper) {
            const instance = this.tabInstances.get(wrapper);
            if (!instance) return;

            if (instance.autoAdvanceTimer) {
                clearInterval(instance.autoAdvanceTimer);
                instance.autoAdvanceTimer = null;
            }
            this.clearIndicatorAnimation(wrapper);
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

        
        // Handle swipe gestures
        handleSwipeGesture(wrapper) {
            const instance = this.tabInstances.get(wrapper);
            if (!instance) return;

            const deltaX = instance.touchEndX - instance.touchStartX;
            const deltaY = Math.abs(instance.touchEndY - instance.touchStartY);

            // Check if it's a valid horizontal swipe
            if (Math.abs(deltaX) > instance.minSwipeDistance && deltaY < instance.maxVerticalDistance) {
                if (deltaX > 0) {
                    // Swipe right - go to previous
                    this.navigatePrevious(wrapper);
                } else {
                    // Swipe left - go to next
                    this.navigateNext(wrapper);
                }
            }
        }

        // Start indicator animation
        startIndicatorAnimation(wrapper) {
            const instance = this.tabInstances.get(wrapper);
            if (!instance) return;

            const currentTab = instance.tabsElement.querySelector('.w-tab-link.w--current');
            if (!currentTab) return;

            const indicator = currentTab.querySelector('div');
            if (!indicator) return;

            // Reset to initial properties: white background and 0% width
            indicator.style.backgroundColor = 'white';
            indicator.style.width = '0%';
            indicator.style.transition = 'none';

            // Force reflow
            indicator.offsetHeight;

            // Start animation to 100%
            indicator.style.transition = `width ${AUTO_ADVANCE_DURATION}ms linear`;
            indicator.style.width = '100%';
        }

        // Cleanup method
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
        }

        // Destroy all instances
        destroyAll() {
            const wrappers = Array.from(this.tabInstances.keys());
            wrappers.forEach(wrapper => this.destroy(wrapper));
        }

        // Public method to get current tab info for debugging
        getCurrentTabInfo(wrapperIndex = 0) {
            const wrappers = Array.from(this.tabInstances.keys());
            const wrapper = wrappers[wrapperIndex];
            const instance = this.tabInstances.get(wrapper);
            
            if (!instance) return null;

            return {
                currentIndex: instance.currentIndex,
                totalTabs: instance.totalTabs,
                currentTab: instance.currentIndex + 1,
                canGoNext: instance.currentIndex < instance.totalTabs - 1,
                canGoPrevious: instance.currentIndex > 0
            };
        }
    }

    // Initialize the navigation manager
    window.TabNavigationManager = new TabNavigationManager();
})();