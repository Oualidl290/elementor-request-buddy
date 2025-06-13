
// WordPress integration utilities
export interface WordPressConfig {
  projectId: string;
  userRole?: 'client' | 'designer';
}

export interface PassportMessage {
  type: 'lef-passport-ready' | 'lef-role-selected' | 'lef-widget-ready';
  widget?: 'client' | 'designer';
  role?: 'client' | 'designer';
  projectId?: string;
  data?: any;
}

export const getProjectIdFromWordPress = (): string | null => {
  // First try to get from the widget container data attribute
  const widgetContainer = document.getElementById('lef-designer-root') || 
                         document.getElementById('lef-client-root') ||
                         document.querySelector('[data-project-id]');
  
  const projectId = widgetContainer?.dataset?.projectId;
  
  if (projectId) {
    console.log('Found project ID from WordPress widget container:', projectId);
    return projectId;
  }
  
  console.warn('No project ID found in WordPress container');
  return null;
};

export const getUserRoleFromWordPress = (): 'client' | 'designer' | null => {
  // Check widget container for role information
  const widgetContainer = document.getElementById('lef-designer-root') || 
                         document.getElementById('lef-client-root') ||
                         document.querySelector('[data-user-role]');
  
  const role = widgetContainer?.dataset?.userRole as 'client' | 'designer';
  
  if (role) {
    console.log('Found user role from WordPress:', role);
    return role;
  }
  
  // Fallback: determine role from container ID
  if (document.getElementById('lef-designer-root')) {
    return 'designer';
  } else if (document.getElementById('lef-client-root')) {
    return 'client';
  }
  
  console.warn('No user role found in WordPress container');
  return null;
};

export const sendMessageToWordPress = (message: PassportMessage) => {
  console.log('Sending message to WordPress:', message);
  
  // Send to current window
  window.postMessage(message, '*');
  
  // Send to parent window if in iframe
  if (window.parent && window.parent !== window) {
    window.parent.postMessage(message, '*');
  }
  
  // Send to top window if nested
  if (window.top && window.top !== window) {
    window.top.postMessage(message, '*');
  }
};

export const confirmInitializationToWordPress = (projectId: string, role: 'client' | 'designer') => {
  console.log('Confirming Lovable App ready state to WordPress');
  
  sendMessageToWordPress({
    type: 'lef-widget-ready',
    widget: role,
    projectId: projectId,
    data: {
      timestamp: new Date().toISOString(),
      status: 'initialized'
    }
  });
};

export const listenForPassportMessages = (callback: (message: PassportMessage) => void) => {
  const messageHandler = (event: MessageEvent) => {
    // Only process messages with the expected structure
    if (event.data && typeof event.data === 'object' && event.data.type) {
      const message = event.data as PassportMessage;
      
      // Filter for LEF-related messages
      if (message.type.startsWith('lef-')) {
        console.log('Received Passport message:', message);
        callback(message);
      }
    }
  };
  
  window.addEventListener('message', messageHandler);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('message', messageHandler);
  };
};

export const initializeWordPressContext = (): WordPressConfig | null => {
  const projectId = getProjectIdFromWordPress();
  const userRole = getUserRoleFromWordPress();
  
  if (!projectId) {
    console.error('Missing project ID for Lovable App initialization');
    return null;
  }
  
  console.log('Initializing Lovable App with:', { projectId, userRole });
  
  // Confirm ready state to WordPress
  if (userRole) {
    confirmInitializationToWordPress(projectId, userRole);
  }
  
  return {
    projectId,
    userRole
  };
};

// WordPress Bridge compatibility functions
export const initializePassportBridge = () => {
  console.log('Initializing Passport Portal Bridge');
  
  // Listen for role selection from Passport Portal
  const cleanup = listenForPassportMessages((message) => {
    switch (message.type) {
      case 'lef-role-selected':
        console.log('Role selected in Passport Portal:', message.role);
        // WordPress should handle showing the appropriate widget
        break;
      case 'lef-passport-ready':
        console.log('Passport Portal is ready');
        break;
    }
  });
  
  return cleanup;
};
