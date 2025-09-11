/**
 * Optimized TabsConstructor
 * - Promise-based ready() API
 * - MutationObserver instead of polling
 * - Single-retry fallback
 * - Exposes window.tabsConstructorReadyPromise and dispatches 'tabsConstructorReady' event
 */

class TabsConstructor {
  constructor(options = {}) {
    this.instances = new Map(); // key: uniqueId -> instance object
    this._isInitialized = false;
    this._resolveReady = null;
    this._rejectReady = null;
    this._readyPromise = null;

    // options
    this.observerTimeout = options.observerTimeout ?? 3000; // ms
    this.retryTimeout = options.retryTimeout ?? 6000; // ms for retry if first attempt fails
    this.selector = options.selector ?? '[data-tabs="constructor"], .fs-tabs, [data-tabs-component]';
    this._observer = null;
    this._retryAttempted = false;

    // create ready promise
    this._readyPromise = new Promise((resolve, reject) => {
      this._resolveReady = resolve;
      this._rejectReady = reject;
    });

    // expose for older code
    window.tabsConstructorReadyPromise = this._readyPromise;
  }

  // public awaitable API
  ready() {
    return this._readyPromise;
  }

  // the main initialization entry; returns the same ready promise
  async init() {
    if (this._isInitialized) return this._readyPromise;

    try {
      // "fast path" - if the DOM already contains our selector, initialize immediately
      const found = document.querySelectorAll(this.selector);
      if (found && found.length) {
        this._initializeFromElements(found);
        this._finishInit();
        return this._readyPromise;
      }

      // Otherwise observe the document for insertion of relevant nodes
      await this._observeForSelector(this.selector, this.observerTimeout);

      // If observer triggered, elements should now be present
      const nodes = document.querySelectorAll(this.selector);
      if (nodes && nodes.length) {
        this._initializeFromElements(nodes);
        this._finishInit();
        return this._readyPromise;
      }

      // If nothing found, attempt a single retry (longer timeout)
      if (!this._retryAttempted) {
        console.warn('TabsConstructor: nothing found. Attempting single retry...');
        this._retryAttempted = true;
        await this._observeForSelector(this.selector, this.retryTimeout);
        const retryNodes = document.querySelectorAll(this.selector);
        if (retryNodes && retryNodes.length) {
          this._initializeFromElements(retryNodes);
          this._finishInit();
          return this._readyPromise;
        }
      }

      // Give up gracefully
      const msg = 'TabsConstructor: Initialization failed — no tabs components found.';
      console.warn(msg);
      this._rejectReady(new Error(msg));
      return this._readyPromise;
    } catch (err) {
      console.error('TabsConstructor: unexpected error during init', err);
      this._rejectReady(err);
      return this._readyPromise;
    }
  }

  _observeForSelector(selector, timeout = 3000) {
    return new Promise((resolve, reject) => {
      let resolved = false;
      const start = performance.now();
      const root = document.documentElement || document.body || document;

      // quick check
      if (document.querySelector(selector)) {
        resolved = true;
        resolve();
        return;
      }

      const mo = new MutationObserver((mutations) => {
        if (document.querySelector(selector)) {
          resolved = true;
          mo.disconnect();
          resolve();
        }
      });

      mo.observe(root, { childList: true, subtree: true });

      // fallback timeout
      const to = setTimeout(() => {
        if (!resolved) {
          mo.disconnect();
          resolve(); // resolve so caller can decide to retry
        }
      }, timeout);
    });
  }

  _initializeFromElements(nodeList) {
    try {
      // convert NodeList to array and dedupe by element
      const uniqueNodes = Array.from(new Set(Array.from(nodeList)));

      uniqueNodes.forEach((el, idx) => {
        try {
          // derive a stable unique ID per instance (prefer data attribute)
          const idAttr = el.getAttribute('data-tabs-id') || el.id || `tabs-inst-${idx}-${Date.now()}`;
          const uniqueId = idAttr;

          // Avoid reinitializing same element
          if (this.instances.has(uniqueId)) return;

          const instance = {
            uniqueId,
            rootElement: el,
            index: this.instances.size,
            createdAt: Date.now(),
            // cached query collections for this instance
            cache: new Map()
          };

          // Minimal initial caching: tab buttons and panel containers, if present
          try {
            instance.cache.set('buttons', el.querySelectorAll('[data-tab-button], .tab-button, [role="tab"]') || []);
            instance.cache.set('panels', el.querySelectorAll('[data-tab-panel], .tab-panel, [role="tabpanel"]') || []);
          } catch (errInner) {
            // non-fatal
          }

          this.instances.set(uniqueId, instance);
        } catch (perElErr) {
          console.warn('TabsConstructor: element init error', perElErr);
        }
      });
    } catch (err) {
      console.error('TabsConstructor: error while enumerating elements', err);
    }
  }

  _finishInit() {
    this._isInitialized = true;

    // set a global flag for legacy code
    window.tabsConstructorComplete = true;

    // dispatch event for backwards compatibility
    try {
      const ev = new CustomEvent('tabsConstructorReady', {
        detail: {
          timestamp: Date.now(),
          count: this.instances.size
        }
      });
      document.dispatchEvent(ev);
    } catch (err) {
      // ignore
    }

    // resolve the ready promise
    this._resolveReady({
      count: this.instances.size,
      instances: this.instances
    });
  }

  // helper: get instance by uniqueId or fallback to first
  getInstance(uniqueId) {
    if (!this._isInitialized) {
      console.warn('TabsConstructor.getInstance called before initialization complete');
      return null;
    }
    if (!uniqueId) return this.instances.values().next().value || null;
    return this.instances.get(uniqueId) || null;
  }

  // exposes a fast cached query for an instance
  query(instanceUniqueId, selector) {
    const inst = this.getInstance(instanceUniqueId);
    if (!inst) return null;
    const cacheKey = `q:${selector}`;
    if (inst.cache.has(cacheKey)) return inst.cache.get(cacheKey);
    const res = inst.rootElement.querySelectorAll(selector);
    inst.cache.set(cacheKey, res);
    return res;
  }
}

// instantiate and initialize on DOMContentLoaded (or immediately if ready)
(function bootstrapTabsConstructor() {
  const tc = new TabsConstructor();
  window.TabsConstructor = tc;

  function start() {
    // start init but do not block page rendering
    tc.init().catch((err) => {
      console.warn('TabsConstructor bootstrap: init rejected', err && err.message);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
