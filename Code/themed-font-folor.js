// Function to apply project colors
function applyProjectColors() {
    // Check if the component variant is "Dark" using Webflow's data attributes
    const darkSection = document.querySelector('[data-wf--section-footer--section-theme="dark"]');
    const darkNav = document.querySelector('[data-wf--nav--variant="project-dark"]');
    
    if (!darkSection && !darkNav) {
        return;
    }
    
    // Get the color from the data attribute
    const colorHelper = document.getElementById("projectColor");
    if (!colorHelper) {
        // If projectColor element isn't ready yet, try again in 50ms
        setTimeout(applyProjectColors, 50);
        return;
    }
    
    const cmsColor = colorHelper.dataset.color || "#272727";
    
    // Apply font color to elements with project-font-color="true"
    const fontElements = document.querySelectorAll('[project-font-color="true"]');
    fontElements.forEach(element => {
        element.style.color = cmsColor;
    });
    
    // Apply background color to elements with project-bg-color="true"
    const bgElements = document.querySelectorAll('[project-bg-color="true"]');
    bgElements.forEach(element => {
        element.style.backgroundColor = cmsColor;
    });
    
    // Apply placeholder color to form fields with project-placeholder-color="true"
    const placeholderElements = document.querySelectorAll('[project-placeholder-color="true"]');
    if (placeholderElements.length > 0) {
        // Create or update a style element for placeholder styles
        let styleElement = document.getElementById('project-placeholder-styles');
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'project-placeholder-styles';
            document.head.appendChild(styleElement);
        }
        
        // Generate CSS for placeholder styling
        styleElement.textContent = `
            [project-placeholder-color="true"]::placeholder {
                color: ${cmsColor} !important;
            }
            [project-placeholder-color="true"]::-webkit-input-placeholder {
                color: ${cmsColor} !important;
            }
            [project-placeholder-color="true"]::-moz-placeholder {
                color: ${cmsColor} !important;
            }
            [project-placeholder-color="true"]:-ms-input-placeholder {
                color: ${cmsColor} !important;
            }
        `;
        
    }
}

// Try to run immediately
applyProjectColors();

// Also run when DOM is fully loaded as backup
document.addEventListener("DOMContentLoaded", applyProjectColors);
