import rollupPluginCommonjs from '@rollup/plugin-commonjs';
import rollupPluginJson from '@rollup/plugin-json';
import rollupPLuginNodeResolve from '@rollup/plugin-node-resolve';
import { defineConfig } from 'rollup';

import unpluginDetectDuplicatedDeps from '../../../../dist/rollup.mjs';

export default defineConfig({
    input: 'index.js',
    output: {
        format: 'esm',
        file: './dist/bundle.mjs',
    },
    plugins: [
        rollupPluginCommonjs(),
        rollupPLuginNodeResolve(),
        rollupPluginJson(),
        unpluginDetectDuplicatedDeps(),
    ],
});
