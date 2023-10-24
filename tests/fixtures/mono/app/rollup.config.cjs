const rollupPluginCommonjs = require('@rollup/plugin-commonjs');
const rollupPluginJson = require('@rollup/plugin-json');
const rollupPLuginNodeResolve = require('@rollup/plugin-node-resolve');
const { defineConfig } = require('rollup');

const unpluginDetectDuplicatedDeps = require('unplugin-detect-duplicated-deps/rollup');

module.exports = defineConfig({
    input: 'index.js',
    output: {
        format: 'esm',
        file: './dist/bundle.mjs',
    },
    plugins: [
        rollupPluginCommonjs(),
        rollupPLuginNodeResolve(),
        rollupPluginJson(),
        unpluginDetectDuplicatedDeps({ deep: false}),
    ],
});
