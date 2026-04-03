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
        serviciosIndex: resolve(__dirname, 'src/pages/servicios/index.html'),
        webFullstack: resolve(__dirname, 'src/pages/servicios/web-fullstack.html'),
        vrExperiences: resolve(__dirname, 'src/pages/servicios/vr-experiences.html'),
        soporteTecnico: resolve(__dirname, 'src/pages/servicios/soporte-tecnico.html'),
        roblox: resolve(__dirname, 'src/pages/servicios/roblox.html'),
        produccionMultimedia: resolve(__dirname, 'src/pages/servicios/produccion-multimedia.html'),
        modelado3d: resolve(__dirname, 'src/pages/servicios/modelado-3d.html'),
        iaAutomation: resolve(__dirname, 'src/pages/servicios/ia-automation.html'),
        gameDevelopment: resolve(__dirname, 'src/pages/servicios/game-development.html'),
        educacionDigital: resolve(__dirname, 'src/pages/servicios/educacion-digital.html'),
        projectManagement: resolve(__dirname, 'src/pages/servicios/project-management.html'),
        apicultura: resolve(__dirname, 'src/pages/servicios/apicultura.html'),
      }
    }
  }
})
