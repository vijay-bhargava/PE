/**
 * Merges multiple class names into a single string with memoization
 * @param {...any} args - Class names as strings, numbers, booleans, arrays, or objects
 * @returns {string} Combined class names separated by spaces
 * 
 * @example
 * // Basic usage
 * classNames('btn', 'btn-primary') // 'btn btn-primary'
 * 
 * // Conditional classes
 * classNames('btn', isActive && 'active', isDisabled && 'disabled')
 * 
 * // Object syntax
 * classNames('btn', { 'btn-primary': isPrimary, 'btn-large': isLarge })
 * 
 * // Mixed types
 * classNames('btn', null, undefined, false, 0, '', 'active', ['nested', 'classes'])
 * 
 * // Nested arrays
 * classNames('btn', ['btn-primary', 'btn-large'])
 */
function classNames(...args) {
  // Create a cache key from the arguments
  const cacheKey = createCacheKey(args);
  
  // Check if result is already cached
  if (classNames.cache.has(cacheKey)) {
    return classNames.cache.get(cacheKey);
  }
  
  const classes = [];
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (!arg) continue; // Skip null, undefined, false, 0, ""
    
    if (typeof arg === 'string') {
      // Handle string arguments
      if (arg.trim()) {
        classes.push(arg.trim());
      }
    } else if (typeof arg === 'number') {
      // Handle number arguments (convert to string)
      classes.push(String(arg));
    } else if (Array.isArray(arg)) {
      // Handle array arguments recursively
      const innerClasses = classNames(...arg);
      if (innerClasses) {
        classes.push(innerClasses);
      }
    } else if (typeof arg === 'object') {
      // Handle object arguments (key-value pairs)
      for (const key in arg) {
        if (arg.hasOwnProperty(key) && arg[key]) {
          classes.push(key);
        }
      }
    }
  }
  
  const result = classes.join(' ');
  
  // Cache the result
  classNames.cache.set(cacheKey, result);
  
  // Limit cache size to prevent memory leaks
  if (classNames.cache.size > 1000) {
    const firstKey = classNames.cache.keys().next().value;
    classNames.cache.delete(firstKey);
  }
  
  return result;
}

/**
 * Creates a cache key from function arguments
 * @param {any[]} args - Function arguments
 * @returns {string} Cache key
 */
function createCacheKey(args) {
  return args.map(arg => {
    if (arg === null) return 'null';
    if (arg === undefined) return 'undefined';
    if (typeof arg === 'boolean') return arg.toString();
    if (typeof arg === 'number') return arg.toString();
    if (typeof arg === 'string') return arg;
    if (Array.isArray(arg)) return `[${arg.map(createCacheKey).join(',')}]`;
    if (typeof arg === 'object') {
      const keys = Object.keys(arg).sort();
      return `{${keys.map(key => `${key}:${arg[key]}`).join(',')}}`;
    }
    return String(arg);
  }).join('|');
}

// Initialize cache as a Map on the function
classNames.cache = new Map();

// Method to clear the cache if needed
classNames.clearCache = function() {
  this.cache.clear();
};

// Method to get cache size for debugging
classNames.getCacheSize = function() {
  return this.cache.size;
};

export default classNames;