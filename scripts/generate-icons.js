const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPng(width, height, pixelFn) {
  const rowBytes = width * 4 + 1;
  const rawData = Buffer.alloc(height * rowBytes);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelFn(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);

    let crc = 0 ^ (-1);
    const combined = Buffer.concat([typeBuf, data]);
    for (let i = 0; i < combined.length; i++) {
      let byte = combined[i];
      for (let j = 0; j < 8; j++) {
        if ((crc ^ byte) & 1) {
          crc = (crc >>> 1) ^ 0xEDB88320;
        } else {
          crc = crc >>> 1;
        }
        byte = byte >>> 1;
      }
    }
    crc = (crc ^ (-1)) >>> 0;
    crcBuf.writeUInt32BE(crc, 0);

    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  const ihdr = makeChunk('IHDR', ihdrData);
  const idat = makeChunk('IDAT', deflated);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

// CloakNet Icon Drawing Function: Stealth Hood / Invisibility Cloak with Cyber Mesh Net & Core
function drawCloakNetIcon(x, y, w, h) {
  const nx = (x / (w - 1)) * 2 - 1; // -1 to 1
  const ny = (y / (h - 1)) * 2 - 1; // -1 to 1

  const distCenter = Math.sqrt(nx * nx + ny * ny);

  // Outer border circle (metallic stealth disc)
  if (distCenter > 0.95) {
    return [0, 0, 0, 0];
  }

  // Brushed titanium outer bezel
  if (distCenter > 0.82) {
    const angle = Math.atan2(ny, nx);
    const sheen = Math.sin(angle * 2 + 1.2) * 0.35 + 0.65;
    const val = Math.floor(130 * sheen + 35);
    return [val, val + 4, val + 10, 255];
  }

  // Dark stealth carbon background
  const checker = (Math.floor(x / 2) + Math.floor(y / 2)) % 2 === 0 ? 3 : 0;
  const diagGrad = 0.5 + (nx - ny) * 0.2;
  const baseDark = Math.floor(16 + diagGrad * 14 + checker);
  let r = baseDark, g = baseDark + 2, b = baseDark + 5, a = 255;

  // STEALTH CLOAK / HOOD SILHOUETTE (Мантия-невидимка)
  // Polygon: Top peak (0, -0.75), shoulders (±0.65, -0.2), lower drape (±0.45, 0.65), bottom apex (0, 0.8)
  const absX = Math.abs(nx);
  let inCloak = false;

  if (ny >= -0.75 && ny <= -0.2) {
    // Upper hood slope
    const maxX = (ny + 0.75) / 0.55 * 0.65;
    inCloak = absX <= maxX;
  } else if (ny > -0.2 && ny <= 0.65) {
    // Middle mantle
    const maxX = 0.65 - (ny + 0.2) / 0.85 * 0.2;
    inCloak = absX <= maxX;
  } else if (ny > 0.65 && ny <= 0.8) {
    // Lower peak
    const maxX = 0.45 * (1 - (ny - 0.65) / 0.15);
    inCloak = absX <= maxX;
  }

  if (inCloak) {
    // Faceted metallic cloak sheen
    const facetSheen = nx > 0 ? 1.2 : 0.8;
    const metalPlate = Math.floor((38 + (1 - ny) * 22) * facetSheen);
    r = metalPlate;
    g = metalPlate + 6;
    b = metalPlate + 14;

    // Inner cloak shadow (Face cavity)
    const inFace = (absX < 0.38) && (ny > -0.35) && (ny < 0.45);
    if (inFace) {
      r = 10;
      g = 12;
      b = 16;
    }

    // CYBER NET MESH (Сеть узлов внутри мантии)
    // Horizontal and diagonal cyber grid lines
    const onNetLine = (Math.abs(ny - 0.05) < 0.05 && absX < 0.36) ||
                      (Math.abs(absX * 0.7 - (ny + 0.15)) < 0.04 && absX < 0.38) ||
                      (Math.abs(absX * 0.7 + (ny - 0.25)) < 0.04 && absX < 0.38);

    if (onNetLine) {
      r = 0; g = 180; b = 130; // Emerald network trace
    }

    // Giga-Glowing Cloaking Core (Светящееся ядро маскировки)
    const coreDist = Math.sqrt(nx * nx + (ny - 0.05) * (ny - 0.05));
    if (coreDist < 0.16) {
      return [0, 240, 165, 255]; // Active Emerald Core
    } else if (coreDist < 0.26) {
      const glow = (0.26 - coreDist) / 0.10;
      r = Math.floor(r * (1 - glow) + 0 * glow);
      g = Math.floor(g * (1 - glow) + 230 * glow);
      b = Math.floor(b * (1 - glow) + 160 * glow);
    }
  }

  return [r, g, b, 255];
}

const iconsDir = path.join(__dirname, '..', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

[16, 32, 48, 128].forEach(size => {
  const png = createPng(size, size, drawCloakNetIcon);
  fs.writeFileSync(path.join(iconsDir, `icon${size}.png`), png);
  console.log(`Generated CloakNet stealth icon${size}.png (${size}x${size})`);
});
