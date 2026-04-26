export interface UsageStatsAdapter {
  isAvailable(): Promise<boolean>;
  getStatusLabel(): Promise<'demo' | 'requires-permission' | 'ready'>;
}

export const usageStatsAdapter: UsageStatsAdapter = {
  async isAvailable() {
    return false;
  },
  async getStatusLabel() {
    return 'requires-permission';
  },
};
