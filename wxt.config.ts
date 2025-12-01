import { defineConfig } from 'wxt'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  alias: {
    '@': path.resolve(__dirname, './'),
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    permissions: [
      'sidePanel',
      'storage',
      'contextMenus',
      'activeTab',
      'scripting',
      'tabs',
      'clipboardRead',
      'clipboardWrite',
      'downloads',
      'notifications',
    ],
    host_permissions: ['https://httpbin.org/*', '<all_urls>'],
    side_panel: {
      default_path: 'sidepanel.html',
    },
    action: {
      default_title: 'Open Sidepanel',
    },
  },
})
