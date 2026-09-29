import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const pages = {
  'snickers_store_desktop_home/code.html': 'home-desktop.html',
  'snickers_store_home/code.html': 'home-mobile.html',
  'snickers_store_desktop_products/code.html': 'products-desktop.html',
  'snickers_store_product_catalog/code.html': 'products-mobile.html',
  'snickers_store_desktop_product_details/code.html': 'product-desktop.html',
  'snickers_store_product_details/code.html': 'product-mobile.html',
  'snickers_store_desktop_shopping_cart/code.html': 'cart-desktop.html',
  'snickers_store_shopping_cart/code.html': 'cart-mobile.html',
};
const routes = {
  home: '/',
  products: '/products',
  shop: '/products',
  'shopping-cart': '/cart',
  cart: '/cart',
  saved: '/cart',
  about: '/about',
  contact: '/contact',
};
const assets = JSON.parse(await readFile(path.join('public', 'assets', 'asset-map.json'), 'utf8'));

for (const [sourcePath, outputName] of Object.entries(pages)) {
  let html = await readFile(sourcePath, 'utf8');
  for (const [remote, local] of Object.entries(assets)) html = html.replaceAll(remote, local);
  html = html.replace(/<script id="tailwind-config">[\s\S]*?<\/script>/, '');
  html = html.replace('<script src="https://cdn.tailwindcss.com"></script>', '');
  html = html.replace(/<link[^>]+fonts\.googleapis\.com[^>]*>/g, '');
  html = html.replace('<head>', '<head><link rel="stylesheet" href="/stitch/styles.css"><link rel="stylesheet" href="/assets/fonts.css">');
  html = html.replace(/<a\b[^>]*>/g, (tag) => {
    const dataPath = tag.match(/\bdata-path="([^"]+)"/)?.[1];
    if (!dataPath || !routes[dataPath]) return tag;
    const route = routes[dataPath];
    const updated = /\bhref="[^"]*"/.test(tag) ? tag.replace(/\bhref="[^"]*"/, `href="${route}"`) : tag.replace(/>$/, ` href="${route}">`);
    return /\btarget=/.test(updated) ? updated : updated.replace(/>$/, ' target="_top">');
  });
  html = html.replace(/<img\b[^>]*>/g, (tag, offset, source) => {
    const before = source.slice(0, offset);
    const imageIndex = (before.match(/<img\b/g) ?? []).length + 1;
    const selfClosing = /\/>$/.test(tag);
    const suffixLength = selfClosing ? 2 : 1;
    let result = tag.slice(0, -suffixLength);
    if (!/\bloading=/.test(result)) result += ` loading="${imageIndex <= 3 ? 'eager' : 'lazy'}"`;
    if (!/\bdecoding=/.test(result)) result += ' decoding="async"';
    return `${result}${selfClosing ? ' />' : '>'}`;
  });

  if (outputName === 'products-desktop.html') {
    html = html.replace(/<h3([^>]*)>\s*Snickers Original Full Size\s*<\/h3>/, '<h3$1><a href="/product" target="_top">Snickers Original Full Size</a></h3>');
  }
  if (outputName === 'products-mobile.html') {
    html = html.replace('<h2 class="font-headline-sm text-headline-sm text-primary-container leading-tight line-clamp-1 mb-0.5">Snickers Original</h2>', '<h2 class="font-headline-sm text-headline-sm text-primary-container leading-tight line-clamp-1 mb-0.5"><a href="/product" target="_top">Snickers Original</a></h2>');
  }
  if (outputName === 'cart-desktop.html') {
    html = html.replace("alert('Redirecting to 256-bit Encrypted Checkout Gateway...');", `const lines = cartState.items.map((item) => \`• \${item.name} × \${item.qty} — $\${(item.price * item.qty).toFixed(2)}\`).join('\\n');\n          const total = cartState.items.reduce((sum, item) => sum + item.price * item.qty, 0);\n          const message = encodeURIComponent(\`Hi! I’d like to order:\\n\${lines}\\nTotal: $\${total.toFixed(2)}\`);\n          window.open(\`https://wa.me/?text=\${message}\`, '_blank', 'noopener,noreferrer');`);
  }
  if (outputName === 'cart-mobile.html') {
    html = html.replace('    // Initial pass to sync states\n    calculateCart();', `    const checkoutButton = document.getElementById('main-checkout-btn');\n    if (checkoutButton) checkoutButton.addEventListener('click', () => {\n      const lines = Array.from(document.querySelectorAll('.cart-item')).map((item) => {\n        const title = item.querySelector('h3, h4, [class*="font-headline"]')?.textContent?.trim() || 'Snickers item';\n        const qty = parseInt(item.getAttribute('data-qty')) || 1;\n        const price = parseFloat(item.getAttribute('data-unit-price')) || 0;\n        return '• ' + title + ' × ' + qty + ' — $' + (price * qty).toFixed(2);\n      });\n      if (!lines.length) return;\n      const total = Array.from(document.querySelectorAll('.cart-item')).reduce((sum, item) => sum + (parseFloat(item.getAttribute('data-unit-price')) || 0) * (parseInt(item.getAttribute('data-qty')) || 1), 0);\n      const message = encodeURIComponent('Hi! I’d like to order:\\n' + lines.join('\\n') + '\\nTotal: $' + total.toFixed(2));\n      window.open('https://wa.me/?text=' + message, '_blank', 'noopener,noreferrer');\n    });\n\n    // Initial pass to sync states\n    calculateCart();`);
    html = html.replace('>Proceed to Checkout</span>', '>Order via WhatsApp</span>');
  }
  if (outputName === 'product-mobile.html') {
    html = html.replace("    showToast(`Added ${currentQuantity}x ${currentPackName}!`);", `    const key = 'snickers-cart';\n    const cart = JSON.parse(localStorage.getItem(key) || '[]');\n    const existing = cart.find((item) => item.name === currentPackName);\n    if (existing) existing.qty += currentQuantity;\n    else cart.push({ name: currentPackName, price: currentUnitPrice, qty: currentQuantity });\n    localStorage.setItem(key, JSON.stringify(cart));\n    updateCartBadge();\n    showToast(\`Added \${currentQuantity}x \${currentPackName} to your cart!\`);`);
    html = html.replace('  function showToast(text) {', `  function updateCartBadge() {\n    const cart = JSON.parse(localStorage.getItem('snickers-cart') || '[]');\n    const count = cart.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);\n    document.querySelectorAll('a[data-path="cart"] span:last-child').forEach((badge) => { badge.textContent = count; });\n  }\n  updateCartBadge();\n\n  function showToast(text) {`);
  }
  if (outputName === 'product-desktop.html') {
    html = html.replace("      addBtn.addEventListener('click', () => {", `      function updateCartBadge() {\n        const cart = JSON.parse(localStorage.getItem('snickers-cart') || '[]');\n        const count = cart.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);\n        document.querySelectorAll('a[data-path="shopping-cart"] span:last-child').forEach((badge) => { badge.textContent = count; });\n      }\n      updateCartBadge();\n      addBtn.addEventListener('click', () => {\n        const cart = JSON.parse(localStorage.getItem('snickers-cart') || '[]');\n        const name = document.querySelector('h1')?.textContent?.trim() || 'Snickers Original';\n        const price = parseFloat(document.getElementById('displayed-price')?.textContent?.replace(/[^0-9.]/g, '') || '2.29');\n        const qty = parseInt(document.getElementById('qty-count')?.textContent || '1', 10);\n        const existing = cart.find((item) => item.name === name);\n        if (existing) existing.qty += qty; else cart.push({ name, price, qty });\n        localStorage.setItem('snickers-cart', JSON.stringify(cart));\n        updateCartBadge();`);
      html = html.replace("        const originalText = cartLabelEl.textContent;", "        const originalText = cartLabelEl.textContent;");
      html = html.replace("cartLabelEl.textContent = 'Added to Cart âœ“';", "cartLabelEl.textContent = 'Added to Cart âœ“';");
    }
  await writeFile(path.join('public', 'stitch', outputName), html);
  console.log(`Prepared ${outputName}`);
}
