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

            // Don't start auto-advance immediately - let category controller manage it
            // instanceData.autoAdvanceTimer = setInterval(() => {
            //     this.navigateNext(wrapper);
            // }, AUTO_ADVANCE_DURATION); // Use configurable duration
            instanceData.autoAdvanceTimer = null; // Initialize as null

            // Add event listeners
            tabsElement.addEventListener('w-tab-change', tabChangeListener);
            nextButton.addEventListener('click', nextClickListener);
            prevButton.addEventListener('click', prevClickListener);
            
            // Add touch/swipe listeners to the wrapper element (broader touch area)
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
            }


            
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
            
            // Reset auto-advance timer after navigation
            this.resetAutoAdvanceTimer(wrapper);
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

        // Add new method for timer visualization with debugging
        startTimerVisualization(wrapper) {
            console.log('🎬 Starting timer visualization...');
            const instance = this.tabInstances.get(wrapper);
            if (!instance) {
                console.warn('❌ No instance found for wrapper:', wrapper);
                return;
            }

            // Clear any existing visualization
            this.clearTimerVisualization(wrapper);

            // Find current active tab link using existing classes
            const currentTabLink = wrapper.querySelector('.w-tab-link.w--current');
            console.log('🎯 Current tab link found:', currentTabLink);
            
            if (!currentTabLink) {
                console.warn('❌ No current tab link found in wrapper');
                console.log('Available tab links:', wrapper.querySelectorAll('.w-tab-link'));
                return;
            }

            const innerDiv = currentTabLink.querySelector('div');
            console.log('📦 Inner div found:', innerDiv);
            console.log('📦 Inner div content:', innerDiv ? innerDiv.textContent : 'null');
            
            if (!innerDiv) {
                console.warn('❌ No inner div found in current tab link');
                console.log('Tab link HTML:', currentTabLink.innerHTML);
                return;
            }

            // Store original width and set initial state
            const originalWidth = getComputedStyle(innerDiv).width;
            console.log('📏 Original width:', originalWidth);
            
            innerDiv.dataset.originalWidth = innerDiv.style.width || '100%';
            console.log('💾 Stored original width:', innerDiv.dataset.originalWidth);
            
            innerDiv.style.width = '0%';
            innerDiv.style.transition = `width ${AUTO_ADVANCE_DURATION}ms linear`;
            
            console.log('⚙️ Set initial styles - width: 0%, transition:', `width ${AUTO_ADVANCE_DURATION}ms linear`);
            console.log('📊 Current computed width after setting 0%:', getComputedStyle(innerDiv).width);
            
            // Start animation
            requestAnimationFrame(() => {
                console.log('🚀 Starting width animation to:', innerDiv.dataset.originalWidth);
                innerDiv.style.width = innerDiv.dataset.originalWidth;
                
                // Check if animation actually started
                setTimeout(() => {
                    const currentWidth = getComputedStyle(innerDiv).width;
                    console.log('📈 Width after 100ms:', currentWidth);
                }, 100);
                
                setTimeout(() => {
                    const currentWidth = getComputedStyle(innerDiv).width;
                    console.log('📈 Width after 1 second:', currentWidth);
                }, 1000);
            });
        }

        clearTimerVisualization(wrapper) {
            console.log('🧹 Clearing timer visualization...');
            
            // Reset width for all tab divs in this wrapper
            const allTabDivs = wrapper.querySelectorAll('.w-tab-link div');
            console.log('🔍 Found tab divs to clear:', allTabDivs.length);
            
            allTabDivs.forEach((div, index) => {
                console.log(`🧹 Clearing div ${index}:`, div.textContent);
                
                if (div.dataset.originalWidth) {
                    console.log(`↩️ Restoring original width: ${div.dataset.originalWidth}`);
                    div.style.width = div.dataset.originalWidth;
                    div.style.transition = '';
                    delete div.dataset.originalWidth;
                } else {
                    console.log('ℹ️ No original width stored for this div');
                }
            });
        }

        // Modified resumeAutoAdvance method with debugging
        resumeAutoAdvance(wrapper) {
            console.log('▶️ Resuming auto advance...');
            const instance = this.tabInstances.get(wrapper);
            if (!instance) {
                console.warn('❌ No instance found for resumeAutoAdvance');
                return;
            }

            // Clear existing timer
            if (instance.autoAdvanceTimer) {
                console.log('🛑 Clearing existing timer');
                clearInterval(instance.autoAdvanceTimer);
            }
            
            // Start timer visualization
            console.log('🎬 Starting visualization from resumeAutoAdvance');
            this.startTimerVisualization(wrapper);
            
            // Start fresh timer
            console.log('⏰ Starting new auto advance timer');
            instance.autoAdvanceTimer = setInterval(() => {
                console.log('⏭️ Auto advance timer triggered');
                this.navigateNext(wrapper);
            }, AUTO_ADVANCE_DURATION);
        }

        // Modified resetAutoAdvanceTimer method with debugging
        resetAutoAdvanceTimer(wrapper) {
            console.log('🔄 Resetting auto advance timer...');
            const instance = this.tabInstances.get(wrapper);
            if (!instance) {
                console.warn('❌ No instance found for resetAutoAdvanceTimer');
                return;
            }

            // Clear existing timer and visualization
            if (instance.autoAdvanceTimer) {
                console.log('🛑 Clearing existing timer for reset');
                clearInterval(instance.autoAdvanceTimer);
                instance.autoAdvanceTimer = null;
            }
            
            console.log('🧹 Clearing visualization for reset');
            this.clearTimerVisualization(wrapper);

            // Start new timer with visualization
            console.log('🎬 Starting new visualization after reset');
            this.startTimerVisualization(wrapper);
            
            console.log('⏰ Starting new timer after reset');
            instance.autoAdvanceTimer = setInterval(() => {
                console.log('⏭️ Auto advance timer triggered (after reset)');
                this.navigateNext(wrapper);
            }, AUTO_ADVANCE_DURATION);
        }

        // Modified pauseAutoAdvance method with debugging
        pauseAutoAdvance(wrapper) {
            console.log('⏸️ Pausing auto advance...');
            const instance = this.tabInstances.get(wrapper);
            if (!instance) {
                console.warn('❌ No instance found for pauseAutoAdvance');
                return;
            }

            if (instance.autoAdvanceTimer) {
                console.log('🛑 Clearing timer for pause');
                clearInterval(instance.autoAdvanceTimer);
                instance.autoAdvanceTimer = null;
                
                // Clear visualization when pausing
                console.log('🧹 Clearing visualization for pause');
                this.clearTimerVisualization(wrapper);
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

        // Debug helper method - call this manually in console
        debugCurrentState(wrapper) {
            console.log('🔍 === DEBUG CURRENT STATE ===');
            const instance = this.tabInstances.get(wrapper);
            console.log('Instance:', instance);
            console.log('Timer active:', !!instance?.autoAdvanceTimer);
            
            const currentTabLink = wrapper.querySelector('.w-tab-link.w--current');
            console.log('Current tab link:', currentTabLink);
            
            if (currentTabLink) {
                const innerDiv = currentTabLink.querySelector('div');
                console.log('Inner div:', innerDiv);
                console.log('Inner div content:', innerDiv?.textContent);
                console.log('Current width style:', innerDiv?.style.width);
                console.log('Computed width:', innerDiv ? getComputedStyle(innerDiv).width : 'null');
                console.log('Transition style:', innerDiv?.style.transition);
                console.log('Original width stored:', innerDiv?.dataset.originalWidth);
            }
            
            const allTabLinks = wrapper.querySelectorAll('.w-tab-link');
            console.log('All tab links:', allTabLinks.length);
            allTabLinks.forEach((link, i) => {
                const div = link.querySelector('div');
                console.log(`Tab ${i}:`, {
                    isCurrent: link.classList.contains('w--current'),
                    content: div?.textContent,
                    width: div?.style.width,
                    computedWidth: div ? getComputedStyle(div).width : 'null'
                });
            });
        }
    }

    // Initialize the navigation manager
    const navigationManager = new TabNavigationManager();

    // Make it globally accessible for debugging and cleanup
    window.TabNavigationManager = navigationManager;

    console.log('📱 Tab Navigation script loaded');
})();