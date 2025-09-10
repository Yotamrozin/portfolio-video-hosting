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

            console.log(`📋 Found ${tabWrappers.length} tab wrapper(s)`);

            tabWrappers.forEach((wrapper, index) => {
                this.initializeTabWrapper(wrapper, index);
            });

            console.log('✅ Tab Navigation Manager initialized successfully!');
        }

        initializeTabWrapper(wrapper, index) {
            const tabsElement = wrapper.querySelector('[data-tabs="tabs"]');
            const nextButton = wrapper.querySelector('[data-tabs="next"]');
            const prevButton = wrapper.querySelector('[data-tabs="previous"]');

            if (!tabsElement) {
                console.warn(`⚠️ No tabs element found in wrapper ${index}`);
                return;
            }

            if (!nextButton || !prevButton) {
                console.warn(`⚠️ Navigation buttons not found in wrapper ${index}`);
                console.warn(`   Next button: ${nextButton ? 'found' : 'missing'}`);
                console.warn(`   Previous button: ${prevButton ? 'found' : 'missing'}`);
                return;
            }

            // Store instance data with event listeners for cleanup
            const instanceData = {
                wrapper,
                tabsElement,
                nextButton,
                prevButton,
                currentIndex: 0,
                totalTabs: 0,
                listeners: [] // Store listeners for cleanup
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

                // Event listener for tab changes
                const tabChangeListener = (e) => {
                    const tab = e.target; // The newly activated tab link
                    const clickedIndex = Array.from(tabLinks).indexOf(tab);
                    if (clickedIndex !== -1) {
                        instanceData.currentIndex = clickedIndex;
                        console.log(`🎯 Tab changed: ${clickedIndex + 1} of ${instanceData.totalTabs}`);
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

            // Add event listeners
            nextButton.addEventListener('click', nextClickListener);
            prevButton.addEventListener('click', prevClickListener);

            // Store listeners for cleanup
            instanceData.listeners = [
                { element: tabsElement, event: 'click', listener: tabClickListener },
                { element: nextButton, event: 'click', listener: nextClickListener },
                { element: prevButton, event: 'click', listener: prevClickListener }
            ];

            console.log(`✅ Initialized tab wrapper ${index} with ${instanceData.totalTabs} tabs`);
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

            // Check if we can go to next tab
            if (instance.currentIndex >= instance.totalTabs - 1) {
                console.log('🚫 Already at last tab, cannot go next');
                return;
            }

            const nextIndex = instance.currentIndex + 1;
            this.navigateToTab(wrapper, nextIndex);
        }

        navigatePrevious(wrapper) {
            const instance = this.tabInstances.get(wrapper);
            if (!instance) return;

            // Check if we can go to previous tab
            if (instance.currentIndex <= 0) {
                console.log('🚫 Already at first tab, cannot go previous');
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

            // Just trigger the click
            targetTab.click();

            console.log(`🎯 Navigated to tab ${targetIndex + 1} of ${instance.totalTabs}`);
        }


        // Cleanup method for defensive programming
        destroy(wrapper) {
            const instance = this.tabInstances.get(wrapper);
            if (!instance) return;

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
    }

    // Initialize the navigation manager
    const navigationManager = new TabNavigationManager();

    // Make it globally accessible for debugging and cleanup
    window.TabNavigationManager = navigationManager;

    console.log('📱 Tab Navigation script loaded');
})();