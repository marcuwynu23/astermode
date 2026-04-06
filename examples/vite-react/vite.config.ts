import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import astermode from "astermode";

export default defineConfig({
  plugins: [react(), tailwindcss(), astermode()]
});
