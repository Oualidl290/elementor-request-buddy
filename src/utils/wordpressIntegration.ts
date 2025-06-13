
// WordPress integration utilities
export interface WordPressConfig {
  projectId: string;
}

export const getProjectIdFromWordPress = (): string | null => {
  // Get project ID from parent container data attribute
  const projectId = document.getElementById('lef-designer-root')?.dataset?.projectId;
  
  if (projectId) {
    console.log('Found project ID from WordPress:', projectId);
    return projectId;
  }
  
  console.warn('No project ID found in WordPress container');
  return null;
};

export const confirmInitializationToWordPress = (projectId: string) => {
  console.log('Confirming Designer Panel ready state to WordPress');
  
  // Send ready confirmation to WordPress
  window.postMessage({
    type: 'lef-widget-ready',
    widget: 'designer',
    projectId: projectId
  }, '*');
  
  // Also try parent window in case we're in an iframe
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({
      type: 'lef-widget-ready',
      widget: 'designer',
      projectId: projectId
    }, '*');
  }
};

export const initializeWordPressContext = (): WordPressConfig | null => {
  const projectId = getProjectIdFromWordPress();
  
  if (!projectId) {
    console.error('Missing project ID for Designer Panel');
    return null;
  }
  
  console.log('Initializing Designer Panel with project ID:', projectId);
  
  // Confirm ready state to WordPress
  confirmInitializationToWordPress(projectId);
  
  return {
    projectId
  };
};
