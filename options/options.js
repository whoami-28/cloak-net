/**
 * CloakNet - Options Page Logic
 */

import { storage } from '../shared/storage.js';

const workerUrlInput = document.getElementById('workerUrl');
const workerTokenInput = document.getElementById('workerToken');
const testWorkerBtn = document.getElementById('testWorkerBtn');
const workerTestResult = document.getElementById('workerTestResult');
const bypassListInput = document.getElementById('bypassList');
const blockWebRTCInput = document.getElementById('blockWebRTC');
const adBlockerInput = document.getElementById('adBlocker');
const saveTopBtn = document.getElementById('saveTopBtn');
const saveBottomBtn = document.getElementById('saveBottomBtn');
const saveNotice = document.getElementById('saveNotice');

document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  setupListeners();
});

async function loadSettings() {
  const cfg = await storage.get();

  if (cfg.cloudflare) {
    workerUrlInput.value = cfg.cloudflare.workerUrl || '';
    workerTokenInput.value = cfg.cloudflare.token || '';
  }

  if (cfg.bypassList) {
    bypassListInput.value = cfg.bypassList.join('\n');
  }

  if (cfg.security) {
    blockWebRTCInput.checked = !!cfg.security.blockWebRTC;
    adBlockerInput.checked = !!cfg.security.adBlocker;
  }
}

function setupListeners() {
  saveTopBtn.addEventListener('click', saveSettings);
  saveBottomBtn.addEventListener('click', saveSettings);
  testWorkerBtn.addEventListener('click', testWorkerConnection);
}

async function saveSettings() {
  const current = await storage.get();

  // Обновляем Cloudflare настройки
  current.cloudflare = {
    ...current.cloudflare,
    workerUrl: workerUrlInput.value.trim().replace(/\/+$/, ''),
    token: workerTokenInput.value.trim()
  };

  // Обновляем список исключений (Bypass list)
  current.bypassList = bypassListInput.value
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('#'));

  // Обновляем параметры безопасности
  current.security = {
    ...current.security,
    blockWebRTC: blockWebRTCInput.checked,
    adBlocker: adBlockerInput.checked
  };

  // Отправляем в Service Worker
  chrome.runtime.sendMessage({ action: 'SAVE_CONFIG', config: current }, (res) => {
    if (res && res.success) {
      showSaveNotice('✓ Настройки успешно сохранены');
    } else {
      showSaveNotice('Ошибка сохранения', true);
    }
  });
}

function showSaveNotice(text, isError = false) {
  saveNotice.textContent = text;
  saveNotice.style.color = isError ? 'var(--accent-red)' : 'var(--accent-green)';
  saveNotice.style.opacity = '1';
  setTimeout(() => {
    saveNotice.style.opacity = '0';
  }, 3000);
}

/**
 * Проверка связи с Cloudflare Worker
 */
async function testWorkerConnection() {
  const urlStr = workerUrlInput.value.trim().replace(/\/+$/, '');
  if (!urlStr) {
    workerTestResult.className = 'test-result error';
    workerTestResult.textContent = 'Укажите URL воркера';
    return;
  }

  workerTestResult.className = 'test-result';
  workerTestResult.style.display = 'block';
  workerTestResult.style.color = 'var(--accent-amber)';
  workerTestResult.textContent = 'Тестирование соединения...';

  const startTime = Date.now();
  try {
    const testUrl = urlStr + '/ip';
    const res = await fetch(testUrl, { cache: 'no-store' });
    const latency = Date.now() - startTime;

    if (res.ok) {
      const data = await res.json();
      workerTestResult.className = 'test-result success';
      workerTestResult.textContent = `✓ Связь установлена (${latency} ms). Дата-центр: ${data.colo || 'Auto'} (${data.city || data.country || 'OK'}), Внешний IP: ${data.ip}`;
    } else {
      workerTestResult.className = 'test-result error';
      workerTestResult.textContent = `Воркер ответил с ошибкой: HTTP ${res.status}`;
    }
  } catch (err) {
    workerTestResult.className = 'test-result error';
    workerTestResult.textContent = `Не удалось подключиться: ${err.message}. Проверьте адрес и интернет.`;
  }
}
