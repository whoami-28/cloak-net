/**
 * CloakNet - Storage Helper Wrapper
 */
import { DEFAULT_CONFIG } from './config.js';

export const storage = {
  async get() {
    return new Promise((resolve) => {
      chrome.storage.local.get(null, (items) => {
        if (!items || Object.keys(items).length === 0) {
          // Инициализация дефолтными значениями при первом запуске
          chrome.storage.local.set(DEFAULT_CONFIG, () => resolve(DEFAULT_CONFIG));
        } else {
          // Слияние со свежим DEFAULT_CONFIG на случай добавления новых полей
          resolve({ ...DEFAULT_CONFIG, ...items });
        }
      });
    });
  },

  async set(data) {
    return new Promise((resolve) => {
      chrome.storage.local.set(data, () => resolve());
    });
  },

  async update(key, val) {
    const current = await this.get();
    current[key] = val;
    await this.set(current);
    return current;
  }
};
