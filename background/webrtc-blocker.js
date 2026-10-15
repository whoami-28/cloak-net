/**
 * CloakNet - WebRTC Leak Protection Module
 * Предотвращает утечку реального локального IP-адреса через WebRTC STUN/TURN,
 * используя безопасную политику default_public_interface_only, не блокирующую QUIC/UDP протоколы (Google, YouTube).
 */

export const WebRTCBlocker = {
  async enable() {
    try {
      if (chrome.privacy && chrome.privacy.network && chrome.privacy.network.webRTCIPHandlingPolicy) {
        await new Promise((resolve) => {
          // default_public_interface_only скрывает локальные LAN IP (192.168.x.x, 10.x.x.x),
          // но не блокирует UDP для QUIC/HTTP3 (что предотвращает зависание поиска Google и YouTube)
          chrome.privacy.network.webRTCIPHandlingPolicy.set(
            { value: 'default_public_interface_only' },
            () => {
              console.log('[CloakNet] WebRTC Leak Protection enabled (default_public_interface_only)');
              resolve();
            }
          );
        });
      }
    } catch (e) {
      console.warn('[CloakNet] Could not enable WebRTC protection:', e);
    }
  },

  async disable() {
    try {
      if (chrome.privacy && chrome.privacy.network && chrome.privacy.network.webRTCIPHandlingPolicy) {
        await new Promise((resolve) => {
          chrome.privacy.network.webRTCIPHandlingPolicy.clear(
            { scope: 'regular' },
            () => {
              console.log('[CloakNet] WebRTC protection cleared to default');
              resolve();
            }
          );
        });
      }
    } catch (e) {
      console.warn('[CloakNet] Could not disable WebRTC protection:', e);
    }
  }
};
