document.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector("[data-crafty-section]");
  if (!section) return;

  // Cache DOM elements
  const categoryRows = section.querySelectorAll("[data-category-row]");
  const subcategoryLabels = section.querySelectorAll("[data-subcategory-label]");
  const exampleGroups = section.querySelectorAll("[data-category-example]");
  const clientLogos = section.querySelectorAll("[data-category-logo]");
  const softwareGrid = section.querySelector("[data-software-grid]");
  const clientWrapper = section.querySelector('[data-clients="wrapper"]');
  const clientDefault = section.querySelector('[data-clients="default"]');
  const clientLayout = section.querySelector('[data-clients="layout"]');
  const dynamicHeadingA = section.querySelector('[data-dynamic-heading="a"]');
  const dynamicHeadingB = section.querySelector('[data-dynamic-heading="b"]');
  const menuListWrapper = section.querySelector("[menu-list-wrapper]");

  let isA = true;
  let activeCategory = null;
  let activeSubcategory = null;
  let previousActiveRow = null;

  // Performance optimizations - reduced batching frequency
  const rafQueue = [];
  let rafId = null;
  const colorCache = new Map();
  const logoCategoryCache = new WeakMap();

// Replace existing batchDOMUpdates
const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function batchDOMUpdates(callback) {
  // run callback inside rAF to batch the style recalculations, but still synchronous-ish.
  if (typeof callback !== 'function') return;
  // If user prefers reduced motion, we keep immediate execution to preserve responsiveness.
  if (prefersReducedMotion) {
    callback();
    return;
  }
  // schedule writes for the next frame
  window.requestAnimationFrame(() => {
    try { callback(); } catch (e) { console.warn('batchDOMUpdates error', e); }
  });
}

// Replace slugify implementation
const _slugCache = new Map();
const _reNonWord = /[^\w-]+/g;
const _reSpaceGroup = /[-\s\/&]+/g;
const _reTrimHyphens = /^-+|-+$/g;

    function slugify(str) {
      if (!str) return '';
      if (_slugCache.has(str)) return _slugCache.get(str);

      // Normalise (strip diacritics); keep this as it is important for CMS text
      const normalized = String(str).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const s = normalized
        .replace(_reSpaceGroup, '-')
        .replace(_reNonWord, '')
        .replace(/--+/g, '-') // collapse multiple hyphens
        .replace(_reTrimHyphens, '');

      _slugCache.set(str, s);
      return s;
    }


  // Removed GSAP dependency entirely
  function buildHeadingCharsElement(text) {
    const frag = document.createDocumentFragment();
    const wrapper = document.createElement('span');
    wrapper.className = 'reveal-chars-wrapper'; // container to append
    wrapper.setAttribute('aria-hidden', 'true');
  
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const span = document.createElement('span');
      span.className = 'reveal-char';
      // preserve whitespace
      span.innerHTML = ch === ' ' ? '&nbsp;' : ch;
      wrapper.appendChild(span);
    }
  
    frag.appendChild(wrapper);
    return frag;
  }

  // Pure CSS heading animation - no GSAP needed
  function animateHeadingChars(container) {
    if (!container) return;
    const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    
    // Simple CSS class toggle - much faster than GSAP
    container.classList.add('animate');
  }

  function resetHeadingAnimation(container) {
    if (container) {
      container.classList.remove('animate');
    }
  }

  function setHeadingImmediate(text) {
    if (!dynamicHeadingA || !dynamicHeadingB) return;
    
    resetHeadingAnimation(dynamicHeadingA);
    resetHeadingAnimation(dynamicHeadingB);
    
    dynamicHeadingA.innerHTML = buildHeadingCharsHTML(text);
    dynamicHeadingA.classList.remove("u-hidden");
    dynamicHeadingB.classList.add("u-hidden");
    
    isA = false;
    
    // Trigger animation on next frame
    requestAnimationFrame(() => {
      animateHeadingChars(dynamicHeadingA);
    });
  }

  function toggleHeading(text) {
    if (!dynamicHeadingA || !dynamicHeadingB) return;
    const current = isA ? dynamicHeadingA : dynamicHeadingB;
    const next = isA ? dynamicHeadingB : dynamicHeadingA;

    resetHeadingAnimation(current);
    resetHeadingAnimation(next);

    next.innerHTML = buildHeadingCharsHTML(text);
    next.classList.remove("u-hidden");
    current.classList.add("u-hidden");

    requestAnimationFrame(() => {
      animateHeadingChars(next);
    });
    
    isA = !isA;
  }

  // Fixed subcategory example display - removed fade-out transition lag
  function showRelevantExamples() {
    console.log(`🎯 Category: "${activeCategory}" | Subcategory: "${activeSubcategory}"`);
    
    const exampleGroups = document.querySelectorAll('[data-category-example], [data-subcategory-example]');
    
    let targetExample = null;
    
    exampleGroups.forEach((group, index) => {
        const categoryExample = group.getAttribute('data-category-example');
        const subcategoryExample = group.getAttribute('data-subcategory-example');
        
        let shouldShow = false;
        
        // Check subcategory match first (takes precedence)
        if (activeSubcategory && subcategoryExample) {
            shouldShow = subcategoryExample === activeSubcategory;
        }
        // If no subcategory match and we have an active category, check category with new logic
        else if (activeCategory && !activeSubcategory) {
            // New matching logic: category example must match AND subcategory example must match the category
            if (categoryExample && subcategoryExample) {
                shouldShow = (categoryExample === activeCategory) && (subcategoryExample === activeCategory);
            }
            // Fallback: if only category example exists, match it
            else if (categoryExample && !subcategoryExample) {
                shouldShow = categoryExample === activeCategory;
            }
        }
        
        // Hide this example
        batchDOMUpdates(() => {
            group.classList.remove('fade-in');
            group.classList.add('u-hidden');
            group.style.display = 'none';
        });
        
        // If this should be shown and we haven't found a target yet, set it as target
        if (shouldShow && !targetExample) {
            targetExample = group;
        }
    });
    
    // Show the single target example
    if (targetExample) {
        const categoryExample = targetExample.getAttribute('data-category-example');
        const subcategoryExample = targetExample.getAttribute('data-subcategory-example');
        console.log(`✅ Showing example: Category="${categoryExample}" | Subcategory="${subcategoryExample}"`);
        showSingleExample(targetExample);
    } else {
        console.log('❌ No matching example found');
    }
}

  function showSingleExample(group) {
    batchDOMUpdates(() => {
      const currentClasses = Array.from(group.classList);
      const keepClasses = currentClasses.filter(cls => !["u-hidden", "fade-in", "fade-out"].includes(cls));
      group.className = keepClasses.join(" ").trim();
      group.style.display = "block";
      
      requestAnimationFrame(() => {
        group.classList.add("fade-in");
      });
    });
  }

  function filterClientLogos(categoryName) {
    const targetSlug = slugify(categoryName);
    
    clientLogos.forEach(logo => {
      // Check both category attributes directly from the logo element
      let slugs = logoCategoryCache.get(logo);
      if (!slugs) {
        const primary = logo.getAttribute("data-category-logo");
        const secondary = logo.getAttribute("data-category-logo-2");
        slugs = [
          slugify(primary),
          slugify(secondary)
        ].filter(Boolean);
        logoCategoryCache.set(logo, slugs);
      }

      const shouldShow = slugs.includes(targetSlug);
      
      // Find the parent container to hide/show (crafty-client-container or similar)
      const container = logo.closest('.crafty-client-container') || logo.parentElement;
      
      if (container) {
        // Use u-hidden class for robust display control with !important
        if (shouldShow) {
          container.classList.remove("u-hidden");
          // Clear any lingering inline styles
          container.style.display = '';
          container.style.visibility = '';
          container.style.opacity = '';
        } else {
          container.classList.add("u-hidden");
        }
      }
    });
  }

  function hexToRgba(hex, alpha = 1) {
    if (!hex) return `rgba(0,0,0,${alpha})`;
    const cacheKey = `${hex}_${alpha}`;
    const cached = colorCache.get(cacheKey);
    if (cached) return cached;

    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex[1] + hex[2], 16);
      g = parseInt(hex[3] + hex[4], 16);
      b = parseInt(hex[5] + hex[6], 16);
    }
    const result = `rgba(${r},${g},${b},${alpha})`;
    colorCache.set(cacheKey, result);
    return result;
  }

  function applyThemeColors(cmsColor, activeRow) {
    if (!cmsColor) return;
    
    // Apply colors immediately without batching for better responsiveness
    // Reset previous row background
    if (previousActiveRow && previousActiveRow !== activeRow) {
      previousActiveRow.style.backgroundColor = "";
    }

    // Heading color
    if (dynamicHeadingA) dynamicHeadingA.style.color = cmsColor;
    if (dynamicHeadingB) dynamicHeadingB.style.color = cmsColor;

    // Menu background with transparency
    if (menuListWrapper) {
      const bgColor = cmsColor.startsWith("#") ? hexToRgba(cmsColor, 0.1) : cmsColor;
      menuListWrapper.style.backgroundColor = bgColor;
    }

    // Active category row background
    if (activeRow) activeRow.style.backgroundColor = cmsColor;

    // Clients layout color
    if (clientLayout) clientLayout.style.color = cmsColor;

    // Category row font colors - batch these for efficiency
    const fragment = document.createDocumentFragment();
    categoryRows.forEach(row => {
      const isActive = row === activeRow;
      row.style.setProperty("--theme-color", cmsColor);
      row.style.setProperty("--active-text-color", isActive ? "#272727" : cmsColor);
    });

    // Client logos color
    clientLogos.forEach(logo => {
      const svgMarkup = logo.querySelector("[data-svg-markup]");
      if (svgMarkup) svgMarkup.style.color = cmsColor;
    });
  }

  function resetColorsToDefault() {
    // Apply resets immediately without batching
    if (dynamicHeadingA) dynamicHeadingA.style.color = "";
    if (dynamicHeadingB) dynamicHeadingB.style.color = "";
    if (menuListWrapper) menuListWrapper.style.backgroundColor = "";

    // Reset ALL category row backgrounds immediately
    categoryRows.forEach(row => {
      row.style.backgroundColor = "";
      row.style.setProperty("--active-text-color", "white");
    });

    clientLogos.forEach(logo => {
      const svgMarkup = logo.querySelector("[data-svg-markup]");
      if (svgMarkup) svgMarkup.style.color = "";
    });

    if (clientLayout) clientLayout.style.color = "white";
  }

  function handleCategorySelection(row, categoryName, headingText) {
    const isActiveNow = activeCategory === categoryName;
    if (isActiveNow) {
      resetCrafty();
      return;
    }

    // Clear previous row background immediately
    if (previousActiveRow) {
      previousActiveRow.style.backgroundColor = "";
    }

    batchDOMUpdates(() => {
      categoryRows.forEach(r => r.classList.remove("active-category"));
      row.classList.add("active-category");
    });

    toggleHeading(headingText);
    activeCategory = categoryName;
    activeSubcategory = null;

    batchDOMUpdates(() => {
      if (softwareGrid) softwareGrid.classList.add("u-hidden");
      if (clientWrapper) clientWrapper.classList.remove("u-hidden");
      if (clientDefault) clientDefault.classList.add("u-hidden");
    });

    showRelevantExamples();
    filterClientLogos(categoryName);

    const colorHelper = row.querySelector("[data-project-color]");
    const cmsColor = (colorHelper && (colorHelper.getAttribute("data-project-color") || colorHelper.textContent || "").trim()) || "#272727";

    applyThemeColors(cmsColor, row);
    previousActiveRow = row;
  }

  // Event handlers
  categoryRows.forEach(row => {
    const labelEl = row.querySelector("[data-category-label]");
    if (!labelEl) return;
    const categoryName = row.getAttribute("data-category-row");
    const headingText = labelEl.innerText;

    labelEl.addEventListener("click", e => {
      e.stopPropagation();
      handleCategorySelection(row, categoryName, headingText);
    });

    row.addEventListener("click", e => {
      if (e.target.closest("[data-subcategory-label]")) return;
      handleCategorySelection(row, categoryName, headingText);
    });
  });

  subcategoryLabels.forEach(label => {
    label.addEventListener("click", e => {
      e.stopPropagation();
      const parentRow = label.closest("[data-category-row]");
      if (!parentRow) return;
      const categoryName = parentRow.getAttribute("data-category-row");
      const subcategoryName = label.innerText;
      if (!categoryName || categoryName !== activeCategory) return;
      activeSubcategory = subcategoryName;
      showRelevantExamples();
    });
  });

  section.addEventListener("click", e => {
    const inside = e.target.closest("[data-category-row], [data-subcategory-label]");
    if (!inside) resetCrafty();
  });

  function resetCrafty() {
    batchDOMUpdates(() => {
      categoryRows.forEach(row => row.classList.remove("active-category"));
      
      // Hide client wrapper and show default
      if (clientWrapper) clientWrapper.classList.add("u-hidden");
      if (clientDefault) clientDefault.classList.remove("u-hidden");

      // Hide all examples first
      exampleGroups.forEach(group => {
        group.classList.remove("fade-in", "fade-out");
        group.classList.add("u-hidden");
        group.style.display = "none";
      });

      // Show the "Software + Tools" example instead of softwareGrid
      const softwareToolsExample = document.querySelector('[data-category-example="Software + Tools"]');
      if (softwareToolsExample) {
        showSingleExample(softwareToolsExample);
      }

      clientLogos.forEach(logo => {
        // Find the parent container to show
        const container = logo.closest('.crafty-client-container') || logo.parentElement;
        if (container) {
          container.classList.remove("u-hidden"); // Ensure all logo containers are visible on reset
          container.style.display = ''; // Clear any inline display
          container.style.visibility = ''; // Clear any inline visibility
          container.style.opacity = ''; // Clear any inline opacity
        }
      });
    });

    activeCategory = null;
    activeSubcategory = null;
    previousActiveRow = null;

    resetColorsToDefault();
    setHeadingImmediate("I'm Crafty");
  }

  // Initialize
  resetCrafty();
});

