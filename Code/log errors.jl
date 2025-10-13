I ran a speed test and it seems like the page is still slow. I think the issue is with the video player. Here are the results:

Performance Summary
Is it Quick?
Not bad... This site was quick to connect and deliver initial code. It began rendering content very quickly. There were 17 render-blocking requests. The largest content rendered quickly.
Opportunities
7
Tips
7
Pro
Experiments
11
Is it Usable?
Not bad... This site had major layout shifts. It took little time to become interactive. It had 1 accessibility issues, 1 serious. Some HTML was generated after delivery, potentially delaying usability.
Opportunities
2
Tips
2
Pro
Experiments
2
Is it Resilient?
Not bad... This site had many render-blocking 3rd party requests that could be a single point of failure. It had no security issues. Some HTML was generated after delivery, which can cause fragility.
Opportunities
2
Tips
2
Pro
Experiments
8
You have Free Experiments Available!
Try them now!

Page Performance Metrics
Note: Metric availability will vary
First View
Time to First Byte	Start Render	First Contentful Paint	Speed Index	Largest Contentful Paint	Cumulative Layout Shift	Total Blocking Time	Page Weight
.253S	1.900S	1.891S	3.360S	1.891S	.509	.168S	16,582KB
When did the content start downloading?	When did pixels first start to appear?	How soon did text and images start to appear?	How soon did the page look usable?	When did the largest visible content finish loading?	How much did the design shift while loading?	Was the main thread blocked?	How many bytes downloaded?
Visual Page Loading Process (Explore)

Repeat View
Time to First Byte	Start Render	First Contentful Paint	Speed Index	Largest Contentful Paint	Cumulative Layout Shift	Total Blocking Time	Page Weight
.251S	.300S	.353S	1.230S	.353S	.626	.668S	9,442KB
When did the content start downloading?	When did pixels first start to appear?	How soon did text and images start to appear?	How soon did the page look usable?	When did the largest visible content finish loading?	How much did the design shift while loading?	Was the main thread blocked?	How many bytes downloaded?
Visual Page Loading Process (Explore)

Individual Runs
Waterfall	Screenshot	Video
First View
(Error: Timed Out)

Timeline (view)
Processing Breakdown

Trace (view)			Filmstrip View
-
Watch Video
Repeat View
(16.108s)

Timeline (view)
Processing Breakdown

Trace (view)			Filmstrip View
-
Watch Video
Content Breakdown	
Requests
html
js
css
image
font
video
other
36%
27%
16.9%
Content Type	Requests
html	1
js	32
css	7
image	15
flash	0
font	5
video	24
other	5
Bytes
html
js
css
image
font
video
other
79.8%
Content Type	Bytes
html	130,076
js	531,900
css	48,252
image	1,638,307
flash	0
font	540,793
video	13,546,123
other	544,814

11 JavaScript files are blocking page rendering.
By default, references to external JavaScript files will block the page from rendering while they are fetched and executed. Often, these files can be loaded in a different manner, freeing up the page to visually render sooner.

/ajax/libs/webfont/1.6.26/webfont.js
/scripts/sitewide/page-load-tracker.js
/8.6.1/video.min.js
/@rive-app/canvas@2.30.3/rive.js
/686fe533f545b4826346b826/js/webflow.ba170182.3ba5c41aa3504027.js
/gsap/3.13.0/gsap.min.js
/gsap/3.13.0/ScrollTrigger.min.js
/gsap/3.13.0/SplitText.min.js
/ajax/libs/gsap/3.12.5/gsap.min.js
/ajax/libs/gsap/3.12.5/TextPlugin.min.js
/js/jquery-3.5.1.min.dc5e7f18c8.js?site=686fe533f545b4826346b826

6 externally-referenced CSS files are blocking page rendering.
By default, references to external CSS files will block the page from rendering while they are fetched and executed. Sometimes these files _should_ block rendering, but can be inlined to avoid additional round-trips while the page is waiting to render. Sometimes, such as with stylesheets that are only used for loading custom fonts, inline or async CSS can greatly improve perceived performance.

/686fe533f545b4826346b826/css/yoro-2e3f02.webflow.shared.21cb34480.min.css
/686fe533f545b4826346b826/css/yoro-2e3f02.webflow.686fe533f545b4826346b8f3-d582b8e33.min.css
/styles/css-animation-system.css
/styles/craft-menu-css.css
/8.6.1/video-js.css
/npm/swiper@11/swiper-bundle.min.css

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
Login to WebPageTest
to run Pro experiments.
Zero custom fonts load in ways that delay text visibility.
When fonts are loaded with default display settings, like font-display="block", browsers will hide text entirely for several seconds instead of showing text with a fallback font. font-display: swap will fix this.

5 fonts are hosted on 3rd-party hosts
Fonts on 3rd party domains may take longer to load due to DNS and connection steps that are not necessary when fonts are hosted on the same domain.

https://fonts.gstatic.com/s/oswald/v57/TK3iWkUHHAIjg752GT8G.woff2
https://cdn.prod.website-files.com/686fe533f545b4826346b826/686ff05be001136aa9aaea47_Oi-Regular.ttf
https://cdn.prod.website-files.com/686fe533f545b4826346b826/686fe688376eb5420468233e_AspektaVF.woff2
https://cdn.prod.website-files.com/686fe533f545b4826346b826/686ff1353e9b5ac4bb1cbe8c_Gotu-Regular.ttf
https://cdn.prod.website-files.com/686fe533f545b4826346b826/6877f101f92dd6cf6261ca25_line-square-icon-font.woff

): https://vjs.zencdn.net/8.6.1/video.min.js
FAILED (No max-age or expires): https://vjs.zencdn.net/8.6.1/video-js.css
WARNING (8.9 hours): https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=686fe533f545b4826346b826
WARNING (14.1 hours): https://cdn.prod.website-files.com/6877cc65d6b11dff5bf1dec8/68e4fb6753616f7403022b7f_match-it-all-rooms.avif
WARNING (6.8 days): https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js
WARNING (6.9 days): https://cdn.jsdelivr.net/npm/@finsweet/cms-library@1/cms-library.js
WARNING (7.0 days): https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css
WARNING (22.6 hours): https://cdn.prod.website-files.com/6877cc65d6b11dff5bf1dec8/688bc059d2437d90c67d69ef_all_frames_-06%201%20(1).avif
WARNING (22.6 hours): https://cdn.prod.website-files.com/6877cc65d6b11dff5bf1dec8/68cc458302f29a2bc334cafd_Research%20alpha.avif
WARNING (22.6 hours): https://cdn.prod.website-files.com/6877cc65d6b11dff5bf1dec8/68d6d5710b5318e88e43757c_Generative%20AI%20Pipeline%20Dark%20Mode%20alpha%20portfolio%20white%20copy.avif
WARNING (22.6 hours): https://cdn.prod.website-files.com/6877cc65d6b11dff5bf1dec8/68bc5b68cd65c63406f87a38_Buildings%20Research.avif
WARNING (23.5 hours): https://cdn.prod.website-files.com/6877cc65d6b11dff5bf1dec8/68b0690ff65cb55ed08c1023_vlcsnap-2025-08-28-15h22m06s878.avif
WARNING (23.5 hours): https://cdn.prod.website-files.com/6877cc65d6b11dff5bf1dec8/68e4fb4f8d9d16d42ecc68e9_Production-Ready-hotizontal.avif
WARNING (23.5 hours): https://cdn.prod.website-files.com/6877cc65d6b11dff5bf1dec8/68e65c47dd3ddd74cd1c8be2_vlcsnap-2025-10-08-11h24m33s324.avif
WARNING (23.5 hours): https://cdn.prod.website-files.com/6877cc65d6b11dff5bf1dec8/68e50363379bc535bb90fb0d_Generative%20AI%20Pipeline%20Dark%20Mode%20alpha%20portfolio%20white%20copy.avif
WARNING (23.5 hours): https://cdn.prod.website-files.com/6877cc65d6b11dff5bf1dec8/68b5bd6bbbeb16f5c6516af0_%23Europe%2Bin%2Ba%2BDay%2B-%2BMain%2BComp%2B(0-00-03-01)_1.avif
WARNING (24.0 hours): https://fonts.googleapis.com/css?family=Oswald:200,300,400,500,600,700
Expand All
1 request is resulting in an HTTP redirect.
HTTP redirects can result in additional DNS resolution, TCP connection and HTTPS negotiation times, making them very costly for performance, particularly on high latency networks.

FROM: https://unpkg.com/@rive-app/canvas@2.30.3 TO: 301
Final HTML (DOM) size is significantly larger than initially delivered HTML (196.18kb larger, or 33.07% of total HTML).
Typically this is due to over-reliance on JavaScript for generating content, but increases can also happen as a result of browsers normalizing HTML structure as well. When critical HTML content is generated with JavaScript in the browser, several performance bottlenecks can arise:

Before content can be generated client-side, the browser must first parse, evaluate, and sometimes also request JavaScript over the network. These steps occur after the HTML is initially delivered, and can incur long delays depending on the device.
If the generated HTML contains references to external assets (images for example), the browser will not be able to discover and request them as early as desired.
Relevant Experiments
Mimic Pre-rendered HTML
This experiment mimics server-generated HTML by swapping the initial HTML with the fully rendered HTML from this test run. Note: this will very likely break site behavior, but is potentially useful for comparing early metrics and assessing whether moving logic to the server is worth the effort.

Login to WebPageTest
to run Pro experiments.
Is it Usable?
Not bad... This site had major layout shifts. It took little time to become interactive. It had 1 accessibility issues, 1 serious. Some HTML was generated after delivery, potentially delaying usability.

WebPageTest ran 5 diagnostic checks related to this category and found 2 opportunities.

Layout shifts are not caused by images lacking aspect ratio
This is great. Images with width and height attributes allow the browser to better predict the space an image will occupy in a layout before it loads, reducing layout shifts and improving your CLS metric score.

The main thread was not blocked for any significant time.
When files block the main thread, users are unable to interact with the page content. Typically, parsing and executing large JavaScript files, as well as running long JavaScript tasks can block the main thread and should be avoided.

Meta Viewport tag is configured properly.
A meta viewport tag will help a mobile-friendly site scale and display properly on small screen devices.

Accessibility Issues were Detected
Axe found 1 accessibility issues: 1 serious,

Relevant Tips
Make the following changes to improve accessibility:
serious Links must have discernible text More info
Fix all of the following: Element is in tab order and does not have accessible text Fix any of the following: Element does not have text that is visible to screen readers aria-label attribute does not exist or is empty aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty Element has no title attribute<a href="#" class="example-wrapper w-inline-block">
Fix all of the following: Element is in tab order and does not have accessible text Fix any of the following: Element does not have text that is visible to screen readers aria-label attribute does not exist or is empty aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty Element has no title attribute<a href="#hero" class="footer-bottom-logo w-inline-block">
Final HTML (DOM) size is significantly larger than initially delivered HTML (196.18kb larger, or 33.07% of total HTML).
Typically this is due to over-reliance on JavaScript for generating content, but increases can also happen as a result of browsers normalizing HTML structure as well. When critical HTML content is generated with JavaScript in the browser, it can increase the time it takes for content to be made accessible to assistive technology such as screen readers.

Relevant Tips
Look for ways to deliver more HTML content from the start
Many modern frameworks offer patterns for generating useful HTML on the server.

Is it Resilient?
Not bad... This site had many render-blocking 3rd party requests that could be a single point of failure. It had no security issues. Some HTML was generated after delivery, which can cause fragility.

WebPageTest ran 4 diagnostic checks related to this category and found 2 opportunities.

Potential SPOF: 18 3rd-party requests are blocking page rendering.
By default, references to external JavaScript and CSS files will block the page from rendering. Third-party blocking requests are particularly risky, as your page's access relies on their response time and availability.'

https://cdn.prod.website-files.com/686fe533f545b4826346b826/css/yoro-2e3f02.webflow.shared.21cb34480.min.css
https://cdn.prod.website-files.com/686fe533f545b4826346b826/css/yoro-2e3f02.webflow.686fe533f545b4826346b8f3-d582b8e33.min.css
https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js
https://yoro-portfolio.b-cdn.net/styles/css-animation-system.css
https://yoro-portfolio.b-cdn.net/scripts/sitewide/page-load-tracker.js
https://yoro-portfolio.b-cdn.net/styles/craft-menu-css.css
https://vjs.zencdn.net/8.6.1/video-js.css
https://vjs.zencdn.net/8.6.1/video.min.js
https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css
https://unpkg.com/@rive-app/canvas@2.30.3
https://unpkg.com/@rive-app/canvas@2.30.3/rive.js
https://cdn.prod.website-files.com/686fe533f545b4826346b826/js/webflow.ba170182.3ba5c41aa3504027.js
https://cdn.prod.website-files.com/gsap/3.13.0/gsap.min.js
https://cdn.prod.website-files.com/gsap/3.13.0/ScrollTrigger.min.js
https://cdn.prod.website-files.com/gsap/3.13.0/SplitText.min.js
https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js
https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/TextPlugin.min.js
https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=686fe533f545b4826346b826
Expand All
Relevant Experiments
Preconnect 3rd Party Hosts
This experiment will add a link with rel="preconnect" for specified hosts, which saves time for those steps when the resource is later requested.

Assets included in experiment:
Login to WebPageTest
to run Pro experiments.
Preload 3rd Party Files
This experiment will add a link with rel="preload" for specified files, causing the browser to fetch the file early and at a high priority.

Assets included in experiment:
Login to WebPageTest
to run Pro experiments.
Self Host 3rd Party Files
This experiment will fetch these files server-side and reference them on the same domain. Note: the overrides happen at the host level, so any requests from that host will now be self-hosted.

Assets included in experiment:
Login to WebPageTest
to run Pro experiments.
Make Scripts Timeout
This experiment directs specified hosts to WebPageTest's blackhole server, which will hang indefinitely until timing out. Use this experiment to test your site's ability to serve content if these services hang.

Assets included in experiment:
Login to WebPageTest
to run Pro experiments.
Block Scripts
This experiment causes specified requests to fail immediately. Use this experiment to test your site's ability to serve content if these services are unavailable.

Assets included in experiment:
Login to WebPageTest
to run Pro experiments.
Zero security vulnerabilities were detected by Snyk
Snyk has found 0 security vulnerabilities with included packages.

Zero resources were found that were loaded over an insecure connection.
Loading requests over HTTPS necessary for ensuring data integrity, protecting users personal information, providing core critical security, and providing access to many new browser features.

Final HTML (DOM) size is significantly larger than initially delivered HTML (196.18kb larger, or 33.07% of total HTML).
Typically this is due to over-reliance on JavaScript for generating content, but increases can also happen as a result of browsers normalizing HTML structure as well. Common issues such as JavaScript errors and third-party network delays and outages can present potential single points of failure.

Relevant Experiments
Disable Scripts
This experiment makes all scripts (inline and external) unrecognizable as javascript by the browser in order to demonstrate whether the site will still be usable if JavaScript fails to properly run.

Login to WebPageTest
to run Pro experiments.
Make Scripts Timeout
This experiment directs specified requests to WebPageTest's blackhole server, which will hang indefinitely until timing out. Use this experiment to test your site's ability to serve content if these services hang.

Assets included in experiment:
Login to WebPageTest
to run Pro experiments.
Block Script Requests
This experiment causes specified requests to fail immediately. Use this experiment to test your site's ability to serve content if these services are unavailable.

Assets included in experiment:
Select allUnselect all
/ajax/libs/webfont/1.6.26/webfont.js
/scripts/sitewide/page-load-tracker.js
/8.6.1/video.min.js
/@rive-app/canvas@2.30.3/rive.js
/686fe533f545b4826346b826/js/webflow.ba170182.3ba5c41aa3504027.js
/gsap/3.13.0/gsap.min.js
/gsap/3.13.0/ScrollTrigger.min.js
/gsap/3.13.0/SplitText.min.js
/npm/swiper@11/swiper-bundle.min.js
/scripts/sitewide/thumbnail-mouse-follow-optimized.js
/npm/@finsweet/cms-library@1/cms-library.js
/scripts/homepage/craft-menu-js.js
/ajax/libs/gsap/3.12.5/gsap.min.js
/ajax/libs/gsap/3.12.5/TextPlugin.min.js
/js/jquery-3.5.1.min.dc5e7f18c8.js?site=686fe533f545b4826346b826
/686fe533f545b4826346b826/js/webflow.achunk.22b66e874d42861f.js
/686fe533f545b4826346b826/js/webflow.achunk.64873797e35e968c.js
/686fe533f545b4826346b826/js/webflow.achunk.b8f6943fb94f77dd.js
/686fe533f545b4826346b826/js/webflow.achunk.ad6dcd2fc75b294c.js
/686fe533f545b4826346b826/js/webflow.achunk.db80639074bc0296.js
/686fe533f545b4826346b826/js/webflow.achunk.5959ac50b3c857f1.js
/686fe533f545b4826346b826/js/webflow.achunk.496d56dd8c063ec0.js
/686fe533f545b4826346b826/js/webflow.achunk.9955643573f878d3.js
/686fe533f545b4826346b826/js/webflow.achunk.36b8fb49256177c8.js
/686fe533f545b4826346b826/js/webflow.achunk.ec818b2456bb7208.js
/686fe533f545b4826346b826/js/webflow.achunk.2343c70da181b95c.js
/686fe533f545b4826346b826/js/webflow.achunk.b4435221be879eb3.js
/686fe533f545b4826346b826/js/webflow.achunk.0a46a3eef4d87fb7.js
/686fe533f545b4826346b826/js/webflow.achunk.9e68bd6df188e4b1.js
/686fe533f545b4826346b826/js/webflow.achunk.290ba3321b55c707.js
/686fe533f545b4826346b826/js/webflow.achunk.88fa96a0bf0adf9a.js
/686fe533f545b4826346b826/js/webflow.achunk.576a61a44f8d421d.js