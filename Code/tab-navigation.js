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
            const nextButton = wrapper.querySelector('.arrow.tab_next');
            const prevButton = wrapper.querySelector('.arrow.tab_previous');

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
                currentIndex: 0,
                totalTabs: 0
            };

            // Get total number of tabs
            const tabLinks = tabsElement.querySelectorAll('[data-tabs="link"]');
            instanceData.totalTabs = tabLinks.length;

            if (instanceData.totalTabs === 0) {
                console.warn(`⚠️ No tab links found in wrapper ${index}`);
                return;
            }

            // Find currently active tab
            const activeTab = tabsElement.querySelector('[data-tabs="link"].w--current');
            if (activeTab) {
                const activeIndex = Array.from(tabLinks).indexOf(activeTab);
                if (activeIndex !== -1) {
                    instanceData.currentIndex = activeIndex;
                }
            }

            this.tabInstances.set(wrapper, instanceData);

            // Add event listeners
            nextButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateNext(wrapper);
            });

            prevButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigatePrevious(wrapper);
            });

            // Update button states initially
            this.updateButtonStates(wrapper);

            console.log(`✅ Initialized tab wrapper ${index} with ${instanceData.totalTabs} tabs`);
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

            const tabLinks = instance.tabsElement.querySelectorAll('[data-tabs="link"]');
            const targetTab = tabLinks[targetIndex];

            if (!targetTab) {
                console.warn(`⚠️ Target tab at index ${targetIndex} not found`);
                return;
            }

            // Update current index
            instance.currentIndex = targetIndex;

            // Trigger click on the target tab
            targetTab.click();

            // Update button states
            this.updateButtonStates(wrapper);

            console.log(`🎯 Navigated to tab ${targetIndex + 1} of ${instance.totalTabs}`);
        }

        updateButtonStates(wrapper) {
            const instance = this.tabInstances.get(wrapper);
            if (!instance) return;

            const { nextButton, prevButton, currentIndex, totalTabs } = instance;

            // Update Previous button state
            if (currentIndex <= 0) {
                prevButton.style.opacity = '0.5';
                prevButton.style.pointerEvents = 'none';
            } else {
                prevButton.style.opacity = '1';
                prevButton.style.pointerEvents = 'auto';
            }

            // Update Next button state
            if (currentIndex >= totalTabs - 1) {
                nextButton.style.opacity = '0.5';
                nextButton.style.pointerEvents = 'none';
            } else {
                nextButton.style.opacity = '1';
                nextButton.style.pointerEvents = 'auto';
            }
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

    // Make it globally accessible for debugging
    window.TabNavigationManager = navigationManager;

    console.log('📱 Tab Navigation script loaded');
})();