import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'

// main config export
export default ({ mode }) => {
	console.log('Mode: ', mode)

	return defineConfig({
		base: './',
		server: {
			host: '0.0.0.0',
			port: 5173,
			strictPort: false, // bump to next available port if 5173 is in use
		},
		plugins: [vue()],
		resolve: {
			alias: {
				'@': fileURLToPath(new URL('./src', import.meta.url)),
			},
		},
	})
}
