import localforage from 'localforage';

export const setItem = async (key, value) => localforage.setItem(key, value);
export const getItem = async (key) => localforage.getItem(key);
export const removeItem = async (key) => localforage.removeItem(key);
export const clearStorage = async () => localforage.clear();
