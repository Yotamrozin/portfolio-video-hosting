(function() {
    'use strict';
    
    // Configuration - Easy to adjust timer duration
    const AUTO_ADVANCE_DURATION = 5000; // 5 seconds
    
    class TabNavigationManager {
        constructor() {
            this.tabInstances = new Map();
            // Add debounce timers for navigation methods
            this.navigationDebounceTimers = new Map();
            this.isInitialized = false; // Add initialization flag
            this.globalAutoAdvanceTimer = null; // Single global timer
            this.currentActiveWrapper = null; // Track which wrapper is currently active
            this.init();
        }

        init() {
            console.log('🎯 Tab Navigation Manager initializing...');
            
            // Prevent double initialization
            if (this.isInitialized) {
                console.log('⚠️ Tab Navigation Manager already initialized, skipping...');
                return;
            }
            
            // Wait for Webflow and Finsweet to be ready
            if (typeof Webflow !== 'undefined') {
                Webflow.push(() => {
                    if (!this.isInitialized) {
                        this.setupNavigation();
                        this.isInitialized = true;
                    }
                });
            } else {
                // Fallback if Webflow is not available
                document.addEventListener('DOMContentLoaded', () => {
                    if (!this.isInitialized) {
                        this.setupNavigation();
                        this.isInitialized = true;
                    }
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
                // Remove autoAdvanceTimer from instance data
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

            // Only start timer for the first wrapper (initially visible)
            if (index === 0) {
                this.currentActiveWrapper = wrapper;
                this.startGlobalAutoAdvanceTimer();
            }
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
            // Add debouncing to prevent multiple rapid calls
            const timerId = this.navigationDebounceTimers.get(wrapper + '_next');
            if (timerId) {
                return; // Already processing a navigation
            }
            
            this.navigationDebounceTimers.set(wrapper + '_next', setTimeout(() => {
                this.navigationDebounceTimers.delete(wrapper + '_next');
            }, 100)); // 100ms debounce
            
            const instance = this.tabInstances.get(wrapper);
            if (!instance) return;
            
            // Always reset the global auto-advance timer on any navigation
            this.resetGlobalAutoAdvanceTimer();
            
            console.log(`🔍 NavigateNext - currentIndex: ${instance.currentIndex}, totalTabs: ${instance.totalTabs}`);

            // Check if we're at the last tab - trigger Swiper category change
            if (instance.currentIndex >= instance.totalTabs - 1) {
                // At last tab - move to next Swiper category
                if (window.mySwiper && typeof window.mySwiper.slideNext === 'function') {
                    console.log('🎯 At last tab, moving to next Swiper slide');
                    window.mySwiper.slideNext(300, true);
                    // Reset to first tab for the new category
                    instance.currentIndex = 0;
                    return;
                }
                return;
            }

            const nextIndex = instance.currentIndex + 1;
            this.navigateToTab(wrapper, nextIndex);
        }

        navigatePrevious(wrapper) {
            // Add debouncing to prevent multiple rapid calls
            const timerId = this.navigationDebounceTimers.get(wrapper + '_prev');
            if (timerId) {
                return; // Already processing a navigation
            }
            
            this.navigationDebounceTimers.set(wrapper + '_prev', setTimeout(() => {
                this.navigationDebounceTimers.delete(wrapper + '_prev');
            }, 100)); // 100ms debounce
            
            const instance = this.tabInstances.get(wrapper);
            if (!instance) return;
            
            console.log(`🔍 NavigatePrevious - currentIndex: ${instance.currentIndex}, totalTabs: ${instance.totalTabs}`);

            // Check if we're at the first tab - trigger Swiper category change
            if (instance.currentIndex <= 0) {
                // At first tab - move to previous Swiper category
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
            const tabPanes = instance.tabsElement.querySelectorAll('.w-tab-pane');
            const targetTab = tabLinks[targetIndex];
            const targetPane = tabPanes[targetIndex];

            if (!targetTab || !targetPane) {
                console.warn(`⚠️ Target tab at index ${targetIndex} not found`);
                return;
            }

            console.log(`🎯 Navigating from tab ${instance.currentIndex} to tab ${targetIndex}`);
            
            // Remove current active states
            tabLinks.forEach(link => link.classList.remove('w--current'));
            tabPanes.forEach(pane => pane.classList.remove('w--tab-active'));
            
            // Set new active states
            targetTab.classList.add('w--current');
            targetPane.classList.add('w--tab-active');
            
            // Update instance state
            instance.currentIndex = targetIndex;
            
            // COMMENTED OUT - indicator animation disabled
            // this.startIndicatorAnimation(wrapper);
        }

        // Auto-advance functionality
        startGlobalAutoAdvanceTimer() {
            // Clear any existing timer
            if (this.globalAutoAdvanceTimer) {
                clearTimeout(this.globalAutoAdvanceTimer);
            }

            // Start new timer
            this.globalAutoAdvanceTimer = setTimeout(() => {
                console.log('⏰ Auto-advance triggered for active wrapper');
                if (this.currentActiveWrapper) {
                    const instance = this.tabInstances.get(this.currentActiveWrapper);
                    if (instance) {
                        this.updateCurrentIndex(instance);
                        this.navigateNext(this.currentActiveWrapper);
                    }
                }
            }, AUTO_ADVANCE_DURATION);

            console.log(`⏱️ Global auto-advance timer started (${AUTO_ADVANCE_DURATION}ms)`);
        }

        resetGlobalAutoAdvanceTimer() {
            // Clear existing timer
            if (this.globalAutoAdvanceTimer) {
                clearTimeout(this.globalAutoAdvanceTimer);
                this.globalAutoAdvanceTimer = null;
            }

            // Start new timer
            this.startGlobalAutoAdvanceTimer();
            console.log('🔄 Global auto-advance timer reset due to navigation');
        }

        setActiveWrapper(wrapper) {
            const instance = this.tabInstances.get(wrapper);
            if (!instance) return;
            
            // Update the active wrapper
            this.currentActiveWrapper = wrapper;
            
            // Recalculate totalTabs for the new active category
            const tabLinks = instance.tabsElement.querySelectorAll('.w-tab-link');
            instance.totalTabs = tabLinks.length;
            
            // Reset to first tab
            instance.currentIndex = 0;
            
            // Reset the timer (don't pause, just restart the countdown)
            this.resetGlobalAutoAdvanceTimer();
            
            console.log(`🎯 Active wrapper changed - totalTabs: ${instance.totalTabs}`);
        }

        pauseGlobalAutoAdvance() {
            if (this.globalAutoAdvanceTimer) {
                clearTimeout(this.globalAutoAdvanceTimer);
                this.globalAutoAdvanceTimer = null;
                console.log('⏸️ Global auto-advance paused');
            }
        }

        resumeAutoAdvance(wrapper) {
            const instance = this.tabInstances.get(wrapper);
            if (!instance) return;

            // Only resume if no timer is currently active
            if (!instance.autoAdvanceTimer) {
                this.startAutoAdvanceTimer(wrapper);
                console.log('▶️ Auto-advance resumed');
            }
        }

        resumeAutoAdvanceForTabsElement(tabsElement) {
            // Find the wrapper that contains this tabsElement
            const wrapper = tabsElement.closest('.tab-wrapper');
            if (!wrapper) {
                // Fallback to the old method if closest doesn't find the wrapper
                for (const [wrapperEl, instance] of this.tabInstances) {
                    if (instance.tabsElement === tabsElement) {
                        // Reset state before resuming
                        this.resetInstanceState(wrapperEl);
                        this.resumeAutoAdvance(wrapperEl);
                        return;
                    }
                }
                return;
            }
            // Now resume auto-advance
            this.resumeAutoAdvance(wrapper);
        }
        
        // COMMENTED OUT - indicator animation methods disabled
        /*
        clearIndicatorAnimation(wrapper) {
            const instance = this.tabInstances.get(wrapper);
            if (!instance) return;

            // Find the current active tab
            const currentTab = instance.tabsElement.querySelector('.w-tab-link.w--current');
            if (!currentTab) return;

            // Find the inner div (indicator)
            const indicator = currentTab.querySelector('div');
            if (!indicator) return;

            // Stop any ongoing animation
            indicator.style.transition = 'none';
            
            // Restore original styles if available
            if (instance.originalIndicatorStyles) {
                indicator.style.width = instance.originalIndicatorStyles.width;
            }
        }
        */

        pauseAutoAdvanceForTabsElement(tabsElement) {
            // Find the wrapper that contains this tabs element
            for (const [wrapper, instance] of this.tabInstances) {
                if (instance.tabsElement === tabsElement) {
                    // Pause auto-advance
                    this.pauseGlobalAutoAdvance();
                    
                    // Clear all indicators in the tabs component
                    this.clearAllIndicators(tabsElement);
                    
                    // Reset to first tab
                    this.resetToFirstTab(wrapper);
                    
                    return;
                }
            }
        }
        
        clearAllIndicators(tabsElement) {
            const allTabLinks = tabsElement.querySelectorAll('.w-tab-link');
            
            allTabLinks.forEach(tabLink => {
                const indicator = tabLink.querySelector('div');
                if (indicator) {
                    // Stop any ongoing animation
                    indicator.style.transition = 'none';
                    // Reset to initial state (0% width, white background)
                    indicator.style.width = '0%';
                    indicator.style.backgroundColor = 'white';
                }
            });
            
            console.log(`🧹 Cleared all indicators for tabs component`);
        }
        
        resetToFirstTab(wrapper) {
            const instance = this.tabInstances.get(wrapper);
            if (!instance) return;
            
            const tabLinks = instance.tabsElement.querySelectorAll('.w-tab-link');
            
            // Recalculate total tabs for the new category
            instance.totalTabs = tabLinks.length;
            
            const firstTab = tabLinks[0];
            
            if (firstTab) {
                // Update current index
                instance.currentIndex = 0;
                
                // Set this as the active wrapper and reset timer
                this.setActiveWrapper(wrapper);
                
                // Click the first tab to activate it
                firstTab.click();
                
                console.log(`🔄 Reset tabs component to first tab - totalTabs: ${instance.totalTabs}`);
            }
    }

        // Handle swipe gestures for category navigation
        handleSwipeGesture(wrapper) {
            const instance = this.tabInstances.get(wrapper);
            if (!instance) return;

            const deltaX = instance.touchEndX - instance.touchStartX;
            const deltaY = Math.abs(instance.touchEndY - instance.touchStartY);

            // Check if it's a valid horizontal swipe
            if (Math.abs(deltaX) > instance.minSwipeDistance && deltaY < instance.maxVerticalDistance) {
                if (deltaX > 0) {
                    // Swipe right - go to previous Swiper category
                    if (window.mySwiper && typeof window.mySwiper.slidePrev === 'function') {
                        console.log('👆 Swipe right detected - moving to previous Swiper category');
                        window.mySwiper.slidePrev(300, true);
                    }
                } else {
                    // Swipe left - go to next Swiper category
                    if (window.mySwiper && typeof window.mySwiper.slideNext === 'function') {
                        console.log('👆 Swipe left detected - moving to next Swiper category');
                        window.mySwiper.slideNext(300, true);
                    }
                }
            }
        }

        // COMMENTED OUT - indicator animation disabled
        /*
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
        */

        // Cleanup method
        destroy(wrapper) {
            const instance = this.tabInstances.get(wrapper);
            if (!instance) return;

            // COMMENTED OUT - auto-advance timer cleanup disabled
            /*
            // Clear auto-advance timer
            if (instance.autoAdvanceTimer) {
                clearInterval(instance.autoAdvanceTimer);
                instance.autoAdvanceTimer = null;
            }
            */

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