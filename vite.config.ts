import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const PORT = process.env.VITE_PORT || 3000

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
  },
  server: {
    port: +PORT,
  }
})