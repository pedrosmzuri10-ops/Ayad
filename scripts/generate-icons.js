import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

// Table for CRC32
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcBuf = Buffer.alloc(4);
  const combined = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(combined), 0);

  return Buffer.concat([lenBuf, combined, crcBuf]);
}

function generatePng(width, height, isMaskable = false) {
  // Create RGBA image buffer with Pedros Brand blue background + 'P' shape
  // Scanlines: width * 4 + 1 filter byte per line
  const scanlineLength = width * 4 + 1;
  const rawData = Buffer.alloc(scanlineLength * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.44;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;

      // Distance from center
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Colors
      // Base background: Royal blue #2563eb (R: 37, G: 99, B: 235) to Dark Blue #1e3a8a (R: 30, G: 58, B: 138)
      const gradRatio = (y / height);
      let r = Math.round(29 * (1 - gradRatio) + 15 * gradRatio);
      let g = Math.round(78 * (1 - gradRatio) + 23 * gradRatio);
      let b = Math.round(216 * (1 - gradRatio) + 138 * gradRatio);
      let a = 255;

      // Check if within rounded square or circle
      if (!isMaskable) {
        // Rounded rectangle test
        const cornerR = width * 0.22;
        const qx = Math.abs(x - cx) - (width / 2 - cornerR);
        const qy = Math.abs(y - cy) - (height / 2 - cornerR);
        const inCorner = qx > 0 && qy > 0;
        const cornerDist = Math.sqrt(Math.max(0, qx) ** 2 + Math.max(0, qy) ** 2);

        if (inCorner && cornerDist > cornerR) {
          a = 0; // Transparent outside corner
        }
      }

      // Draw stylized letter 'P' in center safe area
      // Bounding box for 'P': x in [0.32, 0.68], y in [0.22, 0.78]
      const px = x / width;
      const py = y / height;

      // Stem of P
      const inStem = px >= 0.32 && px <= 0.44 && py >= 0.22 && py <= 0.78;

      // Top loop of P
      const loopCy = 0.40;
      const loopCx = 0.44;
      const loopR = 0.18;
      const loopHoleR = 0.09;
      const dLoop = Math.sqrt((px - loopCx) ** 2 + (py - loopCy) ** 2);
      const inLoop = px >= 0.42 && dLoop <= loopR && py >= 0.22 && py <= 0.58;
      const inHole = px >= 0.42 && dLoop <= loopHoleR && py >= 0.31 && py <= 0.49;

      if ((inStem || inLoop) && !inHole) {
        // Bright white/cyan for the 'P' logo
        r = 255;
        g = 255;
        b = 255;
        a = 255;
      }

      // Sparkle dot at lower right of P
      const dotDx = px - 0.68;
      const dotDy = py - 0.68;
      if (Math.sqrt(dotDx * dotDx + dotDy * dotDy) < 0.06) {
        r = 56;
        g = 189;
        b = 248; // sky-400
        a = 255;
      }

      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  // PNG Signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth
  ihdrData[9] = 6; // Color type (RGBA)
  ihdrData[10] = 0; // Compression (deflate)
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);

  // IEND
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate 192x192, 512x512, maskable 512x512, and 180x180 apple touch icon
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generatePng(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generatePng(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), generatePng(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generatePng(180, 180, false));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), generatePng(32, 32, false));

console.log('Icons successfully created in public directory!');
