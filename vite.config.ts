import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	// Relative base so the build works under any GitHub Pages sub-path.
	base: './',
	plugins: [svelte()]
});
