import { STORAGE_VERSION } from '../constants/storage';

export type AppMeta = {
  version: number;
};

export function migrateAppVersion(meta?: AppMeta): AppMeta {
  return {
    version: meta?.version ?? STORAGE_VERSION,
  };
}
