import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'public', 'favicon.svg');

const outputs = [
  { file: 'pwa-192.png', size: 192 },
  { file: 'pwa-512.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180 },
];

for (const { file, size } of outputs) {
  await sharp(source).resize(size, size).png().toFile(path.join(root, 'public', file));
  console.log(`wrote public/${file}`);
}

const inner = await sharp(source).resize(410, 410).png().toBuffer();
await sharp({
  create: {
    width: 512,
    height: 512,
    channels: 4,
    background: '#047857',
  },
})
  .composite([{ input: inner, gravity: 'center' }])
  .png()
  .toFile(path.join(root, 'public', 'pwa-maskable-512.png'));
console.log('wrote public/pwa-maskable-512.png');
