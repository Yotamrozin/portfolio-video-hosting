/**
 * Optimized CategoryTabsController
 * - Awaits TabsConstructor.ready()
 * - Uses Maps & WeakMaps to cache relationships
 * - Minimal DOM queries, avoided reflows
 * - Defensive error handling and single retry
 */

class CategoryTabsController {
  constructor(options = {}) {
    this.options = Object.assign({
      categoryButtonSelector: '[data-category-button]',
      categoryAttr: 'data-category',
      tabsAttr: 'data-category-tabs',
      activeClass: 'active',
      defaultCategory: null,
      debug: false
    }, options);

    // caches & maps
    this._buttons = [];           // array of button elements
    this._buttonToCategory = new WeakMap(); // button -> category string
    this._categoryToButtons = new Map();    // category -> [buttons]
    this._categoryToTabs = new Map();       // category -> TabsConstructor instance (uniqueId)
    this._initialized = false;
  }

  log(...args) {
    if (this.options.debug) console.log('CategoryTabsController:', ...args);
  }

  async init() {
    if (this._initialized) return;
    try {
      // 1) ensure DOM ready
      if (document.readyState === 'loading') {
        await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve, { once: true }));
      }

      // 2) ensure TabsConstructor is available and initialized
      if (!window.TabsConstructor) {
        console.warn('CategoryTabsController: Missing TabsConstructor. Will wait briefly for initialization.');
        // wait for 2s for potential loader; don't loop forever
        await new Promise(r => setTimeout(r, 2000));
        if (!window.TabsConstructor) {
          console.error('CategoryTabsController: TabsConstructor not present. Aborting controller init.');
          return;
        }
      }

      try {
        await window.TabsConstructor.ready();
      } catch (err) {
        // If TabsConstructor failed, still attempt best-effort pairing once
        console.warn('CategoryTabsController: TabsConstructor.ready() rejected, attempting best-effort setup', err);
      }

      // 3) collect buttons and build maps (cached)
      this._collectCategoryButtons();

      // 4) map categories to tabs instances using DOM attributes and the TabsConstructor cache
      this._pairCategoryTabsWithButtons();

      // 5) set initial visibility and attach listeners
      this._initializeVisibility();
      this._attachButtonListeners();

      this._initialized = true;
      this.log('initialized with', this._categoryToTabs.size, 'category mappings');
    } catch (err) {
      console.error('CategoryTabsController: initialization error', err);
    }
  }

  _collectCategoryButtons() {
    const selector = this.options.categoryButtonSelector;
    const buttons = Array.from(document.querySelectorAll(selector));
    this._buttons = buttons;

    buttons.forEach(btn => {
      const category = btn.getAttribute(this.options.categoryAttr) || btn.dataset.category;
      if (!category) {
        console.warn('CategoryTabsController: button missing category attribute', btn);
        return;
      }
      this._buttonToCategory.set(btn, category);

      if (!this._categoryToButtons.has(category)) {
        this._categoryToButtons.set(category, []);
      }
      this._categoryToButtons.get(category).push(btn);
    });
  }

  _pairCategoryTabsWithButtons() {
    // Use TabsConstructor instances. Prefer a direct data attribute on tab roots:
    // e.g. <div data-category-tabs="my-category" data-tabs-id="...">...</div>
    if (!window.TabsConstructor) {
      console.warn('CategoryTabsController: TabsConstructor not found during pairing.');
      return;
    }

    const tabInstances = window.TabsConstructor.instances || new Map();
    // if instances is a Map (as in optimized TabsConstructor), iterate entries
    if (tabInstances instanceof Map) {
      tabInstances.forEach((inst, uniqueId) => {
        try {
          // try to read category attribute from root element
          const root = inst.rootElement;
          const category = (root && (root.getAttribute(this.options.tabsAttr) || root.dataset.categoryTabs || root.dataset.category)) || null;
          if (!category) {
            // skip if no category annotation
            this.log('skipping tab instance without category attr', uniqueId, root);
            return;
          }
          this._categoryToTabs.set(category, uniqueId);
        } catch (err) {
          console.warn('CategoryTabsController: error pairing instance', uniqueId, err);
        }
      });
    } else {
      // Legacy shape: try to iterate object/array
      try {
        const arr = Array.isArray(tabInstances) ? tabInstances : Object.values(tabInstances || {});
        arr.forEach((inst) => {
          const root = inst.rootElement || inst.tabsComponent || inst.node;
          const category = root && (root.getAttribute(this.options.tabsAttr) || root.dataset.categoryTabs || root.dataset.category);
          if (category) {
            // store by uniqueId if available, else use timestamp index
            const uid = inst.uniqueId || inst.id || `legacy-${Math.random().toString(36).slice(2,8)}`;
            this._categoryToTabs.set(category, uid);
            // also make sure TabsConstructor.instances has uid => inst mapping if possible
            if (window.TabsConstructor && window.TabsConstructor.instances && !window.TabsConstructor.instances.get(uid)) {
              try {
                window.TabsConstructor.instances.set(uid, inst);
              } catch (e) { /* ignore */ }
            }
          }
        });
      } catch (e) {
        // no-op
      }
    }
  }

  _initializeVisibility() {
    // show default or the first category if no default provided
    const defaultCategory = this.options.defaultCategory || (this._categoryToButtons.keys().next().value);
    if (!defaultCategory) return;
    this.activateCategory(defaultCategory);
  }

  _attachButtonListeners() {
    // Attach single delegated listener for performance if buttons share a container
    // Otherwise attach per-button listener safely
    this._buttons.forEach(btn => {
      if (btn._categoryTabsControllerListenerAttached) return;
      const handler = (ev) => {
        ev.preventDefault();
        const category = this._buttonToCategory.get(btn);
        if (!category) {
          console.warn('CategoryTabsController: clicked button missing category mapping', btn);
          return;
        }
        this.activateCategory(category);
      };
      btn.addEventListener('click', handler, { passive: false });
      // mark to avoid double attaching
      btn._categoryTabsControllerListenerAttached = true;
      // store handler in WeakMap if you need to remove later (not required now)
    });
  }

  activateCategory(category) {
    try {
      if (!category) return;
      // 1) toggle active classes on buttons
      this._setActiveButtonForCategory(category);

      // 2) get associated tabs instance uniqueId
      const uid = this._categoryToTabs.get(category);
      if (!uid) {
        console.warn(`CategoryTabsController: no tabs mounted for category "${category}"`);
        return;
      }

      // 3) ask TabsConstructor for the instance object
      const tc = window.TabsConstructor;
      if (!tc) {
        console.error('CategoryTabsController: TabsConstructor missing at activation time.');
        return;
      }
      const inst = tc.getInstance(uid);
      if (!inst) {
        console.warn('CategoryTabsController: could not resolve instance for uid', uid);
        return;
      }

      // 4) perform the visibility switch within the instance's root
      this._showTabsInstance(inst, category);
    } catch (err) {
      console.error('CategoryTabsController: activateCategory error', err);
    }
  }

  _setActiveButtonForCategory(category) {
    // remove active from all related buttons and add to those matching category
    this._categoryToButtons.forEach((btns, cat) => {
      btns.forEach(b => b.classList.toggle(this.options.activeClass, cat === category));
    });
  }

  _showTabsInstance(instance, category) {
    try {
      // Use cached queries on the instance where possible (TabsConstructor.query)
      const tc = window.TabsConstructor;
      const root = instance.rootElement;
      if (!root) return;

      // Hide other tab instances
      for (const [cat, uid] of this._categoryToTabs.entries()) {
        const otherInst = tc.getInstance(uid);
        if (!otherInst || otherInst.uniqueId === instance.uniqueId) continue;
        otherInst.rootElement.style.display = 'none';
        otherInst.rootElement.setAttribute('aria-hidden', 'true');
      }

      // Show this instance
      root.style.display = ''; // let CSS decide (empty -> revert)
      root.removeAttribute('aria-hidden');

      // Optionally trigger any Finsweet tab recalculation hooks (if they exist)
      if (typeof window.FS === 'object' && typeof window.FS.relayout === 'function') {
        try {
          window.FS.relayout(root); // hypothetical API - safe-guarded
        } catch (err) {
          // ignore
        }
      }

      // If the TabsConstructor cached tab buttons/panels, ensure first tab selected or keep previous state
      const buttons = tc.query(instance.uniqueId, '[data-tab-button], .tab-button, [role="tab"]') || [];
      if (buttons && buttons.length) {
        // attempt to set first as selected if none selected
        const hasSelected = Array.from(buttons).some(b => b.classList.contains('active') || b.getAttribute('aria-selected') === 'true');
        if (!hasSelected) {
          const first = buttons[0];
          try {
            first.classList.add(this.options.activeClass);
            first.setAttribute('aria-selected', 'true');
          } catch (e) { /* ignore */ }
        }
      }

    } catch (err) {
      console.error('CategoryTabsController: error displaying tabs instance', err);
    }
  }
}

// Auto-init
(function bootstrapCategoryTabsController() {
  try {
    window.CategoryTabsController = new CategoryTabsController({ debug: false });
    window.CategoryTabsController.init();
    // Keep existing event-based compatibility
    document.addEventListener('tabsConstructorReady', () => {
      try {
        if (window.CategoryTabsController && typeof window.CategoryTabsController.init === 'function') {
          window.CategoryTabsController.init();
        }
      } catch (e) { /* ignore */ }
    });
  } catch (err) {
    console.error('CategoryTabsController bootstrap error', err);
  }
})();
