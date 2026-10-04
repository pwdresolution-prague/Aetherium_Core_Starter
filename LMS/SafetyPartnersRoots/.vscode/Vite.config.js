import { defineConfig } from 'vite'
import { resolve } from 'path'


export default defineConfig ({
    root: '.',
    publicDir: 'public',
    build: {
        rollupOptions:{
            input: {
                login: resolve(__dirname, 'StudentLogin/HTML/LoginIndex.html'),
                main: resolve(__dirname, 'StudentLogin/HTML/LoginIndex.html')
            },
        },
    },
    server: {
        open: 'StudentLogin/HTML/LoginIndex.html' 
    },
})