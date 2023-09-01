import UnpluginDetectDuplicatedDeps from 'unplugin-detect-duplicated-deps/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        UnpluginDetectDuplicatedDeps({
            throwErrorWhenDuplicated: true,
            whitelist: {
                axios: ['0.27.2', '1.4.0'],
            },
        }),
    ],
});
