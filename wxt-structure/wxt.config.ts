import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    manifest_version: 3,
    name: "ReNews| Bias-Free News - Clear Facts, Zero Spin",
    description: "Automatically detects and removes political bias from news articles in real-time - Works directly on your favorite news websites",
    version: "1.0",
    permissions: ["storage"],
    icons: {
      "16": "/images/icon-16.png",
      "32": "/images/icon-32.png",
      "48": "/images/icon-48.png",
      "128": "/images/icon-128.png"
    }
  }
});
