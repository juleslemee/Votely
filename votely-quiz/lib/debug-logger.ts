// Debug logging utility that only logs when debug mode is active
// This prevents console spam for regular users

let isDebugModeActive = false;
let debugLogCallback: ((level: string, message: string) => void) | null = null;

// Check if debug mode is active (from URL params)
if (typeof window !== 'undefined') {
  const urlParams = new URLSearchParams(window.location.search);
  isDebugModeActive = urlParams.get('debug') === 'true';
}

export const setDebugMode = (active: boolean) => {
  isDebugModeActive = active;
};

export const setDebugLogCallback = (callback: (level: string, message: string) => void) => {
  debugLogCallback = callback;
};

export const debugLog = (message: string, ...args: any[]) => {
  if (!isDebugModeActive) return;
  
  const fullMessage = args.length > 0 
    ? `${message} ${args.map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg)).join(' ')}`
    : message;
    
  console.log(fullMessage);
  
  // Also send to debug panel if callback is set
  if (debugLogCallback) {
    debugLogCallback('info', fullMessage);
  }
};

export const debugWarn = (message: string, ...args: any[]) => {
  if (!isDebugModeActive) return;
  
  const fullMessage = args.length > 0 
    ? `${message} ${args.map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg)).join(' ')}`
    : message;
    
  console.warn(fullMessage);
  
  if (debugLogCallback) {
    debugLogCallback('warn', fullMessage);
  }
};

export const debugError = (message: string, ...args: any[]) => {
  if (!isDebugModeActive) return;
  
  const fullMessage = args.length > 0 
    ? `${message} ${args.map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg)).join(' ')}`
    : message;
    
  console.error(fullMessage);
  
  if (debugLogCallback) {
    debugLogCallback('error', fullMessage);
  }
};

// Check if debug mode is currently active
export const isDebugMode = () => isDebugModeActive;