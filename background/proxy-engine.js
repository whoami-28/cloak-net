/**
 * CloakNet - Proxy Engine Module
 * Manages chrome.proxy settings, generates strictly ASCII PAC scripts with Split Tunneling & SOCKS5/WARP/Custom proxy support.
 */

export const SEARCH_ENGINES = [
  'google.com',
  'www.google.com',
  'google.ru',
  'google.by',
  'google.kz',
  'google.com.ua',
  'gstatic.com',
  'googleapis.com',
  'googleusercontent.com',
  '1e100.net',
  'g.co',
  'goo.gl',
  'yandex.ru',
  'ya.ru',
  'bing.com',
  'duckduckgo.com'
];

export const ProxyEngine = {
  /**
   * Converts internationalized domain names (IDN / Cyrillic) to ASCII Punycode
   */
  toAsciiDomain(domain) {
    if (!domain) return '';
    const clean = domain.trim().toLowerCase();
    try {
      const isWildcard = clean.startsWith('*.');
      const isDotPrefix = clean.startsWith('.') && !isWildcard;
      const bare = clean.replace(/^\*\./, '').replace(/^\./, '');
      const asciiHostname = new URL('https://' + bare).hostname;
      if (isWildcard) return '*.' + asciiHostname;
      if (isDotPrefix) return '.' + asciiHostname;
      return asciiHostname;
    } catch (e) {
      return clean.replace(/[^\x00-\x7F]/g, '');
    }
  },

  /**
   * Resolves the proxy connection string based on the active connectionType
   */
  getProxyString(config, location) {
    const mode = config.connectionType || 'warp';

    // 1. Cloudflare WARP Mode (Local SOCKS5 proxy)
    if (mode === 'warp') {
      const host = config.warp?.host || '127.0.0.1';
      const port = config.warp?.port || '40000';
      return `SOCKS5 ${host}:${port}`;
    }

    // 2. Custom Proxy Mode (SOCKS5 / HTTPS / HTTP)
    if (mode === 'custom' && config.customProxy && config.customProxy.host && config.customProxy.port) {
      const proto = (config.customProxy.protocol || 'socks5').toUpperCase();
      const prefix = proto === 'SOCKS5' ? 'SOCKS5' : (proto === 'HTTPS' ? 'HTTPS' : 'PROXY');
      return `${prefix} ${config.customProxy.host.trim()}:${config.customProxy.port.trim()}`;
    }

    // 3. Location preset server
    if (location && location.server && location.server.host) {
      const proto = (location.server.type || 'socks5').toUpperCase();
      const prefix = proto === 'SOCKS5' ? 'SOCKS5' : (proto === 'HTTPS' ? 'HTTPS' : 'PROXY');
      return `${prefix} ${location.server.host}:${location.server.port}`;
    }

    // 4. Cloudflare Worker Mode
    if (mode === 'cloudflare' && config.cloudflare && config.cloudflare.workerUrl) {
      try {
        const u = new URL(config.cloudflare.workerUrl);
        const port = u.port || (u.protocol === 'https:' ? '443' : '80');
        const scheme = u.protocol === 'https:' ? 'HTTPS' : 'PROXY';
        return `${scheme} ${u.hostname}:${port}`;
      } catch (e) {
        return 'DIRECT';
      }
    }

    return 'DIRECT';
  },

  /**
   * Generates a 100% pure ASCII PAC script.
   */
  generatePacScript(proxyString, bypassList = [], bypassSearchEngines = true) {
    const cleanProxy = (proxyString || 'DIRECT').replace(/[^\x00-\x7F]/g, '').trim();

    let combinedList = [...(bypassList || [])];
    if (bypassSearchEngines) {
      combinedList = [...combinedList, ...SEARCH_ENGINES];
    }

    const uniqueAscii = Array.from(new Set(
      combinedList
        .map(item => this.toAsciiDomain(item))
        .filter(item => item && item.length > 0)
    ));

    const bypassConditions = uniqueAscii
      .map(clean => {
        if (clean.startsWith('*.')) {
          const root = clean.slice(2);
          return `dnsDomainIs(host, "${root}") || shExpMatch(host, "${clean}") || host === "${root}"`;
        }
        return `dnsDomainIs(host, "${clean}") || shExpMatch(host, "*.${clean}") || host === "${clean}"`;
      })
      .join(' || ');

    // Pure ASCII PAC script
    const lines = [
      'function FindProxyForURL(url, host) {',
      '  if (isPlainHostName(host) || shExpMatch(host, "127.0.0.1") || shExpMatch(host, "localhost") || shExpMatch(host, "10.*") || shExpMatch(host, "192.168.*") || shExpMatch(host, "172.16.*")) {',
      '    return "DIRECT";',
      '  }',
      bypassConditions ? `  if (${bypassConditions}) { return "DIRECT"; }` : '',
      `  return "${cleanProxy}; DIRECT";`,
      '}'
    ].filter(Boolean);

    let pacCode = lines.join('\n');
    pacCode = pacCode.replace(/[^\x00-\x7F]/g, '');

    return pacCode;
  },

  /**
   * Applies proxy settings for the selected location and configuration
   */
  async applyProxy(config, location) {
    return new Promise((resolve, reject) => {
      const proxyString = this.getProxyString(config, location);
      const shouldBypassSearch = config.security?.bypassSearchEngines !== false;
      const pacScript = this.generatePacScript(proxyString, config.bypassList || [], shouldBypassSearch);

      const proxySettings = {
        mode: 'pac_script',
        pacScript: {
          data: pacScript,
          mandatory: false
        }
      };

      chrome.proxy.settings.set(
        { value: proxySettings, scope: 'regular' },
        () => {
          if (chrome.runtime.lastError) {
            console.error('[CloakNet] Error applying proxy:', chrome.runtime.lastError);
            reject(new Error(chrome.runtime.lastError.message || 'Error applying proxy'));
          } else {
            console.log('[CloakNet] Proxy applied:', proxyString, 'Mode:', config.connectionType);
            resolve(proxyString);
          }
        }
      );
    });
  },

  /**
   * Clears proxy settings (returns to system default)
   */
  async clearProxy() {
    return new Promise((resolve) => {
      chrome.proxy.settings.clear({ scope: 'regular' }, () => {
        console.log('[CloakNet] Proxy cleared to DIRECT / System default');
        resolve();
      });
    });
  }
};
