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
        reject: false,
        env: {
            NO_COLOR: 'true',
        },
    });

    const formatOutput = (str: string) =>
        // eslint-disable-next-line unicorn/escape-case
        str.replaceAll('\r?\n?', '\n').replaceAll('\u001b[0m', '');
    return {
        stderr: formatOutput(result.stderr),
        stdout: formatOutput(result.stdout),
    };
};

test('vite esm', async () => {
    const result = await exec('vite build -l error -c vite.config.mts');

    // await fs.writeFile(resolve(testCwd, 'stdout.txt'), result.stdout, 'utf8');
    // await fs.writeFile(resolve(testCwd, 'stderr.txt'), result.stderr, 'utf8');

    expect(result.stdout).toBe(stdout);
    expect(result.stderr).toBe(stderr);
});

test('rollup esm', async () => {
    const result = await exec('rollup --silent -c rollup.config.mjs');
    expect(result.stdout).toBe(stdout);
    expect(result.stderr).toBe(stderr);
});

test('webpack', async () => {
    const result = await exec('webpack');
    const stderrPath = resolve(testCwd, 'stderr-webpack.txt');
    // await fs.writeFile(stderrPath, result.stderr, 'utf8');

    expect(result.stdout).toBe(stdout);
    expect(result.stderr).toBe(await fs.readFile(stderrPath, 'utf8'));
});

test('no pkg size', async () => {
    const result = await exec('vite build -l error -c vite.config.disable-show-pkg-size.mts');

    expect(result.stdout).toBe(stdout);
    const stderrPath = resolve(testCwd, 'no-pkg-size.txt');
    // await fs.writeFile(stderrPath, result.stderr, 'utf8');
    expect(result.stderr).toBe(await fs.readFile(stderrPath, 'utf8'));
});

test('use in ci check', async () => {
    const result = await exec('vite build -c vite.config.throw-error.mts');
    const stderrPath = resolve(testCwd, 'ci-check-error.txt');
    await fs.writeFile(stderrPath, result.stderr, 'utf8');
    expect(result.stderr).toBe(await fs.readFile(stderrPath, 'utf8'));
});
