// craft-menu-js.js (refactored)
// Preserves original behaviour while improving performance, robustness, and maintainability.

(function () {
  'use strict';

  /* ---------------------------
     Config + Small caches
     --------------------------- */
  const DEFAULT_COLOR = '#272727';
  const OBSERVER_TIMEOUT = 3500; // ms to wait for injected DOM before best-effort init
  const PREFERS_REDUCED_MOTION = typeof window !== 'undefined' &&
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const _slugCache = new Map();        // string -> slug
  const _hexRgbaCache = new Map();     // "hex|alpha" -> rgba string
  const _logoSlugCache = new WeakMap(); // element -> Set<slug>

  // rAF batching wrapper (use for DOM writes)
  function batchDOMUpdates(fn) {
    if (typeof fn !== 'function') return;
    if (PREFERS_REDUCED_MOTION) {
      // keep immediate for reduced motion to prevent timing-based flicker
      try { fn(); } catch (e) { console.warn('batchDOMUpdates error', e); }
      return;
    }
    window.requestAnimationFrame(() => {
      try { fn(); } catch (e) { console.warn('batchDOMUpdates error', e); }
    });
  }

  // slugify: canonicalize category names -> url-friendly slug
  const _reNonWord = /[^\w-]+/g;
  const _reSpacesSlashes = /[-\s\/&]+/g;
  const _reTrimHyphens = /^-+|-+$/g;
  function slugify(s) {
    if (!s) return '';
    if (_slugCache.has(s)) return _slugCache.get(s);
    // Normalize and strip diacritics
    const normalized = String(s).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const out = normalized
      .replace(_reSpacesSlashes, '-')
      .replace(_reNonWord, '')
      .replace(/--+/g, '-')
      .replace(_reTrimHyphens, '');
    _slugCache.set(s, out);
    return out;
  }

  // Safe conversion hex -> rgba with caching
  function hexToRgba(hex, alpha = 1) {
    const key = `${hex}|${alpha}`;
    if (_hexRgbaCache.has(key)) return _hexRgbaCache.get(key);
    let h = (hex || DEFAULT_COLOR).replace('#', '').trim();
    if (h.length === 3) h = h.split('').map(ch => ch + ch).join('');
    // fallback
    if (h.length !== 6) h = DEFAULT_COLOR.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    const rgba = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    _hexRgbaCache.set(key, rgba);
    return rgba;
  }

  /* ---------------------------
     Helpers for heading build + animations
     --------------------------- */
  function buildHeadingCharsElement(text) {
    const frag = document.createDocumentFragment();
    const wrapper = document.createElement('span');
    wrapper.className = 'reveal-chars-wrapper';
    wrapper.setAttribute('aria-hidden', 'true');

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const span = document.createElement('span');
      span.className = 'reveal-char';
      // preserve spaces
      if (ch === ' ') span.innerHTML = '&nbsp;';
      else span.textContent = ch;
      wrapper.appendChild(span);
    }
    frag.appendChild(wrapper);
    return frag;
  }

  // Two-heading toggle state managed here (isA true => headingA is currently visible)
  let isA = true;

  // Swap heading content with minimal layout thrash and accessibility in mind
  function toggleHeadingText(dynamicHeadingA, dynamicHeadingB, text) {
    if (!dynamicHeadingA || !dynamicHeadingB) return;

    // respects reduce-motion: immediate swap
    if (PREFERS_REDUCED_MOTION) {
      dynamicHeadingA.innerHTML = '';
      dynamicHeadingA.appendChild(buildHeadingCharsElement(text));
      dynamicHeadingA.classList.add('active');
      dynamicHeadingB.classList.remove('active');
      isA = true;
      return;
    }

    const incoming = isA ? dynamicHeadingB : dynamicHeadingA;
    const outgoing = isA ? dynamicHeadingA : dynamicHeadingB;

    // prepare incoming content
    incoming.innerHTML = '';
    incoming.appendChild(buildHeadingCharsElement(text));
    incoming.style.willChange = 'opacity, transform';
    outgoing.style.willChange = 'opacity, transform';

    // use rAF to separate style application frames
    window.requestAnimationFrame(() => {
      incoming.classList.add('prepare-incoming');
      incoming.classList.remove('u-hidden');
      // allow CSS to handle transitions - add classes that trigger animations
      window.requestAnimationFrame(() => {
        incoming.classList.add('animate-in');
        outgoing.classList.add('animate-out');
        // after animation duration, finalize
        // NOTE: keep duration in JS in sync with CSS animation-duration (ms)
        const animationDuration = 420; // tweak if your CSS duration differs
        window.setTimeout(() => {
          // cleanup classes
          outgoing.classList.add('u-hidden');
          outgoing.classList.remove('animate-out', 'active');
          incoming.classList.remove('prepare-incoming', 'animate-in', 'u-hidden');
          incoming.classList.add('active');
          // clear will-change
          incoming.style.willChange = '';
          outgoing.style.willChange = '';
          isA = !isA;
        }, animationDuration);
      });
    });
  }

  /* ---------------------------
     DOM selector wait utility (MutationObserver)
     --------------------------- */
  function waitForSelector(selector, timeout = OBSERVER_TIMEOUT) {
    return new Promise((resolve) => {
      if (document.querySelector(selector)) { resolve(true); return; }
      const root = document.documentElement || document.body;
      const mo = new MutationObserver((mutations, obs) => {
        if (document.querySelector(selector)) {
          obs.disconnect();
          resolve(true);
        }
      });
      mo.observe(root, { childList: true, subtree: true });
      setTimeout(() => {
        try { mo.disconnect(); } catch (e) { /* ignore */ }
        resolve(false);
      }, timeout);
    });
  }

  /* ---------------------------
     Main CraftMenu controller
     --------------------------- */
  function createCraftMenuController() {
    // cached DOM refs
    let section = null;
    let categoryRows = [];
    let subcategoryLabels = [];
    let exampleGroups = [];
    let clientLogos = [];
    let clientWrappers = [];
    let dynamicHeadingA = null;
    let dynamicHeadingB = null;
    let menuListWrapper = null;
    let defaultExample = null;
    let softwareGrid = null; // legacy: keep ref if exists

    // state
    let activeCategory = null;       // original text string
    let activeSubcategory = null;    // original text string
    let previousActiveRow = null;

    // quick lookup maps
    const _buttonToCategory = new WeakMap(); // element -> category string
    const _categoryToButtons = new Map();    // category slug -> [buttonEls]
    const _examplesArray = [];               // array of example nodes
    const _logoElements = [];                // array of logo nodes
    const _clientWrappers = [];              // wrappers that are shown/hidden

    // Initialize by caching DOM and wiring listeners
    async function init() {
      // Wait for DOM and main section; do best-effort if not found quickly
      if (document.readyState === 'loading') {
        await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve, { once: true }));
      }

      const found = await waitForSelector('[data-crafty-section]');
      section = document.querySelector('[data-crafty-section]');
      if (!section) {
        console.warn('craft-menu: [data-crafty-section] not found - aborting init.');
        return;
      }

      // Cache common elements (convert NodeLists to arrays)
      categoryRows = Array.from(section.querySelectorAll('[data-category-row]'));
      subcategoryLabels = Array.from(section.querySelectorAll('[data-subcategory-label]'));
      exampleGroups = Array.from(section.querySelectorAll('[data-category-example]'));
      clientLogos = Array.from(section.querySelectorAll('[data-category-logo], [data-category-logo-2]'));
      clientWrappers = Array.from(section.querySelectorAll('[data-client-logo-wrapper]')) || [];
      dynamicHeadingA = section.querySelector('[data-dynamic-heading-a]');
      dynamicHeadingB = section.querySelector('[data-dynamic-heading-b]');
      menuListWrapper = section.querySelector('[data-menu-list-wrapper]') || section;
      defaultExample = section.querySelector('[data-default-example]') || null;
      softwareGrid = section.querySelector('[data-software-grid]') || null;

      // Build quick maps for buttons -> category & category -> buttons
      _buildCategoryButtonMaps();

      // Cache examples array for faster iteration
      _examplesArray.length = 0;
      Array.prototype.push.apply(_examplesArray, exampleGroups);

      // Cache logo elements array
      _logoElements.length = 0;
      Array.prototype.push.apply(_logoElements, clientLogos);

      // Setup delegated event listeners (single listener for category/subcategory)
      _attachDelegatedListeners();

      // Ensure CSS variables exist with default values
      _applyThemeColors(DEFAULT_COLOR, null);

      // Reset to default state
      resetCrafty();

      // Expose state for debugging if needed
      // (window.CraftMenu.debugState = () => ({ activeCategory, activeSubcategory, previousActiveRow });)
    }

    function _buildCategoryButtonMaps() {
      _categoryToButtons.clear();
      _buttonToCategory = new WeakMap(); // reassign
      categoryRows.forEach(row => {
        // If row contains a label clickable, prefer that; else the row itself is the click target
        const btns = Array.from(row.querySelectorAll('[data-category-label]')).length ? Array.from(row.querySelectorAll('[data-category-label]')) : [row];
        btns.forEach(btn => {
          const categoryName = (btn.getAttribute('data-category') || btn.dataset.category || row.getAttribute('data-category') || row.dataset.category || '').trim();
          if (!categoryName) {
            // no category attribute found - warn but continue
            // console.warn('craft-menu: category button missing data-category', btn);
            return;
          }
          const slug = slugify(categoryName);
          _buttonToCategory.set(btn, categoryName);
          if (!_categoryToButtons.has(slug)) _categoryToButtons.set(slug, []);
          _categoryToButtons.get(slug).push(btn);
        });
      });

      // also map subcategory labels to their parent category via DOM traversal
      subcategoryLabels.forEach(label => {
        const row = label.closest('[data-category-row]');
        if (!row) return;
        const categoryName = row.getAttribute('data-category') || row.dataset.category;
        if (categoryName) _buttonToCategory.set(label, categoryName);
      });
    }

    // Delegated click handler for categories & subcategories
    function _attachDelegatedListeners() {
      if (!section) return;
      section.addEventListener('click', (ev) => {
        // find the nearest actionable element
        const subLabel = ev.target.closest('[data-subcategory-label]');
        if (subLabel && section.contains(subLabel)) {
          ev.preventDefault();
          _onSubcategoryClick(subLabel);
          return;
        }
        const catRow = ev.target.closest('[data-category-row], [data-category-label]');
        if (catRow && section.contains(catRow)) {
          ev.preventDefault();
          const row = catRow.closest('[data-category-row]') || catRow;
          _onCategoryClick(row);
          return;
        }

        // Click outside menu items resets to default (only if click inside section but not on a control)
        if (ev.target === section || !ev.target.closest('[data-category-row]')) {
          // clicking the section background should reset
          // NOTE: this matches original "Section Click Handler" behaviour from your description
          resetCrafty();
        }
      }, { passive: false });
    }

    /* ---------------------------
       Click handlers / activation logic
       --------------------------- */

    function _onCategoryClick(rowEl) {
      if (!rowEl) return;
      const categoryName = rowEl.getAttribute('data-category') || rowEl.dataset.category;
      const headingText = rowEl.getAttribute('data-heading') || rowEl.dataset.heading || categoryName;
      handleCategorySelection(rowEl, categoryName, headingText);
    }

    function _onSubcategoryClick(labelEl) {
      const sub = labelEl.getAttribute('data-subcategory') || labelEl.dataset.subcategory;
      if (!sub) return;
      const parentRow = labelEl.closest('[data-category-row]');
      const parentCategory = parentRow && (parentRow.getAttribute('data-category') || parentRow.dataset.category);
      // ensure parent category active
      if (parentCategory && parentCategory !== activeCategory) {
        handleCategorySelection(parentRow, parentCategory, parentRow.getAttribute('data-heading') || parentCategory);
      }
      // set subcategory and update examples
      activeSubcategory = sub;
      showRelevantExamples();
      filterClientLogos(activeCategory); // logos filtered by category; if you want subcategory-specific logos adapt here
    }

    // Main selection worker - preserves original behaviour & order of operations
    function handleCategorySelection(row, categoryName, headingText) {
      try {
        if (!row || !categoryName) return;
        const sameClick = activeCategory && (slugify(activeCategory) === slugify(categoryName));
        if (sameClick) {
          // clicking same category toggles back to default
          resetCrafty();
          return;
        }

        // Clear previous active row styling
        if (previousActiveRow && previousActiveRow !== row) {
          batchDOMUpdates(() => {
            previousActiveRow.classList.remove('active-category');
            previousActiveRow.style.removeProperty('--theme-color'); // in case someone sets it
          });
        }

        // Mark this row active and record previous
        batchDOMUpdates(() => {
          row.classList.add('active-category');
        });
        previousActiveRow = row;

        // Animate heading
        if (headingText && (dynamicHeadingA || dynamicHeadingB)) {
          toggleHeadingText(dynamicHeadingA, dynamicHeadingB, headingText);
        }

        // Update state
        activeCategory = categoryName;
        activeSubcategory = null; // clear subcategory on selecting a category

        // Hide legacy software grid and show client section (if applicable)
        if (softwareGrid) {
          batchDOMUpdates(() => {
            softwareGrid.classList.add('u-hidden');
          });
        }

        // Filter content examples + logos + apply theme color
        showRelevantExamples();
        filterClientLogos(activeCategory);

        // Theme colour extraction (data-project-color)
        const colorHelper = row.querySelector('[data-project-color]');
        const cmsColor = (colorHelper && ((colorHelper.getAttribute('data-project-color') || colorHelper.textContent || '').trim())) || DEFAULT_COLOR;
        _applyThemeColors(cmsColor, row);

      } catch (err) {
        console.error('craft-menu: handleCategorySelection error', err);
      }
    }

    /* ---------------------------
       Examples display logic
       --------------------------- */

    function showRelevantExamples() {
      if (!_examplesArray || !_examplesArray.length) return;

      // compute slugs
      const catSlug = activeCategory ? slugify(activeCategory) : null;
      const subSlug = activeSubcategory ? slugify(activeSubcategory) : null;

      // determine matching predicate according to the business rules described
      let shouldShowPredicate;
      if (subSlug) {
        // Subcategory priority - show those with data-subcategory-example === activeSubcategory
        shouldShowPredicate = (el) => {
          const se = el.getAttribute('data-subcategory-example') || el.dataset.subcategoryExample || '';
          return slugify(se) === subSlug;
        };
      } else if (catSlug) {
        shouldShowPredicate = (el) => {
          const ce = el.getAttribute('data-category-example') || el.dataset.categoryExample || '';
          const se = el.getAttribute('data-subcategory-example') || el.dataset.subcategoryExample || '';
          // If both attributes exist on the example element, both should match category (per your description)
          if (ce && se) {
            return (slugify(ce) === catSlug) && (slugify(se) === catSlug);
          } else if (ce) {
            return slugify(ce) === catSlug;
          }
          return false;
        };
      } else {
        // No active: show default example(s) (with data-default-example) or fallback to first
        shouldShowPredicate = (el, idx) => {
          if (el.hasAttribute('data-default-example') || el.dataset.defaultExample) return true;
          return false;
        };
      }

      batchDOMUpdates(() => {
        let foundAny = false;
        _examplesArray.forEach((el, idx) => {
          const shouldShow = !!shouldShowPredicate(el, idx);
          const isHidden = el.classList.contains('u-hidden');
          if (shouldShow && isHidden) {
            // show
            el.classList.remove('u-hidden');
            el.classList.add('is-visible');
            // kick off fade-in by toggling class
            el.classList.remove('is-hidden');
            showSingleExample(el);
            foundAny = true;
          } else if (!shouldShow && !isHidden) {
            // hide
            el.classList.add('u-hidden');
            el.classList.remove('is-visible');
            el.classList.add('is-hidden');
          }
        });

        // If none matched and we have a defaultExample fallback, ensure it's shown
        if (!foundAny && defaultExample) {
          defaultExample.classList.remove('u-hidden');
          defaultExample.classList.add('is-visible');
          showSingleExample(defaultExample);
        }
      });
    }

    // Fade-in animation for a single example (uses classes and rAF)
    function showSingleExample(groupEl) {
      if (!groupEl) return;
      if (PREFERS_REDUCED_MOTION) {
        groupEl.classList.remove('is-hidden');
        groupEl.classList.add('is-visible');
        return;
      }
      // ensure initial state
      groupEl.classList.remove('is-visible');
      groupEl.classList.add('is-hidden');
      // small delay to allow CSS to compute
      window.requestAnimationFrame(() => {
        groupEl.classList.remove('is-hidden');
        groupEl.classList.add('is-visible');
      });
    }

    /* ---------------------------
       Logo filtering
       --------------------------- */

    function _getLogoSlugs(logoEl) {
      if (_logoSlugCache.has(logoEl)) return _logoSlugCache.get(logoEl);
      const set = new Set();
      const rawA = logoEl.getAttribute('data-category-logo') || logoEl.dataset.categoryLogo || '';
      const rawB = logoEl.getAttribute('data-category-logo-2') || logoEl.dataset.categoryLogo2 || '';
      // split by comma or pipe if provided, trim entries
      [rawA, rawB].forEach(raw => {
        if (!raw) return;
        raw.split(',').forEach(token => {
          const s = token && token.trim();
          if (s) set.add(slugify(s));
        });
      });
      _logoSlugCache.set(logoEl, set);
      return set;
    }

    function filterClientLogos(categoryName) {
      const catSlug = categoryName ? slugify(categoryName) : null;
      if (!_logoElements || !_logoElements.length) return;

      batchDOMUpdates(() => {
        _logoElements.forEach(logoEl => {
          // find the wrapper element to show/hide (if present)
          const wrapper = logoEl.closest('[data-client-logo-wrapper]') || logoEl.parentElement;
          const slugs = _getLogoSlugs(logoEl);
          const matches = catSlug ? slugs.has(catSlug) : true; // show all if no category
          if (matches) {
            wrapper && wrapper.classList.remove('u-hidden');
          } else {
            wrapper && wrapper.classList.add('u-hidden');
          }
        });
      });
    }

    /* ---------------------------
       Theme color application (CSS variables on root section)
       --------------------------- */

    function _applyThemeColors(cmsColor, activeRow) {
      const color = (cmsColor || DEFAULT_COLOR).trim();
      const rgba10 = hexToRgba(color, 0.10);

      batchDOMUpdates(() => {
        try {
          section.style.setProperty('--crafty-theme', color);
          section.style.setProperty('--crafty-theme-10', rgba10);
          // set active row's custom property for any row-level styling, but avoid many writes: only toggle classes above
          if (previousActiveRow && previousActiveRow !== activeRow) {
            previousActiveRow.style.removeProperty('--theme-color');
            previousActiveRow.style.removeProperty('--active-text-color');
          }
          if (activeRow) {
            activeRow.style.setProperty('--theme-color', color);
            activeRow.style.setProperty('--active-text-color', '#272727');
          }
        } catch (e) {
          // degrade silently if inline style X is blocked
          console.warn('craft-menu: _applyThemeColors failed', e);
        }
      });
    }

    /* ---------------------------
       Reset to default state
       --------------------------- */
    function resetCrafty() {
      // Clear active states
      batchDOMUpdates(() => {
        // category rows
        categoryRows.forEach(row => {
          row.classList.remove('active-category');
          row.style.removeProperty('--theme-color');
          row.style.removeProperty('--active-text-color');
        });
        previousActiveRow = null;
        activeCategory = null;
        activeSubcategory = null;

        // show default example and hide the rest
        if (_examplesArray && _examplesArray.length) {
          _examplesArray.forEach(el => {
            if (el === defaultExample || el.hasAttribute('data-default-example') || el.dataset.defaultExample) {
              el.classList.remove('u-hidden');
              el.classList.add('is-visible');
            } else {
              el.classList.add('u-hidden');
              el.classList.remove('is-visible');
            }
          });
        }

        // show all logos
        if (_logoElements && _logoElements.length) {
          _logoElements.forEach(logoEl => {
            const wrapper = logoEl.closest('[data-client-logo-wrapper]') || logoEl.parentElement;
            wrapper && wrapper.classList.remove('u-hidden');
          });
        }

        // revert theme to defaults
        _applyThemeColors(DEFAULT_COLOR, null);

        // Reset heading to "I'm Crafty" (or text in an element with data-default-heading)
        const defaultHeadingText = (section && (section.getAttribute('data-default-heading') || section.dataset.defaultHeading)) || "I'm Crafty";
        if (dynamicHeadingA && dynamicHeadingB) {
          // prefer immediate set in reduced-motion case
          if (PREFERS_REDUCED_MOTION) {
            dynamicHeadingA.innerHTML = '';
            dynamicHeadingA.appendChild(buildHeadingCharsElement(defaultHeadingText));
            dynamicHeadingA.classList.add('active');
            dynamicHeadingB.classList.remove('active');
            dynamicHeadingB.classList.add('u-hidden');
            isA = true;
          } else {
            // simpler direct swap: set A as active
            dynamicHeadingA.innerHTML = '';
            dynamicHeadingA.appendChild(buildHeadingCharsElement(defaultHeadingText));
            dynamicHeadingA.classList.add('active');
            dynamicHeadingB.classList.add('u-hidden');
            dynamicHeadingB.classList.remove('active');
            isA = true;
          }
        }

        // Show software grid if it exists (legacy behaviour)
        if (softwareGrid) {
          softwareGrid.classList.remove('u-hidden');
        }
      });
    }

    /* ---------------------------
       Public API that we expose on window.CraftMenu
       --------------------------- */
    return {
      init,
      resetCrafty,
      // programmatic activation helpers
      activateCategory(categoryName) {
        if (!categoryName) return;
        // find a row with matching data-category
        const found = categoryRows.find(r => slugify(r.getAttribute('data-category') || r.dataset.category || '') === slugify(categoryName));
        if (found) {
          _onCategoryClick(found);
        } else {
          console.warn('craft-menu: activateCategory not found', categoryName);
        }
      },
      activateSubcategory(subName) {
        if (!subName) return;
        const found = subcategoryLabels.find(l => slugify(l.getAttribute('data-subcategory') || l.dataset.subcategory || '') === slugify(subName));
        if (found) _onSubcategoryClick(found);
        else console.warn('craft-menu: activateSubcategory not found', subName);
      },
      // internal debug accessor
      _getState() {
        return { activeCategory, activeSubcategory, previousActiveRow };
      }
    };
  }

  /* ---------------------------
     Bootstrapping: create + init + expose
     --------------------------- */

  const Controller = createCraftMenuController();
  // attach to window for compatibility / testing
  if (typeof window !== 'undefined') {
    window.CraftMenu = Controller;
  }

  // auto-init on DOMContentLoaded (non-blocking)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      Controller.init().catch(err => console.warn('craft-menu init error', err));
    }, { once: true });
  } else {
    // already loaded
    Controller.init().catch(err => console.warn('craft-menu init error', err));
  }

})();
