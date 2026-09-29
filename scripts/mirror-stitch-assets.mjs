import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const htmlRoot = path.join(root, 'public', 'stitch');
const assetRoot = path.join(root, 'public', 'assets');
await mkdir(assetRoot, { recursive: true });
const originalScreens = [
  'snickers_store_desktop_home/code.html', 'snickers_store_home/code.html',
  'snickers_store_desktop_products/code.html', 'snickers_store_product_catalog/code.html',
  'snickers_store_desktop_product_details/code.html', 'snickers_store_product_details/code.html',
  'snickers_store_desktop_shopping_cart/code.html', 'snickers_store_shopping_cart/code.html',
];
const sourceDocuments = await Promise.all(originalScreens.map((name) => readFile(path.join(root, name), 'utf8')));
const urls = [...new Set(sourceDocuments.flatMap((html) => html.match(/https:\/\/lh3\.googleusercontent\.com\/[^"'\s<>]+/g) ?? []))];
const manifest = {};
const existingFiles = await readdir(assetRoot);

async function downloadImage(url) {
  const id = createHash('sha256').update(url).digest('hex').slice(0, 20);
  const existing = existingFiles.find((filename) => filename.startsWith(`${id}.`));
  if (existing) {
    manifest[url] = `/assets/${existing}`;
    return;
  }
  const response = await fetch(url, { signal: AbortSignal.timeout(45_000) });
  if (!response.ok) throw new Error(`Image request failed (${response.status}): ${url}`);
  const contentType = response.headers.get('content-type')?.split(';')[0] ?? 'image/jpeg';
  const extension = ({ 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/avif': '.avif', 'image/gif': '.gif' })[contentType];
  if (!extension) throw new Error(`Unsupported image content type ${contentType}: ${url}`);
  const filename = `${id}${extension}`;
  await writeFile(path.join(assetRoot, filename), Buffer.from(await response.arrayBuffer()));
  manifest[url] = `/assets/${filename}`;
}

let next = 0;
const workers = Array.from({ length: 6 }, async () => {
  while (next < urls.length) {
    const index = next++;
    await downloadImage(urls[index]);
    console.log(`Downloaded image ${index + 1}/${urls.length}`);
  }
});
await Promise.all(workers);

const fontStylesheets = [
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200',
];
const fontCss = [];
const fontFiles = new Map();
for (const stylesheet of fontStylesheets) {
  const response = await fetch(stylesheet, {
    headers: { 'user-agent': 'Mozilla/5.0 Chrome/126.0.0.0 Safari/537.36' },
    signal: AbortSignal.timeout(45_000),
  });
  if (!response.ok) throw new Error(`Font stylesheet request failed (${response.status}): ${stylesheet}`);
  const css = await response.text();
  const faces = css.match(/@font-face\s*\{[^}]*\}/g) ?? [];
  for (const face of faces) {
    if (!/Material Symbols|Plus Jakarta Sans|Space Grotesk/i.test(face)) continue;
    const remoteUrl = face.match(/url\((?:['"])?([^)'"\s]+)(?:['"])?\)/)?.[1];
    if (!remoteUrl) continue;
    let localUrl = fontFiles.get(remoteUrl);
    if (!localUrl) {
      const fontResponse = await fetch(remoteUrl, { signal: AbortSignal.timeout(45_000) });
      if (!fontResponse.ok) throw new Error(`Font request failed (${fontResponse.status}): ${remoteUrl}`);
      const bytes = Buffer.from(await fontResponse.arrayBuffer());
      const signature = bytes.subarray(0, 4).toString('ascii');
      const extension = signature === 'wOF2' ? '.woff2' : signature === 'wOFF' ? '.woff' : signature === 'OTTO' ? '.otf' : '.ttf';
      const filename = `${createHash('sha256').update(remoteUrl).digest('hex').slice(0, 20)}${extension}`;
      await writeFile(path.join(assetRoot, filename), bytes);
      localUrl = `/assets/${filename}`;
      fontFiles.set(remoteUrl, localUrl);
    }
    fontCss.push(face.replace(remoteUrl, localUrl));
  }
}
if (!fontCss.length) throw new Error('No Latin or Material Symbols font faces were found.');
await writeFile(path.join(assetRoot, 'fonts.css'), `${fontCss.join('\n')}\n`);

await writeFile(path.join(assetRoot, 'asset-map.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Mirrored ${urls.length} images and ${fontFiles.size} font files locally. Run scripts/prepare-stitch-pages.mjs to refresh the served HTML.`);
