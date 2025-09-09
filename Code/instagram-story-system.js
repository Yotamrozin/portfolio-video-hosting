Webflow = window.Webflow || [];
Webflow.push(function () {
  'use strict';

  const config = {
    wrapperSelector: '.fs-tabs',             // category wrapper (Tabs component)
    tabContentSelector: '.fs-tab-content',   // tab content area
    tabMenuSelector: '.w-tab-menu',          // Webflow default tab menu
    tabLinkSelector: '.w-tab-link',          // Webflow default tab link
    categoryItemSelector: '.category-item',  // category menu button
    categoryWrapperSelector: '.category-slider-wrapper',
    autoAdvanceInterval: 5000,
    holdPauseThreshold: 300,                 // ms hold before pausing
    swipeThreshold: 50,                      // px movement to count as swipe
    leftZoneFraction: 0.35,                  // left screen fraction = prev
    menuOpenSelector: '.uui-navbar06_menu-button',
    menuOpenClass: 'w--open'
  };

  const wrappers = Array.from(document.querySelectorAll(config.wrapperSelector));
  if (!wrappers.length) return;

  let activeWrapperIndex = 0;
  let autoTimer = null;
  let paused = false;
  let holdTimeout = null;

  // ---- Helpers ----
  function isMenuOpen() {
    const btn = document.querySelector(config.menuOpenSelector);
    return btn && btn.classList.contains(config.menuOpenClass);
  }

  function tabLinksFor(wrapper) {
    const menu = wrapper.querySelector(config.tabMenuSelector);
    return menu ? Array.from(menu.querySelectorAll(config.tabLinkSelector)) : [];
  }

  function currentTabIndex(wrapper) {
    const links = tabLinksFor(wrapper);
    return links.findIndex(l => l.classList.contains('w--current')) || 0;
  }

  function clickTab(wrapper, idx) {
    const links = tabLinksFor(wrapper);
    if (!links.length) return;
    const safe = ((idx % links.length) + links.length) % links.length;
    setTimeout(() => links[safe].click(), 30);
  }

  function showWrapper(idx, opts = { focusFirstTab: false }) {
    wrappers.forEach((w, i) => {
      w.style.display = (i === idx) ? '' : 'none';
    });
    activeWrapperIndex = ((idx % wrappers.length) + wrappers.length) % wrappers.length;

    const links = tabLinksFor(wrappers[activeWrapperIndex]);
    if (links.length && !links.some(l => l.classList.contains('w--current'))) {
      links[0].click();
    }
    if (opts.focusFirstTab && links.length) clickTab(wrappers[activeWrapperIndex], 0);

    syncCategoryMenu();
  }

  function advance(dir = 1) {
    const wrapper = wrappers[activeWrapperIndex];
    const links = tabLinksFor(wrapper);
    const cur = currentTabIndex(wrapper);
    const next = cur + dir;

    if (next >= links.length) {
      showWrapper(activeWrapperIndex + 1, { focusFirstTab: true });
    } else if (next < 0) {
      showWrapper(activeWrapperIndex - 1);
      const prevLinks = tabLinksFor(wrappers[activeWrapperIndex]);
      if (prevLinks.length) clickTab(wrappers[activeWrapperIndex], prevLinks.length - 1);
    } else {
      clickTab(wrapper, next);
    }
  }

  function startAuto() {
    if (autoTimer) return;
    autoTimer = setInterval(() => {
      if (!paused && !isMenuOpen()) advance(1);
    }, config.autoAdvanceInterval);
  }

  function stopAuto() {
    clearInterval(autoTimer);
    autoTimer = null;
  }

  function pauseAuto(state = true) {
    paused = state;
  }

  // ---- Category Menu ----
  const categoryItems = document.querySelectorAll(config.categoryItemSelector);
  function syncCategoryMenu() {
    const wrapper = wrappers[activeWrapperIndex];
    const firstContent = wrapper.querySelector(config.tabContentSelector);
    if (!firstContent) return;
    const cat = firstContent.dataset.category;

    categoryItems.forEach(item => {
      if (item.dataset.category === cat) {
        item.classList.add('active-category');
        if (item.dataset.color) {
          item.style.backgroundColor = item.dataset.color;
        }
      } else {
        item.classList.remove('active-category');
        item.style.backgroundColor = '';
      }
    });
  }

  categoryItems.forEach((item, idx) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const target = item.dataset.category;
      const wrapperIdx = wrappers.findIndex(w => {
        const firstContent = w.querySelector(config.tabContentSelector);
        return firstContent && firstContent.dataset.category === target;
      });
      if (wrapperIdx >= 0) showWrapper(wrapperIdx, { focusFirstTab: true });
    });
  });

  // ---- Gestures ----
  wrappers.forEach(wrapper => {
    const surface = wrapper.querySelector(config.tabContentSelector) || wrapper;
    let startX, startY, startTime;

    surface.addEventListener('touchstart', e => {
      if (isMenuOpen()) return;
      const t = e.touches[0];
      startX = t.clientX; startY = t.clientY; startTime = Date.now();

      holdTimeout = setTimeout(() => pauseAuto(true), config.holdPauseThreshold);
    });

    surface.addEventListener('touchend', e => {
      clearTimeout(holdTimeout);
      if (paused) { pauseAuto(false); return; }

      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      const dt = Date.now() - startTime;

      // swipe
      if (Math.abs(dx) > config.swipeThreshold && Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) showWrapper(activeWrapperIndex - 1, { focusFirstTab: true });
        else showWrapper(activeWrapperIndex + 1, { focusFirstTab: true });
        return;
      }

      // tap
      const rect = surface.getBoundingClientRect();
      const x = e.changedTouches[0].clientX - rect.left;
      if (x <= rect.width * config.leftZoneFraction) advance(-1);
      else advance(1);
    });
  });

  // ---- Init ----
  showWrapper(0);
  startAuto();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAuto();
    else startAuto();
  });
});
