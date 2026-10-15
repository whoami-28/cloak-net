/**
 * CloakNet - Default Configuration
 */

export const DEFAULT_CONFIG = {
  // Режим подключения: 'warp' (Cloudflare WARP SOCKS5) | 'custom' (Свой SOCKS5/HTTPS) | 'cloudflare' (Worker)
  connectionType: 'warp',
  
  // Статус подключения
  isConnected: false,
  
  // Текущая выбранная локация
  selectedLocationId: 'auto-cf',
  
  // Настройки Cloudflare WARP (SOCKS5 локальный шлюз)
  warp: {
    host: '127.0.0.1',
    port: '40000'
  },

  // Настройки пользовательского SOCKS5 / HTTPS прокси
  customProxy: {
    protocol: 'socks5', // 'socks5' | 'https' | 'http'
    host: '',
    port: '',
    username: '',
    password: ''
  },
  
  // Настройки Cloudflare Worker
  cloudflare: {
    workerUrl: '',
    token: 'cloaknet-secret-key-2026',
    autoFallback: true
  },
  
  // Защита и приватность
  security: {
    blockWebRTC: true,          // Безопасная защита от утечки IP (default_public_interface_only)
    bypassSearchEngines: true,  // Прямой доступ к поисковикам (Google, Yandex) без капчи и задержек
    adBlocker: true,            // Блокировка рекламы/трекеров
    dnsLeakProtection: true     // Защита от утечки DNS
  },
  
  // Список исключений (Split Tunneling: эти сайты открываются напрямую)
  bypassList: [
    'google.com',
    'www.google.com',
    'google.ru',
    'gstatic.com',
    'googleapis.com',
    '1e100.net',
    'gosuslugi.ru',
    'nalog.gov.ru',
    'mos.ru',
    'sberbank.ru',
    'tbank.ru',
    'yandex.ru',
    'ya.ru',
    'vk.com',
    'kinopoisk.ru',
    '127.0.0.1',
    'localhost'
  ],
  
  // Статистика сессии
  stats: {
    connectedAt: null,
    currentIp: null,
    currentCountry: null
  }
};
