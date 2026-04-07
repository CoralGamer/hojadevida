import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  base: '/hojadevida/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html'),
        adminLogin: resolve(__dirname, 'admin-login.html'),
        'pages/servicios/index': resolve(__dirname, 'pages/servicios/index.html'),
        'pages/servicios/web-fullstack': resolve(__dirname, 'pages/servicios/web-fullstack.html'),
        'pages/servicios/vr-experiences': resolve(__dirname, 'pages/servicios/vr-experiences.html'),
        'pages/servicios/soporte-tecnico': resolve(__dirname, 'pages/servicios/soporte-tecnico.html'),
        'pages/servicios/roblox': resolve(__dirname, 'pages/servicios/roblox.html'),
        'pages/servicios/produccion-multimedia': resolve(__dirname, 'pages/servicios/produccion-multimedia.html'),
        'pages/servicios/modelado-3d': resolve(__dirname, 'pages/servicios/modelado-3d.html'),
        'pages/servicios/ia-automation': resolve(__dirname, 'pages/servicios/ia-automation.html'),
        'pages/servicios/game-development': resolve(__dirname, 'pages/servicios/game-development.html'),
        'pages/servicios/educacion-digital': resolve(__dirname, 'pages/servicios/educacion-digital.html'),
        'pages/servicios/project-management': resolve(__dirname, 'pages/servicios/project-management.html'),
        'pages/servicios/apicultura': resolve(__dirname, 'pages/servicios/apicultura.html'),
      }
    }
  }
})
