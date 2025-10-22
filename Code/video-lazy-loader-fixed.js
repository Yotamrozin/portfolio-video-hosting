/**
 * Fixed Video Lazy Loading Script
 * 
 * This script properly lazy loads videos using Intersection Observer
 * and fixes the syntax error in the original script.
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
    });

    lazyVideos.forEach(function(lazyVideo) {
      lazyVideoObserver.observe(lazyVideo);
    });
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
