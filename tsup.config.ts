import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['./src'],
    format: ['esm'],
    target: 'node18',
    splitting: true,
    clean: true,
    dts: true,
});
