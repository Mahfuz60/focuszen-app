import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, StorageKey, STORAGE_VERSION } from '../constants/storage';
import { safeParseJson, safeStringifyJson } from './json';
import { getAllStorageKeys } from './keys';
import { LocalExportPayload } from '../types/models';

export { STORAGE_KEYS, STORAGE_VERSION };

export async function readStorageItem<T>(key: StorageKey, fallback: T): Promise<T> {
  const value = await AsyncStorage.getItem(key);
  return safeParseJson(value, fallback);
}

export async function writeStorageItem<T>(key: StorageKey, value: T) {
  await AsyncStorage.setItem(key, safeStringifyJson(value));
}

export async function resetAllLocalData() {
  await AsyncStorage.multiRemove(getAllStorageKeys());
}

export async function exportLocalData(): Promise<LocalExportPayload> {
  const keys = getAllStorageKeys();
  const entries = await AsyncStorage.multiGet(keys);
  const data = entries.reduce<Record<string, unknown>>((accumulator, [key, value]) => {
    accumulator[key] = safeParseJson(value, null);
    return accumulator;
  }, {});

  return {
    version: STORAGE_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  };
}

export async function importLocalData(payload: LocalExportPayload) {
  const pairs = Object.entries(payload.data).map(([key, value]) => [key, safeStringifyJson(value)] as const);
  await AsyncStorage.multiSet(pairs);
}

export async function ensureAppMeta() {
  const existing = await AsyncStorage.getItem(STORAGE_KEYS.appMeta);
  if (!existing) {
    await AsyncStorage.setItem(STORAGE_KEYS.appMeta, safeStringifyJson({ version: STORAGE_VERSION }));
  }
}
