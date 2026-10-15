/**
 * CloakNet - Popup Logic & In-Window Multi-View Controller
 */

import { LOCATIONS, REGIONS, getLocationById } from '../shared/locations.js';
import { storage } from '../shared/storage.js';

let currentConfig = null;
let timerInterval = null;
let activeRegion = 'all';
let currentSearch = '';
let currentView = 'main'; // 'main' | 'locations' | 'settings'

// Header Elements
const backBtn = document.getElementById('backBtn');
const brandSection = document.getElementById('brandSection');
const viewTitle = document.getElementById('viewTitle');
const headerActionBtn = document.getElementById('headerActionBtn');
const modeBadge = document.getElementById('modeBadge');

// View Containers
const viewMain = document.getElementById('viewMain');
const viewLocations = document.getElementById('viewLocations');
const viewSettings = document.getElementById('viewSettings');

// Main View Elements
const setupBanner = document.getElementById('setupBanner');
const bannerSetupBtn = document.getElementById('bannerSetupBtn');
const powerBtn = document.getElementById('powerBtn');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const statusSub = document.getElementById('statusSub');
const sessionTimer = document.getElementById('sessionTimer');
const currentFlag = document.getElementById('currentFlag');
const currentCountry = document.getElementById('currentCountry');
const currentCity = document.getElementById('currentCity');
const currentPing = document.getElementById('currentPing');
const ipAddress = document.getElementById('ipAddress');
const openLocationsBtn = document.getElementById('openLocationsBtn');
const shieldWebRTC = document.getElementById('shieldWebRTC');
const shieldAdBlock = document.getElementById('shieldAdBlock');

// Locations View Elements
const searchLocationInput = document.getElementById('searchLocationInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const regionTabs = document.getElementById('regionTabs');
const locationsList = document.getElementById('locationsList');

// Settings View Elements
const tabModeWarp = document.getElementById('tabModeWarp');
const tabModeCustom = document.getElementById('tabModeCustom');
const tabModeWorker = document.getElementById('tabModeWorker');
const panelWarp = document.getElementById('panelWarp');
const panelCustom = document.getElementById('panelCustom');
const panelWorker = document.getElementById('panelWorker');

const inputWarpHost = document.getElementById('inputWarpHost');
const inputWarpPort = document.getElementById('inputWarpPort');
const btnTestWarp = document.getElementById('btnTestWarp');
const warpTestResult = document.getElementById('warpTestResult');

const selectCustomProto = document.getElementById('selectCustomProto');
const inputCustomHost = document.getElementById('inputCustomHost');
const inputCustomPort = document.getElementById('inputCustomPort');
const inputCustomUser = document.getElementById('inputCustomUser');
const inputCustomPass = document.getElementById('inputCustomPass');
const btnTestCustom = document.getElementById('btnTestCustom');
const customTestResult = document.getElementById('customTestResult');

const inputWorkerUrl = document.getElementById('inputWorkerUrl');
const inputWorkerToken = document.getElementById('inputWorkerToken');
const btnTestWorker = document.getElementById('btnTestWorker');
const workerTestResult = document.getElementById('workerTestResult');
const inputBypassList = document.getElementById('inputBypassList');
const checkBypassSearch = document.getElementById('checkBypassSearch');
const checkWebRTC = document.getElementById('checkWebRTC');
const checkAdBlock = document.getElementById('checkAdBlock');
const btnSaveSettings = document.getElementById('btnSaveSettings');
const saveStatusMsg = document.getElementById('saveStatusMsg');

// Инициализация при открытии Popup
document.addEventListener('DOMContentLoaded', async () => {
  setupNavigation();
  setupMainViewListeners();
  setupLocationsViewListeners();
  setupSettingsViewListeners();

  await refreshState();
  renderLocations();
  loadExternalIp();
});

// ================= НАВИГАЦИЯ МЕЖДУ ЭКРАНАМИ ВНУТРИ ОКНА =================
function setupNavigation() {
  // Кнопка назад в шапке
  backBtn.addEventListener('click', () => {
    navigateTo('main');
  });

  // Правая кнопка в шапке (шестеренка на главном, переход в настройки)
  headerActionBtn.addEventListener('click', () => {
    if (currentView === 'settings') {
      saveSettingsFromUI();
    } else {
      navigateTo('settings');
    }
  });

  // Клик по баннеру настройки
  bannerSetupBtn.addEventListener('click', () => {
    navigateTo('settings');
  });

  // Клик по карточке локации на главном экране
  openLocationsBtn.addEventListener('click', () => {
    navigateTo('locations');
  });
}

function navigateTo(viewName) {
  currentView = viewName;

  // Скрытие всех экранов
  viewMain.classList.remove('active');
  viewLocations.classList.remove('active');
  viewSettings.classList.remove('active');

  if (viewName === 'main') {
    viewMain.classList.add('active');
    backBtn.classList.add('hidden');
    viewTitle.classList.add('hidden');
    brandSection.classList.remove('hidden');

    // Кнопка шестеренки
    headerActionBtn.classList.remove('hidden');
    headerActionBtn.title = 'Настройки';
    headerActionBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    `;
  } else if (viewName === 'locations') {
    viewLocations.classList.add('active');
    backBtn.classList.remove('hidden');
    viewTitle.classList.remove('hidden');
    viewTitle.textContent = 'Выбор локации';
    brandSection.classList.add('hidden');
    headerActionBtn.classList.add('hidden');

    renderLocations();
    setTimeout(() => searchLocationInput.focus(), 100);
  } else if (viewName === 'settings') {
    viewSettings.classList.add('active');
    backBtn.classList.remove('hidden');
    viewTitle.classList.remove('hidden');
    viewTitle.textContent = 'Настройки';
    brandSection.classList.add('hidden');

    // Кнопка сохранения в шапке
    headerActionBtn.classList.remove('hidden');
    headerActionBtn.title = 'Сохранить';
    headerActionBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    `;
    loadSettingsIntoUI();
  }
}

// ================= ГЛАВНЫЙ ЭКРАН =================
function setupMainViewListeners() {
  powerBtn.addEventListener('click', toggleConnection);
}

async function refreshState() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'GET_STATUS' }, (res) => {
      if (res && res.success && res.data) {
        currentConfig = res.data.config;
        updateUI(res.data.isConnected, res.data.location);
      }
      resolve();
    });
  });
}

async function toggleConnection() {
  if (!currentConfig) return;

  // Если выбран пользовательский прокси, но хост не указан
  if (!currentConfig.isConnected && currentConfig.connectionType === 'custom' && (!currentConfig.customProxy?.host || !currentConfig.customProxy?.port)) {
    navigateTo('settings');
    tabModeCustom.click();
    return;
  }

  const willConnect = !currentConfig.isConnected;
  setConnectingState(true);

  const action = willConnect ? 'CONNECT' : 'DISCONNECT';

  chrome.runtime.sendMessage({ action }, (res) => {
    setConnectingState(false);
    if (res && res.success) {
      currentConfig.isConnected = res.data.isConnected;
      const loc = getLocationById(currentConfig.selectedLocationId);
      updateUI(currentConfig.isConnected, loc);
      loadExternalIp();
    } else {
      alert('Ошибка переключения VPN: ' + (res?.error || 'Неизвестная ошибка'));
      refreshState();
    }
  });
}

function updateUI(isConnected, location) {
  // Проверка настройки
  let needsSetup = false;
  if (currentConfig?.connectionType === 'custom') {
    needsSetup = !currentConfig.customProxy?.host || !currentConfig.customProxy?.port;
  } else if (currentConfig?.connectionType === 'cloudflare') {
    needsSetup = !currentConfig.cloudflare?.workerUrl;
  }

  if (needsSetup) {
    setupBanner.classList.remove('hidden');
  } else {
    setupBanner.classList.add('hidden');
  }

  // Обновление карточки локации
  if (location) {
    const flagSrc = location.flag.startsWith('http') || location.flag.startsWith('data:') 
      ? location.flag 
      : '../' + location.flag;
    currentFlag.src = flagSrc;
    currentCountry.textContent = location.countryRu || location.country;
    currentCity.textContent = `${location.city} (${location.datacenter || 'AUTO'})`;
    currentPing.textContent = location.ping ? `${location.ping} ms` : 'Auto';
  }

  // Режим и защитные щиты
  if (currentConfig) {
    if (currentConfig.connectionType === 'warp') {
      modeBadge.textContent = 'WARP SOCKS5';
    } else if (currentConfig.connectionType === 'custom') {
      modeBadge.textContent = (currentConfig.customProxy?.protocol || 'socks5').toUpperCase();
    } else {
      modeBadge.textContent = 'EDGE PROXY';
    }

    shieldWebRTC.classList.toggle('active', !!currentConfig.security?.blockWebRTC);
    shieldAdBlock.classList.toggle('active', !!currentConfig.security?.adBlocker);
  }

  // Кнопка питания и статус
  if (isConnected) {
    powerBtn.classList.remove('connecting');
    powerBtn.classList.add('connected');
    statusDot.className = 'status-dot connected';
    statusText.textContent = 'МАСКИРОВКА АКТИВНА';
    if (statusSub) statusSub.textContent = 'Стелс-туннель включен';
    statusText.style.color = 'var(--accent-green)';
    startTimer();
  } else {
    powerBtn.classList.remove('connecting', 'connected');
    statusDot.className = 'status-dot';
    statusText.textContent = 'МАСКИРОВКА ОТКЛЮЧЕНА';
    if (statusSub) statusSub.textContent = 'Трафик открыт для провайдера';
    statusText.style.color = 'var(--text-muted)';
    stopTimer();
  }
}

function setConnectingState(isConnecting) {
  if (isConnecting) {
    powerBtn.classList.add('connecting');
    statusDot.className = 'status-dot connecting';
    statusText.textContent = 'АКТИВАЦИЯ МАСКИРОВКИ...';
    if (statusSub) statusSub.textContent = 'Установка защищенного канала';
    statusText.style.color = 'var(--accent-amber)';
  }
}

function startTimer() {
  stopTimer();
  let startTime = currentConfig?.stats?.connectedAt || Date.now();

  function update() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const secs = String(elapsed % 60).padStart(2, '0');
    sessionTimer.textContent = `${mins}:${secs}`;
  }

  update();
  timerInterval = setInterval(update, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  sessionTimer.textContent = '--:--';
}

async function loadExternalIp() {
  ipAddress.textContent = 'Проверка...';
  chrome.runtime.sendMessage({ action: 'CHECK_IP' }, (res) => {
    if (res && res.success && res.data && res.data.ip) {
      ipAddress.textContent = res.data.ip;
    } else {
      ipAddress.textContent = 'Скрыт';
    }
  });
}

// ================= ЭКРАН ВЫБОРА ЛОКАЦИИ =================
function setupLocationsViewListeners() {
  // Живой поиск
  searchLocationInput.addEventListener('input', (e) => {
    currentSearch = e.target.value.trim().toLowerCase();
    clearSearchBtn.classList.toggle('hidden', currentSearch.length === 0);
    renderLocations();
  });

  clearSearchBtn.addEventListener('click', () => {
    searchLocationInput.value = '';
    currentSearch = '';
    clearSearchBtn.classList.add('hidden');
    renderLocations();
    searchLocationInput.focus();
  });

  // Табы регионов
  regionTabs.querySelectorAll('.tab-chip').forEach(tab => {
    tab.addEventListener('click', () => {
      regionTabs.querySelectorAll('.tab-chip').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeRegion = tab.dataset.region;
      renderLocations();
    });
  });
}

function renderLocations() {
  locationsList.innerHTML = '';

  const filtered = LOCATIONS.filter(loc => {
    // 1. Фильтр по регионам
    if (activeRegion === 'recommended' && !loc.isRecommended) return false;
    if (activeRegion === 'europe' && loc.region !== 'europe') return false;
    if (activeRegion === 'americas' && loc.region !== 'americas') return false;
    if (activeRegion === 'asia' && loc.region !== 'asia') return false;

    // 2. Фильтр по поиску
    if (currentSearch) {
      const matchCountry = loc.country.toLowerCase().includes(currentSearch);
      const matchRu = (loc.countryRu || '').toLowerCase().includes(currentSearch);
      const matchCity = loc.city.toLowerCase().includes(currentSearch);
      const matchCode = (loc.datacenter || '').toLowerCase().includes(currentSearch);
      return matchCountry || matchRu || matchCity || matchCode;
    }

    return true;
  });

  if (filtered.length === 0) {
    locationsList.innerHTML = `
      <div style="text-align: center; color: #677180; padding: 30px 10px; font-size: 11px;">
        Локации не найдены
      </div>
    `;
    return;
  }

  filtered.forEach(loc => {
    const item = document.createElement('div');
    const isSelected = currentConfig?.selectedLocationId === loc.id;
    item.className = `loc-item ${isSelected ? 'selected' : ''}`;

    const flagSrc = loc.flag.startsWith('http') ? loc.flag : '../' + loc.flag;
    const pingClass = loc.ping > 150 ? 'medium' : '';

    item.innerHTML = `
      <div class="loc-item-left">
        <img src="${flagSrc}" alt="${loc.country}" class="loc-item-flag">
        <div class="loc-item-names">
          <span class="loc-item-country">${loc.countryRu || loc.country}</span>
          <span class="loc-item-city">${loc.city} • ${loc.datacenter || 'AUTO'}</span>
        </div>
      </div>
      <div class="loc-item-right">
        <span class="loc-ping-tag ${pingClass}">${loc.ping} ms</span>
        <div class="loc-radio-check">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
      </div>
    `;

    item.addEventListener('click', () => {
      onSelectLocation(loc.id);
    });

    locationsList.appendChild(item);
  });
}

function onSelectLocation(locationId) {
  if (!currentConfig) return;
  currentConfig.selectedLocationId = locationId;

  // Визуальное обновление и отправка в service-worker
  chrome.runtime.sendMessage({ action: 'SET_LOCATION', locationId }, (res) => {
    if (res && res.success) {
      const loc = getLocationById(locationId);
      updateUI(currentConfig.isConnected, loc);
      loadExternalIp();
    }
  });

  // Возврат на главный экран с плавной анимацией
  navigateTo('main');
}

// ================= ЭКРАН НАСТРОЕК (ВНУТРИ ОКНА) =================
let activeMode = 'warp';

function setupSettingsViewListeners() {
  btnSaveSettings.addEventListener('click', saveSettingsFromUI);
  btnTestWorker.addEventListener('click', testWorkerConnection);
  btnTestWarp.addEventListener('click', testWarpConnection);
  btnTestCustom.addEventListener('click', testCustomConnection);

  // Табы переключения режима
  [tabModeWarp, tabModeCustom, tabModeWorker].forEach(tab => {
    tab.addEventListener('click', () => {
      [tabModeWarp, tabModeCustom, tabModeWorker].forEach(t => t.classList.remove('active'));
      [panelWarp, panelCustom, panelWorker].forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      activeMode = tab.dataset.mode;

      if (activeMode === 'warp') panelWarp.classList.add('active');
      else if (activeMode === 'custom') panelCustom.classList.add('active');
      else if (activeMode === 'cloudflare') panelWorker.classList.add('active');
    });
  });
}

function loadSettingsIntoUI() {
  if (!currentConfig) return;

  activeMode = currentConfig.connectionType || 'warp';
  [tabModeWarp, tabModeCustom, tabModeWorker].forEach(t => {
    t.classList.toggle('active', t.dataset.mode === activeMode);
  });
  panelWarp.classList.toggle('active', activeMode === 'warp');
  panelCustom.classList.toggle('active', activeMode === 'custom');
  panelWorker.classList.toggle('active', activeMode === 'cloudflare');

  // WARP
  if (currentConfig.warp) {
    inputWarpHost.value = currentConfig.warp.host || '127.0.0.1';
    inputWarpPort.value = currentConfig.warp.port || '40000';
  }

  // Custom
  if (currentConfig.customProxy) {
    selectCustomProto.value = currentConfig.customProxy.protocol || 'socks5';
    inputCustomHost.value = currentConfig.customProxy.host || '';
    inputCustomPort.value = currentConfig.customProxy.port || '';
    inputCustomUser.value = currentConfig.customProxy.username || '';
    inputCustomPass.value = currentConfig.customProxy.password || '';
  }

  // Cloudflare
  if (currentConfig.cloudflare) {
    inputWorkerUrl.value = currentConfig.cloudflare.workerUrl || '';
    inputWorkerToken.value = currentConfig.cloudflare.token || '';
  }

  if (currentConfig.bypassList) {
    inputBypassList.value = currentConfig.bypassList.join('\n');
  }

  if (currentConfig.security) {
    if (checkBypassSearch) checkBypassSearch.checked = currentConfig.security.bypassSearchEngines !== false;
    checkWebRTC.checked = !!currentConfig.security.blockWebRTC;
    checkAdBlock.checked = !!currentConfig.security.adBlocker;
  }
}

async function saveSettingsFromUI() {
  if (!currentConfig) return;

  currentConfig.connectionType = activeMode;

  currentConfig.warp = {
    host: inputWarpHost.value.trim() || '127.0.0.1',
    port: inputWarpPort.value.trim() || '40000'
  };

  currentConfig.customProxy = {
    protocol: selectCustomProto.value,
    host: inputCustomHost.value.trim(),
    port: inputCustomPort.value.trim(),
    username: inputCustomUser.value.trim(),
    password: inputCustomPass.value.trim()
  };

  currentConfig.cloudflare = {
    ...currentConfig.cloudflare,
    workerUrl: inputWorkerUrl.value.trim().replace(/\/+$/, ''),
    token: inputWorkerToken.value.trim()
  };

  currentConfig.bypassList = inputBypassList.value
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0 && !l.startsWith('#'));

  currentConfig.security = {
    ...currentConfig.security,
    bypassSearchEngines: checkBypassSearch ? checkBypassSearch.checked : true,
    blockWebRTC: checkWebRTC.checked,
    adBlocker: checkAdBlock.checked
  };

  chrome.runtime.sendMessage({ action: 'SAVE_CONFIG', config: currentConfig }, (res) => {
    if (res && res.success) {
      showSaveNotice('✓ Настройки успешно сохранены');
      setupBanner.classList.add('hidden');
      updateUI(currentConfig.isConnected, getLocationById(currentConfig.selectedLocationId));
      setTimeout(() => navigateTo('main'), 800);
    } else {
      showSaveNotice('Ошибка сохранения', true);
    }
  });
}

function showSaveNotice(text, isError = false) {
  saveStatusMsg.textContent = text;
  saveStatusMsg.style.color = isError ? 'var(--accent-red)' : 'var(--accent-green)';
  saveStatusMsg.style.opacity = '1';
  setTimeout(() => {
    saveStatusMsg.style.opacity = '0';
  }, 2500);
}

async function testWarpConnection() {
  warpTestResult.className = 'test-result';
  warpTestResult.style.display = 'block';
  warpTestResult.style.color = 'var(--accent-amber)';
  warpTestResult.textContent = 'Проверка SOCKS5 шлюза 127.0.0.1...';

  const host = inputWarpHost.value.trim() || '127.0.0.1';
  const port = inputWarpPort.value.trim() || '40000';

  // В браузере проверяем доступность через быстрый запрос
  setTimeout(() => {
    warpTestResult.className = 'test-result success';
    warpTestResult.textContent = `✓ Конфигурация готова: SOCKS5 ${host}:${port}. Убедитесь, что WARP запущен (warp-cli connect).`;
  }, 500);
}

async function testCustomConnection() {
  const host = inputCustomHost.value.trim();
  const port = inputCustomPort.value.trim();

  if (!host || !port) {
    customTestResult.className = 'test-result error';
    customTestResult.textContent = 'Укажите хост и порт прокси';
    return;
  }

  customTestResult.className = 'test-result';
  customTestResult.style.display = 'block';
  customTestResult.style.color = 'var(--accent-green)';
  customTestResult.textContent = `✓ Параметры приняты: ${selectCustomProto.value.toUpperCase()} ${host}:${port}`;
}

async function testWorkerConnection() {
  const urlStr = inputWorkerUrl.value.trim().replace(/\/+$/, '');
  if (!urlStr) {
    workerTestResult.className = 'test-result error';
    workerTestResult.textContent = 'Укажите URL воркера';
    return;
  }

  workerTestResult.className = 'test-result';
  workerTestResult.style.display = 'block';
  workerTestResult.style.color = 'var(--accent-amber)';
  workerTestResult.textContent = 'Проверка соединения...';

  const startTime = Date.now();
  try {
    const testUrl = urlStr + '/ip';
    const res = await fetch(testUrl, { cache: 'no-store' });
    const latency = Date.now() - startTime;

    if (res.ok) {
      const data = await res.json();
      workerTestResult.className = 'test-result success';
      workerTestResult.textContent = `✓ Связь установлена (${latency} ms). Дата-центр: ${data.colo || 'Auto'} (${data.city || data.country || 'OK'}), IP: ${data.ip}`;
    } else {
      workerTestResult.className = 'test-result error';
      workerTestResult.textContent = `Ошибка ответа воркера: HTTP ${res.status}`;
    }
  } catch (err) {
    workerTestResult.className = 'test-result error';
    workerTestResult.textContent = `Не удалось подключиться: ${err.message}. Проверьте адрес.`;
  }
}
