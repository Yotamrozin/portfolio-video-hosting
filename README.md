# Portfolio Video Hosting System
A sophisticated web application for showcasing video portfolios with advanced tab navigation, category management, and interactive animations.

## 🚀 Features
### Core Functionality
- Advanced Tab Navigation : Smooth navigation between video projects with auto-advance functionality
- Category Management : Organized project categories with dynamic switching
- Video Hosting : Support for multiple video formats (WebM, MP4) with optimized thumbnails
- Interactive Animations : GSAP-powered scroll animations and hover effects
- Responsive Design : Optimized for various screen sizes with thumbnail scaling
### Technical Highlights
- Tab Indicators : Visual progress indicators with smooth animations
- Auto-Advance System : Configurable auto-progression through portfolio items
- Touch/Swipe Support : Mobile-friendly navigation controls
- Performance Optimized : Efficient DOM manipulation and event handling
- Modular Architecture : Clean separation of concerns with dedicated controllers

- ├── Code/
│   ├── tab-navigation.js          # Core tab navigation system
│   ├── category-tabs-controller.js # Category management
│   ├── tabs-constructor.js        # Tab initialization
│   ├── instagram-story-system.js  # Story-like navigation
│   ├── thumbnail-mouse-follow.js  # Interactive thumbnails
│   ├── scroll-animation.js        # GSAP scroll effects
│   └── nav-scroll-manager.js      # Navigation scroll handling
├── Projects/
│   ├── Webm/                      # WebM video files
│   ├── mp4/                       # MP4 video files
│   └── Thumbnails/                # Optimized thumbnails
└── Rive/                          # Rive animation assets

## 🛠️ Installation
1. 1.
   Clone the repository:
git clone https://github.com/yourusername/portfolio-video-hosting.git
cd portfolio-video-hosting

2. Start the development server:
# Using PowerShell (Windows)
.\Code\start-server.ps1

# Or using Python
python -m http.server 8000

3. Open your browser and navigate to http://localhost:8000
## 🎮 Usage
### Basic Navigation
- Next/Previous : Use arrow buttons or swipe gestures
- Auto-Advance : Automatic progression every 5 seconds
- Category Switching : Click category buttons or use navigation arrows at boundaries
### Configuration
Adjust the auto-advance duration in tab-navigation.js :
const AUTO_ADVANCE_DURATION = 5000; // 5 seconds

Adding New Projects
1.
Add video files to Projects/Webm/ or Projects/mp4/
2.
Add corresponding thumbnails to Projects/Thumbnails/
3.
Update the CMS or HTML structure to include new project data
🎨 Customization
Styling
Category Colors: Modify in category-tabs-controller.js
Animation Timing: Adjust in respective animation files
Responsive Breakpoints: Update in CSS files
Animations
GSAP Animations: Configure in gsap-scroll-animation.js
Tab Indicators: Customize in tab-navigation.js
Hover Effects: Modify in thumbnail-mouse-follow.js
🔧 Technical Details
Dependencies
GSAP: For smooth animations
Webflow: For CMS and basic structure
Finsweet CMS Library: For enhanced CMS functionality
Browser Support
Modern browsers with ES6+ support
Mobile browsers with touch event support
WebM and MP4 video format support
Performance Considerations
Lazy loading for video content
Optimized thumbnail sizes (480px, 768px variants)
Efficient event listener management
Debounced user interactions
📱 Mobile Features
Touch and swipe gesture support
Responsive video scaling
Optimized thumbnail loading
Mobile-friendly navigation controls
🐛 Debugging
Enable debug mode by checking the browser console for detailed logs:

Tab navigation events
Category switching
Animation states
Performance metrics
🤝 Contributing
1.
Fork the repository
2.
Create a feature branch: git checkout -b feature-name
3.
Commit changes: git commit -am 'Add feature'
4.
Push to branch: git push origin feature-name
5.
Submit a pull request
📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments
GSAP for animation capabilities
Webflow for CMS integration
Modern web standards for smooth performance

Note : This is a portfolio showcase system designed for creative professionals to display video work with an engaging, interactive interface
