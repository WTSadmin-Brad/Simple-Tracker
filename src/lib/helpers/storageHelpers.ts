/**
 * Local storage helpers
 * 
 * @source directory-structure.md - "Shared Utilities" section
 */

/**
 * Check if localStorage is available
 * 
 * @returns Whether localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Get item from localStorage with expiration check
 * 
 * @param key - Storage key
 * @returns Stored value or null if not found or expired
 */
export function getStorageItem<T>(key: string): T | null {
  if (!isLocalStorageAvailable()) {
    return null;
  }
  
  const item = localStorage.getItem(key);
  if (!item) {
    return null;
  }
  
  try {
    const { value, expiry } = JSON.parse(item);
    
    // Check if the item has expired
    if (expiry && new Date().getTime() > expiry) {
      localStorage.removeItem(key);
      return null;
    }
    
    return value as T;
  } catch (e) {
    // If the item is not in the expected format, return it as is
    return JSON.parse(item) as T;
  }
}

/**
 * Set item in localStorage with optional expiration
 * 
 * @param key - Storage key
 * @param value - Value to store
 * @param expiryHours - Optional expiration time in hours
 */
export function setStorageItem<T>(
  key: string,
  value: T,
  expiryHours?: number
): void {
  if (!isLocalStorageAvailable()) {
    return;
  }
  
  const item = expiryHours
    ? {
        value,
        expiry: new Date().getTime() + expiryHours * 60 * 60 * 1000,
      }
    : value;
  
  localStorage.setItem(key, JSON.stringify(item));
}

/**
 * Remove item from localStorage
 * 
 * @param key - Storage key
 */
export function removeStorageItem(key: string): void {
  if (!isLocalStorageAvailable()) {
    return;
  }
  
  localStorage.removeItem(key);
}

/**
 * Clear all items from localStorage
 */
export function clearStorage(): void {
  if (!isLocalStorageAvailable()) {
    return;
  }
  
  localStorage.clear();
}

/**
 * Get all expired items from localStorage
 * 
 * @returns Array of expired storage keys
 */
export function getExpiredItems(): string[] {
  if (!isLocalStorageAvailable()) {
    return [];
  }
  
  const expiredKeys: string[] = [];
  const now = new Date().getTime();
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    
    const item = localStorage.getItem(key);
    if (!item) continue;
    
    try {
      const { expiry } = JSON.parse(item);
      if (expiry && now > expiry) {
        expiredKeys.push(key);
      }
    } catch (e) {
      // Ignore items that are not in the expected format
    }
  }
  
  return expiredKeys;
}

/**
 * Remove all expired items from localStorage
 * 
 * @returns Number of removed items
 */
export function removeExpiredItems(): number {
  const expiredKeys = getExpiredItems();
  
  expiredKeys.forEach((key) => {
    localStorage.removeItem(key);
  });
  
  return expiredKeys.length;
}

/**
 * Get wizard state from localStorage
 * 
 * @param key - Storage key for wizard state
 * @returns Wizard state or null if not found or expired
 */
export function getWizardState<T>(key = 'ticket-wizard-state'): T | null {
  return getStorageItem<T>(key);
}

/**
 * Save wizard state to localStorage with expiration
 * 
 * @param state - Wizard state to save
 * @param key - Storage key for wizard state
 * @param expiryHours - Expiration time in hours (default: 24)
 */
export function saveWizardState<T>(
  state: T,
  key = 'ticket-wizard-state',
  expiryHours = 24
): void {
  setStorageItem(key, state, expiryHours);
}

/**
 * Clear wizard state from localStorage
 * 
 * @param key - Storage key for wizard state
 */
export function clearWizardState(key = 'ticket-wizard-state'): void {
  removeStorageItem(key);
}
