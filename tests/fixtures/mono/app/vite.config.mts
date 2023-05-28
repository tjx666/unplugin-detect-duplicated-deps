import UnpluginDetectDuplicatedDeps from '../../../../dist/vite.mjs';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [UnpluginDetectDuplicatedDeps()],
});
