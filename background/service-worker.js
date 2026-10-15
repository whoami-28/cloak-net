/**
 * CloakNet - Background Service Worker (Manifest V3)
 * Главный координатор расширения: обработка событий, прокси, авторизация и бейджи
 */

import { storage } from '../shared/storage.js';
import { getLocationById } from '../shared/locations.js';
import { ProxyEngine } from './proxy-engine.js';
import { WebRTCBlocker } from './webrtc-blocker.js';

// Инициализация при установке расширения
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('[CloakNet] Extension installed / updated:', details.reason);
  const cfg = await storage.get();
  updateBadge(cfg.isConnected);
});

// Слушатель запросов авторизации для прокси с логином/паролем
if (chrome.webRequest && chrome.webRequest.onAuthRequired) {
  chrome.webRequest.onAuthRequired.addListener(
    (details, callback) => {
      storage.get().then((cfg) => {
        const loc = getLocationById(cfg.selectedLocationId);
        if (loc && loc.server && loc.server.username && loc.server.password) {
          callback({
            authCredentials: {
              username: loc.server.username,
              password: loc.server.password
            }
          });
        } else {
          callback({});
        }
      });
    },
    { urls: ['<all_urls>'] },
    ['asyncBlocking']
  );
}

// Обработка сообщений из Popup и Options
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message)
    .then((result) => sendResponse({ success: true, data: result }))
    .catch((err) => {
      console.error('[CloakNet] handleMessage error:', err);
      sendResponse({ success: false, error: err.message || String(err) });
    });
  return true; // Асинхронный ответ
});

async function handleMessage(msg) {
  const cfg = await storage.get();

  switch (msg.action) {
    case 'CONNECT': {
      const loc = getLocationById(cfg.selectedLocationId);
      await ProxyEngine.applyProxy(cfg, loc);

      if (cfg.security.blockWebRTC) {
        await WebRTCBlocker.enable();
      }

      cfg.isConnected = true;
      cfg.stats.connectedAt = Date.now();
      await storage.set(cfg);
      updateBadge(true);

      const hasWorker = !!(cfg.cloudflare && cfg.cloudflare.workerUrl);

      // Фоновое обновление информации об IP
      fetchCurrentIp(cfg).then(async (ipData) => {
        if (ipData) {
          cfg.stats.currentIp = ipData.ip;
          cfg.stats.currentCountry = ipData.country;
          await storage.set(cfg);
        }
      }).catch(console.warn);

      return { 
        isConnected: true, 
        location: loc, 
        needsWorkerSetup: !hasWorker 
      };
    }

    case 'DISCONNECT': {
      await ProxyEngine.clearProxy();
      await WebRTCBlocker.disable();

      cfg.isConnected = false;
      cfg.stats.connectedAt = null;
      await storage.set(cfg);
      updateBadge(false);

      return { isConnected: false };
    }

    case 'SET_LOCATION': {
      cfg.selectedLocationId = msg.locationId;
      await storage.set(cfg);

      const loc = getLocationById(msg.locationId);

      // Если уже подключены — перезапускаем прокси на новую локацию
      if (cfg.isConnected) {
        await ProxyEngine.applyProxy(cfg, loc);
        // Запрос обновленного IP
        fetchCurrentIp(cfg).then(async (ipData) => {
          if (ipData) {
            cfg.stats.currentIp = ipData.ip;
            cfg.stats.currentCountry = ipData.country;
            await storage.set(cfg);
          }
        }).catch(console.warn);
      }

      return { selectedLocationId: msg.locationId, location: loc };
    }

    case 'GET_STATUS': {
      const loc = getLocationById(cfg.selectedLocationId);
      return {
        isConnected: cfg.isConnected,
        location: loc,
        config: cfg
      };
    }

    case 'CHECK_IP': {
      const ipInfo = await fetchCurrentIp(cfg);
      return ipInfo;
    }

    case 'SAVE_CONFIG': {
      const updated = { ...cfg, ...msg.config };
      await storage.set(updated);
      if (updated.isConnected) {
        const loc = getLocationById(updated.selectedLocationId);
        await ProxyEngine.applyProxy(updated, loc);
      }
      return updated;
    }

    default:
      throw new Error(`Unknown action: ${msg.action}`);
  }
}

/**
 * Определение текущего IP и страны
 */
async function fetchCurrentIp(cfg) {
  // 1. Если настроен Cloudflare Worker — запрашиваем через него его /ip
  if (cfg.mode === 'cloudflare' && cfg.cloudflare?.workerUrl && cfg.isConnected) {
    try {
      const workerUrl = cfg.cloudflare.workerUrl.replace(/\/+$/, '') + '/ip';
      const res = await fetch(workerUrl, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        return {
          ip: data.ip,
          country: data.country,
          city: data.city,
          colo: data.colo
        };
      }
    } catch (e) {
      console.warn('[CloakNet] Failed to get IP from worker, falling back to public API:', e);
    }
  }

  // 2. Fallback: быстрый публичный API ipify
  try {
    const res = await fetch('https://api.ipify.org?format=json', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return {
        ip: data.ip,
        country: 'Auto',
        city: 'Global'
      };
    }
  } catch (e) {
    console.warn('[CloakNet] IP lookup error:', e);
  }

  return { ip: '127.0.0.1', country: 'Local', city: 'Private' };
}

/**
 * Обновление визуального индикатора (бейдж на иконке расширения)
 */
function updateBadge(isConnected) {
  if (isConnected) {
    chrome.action.setBadgeText({ text: 'ON' });
    chrome.action.setBadgeBackgroundColor({ color: '#00E6A0' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}
