/**
 * Subdomain Helper Utility
 * Handles subdomain extraction and validation for multi-tenant applications
 */

/**
 * Extracts the subdomain from the current hostname
 * @returns {string} The subdomain or empty string for main domain
 * 
 * Examples:
 * - buyer.procurengine.io -> 'buyer'
 * - supplier.procurengine.io -> 'supplier'
 * - procurengine.io -> ''
 * - localhost:3001 -> ''
 */
export const getSubdomain = () => {
    const hostname = window.location.hostname;
    
    // Handle localhost and IP addresses
    if (hostname === 'localhost' || /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
        return '';
    }
    
    const parts = hostname.split('.');
    
    // If hostname has more than 2 parts (e.g., buyer.procurengine.io)
    // Return the first part as subdomain
    if (parts.length > 2) {
        return parts[0];
    }
    
    // No subdomain for main domain (procurengine.io)
    return '';
};

/**
 * Gets the customer identifier from URL
 * Priority: subdomain > path parameter
 * @param {string} pathSuffix - The suffix from URL path parameter
 * @returns {string} The customer identifier
 */
export const getCustomerIdentifier = (pathSuffix = '') => {
    const subdomain = getSubdomain();
    
    // Subdomain takes precedence over path parameter
    if (subdomain) {
        return subdomain;
    }
    
    // Fallback to path parameter
    return pathSuffix || '';
};

/**
 * Checks if the current session is for a different customer
 * @param {string} storedSuffix - The suffix stored in session/cookies
 * @param {string} currentSuffix - The current customer suffix
 * @returns {boolean} True if customer mismatch detected
 */
export const isCustomerMismatch = (storedSuffix, currentSuffix) => {
    if (!storedSuffix || !currentSuffix) {
        return false;
    }
    return storedSuffix !== currentSuffix;
};

/**
 * Gets the base domain for cookie storage
 * @returns {string} The base domain (e.g., '.procurengine.io')
 */
export const getCookieDomain = () => {
    const hostname = window.location.hostname;
    
    // For localhost, return undefined (default)
    if (hostname === 'localhost' || /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
        return undefined;
    }
    
    const parts = hostname.split('.');
    
    // Return the root domain (e.g., '.procurengine.io')
    // This allows cookies to be shared across subdomains
    if (parts.length >= 2) {
        return '.' + parts.slice(-2).join('.');
    }
    
    return undefined;
};

/**
 * Builds the login redirect URL based on customer suffix
 * @param {string} suffix - The customer suffix
 * @returns {string} The login URL
 */
export const buildLoginUrl = (suffix) => {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    // For localhost, use path-based routing
    if (hostname === 'localhost' || /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
        const baseUrl = `${protocol}//${hostname}${port ? ':' + port : ''}`;
        return suffix ? `${baseUrl}/${suffix}` : baseUrl;
    }
    
    // For production, use subdomain-based routing
    const parts = hostname.split('.');
    const baseDomain = parts.length >= 2 ? parts.slice(-2).join('.') : hostname;
    const subdomainUrl = suffix ? `${protocol}//${suffix}.${baseDomain}` : `${protocol}//${baseDomain}`;
    
    return subdomainUrl;
};

/**
 * Navigates to the login page for a specific customer
 * @param {string} suffix - The customer suffix
 */
export const navigateToLogin = (suffix) => {
    const loginUrl = buildLoginUrl(suffix);
    window.location.href = loginUrl;
};

/**
 * Checks if running on localhost
 * @returns {boolean}
 */
export const isLocalhost = () => {
    const hostname = window.location.hostname;
    return hostname === 'localhost' || /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
};
