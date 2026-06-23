import { v4 as uuidv4 } from 'uuid';

const PREF_KEY = 'MOVEIN_PREFERENCES';

// Returns the current preferences object from localStorage, or null
export function getLocalPreferences() {
    try {
        const raw = localStorage.getItem(PREF_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

// Saves (merges) partial preferences into localStorage
export function saveLocalPreferences(updates) {
    const existing = getLocalPreferences() || {};
    // Ensure a stable guestId exists
    if (!existing.guestId) {
        existing.guestId = uuidv4();
    }
    const merged = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(PREF_KEY, JSON.stringify(merged));
    return merged;
}

// Returns the guestId, creating one if necessary
export function getOrCreateGuestId() {
    const prefs = getLocalPreferences() || {};
    if (!prefs.guestId) {
        const guestId = uuidv4();
        saveLocalPreferences({ guestId });
        return guestId;
    }
    return prefs.guestId;
}

export function clearLocalPreferences() {
    localStorage.removeItem(PREF_KEY);
}

export function isPreferenceComplete(prefs) {
    return prefs && prefs.purpose && prefs.completedAt;
}
