export interface SafeBrowsingAdapter {
  isAvailable(): Promise<boolean>;
  getStatusLabel(): Promise<'demo' | 'requires-permission' | 'ready'>;
}

export const safeBrowsingAdapter: SafeBrowsingAdapter = {
  async isAvailable() {
    return false;
  },
  async getStatusLabel() {
    return 'requires-permission';
  },
};
