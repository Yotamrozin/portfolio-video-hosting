/**
 * Thumbnail Debug Script
 * Run this in the browser console to diagnose thumbnail issues
 */

console.log('🔧 Starting Thumbnail Debug...');

// 1. Check if thumbnails exist
const thumbnails = document.querySelectorAll('[hover-mouse-follow="thumbnail"]');
console.log(`📊 Found ${thumbnails.length} thumbnails:`, thumbnails);

if (thumbnails.length === 0) {
  console.error('❌ No thumbnails found! Check HTML structure.');
  console.log('💡 Expected: <img hover-mouse-follow="thumbnail" ...>');
}

// 2. Check parent containers
thumbnails.forEach((thumb, index) => {
  const parent = thumb.closest('.project-list-item') || 
                thumb.closest('.project-item') || 
                thumb.closest('.list-item');
  
  console.log(`🔍 Thumbnail ${index}:`, {
    element: thumb,
    parent: parent,
    hasParent: !!parent,
    parentClass: parent?.className,
    currentStyle: {
      transform: thumb.style.transform,
      opacity: thumb.style.opacity,
      scale: getComputedStyle(thumb).transform
    }
  });
});

// 3. Check GSAP properties
if (typeof gsap !== 'undefined') {
  console.log('✅ GSAP is loaded');
  
  thumbnails.forEach((thumb, index) => {
    const gsapProps = {
      scale: gsap.getProperty(thumb, 'scale'),
      opacity: gsap.getProperty(thumb, 'opacity'),
      rotationX: gsap.getProperty(thumb, 'rotationX'),
      rotationY: gsap.getProperty(thumb, 'rotationY'),
      x: gsap.getProperty(thumb, 'x'),
      y: gsap.getProperty(thumb, 'y')
    };
    
    console.log(`🎯 GSAP Properties for thumbnail ${index}:`, gsapProps);
    
    // Check if thumbnail is visible
    const rect = thumb.getBoundingClientRect();
    console.log(`📐 Bounding rect for thumbnail ${index}:`, {
      width: rect.width,
      height: rect.height,
      visible: rect.width > 0 && rect.height > 0
    });
  });
} else {
  console.error('❌ GSAP not loaded!');
}

// 4. Test hover events
console.log('🐭 Testing hover events...');
thumbnails.forEach((thumb, index) => {
  const parent = thumb.closest('.project-list-item') || 
                thumb.closest('.project-item') || 
                thumb.closest('.list-item');
  
  if (parent) {
    // Add temporary event listeners to test
    const testEnter = () => console.log(`✅ Mouse enter works on thumbnail ${index}`);
    const testLeave = () => console.log(`❌ Mouse leave works on thumbnail ${index}`);
    
    parent.addEventListener('mouseenter', testEnter, { once: true });
    parent.addEventListener('mouseleave', testLeave, { once: true });
    
    console.log(`🎯 Added test listeners to thumbnail ${index} parent`);
  }
});

// 5. Force show all thumbnails for testing
function forceShowThumbnails() {
  console.log('🚀 Force showing all thumbnails...');
  
  thumbnails.forEach((thumb, index) => {
    if (typeof gsap !== 'undefined') {
      gsap.set(thumb, {
        scale: 1,
        opacity: 1,
        rotationX: 0,
        rotationY: 0
      });
      console.log(`✅ Force showed thumbnail ${index}`);
    }
  });
}

// 6. Force hide all thumbnails
function forceHideThumbnails() {
  console.log('🙈 Force hiding all thumbnails...');
  
  thumbnails.forEach((thumb, index) => {
    if (typeof gsap !== 'undefined') {
      gsap.set(thumb, {
        scale: 0,
        opacity: 0
      });
      console.log(`❌ Force hid thumbnail ${index}`);
    }
  });
}

// 7. Test animation
function testThumbnailAnimation(index = 0) {
  if (thumbnails[index] && typeof gsap !== 'undefined') {
    console.log(`🎬 Testing animation on thumbnail ${index}...`);
    
    gsap.to(thumbnails[index], {
      scale: 1,
      opacity: 1,
      duration: 0.6,
      ease: "back.out(1.7)",
      onComplete: () => {
        console.log(`✅ Animation complete for thumbnail ${index}`);
        
        // Hide it again after 2 seconds
        setTimeout(() => {
          gsap.to(thumbnails[index], {
            scale: 0,
            opacity: 0,
            duration: 0.6,
            onComplete: () => console.log(`❌ Hide animation complete for thumbnail ${index}`)
          });
        }, 2000);
      }
    });
  }
}

console.log('🔧 Debug complete! Available functions:');
console.log('- forceShowThumbnails() - Show all thumbnails');
console.log('- forceHideThumbnails() - Hide all thumbnails');
console.log('- testThumbnailAnimation(index) - Test animation on specific thumbnail');
console.log('\n🎯 Try: testThumbnailAnimation(0)');

// Make functions globally available
window.forceShowThumbnails = forceShowThumbnails;
window.forceHideThumbnails = forceHideThumbnails;
window.testThumbnailAnimation = testThumbnailAnimation;