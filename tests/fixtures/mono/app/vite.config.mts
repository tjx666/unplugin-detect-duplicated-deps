import UnpluginDetectDuplicatedDeps from 'unplugin-detect-duplicated-deps/vite';
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
    plugins: [UnpluginDetectDuplicatedDeps({ deep: false }), visualizer()],
});
