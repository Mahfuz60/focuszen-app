export interface AccessibilityBlockAdapter {
  isAvailable(): Promise<boolean>;
  getStatusLabel(): Promise<'demo' | 'requires-permission' | 'ready'>;
}

export const accessibilityBlockAdapter: AccessibilityBlockAdapter = {
  async isAvailable() {
    return false;
  },
  async getStatusLabel() {
    return 'requires-permission';
  },
};
