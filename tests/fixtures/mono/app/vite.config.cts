import UnpluginDetectDuplicatedDeps from 'unplugin-detect-duplicated-deps/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        UnpluginDetectDuplicatedDeps({
            throwErrorWhenDuplicated: true,
            whitelist: {
                axios: ['0.27.2', '1.4.0'],
                '@pixi/utils': ['7.2.4', '7.0.0']
            },
            deep: false
        }),
    ],
});
