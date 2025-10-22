/**
 * Simple Integration Script for Enhanced Video Lazy Loading
 * 
 * Replace your current video lazy loading script with this one.
 * This script handles both initial videos and videos loaded by the tabs system.
 */

document.addEventListener("DOMContentLoaded", function() {
  var lazyVideos = [].slice.call(document.querySelectorAll("video.lazy"));

  if ("IntersectionObserver" in window) {
    var lazyVideoObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var video = entry.target;
          
          // Loop through all source elements
          for (var i = 0; i < video.children.length; i++) {
            var videoSource = video.children[i];
            if (videoSource.tagName === "SOURCE" && videoSource.dataset.src) {
              videoSource.src = videoSource.dataset.src;
            }
          }

          video.load();
          video.classList.remove("lazy");
          lazyVideoObserver.unobserve(video);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.1
    });

    // Function to observe new videos
    function observeNewVideos() {
      var newLazyVideos = [].slice.call(document.querySelectorAll("video.lazy"));
      newLazyVideos.forEach(function(lazyVideo) {
        lazyVideoObserver.observe(lazyVideo);
      });
    }

    // Initial observation
    observeNewVideos();

    // Listen for tabs system ready event
    document.addEventListener('tabsConstructorReady', function() {
      console.log('Tabs system ready, checking for new videos...');
      observeNewVideos();
    });

    // Set up MutationObserver to catch dynamically added videos
    if (typeof MutationObserver !== 'undefined') {
      var mutationObserver = new MutationObserver(function(mutations) {
        var hasNewVideos = false;
        
        mutations.forEach(function(mutation) {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(function(node) {
              if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.tagName === 'VIDEO' && node.classList.contains('lazy')) {
                  hasNewVideos = true;
                } else if (node.querySelector) {
                  var videos = node.querySelectorAll('video.lazy');
                  if (videos.length > 0) {
                    hasNewVideos = true;
                  }
                }
              }
            });
          }
        });

        if (hasNewVideos) {
          setTimeout(observeNewVideos, 100);
        }
      });

      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    }

  } else {
    // Fallback for browsers without IntersectionObserver
    lazyVideos.forEach(function(lazyVideo) {
      for (var i = 0; i < lazyVideo.children.length; i++) {
        var videoSource = lazyVideo.children[i];
        if (videoSource.tagName === "SOURCE" && videoSource.dataset.src) {
          videoSource.src = videoSource.dataset.src;
        }
      }
      lazyVideo.load();
      lazyVideo.classList.remove("lazy");
    });
  }
});
