import { STORAGE_KEYS, StorageKey } from '../constants/storage';

export function getAllStorageKeys(): StorageKey[] {
  return Object.values(STORAGE_KEYS);
}
