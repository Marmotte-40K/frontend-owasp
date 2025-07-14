// Cookie utility functions for secure token management
export const cookieUtils = {
  /**
   * Get a cookie value by name
   * @param name - Cookie name
   * @returns Cookie value or null if not found
   */
  getCookie: (name: string): string | null => {
    const cookieName = `${name}=`;
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    
    for (let cookie of cookieArray) {
      cookie = cookie.trim();
      if (cookie.indexOf(cookieName) === 0) {
        return cookie.substring(cookieName.length, cookie.length);
      }
    }
    return null;
  },

  /**
   * Set a cookie with secure attributes
   * @param name - Cookie name
   * @param value - Cookie value
   * @param options - Cookie options
   */
  setCookie: (
    name: string, 
    value: string, 
    options: {
      maxAge?: number;
      path?: string;
      secure?: boolean;
      sameSite?: 'Strict' | 'Lax' | 'None';
      httpOnly?: boolean;
    } = {}
  ): void => {
    const {
      maxAge = 900, // 15 minutes default
      path = '/',
      secure = true,
      sameSite = 'Strict'
    } = options;

    let cookieString = `${name}=${value}; path=${path}`;
    
    if (maxAge) {
      cookieString += `; max-age=${maxAge}`;
    }
    
    if (secure) {
      cookieString += '; secure';
    }
    
    if (sameSite) {
      cookieString += `; samesite=${sameSite}`;
    }

    // Note: HttpOnly cannot be set from JavaScript for security reasons
    // It must be set by the server
    document.cookie = cookieString;
  },

  /**
   * Remove a cookie by setting it to expire
   * @param name - Cookie name
   * @param path - Cookie path
   */
  removeCookie: (name: string, path: string = '/'): void => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; SameSite=Strict; Secure`;
  },

  /**
   * Check if cookies are enabled
   * @returns Boolean indicating if cookies are enabled
   */
  areCookiesEnabled: (): boolean => {
    const testCookie = 'cookieTest';
    document.cookie = `${testCookie}=test; SameSite=Strict; Secure`;
    const enabled = document.cookie.indexOf(testCookie) !== -1;
    
    // Clean up test cookie
    if (enabled) {
      cookieUtils.removeCookie(testCookie);
    }
    
    return enabled;
  },

  /**
   * Get all cookies as an object
   * @returns Object with cookie names as keys and values as values
   */
  getAllCookies: (): Record<string, string> => {
    const cookies: Record<string, string> = {};
    const decodedCookie = decodeURIComponent(document.cookie);
    
    if (!decodedCookie) return cookies;
    
    const cookieArray = decodedCookie.split(';');
    
    for (const cookie of cookieArray) {
      const [name, ...valueParts] = cookie.trim().split('=');
      if (name && valueParts.length > 0) {
        cookies[name] = valueParts.join('=');
      }
    }
    
    return cookies;
  }
};

// Token-specific cookie utilities for HTTP-only cookies
export const tokenUtils = {
  /**
   * Check if user might be authenticated
   * Since HTTP-only cookies can't be read by JavaScript, we'll use a different approach
   * We'll rely on the auth state in React context and server API calls
   */
  isAuthenticated: (): boolean => {
    // With HTTP-only cookies, we can't directly check for tokens
    // We'll rely on the auth state in React context
    // This method will be used only as a fallback
    return false; // Always return false since we can't read HTTP-only cookies
  },

  /**
   * Get the authentication token from cookies
   * @returns null since HTTP-only cookies can't be accessed
   */
  getAuthToken: (): string | null => {
    // HTTP-only cookies cannot be accessed via JavaScript (this is a security feature)
    // The server automatically includes them in requests
    return null;
  },

  /**
   * Get the refresh token from cookies
   * @returns null since HTTP-only cookies can't be accessed
   */
  getRefreshToken: (): string | null => {
    // HTTP-only cookies cannot be accessed via JavaScript (this is a security feature)
    // The server automatically includes them in requests
    return null;
  },

  /**
   * Clear authentication tokens
   * For HTTP-only cookies, this should be done by the server on logout
   */
  clearAuthTokens: (): void => {
    // HTTP-only cookies are managed by the server
    // The server should clear them on logout via the /auth/logout endpoint
    // We can't clear them from the client side (which is good for security)
  }
}