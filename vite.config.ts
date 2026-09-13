import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    base: '/live-quote-blotter/',
    plugins: [react()],
});