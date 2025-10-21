/**
 * Minimal Finsweet CMS Library
 * Contains only the functionality used by tabs-constructor.js and instagram-story-system.js
 * Reduced from 2,505 lines to ~200 lines (92% reduction)
 */

(() => {
  // Utility functions (minimal set needed for tabs functionality)
  var Xe = Object.defineProperty;
  var tn = Object.prototype.hasOwnProperty;
  var Yt = Object.getOwnPropertySymbols,
    en = Object.prototype.propertyIsEnumerable;
  var _t = (t, e, n) =>
      e in t
        ? Xe(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n })
        : (t[e] = n),
    $ = (t, e) => {
      for (var n in e || (e = {})) tn.call(e, n) && _t(t, n, e[n]);
      if (Yt) for (var n of Yt(e)) en.call(e, n) && _t(t, n, e[n]);
      return t;
    };

  // Promise polyfill (minimal)
  var D = "Promise" in window ? window.Promise : function(t) {
    var e = this;
    e.state = 2;
    e.value = void 0;
    e.deferred = [];
    try {
      t(
        function(n) { e.resolve(n); },
        function(n) { e.reject(n); }
      );
    } catch (n) {
      e.reject(n);
    }
  };

  D.resolve = function(t) {
    return new D(function(e, n) { e(t); });
  };

  D.all = function(t) {
    return new D((e, n) => {
      if (!Array.isArray(t)) {
        n(new Error('Promise.all requires an array'));
        return;
      }
      if (t.length === 0) {
        e([]);
        return;
      }
      let r = 0;
      let i = new Array(t.length);
      t.forEach((o, s) => {
        D.resolve(o).then((c) => {
          i[s] = c;
          r++;
          if (r === t.length) {
            e(i);
          }
        }).catch(n);
      });
    });
  };

  D.prototype.resolve = function(e) {
    if (this.state === 2) {
      this.state = 0;
      this.value = e;
      this.notify();
    }
  };

  D.prototype.reject = function(e) {
    if (this.state === 2) {
      this.state = 1;
      this.value = e;
      this.notify();
    }
  };

  D.prototype.then = function(e, n) {
    return new D((r, i) => {
      this.deferred.push([e, n, r, i]);
      this.notify();
    });
  };

  D.prototype.notify = function() {
    var e = this;
    setTimeout(() => {
      if (e.state !== 2) {
        while (e.deferred.length) {
          var [t, n, r, i] = e.deferred.shift();
          try {
            e.state === 0
              ? t ? r(t(e.value)) : r(e.value)
              : e.state === 1 && (n ? r(n(e.value)) : i(e.value));
          } catch (o) {
            i(o);
          }
        }
      }
    });
  };

  // Essential DOM utilities
  function S(t) {
    return t && t.nodeType >= 1 ? t : null;
  }

  function L(t) {
    return t && t.nodeType >= 1 ? [t] : [];
  }

  function Y(t, ...e) {
    t = Object(t);
    for (let n = 0; n < e.length; n++) {
      let r = e[n];
      if (r !== null) for (let i in r) tn.call(r, i) && (t[i] = r[i]);
    }
    return t;
  }

  function et(t, e, n) {
    return L(t).reduce((r, i) => r && i.dispatchEvent(Ln(e, !0, !0, n)), !0);
  }

  function Ln(t, e = !0, n = !1, r) {
    if (typeof t === 'string') {
      let i = document.createEvent("CustomEvent");
      i.initCustomEvent(t, e, n, r);
      t = i;
    }
    return t;
  }

  // Minimal FsLibrary constructor
  function E(t, e = { type: 1, className: "image" }) {
    this.cms_selector = t;
    E.cms_selector = t;
    this.indexSet = false;
    this.index = 0;
  }

  // Essential methods only
  E.prototype.getMasterCollection = function() {
    return document.querySelector(this.cms_selector);
  };

  E.prototype.reinitializeWebflow = function() {
    if (window.Webflow) {
      try {
        if (typeof window.Webflow.destroy === 'function') {
          window.Webflow.destroy();
        }
        if (typeof window.Webflow.ready === 'function') {
          window.Webflow.ready();
        }
        if (window.Webflow.require && typeof window.Webflow.require("ix2") === 'object') {
          window.Webflow.require("ix2").init();
        }
        if (typeof window.Webflow.redraw === 'object' && window.Webflow.redraw.up) {
          window.Webflow.redraw.up();
        }
        et(document, "readystatechange");
        et(document, "IX2_PREVIEW_LOAD");
      } catch (e) {
        console.warn('Webflow reinitialization failed:', e);
      }
    }
  };

  // Tabs method (the only one you actually use)
  E.prototype.tabs = function({
    tabComponent: t,
    tabContent: e,
    tabName: n,
    resetIx: r = !0,
  }) {
    let i = this.getMasterCollection();
    if (!i) return D.resolve();

    let o = [].slice.call(i.querySelectorAll(".w-dyn-item>*"));
    let s = document.querySelector(t + " .w-tab-menu");
    let c = document.querySelector(t + " .w-tab-content");
    
    if (!s || !c) return D.resolve();

    let a = c.children[0];
    let y = s.getElementsByTagName("a")[0];
    
    // Ensure Webflow is properly initialized
    if (!window.Webflow) {
      window.Webflow = [];
    }
    let l = window.Webflow;
    
    let h = (d, p, f) =>
      o.map((u, A) => {
        let g = (u.querySelector(n) || {}).innerHTML || Zn();
        let m = u.querySelector(e) ? u.querySelector(e).innerHTML : "";
        let b = Jn({ name: g, CTabName: m, prefix: d, index: A, classes: p });
        s.innerHTML += b;
        let C = u.outerHTML;
        let M = Kn({ name: g, prefix: d, index: A, classes: f, content: C });
        return (c.innerHTML += M), D.resolve();
      });

    return new D((d, p) => {
      // Ensure Webflow.push exists before calling it
      if (typeof l.push === 'function') {
        l.push(() => {
          if (window.___toggledInitTab___) return;
          let f = Gn(y.href);
          y.classList.remove("w--current");
          a.classList.remove("w--tab-active");
          let u = y.className;
          let A = a.className;
          s.innerHTML = "";
          c.innerHTML = "";
          D.all(h(f, u, A)).then((g) => {
            window.___toggledInitTab___ = !0;
            if (window.Webflow && typeof window.Webflow.ready === 'function') {
              window.Webflow.ready();
            }
            if (r) this.reinitializeWebflow();
            d();
          });
        });
      } else {
        // Fallback if Webflow.push doesn't exist
        setTimeout(() => {
          if (window.___toggledInitTab___) return;
          let f = Gn(y.href);
          y.classList.remove("w--current");
          a.classList.remove("w--tab-active");
          let u = y.className;
          let A = a.className;
          s.innerHTML = "";
          c.innerHTML = "";
          D.all(h(f, u, A)).then((g) => {
            window.___toggledInitTab___ = !0;
            if (window.Webflow && typeof window.Webflow.ready === 'function') {
              window.Webflow.ready();
            }
            if (r) this.reinitializeWebflow();
            d();
          });
        }, 100);
      }
    }).catch((d) => null);
  };

  // Helper functions for tabs
  var Jn = ({ name: t, CTabName: e = "", prefix: n, index: r, classes: i }) => {
    let o = n + "-tab-" + r;
    let s = n + "-pane-" + r;
    let c = r == 0;
    let a = i;
    c && (a += " w--current ");
    return `<a data-w-tab="${t}" class="${a}" id="${o}" href="#${s}"
   role="tab"
   aria-controls="${s}"
   aria-selected="${c}" ${c ? "" : "tabindex='-1'"}>
          <div>${e || t}</div>
          </a>`;
  };

  var Kn = ({ name: t, prefix: e, index: n, content: r, classes: i }) => {
    let o = e + "-tab-" + n;
    let s = e + "-pane-" + n;
    let c = n == 0;
    let a = i;
    c && (a += " w--tab-active ");
    return `<div data-w-tab="${t}" class="${a}" id="${s}" role="tabpanel" aria-labelledby="${o}">
${r}
    </div>`;
  };

  var Gn = (t) => t.match(/(w-tabs-[0-9]{1}-data-w)/gi)[0];
  var Zn = () => {
    let t = Math.random();
    return String(t).substr(2);
  };

  // Make FsLibrary globally available
  window.FsLibrary = E;
})();
