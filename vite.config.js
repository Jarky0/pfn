export default {
    build: {
        outDir: 'dist',
        sourcemap: true,
        // Bewahre aktuelle Verzeichnisstruktur
        rollupOptions: {
            input: {
                main: 'index.html'
            }
        }
    },
    server: {
        open: true
    }
}