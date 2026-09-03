import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Desativa a minificação de CSS: o binário nativo do lightningcss pra
  // linux-x64-musl (Alpine, usado no build Docker) não resolve corretamente
  // a partir do lockfile gerado no Windows. JS continua minificado normalmente.
  build: {
    cssMinify: false,
  },
})
