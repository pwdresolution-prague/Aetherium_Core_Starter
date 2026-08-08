import  { defineConfig } from 'vite'


export default defineConfig({
  base: '/SafetyPartnersFrontendStudent/',
    //FRONTEND: Npm run dev server
    // 
    server: {
        proxy: {
            '/api': 'http://localhost:3001' //FIXME: Express server URL
        }
    },

    //TODO: Produkční build
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: '../Html/Index.html',
                mujProfil: '../Html/MujProfil.html',
                certifikaty: '../Html/Certifikaty.html',
                podpora: '../Html/Podpora.html',
                kurzy: '../Html/Kurzy.html',
                testy: '../Html/Testy.html',
                uzivatele: '../Html/Uzivatele.html',
                reporty: '../Html/Reporty.html',
                dokumentace: '../Html/Dokumentace.html',
                nastavení: '../Html/Nastaveni.html'


            }
        }
    }
})




