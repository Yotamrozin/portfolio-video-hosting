// Video Audit Script - Identifies duplicate videos and loading issues
class VideoAudit {
  constructor() {
    this.videos = new Map();
    this.duplicates = [];
    this.loadingTimes = [];
    this.totalSize = 0;
  }

  init() {
    console.log('🔍 Starting Video Audit...');
    this.scanVideos();
    this.trackLoading();
    this.generateReport();
  }

  scanVideos() {
    const videoElements = document.querySelectorAll('video');
    console.log(`📹 Found ${videoElements.length} video elements`);

    videoElements.forEach((video, index) => {
      const sources = Array.from(video.querySelectorAll('source')).map(s => s.src);
      const poster = video.poster;
      const autoplay = video.autoplay;
      const loading = video.loading;
      const preload = video.preload;

      const videoInfo = {
        index: index + 1,
        element: video,
        sources: sources,
        poster: poster,
        autoplay: autoplay,
        loading: loading,
        preload: preload,
        section: this.getElementSection(video),
        loadingTime: 0,
        size: 0,
        loaded: false
      };

      // Check for duplicates
      sources.forEach(src => {
        if (this.videos.has(src)) {
          this.duplicates.push({
            src: src,
            first: this.videos.get(src),
            duplicate: videoInfo
          });
        } else {
          this.videos.set(src, videoInfo);
        }
      });

      console.log(`Video ${index + 1}:`, {
        sources: sources,
        autoplay: autoplay,
        loading: loading,
        preload: preload,
        section: videoInfo.section
      });
    });
  }

  trackLoading() {
    const videoElements = document.querySelectorAll('video');
    
    videoElements.forEach((video, index) => {
      const startTime = performance.now();
      
      video.addEventListener('loadstart', () => {
        console.log(`🎬 Video ${index + 1} started loading`);
      });

      video.addEventListener('loadeddata', () => {
        const loadTime = performance.now() - startTime;
        this.loadingTimes.push({
          index: index + 1,
          src: video.src || video.querySelector('source')?.src,
          loadTime: loadTime,
          section: this.getElementSection(video)
        });
        console.log(`✅ Video ${index + 1} loaded in ${loadTime.toFixed(2)}ms`);
      });

      video.addEventListener('error', (e) => {
        console.error(`❌ Video ${index + 1} failed to load:`, e);
      });
    });
  }

  getElementSection(element) {
    let current = element;
    while (current && current !== document.body) {
      if (current.tagName === 'SECTION' || current.classList.contains('section')) {
        return current.id || current.className || 'Unknown Section';
      }
      current = current.parentElement;
    }
    return 'Unknown Section';
  }

  generateReport() {
    setTimeout(() => {
      console.log('\n📊 VIDEO AUDIT REPORT');
      console.log('====================');
      
      console.log(`\n📹 Total Videos: ${this.videos.size}`);
      console.log(`🔄 Duplicates Found: ${this.duplicates.length}`);
      
      if (this.duplicates.length > 0) {
        console.log('\n🚨 DUPLICATE VIDEOS:');
        this.duplicates.forEach((dup, index) => {
          console.log(`${index + 1}. ${dup.src}`);
          console.log(`   First: Section ${dup.first.section}`);
          console.log(`   Duplicate: Section ${dup.duplicate.section}`);
        });
      }

      console.log('\n⏱️ LOADING TIMES:');
      this.loadingTimes.forEach(load => {
        console.log(`Video ${load.index}: ${load.loadTime.toFixed(2)}ms (${load.section})`);
      });

      const totalLoadTime = this.loadingTimes.reduce((sum, load) => sum + load.loadTime, 0);
      console.log(`\n📈 Total Loading Time: ${totalLoadTime.toFixed(2)}ms`);
      
      console.log('\n💡 RECOMMENDATIONS:');
      if (this.duplicates.length > 0) {
        console.log('1. Remove duplicate video sources');
      }
      if (this.loadingTimes.some(load => load.loadTime > 5000)) {
        console.log('2. Implement lazy loading for slow videos');
      }
      if (this.loadingTimes.some(load => load.loadTime > 10000)) {
        console.log('3. Consider video compression or CDN optimization');
      }
    }, 5000); // Wait 5 seconds for videos to load
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new VideoAudit().init();
  });
} else {
  new VideoAudit().init();
}
