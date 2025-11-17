/**
 * Google OAuth helper functions
 * 
 * Includes both Google Identity Services (button) and OAuth 2.0 redirect flow
 */

/**
 * OAuth 2.0 Redirect Flow - More reliable alternative to button
 * This redirects to Google's OAuth page, avoiding iframe validation issues
 */
export const initiateGoogleOAuthRedirect = (clientId: string, redirectUri: string = `${window.location.origin}/login`) => {
  if (!clientId) {
    throw new Error('Google Client ID is not configured');
  }

  // Generate state for CSRF protection
  const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  sessionStorage.setItem('google_oauth_state', state);

  // OAuth 2.0 parameters
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state: state,
    access_type: 'offline',
    prompt: 'select_account',
  });

  // Use full page redirect (not popup) to avoid COOP issues
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  console.log('🔗 Initiating Google OAuth redirect flow...');
  console.log('  - Auth URL:', authUrl);
  // Full page redirect - this avoids COOP policy issues
  window.location.href = authUrl;
};

/**
 * Handle OAuth callback - called when Google redirects back
 */
export const handleGoogleOAuthCallback = async (code: string, state: string): Promise<string> => {
  // Verify state
  const savedState = sessionStorage.getItem('google_oauth_state');
  if (!savedState || savedState !== state) {
    throw new Error('Invalid OAuth state - possible CSRF attack');
  }
  sessionStorage.removeItem('google_oauth_state');

  // Exchange code for token via backend
  // The backend will handle the token exchange
  return code;
};

export const loadGoogleScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.google?.accounts) {
      resolve();
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
    if (existingScript) {
      // Wait for it to load
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Google script')));
      return;
    }

    // Create and load script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      // Wait a bit for Google API to be fully initialized
      setTimeout(() => {
        if (window.google?.accounts) {
          resolve();
        } else {
          reject(new Error('Google API not available after script load'));
        }
      }, 100);
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load Google Identity Services script'));
    };

    document.head.appendChild(script);

    // Timeout after 10 seconds
    setTimeout(() => {
      reject(new Error('Google script loading timeout'));
    }, 10000);
  });
};

export const initializeGoogleSignIn = (clientId: string, callback: (credential: string) => void) => {
  if (!clientId) {
    throw new Error('Google Client ID is not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file.');
  }

  if (!window.google?.accounts?.id) {
    throw new Error('Google Identity Services not loaded');
  }

  // CRITICAL: Check if app is running inside an iframe
  const isInIframe = (() => {
    try {
      return window.self !== window.top;
    } catch (e) {
      // Cross-origin iframe - can't access window.top
      return true;
    }
  })();

  if (isInIframe) {
    const errorMsg = '❌ CRITICAL: App is running inside an iframe! Google Identity Services does not work in iframes. You must run the app directly, not inside an iframe.';
    console.error(errorMsg);
    console.error('  - Current window:', window.location.href);
    console.error('  - Parent window:', window.parent !== window.self ? 'Different origin (cross-origin iframe)' : 'Same origin');
    console.error('');
    console.error('🔧 Solutions:');
    console.error('  1. Open the app directly: http://localhost:5173/login');
    console.error('  2. Do NOT embed it in an iframe');
    console.error('  3. If using a parent app, open in a new window/tab instead');
    throw new Error('Google Sign-In cannot work inside an iframe. Please open the app directly.');
  }

  // Log the current origin for debugging
  const currentOrigin = window.location.origin;
  const currentUrl = window.location.href;
  console.log('🔍 Google OAuth Debug Info:');
  console.log('  - Current origin:', currentOrigin);
  console.log('  - Full URL:', currentUrl);
  console.log('  - Client ID:', clientId);
  console.log('  - Expected origin: http://localhost:5173');
  console.log('  - Origin match:', currentOrigin === 'http://localhost:5173');
  console.log('  - Running in iframe:', isInIframe, '✅ (Good - not in iframe)');

  // Verify origin matches expected
  if (currentOrigin !== 'http://localhost:5173' && currentOrigin !== 'https://androama.com') {
    console.warn('⚠️ Warning: Current origin does not match authorized origins in Google Console');
  }

  try {
    // Initialize with explicit configuration
    const config: any = {
      client_id: clientId,
      callback: (response: any) => {
        if (response.credential) {
          callback(response.credential);
        } else {
          throw new Error('No credential received from Google');
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
      // Explicitly set the context to ensure origin is sent correctly
      context: 'signin',
      // Use popup mode explicitly
      use_fedcm_for_prompt: false,
    };
    
    console.log('🔍 Initializing Google Sign-In with config:', {
      client_id: config.client_id,
      context: config.context,
      auto_select: config.auto_select,
    });
    
    window.google.accounts.id.initialize(config);
    console.log('✅ Google Sign-In initialized successfully');
  } catch (error: any) {
    console.error('❌ Error initializing Google Sign-In:', error);
    throw error;
  }
};

export const renderGoogleButton = (elementId: string, maxRetries: number = 20): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.id) {
      reject(new Error('Google Identity Services not loaded'));
      return;
    }

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      reject(new Error('Google Client ID not configured'));
      return;
    }

    // Wait for React to fully render the DOM
    // Use requestAnimationFrame to wait for the next render cycle
    requestAnimationFrame(() => {
      // Wait for element to be available (React might not have rendered it yet)
      let retries = 0;
      const tryRender = () => {
        const element = document.getElementById(elementId);
        if (element) {
          // Clear any existing content
          element.innerHTML = '';
          
          // Make container full width with CSS
          element.style.width = '100%';
          
          try {
            // TypeScript doesn't know about renderButton, so we use any
            // We already checked window.google exists at the start of the function
            const googleAccounts = window.google?.accounts?.id;
            if (!googleAccounts) {
              reject(new Error('Google Identity Services not available'));
              return;
            }
            
            console.log('🔍 Rendering Google Sign-In button...');
            console.log('  - Element ID:', elementId);
            console.log('  - Client ID:', clientId);
            console.log('  - Current origin:', window.location.origin);
            
            // Render button with error handling
            try {
              (googleAccounts as any).renderButton(
                element,
                {
                  theme: 'outline',
                  size: 'large',
                  width: 350, // Width in pixels (will be constrained by container)
                  text: 'signin_with',
                  type: 'standard'
                }
              );
            } catch (renderError: any) {
              console.error('❌ Error during renderButton call:', renderError);
              // The error might be thrown synchronously or asynchronously
              // We'll let it propagate but log it
              throw renderError;
            }
            
            // Set up error listener for iframe errors
            // Note: The iframe might not exist immediately, so we check after a delay
            // Check multiple times to catch the iframe when it's created
            let checkCount = 0;
            const maxChecks = 10; // Check for up to 5 seconds
            const checkInterval = setInterval(() => {
              checkCount++;
              const iframe = element.querySelector('iframe');
              if (iframe) {
                clearInterval(checkInterval);
                
                // Check iframe src to see if it's loading correctly
                const iframeSrc = iframe.src || '';
                console.log('🔍 Google Sign-In iframe detected:');
                console.log('  - Iframe src:', iframeSrc.substring(0, 100) + '...');
                
                iframe.addEventListener('load', () => {
                  // Check if iframe loaded successfully
                  try {
                    // Try to access iframe content (will fail if cross-origin, which is expected)
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                    console.log('✅ Google Sign-In iframe loaded successfully');
                  } catch (e) {
                    // Cross-origin error is expected and normal - this means iframe loaded
                    console.log('✅ Google Sign-In iframe loaded (cross-origin, expected)');
                  }
                });
                
                iframe.addEventListener('error', (error) => {
                  console.error('❌ Google Sign-In iframe load error:', error);
                  console.error('  - This usually indicates a 403 error from Google');
                  console.error('  - Check Network tab for failed requests to accounts.google.com');
                });
                
                // Monitor for 403 errors via network requests
                // Note: We can't directly access iframe content, but we can check the src
                setTimeout(() => {
                  // After a delay, check if iframe is still there and has content
                  // If 403 occurred, the iframe might be empty or have an error
                  const currentSrc = iframe.src || '';
                  if (currentSrc && !currentSrc.includes('accounts.google.com')) {
                    console.warn('⚠️ Google Sign-In iframe src changed - may indicate an error');
                  }
                }, 2000);
              } else if (checkCount >= maxChecks) {
                clearInterval(checkInterval);
                console.warn('⚠️ Google Sign-In iframe not found after multiple checks');
                console.warn('  - The button may have failed to render');
                console.warn('  - Check Network tab for 403 errors to accounts.google.com/gsi/button');
              }
            }, 500); // Check every 500ms
            console.log('✅ Google Sign-In button rendered successfully');
            resolve();
          } catch (error: any) {
            console.error('❌ Error rendering Google Sign-In button:', error);
            console.error('  - Error message:', error.message);
            console.error('  - Error stack:', error.stack);
            reject(error);
          }
        } else {
          retries++;
          if (retries < maxRetries) {
            // Wait a bit longer and try again (increased delay)
            setTimeout(tryRender, 150);
          } else {
            // Last attempt: log debug info
            console.error(`Element "${elementId}" not found. Available elements:`, 
              Array.from(document.querySelectorAll('[id]')).map(el => el.id));
            reject(new Error(`Element with id "${elementId}" not found after ${maxRetries} attempts`));
          }
        }
      };

      // Start trying after a small delay to ensure DOM is ready
      setTimeout(tryRender, 50);
    });
  });
};

