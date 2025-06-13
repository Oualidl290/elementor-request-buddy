
import { initializeWordPressContext } from './wordpressIntegration';

// DOM content loaded handler for WordPress integration
export const initializeDOMHandlers = () => {
  document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing Designer Panel');
    
    // Get project ID from parent container
    const projectId = document.getElementById('lef-designer-root')?.dataset?.projectId;
    
    if (projectId) {
      console.log('Initializing Designer Panel with project ID:', projectId);
      
      // Initialize the WordPress context
      const config = initializeWordPressContext();
      
      if (config) {
        console.log('Designer Panel initialization successful');
        
        // Additional WordPress-specific initialization can go here
        // For example, setting up message listeners for WordPress communication
        setupWordPressMessageListeners();
      }
    } else {
      console.warn('No project ID found in WordPress container, falling back to user profile');
    }
  });
};

// Set up message listeners for WordPress communication
const setupWordPressMessageListeners = () => {
  window.addEventListener('message', (event) => {
    // Only listen to messages from trusted origins in production
    // For development, we'll log all messages for debugging
    console.log('Received message from WordPress:', event.data);
    
    if (event.data.type === 'lef-config-update') {
      console.log('WordPress configuration update received:', event.data);
      // Handle configuration updates from WordPress if needed
    }
  });
};

// Initialize DOM handlers when this module is imported
initializeDOMHandlers();
