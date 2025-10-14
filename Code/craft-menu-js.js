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
  
  // Cache all example groups (both category and subcategory examples)
  const allExampleGroups = section.querySelectorAll('[data-category-example], [data-subcategory-example]');
  
  // Also cache just category examples for the reset function
  const categoryOnlyExamples = section.querySelectorAll('[data-category-example]');
  
  // Cache the default "Software + Tools" example
  const softwareToolsExample = section.querySelector('[data-category-example="Software + Tools"]');
  

  let isA = true;
  let activeCategory = null;
  let activeSubcategory = null;
  let previousActiveRow = null;

  // Performance optimizations - reduced batching frequency
  const rafQueue = [];
  let rafId = null;
  const colorCache = new Map();
  const logoCategoryCache = new WeakMap();

  function batchDOMUpdates(callback) {
    // Add callback to queue
    rafQueue.push(callback);
    
    // If we're not already scheduled, schedule a frame
    if (!rafId) {
      rafId = requestAnimationFrame(() => {
        // Execute all queued callbacks
        rafQueue.forEach(cb => cb());
        rafQueue.length = 0; // Clear the queue
        rafId = null; // Reset the flag
      });
    }
  }

  function slugify(str) {
    const cached = colorCache.get(`slug_${str}`);
    if (cached) return cached;
    
    const result = (str || "")
      .trim()
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[\s\/&]+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
    
    colorCache.set(`slug_${str}`, result);
    return result;
  }

  // Removed GSAP dependency entirely
  function buildHeadingCharsHTML(text) {
    const cached = colorCache.get(`chars_${text}`);
    if (cached) return cached;
    
    const result = (text || "")
      .split("")
      .map(ch => ch === " "
        ? '<span class="reveal-char" aria-hidden="true">&nbsp;</span>'
        : `<span class="reveal-char" aria-hidden="true">${ch}</span>`)
      .join("");
    
    colorCache.set(`chars_${text}`, result);
    return result;
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
    let targetExample = null;
    
    allExampleGroups.forEach((group, index) => {
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
        
        // Hide this example immediately
        group.classList.remove('fade-in');
        group.classList.add('u-hidden');
        group.style.display = 'none';
        
        // If this should be shown and we haven't found a target yet, set it as target
        if (shouldShow && !targetExample) {
            targetExample = group;
        }
    });
    
    // Show the single target example
    if (targetExample) {
        showSingleExample(targetExample);
    }
}

  function showSingleExample(group) {
    // Execute immediately - bypass batching for critical visibility updates
    const currentClasses = Array.from(group.classList);
    const keepClasses = currentClasses.filter(cls => !["u-hidden", "fade-in", "fade-out"].includes(cls));
    group.className = keepClasses.join(" ").trim();
    group.style.display = "block";
    
    requestAnimationFrame(() => {
      group.classList.add("fade-in");
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

    // Store original background color
    const originalBgColor = getComputedStyle(row).backgroundColor;

    // Add hover effects
    row.addEventListener("mouseenter", () => {
      // Only change background if this row is not currently active
      if (row !== previousActiveRow) {
        row.style.backgroundColor = "white";
      }
    });

    row.addEventListener("mouseleave", () => {
      // Only reset background if this row is not currently active
      if (row !== previousActiveRow) {
        row.style.backgroundColor = originalBgColor;
      }
    });

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