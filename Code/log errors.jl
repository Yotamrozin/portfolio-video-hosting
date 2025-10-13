Opportunities & Experiments
New
WebPageTest helps identify opportunities to improve a site's experience. Select one or more No-Code Experiments below and submit to test their impact.

Jump to Opportunities by Category:

Is it Quick?
Not bad...
Opportunities
7
Tips
7
Pro
Experiments
11
Is it Usable?
Needs Improvement.
Opportunities
3
Tips
3
Pro
Experiments
3
Is it Resilient?
Not bad...
Opportunities
2
Tips
2
Pro
Experiments
8
Is it Quick?
Not bad... This site was quick to connect and deliver initial code. It began rendering content very quickly. There were 15 render-blocking requests. The largest content rendered quickly.

WebPageTest ran 13 diagnostic checks related to this category and found 7 opportunities.

This test had a reasonably quick first-byte time.
A fast time to first byte is essential for delivering assets quickly.

9 JavaScript files are blocking page rendering.
By default, references to external JavaScript files will block the page from rendering while they are fetched and executed. Often, these files can be loaded in a different manner, freeing up the page to visually render sooner.

/ajax/libs/webfont/1.6.26/webfont.js
/scripts/sitewide/page-load-tracker.js
/8.6.1/video.min.js
/@rive-app/canvas@2.30.3/rive.js
/686fe533f545b4826346b826/js/webflow.ba170182.3ba5c41aa3504027.js
/gsap/3.13.0/gsap.min.js
/gsap/3.13.0/ScrollTrigger.min.js
/gsap/3.13.0/SplitText.min.js
/js/jquery-3.5.1.min.dc5e7f18c8.js?site=686fe533f545b4826346b826
Relevant Experiments
Defer Render-Blocking Scripts
This experiment adds a defer attribute to render-blocking scripts, causing the browser to fetch them in parallel while showing the page. Deferred scripts still execute in the order they are defined in source. Example implementation: <script src="/ajax/libs/webfont/1.6.26/webfont.js" defer></script>

Assets included in experiment:
Run This Experiment!
Async Render-Blocking Scripts
This experiment adds an async attribute to render-blocking scripts, causing the browser to fetch them in parallel while showing the page. Async scripts are not guaranteed to execute in the order they are defined in source. Example implementation: <script src="/ajax/libs/webfont/1.6.26/webfont.js" async></script>

Assets included in experiment:
Get WebPageTest Pro
for unlimited experiments.
Inline Render-Blocking Scripts
This experiment embeds the contents of specified external scripts directly into the HTML within a script element. This increases the size of the HTML, but can often allow page page to display sooner by avoiding server round trips.Example implementation: <script>/* contents from /ajax/libs/webfont/1.6.26/webfont.js here...*/</script>

Assets included in experiment:
Get WebPageTest Pro
for unlimited experiments.
6 externally-referenced CSS files are blocking page rendering.
By default, references to external CSS files will block the page from rendering while they are fetched and executed. Sometimes these files _should_ block rendering, but can be inlined to avoid additional round-trips while the page is waiting to render. Sometimes, such as with stylesheets that are only used for loading custom fonts, inline or async CSS can greatly improve perceived performance.

/npm/swiper@11/swiper-bundle.min.css
/686fe533f545b4826346b826/css/yoro-2e3f02.webflow.shared.21cb34480.min.css
/686fe533f545b4826346b826/css/yoro-2e3f02.webflow.686fe533f545b4826346b8f3-d582b8e33.min.css
/styles/css-animation-system.css
/styles/craft-menu-css.css
/8.6.1/video-js.css
Relevant Experiments
Inline external CSS
This experiment embeds the contents of specified external stylesheets directly into the HTML within a style element. This increases the size of the HTML, but can often allow page page to display sooner by avoiding server round trips. Note: The inline experiment may break relative references to images and other assets in the CSS. These would need proper path changes in production.

Assets included in experiment:
Get WebPageTest Pro
for unlimited experiments.
Load CSS Asynchronously
This experiment loads specified stylesheets in a way that allows the page to begin rendering while they are still loading. Note that this may cause a flash of unstyled content.

Assets included in experiment:
Get WebPageTest Pro
for unlimited experiments.
Largest Contentful Paint time was under 2.5 seconds
Great job. If LCP was higher, WebPageTest would look for ways to speed it up.

Zero render-critical images are lazy-loaded.
When images are lazy-loaded using loading="lazy", they will be requested after the layout is established, which is too late for images in the critical window.

Images outside the critical viewport can be lazy-loaded.
When images are lazy-loaded using loading="lazy", when they scroll into the viewport, freeing up early load for other tasks.

https://cdn.prod.website-files.com/6877cc65d6b11dff5bf1dec8/68e4ec6932d122c34c15e2ff_Software.svg
Relevant Experiments
Add loading="lazy" to images
This experiment adds loading="lazy" attributes to images that are outside the viewport at load.

Assets included in experiment:
Get WebPageTest Pro
for unlimited experiments.
Zero custom fonts load in ways that delay text visibility.
When fonts are loaded with default display settings, like font-display="block", browsers will hide text entirely for several seconds instead of showing text with a fallback font. font-display: swap will fix this.

5 fonts are hosted on 3rd-party hosts
Fonts on 3rd party domains may take longer to load due to DNS and connection steps that are not necessary when fonts are hosted on the same domain.

https://fonts.gstatic.com/s/oswald/v57/TK3iWkUHHAIjg752GT8G.woff2
https://cdn.prod.website-files.com/686fe533f545b4826346b826/686fe688376eb5420468233e_AspektaVF.woff2
https://cdn.prod.website-files.com/686fe533f545b4826346b826/686ff05be001136aa9aaea47_Oi-Regular.ttf
https://cdn.prod.website-files.com/686fe533f545b4826346b826/686ff1353e9b5ac4bb1cbe8c_Gotu-Regular.ttf
https://cdn.prod.website-files.com/686fe533f545b4826346b826/6877f101f92dd6cf6261ca25_line-square-icon-font.woff
Relevant Experiments
Self-Host 3rd Party Files
This experiment will fetch specified files server-side and reference them on the same domain. Note: the overrides happen at the host level, so any requests from that host will now be self-hosted.

Assets included in experiment:
Get WebPageTest Pro
for unlimited experiments.
Preconnect 3rd Party Hosts
This experiment will add a link with rel="preconnect" for specified hosts, which saves time for those steps when the resource is later requested.

Assets included in experiment:
Get WebPageTest Pro
for unlimited experiments.
Preload 3rd Party Files
This experiment will add a link with rel="preload" for specified hosts, causing the browser to fetch the file early and at a high priority.

Assets included in experiment:
Get WebPageTest Pro
for unlimited experiments.
Make Fonts Timeout
This experiment directs specified hosts to WebPageTest's blackhole server, which will hang indefinitely until timing out. Use this experiment to test your site's ability to display fallback text if fonts do not load quickly.

Assets included in experiment:
Get WebPageTest Pro
for unlimited experiments.
Zero unused preloads were found.
Preloaded resources are fetched at a high priority, delaying the arrival of other resources in the page. In the case where a preloaded resource is never actually used by the page, that means potentially critical requests will be delayed, slowing down the initial loading of your site.

This site uses a CDN for delivering its files.
A Content Delivery Network (CDN) distributes a website's files throughout the world, reducing request latency.

20 static files have inadequate cache settings.
Cache settings can instruct browsers and intermediaries to store recent versions of a site's static files (JavaScript, CSS, Images, fonts...) for reuse, reducing page weight and latency.

FAILED (No max-age or expires): https://cdn.prod.website-files.com/gsap/3.13.0/gsap.min.js
FAILED (No max-age or expires): https://cdn.prod.website-files.com/gsap/3.13.0/ScrollTrigger.min.js
FAILED (No max-age or expires): https://cdn.prod.website-files.com/gsap/3.13.0/SplitText.min.js
FAILED (No max-age or expires): https://vjs.zencdn.net/8.6.1/video-js.css
FAILED (No max-age or expires): https://vjs.zencdn.net/8.6.1/video.min.js
WARNING (13.6 hours): https://cdn.prod.website-files.com/6877cc65d6b11dff5bf1dec8/68e4fb6753616f7403022b7f_match-it-all-rooms.avif
WARNING (6.7 days): https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js
WARNING (6.7 days): https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css
WARNING (6.7 days): https://cdn.jsdelivr.net/npm/@finsweet/cms-library@1/cms-library.js
WARNING (17.9 hours): https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=686fe533f545b4826346b826
WARNING (22.1 hours): https://cdn.prod.website-files.com/6877cc65d6b11dff5bf1dec8/68cc458302f29a2bc334cafd_Research%20alpha.avif
WARNING (22.1 hours): https://cdn.prod.website-files.com/6877cc65d6b11dff5bf1dec8/68d6d5710b5318e88e43757c_Generative%20AI%20Pipeline%20Dark%20Mode%20alpha%20portfolio%20white%20copy.avif
WARNING (22.1 hours): https://cdn.prod.website-files.com/6877cc65d6b11dff5bf1dec8/68e50363379bc535bb90fb0d_Generative%20AI%20Pipeline%20Dark%20Mode%20alpha%20portfolio%20white%20copy.avif
WARNING (22.1 hours): https://cdn.prod.website-files.com/6877cc65d6b11dff5bf1dec8/68b0690ff65cb55ed08c1023_vlcsnap-2025-08-28-15h22m06s878.avif
WARNING (22.1 hours): https://cdn.prod.website-files.com/6877cc65d6b11dff5bf1dec8/688bc059d2437d90c67d69ef_all_frames_-06%201%20(1).avif
WARNING (22.1 hours): https://cdn.prod.website-files.com/6877cc65d6b11dff5bf1dec8/68bc5b68cd65c63406f87a38_Buildings%20Research.avif
WARNING (22.1 hours): https://cdn.prod.website-files.com/6877cc65d6b11dff5bf1dec8/68e4fb4f8d9d16d42ecc68e9_Production-Ready-hotizontal.avif
WARNING (22.1 hours): https://cdn.prod.website-files.com/6877cc65d6b11dff5bf1dec8/68e65c47dd3ddd74cd1c8be2_vlcsnap-2025-10-08-11h24m33s324.avif
WARNING (22.1 hours): https://cdn.prod.website-files.com/6877cc65d6b11dff5bf1dec8/68b5bd6bbbeb16f5c6516af0_%23Europe%2Bin%2Ba%2BDay%2B-%2BMain%2BComp%2B(0-00-03-01)_1.avif
WARNING (24.0 hours): https://fonts.googleapis.com/css?family=Oswald:200,300,400,500,600,700
Expand All
1 request is resulting in an HTTP redirect.
HTTP redirects can result in additional DNS resolution, TCP connection and HTTPS negotiation times, making them very costly for performance, particularly on high latency networks.

FROM: https://unpkg.com/@rive-app/canvas@2.30.3 TO: -type-options: nosniff
Final HTML (DOM) size is significantly larger than initially delivered HTML (196.22kb larger, or 33.08% of total HTML).
Typically this is due to over-reliance on JavaScript for generating content, but increases can also happen as a result of browsers normalizing HTML structure as well. When critical HTML content is generated with JavaScript in the browser, several performance bottlenecks can arise:

Before content can be generated client-side, the browser must first parse, evaluate, and sometimes also request JavaScript over the network. These steps occur after the HTML is initially delivered, and can incur long delays depending on the device.
If the generated HTML contains references to external assets (images for example), the browser will not be able to discover and request them as early as desired.
Relevant Experiments
Mimic Pre-rendered HTML
This experiment mimics server-generated HTML by swapping the initial HTML with the fully rendered HTML from this test run. Note: this will very likely break site behavior, but is potentially useful for comparing early metrics and assessing whether moving logic to the server is worth the effort.

Get WebPageTest Pro
for unlimited experiments.
Is it Usable?
Needs Improvement. This site had major layout shifts. It took a long time to become interactive. It had 1 accessibility issues, 1 serious. Some HTML was generated after delivery, potentially delaying usability.

WebPageTest ran 5 diagnostic checks related to this category and found 3 opportunities.

Layout shifts are not caused by images lacking aspect ratio
This is great. Images with width and height attributes allow the browser to better predict the space an image will occupy in a layout before it loads, reducing layout shifts and improving your CLS metric score.

The main thread was blocked for 907 ms
When files block the main thread, users are unable to interact with the page content. Typically, parsing and executing large JavaScript files, as well as running long JavaScript tasks can block the main thread and should be avoided. These files had high thread blocking times:

220 ms: https://yoro-2e3f02.webflow.io/
73 ms: https://yoro-portfolio.b-cdn.net/scripts/sitewide/page-load-tracker.js
94 ms: https://unpkg.com/@rive-app/canvas@2.30.3
88 ms: https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=686fe533f545b4826346b826
353 ms: https://cdn.prod.website-files.com/gsap/3.13.0/ScrollTrigger.min.js
Relevant Experiments
Block Specific Requests
This experiment causes specified requests to fail immediately, allowing you to test the usability impact of particular problematic scripts.

Assets included in experiment:
Get WebPageTest Pro
for unlimited experiments.
Meta Viewport tag is configured properly.
A meta viewport tag will help a mobile-friendly site scale and display properly on small screen devices.

Accessibility Issues were Detected
Axe found 1 accessibility issues: 1 serious,

Relevant Tips
Make the following changes to improve accessibility:
serious Links must have discernible text More info
Fix all of the following: Element is in tab order and does not have accessible text Fix any of the following: Element does not have text that is visible to screen readers aria-label attribute does not exist or is empty aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty Element has no title attribute<a href="#" class="example-wrapper w-inline-block">
Fix all of the following: Element is in tab order and does not have accessible text Fix any of the following: Element does not have text that is visible to screen readers aria-label attribute does not exist or is empty aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty Element has no title attribute<a href="#hero" class="footer-bottom-logo w-inline-block">
Final HTML (DOM) size is significantly larger than initially delivered HTML (196.22kb larger, or 33.08% of total HTML).
Typically this is due to over-reliance on JavaScript for generating content, but increases can also happen as a result of browsers normalizing HTML structure as well. When critical HTML content is generated with JavaScript in the browser, it can increase the time it takes for content to be made accessible to assistive technology such as screen readers.

Relevant Tips
Look for ways to deliver more HTML content from the start
Many modern frameworks offer patterns for generating useful HTML on the server.

Is it Resilient?
Not bad... This site had many render-blocking 3rd party requests that could be a single point of failure. It had no security issues. Some HTML was generated after delivery, which can cause fragility.

WebPageTest ran 4 diagnostic checks related to this category and found 2 opportunities.

Potential SPOF: 16 3rd-party requests are blocking page rendering.
By default, references to external JavaScript and CSS files will block the page from rendering. Third-party blocking requests are particularly risky, as your page's access relies on their response time and availability.'

https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js
https://unpkg.com/@rive-app/canvas@2.30.3
https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css
https://cdn.prod.website-files.com/686fe533f545b4826346b826/css/yoro-2e3f02.webflow.shared.21cb34480.min.css
https://cdn.prod.website-files.com/686fe533f545b4826346b826/css/yoro-2e3f02.webflow.686fe533f545b4826346b8f3-d582b8e33.min.css
https://yoro-portfolio.b-cdn.net/styles/css-animation-system.css
https://yoro-portfolio.b-cdn.net/scripts/sitewide/page-load-tracker.js
https://yoro-portfolio.b-cdn.net/styles/craft-menu-css.css
https://vjs.zencdn.net/8.6.1/video-js.css
https://vjs.zencdn.net/8.6.1/video.min.js
https://unpkg.com/@rive-app/canvas@2.30.3/rive.js
https://cdn.prod.website-files.com/686fe533f545b4826346b826/js/webflow.ba170182.3ba5c41aa3504027.js
https://cdn.prod.website-files.com/gsap/3.13.0/gsap.min.js
https://cdn.prod.website-files.com/gsap/3.13.0/ScrollTrigger.min.js
https://cdn.prod.website-files.com/gsap/3.13.0/SplitText.min.js
https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=686fe533f545b4826346b826
Expand All
Relevant Experiments
Preconnect 3rd Party Hosts
This experiment will add a link with rel="preconnect" for specified hosts, which saves time for those steps when the resource is later requested.

Assets included in experiment:
Get WebPageTest Pro
for unlimited experiments.
Preload 3rd Party Files
This experiment will add a link with rel="preload" for specified files, causing the browser to fetch the file early and at a high priority.

Assets included in experiment:
Get WebPageTest Pro
for unlimited experiments.
Self Host 3rd Party Files
This experiment will fetch these files server-side and reference them on the same domain. Note: the overrides happen at the host level, so any requests from that host will now be self-hosted.

Assets included in experiment:
Get WebPageTest Pro
for unlimited experiments.
Make Scripts Timeout
This experiment directs specified hosts to WebPageTest's blackhole server, which will hang indefinitely until timing out. Use this experiment to test your site's ability to serve content if these services hang.

Assets included in experiment:
Get WebPageTest Pro
for unlimited experiments.
Block Scripts
This experiment causes specified requests to fail immediately. Use this experiment to test your site's ability to serve content if these services are unavailable.

Assets included in experiment:
Get WebPageTest Pro
for unlimited experiments.
Zero security vulnerabilities were detected by Snyk
Snyk has found 0 security vulnerabilities with included packages.

Zero resources were found that were loaded over an insecure connection.
Loading requests over HTTPS necessary for ensuring data integrity, protecting users personal information, providing core critical security, and providing access to many new browser features.

Final HTML (DOM) size is significantly larger than initially delivered HTML (196.22kb larger, or 33.08% of total HTML).
Typically this is due to over-reliance on JavaScript for generating content, but increases can also happen as a result of browsers normalizing HTML structure as well. Common issues such as JavaScript errors and third-party network delays and outages can present potential single points of failure.

Relevant Experiments

Loading Logs:
Cookie “_cfuvid” has been rejected for invalid domain. yoro-2e3f02.webflow.io
A resource is blocked by OpaqueResponseBlocking, please check browser console for details. 68e50363379bc535bb90fb0d_Generative AI Pipeline Dark Mode alpha portfolio white copy.avif
unreachable code after return statement
video.min.js:39:4097
Dark variant not found, skipping color application yoro-2e3f02.webflow.io:306:17
Invalid URI. Load of media resource  failed. 8 yoro-2e3f02.webflow.io
Dark variant not found, skipping color application yoro-2e3f02.webflow.io:2381:17
All candidate resources failed to load. Media load paused. 8 yoro-2e3f02.webflow.io
Dark variant not found, skipping color application yoro-2e3f02.webflow.io:306:17
Total logo groups found: 5 yoro-2e3f02.webflow.io:2295:11
Group 1 logos found: 4 
NodeList(4) [ div.client-logo-svg, div.client-logo-svg, div.client-logo-svg, div.client-logo-svg
 ]
yoro-2e3f02.webflow.io:2313:13
Group 2 logos found: 4 
NodeList(4) [ div.client-logo-svg, div.client-logo-svg, div.client-logo-svg, div.client-logo-svg
 ]
yoro-2e3f02.webflow.io:2313:13
Group 3 logos found: 4 
NodeList(4) [ div.client-logo-svg, div.client-logo-svg, div.client-logo-svg, div.client-logo-svg
 ]
yoro-2e3f02.webflow.io:2313:13
Group 4 logos found: 4 
NodeList(4) [ div.client-logo-svg, div.client-logo-svg, div.client-logo-svg, div.client-logo-svg
 ]
yoro-2e3f02.webflow.io:2313:13
Group 5 logos found: 4 
NodeList(4) [ div.client-logo-svg, div.client-logo-svg, div.client-logo-svg, div.client-logo-svg
 ]
yoro-2e3f02.webflow.io:2313:13
Dark variant not found, skipping color application yoro-2e3f02.webflow.io:2381:17
🔍 Initialization check: 
Object { browser: "Firefox", isBackForward: false, loadTime: 0, isLikelyCached: true, navigationType: 0, navigationEntryType: "navigate", userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0..." }
page-load-tracker.js:718:11
🦊 Firefox detected - using conservative loader behavior page-load-tracker.js:730:13
🎬 Initializing page load tracker page-load-tracker.js:745:11
🔄 Loading IMG: 6877cfd7691fcd196f1e3dbc_Featured%20Star.svg (?x?) [#projects] page-load-tracker.js:458:13
🔄 Loading IMG: placeholder.60f9b1840c.svg (?x?) [#project-thumbnail] page-load-tracker.js:458:13
✅ Loaded IMG: 68b5bd6bbbeb16f5c6516af0_%23Europe%2Bin%2Ba%2BDay%2B-%2BMain%2BComp%2B(0-00-03-01)_1.avif (0ms) page-load-tracker.js:466:13
✅ Loaded IMG: 68b0690ff65cb55ed08c1023_vlcsnap-2025-08-28-15h22m06s878.avif (0ms) page-load-tracker.js:466:13
🔄 Loading IMG: 688bc059d2437d90c67d69ef_all_frames_-06%201%20(1).avif (?x?) [#project-thumbnail] page-load-tracker.js:458:13
🔄 Loading IMG: 68bace6150e257ba7ad56025_DTS_Passion_Economy_Daniel_Faro%CC%80_4733.jpg (949x1280) [#w-node-_5c21cd71-3c22-8e99-0736-bab4e4ab6b28-6346b8f3] page-load-tracker.js:458:13
🔄 Loading IMG: 68cc458302f29a2bc334cafd_Research%20alpha.avif (?x?) [#w-node-_5c21cd71-3c22-8e99-0736-bab4e4ab6b28-6346b8f3] page-load-tracker.js:458:13
✅ Loaded IMG: 68e4ec6932d122c34c15e2ff_Software.svg (0ms) page-load-tracker.js:466:13
🔄 Loading IMG: 68d6d5710b5318e88e43757c_Generative%20AI%20Pipeline%20Dark%20Mode%20alpha%20portfolio%20white%20copy.avif (?x?) [#w-node-_5c21cd71-3c22-8e99-0736-bab4e4ab6b28-6346b8f3] page-load-tracker.js:458:13
🔄 Loading IMG: 68bc5b68cd65c63406f87a38_Buildings%20Research.avif (?x?) [#w-node-_5c21cd71-3c22-8e99-0736-bab4e4ab6b28-6346b8f3] page-load-tracker.js:458:13
✅ Loaded IMG: 68e4fb4f8d9d16d42ecc68e9_Production-Ready-hotizontal.avif (0ms) page-load-tracker.js:466:13
🔄 Loading IMG: 68cc5accb797cde355c5ab46_Social%20Change.svg (?x?) [#w-node-_5c21cd71-3c22-8e99-0736-bab4e4ab6b28-6346b8f3] page-load-tracker.js:458:13
✅ Loaded IMG: 68e4ec73980720cb7c82e9c4_Software%20Mossy.svg (0ms) page-load-tracker.js:466:13
🔄 Loading IMG: 68e4fb6753616f7403022b7f_match-it-all-rooms.avif (?x?) [#crafts] page-load-tracker.js:458:13
🔄 Loading IMG: 68e50363379bc535bb90fb0d_Generative%20AI%20Pipeline%20Dark%20Mode%20alpha%20portfolio%20white%20copy.avif (?x?) [#crafts] page-load-tracker.js:458:13
🔄 Loading IMG: 68dfec7c55600d65f01b1712_Cat%20Transform.svg (?x?) [#footer] page-load-tracker.js:458:13
🔄 Loading SCRIPT: webfont.js (unknown) [unknown-section] page-load-tracker.js:458:13
🔄 Loading SCRIPT: video.min.js (unknown) [unknown-section] page-load-tracker.js:458:13
🔄 Loading SCRIPT: page-load-tracker.js (unknown) [unknown-section] page-load-tracker.js:458:13
🔄 Loading SCRIPT: webflow.achunk.ec818b2456bb7208.js (unknown) [unknown-section] page-load-tracker.js:458:13
🔄 Loading SCRIPT: webflow.achunk.2343c70da181b95c.js (unknown) [unknown-section] page-load-tracker.js:458:13
🔄 Loading SCRIPT: webflow.achunk.b4435221be879eb3.js (unknown) [unknown-section] page-load-tracker.js:458:13
🔄 Loading SCRIPT: webflow.achunk.9e68bd6df188e4b1.js (unknown) [unknown-section] page-load-tracker.js:458:13
🔄 Loading SCRIPT: webflow.achunk.290ba3321b55c707.js (unknown) [unknown-section] page-load-tracker.js:458:13
🔄 Loading SCRIPT: webflow.achunk.88fa96a0bf0adf9a.js (unknown) [unknown-section] page-load-tracker.js:458:13
🔄 Loading SCRIPT: canvas@2.30.3 (unknown) [#hero] page-load-tracker.js:458:13
🔄 Loading SCRIPT: jquery-3.5.1.min.dc5e7f18c8.js (unknown) [unknown-section] page-load-tracker.js:458:13
🔄 Loading SCRIPT: webflow.ba170182.3ba5c41aa3504027.js (unknown) [unknown-section] page-load-tracker.js:458:13
🔄 Loading SCRIPT: gsap.min.js (unknown) [unknown-section] page-load-tracker.js:458:13
🔄 Loading SCRIPT: ScrollTrigger.min.js (unknown) [unknown-section] page-load-tracker.js:458:13
🔄 Loading SCRIPT: SplitText.min.js (unknown) [unknown-section] page-load-tracker.js:458:13
🔄 Loading SCRIPT: thumbnail-mouse-follow-optimized.js (unknown) [unknown-section] page-load-tracker.js:458:13
🔄 Loading SCRIPT: cms-library.js (unknown) [unknown-section] page-load-tracker.js:458:13
🔄 Loading SCRIPT: swiper-bundle.min.js (unknown) [unknown-section] page-load-tracker.js:458:13
🔄 Loading SCRIPT: craft-menu-js.js (unknown) [unknown-section] page-load-tracker.js:458:13
✅ Loaded LINK: yoro-2e3f02.webflow.shared.21cb34480.min.css (0ms) page-load-tracker.js:466:13
✅ Loaded LINK: yoro-2e3f02.webflow.686fe533f545b4826346b8f3-d582b8e33.min.css (1ms) page-load-tracker.js:466:13
🔄 Loading LINK: fonts.googleapis.com (unknown) [unknown-section] page-load-tracker.js:458:13
🔄 Loading LINK: fonts.gstatic.com (unknown) [unknown-section] page-load-tracker.js:458:13
✅ Loaded LINK: css (0ms) page-load-tracker.js:466:13
🔄 Loading LINK: 686fe533f545b4826346b90a_favicon.png (unknown) [unknown-section] page-load-tracker.js:458:13
