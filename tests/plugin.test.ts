import fs from 'node:fs/promises';
import { resolve } from 'node:path';

import { execa } from 'execa';
import { expect, test } from 'vitest';

const testCwd = resolve(__dirname, './fixtures/mono/app');

const stdout = await fs.readFile(resolve(testCwd, 'stdout.txt'), 'utf8');
const stderr = await fs.readFile(resolve(testCwd, 'stderr.txt'), 'utf8');
const exec = async (command: string) => {
    const [cmd, ...args] = command.split(' ');
    const result = await execa(cmd, args, {
        cwd: testCwd,
        preferLocal: true,
        env: {
            NO_COLOR: 'true',
        },
    });
    return result;
};

test('vite esm', async () => {
    const result = await exec('vite build -l error -c vite.config.mts');
    expect(result.stdout).toBe(stdout);
    expect(result.stderr).toBe(stderr);
});

test('vite cjs', async () => {
    const result = await exec('vite build -l error -c vite.config.cts');
    expect(result.stdout).toBe(stdout);
    expect(result.stderr).toBe(stderr);
});

test('rollup esm', async () => {
    const result = await exec('rollup --silent -c rollup.config.mjs');
    expect(result.stdout).toBe(stdout);
    expect(result.stderr).toBe(stderr);
});

test('rollup cjs', async () => {
    const result = await exec('rollup --silent -c rollup.config.cjs');
    expect(result.stdout).toBe(stdout);
    expect(result.stderr).toBe(stderr);
});
