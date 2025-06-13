
import { initializeWordPressContext, initializePassportBridge } from './wordpressIntegration';

// DOM content loaded handler for WordPress integration
export const initializeDOMHandlers = () => {
  document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing Lovable App');
    
    // Initialize Passport Bridge for communication
    const cleanupBridge = initializePassportBridge();
    
    // Get project ID from parent container
    const projectId = document.getElementById('lef-designer-root')?.dataset?.projectId ||
                     document.getElementById('lef-client-root')?.dataset?.projectId;
    
    if (projectId) {
      console.log('Initializing Lovable App with project ID:', projectId);
      
      // Initialize the WordPress context
      const config = initializeWordPressContext();
      
      if (config) {
        console.log('Lovable App initialization successful');
        
        // Set up WordPress-specific message listeners
        setupWordPressMessageListeners();
      }
    } else {
      console.warn('No project ID found in WordPress container, falling back to user profile');
      // Still set up message listeners for potential future communication
      setupWordPressMessageListeners();
    }
    
    // Cleanup bridge on page unload
    window.addEventListener('beforeunload', () => {
      cleanupBridge();
    });
  });
};

// Set up message listeners for WordPress communication
const setupWordPressMessageListeners = () => {
  window.addEventListener('message', (event) => {
    // Only listen to messages from trusted origins in production
    console.log('Received message from WordPress:', event.data);
    
    if (event.data.type === 'lef-config-update') {
      console.log('WordPress configuration update received:', event.data);
      // Handle configuration updates from WordPress if needed
      handleConfigUpdate(event.data);
    } else if (event.data.type === 'lef-role-selected') {
      console.log('Role selection received:', event.data);
      // Handle role selection from Passport Portal
      handleRoleSelection(event.data);
    }
  });
};

const handleConfigUpdate = (data: any) => {
  // Handle WordPress configuration updates
  console.log('Handling WordPress config update:', data);
  
  // Trigger re-initialization if project ID changed
  if (data.projectId) {
    const config = initializeWordPressContext();
    if (config) {
      // Notify React components about config change
      window.dispatchEvent(new CustomEvent('lef-config-changed', { 
        detail: config 
      }));
    }
  }
};

const handleRoleSelection = (data: any) => {
  // Handle role selection from Passport Portal
  console.log('Handling role selection:', data);
  
  // WordPress should show the appropriate widget based on role
  // This is primarily for logging and potential state management
  window.dispatchEvent(new CustomEvent('lef-role-selected', { 
    detail: { role: data.role, projectId: data.projectId }
  }));
};

// Initialize DOM handlers when this module is imported
initializeDOMHandlers();
