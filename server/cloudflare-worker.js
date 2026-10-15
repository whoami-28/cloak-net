/**
 * CloakNet - Cloudflare Worker Edge Proxy (Personal Serverless VPN/Proxy)
 * 
 * Бесплатный серверный компонент для расширения CloakNet.
 * Разворачивается в Cloudflare Workers за 2 минуты (100 000 запросов в день бесплатно).
 */

// Задайте секретный токен для защиты от посторонних (укажите такой же в настройках расширения)
const SECRET_TOKEN = "cloaknet-secret-key-2026";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. Быстрый CORS Preflight (OPTIONS)
    if (request.method === "OPTIONS") {
      return handleCors();
    }

    // 2. Служебный эндпоинт для проверки статуса, IP и локации ноды Cloudflare
    if (url.pathname === "/ip" || url.pathname === "/status") {
      return handleStatus(request);
    }

    // 3. Проксирование запросов: /proxy?url=https://...
    if (url.pathname === "/proxy") {
      return handleProxy(request, url, env);
    }

    // 4. Главная страница (информация о ноде)
    return new Response(JSON.stringify({
      service: "CloakNet Edge Proxy",
      status: "online",
      version: "1.0.0",
      datacenter: request.cf?.colo || "UNKNOWN",
      country: request.cf?.country || "UNKNOWN",
      city: request.cf?.city || "UNKNOWN"
    }, null, 2), {
      headers: { "content-type": "application/json;charset=UTF-8", ...corsHeaders() }
    });
  }
};

/**
 * Обработка статуса и локации ноды Cloudflare
 */
function handleStatus(request) {
  const cf = request.cf || {};
  const data = {
    status: "ok",
    ip: request.headers.get("cf-connecting-ip") || "127.0.0.1",
    country: cf.country || "NL",
    city: cf.city || "Amsterdam",
    region: cf.region || "Europe",
    colo: cf.colo || "AMS", // Код дата-центра (AMS = Amsterdam, IAD = Washington, FRA = Frankfurt, SIN = Singapore)
    latitude: cf.latitude,
    longitude: cf.longitude,
    asn: cf.asn,
    asOrganization: cf.asOrganization,
    timestamp: Date.now()
  };

  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "content-type": "application/json;charset=UTF-8",
      "cache-control": "no-store, no-cache, must-revalidate",
      ...corsHeaders()
    }
  });
}

/**
 * Основной обработчик проксирования
 */
async function handleProxy(request, url, env) {
  // Проверка токена авторизации (в заголовке X-CloakNet-Key или в query ?key=...)
  const token = request.headers.get("X-CloakNet-Key") || url.searchParams.get("key");
  const configuredToken = env?.CLOAKNET_TOKEN || SECRET_TOKEN;

  if (configuredToken && token !== configuredToken) {
    return new Response(JSON.stringify({ error: "Unauthorized: Invalid CloakNet token" }), {
      status: 401,
      headers: { "content-type": "application/json", ...corsHeaders() }
    });
  }

  // Извлечение целевого URL
  let targetUrlStr = url.searchParams.get("url");
  if (!targetUrlStr) {
    return new Response(JSON.stringify({ error: "Missing 'url' query parameter" }), {
      status: 400,
      headers: { "content-type": "application/json", ...corsHeaders() }
    });
  }

  // Добавление протокола по умолчанию, если отсутствует
  if (!targetUrlStr.startsWith("http://") && !targetUrlStr.startsWith("https://")) {
    targetUrlStr = "https://" + targetUrlStr;
  }

  let targetUrl;
  try {
    targetUrl = new URL(targetUrlStr);
  } catch (err) {
    return new Response(JSON.stringify({ error: "Invalid target URL format" }), {
      status: 400,
      headers: { "content-type": "application/json", ...corsHeaders() }
    });
  }

  // Подготовка заголовков для целевого сервера
  const forwardHeaders = new Headers(request.headers);
  
  // Удаляем служебные заголовки Cloudflare и прокси для приватности
  const headersToRemove = [
    "cf-connecting-ip",
    "cf-ipcountry",
    "cf-ray",
    "cf-visitor",
    "cf-worker",
    "x-forwarded-proto",
    "x-real-ip",
    "x-cloaknet-key"
  ];
  headersToRemove.forEach(h => forwardHeaders.delete(h));

  // Устанавливаем корректный Host
  forwardHeaders.set("Host", targetUrl.host);
  forwardHeaders.set("Origin", targetUrl.origin);
  forwardHeaders.set("Referer", targetUrl.href);

  // Формируем запрос к целевому сайту
  const fetchOptions = {
    method: request.method,
    headers: forwardHeaders,
    redirect: "follow"
  };

  // Передача тела запроса (POST/PUT/PATCH)
  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method) && request.body) {
    fetchOptions.body = request.body;
    // duplex необходим для streaming в современных fetch
    fetchOptions.duplex = "half";
  }

  try {
    const originResponse = await fetch(targetUrl.href, fetchOptions);

    // Подготовка заголовков ответа
    const responseHeaders = new Headers(originResponse.headers);

    // Обеспечиваем CORS доступ для браузерного расширения
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH");
    responseHeaders.set("Access-Control-Allow-Headers", "*");
    responseHeaders.set("Access-Control-Expose-Headers", "*");

    // Удаляем CSP фрейминг, если мешает инспекции
    responseHeaders.delete("content-security-policy");
    responseHeaders.delete("x-frame-options");

    return new Response(originResponse.body, {
      status: originResponse.status,
      statusText: originResponse.statusText,
      headers: responseHeaders
    });
  } catch (err) {
    return new Response(JSON.stringify({
      error: "CloakNet Gateway Fetch Error",
      message: err.message,
      target: targetUrl.href
    }), {
      status: 502,
      headers: { "content-type": "application/json", ...corsHeaders() }
    });
  }
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, POST, PUT, DELETE, OPTIONS, PATCH",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-CloakNet-Key, X-Requested-With",
    "Access-Control-Max-Age": "86400"
  };
}

function handleCors() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  });
}
