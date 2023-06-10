import UnpluginDetectDuplicatedDeps from 'unplugin-detect-duplicated-deps/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        UnpluginDetectDuplicatedDeps({
            showPkgSize: false,
        }),
    ],
});
